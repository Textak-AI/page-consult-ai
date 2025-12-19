-- Add ai_seo_data column to consultations table
ALTER TABLE public.consultations 
ADD COLUMN ai_seo_data JSONB DEFAULT NULL;