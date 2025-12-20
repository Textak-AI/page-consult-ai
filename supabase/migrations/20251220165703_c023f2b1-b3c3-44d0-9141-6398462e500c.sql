-- Beta pages configuration
CREATE TABLE public.beta_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
  
  page_type VARCHAR(50) DEFAULT 'waitlist',
  launch_stage VARCHAR(50),
  launch_date TIMESTAMP WITH TIME ZONE,
  launch_channels TEXT[],
  
  signup_goal INTEGER DEFAULT 1000,
  max_signups INTEGER,
  
  referral_enabled BOOLEAN DEFAULT false,
  reward_tiers JSONB DEFAULT '[]'::jsonb,
  
  perks TEXT[],
  scarcity_type VARCHAR(50),
  scarcity_value INTEGER,
  
  total_signups INTEGER DEFAULT 0,
  
  status VARCHAR(20) DEFAULT 'draft',
  published_url VARCHAR(255),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Waitlist signups (public table for anonymous signups)
CREATE TABLE public.beta_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES public.beta_pages(id) ON DELETE CASCADE NOT NULL,
  
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  referred_by VARCHAR(20),
  referral_count INTEGER DEFAULT 0,
  
  position INTEGER,
  
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(page_id, email)
);

-- Indexes
CREATE INDEX idx_beta_signups_page ON public.beta_signups(page_id);
CREATE INDEX idx_beta_signups_referral ON public.beta_signups(referral_code);
CREATE INDEX idx_beta_signups_referred_by ON public.beta_signups(referred_by);
CREATE INDEX idx_beta_pages_user ON public.beta_pages(user_id);
CREATE INDEX idx_beta_pages_status ON public.beta_pages(status);

-- Auto-increment position trigger
CREATE OR REPLACE FUNCTION public.set_signup_position()
RETURNS TRIGGER AS $$
BEGIN
  NEW.position := (SELECT COALESCE(MAX(position), 0) + 1 FROM public.beta_signups WHERE page_id = NEW.page_id);
  UPDATE public.beta_pages SET total_signups = total_signups + 1, updated_at = NOW() WHERE id = NEW.page_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_set_signup_position
  BEFORE INSERT ON public.beta_signups
  FOR EACH ROW EXECUTE FUNCTION public.set_signup_position();

-- Update referral count when someone uses a referral code
CREATE OR REPLACE FUNCTION public.update_referral_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referred_by IS NOT NULL THEN
    UPDATE public.beta_signups 
    SET referral_count = referral_count + 1 
    WHERE referral_code = NEW.referred_by;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_referral_count
  AFTER INSERT ON public.beta_signups
  FOR EACH ROW EXECUTE FUNCTION public.update_referral_count();

-- Enable RLS
ALTER TABLE public.beta_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beta_signups ENABLE ROW LEVEL SECURITY;

-- Beta pages policies (owner access)
CREATE POLICY "Users can view their own beta pages"
  ON public.beta_pages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own beta pages"
  ON public.beta_pages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own beta pages"
  ON public.beta_pages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own beta pages"
  ON public.beta_pages FOR DELETE
  USING (auth.uid() = user_id);

-- Published beta pages are publicly viewable
CREATE POLICY "Published beta pages are public"
  ON public.beta_pages FOR SELECT
  USING (status = 'published');

-- Beta signups policies (anyone can signup to published pages)
CREATE POLICY "Anyone can view signups for published pages"
  ON public.beta_signups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.beta_pages 
      WHERE id = beta_signups.page_id 
      AND status = 'published'
    )
  );

CREATE POLICY "Anyone can signup to published pages"
  ON public.beta_signups FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.beta_pages 
      WHERE id = beta_signups.page_id 
      AND status = 'published'
    )
  );

-- Page owners can view all signups for their pages
CREATE POLICY "Page owners can view their signups"
  ON public.beta_signups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.beta_pages 
      WHERE id = beta_signups.page_id 
      AND user_id = auth.uid()
    )
  );

-- Page owners can manage signups
CREATE POLICY "Page owners can delete signups"
  ON public.beta_signups FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.beta_pages 
      WHERE id = beta_signups.page_id 
      AND user_id = auth.uid()
    )
  );

-- Enable realtime for signups
ALTER PUBLICATION supabase_realtime ADD TABLE public.beta_signups;