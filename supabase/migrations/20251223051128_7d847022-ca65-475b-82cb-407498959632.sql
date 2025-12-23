-- Create table for caching hero images
CREATE TABLE public.hero_image_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  images TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hero_image_cache ENABLE ROW LEVEL SECURITY;

-- Allow public read access for cached images
CREATE POLICY "Anyone can read cached hero images"
ON public.hero_image_cache
FOR SELECT
USING (true);

-- Allow authenticated users to insert/update cache
CREATE POLICY "Authenticated users can insert cache"
ON public.hero_image_cache
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update cache"
ON public.hero_image_cache
FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Create index for cache_key lookups
CREATE INDEX idx_hero_image_cache_key ON public.hero_image_cache(cache_key);

-- Create trigger for updated_at
CREATE TRIGGER update_hero_image_cache_updated_at
BEFORE UPDATE ON public.hero_image_cache
FOR EACH ROW
EXECUTE FUNCTION public.update_consultations_updated_at();