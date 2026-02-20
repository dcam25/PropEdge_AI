-- Allow users to insert/update their own stripe_customers row (for charge-balance, invoices fallback)
CREATE POLICY "Users can insert own stripe" ON public.stripe_customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stripe" ON public.stripe_customers
  FOR UPDATE USING (auth.uid() = user_id);
