-- Add UNIQUE constraint on guest_session_id for upsert on_conflict to work
-- First, handle any potential duplicates by keeping only the most recent
DELETE FROM public.consultations a USING public.consultations b
WHERE a.id < b.id 
AND a.guest_session_id IS NOT NULL 
AND a.guest_session_id = b.guest_session_id;

-- Now add the unique constraint
ALTER TABLE public.consultations 
ADD CONSTRAINT consultations_guest_session_id_unique UNIQUE (guest_session_id);