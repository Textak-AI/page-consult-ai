-- Add signature_type column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS signature_type TEXT DEFAULT 'simple' CHECK (signature_type IN ('simple', 'html'));

-- Rename custom_signature_html to signature_html for consistency
ALTER TABLE public.profiles 
RENAME COLUMN custom_signature_html TO signature_html;