import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Sparkles, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InteractiveFinalCTAProps {
  content: {
    headline?: string;
    industryVariant?: string;
    brandColor?: string;
    interactive?: boolean;
  };
  onStartConsultation?: (data: any) => void;
}

const INDUSTRIES = [
  { value: 'consulting', label: 'Consulting / Professional Services' },
  { value: 'saas', label: 'B2B SaaS / Software' },
  { value: 'ecommerce', label: 'E-commerce / DTC' },
  { value: 'agency', label: 'Marketing Agency' },
  { value: 'coaching', label: 'Coaching / Training' },
  { value: 'other', label: 'Other' },
];

export function InteractiveFinalCTA({ content, onStartConsultation }: InteractiveFinalCTAProps) {
  const [step, setStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [preview, setPreview] = useState<{ headline: string; subheadline: string } | null>(null);
  
  const [formData, setFormData] = useState({
    businessName: '',
    industry: '',
    differentiator: '',
  });

  const brandColor = content?.brandColor || '#7C3AED';

  const handleNext = async () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      // Generate preview
      setIsGenerating(true);
      
      // Simulate AI generation (replace with actual call)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate preview based on inputs
      const headlines: Record<string, string> = {
        consulting: `${formData.businessName}: Where Strategy Meets Results`,
        saas: `${formData.businessName} — ${formData.differentiator.split(' ').slice(0, 5).join(' ')}`,
        ecommerce: `Discover ${formData.businessName}`,
        agency: `${formData.businessName}: Growth, Delivered`,
        coaching: `Transform Your Results with ${formData.businessName}`,
        other: `Welcome to ${formData.businessName}`,
      };
      
      setPreview({
        headline: headlines[formData.industry] || headlines.other,
        subheadline: formData.differentiator.length > 10 
          ? formData.differentiator 
          : 'Your custom landing page is ready to be built.',
      });
      
      setIsGenerating(false);
      setStep(3);
    }
  };

  const handleStartFull = () => {
    if (onStartConsultation) {
      onStartConsultation(formData);
    } else {
      // Navigate to /new with pre-filled data
      window.location.href = `/new?name=${encodeURIComponent(formData.businessName)}&industry=${formData.industry}`;
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 0: return formData.businessName.trim().length > 0;
      case 1: return formData.industry.length > 0;
      case 2: return formData.differentiator.trim().length > 10;
      default: return true;
    }
  };

  return (
    <section className="relative py-24 overflow-hidden bg-slate-950">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-20"
          style={{ backgroundColor: brandColor }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] opacity-15"
          style={{ backgroundColor: brandColor }}
        />
      </div>

      <div className="relative max-w-2xl mx-auto px-4">
        <div className="text-white">
          {step < 3 ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-3">
                  {step === 0 && "See What We'd Build for You"}
                  {step === 1 && "Almost there..."}
                  {step === 2 && "One more thing..."}
                </h2>
                <p className="text-lg text-slate-400">
                  Answer {3 - step} quick question{3 - step !== 1 ? 's' : ''} to see a preview
                </p>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 mb-8">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-2.5 h-2.5 rounded-full transition-all duration-300",
                      i < step ? "bg-green-500" : i === step ? "w-8" : "bg-slate-700"
                    )}
                    style={i === step ? { backgroundColor: brandColor } : undefined}
                  />
                ))}
              </div>

              {/* Question card */}
              <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-8">
                {step === 0 && (
                  <div className="space-y-4">
                    <label className="block text-lg font-medium mb-2">
                      What's your business name?
                    </label>
                    <Input
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      placeholder="e.g., Acme Consulting"
                      className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 text-lg py-6"
                      autoFocus
                    />
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <label className="block text-lg font-medium mb-2">
                      What industry are you in?
                    </label>
                    <Select
                      value={formData.industry}
                      onValueChange={(value) => setFormData({ ...formData, industry: value })}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white py-6 text-lg [&>span]:text-slate-400 data-[state=open]:border-white/40">
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        {INDUSTRIES.map((ind) => (
                          <SelectItem 
                            key={ind.value} 
                            value={ind.value}
                            className="text-white hover:bg-slate-800 focus:bg-slate-800 focus:text-white"
                          >
                            {ind.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <label className="block text-lg font-medium mb-2">
                      What's the ONE thing you do better than anyone else?
                    </label>
                    <Textarea
                      value={formData.differentiator}
                      onChange={(e) => setFormData({ ...formData, differentiator: e.target.value })}
                      placeholder="e.g., We help B2B SaaS companies reduce churn by 40% in 90 days through data-driven customer success strategies."
                      className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 min-h-[120px]"
                      autoFocus
                    />
                    <p className="text-sm text-slate-500">
                      Don't overthink it — this is just for a preview
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleNext}
                  disabled={!isStepValid() || isGenerating}
                  className="w-full mt-6 py-6 text-lg font-semibold text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: brandColor }}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating preview...
                    </>
                  ) : step === 2 ? (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Show Me My Preview
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>

              {/* Trust signals */}
              <div className="flex justify-center gap-6 mt-6 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4" /> No signup required
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4" /> See results in 30 seconds
                </span>
              </div>
            </>
          ) : (
            /* Preview result */
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 text-green-400 mb-4">
                  <Check className="w-5 h-5" />
                  Preview generated!
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  Here's what we'd create for {formData.businessName}:
                </h2>
              </div>

              {/* Preview card */}
              <div className="bg-white rounded-2xl p-8 text-slate-900 mb-8 shadow-2xl">
                <div className="border-b border-slate-200 pb-4 mb-4">
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Hero Section Preview</span>
                </div>
                <h3 
                  className="text-2xl md:text-3xl font-bold mb-3"
                  style={{ color: brandColor }}
                >
                  {preview?.headline}
                </h3>
                <p className="text-lg text-slate-600">
                  {preview?.subheadline}
                </p>
                <div className="mt-6 flex gap-3">
                  <div 
                    className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                    style={{ backgroundColor: brandColor }}
                  >
                    Your CTA Here
                  </div>
                  <div className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600">
                    Secondary Action
                  </div>
                </div>
              </div>

              {/* Upsell */}
              <div className="text-center">
                <p className="text-slate-400 mb-4">
                  This is just the headline. The full consultation creates 8 sections
                  with stats, testimonials, FAQs, and more.
                </p>
                <Button
                  onClick={handleStartFull}
                  size="lg"
                  className="py-6 px-8 text-lg font-semibold text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: brandColor }}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Build My Full Landing Page
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-sm text-slate-500 mt-3">
                  Free to start • No credit card required • ~15 minutes
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
