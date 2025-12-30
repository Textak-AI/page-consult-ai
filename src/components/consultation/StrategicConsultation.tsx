import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Globe, Sparkles, Building2, Users, Trophy, Target, CheckCircle2, Loader2, ExternalLink, RotateCcw, Palette, FileText, TrendingUp, UserCheck, Rocket, Calendar, Gift, Share2, Check, Save } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { IndustrySelector } from './IndustrySelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { AIWorkingLoader } from '@/components/editor/AIWorkingLoader';
import { QuestionExplainer, QUESTION_EXPLAINERS } from './QuestionExplainer';
import type { AISeoData } from '@/services/intelligence/types';
import { BrandCustomization, type BrandSettings, type WebsiteIntelligence } from './BrandCustomization';
import { CollapsibleBriefPanel } from './CollapsibleBriefPanel';
import { useBrandBrief } from '@/hooks/useBrandBrief';
import { AmbientHeroBackground } from './AmbientHeroBackground';
import { generateHeroImages, regenerateHeroImages, generateCombinedHeroImages, regenerateCombinedHeroImages, type HeroImage } from '@/lib/heroImages';
import { 
  PageTypeStep, 
  PAGE_TYPES, 
  type PageTypeId,
  InvestorProfileStep,
  type InvestorProfileData,
  TractionMilestonesStep,
  type TractionMilestonesData,
  InvestmentOpportunityStep,
  type InvestmentOpportunityData,
  TeamAdvisorsStep,
  type TeamAdvisorsData
} from './steps';
import {
  BetaStageStep,
  BetaTimelineStep,
  BetaPerksStep,
  BetaViralStep,
  type RewardTier
} from './beta';
import { useDevMode } from '@/components/dev/DevToolbar';

export interface ConsultationData {
  // Page Type
  pageType?: PageTypeId;
  
  // Website Intelligence
  websiteUrl?: string;
  websiteIntelligence?: {
    logoUrl: string | null;
    brandColors: string[];
    primaryColor?: string | null;
    secondaryColor?: string | null;
    title: string | null;
    tagline: string | null;
    description: string | null;
    heroText: string | null;
    testimonials: string[];
    companyName: string | null;
  };
  
  // Brand Settings (from BrandCustomization step)
  brandSettings?: {
    logoUrl: string | null;
    primaryColor: string;
    secondaryColor: string;
    headingFont: string;
    bodyFont: string;
    modified: boolean;
  };
  
  // Business Identity
  businessName: string;
  productName?: string;
  industry: string;
  industryCategory?: string;
  industrySubcategory?: string;
  industryOther?: string;
  yearsInBusiness: string;
  uniqueStrength: string;
  
  // NEW: Identity Sentence (how you describe yourself to peers)
  identitySentence?: string;
  
  // Target Audience (Customer Acquisition flow)
  idealClient: string;
  clientFrustration: string;
  desiredOutcome: string;
  
  // Credibility (Customer Acquisition flow)
  clientCount: string;
  achievements: string;
  testimonialText: string;
  
  // NEW: Concrete Proof Story
  concreteProofStory?: string;
  proofStoryContext?: string;
  
  // Offer Details (Customer Acquisition flow)
  mainOffer: string;
  offerIncludes: string;
  investmentRange: string;
  processDescription: string;
  
  // NEW: Methodology (first 30 days)
  methodologySteps?: string[];
  methodologyDescription?: string;
  
  // Page Goals
  primaryGoal: string;
  ctaText: string;
  objectionsToOvercome: string;
  
  // NEW: Calculator Context (when calculator is enabled)
  calculatorTypicalResults?: string;
  calculatorDisclaimer?: string;
  calculatorNextStep?: string;
  
  // IR-specific fields
  investorProfile?: InvestorProfileData;
  tractionMilestones?: TractionMilestonesData;
  investmentOpportunity?: InvestmentOpportunityData;
  teamAdvisors?: TeamAdvisorsData;
  
  // Beta/Pre-launch specific fields
  betaConfig?: {
    stage: string | null;
    timeline: string | null;
    specificDate: Date | null;
    perks: string[];
    viralEnabled: boolean;
    rewardTiers: RewardTier[];
    founderStory?: string;
  };
  
  // Hero Background (AI-generated)
  heroBackgroundUrl?: string;
}

// Base steps that apply to all page types (website step moved to BrandSetup)
// Note: 'branding' step is conditionally included based on whether brand colors already exist
const BASE_STEPS_WITH_BRANDING = [
  { id: 'branding', title: 'Brand Customization', icon: Palette },
  { id: 'page-type', title: 'Page Purpose', icon: FileText },
  { id: 'identity', title: 'Business Identity', icon: Building2 },
];

const BASE_STEPS_WITHOUT_BRANDING = [
  { id: 'page-type', title: 'Page Purpose', icon: FileText },
  { id: 'identity', title: 'Business Identity', icon: Building2 },
];

// Customer Acquisition specific steps
const CUSTOMER_ACQUISITION_STEPS = [
  { id: 'audience', title: 'Target Audience', icon: Users },
  { id: 'credibility', title: 'Credibility', icon: Trophy },
  { id: 'offer', title: 'Your Offer', icon: Target },
  { id: 'goals', title: 'Page Goals', icon: CheckCircle2 },
];

// Investor Relations specific steps
const IR_STEPS = [
  { id: 'investor-profile', title: 'Investor Profile', icon: TrendingUp },
  { id: 'traction', title: 'Traction & Milestones', icon: Trophy },
  { id: 'team', title: 'Team & Advisors', icon: UserCheck },
  { id: 'ir-opportunity', title: 'Investment Opportunity', icon: Target },
  { id: 'goals', title: 'Page Goals', icon: CheckCircle2 },
];

// Beta/Pre-launch specific steps
const BETA_STEPS = [
  { id: 'beta-stage', title: 'Launch Stage', icon: Rocket },
  { id: 'beta-timeline', title: 'Timeline', icon: Calendar },
  { id: 'beta-perks', title: 'Early Adopter Perks', icon: Gift },
  { id: 'beta-viral', title: 'Viral Referrals', icon: Share2 },
  { id: 'goals', title: 'Page Goals', icon: CheckCircle2 },
];

// Helper to get steps based on page type and whether brand is already configured
const getStepsForPageType = (pageType?: PageTypeId, hasBrandColors?: boolean) => {
  // If brand colors already exist (from Brand Setup or PDF extraction), skip the branding step
  const baseSteps = hasBrandColors ? BASE_STEPS_WITHOUT_BRANDING : BASE_STEPS_WITH_BRANDING;
  
  if (pageType === 'investor-relations') {
    return [...baseSteps, ...IR_STEPS];
  }
  if (pageType === 'beta-prelaunch') {
    return [...baseSteps, ...BETA_STEPS];
  }
  // Default to customer acquisition flow for all other types
  return [...baseSteps, ...CUSTOMER_ACQUISITION_STEPS];
};

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

// Industry-specific placeholder examples for better UX
const INDUSTRY_PLACEHOLDERS: Record<string, {
  idealClient: string;
  clientFrustration: string;
  desiredOutcome: string;
  uniqueStrength: string;
  mainOffer: string;
  offerIncludes: string;
}> = {
  'B2B SaaS / Software': {
    idealClient: 'e.g., Mid-market SaaS companies with 50-200 employees looking to scale their sales operations...',
    clientFrustration: 'e.g., They struggle with fragmented tools, manual processes, and inconsistent data across departments...',
    desiredOutcome: 'e.g., Streamlined operations that save 10+ hours per week and provide clear visibility into their pipeline...',
    uniqueStrength: 'e.g., We integrate with 50+ tools out of the box and customers see ROI within the first 30 days...',
    mainOffer: 'e.g., Enterprise Platform Integration, Custom API Development',
    offerIncludes: 'e.g., Full implementation, 3 custom integrations, dedicated success manager, 24/7 support...',
  },
  'Professional Services': {
    idealClient: 'e.g., Growing businesses with 10-50 employees needing strategic consulting but lacking in-house expertise...',
    clientFrustration: 'e.g., They hire consultants who give generic advice without understanding their specific industry challenges...',
    desiredOutcome: 'e.g., A clear strategic roadmap they can implement immediately with measurable quarterly milestones...',
    uniqueStrength: 'e.g., We only work with 5 clients at a time, guaranteeing hands-on attention from senior partners...',
    mainOffer: 'e.g., Strategic Growth Consulting, Business Transformation Services',
    offerIncludes: 'e.g., Monthly strategy sessions, implementation support, quarterly business reviews...',
  },
  'Healthcare / Medical': {
    idealClient: 'e.g., Medical practices with 3-10 providers looking to improve patient experience and operational efficiency...',
    clientFrustration: 'e.g., They deal with outdated systems, long wait times, and frustrated staff juggling manual paperwork...',
    desiredOutcome: 'e.g., A smoothly running practice where staff focus on patient care, not administrative burden...',
    uniqueStrength: 'e.g., We specialize exclusively in healthcare IT with HIPAA-compliant solutions and 24/7 support...',
    mainOffer: 'e.g., Practice Management Solutions, EHR Implementation',
    offerIncludes: 'e.g., Full system setup, staff training, data migration, ongoing technical support...',
  },
  'Real Estate': {
    idealClient: 'e.g., First-time homebuyers or families relocating who need guidance through the entire buying process...',
    clientFrustration: 'e.g., They feel overwhelmed by the process, fear making a costly mistake, and get generic MLS listings...',
    desiredOutcome: 'e.g., Finding their perfect home without stress, getting the best deal, and closing on time...',
    uniqueStrength: 'e.g., We negotiate an average of $15K below asking price and have a 100% closing rate...',
    mainOffer: 'e.g., Full-Service Home Buying, Luxury Property Sales',
    offerIncludes: 'e.g., Market analysis, property tours, negotiation, closing coordination, post-sale support...',
  },
  'Agency / Creative': {
    idealClient: 'e.g., Funded startups and established brands looking to differentiate through exceptional design and strategy...',
    clientFrustration: 'e.g., They work with agencies that miss deadlines, don\'t understand their vision, or produce mediocre work...',
    desiredOutcome: 'e.g., A brand that stands out, resonates with their audience, and drives measurable business results...',
    uniqueStrength: 'e.g., We\'ve won 15+ design awards and our average client sees 3x improvement in conversion rates...',
    mainOffer: 'e.g., Brand Strategy & Design, Digital Experience Design',
    offerIncludes: 'e.g., Discovery workshop, brand strategy, visual identity, website design, brand guidelines...',
  },
  'Manufacturing / Industrial': {
    idealClient: 'e.g., Aerospace and defense contractors requiring precision machined components with tight tolerances...',
    clientFrustration: 'e.g., They deal with quality inconsistencies, late deliveries, and suppliers who can\'t scale with demand...',
    desiredOutcome: 'e.g., A reliable supply chain partner that delivers quality parts on time, every time...',
    uniqueStrength: 'e.g., AS9100D certified with 99.7% on-time delivery and zero defects on mission-critical parts...',
    mainOffer: 'e.g., Precision CNC Machining, Custom Fabrication Services',
    offerIncludes: 'e.g., Design consultation, prototyping, production runs, quality documentation, logistics...',
  },
  'default': {
    idealClient: 'e.g., Describe your ideal customer in detail - their role, company size, specific needs...',
    clientFrustration: 'e.g., What problems do they face? What keeps them up at night when hiring in your space?',
    desiredOutcome: 'e.g., What transformation or result are they really paying for?',
    uniqueStrength: 'e.g., What makes you different from competitors? What do you guarantee or promise?',
    mainOffer: 'e.g., Your main product or service name',
    offerIncludes: 'e.g., List what\'s included in your core offering...',
  },
};

// Helper to get placeholders based on selected industry
const getPlaceholders = (industry?: string) => {
  if (!industry) return INDUSTRY_PLACEHOLDERS['default'];
  return INDUSTRY_PLACEHOLDERS[industry] || INDUSTRY_PLACEHOLDERS['default'];
};

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

// Extracted brand from BrandExtractor
interface ExtractedBrandData {
  companyName: string | null;
  faviconUrl: string | null;
  description: string | null;
  tagline: string | null;
  themeColor: string | null;
  secondaryColor?: string | null;
  logoUrl?: string | null;
  ogImage: string | null;
  domain: string;
  websiteUrl?: string;
}

interface WebsiteAnalysis {
  companyName?: string;
  industry?: string;
  targetAudience?: string;
  problemStatement?: string;
  solutionStatement?: string;
  uniqueDifferentiator?: string;
  proofPoints?: string[];
  testimonials?: { quote: string; author: string; title?: string }[];
  services?: { name: string; description: string }[];
  recommendedCTA?: string;
  recommendedOffer?: string;
  gaps?: { field: string; message: string; guidance: string }[];
}

interface Props {
  onComplete: (data: ConsultationData, strategyBrief: string, aiSeoData?: AISeoData | null, structuredBrief?: any) => void;
  onBack?: () => void;
  prefillData?: PrefillData | null;
  extractedBrand?: ExtractedBrandData | null;
  skipDraftLoad?: boolean;
  websiteAnalysis?: WebsiteAnalysis | null;
}

export function StrategicConsultation({ onComplete, onBack, prefillData, extractedBrand, skipDraftLoad, websiteAnalysis }: Props) {
  // Check if dev mode is active
  const [isDevModeActive] = useDevMode();
  
  // Initialize data with prefill values if available
  const getInitialData = (): Partial<ConsultationData> => {
    const initial: Partial<ConsultationData> = {};
    
    // WEBSITE ANALYSIS TAKES TOP PRIORITY (AI analyzed the full site)
    if (websiteAnalysis) {
      console.log('🤖 Using AI website analysis for initial data');
      initial.businessName = websiteAnalysis.companyName || extractedBrand?.companyName || '';
      initial.websiteUrl = extractedBrand?.websiteUrl || '';
      initial.industry = websiteAnalysis.industry || '';
      initial.idealClient = websiteAnalysis.targetAudience || '';
      initial.clientFrustration = websiteAnalysis.problemStatement || '';
      initial.uniqueStrength = websiteAnalysis.solutionStatement || '';
      initial.mainOffer = websiteAnalysis.recommendedOffer || '';
      initial.ctaText = websiteAnalysis.recommendedCTA || '';
      initial.achievements = websiteAnalysis.proofPoints?.join('\n') || '';
      initial.testimonialText = websiteAnalysis.testimonials?.[0]?.quote || '';
      
      // Apply brand settings from extracted brand
      if (extractedBrand?.themeColor || extractedBrand?.logoUrl) {
        initial.brandSettings = {
          logoUrl: extractedBrand.logoUrl || extractedBrand.faviconUrl || null,
          primaryColor: extractedBrand.themeColor || '',
          secondaryColor: extractedBrand.secondaryColor || '',
          headingFont: 'Inter',
          bodyFont: 'Inter',
          modified: true,
        };
      }
      if (extractedBrand?.ogImage) {
        initial.heroBackgroundUrl = extractedBrand.ogImage;
      }
      // Build website intelligence with explicit primary/secondary for BrandCustomization
      const brandColors = [extractedBrand?.themeColor, extractedBrand?.secondaryColor].filter(Boolean) as string[];
      initial.websiteIntelligence = {
        logoUrl: extractedBrand?.logoUrl || extractedBrand?.faviconUrl || null,
        brandColors,
        primaryColor: extractedBrand?.themeColor || brandColors[0] || null,
        secondaryColor: extractedBrand?.secondaryColor || brandColors[1] || null,
        title: websiteAnalysis.companyName || extractedBrand?.companyName || null,
        tagline: extractedBrand?.tagline || null,
        description: extractedBrand?.description || null,
        heroText: null,
        testimonials: websiteAnalysis.testimonials?.map(t => t.quote) || [],
        companyName: websiteAnalysis.companyName || extractedBrand?.companyName || null,
      };
      
      return initial;
    }
    
    // EXTRACTED BRAND TAKES SECOND PRIORITY
    // This is real user data from their website - never override it
    if (extractedBrand) {
      if (extractedBrand.companyName) {
        initial.businessName = extractedBrand.companyName;
      }
      if (extractedBrand.websiteUrl) {
        initial.websiteUrl = extractedBrand.websiteUrl;
      }
      if (extractedBrand.tagline || extractedBrand.description) {
        initial.uniqueStrength = extractedBrand.tagline || extractedBrand.description || '';
      }
      if (extractedBrand.themeColor || extractedBrand.logoUrl) {
        initial.brandSettings = {
          logoUrl: extractedBrand.logoUrl || extractedBrand.faviconUrl || null,
          primaryColor: extractedBrand.themeColor || '',
          secondaryColor: extractedBrand.secondaryColor || '',
          headingFont: 'Inter',
          bodyFont: 'Inter',
          modified: true,
        };
      }
      // Store OG image as potential hero background
      if (extractedBrand.ogImage) {
        initial.heroBackgroundUrl = extractedBrand.ogImage;
      }
      // Build website intelligence from extracted brand with explicit primary/secondary for BrandCustomization
      const brandColors = [extractedBrand.themeColor, extractedBrand.secondaryColor].filter(Boolean) as string[];
      initial.websiteIntelligence = {
        logoUrl: extractedBrand.logoUrl || extractedBrand.faviconUrl || null,
        brandColors,
        primaryColor: extractedBrand.themeColor || brandColors[0] || null,
        secondaryColor: extractedBrand.secondaryColor || brandColors[1] || null,
        title: extractedBrand.companyName,
        tagline: extractedBrand.tagline,
        description: extractedBrand.description,
        heroText: null,
        testimonials: [],
        companyName: extractedBrand.companyName,
      };
      
      // When extracted brand exists, skip prefill data entirely
      // (extracted brand = real user data, prefill = dev/demo data)
      return initial;
    }
    
    // Only apply prefill data if:
    // 1. No extracted brand (real user data takes priority)
    // 2. Dev mode is active OR source is landing_demo
    const shouldApplyPrefill = prefillData?.extracted && 
      (isDevModeActive || prefillData.source === 'landing_demo');
    
    if (shouldApplyPrefill && prefillData?.extracted) {
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
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Hero background state
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [heroCurrentIndex, setHeroCurrentIndex] = useState(0);
  const [isHeroLocked, setIsHeroLocked] = useState(false);
  const [heroLockedIndex, setHeroLockedIndex] = useState(0);
  const [isHeroGenerating, setIsHeroGenerating] = useState(false);
  
  // Load brand brief for the panel
  const { brandBrief, isLoading: brandLoading } = useBrandBrief();
  
  // Track if brand check is complete to prevent flash of branding step
  const [isBrandCheckComplete, setIsBrandCheckComplete] = useState(false);
  
  // Mark brand check as complete once brandLoading is false
  useEffect(() => {
    if (!brandLoading) {
      setIsBrandCheckComplete(true);
    }
  }, [brandLoading]);
  
  // Track user ID for auto-save
  const [userId, setUserId] = useState<string | null>(null);
  
  // Get user ID on mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  // Check if brand colors already exist from Brand Setup (PDF extraction or website analysis)
  const hasBrandColors = Boolean(brandBrief?.colors?.primary?.hex);
  
  // Sync brandBrief to brandSettings when brand is already loaded (skipping branding step)
  useEffect(() => {
    if (hasBrandColors && brandBrief && !data.brandSettings) {
      console.log('🎨 Syncing brandBrief to brandSettings:', {
        logoUrl: brandBrief.logo_url,
        primaryColor: brandBrief.colors?.primary?.hex,
      });
      setData(prev => ({
        ...prev,
        brandSettings: {
          logoUrl: brandBrief.logo_url || null,
          primaryColor: brandBrief.colors?.primary?.hex || '#0ea5e9',
          secondaryColor: brandBrief.colors?.secondary?.hex || '#8b5cf6',
          headingFont: brandBrief.typography?.headlineFont || 'Inter',
          bodyFont: brandBrief.typography?.bodyFont || 'Inter',
          modified: false,
        },
      }));
    }
  }, [hasBrandColors, brandBrief, data.brandSettings]);
  
  // Hero background: Auto-rotate
  useEffect(() => {
    if (heroImages.length <= 1 || isHeroLocked) return;
    const interval = setInterval(() => {
      setHeroCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 10000); // 10 seconds for calm, ambient feel
    return () => clearInterval(interval);
  }, [heroImages.length, isHeroLocked]);

  // Hero background: Generate on industry select (combined: FLUX + brand scenes if logo available)
  const logoUrl = data.brandSettings?.logoUrl || brandBrief?.logo_url;
  
  useEffect(() => {
    if (data.industryCategory) {
      setIsHeroGenerating(true);
      
      // Use combined generation if logo is available
      const generateFn = logoUrl 
        ? generateCombinedHeroImages(data.industryCategory, data.industrySubcategory, logoUrl)
        : generateHeroImages(data.industryCategory, data.industrySubcategory, 4);
      
      generateFn
        .then(result => {
          setHeroImages(result.images);
        })
        .catch(console.error)
        .finally(() => setIsHeroGenerating(false));
    }
  }, [data.industryCategory, data.industrySubcategory, logoUrl]);

  const handleHeroSelect = useCallback(() => {
    setIsHeroLocked(true);
    setHeroLockedIndex(heroCurrentIndex);
    updateData({ heroBackgroundUrl: heroImages[heroCurrentIndex]?.url });
  }, [heroCurrentIndex, heroImages]);

  const handleHeroRegenerate = useCallback(async () => {
    if (!data.industryCategory) return;
    setIsHeroGenerating(true);
    try {
      // Use combined regeneration if logo is available
      const result = logoUrl
        ? await regenerateCombinedHeroImages(data.industryCategory, data.industrySubcategory, logoUrl)
        : await regenerateHeroImages(data.industryCategory, data.industrySubcategory, 4);
      setHeroImages(result.images);
      setHeroCurrentIndex(0);
      setIsHeroLocked(false);
    } finally {
      setIsHeroGenerating(false);
    }
  }, [data.industryCategory, data.industrySubcategory, logoUrl]);

  const handleHeroUnlock = useCallback(() => {
    setIsHeroLocked(false);
    updateData({ heroBackgroundUrl: '' });
  }, []);

  const handleHeroDotClick = useCallback((index: number) => {
    if (!isHeroLocked) {
      setHeroCurrentIndex(index);
    }
  }, [isHeroLocked]);
  
  // Compute STEPS dynamically based on selected page type and brand status
  // Skip branding step if brand colors are already configured
  const STEPS = useMemo(() => getStepsForPageType(data.pageType, hasBrandColors), [data.pageType, hasBrandColors]);

  // Helper to find first incomplete step based on current data
  const findFirstIncompleteStep = useCallback((savedData: Partial<ConsultationData>, steps: typeof STEPS): number => {
    for (let i = 0; i < steps.length; i++) {
      const stepId = steps[i].id;
      switch (stepId) {
        case 'branding':
          // Branding is optional, consider complete if skipped or has settings
          break;
        case 'page-type':
          if (!savedData.pageType) return i;
          break;
        case 'identity':
          if (!savedData.businessName || !savedData.industry || !savedData.uniqueStrength) return i;
          break;
        case 'audience':
          if (!savedData.idealClient || !savedData.clientFrustration || !savedData.desiredOutcome) return i;
          break;
        case 'credibility':
          // Optional step - consider complete
          break;
        case 'offer':
          if (!savedData.mainOffer || !savedData.offerIncludes) return i;
          break;
        case 'goals':
          if (!savedData.primaryGoal || !savedData.ctaText) return i;
          break;
        // IR-specific steps
        case 'investor-profile':
          if (!savedData.investorProfile?.investorTypes?.length) return i;
          break;
        case 'traction':
        case 'team':
          // Optional
          break;
        case 'ir-opportunity':
          if (!savedData.investmentOpportunity?.irEmail) return i;
          break;
        // Beta-specific steps
        case 'beta-stage':
          if (!savedData.betaConfig?.stage) return i;
          break;
        case 'beta-timeline':
          if (!savedData.betaConfig?.timeline) return i;
          break;
        case 'beta-perks':
          if (!savedData.betaConfig?.perks?.length) return i;
          break;
        case 'beta-viral':
          // Optional
          break;
      }
    }
    // All complete - return last step
    return Math.max(0, steps.length - 1);
  }, []);

  // Load draft from database on mount
  // Skip if we have extracted brand (fresh start) or if explicitly told to skip
  useEffect(() => {
    const loadDraft = async () => {
      // CRITICAL: If we have extracted brand data, DO NOT load any draft
      if (extractedBrand?.companyName) {
        console.log('🚫 Extracted brand exists - skipping draft load');
        return; // EXIT EARLY - don't load draft
      }
      
      // Also skip if explicitly told to skip
      if (skipDraftLoad) {
        console.log('🚫 skipDraftLoad flag set - skipping draft load');
        return;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: draft } = await supabase
        .from('consultation_drafts')
        .select('wizard_data')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (draft?.wizard_data && typeof draft.wizard_data === 'object') {
        const savedData = draft.wizard_data as Partial<ConsultationData>;
        setData(prev => ({ ...prev, ...savedData }));
        
        // Get the correct STEPS based on saved pageType
        const savedSteps = getStepsForPageType(savedData.pageType, hasBrandColors);
        
        // Calculate the first incomplete step and resume there (clamped to valid range)
        const resumeStep = Math.min(
          findFirstIncompleteStep(savedData, savedSteps),
          savedSteps.length - 1
        );
        setCurrentStep(Math.max(0, resumeStep));
        
        console.log('📂 Loaded draft from database, resuming at step', resumeStep, 'of', savedSteps.length);
        toast.success('Welcome back!', {
          description: `Resuming from "${savedSteps[resumeStep]?.title || 'Step ' + (resumeStep + 1)}"`
        });
      }
    };
    
    loadDraft();
  }, [skipDraftLoad, extractedBrand, STEPS, findFirstIncompleteStep]);

  // Restore progress from localStorage on mount (fallback)
  // Skip if we have extracted brand (fresh start)
  useEffect(() => {
    // CRITICAL: If we have extracted brand, don't restore from localStorage
    if (extractedBrand?.companyName || skipDraftLoad) {
      console.log('🚫 Extracted brand exists - skipping localStorage restore');
      return;
    }
    
    const saved = localStorage.getItem('pageconsult_consultation_draft');
    if (saved) {
      try {
        const { currentStep: savedStep, data: savedData, timestamp } = JSON.parse(saved);
        
        // Only restore if less than 24 hours old and has meaningful data
        const isRecent = Date.now() - timestamp < 24 * 60 * 60 * 1000;
        const hasMeaningfulData = savedData.businessName || savedData.industry || savedData.idealClient;
        
        if (isRecent && hasMeaningfulData) {
          // Get the correct STEPS based on saved pageType
          const savedSteps = getStepsForPageType(savedData.pageType, hasBrandColors);
          // Calculate best resume position (clamped to valid range)
          const resumeStep = Math.min(
            findFirstIncompleteStep(savedData, savedSteps),
            savedSteps.length - 1
          );
          setShowRestorePrompt(true);
          setPendingRestore({ savedStep: Math.max(0, resumeStep), savedData });
        } else {
          // Clear stale data
          localStorage.removeItem('pageconsult_consultation_draft');
        }
      } catch (e) {
        console.warn('Failed to parse saved consultation:', e);
        localStorage.removeItem('pageconsult_consultation_draft');
      }
    }
  }, [extractedBrand, skipDraftLoad, STEPS, findFirstIncompleteStep]);

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

  // Manual save handler
  const handleSaveProgress = async () => {
    setIsSaving(true);
    
    try {
      // Always save to localStorage
      localStorage.setItem('pageconsult_consultation_draft', JSON.stringify({
        currentStep,
        data,
        timestamp: Date.now()
      }));
      
      // If authenticated, also save to database
      if (userId) {
        await supabase.from('consultation_drafts').upsert(
          {
            user_id: userId,
            wizard_data: data as any,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
      }
      
      setLastSaved(new Date());
      toast.success('Progress saved!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save progress');
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading until we know the brand status (AFTER all hooks)
  if (!isBrandCheckComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
          <p className="text-slate-400">Loading your brand...</p>
        </div>
      </div>
    );
  }

  const updateData = (updates: Partial<ConsultationData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };
  
  // Handle field changes from BriefPanel
  const handleBriefFieldChange = (key: string, value: string) => {
    setData(prev => ({
      ...prev,
      [key]: value,
    }));
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
    const step = STEPS[currentStep];
    if (!step) return false;
    
    switch (step.id) {
      case 'website':
        return true; // Optional step
      case 'branding':
        return true; // Can always proceed (defaults available)
      case 'page-type':
        return !!data.pageType; // Must select a page type
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
      // IR-specific steps
      case 'investor-profile':
        return data.investorProfile?.investorTypes?.length && 
               data.investorProfile?.companyStage && 
               data.investorProfile?.investmentAsk &&
               data.investorProfile?.investmentThesis;
      case 'traction':
        return true; // Optional
      case 'team':
        return true; // Optional
      case 'ir-opportunity':
        return !!data.investmentOpportunity?.irEmail;
      // Beta-specific steps
      case 'beta-stage':
        return !!data.betaConfig?.stage;
      case 'beta-timeline':
        return !!data.betaConfig?.timeline && 
               (data.betaConfig.timeline !== 'specific' || !!data.betaConfig.specificDate);
      case 'beta-perks':
        return (data.betaConfig?.perks?.length || 0) > 0;
      case 'beta-viral':
        return true; // Optional - can proceed without enabling viral
      default:
        return true;
    }
  };

  // Handle brand customization completion
  const handleBrandComplete = (brandSettings: BrandSettings) => {
    updateData({ brandSettings });
    setCurrentStep(currentStep + 1);
  };

  // Handle using industry defaults (skip brand customization)
  const handleUseDefaults = () => {
    // Clear brand settings to use industry baseline
    updateData({ brandSettings: undefined });
    setCurrentStep(currentStep + 1);
  };

  const handleNext = async () => {
    const currentStepId = STEPS[currentStep]?.id;
    
    // If moving from website step and no website intelligence, skip branding step
    if (currentStepId === 'website' && !data.websiteIntelligence) {
      // Skip branding step (index 1) and go directly to page-type (index 2)
      setCurrentStep(currentStep + 2);
      return;
    }
    
    // If page type changes, we might need to reset step index due to different step arrays
    // The useMemo for STEPS handles this automatically
    
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - generate strategy brief
      await generateStrategyBrief();
    }
  };

  const handleBack = () => {
    const currentStepId = STEPS[currentStep]?.id;
    
    // If going back to branding step but no website intelligence, skip to website step
    if (currentStepId === 'page-type' && !data.websiteIntelligence) {
      // Skip branding step and go back to website (index 0)
      setCurrentStep(0);
      return;
    }
    
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
      
      // CRITICAL: Capture BOTH the text brief AND the structured JSON brief
      const strategyBriefText = briefResult.data.strategyBrief;
      const structuredBrief = briefResult.data.structuredBrief;
      
      console.log('📋 Strategy brief generated');
      console.log('📊 structuredBrief present:', !!structuredBrief);
      if (structuredBrief) {
        console.log('📊 structuredBrief keys:', Object.keys(structuredBrief));
      }
      
      // Clear the draft since consultation is complete
      localStorage.removeItem('pageconsult_consultation_draft');
      console.log('🗑️ Cleared consultation draft');
      
      // Pass BOTH the text brief AND the structured JSON brief
      onComplete(data as ConsultationData, strategyBriefText, aiSeoData, structuredBrief);
    } catch (err) {
      console.error('Strategy brief generation error:', err);
      // Fallback: proceed with basic brief (no structured brief available)
      const fallbackBrief = generateFallbackBrief(data as ConsultationData);
      
      // Clear the draft since consultation is complete
      localStorage.removeItem('pageconsult_consultation_draft');
      console.log('🗑️ Cleared consultation draft');
      
      onComplete(data as ConsultationData, fallbackBrief, null, null);
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
    
    // Guard against invalid step index
    if (!step) {
      console.warn('Invalid step index:', currentStep, 'STEPS length:', STEPS.length);
      // Reset to valid step
      if (currentStep >= STEPS.length) {
        setCurrentStep(Math.max(0, STEPS.length - 1));
      }
      return (
        <div className="text-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-cyan-500" />
          <p className="text-slate-400 mt-2">Loading step...</p>
        </div>
      );
    }
    
    switch (step.id) {
      case 'branding':
        // Handled by early return before main render - should not reach here
        return null;

      case 'page-type':
        return (
          <PageTypeStep
            value={data.pageType || null}
            onChange={(pageType) => updateData({ pageType: pageType as PageTypeId })}
            onContinue={handleNext}
            onBack={handleBack}
          />
        );

      case 'investor-profile':
        return (
          <InvestorProfileStep
            data={data.investorProfile || {}}
            onChange={(updates) => updateData({ 
              investorProfile: { ...data.investorProfile, ...updates } as InvestorProfileData 
            })}
          />
        );

      case 'traction':
        return (
          <TractionMilestonesStep
            data={data.tractionMilestones || {}}
            onChange={(updates) => updateData({ 
              tractionMilestones: { ...data.tractionMilestones, ...updates } as TractionMilestonesData 
            })}
          />
        );

      case 'team':
        return (
          <TeamAdvisorsStep
            data={data.teamAdvisors || {}}
            onChange={(updates) => updateData({ 
              teamAdvisors: { ...data.teamAdvisors, ...updates } as TeamAdvisorsData 
            })}
          />
        );

      case 'ir-opportunity':
        return (
          <InvestmentOpportunityStep
            data={data.investmentOpportunity || {}}
            onChange={(updates) => updateData({ 
              investmentOpportunity: { ...data.investmentOpportunity, ...updates } as InvestmentOpportunityData 
            })}
          />
        );

      // Beta/Pre-launch steps
      case 'beta-stage':
        return (
          <BetaStageStep
            value={data.betaConfig?.stage || null}
            onChange={(stage) => updateData({ 
              betaConfig: { ...data.betaConfig, stage, timeline: data.betaConfig?.timeline || null, specificDate: data.betaConfig?.specificDate || null, perks: data.betaConfig?.perks || [], viralEnabled: data.betaConfig?.viralEnabled || false, rewardTiers: data.betaConfig?.rewardTiers || [] }
            })}
            onContinue={handleNext}
            onBack={handleBack}
          />
        );

      case 'beta-timeline':
        return (
          <BetaTimelineStep
            value={data.betaConfig?.timeline || null}
            specificDate={data.betaConfig?.specificDate || null}
            onChange={(timeline) => updateData({ 
              betaConfig: { ...data.betaConfig, stage: data.betaConfig?.stage || null, timeline, specificDate: data.betaConfig?.specificDate || null, perks: data.betaConfig?.perks || [], viralEnabled: data.betaConfig?.viralEnabled || false, rewardTiers: data.betaConfig?.rewardTiers || [] }
            })}
            onDateChange={(specificDate) => updateData({ 
              betaConfig: { ...data.betaConfig, stage: data.betaConfig?.stage || null, timeline: data.betaConfig?.timeline || null, specificDate, perks: data.betaConfig?.perks || [], viralEnabled: data.betaConfig?.viralEnabled || false, rewardTiers: data.betaConfig?.rewardTiers || [] }
            })}
            onContinue={handleNext}
            onBack={handleBack}
          />
        );

      case 'beta-perks':
        return (
          <BetaPerksStep
            value={data.betaConfig?.perks || []}
            onChange={(perks) => updateData({ 
              betaConfig: { ...data.betaConfig, stage: data.betaConfig?.stage || null, timeline: data.betaConfig?.timeline || null, specificDate: data.betaConfig?.specificDate || null, perks, viralEnabled: data.betaConfig?.viralEnabled || false, rewardTiers: data.betaConfig?.rewardTiers || [] }
            })}
            onContinue={handleNext}
            onBack={handleBack}
          />
        );

      case 'beta-viral':
        return (
          <BetaViralStep
            enabled={data.betaConfig?.viralEnabled || false}
            tiers={data.betaConfig?.rewardTiers || []}
            onEnabledChange={(viralEnabled) => updateData({ 
              betaConfig: { ...data.betaConfig, stage: data.betaConfig?.stage || null, timeline: data.betaConfig?.timeline || null, specificDate: data.betaConfig?.specificDate || null, perks: data.betaConfig?.perks || [], viralEnabled, rewardTiers: data.betaConfig?.rewardTiers || [] }
            })}
            onTiersChange={(rewardTiers) => updateData({ 
              betaConfig: { ...data.betaConfig, stage: data.betaConfig?.stage || null, timeline: data.betaConfig?.timeline || null, specificDate: data.betaConfig?.specificDate || null, perks: data.betaConfig?.perks || [], viralEnabled: data.betaConfig?.viralEnabled || false, rewardTiers }
            })}
            onContinue={handleNext}
            onBack={handleBack}
          />
        );

      case 'identity':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Tell Me About Your Business</h2>
              <p className="text-slate-400">The foundation for your landing page strategy.</p>
            </div>
            
            <div className="space-y-5">
              <div>
                <Label htmlFor="businessName" className="text-slate-400 inline-flex items-center">
                  Business Name *
                  <QuestionExplainer {...QUESTION_EXPLAINERS.businessName} />
                </Label>
                <Input
                  id="businessName"
                  placeholder="e.g., Acme Solutions"
                  value={data.businessName || ''}
                  onChange={(e) => updateData({ businessName: e.target.value })}
                  className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
              
              <div>
                <Label htmlFor="productName" className="text-slate-400 inline-flex items-center">
                  Product Name
                  <QuestionExplainer {...QUESTION_EXPLAINERS.productName} />
                </Label>
                <Input
                  id="productName"
                  placeholder="e.g., Claude, Notion, Figma (leave blank if same as business)"
                  value={data.productName || ''}
                  onChange={(e) => updateData({ productName: e.target.value })}
                  className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                />
                <p className="text-xs text-slate-500 mt-1.5">The name users will see on your landing page. Leave blank to use your business name.</p>
              </div>
              
              <div>
                <Label htmlFor="industry" className="text-slate-400 inline-flex items-center">
                  Industry *
                  <QuestionExplainer {...QUESTION_EXPLAINERS.industry} />
                </Label>
                <div className="mt-2">
                  <IndustrySelector
                    value={{
                      category: data.industryCategory || '',
                      subcategory: data.industrySubcategory || '',
                    }}
                    onChange={({ category, subcategory }) => {
                      updateData({ 
                        industryCategory: category,
                        industrySubcategory: subcategory,
                        industry: `${category} → ${subcategory}`,
                      });
                    }}
                  />
                </div>
              </div>
              
              {/* Hero background is now shown as ambient background in the wrapper */}
              
              <div>
                <Label htmlFor="yearsInBusiness" className="text-slate-400">Years in Business</Label>
                <Input
                  id="yearsInBusiness"
                  placeholder="e.g., 5 years, Since 2015, Just started"
                  value={data.yearsInBusiness || ''}
                  onChange={(e) => updateData({ yearsInBusiness: e.target.value })}
                  className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
              
              <div>
                <Label htmlFor="uniqueStrength" className="text-slate-400 inline-flex items-center flex-wrap">
                  {data.pageType === 'beta-prelaunch'
                    ? `What will make ${data.productName || data.businessName || 'your product'} worth the wait? *`
                    : data.productName
                    ? `What's the ONE thing ${data.productName} does better than anything else? *`
                    : "What's the ONE thing you do better than anyone else? *"}
                  <QuestionExplainer {...QUESTION_EXPLAINERS.uniqueStrength} />
                </Label>
                <Textarea
                  id="uniqueStrength"
                  placeholder={
                    data.pageType === 'beta-prelaunch'
                      ? "e.g., AI that actually learns YOUR focus patterns, not generic productivity tips..."
                      : data.productName
                      ? `e.g., ${data.productName} is the only tool that...`
                      : "e.g., We're the only agency that guarantees 10x ROI on ad spend within 90 days or your money back..."
                  }
                  value={data.uniqueStrength || ''}
                  onChange={(e) => updateData({ uniqueStrength: e.target.value })}
                  className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 min-h-[100px]"
                />
              </div>
              
              {/* NEW: Identity Sentence */}
              <div>
                <Label htmlFor="identitySentence" className="text-slate-400 inline-flex items-center">
                  How would you describe your firm in one sentence to a peer in your industry?
                  <QuestionExplainer {...QUESTION_EXPLAINERS.identitySentence} />
                </Label>
                <p className="text-xs text-slate-500 mt-1">Not your tagline — your honest positioning.</p>
                <Textarea
                  id="identitySentence"
                  placeholder="e.g., Former plant operators who specialize in finding hidden capacity without capital investment"
                  value={data.identitySentence || ''}
                  onChange={(e) => {
                    if (e.target.value.length <= 200) {
                      updateData({ identitySentence: e.target.value });
                    }
                  }}
                  className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 min-h-[80px]"
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-slate-500">Optional but helps differentiate your page</p>
                  <span className={`text-xs ${(data.identitySentence?.length || 0) > 180 ? 'text-amber-400' : 'text-slate-500'}`}>
                    {data.identitySentence?.length || 0}/200
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'audience':
        const placeholders = getPlaceholders(data.industry);
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Who Are You Trying to Reach?</h2>
              <p className="text-slate-400">Understanding your audience shapes everything.</p>
            </div>
            
            <div className="space-y-5">
              <div>
                <Label htmlFor="idealClient" className="text-slate-400 inline-flex items-center">
                  Describe your ideal client in detail *
                  <QuestionExplainer {...QUESTION_EXPLAINERS.idealClient} />
                </Label>
                <Textarea
                  id="idealClient"
                  placeholder={placeholders.idealClient}
                  value={data.idealClient || ''}
                  onChange={(e) => updateData({ idealClient: e.target.value })}
                  className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 min-h-[100px]"
                />
              </div>
              
              <div>
                <Label htmlFor="clientFrustration" className="text-slate-400 inline-flex items-center">
                  What's their biggest frustration when hiring in your space? *
                  <QuestionExplainer {...QUESTION_EXPLAINERS.clientFrustration} />
                </Label>
                <Textarea
                  id="clientFrustration"
                  placeholder={placeholders.clientFrustration}
                  value={data.clientFrustration || ''}
                  onChange={(e) => updateData({ clientFrustration: e.target.value })}
                  className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 min-h-[100px]"
                />
              </div>
              
              <div>
                <Label htmlFor="desiredOutcome" className="text-slate-400 inline-flex items-center">
                  What outcome are they really buying? (Not your service, the result) *
                  <QuestionExplainer {...QUESTION_EXPLAINERS.desiredOutcome} />
                </Label>
                <Textarea
                  id="desiredOutcome"
                  placeholder={placeholders.desiredOutcome}
                  value={data.desiredOutcome || ''}
                  onChange={(e) => updateData({ desiredOutcome: e.target.value })}
                  className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 min-h-[100px]"
                />
              </div>
            </div>
          </div>
        );

      case 'credibility':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Your Track Record</h2>
              <p className="text-slate-400">Social proof that builds trust. Share what you can.</p>
            </div>
            
            <div className="space-y-5">
              <div>
                <Label htmlFor="clientCount" className="text-slate-400 inline-flex items-center">
                  Approximately how many clients/projects have you completed?
                  <QuestionExplainer {...QUESTION_EXPLAINERS.clientCount} />
                </Label>
                <Input
                  id="clientCount"
                  placeholder="e.g., 400+ weddings, 50 clients, 1000 projects"
                  value={data.clientCount || ''}
                  onChange={(e) => updateData({ clientCount: e.target.value })}
                  className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
              
              <div>
                <Label htmlFor="achievements" className="text-slate-400 inline-flex items-center">
                  Any notable achievements? (Awards, certifications, press, notable clients)
                  <QuestionExplainer {...QUESTION_EXPLAINERS.achievements} />
                </Label>
                <Textarea
                  id="achievements"
                  placeholder="e.g., 'Best of Weddings' award 3 years running, certified by XYZ, featured in ABC magazine..."
                  value={data.achievements || ''}
                  onChange={(e) => updateData({ achievements: e.target.value })}
                  className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 min-h-[80px]"
                />
              </div>
              
              <div>
                <Label htmlFor="testimonialText" className="text-slate-400 inline-flex items-center">
                  Paste 1-2 real testimonials, or describe what clients typically say about you
                  <QuestionExplainer {...QUESTION_EXPLAINERS.testimonialText} />
                </Label>
                <Textarea
                  id="testimonialText"
                  placeholder={'e.g., "Working with [you] was the best decision we made. They handled everything professionally and our clients loved them." - Sarah M., Event Planner'}
                  value={data.testimonialText || ''}
                  onChange={(e) => updateData({ testimonialText: e.target.value })}
                  className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 min-h-[100px]"
                />
              </div>
              
              {/* NEW: Concrete Proof Story */}
              <div className="pt-4 border-t border-slate-700">
                <Label htmlFor="concreteProofStory" className="text-slate-400 inline-flex items-center">
                  Share ONE specific result you're proud of
                  <QuestionExplainer {...QUESTION_EXPLAINERS.concreteProofStory} />
                </Label>
                <p className="text-xs text-slate-500 mt-1">You can anonymize. Format: "[Type of client] achieved [specific outcome] in [timeframe]"</p>
                <Textarea
                  id="concreteProofStory"
                  placeholder="e.g., A food & beverage manufacturer found 18% idle capacity within 60 days"
                  value={data.concreteProofStory || ''}
                  onChange={(e) => {
                    if (e.target.value.length <= 300) {
                      updateData({ concreteProofStory: e.target.value });
                    }
                  }}
                  className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 min-h-[80px]"
                />
                <div className="flex justify-between mt-1">
                  <div className="text-xs text-slate-500 space-y-0.5">
                    <p>Examples:</p>
                    <p className="text-slate-600">• "A 50-person SaaS company reduced churn from 8% to 3% in one quarter"</p>
                    <p className="text-slate-600">• "A local dental practice went from 20 to 45 new patients/month in 90 days"</p>
                  </div>
                  <span className={`text-xs ${(data.concreteProofStory?.length || 0) > 270 ? 'text-amber-400' : 'text-slate-500'}`}>
                    {data.concreteProofStory?.length || 0}/300
                  </span>
                </div>
              </div>
              
              {/* Proof Story Context - only show if proof story has content */}
              {data.concreteProofStory && data.concreteProofStory.length > 10 && (
                <div>
                  <Label htmlFor="proofStoryContext" className="text-slate-400">
                    What made this result possible? (One sentence)
                  </Label>
                  <Input
                    id="proofStoryContext"
                    placeholder="e.g., We mapped their changeover process and found 40 minutes of waste per shift."
                    value={data.proofStoryContext || ''}
                    onChange={(e) => updateData({ proofStoryContext: e.target.value })}
                    className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 'offer':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">What Are You Offering?</h2>
              <p className="text-slate-400">The specifics of what visitors will get.</p>
            </div>
            
            <div className="space-y-5">
              <div>
                <Label htmlFor="mainOffer" className="text-slate-400 inline-flex items-center">
                  Main service or product name *
                  <QuestionExplainer {...QUESTION_EXPLAINERS.mainOffer} />
                </Label>
                <Input
                  id="mainOffer"
                  placeholder="e.g., Wedding DJ Partnership Package, Growth Marketing Audit, Custom Software Development"
                  value={data.mainOffer || ''}
                  onChange={(e) => updateData({ mainOffer: e.target.value })}
                  className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
              
              <div>
                <Label htmlFor="offerIncludes" className="text-slate-400">
                  What's included? Key deliverables? *
                </Label>
                <Textarea
                  id="offerIncludes"
                  placeholder="e.g., 6 hours of coverage, backup equipment, planning consultation, custom playlist creation, MC services..."
                  value={data.offerIncludes || ''}
                  onChange={(e) => updateData({ offerIncludes: e.target.value })}
                  className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 min-h-[100px]"
                />
              </div>
              
              <div>
                <Label htmlFor="investmentRange" className="text-slate-400">
                  Investment range
                </Label>
                <select
                  id="investmentRange"
                  value={data.investmentRange || ''}
                  onChange={(e) => updateData({ investmentRange: e.target.value })}
                  className="mt-2 w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-3"
                >
                  <option value="">Select range...</option>
                  {INVESTMENT_RANGES.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="processDescription" className="text-slate-400 inline-flex items-center">
                  What happens after they contact you? Describe your process.
                  <QuestionExplainer {...QUESTION_EXPLAINERS.processDescription} />
                </Label>
                <Textarea
                  id="processDescription"
                  placeholder="e.g., 1) Free 15-min call to discuss needs, 2) Custom proposal within 48 hours, 3) Planning session if booked, 4) Delivery/event day"
                  value={data.processDescription || ''}
                  onChange={(e) => updateData({ processDescription: e.target.value })}
                  className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 min-h-[100px]"
                />
              </div>
              
              {/* NEW: Methodology Steps */}
              <div className="pt-4 border-t border-slate-700">
                <Label className="text-slate-400">
                  What happens in the first 30 days of working with you?
                </Label>
                <p className="text-xs text-slate-500 mt-1">Just the highlights — 2-3 concrete steps your clients experience</p>
                
                <div className="space-y-3 mt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-medium w-16 text-sm">Week 1:</span>
                    <Input
                      placeholder="e.g., Discovery call and data collection"
                      value={data.methodologySteps?.[0] || ''}
                      onChange={(e) => {
                        const steps = [...(data.methodologySteps || ['', '', ''])];
                        steps[0] = e.target.value;
                        updateData({ methodologySteps: steps });
                      }}
                      className="flex-1 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-medium w-16 text-sm">Week 2:</span>
                    <Input
                      placeholder="e.g., Analysis and constraint mapping"
                      value={data.methodologySteps?.[1] || ''}
                      onChange={(e) => {
                        const steps = [...(data.methodologySteps || ['', '', ''])];
                        steps[1] = e.target.value;
                        updateData({ methodologySteps: steps });
                      }}
                      className="flex-1 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-medium w-16 text-sm">Week 3-4:</span>
                    <Input
                      placeholder="e.g., Findings presentation with recommendations"
                      value={data.methodologySteps?.[2] || ''}
                      onChange={(e) => {
                        const steps = [...(data.methodologySteps || ['', '', ''])];
                        steps[2] = e.target.value;
                        updateData({ methodologySteps: steps });
                      }}
                      className="flex-1 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">Optional — helps power the "How It Works" section</p>
              </div>
              
              {/* NEW: Calculator Context (conditional) */}
              {data.pageType === 'customer-acquisition' && (
                <div className="pt-4 border-t border-slate-700">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    <Label className="text-slate-400 font-medium">ROI Calculator Context</Label>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">Optional — If you want a calculator on your page, these fields help set expectations</p>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="calculatorTypicalResults" className="text-slate-400 text-sm">
                        What's the typical range of results your clients see?
                      </Label>
                      <Input
                        id="calculatorTypicalResults"
                        placeholder="e.g., Most clients see 15-30% improvement in efficiency"
                        value={data.calculatorTypicalResults || ''}
                        onChange={(e) => updateData({ calculatorTypicalResults: e.target.value })}
                        className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="calculatorDisclaimer" className="text-slate-400 text-sm">
                        What's NOT included in this estimate?
                      </Label>
                      <p className="text-xs text-slate-500 mt-0.5">Builds trust by setting expectations</p>
                      <Input
                        id="calculatorDisclaimer"
                        placeholder="e.g., Doesn't account for implementation time or one-time costs"
                        value={data.calculatorDisclaimer || ''}
                        onChange={(e) => updateData({ calculatorDisclaimer: e.target.value })}
                        className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="calculatorNextStep" className="text-slate-400 text-sm">
                        What should someone do after seeing the estimate?
                      </Label>
                      <Input
                        id="calculatorNextStep"
                        placeholder="e.g., Schedule a diagnostic call to validate these numbers"
                        value={data.calculatorNextStep || ''}
                        onChange={(e) => updateData({ calculatorNextStep: e.target.value })}
                        className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'goals':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">What Should This Page Achieve?</h2>
              <p className="text-slate-400">Final details to optimize your conversion strategy.</p>
            </div>
            
            <div className="space-y-5">
              <div>
                <Label className="text-slate-400 inline-flex items-center">
                  Primary goal *
                  <QuestionExplainer {...QUESTION_EXPLAINERS.primaryGoal} />
                </Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {PRIMARY_GOALS.map(goal => (
                    <button
                      key={goal.value}
                      onClick={() => updateData({ primaryGoal: goal.value })}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        data.primaryGoal === goal.value
                          ? 'border-cyan-500 bg-cyan-500/10'
                          : 'border-slate-700 bg-slate-800/50 hover:border-slate-500'
                      }`}
                    >
                      <div className="font-medium text-white">{goal.label}</div>
                      <div className="text-sm text-slate-400">{goal.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="ctaText" className="text-slate-400 inline-flex items-center">
                  What should the main button say? *
                  <QuestionExplainer {...QUESTION_EXPLAINERS.ctaText} />
                </Label>
                <Input
                  id="ctaText"
                  placeholder="e.g., Schedule a Consultation, Get Your Free Quote, Book a Demo"
                  value={data.ctaText || ''}
                  onChange={(e) => updateData({ ctaText: e.target.value })}
                  className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
              
              <div>
                <Label htmlFor="objectionsToOvercome" className="text-slate-400 inline-flex items-center">
                  Any specific objections or concerns you need to address on this page?
                  <QuestionExplainer {...QUESTION_EXPLAINERS.objectionsToOvercome} />
                </Label>
                <Textarea
                  id="objectionsToOvercome"
                  placeholder="e.g., Price concerns, trust issues with new vendors, comparison to DIY options, timing/availability concerns..."
                  value={data.objectionsToOvercome || ''}
                  onChange={(e) => updateData({ objectionsToOvercome: e.target.value })}
                  className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 min-h-[80px]"
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

  // Brand customization step renders as full-page component
  if (STEPS[currentStep]?.id === 'branding') {
    // Use explicit primaryColor/secondaryColor if available, fallback to brandColors array
    const primaryColor = data.websiteIntelligence?.primaryColor || data.websiteIntelligence?.brandColors?.[0];
    const secondaryColor = data.websiteIntelligence?.secondaryColor || data.websiteIntelligence?.brandColors?.[1];
    
    console.log('🎨 Building brandingIntelligence for BrandCustomization:', {
      primaryColor,
      secondaryColor,
      brandColors: data.websiteIntelligence?.brandColors,
      websiteIntelligence: data.websiteIntelligence
    });
    
    const brandingIntelligence: WebsiteIntelligence = {
      url: data.websiteUrl || '',
      logoUrl: data.websiteIntelligence?.logoUrl,
      colors: data.websiteIntelligence?.brandColors || [],
      primaryColor: primaryColor || undefined,
      secondaryColor: secondaryColor || undefined,
      companyName: data.websiteIntelligence?.companyName,
      tagline: data.websiteIntelligence?.tagline,
    };
    
    return (
      <BrandCustomization
        websiteIntelligence={brandingIntelligence}
        industry={data.industry}
        onComplete={handleBrandComplete}
        onBack={handleBack}
        onUseDefaults={handleUseDefaults}
      />
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] relative">
      {/* Ambient Hero Background */}
      {data.industryCategory && (
        <AmbientHeroBackground
          images={heroImages}
          isLocked={isHeroLocked}
          lockedIndex={heroLockedIndex}
          currentIndex={heroCurrentIndex}
          isGenerating={isHeroGenerating}
          onSelect={handleHeroSelect}
          onRegenerate={handleHeroRegenerate}
          onUnlock={handleHeroUnlock}
          onDotClick={handleHeroDotClick}
        />
      )}
      
      {/* Wizard Questions - floating above background */}
      <div className="relative z-10 max-w-4xl mx-auto p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
      {/* Restore Prompt */}
      {showRestorePrompt && pendingRestore && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/80 border border-cyan-500/30 rounded-xl p-4 mb-6"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-medium mb-1">Continue where you left off?</h3>
              <p className="text-slate-400 text-sm mb-3">
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
                  className="bg-cyan-500 hover:bg-cyan-600 text-white"
                >
                  Continue
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    localStorage.removeItem('pageconsult_consultation_draft');
                    setShowRestorePrompt(false);
                    setPendingRestore(null);
                  }}
                  className="border-slate-600 bg-slate-800 text-white hover:bg-slate-700"
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
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isClickable = index <= currentStep; // Can click completed or current step
            
            const stepButton = (
              <button
                key={step.id}
                onClick={() => isClickable && setCurrentStep(index)}
                disabled={!isClickable}
                className={`flex items-center gap-2 group relative ${
                  isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                } ${
                  index <= currentStep ? 'text-cyan-400' : 'text-slate-600'
                }`}
                aria-label={`Go to step ${index + 1}: ${step.title}${isCompleted ? ' - Click to edit' : ''}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted
                      ? 'bg-cyan-500 border-cyan-500 text-white hover:bg-cyan-400 hover:border-cyan-400 hover:scale-110'
                      : isCurrent
                      ? 'border-cyan-500 text-cyan-400 ring-2 ring-cyan-500/30 hover:ring-cyan-500/50'
                      : 'border-slate-700 text-slate-600 opacity-50'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                
                {/* Custom tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <div className="bg-slate-900 text-white text-xs px-3 py-1.5 rounded-md whitespace-nowrap border border-slate-700 shadow-lg">
                    {step.title}
                    {isCompleted && <span className="text-cyan-400 ml-1">• Click to edit</span>}
                    {isCurrent && <span className="text-cyan-400 ml-1">• Current</span>}
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                    <div className="border-4 border-transparent border-t-slate-900"></div>
                  </div>
                </div>
              </button>
            );
            
            return stepButton;
          })}
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="text-center text-sm text-slate-400 mt-2">
          Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep]?.title || 'Loading...'}
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
          className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8"
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          className="border-slate-600 bg-slate-800 text-white hover:bg-slate-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        {/* Save Progress Button */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleSaveProgress}
            disabled={isSaving}
            className="border-slate-600 bg-slate-800 text-white hover:bg-slate-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save
              </>
            )}
          </Button>
          {lastSaved && (
            <span className="text-xs text-slate-500 hidden sm:inline">
              Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
            </span>
          )}
        </div>
        
        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
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
      </div>

      {/* Collapsible Brief Panel - fixed position overlay */}
      <CollapsibleBriefPanel 
        wizardData={data} 
        brandBrief={brandBrief} 
        brandLoading={brandLoading}
        onFieldChange={handleBriefFieldChange}
        userId={userId}
      />
    </div>
  );
}
