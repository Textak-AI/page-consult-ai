-- Create persona_intelligence table to store market research results
CREATE TABLE public.persona_intelligence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Research inputs
  industry TEXT,
  target_audience TEXT,
  location TEXT,
  service_type TEXT,
  
  -- Market research results (from Perplexity)
  market_research JSONB DEFAULT '{}'::jsonb,
  -- Structure: { claims: [], demographics: {}, competitors: [], pain_points: [], market_size: {} }
  
  -- Synthesized persona (from Claude)
  synthesized_persona JSONB DEFAULT '{}'::jsonb,
  -- Structure: { demographics: {}, psychographics: {}, language_patterns: [], pain_points: [], desires: [], objections: [] }
  
  -- Research metadata
  research_sources TEXT[],
  confidence_score DECIMAL(3,2),
  research_status TEXT DEFAULT 'pending' CHECK (research_status IN ('pending', 'researching', 'synthesizing', 'complete', 'failed')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create generation_logs table to track what intelligence was used
CREATE TABLE public.generation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE,
  persona_intelligence_id UUID REFERENCES public.persona_intelligence(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  
  -- Generation tracking
  generation_type TEXT NOT NULL CHECK (generation_type IN ('headline', 'subheadline', 'features', 'problem', 'solution', 'cta', 'full_page')),
  
  -- Input data used
  input_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Intelligence references (which specific insights were used)
  intelligence_used JSONB DEFAULT '{}'::jsonb,
  -- Structure: { market_claims: [], persona_insights: [], pain_points_referenced: [] }
  
  -- Output
  generated_content JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Quality metrics
  confidence_score DECIMAL(3,2),
  regeneration_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.persona_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for persona_intelligence
CREATE POLICY "Users can view their own intelligence" 
ON public.persona_intelligence 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own intelligence" 
ON public.persona_intelligence 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own intelligence" 
ON public.persona_intelligence 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own intelligence" 
ON public.persona_intelligence 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for generation_logs
CREATE POLICY "Users can view their own generation logs" 
ON public.generation_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own generation logs" 
ON public.generation_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_persona_intelligence_consultation ON public.persona_intelligence(consultation_id);
CREATE INDEX idx_persona_intelligence_user ON public.persona_intelligence(user_id);
CREATE INDEX idx_generation_logs_consultation ON public.generation_logs(consultation_id);
CREATE INDEX idx_generation_logs_persona ON public.generation_logs(persona_intelligence_id);

-- Create trigger for updated_at
CREATE TRIGGER update_persona_intelligence_updated_at
BEFORE UPDATE ON public.persona_intelligence
FOR EACH ROW
EXECUTE FUNCTION public.update_consultations_updated_at();