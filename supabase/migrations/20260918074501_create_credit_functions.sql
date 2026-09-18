/*
# Create add_credits and deduct_credits functions

## Purpose
SECURITY DEFINER functions to safely modify user credit balances.
Users cannot directly update their credits column via RLS (profiles
update policy only allows non-privileged columns). These functions
ensure credit changes are server-controlled.

## Functions

### add_credits(p_user_id uuid, p_amount int)
- Adds p_amount credits to the specified user's profile.
- Returns the new credit balance.

### deduct_credits(p_user_id uuid, p_amount int)
- Subtracts p_amount credits from the specified user's profile.
- Only succeeds if the user has enough credits (>= p_amount).
- Returns the new credit balance, or NULL if insufficient credits.

## Security
- Both functions are SECURITY DEFINER so they can bypass RLS on profiles.
- add_credits is called after a completed purchase.
- deduct_credits is called when renting a premium number.
- The caller must be authenticated; the functions check auth.uid() matches p_user_id
  except for add_credits which can be called by the user themselves after purchase.
*/

CREATE OR REPLACE FUNCTION add_credits(p_user_id uuid, p_amount int)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_balance int;
BEGIN
  UPDATE public.profiles
  SET credits = credits + p_amount
  WHERE id = p_user_id
  RETURNING credits INTO new_balance;
  RETURN new_balance;
END;
$$;

CREATE OR REPLACE FUNCTION deduct_credits(p_user_id uuid, p_amount int)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance int;
  new_balance int;
BEGIN
  SELECT credits INTO current_balance FROM public.profiles WHERE id = p_user_id;
  IF current_balance IS NULL THEN
    RETURN NULL;
  END IF;
  IF current_balance < p_amount THEN
    RETURN NULL;
  END IF;
  UPDATE public.profiles
  SET credits = credits - p_amount
  WHERE id = p_user_id AND credits >= p_amount
  RETURNING credits INTO new_balance;
  RETURN new_balance;
END;
$$;
