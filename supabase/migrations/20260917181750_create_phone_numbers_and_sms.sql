/*
# Create phone_numbers and sms_messages tables

1. New Tables
- `phone_numbers`: Stores virtual phone numbers (free and paid) available for receiving SMS.
  - id (uuid, primary key)
  - number (text, unique) — the phone number in international format
  - country_code (text) — ISO country code (e.g. "US", "GB", "FR")
  - country_name (text) — human-readable country name
  - country_flag (text) — emoji flag
  - type (text) — "free" or "paid"
  - is_active (boolean) — whether the number is currently available
  - received_count (int) — total SMS received on this number
  - last_sms_at (timestamptz) — timestamp of most recent SMS
  - created_at (timestamptz)
- `sms_messages`: Stores individual SMS messages received on a phone number.
  - id (uuid, primary key)
  - phone_number_id (uuid, FK to phone_numbers, ON DELETE CASCADE)
  - sender (text) — the sender phone number or name
  - message (text) — the SMS content
  - received_at (timestamptz) — when the SMS was received

2. Security
- Enable RLS on both tables.
- Allow anon + authenticated SELECT (public data, no sign-in required).
- Allow anon + authenticated INSERT on sms_messages (simulating receiving SMS).
- No UPDATE or DELETE needed.

3. Important Notes
- This is a single-tenant, no-auth application. All data is intentionally public.
- USING (true) is acceptable because the data is shared/public by design.
*/

CREATE TABLE IF NOT EXISTS phone_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text UNIQUE NOT NULL,
  country_code text NOT NULL,
  country_name text NOT NULL,
  country_flag text NOT NULL,
  type text NOT NULL DEFAULT 'free' CHECK (type IN ('free', 'paid')),
  is_active boolean NOT NULL DEFAULT true,
  received_count int NOT NULL DEFAULT 0,
  last_sms_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sms_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number_id uuid NOT NULL REFERENCES phone_numbers(id) ON DELETE CASCADE,
  sender text NOT NULL,
  message text NOT NULL,
  received_at timestamptz DEFAULT now()
);

ALTER TABLE phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;

-- phone_numbers: public read
DROP POLICY IF EXISTS "anon_select_phone_numbers" ON phone_numbers;
CREATE POLICY "anon_select_phone_numbers" ON phone_numbers FOR SELECT
  TO anon, authenticated USING (true);

-- sms_messages: public read
DROP POLICY IF EXISTS "anon_select_sms_messages" ON sms_messages;
CREATE POLICY "anon_select_sms_messages" ON sms_messages FOR SELECT
  TO anon, authenticated USING (true);

-- sms_messages: public insert (simulating receiving SMS)
DROP POLICY IF EXISTS "anon_insert_sms_messages" ON sms_messages;
CREATE POLICY "anon_insert_sms_messages" ON sms_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Index for querying SMS by phone number, ordered by recency
CREATE INDEX IF NOT EXISTS idx_sms_messages_phone_number_id ON sms_messages(phone_number_id);
CREATE INDEX IF NOT EXISTS idx_sms_messages_received_at ON sms_messages(received_at DESC);
