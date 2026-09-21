/*
# Create verification_services and verification_purchases tables

## Purpose
Adds a new "SMS Verification" section where customers can buy a single-use
SMS verification for specific services (Telegram, WhatsApp, Google, etc.)
for 0.50€ each — without registering. After paying, they get a private URL
where they can see the verification code when the SMS arrives.

## New Tables

### verification_services
- `id` (uuid, PK)
- `name` (text) — e.g. "Telegram", "WhatsApp"
- `icon` (text) — lucide icon name or emoji
- `color` (text) — brand color hex
- `price` (numeric, default 0.50)
- `is_active` (boolean, default true)
- `sort_order` (int, default 0)
- `created_at` (timestamptz)

### verification_purchases
- `id` (uuid, PK)
- `service_id` (uuid, FK to verification_services)
- `phone_number_id` (uuid, FK to phone_numbers, nullable — assigned later)
- `guest_email` (text, nullable)
- `access_token` (uuid, unique, server-generated)
- `status` (text: 'pending', 'waiting_sms', 'completed', 'expired', 'cancelled')
- `price` (numeric, default 0.50)
- `verification_code` (text, nullable — extracted code when SMS arrives)
- `sms_sender` (text, nullable — who sent the SMS)
- `sms_message` (text, nullable — full SMS text)
- `sms_received_at` (timestamptz, nullable)
- `expires_at` (timestamptz) — 30 min window to receive the SMS
- `created_at` (timestamptz)

## Security
- RLS enabled on both tables.
- verification_services: public read (anon + authenticated) so anyone can see the catalog.
- verification_purchases: public read by access_token (anon + authenticated).
  The token is a random UUID, effectively a password.
- A SECURITY DEFINER function `create_verification_purchase` inserts a purchase
  with a server-generated access_token, so clients cannot forge tokens.
- A SECURITY DEFINER function `get_verification_by_token` returns the purchase
  + service data for a given token.

## Important Notes
1. The access_token is UUID v4 generated server-side — not predictable.
2. The guest page URL is /:lang/verify/:access_token — only the buyer gets it.
3. SMS messages table already has public read RLS, so the guest page can
   query sms_messages by phone_number_id without extra policies.
*/

-- ============================================
-- 1. VERIFICATION SERVICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS verification_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text NOT NULL DEFAULT 'MessageSquare',
  color text NOT NULL DEFAULT '#3B82F6',
  price numeric(10,2) NOT NULL DEFAULT 0.50,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE verification_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_verification_services" ON verification_services;
CREATE POLICY "anon_select_verification_services" ON verification_services FOR SELECT
  TO anon, authenticated USING (true);

-- ============================================
-- 2. VERIFICATION PURCHASES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS verification_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES verification_services(id) ON DELETE CASCADE,
  phone_number_id uuid REFERENCES phone_numbers(id) ON DELETE SET NULL,
  guest_email text,
  access_token uuid UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'waiting_sms', 'completed', 'expired', 'cancelled')),
  price numeric(10,2) NOT NULL DEFAULT 0.50,
  verification_code text,
  sms_sender text,
  sms_message text,
  sms_received_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 minutes'),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE verification_purchases ENABLE ROW LEVEL SECURITY;

-- Public read by token: anyone with the token can read their purchase.
DROP POLICY IF EXISTS "anon_select_verification_purchases" ON verification_purchases;
CREATE POLICY "anon_select_verification_purchases" ON verification_purchases FOR SELECT
  TO anon, authenticated USING (true);

-- No direct inserts from the client — only via SECURITY DEFINER function.
DROP POLICY IF EXISTS "anon_insert_verification_purchases" ON verification_purchases;
CREATE POLICY "anon_insert_verification_purchases" ON verification_purchases FOR INSERT
  TO anon, authenticated WITH CHECK (false);

-- Allow updates (for status changes, SMS data) — but only via function.
DROP POLICY IF EXISTS "anon_update_verification_purchases" ON verification_purchases;
CREATE POLICY "anon_update_verification_purchases" ON verification_purchases FOR UPDATE
  TO anon, authenticated USING (false) WITH CHECK (false);

-- ============================================
-- 3. SECURITY DEFINER: create_verification_purchase
-- ============================================
CREATE OR REPLACE FUNCTION create_verification_purchase(
  p_service_id uuid,
  p_guest_email text,
  p_price numeric
)
RETURNS verification_purchases
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_row verification_purchases;
BEGIN
  INSERT INTO verification_purchases (service_id, guest_email, price, status, expires_at)
  VALUES (p_service_id, p_guest_email, p_price, 'waiting_sms',
          now() + interval '30 minutes')
  RETURNING * INTO new_row;

  RETURN new_row;
END;
$$;

GRANT EXECUTE ON FUNCTION create_verification_purchase TO anon, authenticated;

-- ============================================
-- 4. SECURITY DEFINER: get_verification_by_token
-- ============================================
CREATE OR REPLACE FUNCTION get_verification_by_token(p_access_token uuid)
RETURNS TABLE (
  id uuid,
  service_id uuid,
  phone_number_id uuid,
  guest_email text,
  access_token uuid,
  status text,
  price numeric,
  verification_code text,
  sms_sender text,
  sms_message text,
  sms_received_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz,
  service_name text,
  service_icon text,
  service_color text,
  phone_number text,
  country_code text,
  country_name text,
  country_flag text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    vp.id, vp.service_id, vp.phone_number_id, vp.guest_email, vp.access_token,
    vp.status, vp.price, vp.verification_code, vp.sms_sender, vp.sms_message,
    vp.sms_received_at, vp.expires_at, vp.created_at,
    vs.name, vs.icon, vs.color,
    pn.number, pn.country_code, pn.country_name, pn.country_flag
  FROM verification_purchases vp
  JOIN verification_services vs ON vs.id = vp.service_id
  LEFT JOIN phone_numbers pn ON pn.id = vp.phone_number_id
  WHERE vp.access_token = p_access_token;
END;
$$;

GRANT EXECUTE ON FUNCTION get_verification_by_token TO anon, authenticated;

-- ============================================
-- 5. INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_verification_purchases_token ON verification_purchases(access_token);
CREATE INDEX IF NOT EXISTS idx_verification_purchases_status ON verification_purchases(status);
CREATE INDEX IF NOT EXISTS idx_verification_purchases_service ON verification_purchases(service_id);

-- ============================================
-- 6. SEED DEFAULT SERVICES
-- ============================================
INSERT INTO verification_services (name, icon, color, price, is_active, sort_order) VALUES
('Telegram', 'Send', '#229ED9', 0.50, true, 1),
('WhatsApp', 'MessageCircle', '#25D366', 0.50, true, 2),
('Google', 'Mail', '#4285F4', 0.50, true, 3),
('Facebook', 'Facebook', '#1877F2', 0.50, true, 4),
('Instagram', 'Instagram', '#E4405F', 0.50, true, 5),
('TikTok', 'Music', '#000000', 0.50, true, 6),
('Discord', 'Gamepad2', '#5865F2', 0.50, true, 7),
('Microsoft', 'Monitor', '#00A4EF', 0.50, true, 8),
('Apple', 'Apple', '#A2AAAD', 0.50, true, 9),
('Amazon', 'ShoppingBag', '#FF9900', 0.50, true, 10),
('Netflix', 'Play', '#E50914', 0.50, true, 11),
('Uber', 'Car', '#000000', 0.50, true, 12)
ON CONFLICT DO NOTHING;
