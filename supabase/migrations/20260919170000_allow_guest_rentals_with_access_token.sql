-- =======================================================
-- Allow guest rentals with access_token (No registration required)
-- =======================================================

-- 1. Modify premium_number_rentals to allow guest checkout
ALTER TABLE premium_number_rentals ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE premium_number_rentals ADD COLUMN IF NOT EXISTS access_token text UNIQUE;
ALTER TABLE premium_number_rentals ADD COLUMN IF NOT EXISTS guest_email text;

-- 2. Modify purchases to allow guest records
ALTER TABLE purchases ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS access_token text;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS guest_email text;

-- 3. RLS policies for guest access via token
DROP POLICY IF EXISTS "select_rentals_by_token" ON premium_number_rentals;
CREATE POLICY "select_rentals_by_token" ON premium_number_rentals FOR SELECT
  TO anon, authenticated USING (access_token IS NOT NULL);

DROP POLICY IF EXISTS "anon_insert_rentals_with_token" ON premium_number_rentals;
CREATE POLICY "anon_insert_rentals_with_token" ON premium_number_rentals FOR INSERT
  TO anon, authenticated WITH CHECK (access_token IS NOT NULL);

DROP POLICY IF EXISTS "anon_insert_purchases" ON purchases;
CREATE POLICY "anon_insert_purchases" ON purchases FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Indexes for lightning fast token lookups
CREATE INDEX IF NOT EXISTS idx_rentals_access_token ON premium_number_rentals(access_token);
CREATE INDEX IF NOT EXISTS idx_purchases_access_token ON purchases(access_token);
