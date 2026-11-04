import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Globe, Sparkles, Building2, Users, Trophy, Target, CheckCircle2, Loader2, ExternalLink, RotateCcw, Palette, FileText, TrendingUp, UserCheck, Rocket, Calendar, Gift, Share2, Check, Save } from 'lucide-react';
import { toast } from 'sonner';
import { optimizeFromProfile, profileFromConsultation, messagingChoicesFrom } from '@/utils/archetypeOptimizer';
import { isLimitReached, LIMIT_REACHED_MESSAGE } from '@/lib/limitReached';
import { PageBuildCost } from '@/components/usage/PageBuildCost';
import { announceUsageChanged } from '@/hooks/useAIActions';
import { formatDistanceToNow } from 'date-fns';
import { IndustrySelector } from './IndustrySelector';
import { InlineConsultant } from './InlineConsultant';
import { getSkipCoaching, type CoachingResult, type WizardContext } from '@/utils/consultantCoaching';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { BriefProgressLoader } from './BriefProgressLoader';
import { getWizardPlaceholders, getOfferKind, frustrationQuestion, uniqueStrengthExample, wizardLabels } from '@/lib/wizard/industryWording';
import { QuestionExplainer, QUESTION_EXPLAINERS } from './QuestionExplainer';
import type { AISeoData } from '@/services/intelligence/types';
import { BrandCustomization, type BrandSettings, type WebsiteIntelligence } from './BrandCustomization';
import { CollapsibleBriefPanel } from './CollapsibleBriefPanel';
import { useBrandBrief } from '@/hooks/useBrandBrief';
import { extractStructuredBrief } from '@/lib/extractStructuredBrief';
import { websiteFirstPrefill, type WebsiteFirstAnalysis } from '@/lib/websiteFirst';
import { AmbientGradientBackground } from './AmbientGradientBackground';
import { 
  classifyIndustry, 
  storeClassificationOnConsultation, 
  type IndustryClassification, 
  type ConsultationContext 
} from '@/lib/industryClassification';
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
  type TeamAdvisorsData,
  CampaignContextStep,
  type CampaignContextData,
  type PagePurpose,
  type TrafficSource,
} from './steps';
import {
  BetaStageStep,
  BetaTimelineStep,
  BetaPerksStep,
  BetaViralStep,
  type RewardTier
} from './beta';
import { useDevMode } from '@/components/dev/DevToolbar';
import { BuyerObjectionChecklist } from './BuyerObjectionChecklist';
import { SectionUnlockReview } from './SectionUnlockReview';
import { missingSections } from '@/lib/sectionUnlocks';
import { localServiceBusiness, type BuyerObjection } from '../../../supabase/functions/_shared/buyerObjections';

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
    headingFont?: string | null;
    bodyFont?: string | null;
    /** Website-first: offers and CTA labels verbatim from the owner's site. */
    siteOffers?: { name: string; description: string }[];
    siteCtaLabels?: string[];
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
  objections?: BuyerObjection[];
  
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
  
  // Campaign Context
  pagePurpose?: PagePurpose;
  trafficSource?: TrafficSource;
  campaignTrigger?: string;
  campaignAudienceSegment?: string;
  spotlightService?: string;
  eventGoal?: string;
  hasExistingWebsite?: boolean;
  
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
  { id: 'campaign-context', title: 'Campaign Context', icon: Target },
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
  // Who it's for and what it changes: without this the brief invented the audience and the problem.
  { id: 'audience', title: 'Target Audience', icon: Users },
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
// Local trades price per visit or per job, not per engagement.
const LOCAL_PRICE_RANGES = [
  'Under $100 per visit',
  '$100 - $300 per visit',
  '$300 - $1,000 per job',
  '$1,000 - $5,000 per job',
  '$5,000+ per project',
  'Custom / Varies',
];

const PRIMARY_GOALS = [
  { value: 'leads', label: 'Generate Leads', desc: 'Capture contact info via form' },
  { value: 'calls', label: 'Phone Calls', desc: 'Get prospects to call you' },
  { value: 'meetings', label: 'Book Meetings', desc: 'Schedule consultations/demos' },
  { value: 'sales', label: 'Direct Sales', desc: 'Sell product/service directly' },
];
/** Music, film, writing, games: people pre-save, listen, read or follow; they don't book a call. */
const CREATIVE_GOALS = [
  { value: 'follow', label: 'Pre-save, Listen or Follow', desc: 'Send people to where the work lives' },
  { value: 'sales', label: 'Buy It', desc: 'Sell the record, book, ticket or download' },
  { value: 'leads', label: 'Join the List', desc: 'Collect emails for releases and shows' },
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

// Extracted brand from BrandExtractor
interface ExtractedBrandData {
  companyName: string | null;
  faviconUrl: string | null;
  description: string | null;
  tagline: string | null;
  themeColor: string | null;
  secondaryColor?: string | null;
  accentColor?: string | null;
  logoUrl?: string | null;
  ogImage: string | null;
  domain: string;
  websiteUrl?: string;
}

type WebsiteAnalysis = WebsiteFirstAnalysis;

interface Props {
  onComplete: (
    data: ConsultationData, 
    strategyBrief: string, 
    aiSeoData?: AISeoData | null, 
    structuredBrief?: any,
    industryClassification?: IndustryClassification | null
  ) => void;
  onBack?: () => void;
  prefillData?: PrefillData | null;
  extractedBrand?: ExtractedBrandData | null;
  skipDraftLoad?: boolean;
  websiteAnalysis?: WebsiteAnalysis | null;
  /** Business name the owner typed in onboarding; beats a name scraped from their site. */
  statedBusinessName?: string;
}

// Brand fields are never persisted in drafts — they live only in React state for the current session
const DRAFT_BRAND_FIELDS = ['heroBackgroundUrl', 'brandSettings', 'websiteIntelligence'] as const;
function stripDraftBrandFields<T extends Record<string, any>>(value: T, phase: 'save' | 'restore'): T {
  if (!value || typeof value !== 'object') return value;
  const copy: Record<string, any> = { ...value };
  const stripped = DRAFT_BRAND_FIELDS.filter((k) => k in copy);
  DRAFT_BRAND_FIELDS.forEach((k) => delete copy[k]);
  if (stripped.length) console.log(`🧹 [Draft] Brand fields stripped from ${phase}:`, stripped);
  return copy as T;
}

export function StrategicConsultation({ onComplete, onBack, prefillData, extractedBrand, skipDraftLoad, websiteAnalysis, statedBusinessName }: Props) {
  // Check if dev mode is active
  const [isDevModeActive] = useDevMode();
  // Pre-generate section check (must stay above every early return: hooks run in a fixed order).
  const [unlockReviewOpen, setUnlockReviewOpen] = useState(false);
  const [unlockReviewShown, setUnlockReviewShown] = useState(false);
  
  // Initialize data with prefill values if available
  const getInitialData = (): Partial<ConsultationData> => {
    const initial: Partial<ConsultationData> = {};
    
    // WEBSITE ANALYSIS TAKES TOP PRIORITY (AI analyzed the full site).
    // websiteFirstPrefill fills the same fields the wizard collects: offers/CTA
    // verbatim from the site, real extracted colours, industry as selector labels.
    if (websiteAnalysis) {
      console.log('🤖 Using AI website analysis for initial data');
      return websiteFirstPrefill(websiteAnalysis, extractedBrand) as Partial<ConsultationData>;
    }
    
    // EXTRACTED BRAND TAKES SECOND PRIORITY
    // This is real user data from their website - never override it
    if (extractedBrand) {
      if (extractedBrand.companyName) {
        initial.businessName = extractedBrand.companyName;
      }
      if (extractedBrand.websiteUrl) {
        initial.websiteUrl = extractedBrand.websiteUrl;
        initial.hasExistingWebsite = true;
      }
      if (extractedBrand.tagline || extractedBrand.description) {
        initial.uniqueStrength = extractedBrand.tagline || extractedBrand.description || '';
      }
      if (extractedBrand.themeColor || extractedBrand.logoUrl) {
        initial.brandSettings = {
          logoUrl: extractedBrand.logoUrl || null,
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
        logoUrl: extractedBrand.logoUrl || null,
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
    // 2. Dev mode is active OR source is from demo flow
    const shouldApplyPrefill = prefillData?.extracted && 
      (isDevModeActive || prefillData.source === 'landing_demo' || prefillData.source === 'demo_consultation');
    
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
  const [data, setData] = useState<Partial<ConsultationData>>(() => {
    const initial = getInitialData();
    return statedBusinessName?.trim() ? { ...initial, businessName: statedBusinessName.trim() } : initial;
  });
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
  const [skipCoachingResult, setSkipCoachingResult] = useState<CoachingResult | null>(null);

  // Coaching context derived from current wizard data
  const coachingContext: WizardContext = useMemo(() => ({
    industry: data.industry,
    pageType: data.pageType,
    pagePurpose: data.pagePurpose,
    businessName: data.businessName,
    productName: data.productName,
    concreteProofStory: data.concreteProofStory,
  }), [data.industry, data.pageType, data.pagePurpose, data.businessName, data.productName, data.concreteProofStory]);

  const consultantBlurHandlersRef = useRef<Record<string, (() => void) | undefined>>({});

  const registerConsultantBlurHandler = useCallback((fieldKey: string, handler: () => void) => {
    consultantBlurHandlersRef.current[fieldKey] = handler;
  }, []);

  const triggerConsultantBlur = useCallback((fieldKey: string) => {
    consultantBlurHandlersRef.current[fieldKey]?.();
  }, []);
  
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
  // Also check extractedBrand prop for colors from EnhancedBrandSetup flow
  // Saved-brand auto-apply visibility: applied = notice shown; dismissed = user chose "Change brand"
  const [savedBrandApplied, setSavedBrandApplied] = useState(false);
  const [savedBrandDismissed, setSavedBrandDismissed] = useState(false);
  // Precedence: a fresh same-session extractedBrand always wins over the saved brandBrief
  const hasFreshExtractedBrand = Boolean(extractedBrand?.themeColor || extractedBrand?.logoUrl);
  // The brand step is skipped only for a brand the owner already set up and saved. A fresh site read
  // is a set of guesses (colours, and an image that may be cover art, not a logo), so the owner
  // confirms it in the brand step before it's used.
  const hasBrandColors = Boolean(!savedBrandDismissed && brandBrief?.colors?.primary?.hex && !hasFreshExtractedBrand);
  
  // Sync extractedBrand to consultation data when available (from EnhancedBrandSetup flow)
  useEffect(() => {
    if (extractedBrand && (extractedBrand.themeColor || extractedBrand.logoUrl || extractedBrand.companyName)) {
      
      setData(prev => ({
        ...prev,
        // Brand settings
        // Real extracted colours only: no substituted hex (an invented colour would
        // outrank the industry default), and never clobber colours already prefilled.
        brandSettings: {
          primaryColor: extractedBrand.themeColor || prev.brandSettings?.primaryColor || '',
          secondaryColor: extractedBrand.secondaryColor || prev.brandSettings?.secondaryColor || '',
          logoUrl: extractedBrand.logoUrl || prev.brandSettings?.logoUrl || null,
          headingFont: prev.brandSettings?.headingFont || 'Inter',
          bodyFont: prev.brandSettings?.bodyFont || 'Inter',
          modified: true,
        },
        // Website intelligence
        websiteIntelligence: {
          ...prev.websiteIntelligence,
          logoUrl: extractedBrand.logoUrl || prev.websiteIntelligence?.logoUrl || null,
          brandColors: ([extractedBrand.themeColor, extractedBrand.secondaryColor, extractedBrand.accentColor].filter(Boolean) as string[]).length
            ? [extractedBrand.themeColor, extractedBrand.secondaryColor, extractedBrand.accentColor].filter(Boolean) as string[]
            : prev.websiteIntelligence?.brandColors || [],
          primaryColor: extractedBrand.themeColor || prev.websiteIntelligence?.primaryColor || null,
          secondaryColor: extractedBrand.secondaryColor || prev.websiteIntelligence?.secondaryColor || null,
          companyName: extractedBrand.companyName || prev.websiteIntelligence?.companyName || null,
          tagline: extractedBrand.tagline || prev.websiteIntelligence?.tagline || null,
          description: extractedBrand.description || prev.websiteIntelligence?.description || null,
          title: extractedBrand.companyName || prev.websiteIntelligence?.title || null,
          heroText: prev.websiteIntelligence?.heroText || null,
          testimonials: prev.websiteIntelligence?.testimonials || [],
        },
        // Pre-fill identity fields if available
        businessName: prev.businessName || extractedBrand.companyName || '',
      }));
    }
  }, [extractedBrand]);
  
  // Sync brandBrief to brandSettings when brand is already loaded (skipping branding step)
  useEffect(() => {
    if (hasBrandColors && brandBrief && !data.brandSettings && !hasFreshExtractedBrand && !savedBrandDismissed) {
      console.log('🎨 [Consultation] Saved brand auto-applied:', brandBrief.name || 'your saved brand');
      setSavedBrandApplied(true);
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
        // Also feed the brand-match step (BrandCustomization reads websiteIntelligence)
        websiteIntelligence: {
          logoUrl: brandBrief.logo_url || prev.websiteIntelligence?.logoUrl || null,
          brandColors: [brandBrief.colors?.primary?.hex, brandBrief.colors?.secondary?.hex].filter(Boolean) as string[],
          primaryColor: brandBrief.colors?.primary?.hex || prev.websiteIntelligence?.primaryColor || null,
          secondaryColor: brandBrief.colors?.secondary?.hex || prev.websiteIntelligence?.secondaryColor || null,
          headingFont: brandBrief.typography?.headlineFont || null,
          bodyFont: brandBrief.typography?.bodyFont || null,
          title: prev.websiteIntelligence?.title || null,
          tagline: prev.websiteIntelligence?.tagline || null,
          description: prev.websiteIntelligence?.description || null,
          heroText: prev.websiteIntelligence?.heroText || null,
          testimonials: prev.websiteIntelligence?.testimonials || [],
          companyName: prev.websiteIntelligence?.companyName || null,
        },
      }));
    }
  }, [hasBrandColors, brandBrief, data.brandSettings, hasFreshExtractedBrand, savedBrandDismissed]);

  // "Change brand": clear the auto-applied saved brand for THIS consultation and route into the existing branding step
  const handleChangeSavedBrand = useCallback(() => {
    console.log('🎨 [Consultation] Saved brand cleared by user');
    setSavedBrandDismissed(true);
    setSavedBrandApplied(false);
    // Neutral/unset — no default hex values substituted; also clear the auto-applied
    // websiteIntelligence brand fields so the branding step doesn't keep showing them
    setData(prev => ({ ...prev, brandSettings: undefined, websiteIntelligence: undefined }));
    // With hasBrandColors false, STEPS includes 'branding' as the first step
    setCurrentStep(0);
  }, []);
  
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
        case 'campaign-context':
          if (!savedData.pagePurpose) return i;
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
        const savedData = stripDraftBrandFields(draft.wizard_data as Partial<ConsultationData>, 'restore');
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
    // Guard against undefined/null strings that would crash JSON.parse
    if (saved && saved !== 'undefined' && saved !== 'null') {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          const { currentStep: savedStep, timestamp } = parsed;
          const savedData = stripDraftBrandFields(parsed.data || {}, 'restore') as Partial<ConsultationData>;
        
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
        }
      } catch (e) {
        console.warn('Failed to parse saved consultation:', e);
        localStorage.removeItem('pageconsult_consultation_draft');
      }
    }
  }, [extractedBrand, skipDraftLoad, STEPS, findFirstIncompleteStep]);

  // Save progress whenever data or step changes (debounced)
  useEffect(() => {
    if (Object.keys(data).length === 0) return;
    
    const timeoutId = setTimeout(() => {
      localStorage.setItem('pageconsult_consultation_draft', JSON.stringify({
        currentStep,
        data: stripDraftBrandFields(data, 'save'),
        timestamp: Date.now()
      }));
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [currentStep, data]);

  // A finished consultation leaves no draft row behind
  const deleteDbDraftOnCompletion = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase.from('consultation_drafts').delete().eq('user_id', user.id);
      if (error) console.warn('⚠️ [Draft] Failed to delete consultation_drafts row:', error);
      else console.log('🧹 [Draft] Deleted consultation_drafts row on completion');
    } catch (e) {
      console.warn('⚠️ [Draft] Draft deletion error:', e);
    }
  };

  // Manual save handler
  const handleSaveProgress = async () => {
    setIsSaving(true);
    
    try {
      // Always save to localStorage
      localStorage.setItem('pageconsult_consultation_draft', JSON.stringify({
        currentStep,
        data: stripDraftBrandFields(data, 'save'),
        timestamp: Date.now()
      }));
      
      // If authenticated, also save to database
      if (userId) {
        await supabase.from('consultation_drafts').upsert(
          {
            user_id: userId,
            wizard_data: stripDraftBrandFields(data, 'save') as any,
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
          <p className="text-slate-300">Loading your brand...</p>
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
      
      const extracted = result?.data || result;
      if (extracted?.success) {
        updateData({
          websiteIntelligence: extracted,
          businessName: extracted.companyName || data.businessName || ''
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
      case 'campaign-context':
        return !!data.pagePurpose; // Must select a page purpose
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
    
    // Clear any previous skip coaching
    setSkipCoachingResult(null);
    
    // Check for skipped optional fields and show coaching
    const skippedFields: string[] = [];
    if (currentStepId === 'credibility') {
      if (!data.testimonialText?.trim()) skippedFields.push('testimonialText');
      if (!data.concreteProofStory?.trim()) skippedFields.push('concreteProofStory');
      if (!data.proofStoryContext?.trim()) skippedFields.push('proofStoryContext');
      if (!data.achievements?.trim()) skippedFields.push('achievements');
    }
    // Buyer questions are explicitly skippable; no coaching re-asks a skipped topic.
    
    if (skippedFields.length > 0) {
      const coaching = getSkipCoaching(skippedFields, coachingContext);
      if (coaching) {
        setSkipCoachingResult(coaching);
        // Still proceed — coaching is informational, not blocking
      }
    }
    
    // If moving from website step and no website intelligence, skip branding step
    if (currentStepId === 'website' && !data.websiteIntelligence) {
      setCurrentStep(currentStep + 2);
      return;
    }
    
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (!unlockReviewShown && missingSections(data).length > 0) {
      // Last check: show which sections the page will skip and the one question that adds each.
      setUnlockReviewShown(true);
      setUnlockReviewOpen(true);
    } else {
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
      // === STEP 1: Run intelligent industry classification FIRST ===
      // This runs BEFORE brief generation so classification is available for the brief
      const classificationContext: ConsultationContext = {
        businessName: data.businessName,
        industry: data.industry,
        industryCategory: data.industryCategory,
        industrySubcategory: data.industrySubcategory,
        idealClient: data.idealClient,
        uniqueStrength: data.uniqueStrength,
        mainOffer: data.mainOffer,
        identitySentence: data.identitySentence,
        targetAudience: data.idealClient,
        serviceType: data.mainOffer,
        challenge: data.clientFrustration,
        goal: data.primaryGoal,
      };
      
      console.log('🧠 [consultation-complete] Running industry classification...');
      const classification = await classifyIndustry(
        data.industry,
        classificationContext,
        {
          industryCategory: data.industryCategory,
          industrySubcategory: data.industrySubcategory,
          pageType: data.pageType,
        }
      );
      
      console.log('🧠 [consultation-complete] Industry classified:', classification.variant, '| Source:', classification.source, '| Reasoning:', classification.reasoning);
      
      // === STEP 2: Generate strategy brief and extract AI SEO data in parallel ===
      const [briefResult, seoResult] = await Promise.all([
        supabase.functions.invoke('generate-strategy-brief', {
          body: { 
            consultationData: data,
            // Scored from the owner's answers before the brief, so the brief is written to them.
            messagingChoices: (() => { try { return messagingChoicesFrom(optimizeFromProfile(profileFromConsultation(data)).primary); } catch { return null; } })(),
            industryClassification: classification // Pass classification to brief generation
          }
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
      let structuredBrief = briefResult.data.structuredBrief;
      if (!structuredBrief && strategyBriefText) {
        const recovered = extractStructuredBrief(strategyBriefText);
        if (recovered) {
          structuredBrief = recovered;
          console.log('🧩 [StrategicConsultation] structuredBrief recovered client-side');
        } else {
          console.log('🔴 [StrategicConsultation] structuredBrief NULL — edge fn returned none and client re-extract failed');
        }
      }
      
      // Clear the draft since consultation is complete
      localStorage.removeItem('pageconsult_consultation_draft');
      await deleteDbDraftOnCompletion();
      
      // Pass BOTH the text brief AND the structured JSON brief AND the classification
      announceUsageChanged();
      onComplete(data as ConsultationData, strategyBriefText, aiSeoData, structuredBrief, classification);
    } catch (err) {
      console.error('Strategy brief generation error:', err);
      // Out of actions: stay on the wizard with the answers kept (the draft is not cleared).
      if (isLimitReached(err)) {
        toast.error(LIMIT_REACHED_MESSAGE);
        return;
      }
      // Fallback: proceed with basic brief (no structured brief available)
      const fallbackBrief = generateFallbackBrief(data as ConsultationData);
      
      // Clear the draft since consultation is complete
      localStorage.removeItem('pageconsult_consultation_draft');
      console.log('🗑️ Cleared consultation draft');
      await deleteDbDraftOnCompletion();
      
      // Fallback classification - use sync keyword match
      const fallbackClassification: IndustryClassification = {
        variant: 'consulting',
        confidence: 'low',
        reasoning: 'Fallback during error - using safest default',
        source: 'fallback',
        classifiedAt: new Date().toISOString()
      };
      
      onComplete(data as ConsultationData, fallbackBrief, null, null, fallbackClassification);
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
    const stepKind = getOfferKind(data.industryCategory || data.industry, data.industrySubcategory);
    const L = wizardLabels(stepKind);
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

      case 'campaign-context':
        return (
          <CampaignContextStep
            data={{
              pagePurpose: data.pagePurpose,
              trafficSource: data.trafficSource,
              campaignTrigger: data.campaignTrigger,
              campaignAudienceSegment: data.campaignAudienceSegment,
              spotlightService: data.spotlightService,
              eventGoal: data.eventGoal,
              hasExistingWebsite: data.hasExistingWebsite,
            }}
            websiteUrl={data.websiteUrl}
            onChange={(updates) => updateData(updates)}
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
              <p className="text-slate-300">The foundation for your landing page strategy.</p>
            </div>
            
            <div className="space-y-5">
              <div>
                <Label htmlFor="businessName" className="text-slate-300 inline-flex items-center">
                  Business Name *
                  <QuestionExplainer {...QUESTION_EXPLAINERS.businessName} />
                </Label>
                <Input
                  id="businessName"
                  placeholder="e.g., Acme Solutions"
                  value={data.businessName || ''}
                  onChange={(e) => updateData({ businessName: e.target.value })}
                  className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
              
              <div>
                <Label htmlFor="productName" className="text-slate-300 inline-flex items-center">
                  Product Name
                  <QuestionExplainer {...QUESTION_EXPLAINERS.productName} />
                </Label>
                <Input
                  id="productName"
                  placeholder="e.g., Claude, Notion, Figma (leave blank if same as business)"
                  value={data.productName || ''}
                  onChange={(e) => updateData({ productName: e.target.value })}
                  className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                />
                <p className="text-xs text-slate-400 mt-1.5">The name users will see on your landing page. Leave blank to use your business name.</p>
              </div>
              
              <div>
                <Label htmlFor="industry" className="text-slate-300 inline-flex items-center">
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
                <Label htmlFor="yearsInBusiness" className="text-slate-300">Years in Business</Label>
                <Input
                  id="yearsInBusiness"
                  placeholder="e.g., 5 years, Since 2015, Just started"
                  value={data.yearsInBusiness || ''}
                  onChange={(e) => updateData({ yearsInBusiness: e.target.value })}
                  className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
              
              <div>
                <Label htmlFor="uniqueStrength" className="text-slate-300 inline-flex items-center flex-wrap">
                  {data.pageType === 'beta-prelaunch'
                    ? `What will make ${data.productName || data.businessName || 'your product'} worth the wait? *`
                    : data.productName
                    ? `What does ${data.productName} do that the alternatives don't? *`
                    : "What do you do differently from the alternatives? *"}
                  <QuestionExplainer {...QUESTION_EXPLAINERS.uniqueStrength} />
                </Label>
                <Textarea
                  id="uniqueStrength"
                  placeholder={
                    data.pageType === 'beta-prelaunch'
                      ? 'e.g., One photo of your shelf gives you three dinners you can make tonight'
                      : localServiceBusiness(data)
                        ? getWizardPlaceholders(data.industryCategory).uniqueStrength
                        : uniqueStrengthExample(getOfferKind(data.industryCategory || data.industry, data.industrySubcategory), data.productName)
                  }
                  value={data.uniqueStrength || ''}
                  onChange={(e) => updateData({ uniqueStrength: e.target.value })}
                  onBlur={() => triggerConsultantBlur('uniqueStrength')}
                  className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 min-h-[100px]"
                />
                <InlineConsultant fieldKey="uniqueStrength" fieldValue={data.uniqueStrength || ''} fieldLabel="Unique Strength" context={coachingContext} onBlurHandlerReady={(handler) => registerConsultantBlurHandler('uniqueStrength', handler)} />
              </div>
              
              {/* NEW: Identity Sentence */}
              <div>
                <Label htmlFor="identitySentence" className="text-slate-300 inline-flex items-center">
                  How would you describe your business in one sentence to a peer in your industry?
                  <QuestionExplainer {...QUESTION_EXPLAINERS.identitySentence} />
                </Label>
                <p className="text-xs text-slate-400 mt-1">Not your tagline — your honest positioning.</p>
                <Textarea
                  id="identitySentence"
                  placeholder="e.g., Former plant operators who specialize in finding hidden capacity without capital investment"
                  value={data.identitySentence || ''}
                  onChange={(e) => {
                    if (e.target.value.length <= 200) {
                      updateData({ identitySentence: e.target.value });
                    }
                  }}
                  className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 min-h-[80px]"
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-slate-400">Optional but helps differentiate your page</p>
                  <span className={`text-xs ${(data.identitySentence?.length || 0) > 180 ? 'text-amber-400' : 'text-slate-500'}`}>
                    {data.identitySentence?.length || 0}/200
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'audience':
        const placeholders = getWizardPlaceholders(data.industryCategory || data.industry);
        const offerKind = getOfferKind(data.industryCategory || data.industry, data.industrySubcategory);
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Who Are You Trying to Reach?</h2>
              <p className="text-slate-300">Understanding your audience shapes everything.</p>
            </div>
            
            <div className="space-y-5">
              <div>
                <Label htmlFor="idealClient" className="text-slate-300 inline-flex items-center">
                  {L.idealClient} *
                  <QuestionExplainer {...QUESTION_EXPLAINERS.idealClient} />
                </Label>
                <Textarea
                  id="idealClient"
                  placeholder={placeholders.idealClient}
                  value={data.idealClient || ''}
                  onChange={(e) => updateData({ idealClient: e.target.value })}
                  onBlur={() => triggerConsultantBlur('idealClient')}
                  className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 min-h-[100px]"
                />
                <InlineConsultant fieldKey="idealClient" fieldValue={data.idealClient || ''} fieldLabel="Ideal Client" context={coachingContext} onBlurHandlerReady={(handler) => registerConsultantBlurHandler('idealClient', handler)} />
              </div>
              
              <div>
                <Label htmlFor="clientFrustration" className="text-slate-300 inline-flex items-center">
                  {frustrationQuestion(offerKind)} *
                  <QuestionExplainer {...QUESTION_EXPLAINERS.clientFrustration} />
                </Label>
                <Textarea
                  id="clientFrustration"
                  placeholder={placeholders.clientFrustration}
                  value={data.clientFrustration || ''}
                  onChange={(e) => updateData({ clientFrustration: e.target.value })}
                  onBlur={() => triggerConsultantBlur('clientFrustration')}
                  className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 min-h-[100px]"
                />
                <InlineConsultant fieldKey="clientFrustration" fieldValue={data.clientFrustration || ''} fieldLabel="Client Frustration" context={coachingContext} onBlurHandlerReady={(handler) => registerConsultantBlurHandler('clientFrustration', handler)} />
              </div>
              
              <div>
                <Label htmlFor="desiredOutcome" className="text-slate-300 inline-flex items-center">
                  {L.desiredOutcome} *
                  <QuestionExplainer {...QUESTION_EXPLAINERS.desiredOutcome} />
                </Label>
                <Textarea
                  id="desiredOutcome"
                  placeholder={placeholders.desiredOutcome}
                  value={data.desiredOutcome || ''}
                  onChange={(e) => updateData({ desiredOutcome: e.target.value })}
                  onBlur={() => triggerConsultantBlur('desiredOutcome')}
                  className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 min-h-[100px]"
                />
                <InlineConsultant fieldKey="desiredOutcome" fieldValue={data.desiredOutcome || ''} fieldLabel="Desired Outcome" context={coachingContext} onBlurHandlerReady={(handler) => registerConsultantBlurHandler('desiredOutcome', handler)} />
              </div>
            </div>
          </div>
        );

      case 'credibility':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Your Track Record</h2>
              <p className="text-slate-300">Proof you can stand behind. Leave out anything you can't back up.</p>
            </div>
            
            <div className="space-y-5">
              <div>
                <Label htmlFor="clientCount" className="text-slate-300 inline-flex items-center">
                  {L.clientCount}
                  <QuestionExplainer {...QUESTION_EXPLAINERS.clientCount} />
                </Label>
                <Input
                  id="clientCount"
                  placeholder="Only a count you can back up, e.g. the number of clients you have served"
                  value={data.clientCount || ''}
                  onChange={(e) => updateData({ clientCount: e.target.value })}
                  className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
              
              <div>
                <Label htmlFor="achievements" className="text-slate-300 inline-flex items-center">
                  {L.achievements}
                  <QuestionExplainer {...QUESTION_EXPLAINERS.achievements} />
                </Label>
                <Textarea
                  id="achievements"
                  placeholder="Real certifications, awards, press or named clients. Leave blank if none."
                  value={data.achievements || ''}
                  onChange={(e) => updateData({ achievements: e.target.value })}
                  onBlur={() => triggerConsultantBlur('achievements')}
                  className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 min-h-[80px]"
                />
                <InlineConsultant fieldKey="achievements" fieldValue={data.achievements || ''} fieldLabel="Achievements" context={coachingContext} isOptional skipCoaching={skipCoachingResult} onBlurHandlerReady={(handler) => registerConsultantBlurHandler('achievements', handler)} />
              </div>
              
              <div>
                <Label htmlFor="testimonialText" className="text-slate-300 inline-flex items-center">
                  {L.testimonialText}
                  <QuestionExplainer {...QUESTION_EXPLAINERS.testimonialText} />
                </Label>
                <Textarea
                  id="testimonialText"
                  placeholder={'e.g., "Working with [you] was the best decision we made. They handled everything professionally and our clients loved them." - Sarah M., Event Planner'}
                  value={data.testimonialText || ''}
                  onChange={(e) => updateData({ testimonialText: e.target.value })}
                  onBlur={() => triggerConsultantBlur('testimonialText')}
                  className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 min-h-[100px]"
                />
                <InlineConsultant fieldKey="testimonialText" fieldValue={data.testimonialText || ''} fieldLabel="Testimonial" context={coachingContext} isOptional skipCoaching={skipCoachingResult} onBlurHandlerReady={(handler) => registerConsultantBlurHandler('testimonialText', handler)} />
              </div>
              
              {/* NEW: Concrete Proof Story */}
              <div className="pt-4 border-t border-slate-700">
                <Label htmlFor="concreteProofStory" className="text-slate-300 inline-flex items-center">
                  {L.concreteProofStory}
                  <QuestionExplainer {...QUESTION_EXPLAINERS.concreteProofStory} />
                </Label>
                <p className="text-xs text-slate-400 mt-1">You can anonymize. Format: "[Type of client] achieved [specific outcome] in [timeframe]"</p>
                <Textarea
                  id="concreteProofStory"
                  placeholder="e.g., A food & beverage manufacturer found 18% idle capacity within 60 days"
                  value={data.concreteProofStory || ''}
                  onChange={(e) => {
                    if (e.target.value.length <= 300) {
                      updateData({ concreteProofStory: e.target.value });
                    }
                  }}
                  onBlur={() => triggerConsultantBlur('concreteProofStory')}
                  className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 min-h-[80px]"
                />
                <div className="flex justify-between mt-1">
                  <div className="text-xs text-slate-400 space-y-0.5">
                    <p>Examples:</p>
                    <p className="text-slate-600">• "A 50-person SaaS company reduced churn from 8% to 3% in one quarter"</p>
                    <p className="text-slate-600">• "A local dental practice went from 20 to 45 new patients/month in 90 days"</p>
                  </div>
                  <span className={`text-xs ${(data.concreteProofStory?.length || 0) > 270 ? 'text-amber-400' : 'text-slate-500'}`}>
                    {data.concreteProofStory?.length || 0}/300
                  </span>
                </div>
                <InlineConsultant fieldKey="concreteProofStory" fieldValue={data.concreteProofStory || ''} fieldLabel="Proof Story" context={coachingContext} skipCoaching={skipCoachingResult} onBlurHandlerReady={(handler) => registerConsultantBlurHandler('concreteProofStory', handler)} />
              </div>
              
              {/* Proof Story Context - only show if proof story has content */}
              {data.concreteProofStory && data.concreteProofStory.length > 10 && (
                <div>
                  <Label htmlFor="proofStoryContext" className="text-slate-300">
                    What made this result possible? (One sentence)
                  </Label>
                  <Input
                    id="proofStoryContext"
                    placeholder="e.g., We mapped their changeover process and found 40 minutes of waste per shift."
                    value={data.proofStoryContext || ''}
                    onChange={(e) => updateData({ proofStoryContext: e.target.value })}
                    className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
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
              <p className="text-slate-300">The specifics of what visitors will get.</p>
            </div>
            
            <div className="space-y-5">
              <div>
                <Label htmlFor="mainOffer" className="text-slate-300 inline-flex items-center">
                  Main service or product name *
                  <QuestionExplainer {...QUESTION_EXPLAINERS.mainOffer} />
                </Label>
                <Input
                  id="mainOffer"
                  placeholder={getWizardPlaceholders(data.industryCategory || data.industry).mainOffer}
                  value={data.mainOffer || ''}
                  onChange={(e) => updateData({ mainOffer: e.target.value })}
                  onBlur={() => triggerConsultantBlur('mainOffer')}
                  className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                />
                <InlineConsultant fieldKey="mainOffer" fieldValue={data.mainOffer || ''} fieldLabel="Main Offer" context={coachingContext} onBlurHandlerReady={(handler) => registerConsultantBlurHandler('mainOffer', handler)} />
              </div>
              
              <div>
                <Label htmlFor="offerIncludes" className="text-slate-300">
                  {L.offerIncludes} *
                </Label>
                <Textarea
                  id="offerIncludes"
                  placeholder={getWizardPlaceholders(data.industryCategory || data.industry).offerIncludes}
                  value={data.offerIncludes || ''}
                  onChange={(e) => updateData({ offerIncludes: e.target.value })}
                  onBlur={() => triggerConsultantBlur('offerIncludes')}
                  className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 min-h-[100px]"
                />
                <InlineConsultant fieldKey="offerIncludes" fieldValue={data.offerIncludes || ''} fieldLabel="Offer Includes" context={coachingContext} onBlurHandlerReady={(handler) => registerConsultantBlurHandler('offerIncludes', handler)} />
              </div>
              
              <div>
                <Label htmlFor="investmentRange" className="text-slate-300">
                  Investment range
                </Label>
                <select
                  id="investmentRange"
                  value={data.investmentRange || ''}
                  onChange={(e) => updateData({ investmentRange: e.target.value })}
                  className="mt-2 w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-3"
                >
                  <option value="">Select range...</option>
                  {(localServiceBusiness(data) ? LOCAL_PRICE_RANGES : INVESTMENT_RANGES).map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="processDescription" className="text-slate-300 inline-flex items-center">
                  {L.processDescription}
                  <QuestionExplainer {...QUESTION_EXPLAINERS.processDescription} />
                </Label>
                <Textarea
                  id="processDescription"
                  placeholder={localServiceBusiness(data) ? 'e.g., 1) Text or call for a quote, 2) We look at the job and give you a price, 3) We book a day and do the work' : 'e.g., 1) Free 15-min call to discuss needs, 2) Custom proposal within 48 hours, 3) Planning session if booked, 4) Delivery/event day'}
                  value={data.processDescription || ''}
                  onChange={(e) => updateData({ processDescription: e.target.value })}
                  onBlur={() => triggerConsultantBlur('processDescription')}
                  className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 min-h-[100px]"
                />
                <InlineConsultant fieldKey="processDescription" fieldValue={data.processDescription || ''} fieldLabel="Process Description" context={coachingContext} onBlurHandlerReady={(handler) => registerConsultantBlurHandler('processDescription', handler)} />
              </div>
              <div className="pt-4 border-t border-slate-700">
                <Label className="text-slate-300">
                  What happens in the first 30 days of working with you?
                </Label>
                <p className="text-xs text-slate-400 mt-1">Just the highlights — 2-3 concrete steps your clients experience</p>
                
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
                      className="flex-1 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
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
                      className="flex-1 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
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
                      className="flex-1 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">Optional — helps power the "How It Works" section</p>
              </div>
              
              {/* Calculator context: only offers whose results are measured across clients */}
              {data.pageType === 'customer-acquisition' && ['services', 'software', 'general'].includes(stepKind) && (
                <div className="pt-4 border-t border-slate-700">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    <Label className="text-slate-400 font-medium">ROI Calculator Context</Label>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">Optional — If you want a calculator on your page, these fields help set expectations</p>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="calculatorTypicalResults" className="text-slate-400 text-sm">
                        What's the typical range of results your clients see?
                      </Label>
                      <Input
                        id="calculatorTypicalResults"
                        placeholder="Only a range you have measured across clients"
                        value={data.calculatorTypicalResults || ''}
                        onChange={(e) => updateData({ calculatorTypicalResults: e.target.value })}
                        className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="calculatorDisclaimer" className="text-slate-400 text-sm">
                        What's NOT included in this estimate?
                      </Label>
                      <p className="text-xs text-slate-400 mt-0.5">Builds trust by setting expectations</p>
                      <Input
                        id="calculatorDisclaimer"
                        placeholder="e.g., Doesn't account for implementation time or one-time costs"
                        value={data.calculatorDisclaimer || ''}
                        onChange={(e) => updateData({ calculatorDisclaimer: e.target.value })}
                        className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
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
                        className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
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
              <p className="text-slate-300">Final details to optimize your conversion strategy.</p>
            </div>
            
            <div className="space-y-5">
              <div>
                <Label className="text-slate-300 inline-flex items-center">
                  Primary goal *
                  <QuestionExplainer {...QUESTION_EXPLAINERS.primaryGoal} />
                </Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {(stepKind === 'creative' ? CREATIVE_GOALS : PRIMARY_GOALS).map(goal => (
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
                <Label htmlFor="ctaText" className="text-slate-300 inline-flex items-center">
                  What should the main button say? *
                  <QuestionExplainer {...QUESTION_EXPLAINERS.ctaText} />
                </Label>
                <Input
                  id="ctaText"
                  placeholder={stepKind === 'creative' ? "e.g., Pre-save, Listen now, Read the first chapter" : "e.g., Schedule a Consultation, Book a Demo"}
                  value={data.ctaText || ''}
                  onChange={(e) => updateData({ ctaText: e.target.value })}
                  className="mt-2 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
              
              <BuyerObjectionChecklist value={data.objections} context={data} onChange={objections => updateData({ objections, objectionsToOvercome: objections.filter(o => o.answer.trim()).map(o => `${o.question}\n${o.answer}`).join('\n\n') })} />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isGeneratingBrief) {
    return <BriefProgressLoader />;
  }

  // Brand customization step renders as full-page component
  if (STEPS[currentStep]?.id === 'branding') {
    // Use explicit primaryColor/secondaryColor if available, fallback to brandColors array
    const primaryColor = data.websiteIntelligence?.primaryColor || data.websiteIntelligence?.brandColors?.[0];
    const secondaryColor = data.websiteIntelligence?.secondaryColor || data.websiteIntelligence?.brandColors?.[1];
    
    const brandingIntelligence: WebsiteIntelligence = {
      url: data.websiteUrl || '',
      logoUrl: data.websiteIntelligence?.logoUrl,
      colors: data.websiteIntelligence?.brandColors || [],
      primaryColor: primaryColor || undefined,
      secondaryColor: secondaryColor || undefined,
      companyName: data.websiteIntelligence?.companyName,
      tagline: data.websiteIntelligence?.tagline,
      headingFont: data.websiteIntelligence?.headingFont || data.brandSettings?.headingFont,
      bodyFont: data.websiteIntelligence?.bodyFont || data.brandSettings?.bodyFont,
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
      <SectionUnlockReview
        open={unlockReviewOpen}
        data={data}
        onChange={(updates) => updateData(updates as Partial<ConsultationData>)}
        onClose={() => setUnlockReviewOpen(false)}
        onGenerate={() => { setUnlockReviewOpen(false); void generateStrategyBrief(); }}
      />
      {/* Ambient background: brand-derived gradient, no generated photos (the editor owns page photos) */}
      <AmbientGradientBackground
        primaryColor={data.brandSettings?.primaryColor || (savedBrandDismissed ? null : brandBrief?.colors?.primary?.hex) || extractedBrand?.themeColor}
        secondaryColor={data.brandSettings?.secondaryColor || (savedBrandDismissed ? null : brandBrief?.colors?.secondary?.hex)}
      />
      
      {/* Wizard Questions - floating above background */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-5 md:px-8 md:py-6">
        <div className="max-w-2xl mx-auto">
      {/* Saved brand auto-apply notice (informational, non-blocking) */}
      {savedBrandApplied && brandBrief && (
        <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 mb-4">
          {brandBrief.logo_url ? (
            <img src={brandBrief.logo_url} alt="" className="w-8 h-8 rounded object-contain bg-white/5 flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center flex-shrink-0">
              <Palette className="w-4 h-4 text-slate-300" />
            </div>
          )}
          <p className="flex-1 text-sm text-slate-300 truncate">
            Using {brandBrief.name ? <span className="text-white font-medium">{brandBrief.name}</span> : 'your saved brand'}
            {brandBrief.name ? ' — your saved brand' : ''}
          </p>
          <Button size="sm" variant="outline" onClick={handleChangeSavedBrand} className="flex-shrink-0">
            Change brand
          </Button>
        </div>
      )}
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
                    setData(stripDraftBrandFields(pendingRestore.savedData, 'restore') as ConsultationData);
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
      <div className="mb-5">
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
                  index <= currentStep ? 'text-cyan-400' : 'text-slate-300'
                }`}
                aria-label={`Go to step ${index + 1}: ${step.title}${isCompleted ? ' - Click to edit' : ''}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted
                      ? 'bg-cyan-500 border-cyan-500 text-white hover:bg-cyan-400 hover:border-cyan-400 hover:scale-110'
                      : isCurrent
                      ? 'border-cyan-500 text-cyan-400 ring-2 ring-cyan-500/30 hover:ring-cyan-500/50'
                      : 'border-slate-500/70 text-slate-300 bg-slate-900/50'
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
        <div className="h-2 bg-slate-700/80 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="text-center text-sm text-slate-200 mt-2">
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
          className="bg-slate-900/70 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 md:p-7"
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
            <span className="text-xs text-slate-400 hidden sm:inline">
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
      {currentStep === STEPS.length - 1 && <PageBuildCost className="mt-2 text-right text-slate-400" />}
        </div>
      </div>

      {/* Collapsible Brief Panel - fixed position overlay */}
      <CollapsibleBriefPanel 
        wizardData={data} 
        brandBrief={savedBrandDismissed ? null : brandBrief} 
        brandLoading={brandLoading}
        onFieldChange={handleBriefFieldChange}
        userId={userId}
      />
    </div>
  );
}
