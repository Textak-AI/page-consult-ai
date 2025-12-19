import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Globe, Sparkles, Building2, Users, Trophy, Target, CheckCircle2, Loader2, ExternalLink, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { AIWorkingLoader } from '@/components/editor/AIWorkingLoader';
import type { AISeoData } from '@/services/intelligence/types';

export interface ConsultationData {
  // Website Intelligence
  websiteUrl?: string;
  websiteIntelligence?: {
    logoUrl: string | null;
    brandColors: string[];
    title: string | null;
    tagline: string | null;
    description: string | null;
    heroText: string | null;
    testimonials: string[];
    companyName: string | null;
  };
  
  // Business Identity
  businessName: string;
  industry: string;
  industryOther?: string;
  yearsInBusiness: string;
  uniqueStrength: string;
  
  // Target Audience
  idealClient: string;
  clientFrustration: string;
  desiredOutcome: string;
  
  // Credibility
  clientCount: string;
  achievements: string;
  testimonialText: string;
  
  // Offer Details
  mainOffer: string;
  offerIncludes: string;
  investmentRange: string;
  processDescription: string;
  
  // Page Goals
  primaryGoal: string;
  ctaText: string;
  objectionsToOvercome: string;
}

const STEPS = [
  { id: 'website', title: 'Your Website', icon: Globe },
  { id: 'identity', title: 'Business Identity', icon: Building2 },
  { id: 'audience', title: 'Target Audience', icon: Users },
  { id: 'credibility', title: 'Credibility', icon: Trophy },
  { id: 'offer', title: 'Your Offer', icon: Target },
  { id: 'goals', title: 'Page Goals', icon: CheckCircle2 },
];

const INDUSTRIES = [
  'B2B SaaS / Software',
  'Professional Services',
  'Healthcare / Medical',
  'Real Estate',
  'Legal Services',
  'Financial Services',
  'E-commerce / Retail',
  'Food & Beverage',
  'Fitness / Wellness',
  'Education / Coaching',
  'Agency / Creative',
  'Manufacturing / Industrial',
  'Events / Entertainment',
  'Other'
];

const INVESTMENT_RANGES = [
  'Under $500',
  '$500 - $2,000',
  '$2,000 - $5,000',
  '$5,000 - $10,000',
  '$10,000 - $25,000',
  '$25,000+',
  'Custom / Varies'
];

const PRIMARY_GOALS = [
  { value: 'leads', label: 'Generate Leads', desc: 'Capture contact info via form' },
  { value: 'calls', label: 'Phone Calls', desc: 'Get prospects to call you' },
  { value: 'meetings', label: 'Book Meetings', desc: 'Schedule consultations/demos' },
  { value: 'sales', label: 'Direct Sales', desc: 'Sell product/service directly' },
];

// Prefill data from landing demo
interface PrefillData {
  extracted?: {
    industry?: string | null;
    audience?: string | null;
    valueProp?: string | null;
    businessType?: 'B2B' | 'B2C' | 'Both' | null;
  };
  market?: {
    marketSize?: string | null;
    buyerPersona?: string | null;
    commonObjections?: string[];
    industryInsights?: string[];
  };
  email?: string | null;
  source?: string;
}

interface Props {
  onComplete: (data: ConsultationData, strategyBrief: string, aiSeoData?: AISeoData | null) => void;
  onBack?: () => void;
  prefillData?: PrefillData | null;
}

export function StrategicConsultation({ onComplete, onBack, prefillData }: Props) {
  // Initialize data with prefill values if available
  const getInitialData = (): Partial<ConsultationData> => {
    if (!prefillData?.extracted) return {};
    
    const initial: Partial<ConsultationData> = {};
    
    // Map industry from demo extraction
    if (prefillData.extracted.industry) {
      // Try to match to our industry list
      const matchedIndustry = INDUSTRIES.find(
        ind => ind.toLowerCase().includes(prefillData.extracted!.industry!.toLowerCase())
      );
      if (matchedIndustry) {
        initial.industry = matchedIndustry;
      } else {
        initial.industry = 'Other';
        initial.industryOther = prefillData.extracted.industry;
      }
    }
    
    // Map audience
    if (prefillData.extracted.audience) {
      initial.idealClient = prefillData.extracted.audience;
    }
    
    // Map value prop to unique strength
    if (prefillData.extracted.valueProp) {
      initial.uniqueStrength = prefillData.extracted.valueProp;
    }
    
    // Map buyer persona to desired outcome if available
    if (prefillData.market?.buyerPersona) {
      initial.desiredOutcome = prefillData.market.buyerPersona;
    }
    
    // Map common objections
    if (prefillData.market?.commonObjections?.length) {
      initial.objectionsToOvercome = prefillData.market.commonObjections.join('; ');
    }
    
    return initial;
  };

  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Partial<ConsultationData>>(getInitialData);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [pendingRestore, setPendingRestore] = useState<{
    savedStep: number;
    savedData: Partial<ConsultationData>;
  } | null>(null);

  // Restore progress on mount
  useEffect(() => {
    const saved = localStorage.getItem('pageconsult_consultation_draft');
    if (saved) {
      try {
        const { currentStep: savedStep, data: savedData, timestamp } = JSON.parse(saved);
        
        // Only restore if less than 24 hours old and has meaningful data
        const isRecent = Date.now() - timestamp < 24 * 60 * 60 * 1000;
        const hasMeaningfulData = savedData.businessName || savedData.industry || savedData.idealClient;
        
        if (isRecent && hasMeaningfulData) {
          setShowRestorePrompt(true);
          setPendingRestore({ savedStep, savedData });
        } else {
          // Clear stale data
          localStorage.removeItem('pageconsult_consultation_draft');
        }
      } catch (e) {
        console.warn('Failed to parse saved consultation:', e);
        localStorage.removeItem('pageconsult_consultation_draft');
      }
    }
  }, []);

  // Save progress whenever data or step changes
  useEffect(() => {
    if (Object.keys(data).length > 0) {
      localStorage.setItem('pageconsult_consultation_draft', JSON.stringify({
        currentStep,
        data,
        timestamp: Date.now()
      }));
      console.log('💾 Consultation progress saved');
    }
  }, [currentStep, data]);

  const updateData = (updates: Partial<ConsultationData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const handleWebsiteAnalysis = async () => {
    if (!data.websiteUrl) return;
    
    setIsAnalyzing(true);
    setAnalyzeError(null);
    
    try {
      const { data: result, error } = await supabase.functions.invoke('extract-website-intelligence', {
        body: { url: data.websiteUrl }
      });
      
      if (error) throw error;
      
      if (result.success && result.data) {
        updateData({
          websiteIntelligence: result.data,
          businessName: result.data.companyName || data.businessName || ''
        });
      } else {
        setAnalyzeError(result.error || 'Could not analyze website');
      }
    } catch (err) {
      console.error('Website analysis error:', err);
      setAnalyzeError('Failed to analyze website. You can continue manually.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const canProceed = () => {
    switch (STEPS[currentStep].id) {
      case 'website':
        return true; // Optional step
      case 'identity':
        return data.businessName && data.industry && data.uniqueStrength;
      case 'audience':
        return data.idealClient && data.clientFrustration && data.desiredOutcome;
      case 'credibility':
        return true; // All optional
      case 'offer':
        return data.mainOffer && data.offerIncludes;
      case 'goals':
        return data.primaryGoal && data.ctaText;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - generate strategy brief
      await generateStrategyBrief();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else if (onBack) {
      onBack();
    }
  };

  const generateStrategyBrief = async () => {
    setIsGeneratingBrief(true);
    
    try {
      // Generate strategy brief and extract AI SEO data in parallel
      const [briefResult, seoResult] = await Promise.all([
        supabase.functions.invoke('generate-strategy-brief', {
          body: { consultationData: data }
        }),
        supabase.functions.invoke('extract-ai-seo-data', {
          body: { consultationId: 'temp-' + Date.now(), consultationData: data }
        })
      ]);
      
      if (briefResult.error) throw briefResult.error;
      
      // Extract AI SEO data (non-blocking if it fails)
      let aiSeoData: AISeoData | null = null;
      if (seoResult.data?.success && seoResult.data?.aiSeoData) {
        aiSeoData = seoResult.data.aiSeoData;
        console.log('🔍 AI SEO data extracted:', aiSeoData.entity?.type);
      } else if (seoResult.error) {
        console.warn('⚠️ AI SEO extraction failed:', seoResult.error);
      }
      
      // Clear the draft since consultation is complete
      localStorage.removeItem('pageconsult_consultation_draft');
      console.log('🗑️ Cleared consultation draft');
      
      onComplete(data as ConsultationData, briefResult.data.strategyBrief, aiSeoData);
    } catch (err) {
      console.error('Strategy brief generation error:', err);
      // Fallback: proceed with basic brief
      const fallbackBrief = generateFallbackBrief(data as ConsultationData);
      
      // Clear the draft since consultation is complete
      localStorage.removeItem('pageconsult_consultation_draft');
      console.log('🗑️ Cleared consultation draft');
      
      onComplete(data as ConsultationData, fallbackBrief, null);
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  const generateFallbackBrief = (d: ConsultationData): string => {
    return `
# Strategy Brief for ${d.businessName}

## Target Audience
${d.idealClient}

## Core Value Proposition
${d.uniqueStrength}

## Key Pain Point Addressed
${d.clientFrustration}

## Desired Outcome
${d.desiredOutcome}

## Primary Goal
${d.primaryGoal}

## Call to Action
${d.ctaText}
    `.trim();
  };

  const renderStepContent = () => {
    const step = STEPS[currentStep];
    
    switch (step.id) {
      case 'website':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Let's Start With Your Brand</h2>
              <p className="text-muted-foreground">Have a website? I'll pull your branding automatically.</p>
            </div>
            
            <div className="space-y-5">
              <Label htmlFor="websiteUrl" className="text-muted-foreground">Website URL (optional)</Label>
              <div className="flex gap-3">
                <Input
                  id="websiteUrl"
                  placeholder="yourwebsite.com"
                  value={data.websiteUrl || ''}
                  onChange={(e) => updateData({ websiteUrl: e.target.value })}
                  className="flex-1 bg-background/50 border-border text-foreground"
                />
                <Button
                  onClick={handleWebsiteAnalysis}
                  disabled={!data.websiteUrl || isAnalyzing}
                  variant="outline"
                  className="border-border"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Analyze
                    </>
                  )}
                </Button>
              </div>
              
              {analyzeError && (
                <p className="text-sm text-amber-400">{analyzeError}</p>
              )}
              
              {data.websiteIntelligence && (
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Here's what I found:</span>
                  </div>
                  
                  {data.websiteIntelligence.logoUrl && (
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground text-sm">Logo:</span>
                      <img 
                        src={data.websiteIntelligence.logoUrl} 
                        alt="Logo" 
                        className="h-8 max-w-[120px] object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  {data.websiteIntelligence.brandColors.length > 0 && (
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground text-sm">Colors:</span>
                      <div className="flex gap-1">
                        {data.websiteIntelligence.brandColors.slice(0, 4).map((color, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded border border-border"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {data.websiteIntelligence.tagline && (
                    <div>
                      <span className="text-muted-foreground text-sm">Tagline:</span>
                      <p className="text-foreground mt-1">"{data.websiteIntelligence.tagline}"</p>
                    </div>
                  )}
                  
                  {data.websiteIntelligence.description && (
                    <div>
                      <span className="text-muted-foreground text-sm">About:</span>
                      <p className="text-muted-foreground text-sm mt-1">{data.websiteIntelligence.description}</p>
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-sm text-muted-foreground/70">
                No website yet? No problem — skip this step and we'll build everything fresh.
              </p>
            </div>
          </div>
        );

      case 'identity':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Tell Me About Your Business</h2>
              <p className="text-muted-foreground">The foundation for your landing page strategy.</p>
            </div>
            
            <div className="space-y-5">
              <div>
                <Label htmlFor="businessName" className="text-muted-foreground">Business Name *</Label>
                <Input
                  id="businessName"
                  placeholder="e.g., Acme Solutions"
                  value={data.businessName || ''}
                  onChange={(e) => updateData({ businessName: e.target.value })}
                  className="mt-2 bg-background/50 border-border text-foreground"
                />
              </div>
              
              <div>
                <Label htmlFor="industry" className="text-muted-foreground">Industry *</Label>
                <select
                  id="industry"
                  value={data.industry || ''}
                  onChange={(e) => updateData({ industry: e.target.value })}
                  className="mt-2 w-full bg-background/50 border border-border text-foreground rounded-lg px-4 py-3"
                >
                  <option value="">Select your industry...</option>
                  {INDUSTRIES.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
                {data.industry === 'Other' && (
                  <Input
                    placeholder="Specify your industry"
                    value={data.industryOther || ''}
                    onChange={(e) => updateData({ industryOther: e.target.value })}
                    className="mt-2 bg-background/50 border-border text-foreground"
                  />
                )}
              </div>
              
              <div>
                <Label htmlFor="yearsInBusiness" className="text-muted-foreground">Years in Business</Label>
                <Input
                  id="yearsInBusiness"
                  placeholder="e.g., 5 years, Since 2015, Just started"
                  value={data.yearsInBusiness || ''}
                  onChange={(e) => updateData({ yearsInBusiness: e.target.value })}
                  className="mt-2 bg-background/50 border-border text-foreground"
                />
              </div>
              
              <div>
                <Label htmlFor="uniqueStrength" className="text-muted-foreground">
                  What's the ONE thing you do better than anyone else? *
                </Label>
                <Textarea
                  id="uniqueStrength"
                  placeholder="e.g., We're the only agency that guarantees 10x ROI on ad spend within 90 days or your money back..."
                  value={data.uniqueStrength || ''}
                  onChange={(e) => updateData({ uniqueStrength: e.target.value })}
                  className="mt-2 bg-background/50 border-border text-foreground min-h-[100px]"
                />
              </div>
            </div>
          </div>
        );

      case 'audience':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Who Are You Trying to Reach?</h2>
              <p className="text-muted-foreground">Understanding your audience shapes everything.</p>
            </div>
            
            <div className="space-y-5">
              <div>
                <Label htmlFor="idealClient" className="text-muted-foreground">
                  Describe your ideal client in detail *
                </Label>
                <Textarea
                  id="idealClient"
                  placeholder="e.g., Wedding planners at mid-to-high-end venues who manage 20+ events per year and value reliability over price..."
                  value={data.idealClient || ''}
                  onChange={(e) => updateData({ idealClient: e.target.value })}
                  className="mt-2 bg-background/50 border-border text-foreground min-h-[100px]"
                />
              </div>
              
              <div>
                <Label htmlFor="clientFrustration" className="text-muted-foreground">
                  What's their biggest frustration when hiring in your space? *
                </Label>
                <Textarea
                  id="clientFrustration"
                  placeholder="e.g., They're tired of vendors who don't show up on time, don't communicate well, and make them look bad to their clients..."
                  value={data.clientFrustration || ''}
                  onChange={(e) => updateData({ clientFrustration: e.target.value })}
                  className="mt-2 bg-background/50 border-border text-foreground min-h-[100px]"
                />
              </div>
              
              <div>
                <Label htmlFor="desiredOutcome" className="text-muted-foreground">
                  What outcome are they really buying? (Not your service, the result) *
                </Label>
                <Textarea
                  id="desiredOutcome"
                  placeholder="e.g., They're buying peace of mind — knowing the entertainment is handled so they can focus on everything else..."
                  value={data.desiredOutcome || ''}
                  onChange={(e) => updateData({ desiredOutcome: e.target.value })}
                  className="mt-2 bg-background/50 border-border text-foreground min-h-[100px]"
                />
              </div>
            </div>
          </div>
        );

      case 'credibility':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Your Track Record</h2>
              <p className="text-muted-foreground">Social proof that builds trust. Share what you can.</p>
            </div>
            
            <div className="space-y-5">
              <div>
                <Label htmlFor="clientCount" className="text-muted-foreground">
                  Approximately how many clients/projects have you completed?
                </Label>
                <Input
                  id="clientCount"
                  placeholder="e.g., 400+ weddings, 50 clients, 1000 projects"
                  value={data.clientCount || ''}
                  onChange={(e) => updateData({ clientCount: e.target.value })}
                  className="mt-2 bg-background/50 border-border text-foreground"
                />
              </div>
              
              <div>
                <Label htmlFor="achievements" className="text-muted-foreground">
                  Any notable achievements? (Awards, certifications, press, notable clients)
                </Label>
                <Textarea
                  id="achievements"
                  placeholder="e.g., 'Best of Weddings' award 3 years running, certified by XYZ, featured in ABC magazine..."
                  value={data.achievements || ''}
                  onChange={(e) => updateData({ achievements: e.target.value })}
                  className="mt-2 bg-background/50 border-border text-foreground min-h-[80px]"
                />
              </div>
              
              <div>
                <Label htmlFor="testimonialText" className="text-muted-foreground">
                  Paste 1-2 real testimonials, or describe what clients typically say about you
                </Label>
                <Textarea
                  id="testimonialText"
                  placeholder={'e.g., "Working with [you] was the best decision we made. They handled everything professionally and our clients loved them." - Sarah M., Event Planner'}
                  value={data.testimonialText || ''}
                  onChange={(e) => updateData({ testimonialText: e.target.value })}
                  className="mt-2 bg-background/50 border-border text-foreground min-h-[120px]"
                />
              </div>
            </div>
          </div>
        );

      case 'offer':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">What Are You Offering?</h2>
              <p className="text-muted-foreground">The specifics of what visitors will get.</p>
            </div>
            
            <div className="space-y-5">
              <div>
                <Label htmlFor="mainOffer" className="text-muted-foreground">
                  Main service or product name *
                </Label>
                <Input
                  id="mainOffer"
                  placeholder="e.g., Wedding DJ Partnership Package, Growth Marketing Audit, Custom Software Development"
                  value={data.mainOffer || ''}
                  onChange={(e) => updateData({ mainOffer: e.target.value })}
                  className="mt-2 bg-background/50 border-border text-foreground"
                />
              </div>
              
              <div>
                <Label htmlFor="offerIncludes" className="text-muted-foreground">
                  What's included? Key deliverables? *
                </Label>
                <Textarea
                  id="offerIncludes"
                  placeholder="e.g., 6 hours of coverage, backup equipment, planning consultation, custom playlist creation, MC services..."
                  value={data.offerIncludes || ''}
                  onChange={(e) => updateData({ offerIncludes: e.target.value })}
                  className="mt-2 bg-background/50 border-border text-foreground min-h-[100px]"
                />
              </div>
              
              <div>
                <Label htmlFor="investmentRange" className="text-muted-foreground">
                  Investment range
                </Label>
                <select
                  id="investmentRange"
                  value={data.investmentRange || ''}
                  onChange={(e) => updateData({ investmentRange: e.target.value })}
                  className="mt-2 w-full bg-background/50 border border-border text-foreground rounded-lg px-4 py-3"
                >
                  <option value="">Select range...</option>
                  {INVESTMENT_RANGES.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="processDescription" className="text-muted-foreground">
                  What happens after they contact you? Describe your process.
                </Label>
                <Textarea
                  id="processDescription"
                  placeholder="e.g., 1) Free 15-min call to discuss needs, 2) Custom proposal within 48 hours, 3) Planning session if booked, 4) Delivery/event day"
                  value={data.processDescription || ''}
                  onChange={(e) => updateData({ processDescription: e.target.value })}
                  className="mt-2 bg-background/50 border-border text-foreground min-h-[100px]"
                />
              </div>
            </div>
          </div>
        );

      case 'goals':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">What Should This Page Achieve?</h2>
              <p className="text-muted-foreground">Final details to optimize your conversion strategy.</p>
            </div>
            
            <div className="space-y-5">
              <div>
                <Label className="text-muted-foreground">Primary goal *</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {PRIMARY_GOALS.map(goal => (
                    <button
                      key={goal.value}
                      onClick={() => updateData({ primaryGoal: goal.value })}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        data.primaryGoal === goal.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-background/50 hover:border-muted-foreground/50'
                      }`}
                    >
                      <div className="font-medium text-foreground">{goal.label}</div>
                      <div className="text-sm text-muted-foreground">{goal.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="ctaText" className="text-muted-foreground">
                  What should the main button say? *
                </Label>
                <Input
                  id="ctaText"
                  placeholder="e.g., Schedule a Consultation, Get Your Free Quote, Book a Demo"
                  value={data.ctaText || ''}
                  onChange={(e) => updateData({ ctaText: e.target.value })}
                  className="mt-2 bg-background/50 border-border text-foreground"
                />
              </div>
              
              <div>
                <Label htmlFor="objectionsToOvercome" className="text-muted-foreground">
                  Any specific objections or concerns you need to address on this page?
                </Label>
                <Textarea
                  id="objectionsToOvercome"
                  placeholder="e.g., Price concerns, trust issues with new vendors, comparison to DIY options, timing/availability concerns..."
                  value={data.objectionsToOvercome || ''}
                  onChange={(e) => updateData({ objectionsToOvercome: e.target.value })}
                  className="mt-2 bg-background/50 border-border text-foreground min-h-[80px]"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isGeneratingBrief) {
    return <AIWorkingLoader />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Restore Prompt */}
      {showRestorePrompt && pendingRestore && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-muted/80 border border-primary/30 rounded-xl p-4 mb-6"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-foreground font-medium mb-1">Continue where you left off?</h3>
              <p className="text-muted-foreground text-sm mb-3">
                You have an unfinished consultation
                {pendingRestore.savedData.businessName && ` for "${pendingRestore.savedData.businessName}"`}.
              </p>
              <div className="flex gap-3">
                <Button
                  size="sm"
                  onClick={() => {
                    setCurrentStep(pendingRestore.savedStep);
                    setData(pendingRestore.savedData);
                    setShowRestorePrompt(false);
                    setPendingRestore(null);
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  Continue
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    localStorage.removeItem('pageconsult_consultation_draft');
                    setShowRestorePrompt(false);
                    setPendingRestore(null);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Start Fresh
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={`flex items-center gap-2 ${
                  index <= currentStep ? 'text-primary' : 'text-muted-foreground/30'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    index < currentStep
                      ? 'bg-primary border-primary text-primary-foreground'
                      : index === currentStep
                      ? 'border-primary text-primary'
                      : 'border-border text-muted-foreground/30'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="text-center text-sm text-muted-foreground mt-2">
          Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-card/50 border border-border rounded-2xl p-8"
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground"
        >
          {currentStep === STEPS.length - 1 ? (
            <>
              Generate Strategy
              <Sparkles className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
