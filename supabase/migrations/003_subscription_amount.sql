-- Store subscription price per user (in cents)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_amount_cents INT;
