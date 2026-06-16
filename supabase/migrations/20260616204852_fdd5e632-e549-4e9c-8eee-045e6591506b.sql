DO $$
DECLARE
  uid uuid := 'e0d2c772-7635-4d7b-88f4-b84ef7d19fc1';
BEGIN
  DELETE FROM public.landing_pages WHERE user_id = uid;
  DELETE FROM public.beta_pages WHERE user_id = uid;
  DELETE FROM public.consultations WHERE user_id = uid;
  DELETE FROM public.consultation_sessions WHERE user_id = uid;
  DELETE FROM public.consultation_drafts WHERE user_id = uid;
  DELETE FROM public.persona_intelligence WHERE user_id = uid;
  DELETE FROM public.generation_logs WHERE user_id = uid;
  DELETE FROM public.usage_log WHERE user_id = uid;
  DELETE FROM public.testimonial_requests WHERE user_id = uid;
  DELETE FROM public.prospects WHERE user_id = uid;
  DELETE FROM public.prospect_pages WHERE user_id = uid;
  DELETE FROM public.brands WHERE user_id = uid;
  DELETE FROM public.brand_briefs WHERE user_id = uid;
  DELETE FROM public.intelligence_accumulator WHERE user_id = uid;
  DELETE FROM public.demo_sessions WHERE claimed_by = uid;
  DELETE FROM public.guest_sessions WHERE converted_to_user_id = uid;
END $$;