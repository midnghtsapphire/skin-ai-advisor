-- Fix the overly permissive affiliate clicks policy
-- Remove the permissive policy
DROP POLICY IF EXISTS "Anyone can create affiliate clicks" ON public.affiliate_clicks;

-- Create a more secure policy - allow authenticated users or track anonymous via session
CREATE POLICY "Authenticated users can create affiliate clicks" ON public.affiliate_clicks 
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR user_id IS NULL);

-- Allow reading own clicks
CREATE POLICY "Users can view their own clicks" ON public.affiliate_clicks 
    FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);