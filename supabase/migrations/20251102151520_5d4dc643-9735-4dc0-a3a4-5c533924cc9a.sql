-- Add service_type column to consultations table
ALTER TABLE public.consultations 
ADD COLUMN service_type TEXT;