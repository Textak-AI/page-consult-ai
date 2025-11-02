-- Create consultations table
CREATE TABLE public.consultations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  industry TEXT,
  goal TEXT,
  target_audience TEXT,
  challenge TEXT,
  unique_value TEXT,
  offer TEXT,
  wants_calculator BOOLEAN DEFAULT false,
  calculator_config JSONB,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own consultations" 
ON public.consultations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own consultations" 
ON public.consultations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consultations" 
ON public.consultations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own consultations" 
ON public.consultations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_consultations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_consultations_updated_at
BEFORE UPDATE ON public.consultations
FOR EACH ROW
EXECUTE FUNCTION public.update_consultations_updated_at();