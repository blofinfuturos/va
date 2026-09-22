/*
# Add country-specific pricing for SMS verification

## Purpose
Adds a `verification_country_prices` table so each country can have a different
price for each verification service. This is needed because the cost of providing
SMS numbers varies by country. When a customer selects a country + service, the
app looks up the country-specific price; if none exists, it falls back to the
service's default price.

## New Tables
### verification_country_prices
- `id` (uuid, PK)
- `service_id` (uuid, FK to verification_services, ON DELETE CASCADE)
- `country_code` (text, not null) — ISO 3166-1 alpha-2 code (e.g. "es", "us")
- `country_name` (text, not null) — display name
- `country_flag` (text) — emoji flag
- `price` (numeric, not null) — price in EUR for this country+service
- `is_active` (boolean, default true)
- `sort_order` (int, default 0)
- `created_at` (timestamptz)
- Unique constraint on (service_id, country_code)

## Security
- RLS enabled on verification_country_prices.
- Public read (anon + authenticated) so anyone can see the catalog.
- No direct writes from the client — managed via admin or SQL.

## RPC Function
- `get_verification_services_by_country(p_country_code text)` returns all active
  services with their country-specific price (or fallback default price) for the
  given country.
- `get_verification_countries()` returns all distinct countries that have at
  least one active country price entry.

## Seed Data
- Seeds country prices for 30+ countries across all services with varied pricing
  (0.30€ to 2.00€ depending on country and service).

## Important Notes
1. The country selector in the frontend calls get_verification_countries() to
   populate the dropdown.
2. After selecting a country, the frontend calls get_verification_services_by_country()
   to get services with the correct price for that country.
3. If a country has no specific price for a service, the service's default price
   (0.50€) is used as fallback.
*/

-- ============================================
-- 1. VERIFICATION COUNTRY PRICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS verification_country_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES verification_services(id) ON DELETE CASCADE,
  country_code text NOT NULL,
  country_name text NOT NULL,
  country_flag text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE (service_id, country_code)
);

ALTER TABLE verification_country_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_verification_country_prices" ON verification_country_prices;
CREATE POLICY "anon_select_verification_country_prices" ON verification_country_prices
  FOR SELECT TO anon, authenticated USING (true);

-- ============================================
-- 2. RPC: get_verification_countries
--    Returns all distinct countries that have at least one active price entry.
-- ============================================
CREATE OR REPLACE FUNCTION get_verification_countries()
RETURNS TABLE (
  country_code text,
  country_name text,
  country_flag text,
  min_price numeric,
  sort_order int
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    country_code,
    country_name,
    country_flag,
    MIN(price) as min_price,
    MIN(sort_order) as sort_order
  FROM verification_country_prices
  WHERE is_active = true
  GROUP BY country_code, country_name, country_flag
  ORDER BY sort_order ASC, country_name ASC;
$$;

GRANT EXECUTE ON FUNCTION get_verification_countries TO anon, authenticated;

-- ============================================
-- 3. RPC: get_verification_services_by_country
--    Returns all active services with country-specific price or fallback.
-- ============================================
CREATE OR REPLACE FUNCTION get_verification_services_by_country(p_country_code text)
RETURNS TABLE (
  id uuid,
  name text,
  icon text,
  color text,
  price numeric,
  is_active boolean,
  sort_order int,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    vs.id,
    vs.name,
    vs.icon,
    vs.color,
    COALESCE(vcp.price, vs.price) as price,
    vs.is_active,
    vs.sort_order,
    vs.created_at
  FROM verification_services vs
  LEFT JOIN verification_country_prices vcp
    ON vcp.service_id = vs.id
    AND vcp.country_code = p_country_code
    AND vcp.is_active = true
  WHERE vs.is_active = true
  ORDER BY vs.sort_order ASC;
$$;

GRANT EXECUTE ON FUNCTION get_verification_services_by_country TO anon, authenticated;

-- ============================================
-- 4. INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_vcp_country ON verification_country_prices(country_code);
CREATE INDEX IF NOT EXISTS idx_vcp_service_country ON verification_country_prices(service_id, country_code);
CREATE INDEX IF NOT EXISTS idx_vcp_active ON verification_country_prices(is_active);

-- ============================================
-- 5. SEED COUNTRY PRICES
--    Pricing varies by region. Cheaper in some countries, more expensive in others.
-- ============================================

-- Get all service IDs
DO $$
DECLARE
  s_telegram uuid; s_whatsapp uuid; s_google uuid; s_facebook uuid;
  s_instagram uuid; s_tiktok uuid; s_discord uuid; s_microsoft uuid;
  s_apple uuid; s_amazon uuid; s_netflix uuid; s_uber uuid;
BEGIN
  SELECT id INTO s_telegram FROM verification_services WHERE name = 'Telegram';
  SELECT id INTO s_whatsapp FROM verification_services WHERE name = 'WhatsApp';
  SELECT id INTO s_google FROM verification_services WHERE name = 'Google';
  SELECT id INTO s_facebook FROM verification_services WHERE name = 'Facebook';
  SELECT id INTO s_instagram FROM verification_services WHERE name = 'Instagram';
  SELECT id INTO s_tiktok FROM verification_services WHERE name = 'TikTok';
  SELECT id INTO s_discord FROM verification_services WHERE name = 'Discord';
  SELECT id INTO s_microsoft FROM verification_services WHERE name = 'Microsoft';
  SELECT id INTO s_apple FROM verification_services WHERE name = 'Apple';
  SELECT id INTO s_amazon FROM verification_services WHERE name = 'Amazon';
  SELECT id INTO s_netflix FROM verification_services WHERE name = 'Netflix';
  SELECT id INTO s_uber FROM verification_services WHERE name = 'Uber';

  -- Define country prices: (country_code, country_name, flag, sort_order, base_price)
  -- Using a helper to insert all services for each country at once.
  -- Prices vary by country region group.

  -- Tier 1: Cheap countries (0.30-0.50)
  INSERT INTO verification_country_prices (service_id, country_code, country_name, country_flag, price, is_active, sort_order)
  SELECT s_telegram, 'ru', 'Rusia', '🇷🇺', 0.30, true, 1 WHERE s_telegram IS NOT NULL
  UNION ALL SELECT s_whatsapp, 'ru', 'Rusia', '🇷🇺', 0.30, true, 1 WHERE s_whatsapp IS NOT NULL
  UNION ALL SELECT s_google, 'ru', 'Rusia', '🇷🇺', 0.35, true, 1 WHERE s_google IS NOT NULL
  UNION ALL SELECT s_facebook, 'ru', 'Rusia', '🇷🇺', 0.35, true, 1 WHERE s_facebook IS NOT NULL
  UNION ALL SELECT s_instagram, 'ru', 'Rusia', '🇷🇺', 0.35, true, 1 WHERE s_instagram IS NOT NULL
  UNION ALL SELECT s_tiktok, 'ru', 'Rusia', '🇷🇺', 0.40, true, 1 WHERE s_tiktok IS NOT NULL
  UNION ALL SELECT s_discord, 'ru', 'Rusia', '🇷🇺', 0.30, true, 1 WHERE s_discord IS NOT NULL
  UNION ALL SELECT s_microsoft, 'ru', 'Rusia', '🇷🇺', 0.40, true, 1 WHERE s_microsoft IS NOT NULL
  UNION ALL SELECT s_apple, 'ru', 'Rusia', '🇷🇺', 0.45, true, 1 WHERE s_apple IS NOT NULL
  UNION ALL SELECT s_amazon, 'ru', 'Rusia', '🇷🇺', 0.40, true, 1 WHERE s_amazon IS NOT NULL
  UNION ALL SELECT s_netflix, 'ru', 'Rusia', '🇷🇺', 0.45, true, 1 WHERE s_netflix IS NOT NULL
  UNION ALL SELECT s_uber, 'ru', 'Rusia', '🇷🇺', 0.35, true, 1 WHERE s_uber IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO verification_country_prices (service_id, country_code, country_name, country_flag, price, is_active, sort_order)
  SELECT s_telegram, 'ua', 'Ucrania', '🇺🇦', 0.30, true, 2 WHERE s_telegram IS NOT NULL
  UNION ALL SELECT s_whatsapp, 'ua', 'Ucrania', '🇺🇦', 0.30, true, 2 WHERE s_whatsapp IS NOT NULL
  UNION ALL SELECT s_google, 'ua', 'Ucrania', '🇺🇦', 0.35, true, 2 WHERE s_google IS NOT NULL
  UNION ALL SELECT s_facebook, 'ua', 'Ucrania', '🇺🇦', 0.35, true, 2 WHERE s_facebook IS NOT NULL
  UNION ALL SELECT s_instagram, 'ua', 'Ucrania', '🇺🇦', 0.35, true, 2 WHERE s_instagram IS NOT NULL
  UNION ALL SELECT s_tiktok, 'ua', 'Ucrania', '🇺🇦', 0.40, true, 2 WHERE s_tiktok IS NOT NULL
  UNION ALL SELECT s_discord, 'ua', 'Ucrania', '🇺🇦', 0.30, true, 2 WHERE s_discord IS NOT NULL
  UNION ALL SELECT s_microsoft, 'ua', 'Ucrania', '🇺🇦', 0.40, true, 2 WHERE s_microsoft IS NOT NULL
  UNION ALL SELECT s_apple, 'ua', 'Ucrania', '🇺🇦', 0.45, true, 2 WHERE s_apple IS NOT NULL
  UNION ALL SELECT s_amazon, 'ua', 'Ucrania', '🇺🇦', 0.40, true, 2 WHERE s_amazon IS NOT NULL
  UNION ALL SELECT s_netflix, 'ua', 'Ucrania', '🇺🇦', 0.45, true, 2 WHERE s_netflix IS NOT NULL
  UNION ALL SELECT s_uber, 'ua', 'Ucrania', '🇺🇦', 0.35, true, 2 WHERE s_uber IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO verification_country_prices (service_id, country_code, country_name, country_flag, price, is_active, sort_order)
  SELECT s_telegram, 'in', 'India', '🇮🇳', 0.30, true, 3 WHERE s_telegram IS NOT NULL
  UNION ALL SELECT s_whatsapp, 'in', 'India', '🇮🇳', 0.30, true, 3 WHERE s_whatsapp IS NOT NULL
  UNION ALL SELECT s_google, 'in', 'India', '🇮🇳', 0.35, true, 3 WHERE s_google IS NOT NULL
  UNION ALL SELECT s_facebook, 'in', 'India', '🇮🇳', 0.35, true, 3 WHERE s_facebook IS NOT NULL
  UNION ALL SELECT s_instagram, 'in', 'India', '🇮🇳', 0.35, true, 3 WHERE s_instagram IS NOT NULL
  UNION ALL SELECT s_tiktok, 'in', 'India', '🇮🇳', 0.40, true, 3 WHERE s_tiktok IS NOT NULL
  UNION ALL SELECT s_discord, 'in', 'India', '🇮🇳', 0.30, true, 3 WHERE s_discord IS NOT NULL
  UNION ALL SELECT s_microsoft, 'in', 'India', '🇮🇳', 0.40, true, 3 WHERE s_microsoft IS NOT NULL
  UNION ALL SELECT s_apple, 'in', 'India', '🇮🇳', 0.45, true, 3 WHERE s_apple IS NOT NULL
  UNION ALL SELECT s_amazon, 'in', 'India', '🇮🇳', 0.40, true, 3 WHERE s_amazon IS NOT NULL
  UNION ALL SELECT s_netflix, 'in', 'India', '🇮🇳', 0.45, true, 3 WHERE s_netflix IS NOT NULL
  UNION ALL SELECT s_uber, 'in', 'India', '🇮🇳', 0.35, true, 3 WHERE s_uber IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO verification_country_prices (service_id, country_code, country_name, country_flag, price, is_active, sort_order)
  SELECT s_telegram, 'id', 'Indonesia', '🇮🇩', 0.30, true, 4 WHERE s_telegram IS NOT NULL
  UNION ALL SELECT s_whatsapp, 'id', 'Indonesia', '🇮🇩', 0.30, true, 4 WHERE s_whatsapp IS NOT NULL
  UNION ALL SELECT s_google, 'id', 'Indonesia', '🇮🇩', 0.35, true, 4 WHERE s_google IS NOT NULL
  UNION ALL SELECT s_facebook, 'id', 'Indonesia', '🇮🇩', 0.35, true, 4 WHERE s_facebook IS NOT NULL
  UNION ALL SELECT s_instagram, 'id', 'Indonesia', '🇮🇩', 0.35, true, 4 WHERE s_instagram IS NOT NULL
  UNION ALL SELECT s_tiktok, 'id', 'Indonesia', '🇮🇩', 0.40, true, 4 WHERE s_tiktok IS NOT NULL
  UNION ALL SELECT s_discord, 'id', 'Indonesia', '🇮🇩', 0.30, true, 4 WHERE s_discord IS NOT NULL
  UNION ALL SELECT s_microsoft, 'id', 'Indonesia', '🇮🇩', 0.40, true, 4 WHERE s_microsoft IS NOT NULL
  UNION ALL SELECT s_apple, 'id', 'Indonesia', '🇮🇩', 0.45, true, 4 WHERE s_apple IS NOT NULL
  UNION ALL SELECT s_amazon, 'id', 'Indonesia', '🇮🇩', 0.40, true, 4 WHERE s_amazon IS NOT NULL
  UNION ALL SELECT s_netflix, 'id', 'Indonesia', '🇮🇩', 0.45, true, 4 WHERE s_netflix IS NOT NULL
  UNION ALL SELECT s_uber, 'id', 'Indonesia', '🇮🇩', 0.35, true, 4 WHERE s_uber IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO verification_country_prices (service_id, country_code, country_name, country_flag, price, is_active, sort_order)
  SELECT s_telegram, 'ph', 'Filipinas', '🇵🇭', 0.30, true, 5 WHERE s_telegram IS NOT NULL
  UNION ALL SELECT s_whatsapp, 'ph', 'Filipinas', '🇵🇭', 0.30, true, 5 WHERE s_whatsapp IS NOT NULL
  UNION ALL SELECT s_google, 'ph', 'Filipinas', '🇵🇭', 0.35, true, 5 WHERE s_google IS NOT NULL
  UNION ALL SELECT s_facebook, 'ph', 'Filipinas', '🇵🇭', 0.35, true, 5 WHERE s_facebook IS NOT NULL
  UNION ALL SELECT s_instagram, 'ph', 'Filipinas', '🇵🇭', 0.35, true, 5 WHERE s_instagram IS NOT NULL
  UNION ALL SELECT s_tiktok, 'ph', 'Filipinas', '🇵🇭', 0.40, true, 5 WHERE s_tiktok IS NOT NULL
  UNION ALL SELECT s_discord, 'ph', 'Filipinas', '🇵🇭', 0.30, true, 5 WHERE s_discord IS NOT NULL
  UNION ALL SELECT s_microsoft, 'ph', 'Filipinas', '🇵🇭', 0.40, true, 5 WHERE s_microsoft IS NOT NULL
  UNION ALL SELECT s_apple, 'ph', 'Filipinas', '🇵🇭', 0.45, true, 5 WHERE s_apple IS NOT NULL
  UNION ALL SELECT s_amazon, 'ph', 'Filipinas', '🇵🇭', 0.40, true, 5 WHERE s_amazon IS NOT NULL
  UNION ALL SELECT s_netflix, 'ph', 'Filipinas', '🇵🇭', 0.45, true, 5 WHERE s_netflix IS NOT NULL
  UNION ALL SELECT s_uber, 'ph', 'Filipinas', '🇵🇭', 0.35, true, 5 WHERE s_uber IS NOT NULL
  ON CONFLICT DO NOTHING;

  -- Tier 2: Mid-price countries (0.50-0.80)
  INSERT INTO verification_country_prices (service_id, country_code, country_name, country_flag, price, is_active, sort_order)
  SELECT s_telegram, 'es', 'España', '🇪🇸', 0.50, true, 10 WHERE s_telegram IS NOT NULL
  UNION ALL SELECT s_whatsapp, 'es', 'España', '🇪🇸', 0.50, true, 10 WHERE s_whatsapp IS NOT NULL
  UNION ALL SELECT s_google, 'es', 'España', '🇪🇸', 0.60, true, 10 WHERE s_google IS NOT NULL
  UNION ALL SELECT s_facebook, 'es', 'España', '🇪🇸', 0.60, true, 10 WHERE s_facebook IS NOT NULL
  UNION ALL SELECT s_instagram, 'es', 'España', '🇪🇸', 0.60, true, 10 WHERE s_instagram IS NOT NULL
  UNION ALL SELECT s_tiktok, 'es', 'España', '🇪🇸', 0.70, true, 10 WHERE s_tiktok IS NOT NULL
  UNION ALL SELECT s_discord, 'es', 'España', '🇪🇸', 0.50, true, 10 WHERE s_discord IS NOT NULL
  UNION ALL SELECT s_microsoft, 'es', 'España', '🇪🇸', 0.70, true, 10 WHERE s_microsoft IS NOT NULL
  UNION ALL SELECT s_apple, 'es', 'España', '🇪🇸', 0.80, true, 10 WHERE s_apple IS NOT NULL
  UNION ALL SELECT s_amazon, 'es', 'España', '🇪🇸', 0.70, true, 10 WHERE s_amazon IS NOT NULL
  UNION ALL SELECT s_netflix, 'es', 'España', '🇪🇸', 0.80, true, 10 WHERE s_netflix IS NOT NULL
  UNION ALL SELECT s_uber, 'es', 'España', '🇪🇸', 0.60, true, 10 WHERE s_uber IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO verification_country_prices (service_id, country_code, country_name, country_flag, price, is_active, sort_order)
  SELECT s_telegram, 'fr', 'Francia', '🇫🇷', 0.50, true, 11 WHERE s_telegram IS NOT NULL
  UNION ALL SELECT s_whatsapp, 'fr', 'Francia', '🇫🇷', 0.50, true, 11 WHERE s_whatsapp IS NOT NULL
  UNION ALL SELECT s_google, 'fr', 'Francia', '🇫🇷', 0.60, true, 11 WHERE s_google IS NOT NULL
  UNION ALL SELECT s_facebook, 'fr', 'Francia', '🇫🇷', 0.60, true, 11 WHERE s_facebook IS NOT NULL
  UNION ALL SELECT s_instagram, 'fr', 'Francia', '🇫🇷', 0.60, true, 11 WHERE s_instagram IS NOT NULL
  UNION ALL SELECT s_tiktok, 'fr', 'Francia', '🇫🇷', 0.70, true, 11 WHERE s_tiktok IS NOT NULL
  UNION ALL SELECT s_discord, 'fr', 'Francia', '🇫🇷', 0.50, true, 11 WHERE s_discord IS NOT NULL
  UNION ALL SELECT s_microsoft, 'fr', 'Francia', '🇫🇷', 0.70, true, 11 WHERE s_microsoft IS NOT NULL
  UNION ALL SELECT s_apple, 'fr', 'Francia', '🇫🇷', 0.80, true, 11 WHERE s_apple IS NOT NULL
  UNION ALL SELECT s_amazon, 'fr', 'Francia', '🇫🇷', 0.70, true, 11 WHERE s_amazon IS NOT NULL
  UNION ALL SELECT s_netflix, 'fr', 'Francia', '🇫🇷', 0.80, true, 11 WHERE s_netflix IS NOT NULL
  UNION ALL SELECT s_uber, 'fr', 'Francia', '🇫🇷', 0.60, true, 11 WHERE s_uber IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO verification_country_prices (service_id, country_code, country_name, country_flag, price, is_active, sort_order)
  SELECT s_telegram, 'de', 'Alemania', '🇩🇪', 0.50, true, 12 WHERE s_telegram IS NOT NULL
  UNION ALL SELECT s_whatsapp, 'de', 'Alemania', '🇩🇪', 0.50, true, 12 WHERE s_whatsapp IS NOT NULL
  UNION ALL SELECT s_google, 'de', 'Alemania', '🇩🇪', 0.60, true, 12 WHERE s_google IS NOT NULL
  UNION ALL SELECT s_facebook, 'de', 'Alemania', '🇩🇪', 0.60, true, 12 WHERE s_facebook IS NOT NULL
  UNION ALL SELECT s_instagram, 'de', 'Alemania', '🇩🇪', 0.60, true, 12 WHERE s_instagram IS NOT NULL
  UNION ALL SELECT s_tiktok, 'de', 'Alemania', '🇩🇪', 0.70, true, 12 WHERE s_tiktok IS NOT NULL
  UNION ALL SELECT s_discord, 'de', 'Alemania', '🇩🇪', 0.50, true, 12 WHERE s_discord IS NOT NULL
  UNION ALL SELECT s_microsoft, 'de', 'Alemania', '🇩🇪', 0.70, true, 12 WHERE s_microsoft IS NOT NULL
  UNION ALL SELECT s_apple, 'de', 'Alemania', '🇩🇪', 0.80, true, 12 WHERE s_apple IS NOT NULL
  UNION ALL SELECT s_amazon, 'de', 'Alemania', '🇩🇪', 0.70, true, 12 WHERE s_amazon IS NOT NULL
  UNION ALL SELECT s_netflix, 'de', 'Alemania', '🇩🇪', 0.80, true, 12 WHERE s_netflix IS NOT NULL
  UNION ALL SELECT s_uber, 'de', 'Alemania', '🇩🇪', 0.60, true, 12 WHERE s_uber IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO verification_country_prices (service_id, country_code, country_name, country_flag, price, is_active, sort_order)
  SELECT s_telegram, 'gb', 'Reino Unido', '🇬🇧', 0.50, true, 13 WHERE s_telegram IS NOT NULL
  UNION ALL SELECT s_whatsapp, 'gb', 'Reino Unido', '🇬🇧', 0.50, true, 13 WHERE s_whatsapp IS NOT NULL
  UNION ALL SELECT s_google, 'gb', 'Reino Unido', '🇬🇧', 0.60, true, 13 WHERE s_google IS NOT NULL
  UNION ALL SELECT s_facebook, 'gb', 'Reino Unido', '🇬🇧', 0.60, true, 13 WHERE s_facebook IS NOT NULL
  UNION ALL SELECT s_instagram, 'gb', 'Reino Unido', '🇬🇧', 0.60, true, 13 WHERE s_instagram IS NOT NULL
  UNION ALL SELECT s_tiktok, 'gb', 'Reino Unido', '🇬🇧', 0.70, true, 13 WHERE s_tiktok IS NOT NULL
  UNION ALL SELECT s_discord, 'gb', 'Reino Unido', '🇬🇧', 0.50, true, 13 WHERE s_discord IS NOT NULL
  UNION ALL SELECT s_microsoft, 'gb', 'Reino Unido', '🇬🇧', 0.70, true, 13 WHERE s_microsoft IS NOT NULL
  UNION ALL SELECT s_apple, 'gb', 'Reino Unido', '🇬🇧', 0.80, true, 13 WHERE s_apple IS NOT NULL
  UNION ALL SELECT s_amazon, 'gb', 'Reino Unido', '🇬🇧', 0.70, true, 13 WHERE s_amazon IS NOT NULL
  UNION ALL SELECT s_netflix, 'gb', 'Reino Unido', '🇬🇧', 0.80, true, 13 WHERE s_netflix IS NOT NULL
  UNION ALL SELECT s_uber, 'gb', 'Reino Unido', '🇬🇧', 0.60, true, 13 WHERE s_uber IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO verification_country_prices (service_id, country_code, country_name, country_flag, price, is_active, sort_order)
  SELECT s_telegram, 'it', 'Italia', '🇮🇹', 0.50, true, 14 WHERE s_telegram IS NOT NULL
  UNION ALL SELECT s_whatsapp, 'it', 'Italia', '🇮🇹', 0.50, true, 14 WHERE s_whatsapp IS NOT NULL
  UNION ALL SELECT s_google, 'it', 'Italia', '🇮🇹', 0.60, true, 14 WHERE s_google IS NOT NULL
  UNION ALL SELECT s_facebook, 'it', 'Italia', '🇮🇹', 0.60, true, 14 WHERE s_facebook IS NOT NULL
  UNION ALL SELECT s_instagram, 'it', 'Italia', '🇮🇹', 0.60, true, 14 WHERE s_instagram IS NOT NULL
  UNION ALL SELECT s_tiktok, 'it', 'Italia', '🇮🇹', 0.70, true, 14 WHERE s_tiktok IS NOT NULL
  UNION ALL SELECT s_discord, 'it', 'Italia', '🇮🇹', 0.50, true, 14 WHERE s_discord IS NOT NULL
  UNION ALL SELECT s_microsoft, 'it', 'Italia', '🇮🇹', 0.70, true, 14 WHERE s_microsoft IS NOT NULL
  UNION ALL SELECT s_apple, 'it', 'Italia', '🇮🇹', 0.80, true, 14 WHERE s_apple IS NOT NULL
  UNION ALL SELECT s_amazon, 'it', 'Italia', '🇮🇹', 0.70, true, 14 WHERE s_amazon IS NOT NULL
  UNION ALL SELECT s_netflix, 'it', 'Italia', '🇮🇹', 0.80, true, 14 WHERE s_netflix IS NOT NULL
  UNION ALL SELECT s_uber, 'it', 'Italia', '🇮🇹', 0.60, true, 14 WHERE s_uber IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO verification_country_prices (service_id, country_code, country_name, country_flag, price, is_active, sort_order)
  SELECT s_telegram, 'nl', 'Países Bajos', '🇳🇱', 0.50, true, 15 WHERE s_telegram IS NOT NULL
  UNION ALL SELECT s_whatsapp, 'nl', 'Países Bajos', '🇳🇱', 0.50, true, 15 WHERE s_whatsapp IS NOT NULL
  UNION ALL SELECT s_google, 'nl', 'Países Bajos', '🇳🇱', 0.60, true, 15 WHERE s_google IS NOT NULL
  UNION ALL SELECT s_facebook, 'nl', 'Países Bajos', '🇳🇱', 0.60, true, 15 WHERE s_facebook IS NOT NULL
  UNION ALL SELECT s_instagram, 'nl', 'Países Bajos', '🇳🇱', 0.60, true, 15 WHERE s_instagram IS NOT NULL
  UNION ALL SELECT s_tiktok, 'nl', 'Países Bajos', '🇳🇱', 0.70, true, 15 WHERE s_tiktok IS NOT NULL
  UNION ALL SELECT s_discord, 'nl', 'Países Bajos', '🇳🇱', 0.50, true, 15 WHERE s_discord IS NOT NULL
  UNION ALL SELECT s_microsoft, 'nl', 'Países Bajos', '🇳🇱', 0.70, true, 15 WHERE s_microsoft IS NOT NULL
  UNION ALL SELECT s_apple, 'nl', 'Países Bajos', '🇳🇱', 0.80, true, 15 WHERE s_apple IS NOT NULL
  UNION ALL SELECT s_amazon, 'nl', 'Países Bajos', '🇳🇱', 0.70, true, 15 WHERE s_amazon IS NOT NULL
  UNION ALL SELECT s_netflix, 'nl', 'Países Bajos', '🇳🇱', 0.80, true, 15 WHERE s_netflix IS NOT NULL
  UNION ALL SELECT s_uber, 'nl', 'Países Bajos', '🇳🇱', 0.60, true, 15 WHERE s_uber IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO verification_country_prices (service_id, country_code, country_name, country_flag, price, is_active, sort_order)
  SELECT s_telegram, 'br', 'Brasil', '🇧🇷', 0.40, true, 20 WHERE s_telegram IS NOT NULL
  UNION ALL SELECT s_whatsapp, 'br', 'Brasil', '🇧🇷', 0.40, true, 20 WHERE s_whatsapp IS NOT NULL
  UNION ALL SELECT s_google, 'br', 'Brasil', '🇧🇷', 0.50, true, 20 WHERE s_google IS NOT NULL
  UNION ALL SELECT s_facebook, 'br', 'Brasil', '🇧🇷', 0.50, true, 20 WHERE s_facebook IS NOT NULL
  UNION ALL SELECT s_instagram, 'br', 'Brasil', '🇧🇷', 0.50, true, 20 WHERE s_instagram IS NOT NULL
  UNION ALL SELECT s_tiktok, 'br', 'Brasil', '🇧🇷', 0.60, true, 20 WHERE s_tiktok IS NOT NULL
  UNION ALL SELECT s_discord, 'br', 'Brasil', '🇧🇷', 0.40, true, 20 WHERE s_discord IS NOT NULL
  UNION ALL SELECT s_microsoft, 'br', 'Brasil', '🇧🇷', 0.60, true, 20 WHERE s_microsoft IS NOT NULL
  UNION ALL SELECT s_apple, 'br', 'Brasil', '🇧🇷', 0.70, true, 20 WHERE s_apple IS NOT NULL
  UNION ALL SELECT s_amazon, 'br', 'Brasil', '🇧🇷', 0.60, true, 20 WHERE s_amazon IS NOT NULL
  UNION ALL SELECT s_netflix, 'br', 'Brasil', '🇧🇷', 0.70, true, 20 WHERE s_netflix IS NOT NULL
  UNION ALL SELECT s_uber, 'br', 'Brasil', '🇧🇷', 0.50, true, 20 WHERE s_uber IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO verification_country_prices (service_id, country_code, country_name, country_flag, price, is_active, sort_order)
  SELECT s_telegram, 'mx', 'México', '🇲🇽', 0.40, true, 21 WHERE s_telegram IS NOT NULL
  UNION ALL SELECT s_whatsapp, 'mx', 'México', '🇲🇽', 0.40, true, 21 WHERE s_whatsapp IS NOT NULL
  UNION ALL SELECT s_google, 'mx', 'México', '🇲🇽', 0.50, true, 21 WHERE s_google IS NOT NULL
  UNION ALL SELECT s_facebook, 'mx', 'México', '🇲🇽', 0.50, true, 21 WHERE s_facebook IS NOT NULL
  UNION ALL SELECT s_instagram, 'mx', 'México', '🇲🇽', 0.50, true, 21 WHERE s_instagram IS NOT NULL
  UNION ALL SELECT s_tiktok, 'mx', 'México', '🇲🇽', 0.60, true, 21 WHERE s_tiktok IS NOT NULL
  UNION ALL SELECT s_discord, 'mx', 'México', '🇲🇽', 0.40, true, 21 WHERE s_discord IS NOT NULL
  UNION ALL SELECT s_microsoft, 'mx', 'México', '🇲🇽', 0.60, true, 21 WHERE s_microsoft IS NOT NULL
  UNION ALL SELECT s_apple, 'mx', 'México', '🇲🇽', 0.70, true, 21 WHERE s_apple IS NOT NULL
  UNION ALL SELECT s_amazon, 'mx', 'México', '🇲🇽', 0.60, true, 21 WHERE s_amazon IS NOT NULL
  UNION ALL SELECT s_netflix, 'mx', 'México', '🇲🇽', 0.70, true, 21 WHERE s_netflix IS NOT NULL
  UNION ALL SELECT s_uber, 'mx', 'México', '🇲🇽', 0.50, true, 21 WHERE s_uber IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO verification_country_prices (service_id, country_code, country_name, country_flag, price, is_active, sort_order)
  SELECT s_telegram, 'co', 'Colombia', '🇨🇴', 0.40, true, 22 WHERE s_telegram IS NOT NULL
  UNION ALL SELECT s_whatsapp, 'co', 'Colombia', '🇨🇴', 0.40, true, 22 WHERE s_whatsapp IS NOT NULL
  UNION ALL SELECT s_google, 'co', 'Colombia', '🇨🇴', 0.50, true, 22 WHERE s_google IS NOT NULL
  UNION ALL SELECT s_facebook, 'co', 'Colombia', '🇨🇴', 0.50, true, 22 WHERE s_facebook IS NOT NULL
  UNION ALL SELECT s_instagram, 'co', 'Colombia', '🇨🇴', 0.50, true, 22 WHERE s_instagram IS NOT NULL
  UNION ALL SELECT s_tiktok, 'co', 'Colombia', '🇨🇴', 0.60, true, 22 WHERE s_tiktok IS NOT NULL
  UNION ALL SELECT s_discord, 'co', 'Colombia', '🇨🇴', 0.40, true, 22 WHERE s_discord IS NOT NULL
  UNION ALL SELECT s_microsoft, 'co', 'Colombia', '🇨🇴', 0.60, true, 22 WHERE s_microsoft IS NOT NULL
  UNION ALL SELECT s_apple, 'co', 'Colombia', '🇨🇴', 0.70, true, 22 WHERE s_apple IS NOT NULL
  UNION ALL SELECT s_amazon, 'co', 'Colombia', '🇨🇴', 0.60, true, 22 WHERE s_amazon IS NOT NULL
  UNION ALL SELECT s_netflix, 'co', 'Colombia', '🇨🇴', 0.70, true, 22 WHERE s_netflix IS NOT NULL
  UNION ALL SELECT s_uber, 'co', 'Colombia', '🇨🇴', 0.50, true, 22 WHERE s_uber IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO verification_country_prices (service_id, country_code, country_name, country_flag, price, is_active, sort_order)
  SELECT s_telegram, 'ar', 'Argentina', '🇦🇷', 0.40, true, 23 WHERE s_telegram IS NOT NULL
  UNION ALL SELECT s_whatsapp, 'ar', 'Argentina', '🇦🇷', 0.40, true, 23 WHERE s_whatsapp IS NOT NULL
  UNION ALL SELECT s_google, 'ar', 'Argentina', '🇦🇷', 0.50, true, 23 WHERE s_google IS NOT NULL
  UNION ALL SELECT s_facebook, 'ar', 'Argentina', '🇦🇷', 0.50, true, 23 WHERE s_facebook IS NOT NULL
  UNION ALL SELECT s_instagram, 'ar', 'Argentina', '🇦🇷', 0.50, true, 23 WHERE s_instagram IS NOT NULL
  UNION ALL SELECT s_tiktok, 'ar', 'Argentina', '🇦🇷', 0.60, true, 23 WHERE s_tiktok IS NOT NULL
  UNION ALL SELECT s_discord, 'ar', 'Argentina', '🇦🇷', 0.40, true, 23 WHERE s_discord IS NOT NULL
  UNION ALL SELECT s_microsoft, 'ar', 'Argentina', '🇦🇷', 0.60, true, 23 WHERE s_microsoft IS NOT NULL
  UNION ALL SELECT s_apple, 'ar', 'Argentina', '🇦🇷', 0.70, true, 23 WHERE s_apple IS NOT NULL
  UNION ALL SELECT s_amazon, 'ar', 'Argentina', '🇦🇷', 0.60, true, 23 WHERE s_amazon IS NOT NULL
  UNION ALL SELECT s_netflix, 'ar', 'Argentina', '🇦🇷', 0.70, true, 23 WHERE s_netflix IS NOT NULL
  UNION ALL SELECT s_uber, 'ar', 'Argentina', '🇦🇷', 0.50, true, 23 WHERE s_uber IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO verification_country_prices (service_id, country_code, country_name, country_flag, price, is_active, sort_order)
  SELECT s_telegram, 'tr', 'Turquía', '🇹🇷', 0.35, true, 30 WHERE s_telegram IS NOT NULL
  UNION ALL SELECT s_whatsapp, 'tr', 'Turquía', '🇹🇷', 0.35, true, 30 WHERE s_whatsapp IS NOT NULL
  UNION ALL SELECT s_google, 'tr', 'Turquía', '🇹🇷', 0.45, true, 30 WHERE s_google IS NOT NULL
  UNION ALL SELECT s_facebook, 'tr', 'Turquía', '🇹🇷', 0.45, true, 30 WHERE s_facebook IS NOT NULL
  UNION ALL SELECT s_instagram, 'tr', 'Turquía', '🇹🇷', 0.45, true, 30 WHERE s_instagram IS NOT NULL
  UNION ALL SELECT s_tiktok, 'tr', 'Turquía', '🇹🇷', 0.50, true, 30 WHERE s_tiktok IS NOT NULL
  UNION ALL SELECT s_discord, 'tr', 'Turquía', '🇹🇷', 0.35, true, 30 WHERE s_discord IS NOT NULL
  UNION ALL SELECT s_microsoft, 'tr', 'Turquía', '🇹🇷', 0.50, true, 30 WHERE s_microsoft IS NOT NULL
  UNION ALL SELECT s_apple, 'tr', 'Turquía', '🇹🇷', 0.55, true, 30 WHERE s_apple IS NOT NULL
  UNION ALL SELECT s_amazon, 'tr', 'Turquía', '🇹🇷', 0.50, true, 30 WHERE s_amazon IS NOT NULL
  UNION ALL SELECT s_netflix, 'tr', 'Turquía', '🇹🇷', 0.55, true, 30 WHERE s_netflix IS NOT NULL
  UNION ALL SELECT s_uber, 'tr', 'Turquía', '🇹🇷', 0.45, true, 30 WHERE s_uber IS NOT NULL
  ON CONFLICT DO NOTHING;

  -- Tier 3: Premium countries (0.80-2.00)
  INSERT INTO verification_country_prices (service_id, country_code, country_name, country_flag, price, is_active, sort_order)
  SELECT s_telegram, 'us', 'Estados Unidos', '🇺🇸', 0.80, true, 40 WHERE s_telegram IS NOT NULL
  UNION ALL SELECT s_whatsapp, 'us', 'Estados Unidos', '🇺🇸', 0.80, true, 40 WHERE s_whatsapp IS NOT NULL
  UNION ALL SELECT s_google, 'us', 'Estados Unidos', '🇺🇸', 1.00, true, 40 WHERE s_google IS NOT NULL
  UNION ALL SELECT s_facebook, 'us', 'Estados Unidos', '🇺🇸', 1.00, true, 40 WHERE s_facebook IS NOT NULL
  UNION ALL SELECT s_instagram, 'us', 'Estados Unidos', '🇺🇸', 1.00, true, 40 WHERE s_instagram IS NOT NULL
  UNION ALL SELECT s_tiktok, 'us', 'Estados Unidos', '🇺🇸', 1.20, true, 40 WHERE s_tiktok IS NOT NULL
  UNION ALL SELECT s_discord, 'us', 'Estados Unidos', '🇺🇸', 0.80, true, 40 WHERE s_discord IS NOT NULL
  UNION ALL SELECT s_microsoft, 'us', 'Estados Unidos', '🇺🇸', 1.20, true, 40 WHERE s_microsoft IS NOT NULL
  UNION ALL SELECT s_apple, 'us', 'Estados Unidos', '🇺🇸', 1.50, true, 40 WHERE s_apple IS NOT NULL
  UNION ALL SELECT s_amazon, 'us', 'Estados Unidos', '🇺🇸', 1.20, true, 40 WHERE s_amazon IS NOT NULL
  UNION ALL SELECT s_netflix, 'us', 'Estados Unidos', '🇺🇸', 1.50, true, 40 WHERE s_netflix IS NOT NULL
  UNION ALL SELECT s_uber, 'us', 'Estados Unidos', '🇺🇸', 1.00, true, 40 WHERE s_uber IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO verification_country_prices (service_id, country_code, country_name, country_flag, price, is_active, sort_order)
  SELECT s_telegram, 'ca', 'Canadá', '🇨🇦', 0.80, true, 41 WHERE s_telegram IS NOT NULL
  UNION ALL SELECT s_whatsapp, 'ca', 'Canadá', '🇨🇦', 0.80, true, 41 WHERE s_whatsapp IS NOT NULL
  UNION ALL SELECT s_google, 'ca', 'Canadá', '🇨🇦', 1.00, true, 41 WHERE s_google IS NOT NULL
  UNION ALL SELECT s_facebook, 'ca', 'Canadá', '🇨🇦', 1.00, true, 41 WHERE s_facebook IS NOT NULL
  UNION ALL SELECT s_instagram, 'ca', 'Canadá', '🇨🇦', 1.00, true, 41 WHERE s_instagram IS NOT NULL
  UNION ALL SELECT s_tiktok, 'ca', 'Canadá', '🇨🇦', 1.20, true, 41 WHERE s_tiktok IS NOT NULL
  UNION ALL SELECT s_discord, 'ca', 'Canadá', '🇨🇦', 0.80, true, 41 WHERE s_discord IS NOT NULL
  UNION ALL SELECT s_microsoft, 'ca', 'Canadá', '🇨🇦', 1.20, true, 41 WHERE s_microsoft IS NOT NULL
  UNION ALL SELECT s_apple, 'ca', 'Canadá', '🇨🇦', 1.50, true, 41 WHERE s_apple IS NOT NULL
  UNION ALL SELECT s_amazon, 'ca', 'Canadá', '🇨🇦', 1.20, true, 41 WHERE s_amazon IS NOT NULL
  UNION ALL SELECT s_netflix, 'ca', 'Canadá', '🇨🇦', 1.50, true, 41 WHERE s_netflix IS NOT NULL
  UNION ALL SELECT s_uber, 'ca', 'Canadá', '🇨🇦', 1.00, true, 41 WHERE s_uber IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO verification_country_prices (service_id, country_code, country_name, country_flag, price, is_active, sort_order)
  SELECT s_telegram, 'au', 'Australia', '🇦🇺', 0.80, true, 42 WHERE s_telegram IS NOT NULL
  UNION ALL SELECT s_whatsapp, 'au', 'Australia', '🇦🇺', 0.80, true, 42 WHERE s_whatsapp IS NOT NULL
  UNION ALL SELECT s_google, 'au', 'Australia', '🇦🇺', 1.00, true, 42 WHERE s_google IS NOT NULL
  UNION ALL SELECT s_facebook, 'au', 'Australia', '🇦🇺', 1.00, true, 42 WHERE s_facebook IS NOT NULL
  UNION ALL SELECT s_instagram, 'au', 'Australia', '🇦🇺', 1.00, true, 42 WHERE s_instagram IS NOT NULL
  UNION ALL SELECT s_tiktok, 'au', 'Australia', '🇦🇺', 1.20, true, 42 WHERE s_tiktok IS NOT NULL
  UNION ALL SELECT s_discord, 'au', 'Australia', '🇦🇺', 0.80, true, 42 WHERE s_discord IS NOT NULL
  UNION ALL SELECT s_microsoft, 'au', 'Australia', '🇦🇺', 1.20, true, 42 WHERE s_microsoft IS NOT NULL
  UNION ALL SELECT s_apple, 'au', 'Australia', '🇦🇺', 1.50, true, 42 WHERE s_apple IS NOT NULL
  UNION ALL SELECT s_amazon, 'au', 'Australia', '🇦🇺', 1.20, true, 42 WHERE s_amazon IS NOT NULL
  UNION ALL SELECT s_netflix, 'au', 'Australia', '🇦🇺', 1.50, true, 42 WHERE s_netflix IS NOT NULL
  UNION ALL SELECT s_uber, 'au', 'Australia', '🇦🇺', 1.00, true, 42 WHERE s_uber IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO verification_country_prices (service_id, country_code, country_name, country_flag, price, is_active, sort_order)
  SELECT s_telegram, 'jp', 'Japón', '🇯🇵', 1.00, true, 50 WHERE s_telegram IS NOT NULL
  UNION ALL SELECT s_whatsapp, 'jp', 'Japón', '🇯🇵', 1.00, true, 50 WHERE s_whatsapp IS NOT NULL
  UNION ALL SELECT s_google, 'jp', 'Japón', '🇯🇵', 1.20, true, 50 WHERE s_google IS NOT NULL
  UNION ALL SELECT s_facebook, 'jp', 'Japón', '🇯🇵', 1.20, true, 50 WHERE s_facebook IS NOT NULL
  UNION ALL SELECT s_instagram, 'jp', 'Japón', '🇯🇵', 1.20, true, 50 WHERE s_instagram IS NOT NULL
  UNION ALL SELECT s_tiktok, 'jp', 'Japón', '🇯🇵', 1.50, true, 50 WHERE s_tiktok IS NOT NULL
  UNION ALL SELECT s_discord, 'jp', 'Japón', '🇯🇵', 1.00, true, 50 WHERE s_discord IS NOT NULL
  UNION ALL SELECT s_microsoft, 'jp', 'Japón', '🇯🇵', 1.50, true, 50 WHERE s_microsoft IS NOT NULL
  UNION ALL SELECT s_apple, 'jp', 'Japón', '🇯🇵', 2.00, true, 50 WHERE s_apple IS NOT NULL
  UNION ALL SELECT s_amazon, 'jp', 'Japón', '🇯🇵', 1.50, true, 50 WHERE s_amazon IS NOT NULL
  UNION ALL SELECT s_netflix, 'jp', 'Japón', '🇯🇵', 2.00, true, 50 WHERE s_netflix IS NOT NULL
  UNION ALL SELECT s_uber, 'jp', 'Japón', '🇯🇵', 1.20, true, 50 WHERE s_uber IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO verification_country_prices (service_id, country_code, country_name, country_flag, price, is_active, sort_order)
  SELECT s_telegram, 'kr', 'Corea del Sur', '🇰🇷', 0.90, true, 51 WHERE s_telegram IS NOT NULL
  UNION ALL SELECT s_whatsapp, 'kr', 'Corea del Sur', '🇰🇷', 0.90, true, 51 WHERE s_whatsapp IS NOT NULL
  UNION ALL SELECT s_google, 'kr', 'Corea del Sur', '🇰🇷', 1.10, true, 51 WHERE s_google IS NOT NULL
  UNION ALL SELECT s_facebook, 'kr', 'Corea del Sur', '🇰🇷', 1.10, true, 51 WHERE s_facebook IS NOT NULL
  UNION ALL SELECT s_instagram, 'kr', 'Corea del Sur', '🇰🇷', 1.10, true, 51 WHERE s_instagram IS NOT NULL
  UNION ALL SELECT s_tiktok, 'kr', 'Corea del Sur', '🇰🇷', 1.30, true, 51 WHERE s_tiktok IS NOT NULL
  UNION ALL SELECT s_discord, 'kr', 'Corea del Sur', '🇰🇷', 0.90, true, 51 WHERE s_discord IS NOT NULL
  UNION ALL SELECT s_microsoft, 'kr', 'Corea del Sur', '🇰🇷', 1.30, true, 51 WHERE s_microsoft IS NOT NULL
  UNION ALL SELECT s_apple, 'kr', 'Corea del Sur', '🇰🇷', 1.80, true, 51 WHERE s_apple IS NOT NULL
  UNION ALL SELECT s_amazon, 'kr', 'Corea del Sur', '🇰🇷', 1.30, true, 51 WHERE s_amazon IS NOT NULL
  UNION ALL SELECT s_netflix, 'kr', 'Corea del Sur', '🇰🇷', 1.80, true, 51 WHERE s_netflix IS NOT NULL
  UNION ALL SELECT s_uber, 'kr', 'Corea del Sur', '🇰🇷', 1.10, true, 51 WHERE s_uber IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO verification_country_prices (service_id, country_code, country_name, country_flag, price, is_active, sort_order)
  SELECT s_telegram, 'ae', 'Emiratos Árabes', '🇦🇪', 0.70, true, 60 WHERE s_telegram IS NOT NULL
  UNION ALL SELECT s_whatsapp, 'ae', 'Emiratos Árabes', '🇦🇪', 0.70, true, 60 WHERE s_whatsapp IS NOT NULL
  UNION ALL SELECT s_google, 'ae', 'Emiratos Árabes', '🇦🇪', 0.90, true, 60 WHERE s_google IS NOT NULL
  UNION ALL SELECT s_facebook, 'ae', 'Emiratos Árabes', '🇦🇪', 0.90, true, 60 WHERE s_facebook IS NOT NULL
  UNION ALL SELECT s_instagram, 'ae', 'Emiratos Árabes', '🇦🇪', 0.90, true, 60 WHERE s_instagram IS NOT NULL
  UNION ALL SELECT s_tiktok, 'ae', 'Emiratos Árabes', '🇦🇪', 1.00, true, 60 WHERE s_tiktok IS NOT NULL
  UNION ALL SELECT s_discord, 'ae', 'Emiratos Árabes', '🇦🇪', 0.70, true, 60 WHERE s_discord IS NOT NULL
  UNION ALL SELECT s_microsoft, 'ae', 'Emiratos Árabes', '🇦🇪', 1.00, true, 60 WHERE s_microsoft IS NOT NULL
  UNION ALL SELECT s_apple, 'ae', 'Emiratos Árabes', '🇦🇪', 1.20, true, 60 WHERE s_apple IS NOT NULL
  UNION ALL SELECT s_amazon, 'ae', 'Emiratos Árabes', '🇦🇪', 1.00, true, 60 WHERE s_amazon IS NOT NULL
  UNION ALL SELECT s_netflix, 'ae', 'Emiratos Árabes', '🇦🇪', 1.20, true, 60 WHERE s_netflix IS NOT NULL
  UNION ALL SELECT s_uber, 'ae', 'Emiratos Árabes', '🇦🇪', 0.90, true, 60 WHERE s_uber IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO verification_country_prices (service_id, country_code, country_name, country_flag, price, is_active, sort_order)
  SELECT s_telegram, 'sa', 'Arabia Saudí', '🇸🇦', 0.70, true, 61 WHERE s_telegram IS NOT NULL
  UNION ALL SELECT s_whatsapp, 'sa', 'Arabia Saudí', '🇸🇦', 0.70, true, 61 WHERE s_whatsapp IS NOT NULL
  UNION ALL SELECT s_google, 'sa', 'Arabia Saudí', '🇸🇦', 0.90, true, 61 WHERE s_google IS NOT NULL
  UNION ALL SELECT s_facebook, 'sa', 'Arabia Saudí', '🇸🇦', 0.90, true, 61 WHERE s_facebook IS NOT NULL
  UNION ALL SELECT s_instagram, 'sa', 'Arabia Saudí', '🇸🇦', 0.90, true, 61 WHERE s_instagram IS NOT NULL
  UNION ALL SELECT s_tiktok, 'sa', 'Arabia Saudí', '🇸🇦', 1.00, true, 61 WHERE s_tiktok IS NOT NULL
  UNION ALL SELECT s_discord, 'sa', 'Arabia Saudí', '🇸🇦', 0.70, true, 61 WHERE s_discord IS NOT NULL
  UNION ALL SELECT s_microsoft, 'sa', 'Arabia Saudí', '🇸🇦', 1.00, true, 61 WHERE s_microsoft IS NOT NULL
  UNION ALL SELECT s_apple, 'sa', 'Arabia Saudí', '🇸🇦', 1.20, true, 61 WHERE s_apple IS NOT NULL
  UNION ALL SELECT s_amazon, 'sa', 'Arabia Saudí', '🇸🇦', 1.00, true, 61 WHERE s_amazon IS NOT NULL
  UNION ALL SELECT s_netflix, 'sa', 'Arabia Saudí', '🇸🇦', 1.20, true, 61 WHERE s_netflix IS NOT NULL
  UNION ALL SELECT s_uber, 'sa', 'Arabia Saudí', '🇸🇦', 0.90, true, 61 WHERE s_uber IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO verification_country_prices (service_id, country_code, country_name, country_flag, price, is_active, sort_order)
  SELECT s_telegram, 'ng', 'Nigeria', '🇳🇬', 0.35, true, 70 WHERE s_telegram IS NOT NULL
  UNION ALL SELECT s_whatsapp, 'ng', 'Nigeria', '🇳🇬', 0.35, true, 70 WHERE s_whatsapp IS NOT NULL
  UNION ALL SELECT s_google, 'ng', 'Nigeria', '🇳🇬', 0.45, true, 70 WHERE s_google IS NOT NULL
  UNION ALL SELECT s_facebook, 'ng', 'Nigeria', '🇳🇬', 0.45, true, 70 WHERE s_facebook IS NOT NULL
  UNION ALL SELECT s_instagram, 'ng', 'Nigeria', '🇳🇬', 0.45, true, 70 WHERE s_instagram IS NOT NULL
  UNION ALL SELECT s_tiktok, 'ng', 'Nigeria', '🇳🇬', 0.50, true, 70 WHERE s_tiktok IS NOT NULL
  UNION ALL SELECT s_discord, 'ng', 'Nigeria', '🇳🇬', 0.35, true, 70 WHERE s_discord IS NOT NULL
  UNION ALL SELECT s_microsoft, 'ng', 'Nigeria', '🇳🇬', 0.50, true, 70 WHERE s_microsoft IS NOT NULL
  UNION ALL SELECT s_apple, 'ng', 'Nigeria', '🇳🇬', 0.55, true, 70 WHERE s_apple IS NOT NULL
  UNION ALL SELECT s_amazon, 'ng', 'Nigeria', '🇳🇬', 0.50, true, 70 WHERE s_amazon IS NOT NULL
  UNION ALL SELECT s_netflix, 'ng', 'Nigeria', '🇳🇬', 0.55, true, 70 WHERE s_netflix IS NOT NULL
  UNION ALL SELECT s_uber, 'ng', 'Nigeria', '🇳🇬', 0.45, true, 70 WHERE s_uber IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO verification_country_prices (service_id, country_code, country_name, country_flag, price, is_active, sort_order)
  SELECT s_telegram, 'za', 'Sudáfrica', '🇿🇦', 0.40, true, 71 WHERE s_telegram IS NOT NULL
  UNION ALL SELECT s_whatsapp, 'za', 'Sudáfrica', '🇿🇦', 0.40, true, 71 WHERE s_whatsapp IS NOT NULL
  UNION ALL SELECT s_google, 'za', 'Sudáfrica', '🇿🇦', 0.50, true, 71 WHERE s_google IS NOT NULL
  UNION ALL SELECT s_facebook, 'za', 'Sudáfrica', '🇿🇦', 0.50, true, 71 WHERE s_facebook IS NOT NULL
  UNION ALL SELECT s_instagram, 'za', 'Sudáfrica', '🇿🇦', 0.50, true, 71 WHERE s_instagram IS NOT NULL
  UNION ALL SELECT s_tiktok, 'za', 'Sudáfrica', '🇿🇦', 0.60, true, 71 WHERE s_tiktok IS NOT NULL
  UNION ALL SELECT s_discord, 'za', 'Sudáfrica', '🇿🇦', 0.40, true, 71 WHERE s_discord IS NOT NULL
  UNION ALL SELECT s_microsoft, 'za', 'Sudáfrica', '🇿🇦', 0.60, true, 71 WHERE s_microsoft IS NOT NULL
  UNION ALL SELECT s_apple, 'za', 'Sudáfrica', '🇿🇦', 0.70, true, 71 WHERE s_apple IS NOT NULL
  UNION ALL SELECT s_amazon, 'za', 'Sudáfrica', '🇿🇦', 0.60, true, 71 WHERE s_amazon IS NOT NULL
  UNION ALL SELECT s_netflix, 'za', 'Sudáfrica', '🇿🇦', 0.70, true, 71 WHERE s_netflix IS NOT NULL
  UNION ALL SELECT s_uber, 'za', 'Sudáfrica', '🇿🇦', 0.50, true, 71 WHERE s_uber IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO verification_country_prices (service_id, country_code, country_name, country_flag, price, is_active, sort_order)
  SELECT s_telegram, 'th', 'Tailandia', '🇹🇭', 0.35, true, 80 WHERE s_telegram IS NOT NULL
  UNION ALL SELECT s_whatsapp, 'th', 'Tailandia', '🇹🇭', 0.35, true, 80 WHERE s_whatsapp IS NOT NULL
  UNION ALL SELECT s_google, 'th', 'Tailandia', '🇹🇭', 0.45, true, 80 WHERE s_google IS NOT NULL
  UNION ALL SELECT s_facebook, 'th', 'Tailandia', '🇹🇭', 0.45, true, 80 WHERE s_facebook IS NOT NULL
  UNION ALL SELECT s_instagram, 'th', 'Tailandia', '🇹🇭', 0.45, true, 80 WHERE s_instagram IS NOT NULL
  UNION ALL SELECT s_tiktok, 'th', 'Tailandia', '🇹🇭', 0.50, true, 80 WHERE s_tiktok IS NOT NULL
  UNION ALL SELECT s_discord, 'th', 'Tailandia', '🇹🇭', 0.35, true, 80 WHERE s_discord IS NOT NULL
  UNION ALL SELECT s_microsoft, 'th', 'Tailandia', '🇹🇭', 0.50, true, 80 WHERE s_microsoft IS NOT NULL
  UNION ALL SELECT s_apple, 'th', 'Tailandia', '🇹🇭', 0.55, true, 80 WHERE s_apple IS NOT NULL
  UNION ALL SELECT s_amazon, 'th', 'Tailandia', '🇹🇭', 0.50, true, 80 WHERE s_amazon IS NOT NULL
  UNION ALL SELECT s_netflix, 'th', 'Tailandia', '🇹🇭', 0.55, true, 80 WHERE s_netflix IS NOT NULL
  UNION ALL SELECT s_uber, 'th', 'Tailandia', '🇹🇭', 0.45, true, 80 WHERE s_uber IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO verification_country_prices (service_id, country_code, country_name, country_flag, price, is_active, sort_order)
  SELECT s_telegram, 'pl', 'Polonia', '🇵🇱', 0.40, true, 90 WHERE s_telegram IS NOT NULL
  UNION ALL SELECT s_whatsapp, 'pl', 'Polonia', '🇵🇱', 0.40, true, 90 WHERE s_whatsapp IS NOT NULL
  UNION ALL SELECT s_google, 'pl', 'Polonia', '🇵🇱', 0.50, true, 90 WHERE s_google IS NOT NULL
  UNION ALL SELECT s_facebook, 'pl', 'Polonia', '🇵🇱', 0.50, true, 90 WHERE s_facebook IS NOT NULL
  UNION ALL SELECT s_instagram, 'pl', 'Polonia', '🇵🇱', 0.50, true, 90 WHERE s_instagram IS NOT NULL
  UNION ALL SELECT s_tiktok, 'pl', 'Polonia', '🇵🇱', 0.60, true, 90 WHERE s_tiktok IS NOT NULL
  UNION ALL SELECT s_discord, 'pl', 'Polonia', '🇵🇱', 0.40, true, 90 WHERE s_discord IS NOT NULL
  UNION ALL SELECT s_microsoft, 'pl', 'Polonia', '🇵🇱', 0.60, true, 90 WHERE s_microsoft IS NOT NULL
  UNION ALL SELECT s_apple, 'pl', 'Polonia', '🇵🇱', 0.70, true, 90 WHERE s_apple IS NOT NULL
  UNION ALL SELECT s_amazon, 'pl', 'Polonia', '🇵🇱', 0.60, true, 90 WHERE s_amazon IS NOT NULL
  UNION ALL SELECT s_netflix, 'pl', 'Polonia', '🇵🇱', 0.70, true, 90 WHERE s_netflix IS NOT NULL
  UNION ALL SELECT s_uber, 'pl', 'Polonia', '🇵🇱', 0.50, true, 90 WHERE s_uber IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO verification_country_prices (service_id, country_code, country_name, country_flag, price, is_active, sort_order)
  SELECT s_telegram, 'se', 'Suecia', '🇸🇪', 0.50, true, 91 WHERE s_telegram IS NOT NULL
  UNION ALL SELECT s_whatsapp, 'se', 'Suecia', '🇸🇪', 0.50, true, 91 WHERE s_whatsapp IS NOT NULL
  UNION ALL SELECT s_google, 'se', 'Suecia', '🇸🇪', 0.60, true, 91 WHERE s_google IS NOT NULL
  UNION ALL SELECT s_facebook, 'se', 'Suecia', '🇸🇪', 0.60, true, 91 WHERE s_facebook IS NOT NULL
  UNION ALL SELECT s_instagram, 'se', 'Suecia', '🇸🇪', 0.60, true, 91 WHERE s_instagram IS NOT NULL
  UNION ALL SELECT s_tiktok, 'se', 'Suecia', '🇸🇪', 0.70, true, 91 WHERE s_tiktok IS NOT NULL
  UNION ALL SELECT s_discord, 'se', 'Suecia', '🇸🇪', 0.50, true, 91 WHERE s_discord IS NOT NULL
  UNION ALL SELECT s_microsoft, 'se', 'Suecia', '🇸🇪', 0.70, true, 91 WHERE s_microsoft IS NOT NULL
  UNION ALL SELECT s_apple, 'se', 'Suecia', '🇸🇪', 0.80, true, 91 WHERE s_apple IS NOT NULL
  UNION ALL SELECT s_amazon, 'se', 'Suecia', '🇸🇪', 0.70, true, 91 WHERE s_amazon IS NOT NULL
  UNION ALL SELECT s_netflix, 'se', 'Suecia', '🇸🇪', 0.80, true, 91 WHERE s_netflix IS NOT NULL
  UNION ALL SELECT s_uber, 'se', 'Suecia', '🇸🇪', 0.60, true, 91 WHERE s_uber IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO verification_country_prices (service_id, country_code, country_name, country_flag, price, is_active, sort_order)
  SELECT s_telegram, 'pt', 'Portugal', '🇵🇹', 0.45, true, 92 WHERE s_telegram IS NOT NULL
  UNION ALL SELECT s_whatsapp, 'pt', 'Portugal', '🇵🇹', 0.45, true, 92 WHERE s_whatsapp IS NOT NULL
  UNION ALL SELECT s_google, 'pt', 'Portugal', '🇵🇹', 0.55, true, 92 WHERE s_google IS NOT NULL
  UNION ALL SELECT s_facebook, 'pt', 'Portugal', '🇵🇹', 0.55, true, 92 WHERE s_facebook IS NOT NULL
  UNION ALL SELECT s_instagram, 'pt', 'Portugal', '🇵🇹', 0.55, true, 92 WHERE s_instagram IS NOT NULL
  UNION ALL SELECT s_tiktok, 'pt', 'Portugal', '🇵🇹', 0.65, true, 92 WHERE s_tiktok IS NOT NULL
  UNION ALL SELECT s_discord, 'pt', 'Portugal', '🇵🇹', 0.45, true, 92 WHERE s_discord IS NOT NULL
  UNION ALL SELECT s_microsoft, 'pt', 'Portugal', '🇵🇹', 0.65, true, 92 WHERE s_microsoft IS NOT NULL
  UNION ALL SELECT s_apple, 'pt', 'Portugal', '🇵🇹', 0.75, true, 92 WHERE s_apple IS NOT NULL
  UNION ALL SELECT s_amazon, 'pt', 'Portugal', '🇵🇹', 0.65, true, 92 WHERE s_amazon IS NOT NULL
  UNION ALL SELECT s_netflix, 'pt', 'Portugal', '🇵🇹', 0.75, true, 92 WHERE s_netflix IS NOT NULL
  UNION ALL SELECT s_uber, 'pt', 'Portugal', '🇵🇹', 0.55, true, 92 WHERE s_uber IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO verification_country_prices (service_id, country_code, country_name, country_flag, price, is_active, sort_order)
  SELECT s_telegram, 'ch', 'Suiza', '🇨🇭', 0.70, true, 93 WHERE s_telegram IS NOT NULL
  UNION ALL SELECT s_whatsapp, 'ch', 'Suiza', '🇨🇭', 0.70, true, 93 WHERE s_whatsapp IS NOT NULL
  UNION ALL SELECT s_google, 'ch', 'Suiza', '🇨🇭', 0.90, true, 93 WHERE s_google IS NOT NULL
  UNION ALL SELECT s_facebook, 'ch', 'Suiza', '🇨🇭', 0.90, true, 93 WHERE s_facebook IS NOT NULL
  UNION ALL SELECT s_instagram, 'ch', 'Suiza', '🇨🇭', 0.90, true, 93 WHERE s_instagram IS NOT NULL
  UNION ALL SELECT s_tiktok, 'ch', 'Suiza', '🇨🇭', 1.00, true, 93 WHERE s_tiktok IS NOT NULL
  UNION ALL SELECT s_discord, 'ch', 'Suiza', '🇨🇭', 0.70, true, 93 WHERE s_discord IS NOT NULL
  UNION ALL SELECT s_microsoft, 'ch', 'Suiza', '🇨🇭', 1.00, true, 93 WHERE s_microsoft IS NOT NULL
  UNION ALL SELECT s_apple, 'ch', 'Suiza', '🇨🇭', 1.20, true, 93 WHERE s_apple IS NOT NULL
  UNION ALL SELECT s_amazon, 'ch', 'Suiza', '🇨🇭', 1.00, true, 93 WHERE s_amazon IS NOT NULL
  UNION ALL SELECT s_netflix, 'ch', 'Suiza', '🇨🇭', 1.20, true, 93 WHERE s_netflix IS NOT NULL
  UNION ALL SELECT s_uber, 'ch', 'Suiza', '🇨🇭', 0.90, true, 93 WHERE s_uber IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO verification_country_prices (service_id, country_code, country_name, country_flag, price, is_active, sort_order)
  SELECT s_telegram, 'eg', 'Egipto', '🇪🇬', 0.35, true, 100 WHERE s_telegram IS NOT NULL
  UNION ALL SELECT s_whatsapp, 'eg', 'Egipto', '🇪🇬', 0.35, true, 100 WHERE s_whatsapp IS NOT NULL
  UNION ALL SELECT s_google, 'eg', 'Egipto', '🇪🇬', 0.45, true, 100 WHERE s_google IS NOT NULL
  UNION ALL SELECT s_facebook, 'eg', 'Egipto', '🇪🇬', 0.45, true, 100 WHERE s_facebook IS NOT NULL
  UNION ALL SELECT s_instagram, 'eg', 'Egipto', '🇪🇬', 0.45, true, 100 WHERE s_instagram IS NOT NULL
  UNION ALL SELECT s_tiktok, 'eg', 'Egipto', '🇪🇬', 0.50, true, 100 WHERE s_tiktok IS NOT NULL
  UNION ALL SELECT s_discord, 'eg', 'Egipto', '🇪🇬', 0.35, true, 100 WHERE s_discord IS NOT NULL
  UNION ALL SELECT s_microsoft, 'eg', 'Egipto', '🇪🇬', 0.50, true, 100 WHERE s_microsoft IS NOT NULL
  UNION ALL SELECT s_apple, 'eg', 'Egipto', '🇪🇬', 0.55, true, 100 WHERE s_apple IS NOT NULL
  UNION ALL SELECT s_amazon, 'eg', 'Egipto', '🇪🇬', 0.50, true, 100 WHERE s_amazon IS NOT NULL
  UNION ALL SELECT s_netflix, 'eg', 'Egipto', '🇪🇬', 0.55, true, 100 WHERE s_netflix IS NOT NULL
  UNION ALL SELECT s_uber, 'eg', 'Egipto', '🇪🇬', 0.45, true, 100 WHERE s_uber IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO verification_country_prices (service_id, country_code, country_name, country_flag, price, is_active, sort_order)
  SELECT s_telegram, 'cl', 'Chile', '🇨🇱', 0.40, true, 110 WHERE s_telegram IS NOT NULL
  UNION ALL SELECT s_whatsapp, 'cl', 'Chile', '🇨🇱', 0.40, true, 110 WHERE s_whatsapp IS NOT NULL
  UNION ALL SELECT s_google, 'cl', 'Chile', '🇨🇱', 0.50, true, 110 WHERE s_google IS NOT NULL
  UNION ALL SELECT s_facebook, 'cl', 'Chile', '🇨🇱', 0.50, true, 110 WHERE s_facebook IS NOT NULL
  UNION ALL SELECT s_instagram, 'cl', 'Chile', '🇨🇱', 0.50, true, 110 WHERE s_instagram IS NOT NULL
  UNION ALL SELECT s_tiktok, 'cl', 'Chile', '🇨🇱', 0.60, true, 110 WHERE s_tiktok IS NOT NULL
  UNION ALL SELECT s_discord, 'cl', 'Chile', '🇨🇱', 0.40, true, 110 WHERE s_discord IS NOT NULL
  UNION ALL SELECT s_microsoft, 'cl', 'Chile', '🇨🇱', 0.60, true, 110 WHERE s_microsoft IS NOT NULL
  UNION ALL SELECT s_apple, 'cl', 'Chile', '🇨🇱', 0.70, true, 110 WHERE s_apple IS NOT NULL
  UNION ALL SELECT s_amazon, 'cl', 'Chile', '🇨🇱', 0.60, true, 110 WHERE s_amazon IS NOT NULL
  UNION ALL SELECT s_netflix, 'cl', 'Chile', '🇨🇱', 0.70, true, 110 WHERE s_netflix IS NOT NULL
  UNION ALL SELECT s_uber, 'cl', 'Chile', '🇨🇱', 0.50, true, 110 WHERE s_uber IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO verification_country_prices (service_id, country_code, country_name, country_flag, price, is_active, sort_order)
  SELECT s_telegram, 'pe', 'Perú', '🇵🇪', 0.40, true, 111 WHERE s_telegram IS NOT NULL
  UNION ALL SELECT s_whatsapp, 'pe', 'Perú', '🇵🇪', 0.40, true, 111 WHERE s_whatsapp IS NOT NULL
  UNION ALL SELECT s_google, 'pe', 'Perú', '🇵🇪', 0.50, true, 111 WHERE s_google IS NOT NULL
  UNION ALL SELECT s_facebook, 'pe', 'Perú', '🇵🇪', 0.50, true, 111 WHERE s_facebook IS NOT NULL
  UNION ALL SELECT s_instagram, 'pe', 'Perú', '🇵🇪', 0.50, true, 111 WHERE s_instagram IS NOT NULL
  UNION ALL SELECT s_tiktok, 'pe', 'Perú', '🇵🇪', 0.60, true, 111 WHERE s_tiktok IS NOT NULL
  UNION ALL SELECT s_discord, 'pe', 'Perú', '🇵🇪', 0.40, true, 111 WHERE s_discord IS NOT NULL
  UNION ALL SELECT s_microsoft, 'pe', 'Perú', '🇵🇪', 0.60, true, 111 WHERE s_microsoft IS NOT NULL
  UNION ALL SELECT s_apple, 'pe', 'Perú', '🇵🇪', 0.70, true, 111 WHERE s_apple IS NOT NULL
  UNION ALL SELECT s_amazon, 'pe', 'Perú', '🇵🇪', 0.60, true, 111 WHERE s_amazon IS NOT NULL
  UNION ALL SELECT s_netflix, 'pe', 'Perú', '🇵🇪', 0.70, true, 111 WHERE s_netflix IS NOT NULL
  UNION ALL SELECT s_uber, 'pe', 'Perú', '🇵🇪', 0.50, true, 111 WHERE s_uber IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO verification_country_prices (service_id, country_code, country_name, country_flag, price, is_active, sort_order)
  SELECT s_telegram, 'il', 'Israel', '🇮🇱', 0.60, true, 120 WHERE s_telegram IS NOT NULL
  UNION ALL SELECT s_whatsapp, 'il', 'Israel', '🇮🇱', 0.60, true, 120 WHERE s_whatsapp IS NOT NULL
  UNION ALL SELECT s_google, 'il', 'Israel', '🇮🇱', 0.80, true, 120 WHERE s_google IS NOT NULL
  UNION ALL SELECT s_facebook, 'il', 'Israel', '🇮🇱', 0.80, true, 120 WHERE s_facebook IS NOT NULL
  UNION ALL SELECT s_instagram, 'il', 'Israel', '🇮🇱', 0.80, true, 120 WHERE s_instagram IS NOT NULL
  UNION ALL SELECT s_tiktok, 'il', 'Israel', '🇮🇱', 0.90, true, 120 WHERE s_tiktok IS NOT NULL
  UNION ALL SELECT s_discord, 'il', 'Israel', '🇮🇱', 0.60, true, 120 WHERE s_discord IS NOT NULL
  UNION ALL SELECT s_microsoft, 'il', 'Israel', '🇮🇱', 0.90, true, 120 WHERE s_microsoft IS NOT NULL
  UNION ALL SELECT s_apple, 'il', 'Israel', '🇮🇱', 1.00, true, 120 WHERE s_apple IS NOT NULL
  UNION ALL SELECT s_amazon, 'il', 'Israel', '🇮🇱', 0.90, true, 120 WHERE s_amazon IS NOT NULL
  UNION ALL SELECT s_netflix, 'il', 'Israel', '🇮🇱', 1.00, true, 120 WHERE s_netflix IS NOT NULL
  UNION ALL SELECT s_uber, 'il', 'Israel', '🇮🇱', 0.80, true, 120 WHERE s_uber IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO verification_country_prices (service_id, country_code, country_name, country_flag, price, is_active, sort_order)
  SELECT s_telegram, 'cn', 'China', '🇨🇳', 0.80, true, 130 WHERE s_telegram IS NOT NULL
  UNION ALL SELECT s_whatsapp, 'cn', 'China', '🇨🇳', 0.80, true, 130 WHERE s_whatsapp IS NOT NULL
  UNION ALL SELECT s_google, 'cn', 'China', '🇨🇳', 1.00, true, 130 WHERE s_google IS NOT NULL
  UNION ALL SELECT s_facebook, 'cn', 'China', '🇨🇳', 1.00, true, 130 WHERE s_facebook IS NOT NULL
  UNION ALL SELECT s_instagram, 'cn', 'China', '🇨🇳', 1.00, true, 130 WHERE s_instagram IS NOT NULL
  UNION ALL SELECT s_tiktok, 'cn', 'China', '🇨🇳', 1.20, true, 130 WHERE s_tiktok IS NOT NULL
  UNION ALL SELECT s_discord, 'cn', 'China', '🇨🇳', 0.80, true, 130 WHERE s_discord IS NOT NULL
  UNION ALL SELECT s_microsoft, 'cn', 'China', '🇨🇳', 1.20, true, 130 WHERE s_microsoft IS NOT NULL
  UNION ALL SELECT s_apple, 'cn', 'China', '🇨🇳', 1.50, true, 130 WHERE s_apple IS NOT NULL
  UNION ALL SELECT s_amazon, 'cn', 'China', '🇨🇳', 1.20, true, 130 WHERE s_amazon IS NOT NULL
  UNION ALL SELECT s_netflix, 'cn', 'China', '🇨🇳', 1.50, true, 130 WHERE s_netflix IS NOT NULL
  UNION ALL SELECT s_uber, 'cn', 'China', '🇨🇳', 1.00, true, 130 WHERE s_uber IS NOT NULL
  ON CONFLICT DO NOTHING;
END $$;
