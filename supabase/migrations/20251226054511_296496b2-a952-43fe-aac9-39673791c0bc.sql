-- Create testimonial_requests table for tracking sent requests
CREATE TABLE public.testimonial_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  consultation_id UUID REFERENCES public.consultations(id),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  email_subject TEXT NOT NULL,
  email_body TEXT NOT NULL,
  request_page_url TEXT NOT NULL,
  status TEXT DEFAULT 'sent',
  resend_id TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  follow_up_scheduled_at TIMESTAMP WITH TIME ZONE,
  follow_up_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.testimonial_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own requests" 
ON public.testimonial_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own requests" 
ON public.testimonial_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own requests" 
ON public.testimonial_requests 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own requests" 
ON public.testimonial_requests 
FOR DELETE 
USING (auth.uid() = user_id);

-- Service role policy for edge function inserts
CREATE POLICY "Service role can insert requests" 
ON public.testimonial_requests 
FOR INSERT 
WITH CHECK (true);

-- Indexes for faster lookups
CREATE INDEX idx_testimonial_requests_user ON public.testimonial_requests(user_id);
CREATE INDEX idx_testimonial_requests_status ON public.testimonial_requests(status);