-- Add RLS policies for demo_leads table to allow inserts
-- The table has RLS enabled but no policies, which blocks all operations

-- Allow anyone to insert into demo_leads (for anonymous demo sessions)
CREATE POLICY "Anyone can insert demo leads"
ON public.demo_leads
FOR INSERT
WITH CHECK (true);

-- Allow service role to read/update demo leads
CREATE POLICY "Service role can read demo leads"
ON public.demo_leads
FOR SELECT
USING (true);

CREATE POLICY "Service role can update demo leads"
ON public.demo_leads
FOR UPDATE
USING (true);

-- Add RLS policies for demo_sessions table (also has no policies)
CREATE POLICY "Anyone can insert demo sessions"
ON public.demo_sessions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can read demo sessions"
ON public.demo_sessions
FOR SELECT
USING (true);

CREATE POLICY "Anyone can update demo sessions"
ON public.demo_sessions
FOR UPDATE
USING (true);

-- Add RLS policies for demo_market_cache table
CREATE POLICY "Anyone can read demo market cache"
ON public.demo_market_cache
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert demo market cache"
ON public.demo_market_cache
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update demo market cache"
ON public.demo_market_cache
FOR UPDATE
USING (true);