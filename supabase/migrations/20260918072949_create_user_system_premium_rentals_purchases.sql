/*
# Create profiles, premium_number_rentals, and purchases tables

## Purpose
Adds user accounts, premium number rentals, and purchase tracking for the paid numbers feature.
Also sets up an admin role system using raw_app_meta_data.

## New Tables

### profiles
- `id` (uuid, PK, references auth.users) — one row per user
- `email` (text) — denormalized for convenience
- `is_admin` (boolean, default false) — admin flag
- `credits` (int, default 0) — virtual credits for purchasing numbers
- `created_at` (timestamptz)

### premium_number_rentals
- `id` (uuid, PK)
- `phone_number_id` (uuid, FK to phone_numbers) — which number is rented
- `user_id` (uuid, FK to auth.users) — who rented it
- `status` (text: 'active', 'expired', 'cancelled') — rental status
- `duration_hours` (int) — how long the rental lasts
- `price` (numeric) — price paid
- `expires_at` (timestamptz) — when the rental expires
- `created_at` (timestamptz)

### purchases
- `id` (uuid, PK)
- `user_id` (uuid, FK to auth.users) — who made the purchase
- `phone_number_id` (uuid, FK to phone_numbers, nullable) — which number (if any)
- `type` (text: 'number_rental', 'credits') — purchase type
- `amount` (numeric) — amount paid
- `credits_purchased` (int, default 0) — credits bought (if credits type)
- `status` (text: 'pending', 'completed', 'failed') — payment status
- `created_at` (timestamptz)

## Security
- profiles: RLS enabled, users see only their own row, admin can see all.
- premium_number_rentals: RLS enabled, users see their own rentals, admin sees all.
- purchases: RLS enabled, users see their own purchases, admin sees all.
- phone_numbers: added admin UPDATE/INSERT/DELETE policies.
- A SECURITY DEFINER function `is_admin()` checks the JWT app_metadata.
- A trigger auto-creates a profile row on signup.
*/

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  is_admin boolean NOT NULL DEFAULT false,
  credits int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. PREMIUM NUMBER RENTALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS premium_number_rentals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number_id uuid NOT NULL REFERENCES phone_numbers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  duration_hours int NOT NULL DEFAULT 24,
  price numeric(10,2) NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE premium_number_rentals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_rentals" ON premium_number_rentals;
CREATE POLICY "select_own_rentals" ON premium_number_rentals FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_rentals" ON premium_number_rentals;
CREATE POLICY "insert_own_rentals" ON premium_number_rentals FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_rentals" ON premium_number_rentals;
CREATE POLICY "update_own_rentals" ON premium_number_rentals FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 3. PURCHASES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number_id uuid REFERENCES phone_numbers(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('number_rental', 'credits')),
  amount numeric(10,2) NOT NULL DEFAULT 0,
  credits_purchased int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_purchases" ON purchases;
CREATE POLICY "select_own_purchases" ON purchases FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_purchases" ON purchases;
CREATE POLICY "insert_own_purchases" ON purchases FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_purchases" ON purchases;
CREATE POLICY "update_own_purchases" ON purchases FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 4. ADMIN HELPER FUNCTION (SECURITY DEFINER)
-- ============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean,
    false
  );
$$;

-- ============================================
-- 5. AUTO-CREATE PROFILE ON SIGNUP (SECURITY DEFINER)
-- ============================================
CREATE OR REPLACE FUNCTION create_profile_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_on_signup();

-- ============================================
-- 6. ADMIN POLICIES FOR PROFILES
-- ============================================
DROP POLICY IF EXISTS "admin_select_all_profiles" ON profiles;
CREATE POLICY "admin_select_all_profiles" ON profiles FOR SELECT
  TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admin_update_all_profiles" ON profiles;
CREATE POLICY "admin_update_all_profiles" ON profiles FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ============================================
-- 7. ADMIN POLICIES FOR PREMIUM RENTALS
-- ============================================
DROP POLICY IF EXISTS "admin_select_all_rentals" ON premium_number_rentals;
CREATE POLICY "admin_select_all_rentals" ON premium_number_rentals FOR SELECT
  TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admin_update_all_rentals" ON premium_number_rentals;
CREATE POLICY "admin_update_all_rentals" ON premium_number_rentals FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ============================================
-- 8. ADMIN POLICIES FOR PURCHASES
-- ============================================
DROP POLICY IF EXISTS "admin_select_all_purchases" ON purchases;
CREATE POLICY "admin_select_all_purchases" ON purchases FOR SELECT
  TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admin_update_all_purchases" ON purchases;
CREATE POLICY "admin_update_all_purchases" ON purchases FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ============================================
-- 9. ADMIN POLICIES FOR PHONE NUMBERS
-- ============================================
DROP POLICY IF EXISTS "admin_update_phone_numbers" ON phone_numbers;
CREATE POLICY "admin_update_phone_numbers" ON phone_numbers FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_insert_phone_numbers" ON phone_numbers;
CREATE POLICY "admin_insert_phone_numbers" ON phone_numbers FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_phone_numbers" ON phone_numbers;
CREATE POLICY "admin_delete_phone_numbers" ON phone_numbers FOR DELETE
  TO authenticated USING (is_admin());

-- ============================================
-- 10. INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_rentals_user_id ON premium_number_rentals(user_id);
CREATE INDEX IF NOT EXISTS idx_rentals_phone_number_id ON premium_number_rentals(phone_number_id);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON premium_number_rentals(status);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
