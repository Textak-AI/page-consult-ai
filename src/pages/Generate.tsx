import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, Sparkles, Wand2, Undo2, Redo2, Brain, Rocket, Zap, AlertTriangle, RefreshCw } from "lucide-react";
import { calculateStrategicLevel } from "@/lib/strategicLevelCalculator";
import { optimizeFromProfile, type IntelProfile } from '@/utils/archetypeOptimizer';
import type { ExtractedIntelligence, ConsultationStatus } from "@/types/consultationReadiness";
import { PersonaInsightsPanel } from "@/components/editor/PersonaInsightsPanel";
import { SectionManager } from "@/components/editor/SectionManager";
import { LivePreview } from "@/components/editor/LivePreview";
import { PublishModal } from "@/components/editor/PublishModal";
import { AIConsultantSidebar } from "@/components/editor/AIConsultantSidebar";
import { CalculatorUpgradeModal } from "@/components/editor/CalculatorUpgradeModal";
import { StylePicker } from "@/components/editor/StylePicker";
import { VariantGeneratorModal } from "@/components/editor/VariantGeneratorModal";
import { UnifiedGenerationFlow } from "@/components/editor/UnifiedGenerationFlow";
import { StrategyBriefPanel } from "@/components/builder/StrategyBriefPanel";
import { ConsultantPanel } from "@/components/editor/ConsultantPanel";
import { EditingProvider, useEditing } from "@/contexts/EditingContext";
import { generateIntelligentContent, runIntelligencePipeline } from "@/services/intelligence";
import { generateIntelligentContent as generateIntelligentContentLegacy } from "@/lib/generateIntelligentContent";
import { 
  generateHeadline, 
  generateSubheadline, 
  generateFeatures as genFeatures,
  generateSocialProof as genSocialProof,
  generateCTA 
} from "@/lib/contentGenerator";
import type { PersonaIntelligence, GeneratedContent, AISeoData } from "@/services/intelligence/types";
import { cn } from "@/lib/utils";
import logo from "/logo/whiteAsset_3combimark_darkmode.svg";
import { useAIActions, type AIActionType } from "@/hooks/useAIActions";
import { useCredits } from "@/hooks/useCredits";
import { useConsultantIntegration } from '@/hooks/useConsultantIntegration';
import { usePageBuilder } from '@/hooks/usePageBuilder';
import { DigitalChampionMeter } from '@/components/consultation/DigitalChampionMeter';
import { ShareableAchievementCard } from '@/components/consultation/ShareableAchievementCard';
import { ConsultantChat } from '@/components/consultation/ConsultantChat';
import { LockedSectionOverlay } from '@/components/sections/LockedSectionOverlay';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Trophy, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { StylePresetName } from "@/styles/presets";
import {
  UsageIndicator,
  ActionConfirmModal,
  ZeroBalanceModal,
  LowBalanceAlert,
  UsageHistoryModal,
} from "@/components/usage";
import { CreditDisplay, UpgradeDrawer } from "@/components/credits";
import { generateSEOAssets, createFAQSectionConfig, isAISeoDataValid, generateSEOHeadData, type SEOHeadData } from "@/lib/aiSeoIntegration";
import { mapBriefToSections, isStructuredBriefContent, type StructuredBrief, type MappedPage } from "@/utils/sectionMapper";
import { applyArtDirectorDirectives } from "@/lib/artDirectorBrief";
import { selectSectionsFromSDI } from "@/utils/sectionSelector";
import { generateDesignSystem, designSystemToCSSVariables } from "@/config/designSystem";

// Title-case helper for industry strings in headlines
const toTitleCase = (str: string) => str.replace(/\b\w/g, c => c.toUpperCase());

// Removed old detectIndustryVariant import - using detectIndustryVariantNew from industryDesignSystem
import {
  detectIndustryVariant as detectIndustryVariantNew,
  getIndustryTokens,
  generateIndustryCSS,
  generateIndustryCSSString,
  getOptimalProofStack,
  type IndustryVariant,
  type IndustryTokens,
} from "@/lib/industryDesignSystem";
import type { DesignSystem } from "@/config/designSystem";
import { SEOHead } from "@/components/seo/SEOHead";
import { applyBrandColors } from "@/lib/colorUtils";
import { generateDesignIntelligence, generateSDIPalette, type DesignIntelligenceOutput } from "@/lib/designIntelligence";
import { intelligenceConcierge } from "@/lib/intelligenceConcierge";
import { getTargetMarketFromSources } from "@/lib/targetMarketExtractor";
import { resolveHeroImageUrl } from "@/hooks/useHeroImageResolution";
import { generateUniqueSlug } from "@/utils/slugUtils";
import { PublishToolbar } from "@/components/editor/PublishToolbar";
import { SharePreviewModal } from "@/components/editor/SharePreviewModal";
import { autoQCPass } from "@/lib/autoQCPass";
import { buildResolvedPalette, injectPaletteIntoContent } from "@/lib/resolvedPalette";

// Helper functions for transforming problem/solution statements
function transformProblemStatement(challenge?: string): string {
  if (!challenge) return "Are you struggling to achieve your business goals?";

  // Transform raw challenge into a compelling problem statement
  const cleaned = challenge
    .replace(/^they\s+/i, "Are you ")
    .replace(/^customers?\s+/i, "Do you ")
    .replace(/don't have/i, "struggling to find")
    .replace(/can't/i, "unable to")
    .replace(/lack/i, "missing")
    .trim();

  // Make it a question if it isn't already
  if (!cleaned.endsWith("?")) {
    return `${cleaned}?`;
  }

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function transformSolutionStatement(uniqueValue?: string, industry?: string): string {
  if (!uniqueValue) {
    return "We provide professional solutions designed to solve your specific challenges and deliver measurable results.";
  }

  // Transform into a clear solution statement
  const cleaned = uniqueValue
    .replace(/^(we|our)\s+/i, "Our ")
    .replace(/^have\s+/i, "")
    .replace(/^a\s+/i, "")
    .trim();

  return (
    cleaned.charAt(0).toUpperCase() +
    cleaned.slice(1) +
    ". Proven results you can measure, backed by expert support every step of the way."
  );
}

type Phase = "generating" | "editor";
type Section = {
  type: string;
  order: number;
  visible: boolean;
  content: any;
};

// Compute SDI decisions for persistence to landing_pages.design_intelligence
// This ensures multi-user isolation - each page has its own design intelligence
function computeSDIDecisions(
  consultationData: any,
  strategicData: any,
  designIntelligence: DesignIntelligenceOutput | null
): { colorMode: 'light' | 'dark'; cardStyle: string; industryVariant: string } | null {
  // Helper: Read industry from localStorage (demo flow)
  const getStoredIndustry = (): { variant: string; confidence: string } | null => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('pageconsult_demo_industry');
      if (stored && stored !== 'undefined' && stored !== 'null') {
        const parsed = JSON.parse(stored);
        if (parsed.variant && parsed.variant !== 'default') {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('🎨 [SDI] Failed to read stored industry:', e);
    }
    return null;
  };

  // Priority 1: Use SDI from designIntelligence state (generated during this session)
  if (designIntelligence?.colors?.mode) {
    const mode = designIntelligence.colors.mode;
    // Prefer localStorage industry over SDI detected industry (more accurate)
    const storedIndustry = getStoredIndustry();
    const industryVariant = storedIndustry?.variant || designIntelligence.industry || 'default';
    console.log('🎨 [computeSDI] Using designIntelligence with industryVariant:', industryVariant);
    return {
      colorMode: (mode === 'light' || mode === 'warm') ? 'light' : 'dark',
      cardStyle: designIntelligence.pageStructure?.heroStyle || 'bordered',
      industryVariant,
    };
  }
  
  // Priority 2: Use SDI from consultation data
  if (consultationData?.designIntelligence?.colors?.mode) {
    const mode = consultationData.designIntelligence.colors.mode;
    const storedIndustry = getStoredIndustry();
    const industryVariant = storedIndustry?.variant || consultationData.designIntelligence.industry || 'default';
    console.log('🎨 [computeSDI] Using consultation designIntelligence with industryVariant:', industryVariant);
    return {
      colorMode: (mode === 'light' || mode === 'warm') ? 'light' : 'dark',
      cardStyle: consultationData.designIntelligence.pageStructure?.heroStyle || 'bordered',
      industryVariant,
    };
  }
  
  // Priority 3: Use market data design conventions from concierge
  if (strategicData?.consultationData?.designConventions?.colorMode) {
    const conventions = strategicData.consultationData.designConventions;
    const storedIndustry = getStoredIndustry();
    const industryVariant = storedIndustry?.variant || strategicData.consultationData.industryCategory || 'default';
    console.log('🎨 [computeSDI] Using design conventions with industryVariant:', industryVariant);
    return {
      colorMode: conventions.colorMode === 'light' ? 'light' : 'dark',
      cardStyle: conventions.cardStyle || 'bordered',
      industryVariant,
    };
  }
  
  // Priority 4: Use localStorage industry detection (from demo flow)
  const storedIndustry = getStoredIndustry();
  if (storedIndustry) {
    console.log('🎨 [computeSDI] Using localStorage industry:', storedIndustry.variant);
    // Industry-based defaults
    const lightModeIndustries = ['local-services', 'consulting', 'healthcare', 'finance', 'manufacturing', 'ecommerce', 'legal'];
    return {
      colorMode: lightModeIndustries.includes(storedIndustry.variant) ? 'light' : 'dark',
      cardStyle: ['consulting', 'finance', 'legal'].includes(storedIndustry.variant) ? 'bordered' : 'flat',
      industryVariant: storedIndustry.variant,
    };
  }
  
  // Priority 5: Derive from industry category in consultation/strategic data
  const industryCategory = consultationData?.industryCategory || 
                          strategicData?.consultationData?.industryCategory ||
                          null;
  if (industryCategory && industryCategory !== 'default') {
    console.log('🎨 [computeSDI] Using consultation industryCategory:', industryCategory);
    // Industry-based defaults
    const lightModeIndustries = ['local-services', 'consulting', 'healthcare', 'finance', 'manufacturing', 'ecommerce', 'legal'];
    return {
      colorMode: lightModeIndustries.includes(industryCategory) ? 'light' : 'dark',
      cardStyle: ['consulting', 'finance', 'legal'].includes(industryCategory) ? 'bordered' : 'flat',
      industryVariant: industryCategory,
    };
  }
  
  // Fallback
  console.log('🎨 [computeSDI] Using fallback defaults');
  return {
    colorMode: 'dark',
    cardStyle: 'bordered',
    industryVariant: 'default',
  };
}

// Premium pattern alternation — ensures adjacent sections never share the same pattern
function getPatternForSection(sectionIndex: number, sectionType: string): { patternClass: string; glowClass: string } {
  if (sectionType === 'hero') {
    return { patternClass: 'section-pattern-mesh', glowClass: 'section-glow-orb' };
  }
  if (sectionType === 'final-cta' || sectionType === 'beta-final-cta') {
    return { patternClass: 'section-pattern-mesh', glowClass: 'section-glow-orb' };
  }
  // Middle sections rotate through distinct patterns
  const middlePatterns = [
    { patternClass: 'section-pattern-grid', glowClass: '' },
    { patternClass: 'section-pattern-dots', glowClass: 'section-glow-edge' },
    { patternClass: 'section-pattern-lines', glowClass: '' },
    { patternClass: 'section-pattern-noise', glowClass: 'section-glow-orb' },
  ];
  const patternIndex = (sectionIndex - 1) % middlePatterns.length;
  return middlePatterns[Math.max(0, patternIndex)];
}


function patchSectionsWithConsultationData(
  sections: Section[],
  consultationData: any
): Section[] {
  if (!consultationData || Object.keys(consultationData).length === 0) {
    console.log('🔄 [Patch] No consultation data to patch with');
    return sections;
  }
  
  return sections.map(section => {
    // Patch Final CTA with fresh consultation data
    if (section.type === 'final-cta') {
      // Derive CTA values from existing consultation data
      const derivedCta = consultationData.primaryCTA || 
                         consultationData.primary_cta || 
                         consultationData.ctaText ||
                         section.content?.ctaText || 
                         'Get Started';
      
      // Derive urgency from beta config if present
      const derivedUrgency = consultationData.urgencyAngle ||
                             consultationData.urgency_angle ||
                             (consultationData.betaConfig?.stage === 'building' 
                               ? 'Beta pricing available — early supporters get lifetime discounts'
                               : null) ||
                             section.content?.urgencyText ||
                             null;
      
      // Derive guarantee from process description or existing fields
      const derivedGuarantee = consultationData.guaranteeOffer ||
                               consultationData.guarantee_offer ||
                               consultationData.guarantee ||
                               (consultationData.processDescription?.toLowerCase().includes('no credit card')
                                 ? 'Start free — no credit card required'
                                 : null) ||
                               section.content?.guaranteeText ||
                               null;
      
      // Derive subtext from unique strength or value proposition
      const derivedSubtext = consultationData.uniqueStrength?.slice(0, 150) ||
                             consultationData.uniqueValue?.slice(0, 150) ||
                             consultationData.unique_value?.slice(0, 150) ||
                             consultationData.valueProposition?.slice(0, 150) ||
                             section.content?.subtext;
      
      console.log('🔄 [Patch] Derived CTA values:', {
        cta: derivedCta,
        urgency: derivedUrgency,
        guarantee: derivedGuarantee,
        subtext: derivedSubtext?.slice(0, 50) + '...',
      });
      
      return {
        ...section,
        content: {
          ...section.content,
          ctaText: derivedCta,
          secondaryCta: consultationData.secondaryCTA || 
                        consultationData.secondary_cta || 
                        section.content?.secondaryCta || 
                        null,
          urgencyText: derivedUrgency,
          guaranteeText: derivedGuarantee,
          subtext: derivedSubtext,
        }
      };
    }
    
    return section;
  });
}

export default function Generate() {
  return (
    <EditingProvider>
      <GenerateContent />
    </EditingProvider>
  );
}

function GenerateContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pageId } = useParams();
  const { toast } = useToast();
  const { pushHistory, undo, redo, canUndo, canRedo, clearHistory } = useEditing();
  const [phase, setPhase] = useState<Phase>("generating");
  const [isGenerating, setIsGenerating] = useState(true);
  const [progress, setProgress] = useState(0);
  const [buildStep, setBuildStep] = useState(0);
  const [consultation, setConsultation] = useState<any>(null);
  const [pageData, setPageData] = useState<any>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [sharePreviewOpen, setSharePreviewOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [aiConsultantOpen, setAiConsultantOpen] = useState(false);
  const [stylePickerOpen, setStylePickerOpen] = useState(false);
  const [calculatorUpgradeOpen, setCalculatorUpgradeOpen] = useState(false);
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedSectionsRef = useRef<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [existingPageLoaded, setExistingPageLoaded] = useState(false);
  
  // Intelligence data from wizard or strategic consultation - type definition
  type NavigationStateType = {
    consultationData?: any;
    intelligenceData?: PersonaIntelligence;
    generatedContentData?: GeneratedContent;
    landingPageBestPractices?: any;
    devMode?: boolean; // Bypass auth for testing
    // New strategic consultation data
    strategicData?: {
      consultationData?: any;
      websiteIntelligence?: any;
      strategyBrief?: string;
      structuredBrief?: any;
      aiSeoData?: any;
      heroBackgroundUrl?: string;
      brandSettings?: {
        logoUrl: string | null;
        primaryColor: string;
        secondaryColor: string;
        headingFont: string;
        bodyFont: string;
        modified: boolean;
      };
      // NEW: AI-powered industry classification from consultation completion
      industryClassification?: {
        variant: string;
        confidence: 'high' | 'medium' | 'low';
        reasoning: string;
        source: 'keyword' | 'ai' | 'fallback';
        classifiedAt?: string;
      } | null;
      // SDI Layer 1.5: Messaging architecture from Archetype Optimizer
      messagingArchitecture?: any;
      messagingConstraints?: string | null;
    };
    fromStrategicConsultation?: boolean;
  } | null;
  
  // Get navigation state from location.state or sessionStorage fallback
  const getInitialNavState = (): NavigationStateType => {
    // 1. First try location.state (normal navigation)
    if (location.state && Object.keys(location.state).length > 0) {
      console.log('📍 [Generate] Using location.state');
      return location.state as NavigationStateType;
    }
    
    // 2. Then try sessionStorage (fallback for edge cases)
    const storedState = sessionStorage.getItem('devPanelState');
    if (storedState) {
      console.log('📍 [Generate] Using sessionStorage state');
      try {
        const parsed = JSON.parse(storedState);
        // Clear after reading so it doesn't persist incorrectly
        sessionStorage.removeItem('devPanelState');
        return parsed as NavigationStateType;
      } catch (e) {
        console.error('Failed to parse stored state:', e);
        sessionStorage.removeItem('devPanelState');
      }
    }
    
    // 3. No state available
    console.log('📍 [Generate] No navigation state found');
    return null;
  };
  
  // Get effective navigation state once on mount
  const [effectiveNavState] = useState<NavigationStateType>(getInitialNavState);
  
  // Derived values from effective nav state
  // DEV MODE: Only enabled if explicitly set via URL param OR navigation state
  const isDevMode = (() => {
    // Check URL param first (allows ?dev=true for testing)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('dev') === 'true') return true;
    // Then check navigation state
    return effectiveNavState?.devMode === true;
  })();
  const fromStrategicConsultation = effectiveNavState?.fromStrategicConsultation === true;
  
  const strategicData = effectiveNavState?.strategicData || null;
  
  const [intelligence, setIntelligence] = useState<PersonaIntelligence | null>(
    effectiveNavState?.intelligenceData || null
  );
  const [preGeneratedContent, setPreGeneratedContent] = useState<GeneratedContent | null>(
    effectiveNavState?.generatedContentData || null
  );
  // Landing page best practices from market research
  const [landingPageBestPractices, setLandingPageBestPractices] = useState<any>(
    effectiveNavState?.landingPageBestPractices || null
  );
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  // Design system for dynamic theming
  const [designSystem, setDesignSystem] = useState<DesignSystem | null>(null);
  const [cssVariables, setCssVariables] = useState<string>('');
  
  // Industry tokens for the new industry-aware design system
  const [industryTokens, setIndustryTokens] = useState<IndustryTokens | null>(null);
  const [industryVariantState, setIndustryVariantState] = useState<IndustryVariant>('default');
  const [proofStack, setProofStack] = useState<string[]>([]);
  
  // SEO data for SEOHead component
  const [seoData, setSeoData] = useState<SEOHeadData | null>(null);
  
  // Strategic Design Intelligence - infers typography, colors, layout from conversation
  const [designIntelligence, setDesignIntelligence] = useState<DesignIntelligenceOutput | null>(null);
  
  // Messaging Architecture from Archetype Optimizer (SDI Layer 1.5)
  // Initialize from nav state if available, then localStorage fallback
  const [messagingArchitecture, setMessagingArchitecture] = useState<any>(() => {
    // 1. Try nav state
    if (effectiveNavState?.strategicData?.messagingArchitecture) {
      return { primary: effectiveNavState.strategicData.messagingArchitecture, generationConstraints: effectiveNavState.strategicData.messagingConstraints };
    }
    // 2. Try localStorage fallback (persisted from TryDemo flow)
    try {
      const stored = localStorage.getItem('pageconsult_messaging_architecture');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.timestamp && Date.now() - parsed.timestamp < 2 * 60 * 60 * 1000) {
          console.log('🎯 [ArchetypeOptimizer] Generate: Loaded from localStorage:', parsed.primary?.archetype);
          return { primary: parsed.primary || null, generationConstraints: parsed.generationConstraints || null };
        }
      }
    } catch (e) {
      console.warn('🎯 [ArchetypeOptimizer] Generate: Failed to read localStorage', e);
    }
    return null;
  });
  


  // Apply brand colors when nav state is available OR load from DB
  useEffect(() => {
    const applyBrand = async () => {
      console.log('🎨 Brand color effect running, effectiveNavState:', !!effectiveNavState);
      
      // Check multiple possible paths for primaryColor from nav state
      const primaryColor = 
        effectiveNavState?.strategicData?.brandSettings?.primaryColor ||
        effectiveNavState?.consultationData?.primaryColor ||
        effectiveNavState?.consultationData?.brandSettings?.primaryColor ||
        effectiveNavState?.consultationData?.brandColor ||
        null;
      
      console.log('🎨 Brand color paths:', {
        strategicBrandSettings: effectiveNavState?.strategicData?.brandSettings?.primaryColor,
        consultationPrimaryColor: effectiveNavState?.consultationData?.primaryColor,
        consultationBrandSettings: effectiveNavState?.consultationData?.brandSettings?.primaryColor,
        consultationBrandColor: effectiveNavState?.consultationData?.brandColor,
        resolved: primaryColor,
      });
      
      if (primaryColor) {
        console.log('🎨 Applying brand color from nav state:', primaryColor);
        applyBrandColors(primaryColor);
        return;
      }
      
      // Fallback: Try loading from database brand_briefs
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data: brandBrief } = await supabase
          .from('brand_briefs')
          .select('colors')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();
          
        // Cast colors to expected type
        const colors = brandBrief?.colors as { primary?: { hex?: string } } | null;
        if (colors?.primary?.hex) {
          console.log('🎨 Applying brand color from DB:', colors.primary.hex);
          applyBrandColors(colors.primary.hex);
        } else {
          console.log('🎨 No brand color found, using default');
        }
      } catch (error) {
        console.error('🎨 Error loading brand brief:', error);
      }
    };
    
    applyBrand();
  }, [effectiveNavState]);

  useEffect(() => {
    loadConsultation();
  }, []);

  // Auto-save when sections change (with debounce and change detection)
  useEffect(() => {
    if (phase !== "editor" || !pageData || sections.length === 0) return;
    
    // Compare sections to last saved - skip if no actual changes
    const sectionsJson = JSON.stringify(sections);
    if (sectionsJson === lastSavedSectionsRef.current) return;

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout for auto-save after 3 seconds of no changes
    autoSaveTimeoutRef.current = setTimeout(async () => {
      // Double-check sections changed before saving
      const currentSectionsJson = JSON.stringify(sections);
      if (currentSectionsJson === lastSavedSectionsRef.current) return;
      
      setIsSaving(true);
      const { error } = await supabase
        .from("landing_pages")
        .update({ sections, updated_at: new Date().toISOString() })
        .eq("id", pageData.id);

      if (error) {
        console.error("Auto-save failed:", error);
      } else {
        console.log("✓ Auto-saved");
        lastSavedSectionsRef.current = currentSectionsJson;
      }
      
      setTimeout(() => setIsSaving(false), 1500);
    }, 3000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [sections, phase, pageData]);

  // Initialize history when sections first load
  useEffect(() => {
    if (phase === "editor" && sections.length > 0 && !canUndo && !canRedo) {
      clearHistory();
      pushHistory(sections);
    }
  }, [phase]);

  // Auto-trigger hero image generation for Art Director compositions
  const heroImageTriggered = useRef(false);
  useEffect(() => {
    if (phase !== 'editor' || sections.length === 0 || heroImageTriggered.current) return;

    const heroSection = sections.find(s => s.type === 'hero');
    if (!heroSection) return;

    const { composition, imageStyle, imagePrompt, backgroundImage, heroImage } = heroSection.content || {};
    const isArtDirector = composition === 'centered-type' || composition === 'split-photo';
    if (!isArtDirector || imageStyle === 'none') return;
    if (backgroundImage || heroImage) return; // Already has an image

    heroImageTriggered.current = true;

    const prompt = imagePrompt || `Professional ${consultation?.industry || 'business'} environment, modern, high quality`;
    console.log('🖼️ [ImageGen] Auto-triggering hero image generation:', prompt);

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('generate-hero-images', {
          body: {
            prompts: [prompt],
            cacheKey: `art-director-${composition}-${(consultation?.id || 'anon').slice(0, 8)}`,
            forceRegenerate: false,
          },
        });

        if (error) throw error;

        const imageUrl = data?.images?.[0]?.url;
        if (imageUrl) {
          console.log('🖼️ [ImageGen] Hero image generated:', imageUrl.substring(0, 60));
          setSections(prev => prev.map(s =>
            s.type === 'hero'
              ? { ...s, content: { ...s.content, backgroundImage: imageUrl } }
              : s
          ));
        }
      } catch (err) {
        console.warn('🖼️ [ImageGen] Auto-generation failed (non-blocking):', err);
      }
    })();
  }, [phase, sections]);

  // Generate SEO data when consultation and AI SEO data are available
  useEffect(() => {
    if (!consultation) return;
    
    const aiSeoData = consultation.aiSeoData || consultation.ai_seo_data;
    if (!isAISeoDataValid(aiSeoData)) return;
    
    // Build strategy brief data from available sources
    const briefData = strategicData?.structuredBrief || {};
    const strategyBriefForSEO = {
      businessName: strategicData?.consultationData?.businessName || consultation.industry,
      processOverview: briefData.problemStatement,
      howItWorks: briefData.processSteps ? {
        steps: briefData.processSteps.map((step: any) => ({
          title: step.title,
          description: step.description,
        })),
      } : undefined,
      offerType: 'service' as const,
      offerName: consultation.offer || briefData.mainOffer,
      valueProposition: consultation.unique_value || briefData.subheadline,
      serviceArea: aiSeoData.entity?.areaServed,
    };
    
    // Generate SEO head data
    const generatedSeoData = generateSEOHeadData(
      {
        industry: consultation.industry,
        offer: consultation.offer,
        uniqueValue: consultation.unique_value,
      },
      aiSeoData,
      undefined, // testimonials
      strategyBriefForSEO,
      pageData?.published_url || undefined,
      undefined // ogImage
    );
    
    setSeoData(generatedSeoData);
    console.log('✅ SEO data generated:', generatedSeoData);
  }, [consultation, strategicData, pageData]);

  const loadConsultation = async () => {
    try {
      // Check for force regenerate query param (for testing)
      const searchParams = new URLSearchParams(window.location.search);
      const forceRegenerate = searchParams.get('regenerate') === 'true';
      const sessionParam = searchParams.get('session');
      const consultationIdParam = searchParams.get('consultationId');
      
      // Support both route params (/generate/:pageId) and query params (?id=xxx)
      const effectivePageId = pageId || searchParams.get('id');
      
      console.log('[Generate] Loading with:', {
        routePageId: pageId,
        queryParamId: searchParams.get('id'),
        consultationIdParam,
        sessionParam,
        effectivePageId,
        forceRegenerate,
      });

      // PRIORITY 0: Check for consultationId param (from Huddle/Brand Setup flow)
      if (consultationIdParam) {
        console.log('🎯 [Generate] Loading from consultationId:', consultationIdParam);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          sessionStorage.setItem('pendingConsultationId', consultationIdParam);
          navigate("/signup");
          return;
        }
        
        const { data: consultationData, error: consultationError } = await supabase
          .from('consultations')
          .select('*')
          .eq('id', consultationIdParam)
          .single();
        
        if (consultationError || !consultationData) {
          console.error('❌ Consultation not found:', consultationError);
          toast({
            title: "Consultation Not Found",
            description: "Please start a new consultation.",
            variant: "destructive",
          });
          navigate("/");
          return;
        }
        
        console.log('✅ [Generate] Loaded consultation:', consultationData.id, {
          hasIntelligence: !!consultationData.extracted_intelligence,
          hasBrief: !!consultationData.strategy_brief,
          readiness: consultationData.readiness_score,
        });
        
        // Transform consultation data to expected format
        const intel = consultationData.extracted_intelligence as any || {};
        const brief = consultationData.strategy_brief as any || {};
        
        // Generate SDI from consultation if available
        let sdiOutput: DesignIntelligenceOutput | null = null;
        const conversationHistory = intel.conversationHistory || [];
        const conversationText = Array.isArray(conversationHistory)
          ? conversationHistory.map((m: any) => m.content || '').join('\n')
          : '';
        
        if (conversationText.length > 50) {
          console.log('🎨 [SDI] Generating design intelligence from consultation...');
          
          // Get pre-detected industry category if available
          const industryCategory = intel.industryCategory || null;
          const industryConfidence = intel.industryConfidence || null;
          
          sdiOutput = generateDesignIntelligence({
            conversationText,
            extractedIntelligence: intel,
            targetMarket: consultationData.target_audience || intel.audience,
            industryCategory: industryCategory || undefined,
            industryConfidence: industryConfidence || undefined,
          });
          setDesignIntelligence(sdiOutput);
        }
        
        const transformedData = {
          id: consultationData.id,
          user_id: user.id,
          industry: consultationData.industry || intel.industry,
          businessName: consultationData.business_name || intel.businessName || intel.companyName,
          service_type: consultationData.service_type || intel.specificService,
          goal: consultationData.goal || intel.goals,
          target_audience: consultationData.target_audience || intel.audience,
          challenge: consultationData.challenge || intel.challenge,
          unique_value: consultationData.unique_value || intel.valueProp,
          competitor_differentiator: consultationData.competitor_differentiator || intel.competitorDifferentiator,
          offer: consultationData.offer || intel.offer,
          status: 'completed',
          created_at: consultationData.created_at,
          // Strategy brief data
          structuredBrief: brief,
          strategicLevel: 'armed',
          // Design Intelligence
          designIntelligence: sdiOutput || designIntelligence,
          // Communication style
          communicationStyle: consultationData.communication_style,
          // Brand data from extracted_intelligence
          websiteIntelligence: {
            logoUrl: intel.logoUrl || null,
            companyName: intel.companyName || consultationData.business_name,
            primaryColor: intel.brandColors?.primary || null,
            secondaryColor: intel.brandColors?.secondary || null,
            accentColor: intel.brandColors?.accent || null,
          },
        };
        
        console.log('📦 [Generate] Transformed consultation data:', transformedData);
        
        setConsultation(transformedData);
        
        // Start generation
        await startGeneration(transformedData, user.id);
        return;
      }

      // ZERO: Check for session param from Brand Intake flow
      if (sessionParam) {
        console.log('🎨 [Generate] Loading from session:', sessionParam);
        
        const { data: demoSession, error: sessionError } = await supabase
          .from('demo_sessions')
          .select('*')
          .eq('session_id', sessionParam)
          .maybeSingle();
        
        if (sessionError || !demoSession) {
          console.error('❌ Demo session not found:', sessionError);
          toast({
            title: "No Consultation Data Found",
            description: "Please start a new consultation.",
            variant: "destructive",
          });
          navigate("/");
          return;
        }
        
        console.log('✅ [Generate] Loaded demo session:', demoSession.session_id);
        
        // Generate Strategic Design Intelligence from conversation
        const messages = (demoSession.messages as any[] || []);
        const conversationText = messages
          .map((m: any) => m.content || m.text || '')
          .join('\n');
        
        const intel = demoSession.extracted_intelligence as Partial<ExtractedIntelligence> || {};
        
        // Hoist sdiOutput so it can be used in transformedData
        let sdiOutput: DesignIntelligenceOutput | null = null;
        
        if (conversationText.length > 50) {
          console.log('🎨 [SDI] Generating design intelligence from demo session...');
          
          // Get pre-detected industry category if available
          const industryCategory = (intel as any).industryCategory || null;
          const industryConfidence = (intel as any).industryConfidence || null;
          // BUG 3 FIX: Pass explicit industry field from consultation as highest priority
          const consultationIndustry = intel.industry || (intel as any).industry || null;
          
          sdiOutput = generateDesignIntelligence({
            conversationText,
            extractedIntelligence: intel,
            targetMarket: intel.audience || (intel as any).targetMarket,
            industryCategory: industryCategory || undefined,
            industryConfidence: industryConfidence || undefined,
            consultationIndustry: consultationIndustry || undefined, // BUG 3 FIX
          });
          setDesignIntelligence(sdiOutput);
          console.log('🎨 [SDI] Design intelligence generated:', sdiOutput.summary);
        }
        
        // GATE: Check strategic level before allowing generation
        const levelResult = calculateStrategicLevel(intel);
        
        console.log('🔒 [Generate] Strategic level check:', {
          level: levelResult.currentLevel,
          canGenerate: levelResult.canUnlock('page_generation'),
          missingForNext: levelResult.missingForNext,
          sessionCompleted: demoSession.completed,
        });
        
        // If not at ARMED level, redirect to wizard to continue consultation
        if (!levelResult.canUnlock('page_generation') && !demoSession.completed) {
          console.warn('⚠️ [Generate] Not at ARMED level, redirecting to wizard');
          toast({
            title: "More Information Needed",
            description: `You're at ${levelResult.levelDef.name}. Complete the consultation to reach ARMED and unlock page generation.`,
          });
          navigate(`/wizard?session=${sessionParam}`);
          return;
        }
        
        // Transform demo session data to consultation format
        const brandAssets = demoSession.brand_assets as any || {};
        
        const transformedData = {
          id: demoSession.id,
          session_id: demoSession.session_id,
          industry: intel.industry,
          businessName: intel.businessName,
          service_type: (intel as any).specificService || (intel as any).serviceType,
          goal: intel.goals,
          target_audience: intel.audience,
          challenge: (intel as any).challenge,
          unique_value: intel.valueProp || intel.competitorDifferentiation,
          offer: (intel as any).offer,
          swagger: intel.toneDirection,
          // Brand assets from Brand Intake
          primaryColor: brandAssets.primaryColor,
          secondaryColor: brandAssets.secondaryColor,
          logoUrl: brandAssets.logoUrl,
          websiteUrl: brandAssets.websiteUrl,
          // Market research
          marketResearch: demoSession.market_research,
          timestamp: demoSession.created_at,
          // Level info
          strategicLevel: levelResult.currentLevel,
          // Design Intelligence - use sdiOutput directly (React state is async)
          designIntelligence: sdiOutput || designIntelligence,
        };
        
        console.log('📦 [Generate] Transformed session data:', transformedData);
        
        // Use this data as the demo data and continue flow
        setConsultation(transformedData);
        
        // Check if user is authenticated for page generation
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          // Store session for after signup
          sessionStorage.setItem('pendingSessionId', sessionParam);
          navigate("/signup");
          return;
        }
        
        // Generate new page with this data
        await startGeneration(transformedData, user.id);
        return;
      }

      // FIRST: Check if we're loading an existing page by ID (unless force regenerating)
      if (effectivePageId && !forceRegenerate) {
        console.log('🔍 Loading existing page:', effectivePageId);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/signup");
          return;
        }

        const { data: existingPage, error } = await supabase
          .from("landing_pages")
          .select("*")
          .eq("id", effectivePageId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (error || !existingPage) {
          console.error("❌ Page not found:", error);
          toast({
            title: "Page not found",
            description: "Could not find the requested page.",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        console.log("✅ Loaded existing page:", existingPage.id, "with", (existingPage.sections as any[])?.length, "sections");
        
        // Get consultation data for patching sections
        const consultationData = existingPage.consultation_data as any || {};
        
        // DEBUG: Log design_intelligence from database
        const dbDesignIntel = existingPage.design_intelligence as any || {};
        const dbColorMode = dbDesignIntel.colorMode;
        const dbIndustryVariant = dbDesignIntel.industryVariant;
        console.log('🎨 [LoadExisting] design_intelligence from DB:', existingPage.design_intelligence);
        console.log('🎨 [LoadExisting] DB colorMode:', dbColorMode);
        console.log('🎨 [LoadExisting] DB industryVariant:', dbIndustryVariant);
        
        // BUG 1 FIX: Resolve colorMode from Strategy Blueprint (fresh) over stale DB value
        // Priority: Strategy Blueprint > brand settings override > database fallback
        const strategyBlueprintColorMode = strategicData?.consultationData?.designConventions?.colorMode ||
                                            consultationData?.designConventions?.colorMode;
        const resolvedColorMode = strategyBlueprintColorMode || dbColorMode || 'dark';
        console.log(`🎨 [LoadExisting] colorMode resolution: strategy='${strategyBlueprintColorMode || 'none'}', db='${dbColorMode || 'none'}', resolved='${resolvedColorMode}' (strategy wins)`);
        
        // BUG 3 FIX + AI CLASSIFICATION: Resolve industryVariant with proper priority
        // Priority: stored AI classification > consultation.industry > DB fallback > 'default'
        
        // Check for stored AI classification first (most accurate)
        const intel = consultationData.extracted_intelligence as any || {};
        const storedClassification = intel.industryClassification;
        
        let resolvedIndustryVariant: string = 'default';
        
        if (storedClassification?.variant && storedClassification.variant !== 'default') {
          resolvedIndustryVariant = storedClassification.variant;
          console.log(`🎨 [LoadExisting] Using stored AI classification: ${resolvedIndustryVariant} (source: ${storedClassification.source})`);
        } else {
          // Fallback to existing logic
          const consultationIndustry = existingPage.industry || 
                                        consultationData.industry || 
                                        consultationData.industryCategory;
          
          // Map "venture studio" and similar compound terms to 'consulting'
          const mapIndustryToVariant = (industry: string | null): string => {
            if (!industry) return dbIndustryVariant || 'default';
            const search = industry.toLowerCase();
            // Consulting/professional services compound terms
            if (search.includes('venture studio') || 
                search.includes('professional services') || 
                search.includes('advisory') ||
                search.includes('consulting') ||
                search.includes('strategy')) {
              return 'consulting';
            }
            // Healthcare
            if (search.includes('health') || search.includes('medical') || search.includes('wellness')) {
              return 'healthcare';
            }
            // Finance
            if (search.includes('finance') || search.includes('fintech') || search.includes('banking') || search.includes('insurance')) {
              return 'finance';
            }
            // Local services
            if (search.includes('plumb') || search.includes('hvac') || search.includes('electric') || 
                search.includes('roofing') || search.includes('landscap') || search.includes('cleaning')) {
              return 'local-services';
            }
            // SaaS
            if (search.includes('saas') || search.includes('software') || search.includes('app')) {
              return 'saas';
            }
            return dbIndustryVariant || 'default';
          };
          resolvedIndustryVariant = mapIndustryToVariant(consultationIndustry);
          console.log(`🎨 [LoadExisting] industryVariant resolution: consultation='${consultationIndustry || 'none'}', db='${dbIndustryVariant || 'none'}', resolved='${resolvedIndustryVariant}'`);
        }
        
        // BUG 2 FIX: Brand data hydration from multiple sources
        const pageWebsiteIntel = existingPage.website_intelligence as any || {};
        const consultationBrandSettings = consultationData?.brand_settings || consultationData?.brandSettings || {};
        const extractedIntelColors = consultationData?.extracted_intelligence?.colors || 
                                      consultationData?.extractedIntelligence?.colors || [];
        const legacyWebsiteIntel = consultationData?.websiteIntelligence || {};
        
        // Try localStorage as fallback
        let localBrandData: any = null;
        try {
          const stored = localStorage.getItem('pageconsult_brand_data');
          if (stored) {
            const parsed = JSON.parse(stored);
            localBrandData = {
              primaryColor: parsed.colors?.primary || null,
              secondaryColor: parsed.colors?.secondary || null,
              accentColor: parsed.colors?.accent || null,
              logoUrl: parsed.logo || null,
              companyName: parsed.companyName || null,
            };
          }
        } catch (e) {
          // Storage disabled or parse failed
        }
        
        const resolvedBrand = {
          primaryColor: pageWebsiteIntel.primaryColor ||
                        consultationBrandSettings.primaryColor ||
                        extractedIntelColors[0] ||
                        dbDesignIntel.brandColors?.primary ||
                        localBrandData?.primaryColor ||
                        legacyWebsiteIntel.primaryColor ||
                        null,
          secondaryColor: pageWebsiteIntel.secondaryColor ||
                          consultationBrandSettings.secondaryColor ||
                          extractedIntelColors[1] ||
                          dbDesignIntel.brandColors?.secondary ||
                          localBrandData?.secondaryColor ||
                          legacyWebsiteIntel.secondaryColor ||
                          null,
          logoUrl: pageWebsiteIntel.logoUrl ||
                   consultationBrandSettings.logoUrl ||
                   dbDesignIntel.logoUrl ||
                   localBrandData?.logoUrl ||
                   legacyWebsiteIntel.logoUrl ||
                   null,
          companyName: pageWebsiteIntel.companyName ||
                       consultationBrandSettings.companyName ||
                       consultationData.businessName ||
                       localBrandData?.companyName ||
                       legacyWebsiteIntel.companyName ||
                       null,
        };
        console.log('🎨 [LoadExisting] Brand hydration:', {
          fromPageWebsiteIntel: !!pageWebsiteIntel.primaryColor,
          fromConsultationBrand: !!consultationBrandSettings.primaryColor,
          fromExtractedIntel: extractedIntelColors.length > 0,
          fromLocalStorage: !!localBrandData?.primaryColor,
          resolved: resolvedBrand,
        });
        
        console.log('🔄 [Patch] Consultation data from page:', consultationData);
        
        // Reconstruct consultation state from existing page data for use in LivePreview
        // This ensures colorMode and brand settings are available even for existing pages
        const reconstructedConsultation = {
          id: existingPage.consultation_id,
          industry: existingPage.industry || consultationData.industry,
          industryCategory: resolvedIndustryVariant, // Use resolved variant
          businessName: consultationData.businessName || resolvedBrand.companyName,
          colorMode: resolvedColorMode, // Inject resolved colorMode
          // Extract brand data from websiteIntelligence if available
          websiteIntelligence: {
            ...(existingPage.website_intelligence || consultationData.websiteIntelligence || {}),
            primaryColor: resolvedBrand.primaryColor,
            secondaryColor: resolvedBrand.secondaryColor,
            logoUrl: resolvedBrand.logoUrl,
            companyName: resolvedBrand.companyName,
          },
          // Extract extracted_intelligence for brand colors
          extracted_intelligence: {
            ...(consultationData.extractedIntelligence || consultationData.extracted_intelligence || {}),
            colors: [resolvedBrand.primaryColor, resolvedBrand.secondaryColor].filter(Boolean),
            logoUrl: resolvedBrand.logoUrl,
            companyName: resolvedBrand.companyName,
          },
        };
        setConsultation(reconstructedConsultation);
        
        // Patch sections with fresh consultation data (especially final-cta)
        // Also inject resolved design values into each section
        let patchedSections = patchSectionsWithConsultationData(
          (existingPage.sections as Section[]) || [],
          consultationData
        );
        
        // Inject resolved design intelligence into section content
        patchedSections = patchedSections.map((section, index) => {
          // Assign alternating premium patterns to avoid adjacent repetition
          const { patternClass, glowClass } = getPatternForSection(index, section.type);
          return {
            ...section,
            content: {
              ...section.content,
              mode: resolvedColorMode === 'light' ? 'light' : 'dark',
              industryVariant: resolvedIndustryVariant,
              primaryColor: section.content?.primaryColor || resolvedBrand.primaryColor,
              logoUrl: section.content?.logoUrl || resolvedBrand.logoUrl,
              patternClass,
              glowClass,
            },
          };
        });
        
        // BUG 1 FIX: Override stale design_intelligence in pageData with resolved values
        const correctedDesignIntelligence = {
          ...dbDesignIntel,
          colorMode: resolvedColorMode,
          industryVariant: resolvedIndustryVariant,
          brandColors: {
            primary: resolvedBrand.primaryColor,
            secondary: resolvedBrand.secondaryColor,
          },
          logoUrl: resolvedBrand.logoUrl,
        };
        
        setPageData({
          ...existingPage,
          design_intelligence: correctedDesignIntelligence,
        });
        setSections(patchedSections);
        setExistingPageLoaded(true);
        console.log('📦 [Generate] Loaded existing page:', existingPage.id);
        console.log('💡 [Generate] Use Regenerate button to create fresh page with latest layout logic');
        setPhase("editor");
        return;
      } else if (forceRegenerate) {
        console.log('🔄 Force regenerate enabled - bypassing cached page');
      }

      // SECOND: Check if data was passed from demo via React Router state or sessionStorage
      const demoData = effectiveNavState?.consultationData || location.state?.consultationData;

      console.log('🔍 Generate page load - checking for consultation data...');
      console.log('📦 location.state:', location.state);
      console.log('📦 effectiveNavState:', effectiveNavState);
      console.log('📦 demoData:', demoData);
      console.log('🔧 devMode:', isDevMode);
      console.log('📋 fromStrategicConsultation:', fromStrategicConsultation);
      console.log('📊 strategicData?.structuredBrief present:', !!strategicData?.structuredBrief);
      if (strategicData?.structuredBrief) {
        console.log('📊 structuredBrief keys:', Object.keys(strategicData.structuredBrief));
        console.log('📊 structuredBrief.headlines:', strategicData.structuredBrief.headlines);
        console.log('📊 structuredBrief.proofPoints:', strategicData.structuredBrief.proofPoints);
      }

      if (demoData) {
        // Generate SDI for strategic consultation flow if we have conversation data
        // Hoist sdiOutput so it can be used in transformedData
        let sdiOutput: DesignIntelligenceOutput | null = null;
        
        if (fromStrategicConsultation && !designIntelligence) {
          const strategyConversation = demoData.conversationHistory || demoData.messages || [];
          const conversationText = Array.isArray(strategyConversation)
            ? strategyConversation.map((m: any) => m.content || m.text || '').join('\n')
            : '';
          
          if (conversationText.length > 50) {
            console.log('🎨 [SDI] Generating design intelligence from strategic consultation...');
            
            // Get pre-detected industry category if available
            const industryCategory = demoData.industryCategory || null;
            const industryConfidence = demoData.industryConfidence || null;
            // BUG 3 FIX: Pass explicit industry field from consultation as highest priority
            const consultationIndustry = demoData.industry || null;
            
            sdiOutput = generateDesignIntelligence({
              conversationText,
              extractedIntelligence: demoData,
              targetMarket: demoData.targetAudience || demoData.target_audience,
              industryCategory: industryCategory || undefined,
              industryConfidence: industryConfidence || undefined,
              consultationIndustry: consultationIndustry || undefined, // BUG 3 FIX
            });
            setDesignIntelligence(sdiOutput);
            console.log('🎨 [SDI] Design intelligence generated:', sdiOutput.summary);
          }
        }
        // DEV MODE: Skip auth check for testing
        if (isDevMode) {
          console.log("🔧 DEV MODE: Bypassing authentication");
          const devUserId = "dev-test-user-" + Date.now();
          
          // Transform demo data to match expected format - INCLUDE ALL new credibility/differentiation fields
          const transformedData = {
            id: demoData.id || "dev-consultation-" + Date.now(),
            user_id: devUserId,
            industry: demoData.industry,
            service_type: demoData.specificService || demoData.service_type,
            goal: demoData.goal,
            target_audience: demoData.targetAudience || demoData.target_audience,
            challenge: demoData.challenge,
            unique_value: demoData.uniqueValue || demoData.unique_value,
            offer: demoData.offer || demoData.goal,
            status: "completed",
            created_at: demoData.timestamp || new Date().toISOString(),
            
            // NEW: Credibility fields
            identitySentence: demoData.identitySentence || null,
            concreteProofStory: demoData.concreteProofStory || null,
            proofStoryContext: demoData.proofStoryContext || null,
            methodologySteps: demoData.methodologySteps || null,
            calculatorTypicalResults: demoData.calculatorTypicalResults || null,
            calculatorDisclaimer: demoData.calculatorDisclaimer || null,
            calculatorNextStep: demoData.calculatorNextStep || null,
            
            // NEW: Differentiation fields
            painSpike: demoData.painSpike || null,
            sharpDifferentiator: demoData.sharpDifferentiator || null,
            audienceExclusion: demoData.audienceExclusion || null,
            secondaryCTA: demoData.secondaryCTA || null,
            secondaryCTACustom: demoData.secondaryCTACustom || null,
            
            // Page type and brand
            pageType: demoData.pageType || null,
            primaryColor: demoData.primaryColor || null,
            
            // Beta-specific
            betaPerks: demoData.betaPerks || null,
            maxSignups: demoData.maxSignups || null,
            
            // Founder
            founder: demoData.founder || null,
            founderName: demoData.founderName || null,
            founderTitle: demoData.founderTitle || null,
            founderStory: demoData.founderStory || null,
            founderCredentials: demoData.founderCredentials || null,
            founderPhoto: demoData.founderPhoto || null,
            // Design Intelligence - use sdiOutput directly (React state is async)
            designIntelligence: sdiOutput || designIntelligence,
          };

          console.log('🔧 DEV MODE transformedData:', {
            identitySentence: transformedData.identitySentence,
            sharpDifferentiator: transformedData.sharpDifferentiator,
            audienceExclusion: transformedData.audienceExclusion,
            painSpike: transformedData.painSpike,
            secondaryCTA: transformedData.secondaryCTA,
          });

          setConsultation(transformedData);
          // In dev mode, skip database operations
          await startDevGeneration(transformedData);
          return;
        }

        // Data came from demo - use it directly (normal flow)
        console.log("✅ Using consultation data from demo:", demoData);

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          navigate("/signup");
          return;
        }

        // Transform demo data to match expected format
        const transformedData = {
          id: demoData.id,
          user_id: user.id,
          industry: demoData.industry,
          service_type: demoData.specificService,
          goal: demoData.goal,
          target_audience: demoData.targetAudience,
          challenge: demoData.challenge,
          unique_value: demoData.uniqueValue,
          offer: demoData.offer || demoData.goal,
          status: "completed",
          created_at: demoData.timestamp,
          // Design Intelligence - use sdiOutput directly (React state is async)
          designIntelligence: sdiOutput || designIntelligence,
        };

        setConsultation(transformedData);
        startGeneration(transformedData, user.id);
        return;
      }

      // FALLBACK: If no demo data, try loading from database (old wizard flow)
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/signup");
        return;
      }

      const { data, error } = await supabase
        .from("consultations")
        .select("*")
        .eq("user_id", user.id)
        .in("status", ["completed", "in_progress"]) // Valid: 'in_progress' or 'completed'
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        console.error("❌ No consultation found in database");
        toast({
          title: "No consultation found",
          description: "Please complete the consultation demo on the homepage first.",
          variant: "destructive",
        });
        navigate("/#demo");
        return;
      }

      console.log("✅ Using consultation data from database:", data);
      setConsultation(data);
      startGeneration(data, user.id);
    } catch (error) {
      console.error("❌ Error loading consultation:", error);
      toast({
        title: "Error loading page",
        description: "Failed to load consultation data. Please try again.",
        variant: "destructive",
      });
      navigate("/#demo");
    }
  };

  const startGeneration = async (consultationData: any, userId: string) => {
    // Start generation immediately, show loading UI
    // Show unified generation flow
    setPhase("generating");
    setIsGenerating(true);

    // Animate progress bar while API calls happen
    let progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 2, 90));
    }, 200);

    try {
      await animatePageBuild(consultationData, userId);
      clearInterval(progressInterval);
      setProgress(100);
    } catch (error) {
      clearInterval(progressInterval);
      throw error;
    }
  };

  // Dev mode generation - skips database operations
  const startDevGeneration = async (consultationData: any) => {
    setPhase("generating");
    setIsGenerating(true);

    let progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 2, 90));
    }, 200);

    try {
      console.log("🔧 DEV MODE: Starting generation without database");
      console.time("⚡ Dev generation time");
      const generatedSections = await generateSections(consultationData);
      console.timeEnd("⚡ Dev generation time");

      if (!generatedSections || generatedSections.length === 0) {
        throw new Error("No sections were generated");
      }

      // Animate sections appearing
      for (let i = 1; i <= generatedSections.length; i++) {
        setBuildStep(i);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Set page data without saving to database
      setPageData({
        id: "dev-page-" + Date.now(),
        title: `${consultationData.industry} Landing Page`,
        slug: "dev-test",
        sections: generatedSections,
      });
      const patternedDev = generatedSections.map((s, i) => {
        const { patternClass, glowClass } = getPatternForSection(i, s.type);
        return { ...s, content: { ...s.content, patternClass, glowClass } };
      });
      const companyNameForQC = consultationData?.businessName || consultationData?.business_name || '';
      const extractedIntelForQC = (() => {
        try {
          const stored = localStorage.getItem('pageconsult_demo_extracted') || localStorage.getItem('pageconsult_extracted_intelligence');
          if (stored) { const p = JSON.parse(stored); if (p && typeof p === 'object' && Object.keys(p).length > 3) return p; }
        } catch {}
        return consultationData?.extracted_intelligence || consultationData;
      })();
      const { sections: qcSectionsDev } = autoQCPass(patternedDev, extractedIntelForQC, consultationData, companyNameForQC);
      setSections(qcSectionsDev);

      clearInterval(progressInterval);
      setProgress(100);
      
      // Mark generation complete - UnifiedGenerationFlow handles transition
      setIsGenerating(false);
    } catch (error) {
      clearInterval(progressInterval);
      console.error("❌ Dev generation failed:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const animatePageBuild = async (consultationData: any, userId: string) => {
    try {
      // Check for force regenerate query param (for testing)
      const searchParams = new URLSearchParams(window.location.search);
      const forceRegenerate = searchParams.get('regenerate') === 'true';
      
      // 🧠 INTELLIGENCE CONCIERGE: Synthesize strategy from accumulator if available
      const sessionId = consultationData.id || consultationData.session_id;
      if (sessionId) {
        console.log('🧠 [Generation] Checking for intelligence accumulator:', sessionId);
        try {
          const accumulator = await intelligenceConcierge.synthesizeStrategy(sessionId);
          
          if (accumulator) {
            console.log('🧠 [Generation] Strategy synthesized:', accumulator.strategyData);
            console.log('🧠 [Generation] Using design conventions:', accumulator.marketData?.designConventions);
            
            // Enrich consultation data with accumulated intelligence
            if (accumulator.consultationData) {
              consultationData.accumulatorIndustry = accumulator.consultationData.industry;
              consultationData.accumulatorAudience = accumulator.consultationData.audience;
              consultationData.accumulatorValueProp = accumulator.consultationData.valueProp;
            }
            if (accumulator.marketData?.designConventions) {
              consultationData.designConventions = accumulator.marketData.designConventions;
            }
            if (accumulator.strategyData) {
              consultationData.strategyApproach = accumulator.strategyData;
            }
            if (accumulator.brandData) {
              consultationData.accumulatorBrand = accumulator.brandData;
            }
            
            console.log('🧠 [Generation] Page generation enriched with strategic intelligence');
          }
        } catch (accError) {
          console.log('🧠 [Generation] No accumulator found, using standard generation:', accError);
          // Continue with existing generation logic as fallback
        }
      }
      
      // Check if a page already exists for this consultation OR session
      const isDemoSession = !!consultationData.session_id;
      let existingPage = null;
      
      if (isDemoSession) {
        // Check by session_id for demo flows
        const { data } = await supabase
          .from("landing_pages")
          .select("*")
          .eq("user_id", userId)
          .eq("session_id", consultationData.session_id)
          .maybeSingle();
        existingPage = data;
      } else {
        // Check by consultation_id for authenticated flows
        const { data } = await supabase
          .from("landing_pages")
          .select("*")
          .eq("user_id", userId)
          .eq("consultation_id", consultationData.id)
          .maybeSingle();
        existingPage = data;
      }

      if (existingPage && !forceRegenerate) {
        console.log("✅ Found existing page for consultation, loading it:", existingPage.id);
        
        // Get consultation data from the page OR the current consultation
        const pageConsultationData = existingPage.consultation_data as any || {};
        const effectiveIndustry = consultationData.industry || pageConsultationData.industry || pageConsultationData.businessName;
        const effectiveServiceType = consultationData.serviceType || consultationData.service_type || 
                                      pageConsultationData.serviceType || pageConsultationData.service_type;
        const effectivePageType = consultationData.pageType || consultationData.page_type || 
                                   pageConsultationData.pageType || pageConsultationData.page_type;
        
        // CHECK FOR STALE/GENERIC CONTENT
        // If the page has generic placeholders but we have specific consultation data, regenerate
        const existingSections = (existingPage.sections as Section[]) || [];
        const heroSection = existingSections.find(s => s.type === 'hero');
        const heroHeadline = heroSection?.content?.headline || '';
        
        // List of known generic placeholders that indicate stale content
        const genericPhrases = [
          'smart solution for your business',
          'professional solutions tailored',
          'get payment processing',
          'streamline your workflow',
          'transform your business',
          'the smart way to',
        ];
        
        const hasGenericContent = genericPhrases.some(phrase => 
          heroHeadline.toLowerCase().includes(phrase.toLowerCase())
        );
        
        // Check if current consultation has specific data that should be used
        const hasSpecificConsultationData = !!(
          consultationData.challenge || 
          consultationData.unique_value || 
          consultationData.valueProp ||
          pageConsultationData.uniqueStrength ||
          pageConsultationData.clientFrustration
        );
        
        if (hasGenericContent && hasSpecificConsultationData) {
          console.warn('⚠️ [LoadExisting] Detected STALE generic content with specific consultation data available');
          console.log('⚠️ Generic headline:', heroHeadline);
          console.log('⚠️ Consultation data available:', {
            challenge: consultationData.challenge?.substring?.(0, 50),
            unique_value: consultationData.unique_value?.substring?.(0, 50),
            valueProp: consultationData.valueProp?.substring?.(0, 50),
            uniqueStrength: pageConsultationData.uniqueStrength?.substring?.(0, 50),
          });
          
          // Force regeneration for stale pages
          toast({
            title: "Refreshing your page",
            description: "We detected outdated content. Regenerating with your latest info...",
          });
          
          // Delete the stale page and regenerate fresh
          await supabase.from("landing_pages").delete().eq("id", existingPage.id);
          console.log('🗑️ Deleted stale page:', existingPage.id);
          // Continue to generation below (don't return)
        } else {
          // ============================================
          // PRIORITY 1: Check for stored AI classification on consultation
          // This is the intelligent classification result from consultation completion
          // ============================================
          const intel = consultationData.extracted_intelligence as any || {};
          const storedClassification = intel.industryClassification;
          
          let industryVariant: IndustryVariant = 'default';
          let classificationSource = 'none';
          
          if (storedClassification?.variant && storedClassification.variant !== 'default') {
            industryVariant = storedClassification.variant as IndustryVariant;
            classificationSource = storedClassification.source || 'ai';
            console.log(`🎨 [LoadExisting] Using stored AI classification: ${industryVariant} (source: ${classificationSource}, reasoning: ${storedClassification.reasoning?.substring(0, 50)}...)`);
          }
          
          // ============================================
          // PRIORITY 2: Check localStorage (demo flow detection)
          // ============================================
          if (industryVariant === 'default') {
            try {
              const storedIndustry = typeof window !== 'undefined' 
                ? localStorage.getItem('pageconsult_demo_industry') 
                : null;
              if (storedIndustry && storedIndustry !== 'undefined' && storedIndustry !== 'null') {
                const parsed = JSON.parse(storedIndustry);
                if (parsed.variant && parsed.variant !== 'default') {
                  industryVariant = parsed.variant as IndustryVariant;
                  classificationSource = 'localStorage';
                  console.log('🎨 [LoadExisting] Using localStorage industry:', industryVariant, '(confidence:', parsed.confidence, ')');
                }
              }
            } catch (e) {
              console.warn('🎨 [LoadExisting] Failed to read localStorage industry:', e);
            }
          }
          
          // ============================================
          // PRIORITY 3: Sync keyword detection fallback
          // ============================================
          if (industryVariant === 'default') {
            // Import classifyIndustrySync for consistent detection
            const { classifyIndustrySync } = await import('@/lib/industryClassification');
            
            const industrySearchString = [effectiveIndustry, pageConsultationData.industryCategory, pageConsultationData.industrySubcategory]
              .filter(Boolean).join(' ').toLowerCase();
            
            // Use the unified classification system
            const syncResult = classifyIndustrySync(effectiveIndustry, {
              industryCategory: pageConsultationData.industryCategory,
              industrySubcategory: pageConsultationData.industrySubcategory,
              pageType: effectivePageType,
            });
            
            industryVariant = syncResult.variant as IndustryVariant;
            classificationSource = syncResult.source;
            console.log(`🎨 [LoadExisting] Using sync classification: ${industryVariant} (source: ${classificationSource})`);
          }
          
          console.log('🎨 [LoadExisting] Final industryVariant:', industryVariant, 'from:', {
            source: classificationSource,
            industry: effectiveIndustry,
            serviceType: effectiveServiceType,
            pageType: effectivePageType,
          });
          
          // Also update industry tokens and state for consistent styling
          const tokens = getIndustryTokens(industryVariant);
          setIndustryVariantState(industryVariant);
          setIndustryTokens(tokens);
          
          // CRITICAL FIX: Read brand data from extracted_intelligence for existing pages
          // The console shows "No brand color found" because we weren't reading this data
          const pageDesignIntel = existingPage.design_intelligence as any || {};
          
          // DEBUG: Log raw design_intelligence from database
          console.log('🎨 [DB] Raw design_intelligence from database:', JSON.stringify(pageDesignIntel));
          
          // ============================================
          // BUG 1 FIX: colorMode Resolution with CLEAR PRIORITY
          // Strategy Blueprint (fresh) > Brand Settings > DB design_intelligence (stale)
          // ============================================
          
          // Check for fresh Strategy Blueprint from designConventions (computed this session)
          const strategyBlueprintColorMode = consultationData.designConventions?.colorMode || 
                                              pageConsultationData.designConventions?.colorMode || 
                                              null;
          const dbColorMode = pageDesignIntel.colorMode || pageDesignIntel.colors?.mode || null;
          
          let resolvedColorMode: 'light' | 'dark';
          if (strategyBlueprintColorMode) {
            // Strategy Blueprint takes priority - it's freshly computed
            resolvedColorMode = strategyBlueprintColorMode === 'light' ? 'light' : 'dark';
            console.log(`🎨 [LoadExisting] colorMode resolution: strategy='${strategyBlueprintColorMode}', db='${dbColorMode}', resolved='${resolvedColorMode}' (strategy wins)`);
            
            // Update DB design_intelligence to stay in sync
            if (dbColorMode !== resolvedColorMode) {
              console.log('🎨 [LoadExisting] Updating DB design_intelligence with new colorMode');
              const updatedDesignIntel = { ...pageDesignIntel, colorMode: resolvedColorMode };
              supabase.from('landing_pages').update({ design_intelligence: updatedDesignIntel }).eq('id', existingPage.id);
            }
          } else if (dbColorMode) {
            resolvedColorMode = dbColorMode === 'light' ? 'light' : 'dark';
            console.log(`🎨 [LoadExisting] colorMode resolution: strategy=null, db='${dbColorMode}', resolved='${resolvedColorMode}' (db used)`);
          } else {
            // Use industry tokens mode as fallback
            resolvedColorMode = tokens.mode || 'dark';
            console.log(`🎨 [LoadExisting] colorMode resolution: strategy=null, db=null, resolved='${resolvedColorMode}' (industry tokens fallback)`);
          }
          
          // ============================================
          // BUG 2 FIX: Brand Data Hydration from Multiple Sources
          // ============================================
          
          // Build websiteIntelligence from extracted_intelligence colors array
          const colorsArray = intel.colors || [];
          
          // Check website_intelligence on the page for extracted brand data
          const pageWebsiteIntel = existingPage.website_intelligence as any || {};
          
          // Try consultation.brand_settings JSONB column
          const consultationBrandSettings = consultationData.brand_settings as any || 
                                             pageConsultationData.brand_settings as any || {};
          
          // localStorage fallback - read pageconsult_brand_data for brand data not yet in Supabase
          const localBrandData = (() => {
            try {
              const stored = localStorage.getItem('pageconsult_brand_data');
              if (stored) {
                const parsed = JSON.parse(stored);
                return {
                  primaryColor: parsed.colors?.primary || null,
                  secondaryColor: parsed.colors?.secondary || null,
                  accentColor: parsed.colors?.accent || null,
                  logoUrl: parsed.logo || null,
                  companyName: parsed.companyName || null,
                };
              }
            } catch {
              // localStorage may be disabled
            }
            return null;
          })();
          
          // ============================================
          // BULLETPROOF: Brand Color Resolution
          // Check all possible sources with backfill
          // ============================================
          const consultationExtractedColors = colorsArray || [];
          const intelBrandColors = intel.brandColors ? [intel.brandColors.primary, intel.brandColors.secondary, intel.brandColors.accent].filter(Boolean) : [];

          // Backfill: If extracted_intelligence.colors is empty, try to populate from other sources
          let finalColorsArray = consultationExtractedColors;
          if (finalColorsArray.length === 0 && intelBrandColors.length > 0) {
            finalColorsArray = intelBrandColors;
            console.log('🎨 [LoadExisting] Backfill: populated colors from intel.brandColors');
          }
          if (finalColorsArray.length === 0 && intel.colors?.length > 0) {
            finalColorsArray = intel.colors;
            console.log('🎨 [LoadExisting] Backfill: populated colors from intel.colors');
          }

          // Additional backfill: Check localStorage for persisted extracted intelligence
          if (finalColorsArray.length === 0) {
            try {
              const localIntel = JSON.parse(localStorage.getItem('pageconsult_extracted_intelligence') || '{}');
              if (localIntel.colors?.length > 0) {
                finalColorsArray = localIntel.colors;
                console.log('🎨 [LoadExisting] Backfill: populated colors from localStorage pageconsult_extracted_intelligence');
              }
            } catch {
              // localStorage unavailable or parse failed
            }
          }

          // Resolve brand data with CLEAR PRIORITY:
          // 1. pageWebsiteIntel (from website extraction on page record)
          // 2. consultationBrandSettings (explicit brand setup)
          // 3. extracted_intelligence colors array (from consultation state or localStorage)
          // 4. intel.brandColors (from extracted_intelligence object)
          // 5. localStorage (pageconsult_brand_data - temporary fallback)
          // 6. pageConsultationData.websiteIntelligence (legacy)
          const resolvedBrand = {
            primaryColor: pageWebsiteIntel.primaryColor ||
                          consultationBrandSettings.primaryColor ||
                          finalColorsArray[0] ||
                          intel.brandColors?.primary ||
                          localBrandData?.primaryColor ||
                          pageConsultationData.websiteIntelligence?.primaryColor ||
                          null,
            secondaryColor: pageWebsiteIntel.secondaryColor ||
                            consultationBrandSettings.secondaryColor ||
                            finalColorsArray[1] ||
                            intel.brandColors?.secondary ||
                            localBrandData?.secondaryColor ||
                            pageConsultationData.websiteIntelligence?.secondaryColor ||
                            null,
            accentColor: pageWebsiteIntel.accentColor ||
                         consultationBrandSettings.accentColor ||
                         finalColorsArray[2] ||
                         intel.brandColors?.accent ||
                         localBrandData?.accentColor ||
                         pageConsultationData.websiteIntelligence?.accentColor ||
                         null,
            logoUrl: pageWebsiteIntel.logoUrl ||
                     consultationBrandSettings.logoUrl ||
                     intel.logoUrl ||
                     localBrandData?.logoUrl ||
                     pageConsultationData.websiteIntelligence?.logoUrl ||
                     null,
            companyName: pageWebsiteIntel.companyName ||
                         intel.companyName ||
                         consultationData.business_name ||
                         localBrandData?.companyName ||
                         pageConsultationData.businessName ||
                         null,
          };

          // Log brand hydration sources for debugging
          console.log('🎨 [LoadExisting] Brand hydration (source-by-source):', {
            pageWebsiteIntel: !!pageWebsiteIntel.primaryColor,
            consultationBrandSettings: !!consultationBrandSettings.primaryColor,
            extractedIntelColors: finalColorsArray.length > 0,
            intelBrandColors: !!intel.brandColors?.primary,
            localStorage: !!localBrandData?.primaryColor,
            legacy: !!pageConsultationData.websiteIntelligence?.primaryColor,
          });

          console.log('🎨 [LoadExisting] RESOLVED BRAND COLORS:', {
            primaryColor: resolvedBrand.primaryColor,
            secondaryColor: resolvedBrand.secondaryColor,
            accentColor: resolvedBrand.accentColor,
            logoUrl: resolvedBrand.logoUrl ? '(present)' : null,
            companyName: resolvedBrand.companyName,
            finalColorsArray: finalColorsArray.slice(0, 3),
          });
          
          // CRITICAL: Inject colorMode, primaryColor, and industryVariant into each section
          const sectionsWithVariant = existingSections.map(section => ({
            ...section,
            content: {
              ...section.content,
              industryVariant: industryVariant,
              mode: resolvedColorMode, // Inject colorMode into each section
              primaryColor: resolvedBrand.primaryColor, // Inject primary color for CTA buttons
              secondaryColor: resolvedBrand.secondaryColor,
              logoUrl: section.type === 'hero' ? resolvedBrand.logoUrl : section.content?.logoUrl, // Inject logo for hero
            }
          }));
          
          console.log('🎨 [LoadExisting] Injected into sections: mode=' + resolvedColorMode + ', primaryColor=' + resolvedBrand.primaryColor);
          
          // Store consultation data for potential regeneration WITH websiteIntelligence
          setConsultation({
            ...consultationData,
            ...pageConsultationData,
            websiteIntelligence: resolvedBrand,
            // Also preserve designIntelligence for colorMode resolution
            designIntelligence: { ...pageDesignIntel, colorMode: resolvedColorMode },
          });
          
          // CRITICAL FIX: Set pageData with CORRECTED design_intelligence
          // This ensures LivePreview container reads the resolved colorMode/industryVariant
          const correctedPageData = {
            ...existingPage,
            design_intelligence: {
              ...pageDesignIntel,
              colorMode: resolvedColorMode,
              industryVariant: industryVariant,
              brandColors: {
                primary: resolvedBrand.primaryColor,
                secondary: resolvedBrand.secondaryColor,
              },
              logoUrl: resolvedBrand.logoUrl,
            },
          };
          console.log('🎨 [LoadExisting] Setting pageData with corrected design_intelligence:', {
            colorMode: resolvedColorMode,
            industryVariant: industryVariant,
            primaryColor: resolvedBrand.primaryColor,
          });
          
          setPageData(correctedPageData);
          setSections(sectionsWithVariant);
          setExistingPageLoaded(true);
          console.log('📦 [Generate] Loaded existing page for consultation:', existingPage.id);
          console.log('💡 [Generate] Use Regenerate button to create fresh page with latest layout logic');
          // Mark generation complete for immediate editor transition
          setIsGenerating(false);
          setPhase("editor");
          return;
        }
      } else if (forceRegenerate && existingPage) {
        console.log('🔄 Force regenerate - skipping existing page for consultation:', existingPage.id);
      }

      // Generate content (parallel API calls inside)
      console.log("🎨 Starting page generation with data:", consultationData);
      console.time("⚡ Total generation time");
      const generatedSections = await generateSections(consultationData);
      console.timeEnd("⚡ Total generation time");
      console.log("✅ Generated sections:", generatedSections);

      if (!generatedSections || generatedSections.length === 0) {
        throw new Error("No sections were generated");
      }

      // Animate sections appearing quickly
      for (let i = 1; i <= generatedSections.length; i++) {
        setBuildStep(i);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Create NEW page in database with clean, company-name-based slug
      // Priority: businessName > companyName > industry > 'page'
      const slugSource = strategicData?.consultationData?.businessName 
        || consultationData.business_name 
        || consultationData.businessName
        || (consultationData.extracted_intelligence as any)?.companyName
        || consultationData.industry
        || 'page';
      const slug = await generateUniqueSlug(slugSource);
      console.log("💾 Creating new page in database with slug:", slug);
      
      // Get aiSeoData for meta tags optimization
      const aiSeoData = consultationData.aiSeoData || consultationData.ai_seo_data;
      
      // Resolve company name with proper fallback chain
      const companyName = strategicData?.consultationData?.businessName 
        || consultationData.business_name 
        || consultationData.businessName
        || (consultationData.extracted_intelligence as any)?.companyName
        || null;
      
      // Build meta title with proper fallbacks to avoid "undefined"
      const offerText = consultationData.offer || consultationData.service_type || consultationData.industry || 'Landing Page';
      const industryText = consultationData.industry || '';
      
      let optimizedMeta = {
        title: companyName 
          ? `${companyName} | ${offerText}`
          : (industryText ? `${offerText} - ${industryText}` : offerText),
        description: consultationData.unique_value || consultationData.uniqueValue || '',
      };
      
      // Use AI SEO optimized meta tags if available
      if (isAISeoDataValid(aiSeoData)) {
        const seoAssets = generateSEOAssets(
          {
            industry: consultationData.industry,
            offer: consultationData.offer,
            uniqueValue: consultationData.unique_value,
          },
          aiSeoData
        );
        optimizedMeta = {
          title: seoAssets.metaTags.title,
          description: seoAssets.metaTags.description,
        };
        console.log('✅ Using AI SEO optimized meta tags:', optimizedMeta);
      }
      
      // Prepare insert data with optional strategic fields
      // Use session_id for demo flows (no foreign key constraint), consultation_id for authenticated flows
      const isDemoSessionInsert = !!consultationData.session_id;
      const insertData: any = {
        user_id: userId,
        // Only set consultation_id if we have a real consultation (not a demo session)
        consultation_id: isDemoSessionInsert ? null : consultationData.id,
        // Store session_id for demo flows (added via migration, no FK constraint)
        session_id: isDemoSessionInsert ? consultationData.session_id : null,
        title: companyName 
          ? `${companyName} Landing Page`
          : `${consultationData.industry || 'New'} Landing Page`,
        slug,
        sections: generatedSections,
        meta_title: optimizedMeta.title,
        meta_description: optimizedMeta.description,
        // Always populate consultation_data with available intelligence and brand context
        consultation_data: {
          ...(strategicData?.consultationData || {}),
          industry: consultationData.industry,
          offer: consultationData.offer,
          uniqueValue: consultationData.unique_value || consultationData.uniqueValue,
          targetAudience: consultationData.target_audience || consultationData.targetAudience,
          businessName: companyName,
          extracted_intelligence: consultationData.extracted_intelligence,
          brandColors: {
            primary: strategicData?.brandSettings?.primaryColor || consultationData.primaryColor,
            secondary: strategicData?.brandSettings?.secondaryColor || consultationData.secondaryColor,
          },
          logoUrl: strategicData?.brandSettings?.logoUrl || consultationData.logoUrl,
        },
      };
      
      // Add strategic data if from new consultation flow (merge with existing consultation_data)
      if (fromStrategicConsultation && strategicData) {
        insertData.consultation_data = {
          ...insertData.consultation_data,
          ...strategicData.consultationData,
        };
        insertData.website_intelligence = strategicData.websiteIntelligence || null;
        insertData.strategy_brief = strategicData.strategyBrief || null;
        console.log("📋 Including strategic consultation data in page record");
      }
      
      // Compute and persist SDI decisions (colorMode, cardStyle, etc.)
      // This ensures multi-user isolation - each page has its own design intelligence
      const sdiDecisions = computeSDIDecisions(consultationData, strategicData, designIntelligence);
      if (sdiDecisions) {
        insertData.design_intelligence = sdiDecisions;
        console.log("🎨 Including SDI decisions in page record:", sdiDecisions);
      }
      
      // NEW: Include layout_id from SDI if available
      if (designIntelligence?.layoutId) {
        insertData.layout_id = designIntelligence.layoutId;
        console.log("📐 Including layout_id in page record:", designIntelligence.layoutId);
      }
      
      // Extract and set target_market from consultation data
      const targetMarket = getTargetMarketFromSources(consultationData, strategicData, effectiveNavState);
      if (targetMarket) {
        insertData.target_market = targetMarket;
        console.log("🎯 Including target_market in page record:", targetMarket);
      }
      
      // Attempt insert with retry on slug conflict (23505 unique constraint violation)
      let savedPageData = null;
      let insertAttempts = 0;
      const maxInsertAttempts = 3;
      
      while (insertAttempts < maxInsertAttempts) {
        insertAttempts++;
        const { data, error } = await supabase
          .from("landing_pages")
          .insert(insertData)
          .select()
          .single();
        
        if (error) {
          // Check for unique constraint violation on slug (Postgres error 23505)
          if (error.code === '23505' && insertAttempts < maxInsertAttempts) {
            const { appendRandomSuffixToSlug } = await import('@/utils/slugUtils');
            const oldSlug = insertData.slug;
            insertData.slug = appendRandomSuffixToSlug(oldSlug);
            console.log(`⚠️ Slug collision detected for "${oldSlug}", retrying with "${insertData.slug}" (attempt ${insertAttempts + 1}/${maxInsertAttempts})`);
            continue; // Retry with new slug
          }
          
          console.error("❌ Database save error:", error);
          throw error;
        }
        
        savedPageData = data;
        break; // Success, exit loop
      }

      if (savedPageData) {
        console.log("✅ Page saved successfully:", savedPageData.id, "with slug:", savedPageData.slug);
        setPageData(savedPageData);
        // Auto-QC pass before displaying
        const companyNameForQC = companyName || '';
        const extractedIntelForQC = (() => {
          try {
            const stored = localStorage.getItem('pageconsult_demo_extracted') || localStorage.getItem('pageconsult_extracted_intelligence');
            if (stored) { const p = JSON.parse(stored); if (p && typeof p === 'object' && Object.keys(p).length > 3) return p; }
          } catch {}
          return (consultationData.extracted_intelligence as any) || strategicData?.consultationData || consultationData;
        })();
        const { sections: qcSections } = autoQCPass(generatedSections, extractedIntelForQC, consultationData, companyNameForQC);
        setSections(qcSections);
      }

      // Mark generation complete - UnifiedGenerationFlow handles transition
      setIsGenerating(false);
    } catch (error) {
      console.error("❌ Generation failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Generation failed",
        description: `Error: ${errorMessage}. Please try again.`,
        variant: "destructive",
      });
      navigate("/#demo");
    }
  };

  const generateSections = async (consultationData: any): Promise<Section[]> => {
    // Content Generation Priority:
    // 0. NEW: Generate with strategy brief from strategic consultation (best, most strategic)
    // 1. Pre-generated content from wizard (fastest, already done)
    // 2. Generate with intelligence context (best quality, uses market research + persona)
    // 3. Fallback to old generation without intelligence (backwards compatibility)
    
    console.log('🔧 [generateSections] Starting with:', {
      fromStrategicConsultation,
      hasStrategicData: !!strategicData,
      hasStructuredBrief: !!strategicData?.structuredBrief,
      structuredBriefValid: strategicData?.structuredBrief ? isStructuredBriefContent(strategicData.structuredBrief) : false,
      hasStrategyBriefText: !!strategicData?.strategyBrief,
      hasPreGeneratedContent: !!preGeneratedContent,
      hasIntelligence: !!intelligence,
      hasDesignIntelligence: !!consultationData?.designIntelligence,
      consultationDataKeys: consultationData ? Object.keys(consultationData).filter(k => consultationData[k]) : [],
    });
    
    // Log SDI summary if available
    if (consultationData?.designIntelligence) {
      const sdi = consultationData.designIntelligence;
      console.log('🎨 [SDI] Design Intelligence in generateSections:', {
        tone: sdi.tone?.primary,
        industry: sdi.industry,
        colors: sdi.colors?.mode,
        typography: `${sdi.typography?.headingFont}/${sdi.typography?.bodyFont}`,
        awareness: sdi.awarenessLevel,
        proofDensity: sdi.proofDensity,
      });
    }
    
    if (strategicData?.structuredBrief) {
      console.log('📋 [generateSections] structuredBrief contents:', {
        hasHeadlines: 'headlines' in strategicData.structuredBrief,
        hasMessagingPillars: 'messagingPillars' in strategicData.structuredBrief,
        hasProofPoints: 'proofPoints' in strategicData.structuredBrief,
        hasPageStructure: 'pageStructure' in strategicData.structuredBrief,
        allKeys: Object.keys(strategicData.structuredBrief),
      });
    }
    
    try {
      // PRIORITY 0: Use structuredBrief directly from strategic consultation
      // BRIEF-FIRST: The brief already contains all strategic content - NO AI REGENERATION
      if (fromStrategicConsultation && strategicData?.structuredBrief && isStructuredBriefContent(strategicData.structuredBrief)) {
        console.log('📋 BRIEF-FIRST: Using structuredBrief directly (NO AI call)');
        console.log('📐 Page structure:', strategicData.structuredBrief.pageStructure);
        console.log('📊 Proof points:', strategicData.structuredBrief.proofPoints);
        console.log('🎯 Headlines:', strategicData.structuredBrief.headlines);
        
        // Generate design system from industry + tone + brand colors
        const structuredBrief = strategicData.structuredBrief;
        // BRAND DATA PIPELINE: Resolve from priority chain
        // Priority 1: consultation.extracted_intelligence.colors & .logoUrl
        // Priority 2: strategicData.brandSettings / consultationData.brandSettings
        // Priority 3: websiteIntelligence
        // Priority 4: localStorage
        const extractedIntel = strategicData.consultationData?.extracted_intelligence 
          || consultationData?.extracted_intelligence;
        const extractedIntelBrand = extractedIntel ? {
          primaryColor: extractedIntel.colors?.[0] || extractedIntel.brandColors?.primary || null,
          secondaryColor: extractedIntel.colors?.[1] || extractedIntel.brandColors?.secondary || null,
          logoUrl: extractedIntel.logoUrl || null,
        } : null;

        const navBrandSettings = strategicData.brandSettings 
          || strategicData.consultationData?.brandSettings
          || (strategicData.consultationData?.websiteIntelligence ? {
            logoUrl: strategicData.consultationData.websiteIntelligence.logoUrl,
            primaryColor: strategicData.consultationData.websiteIntelligence.primaryColor,
            secondaryColor: strategicData.consultationData.websiteIntelligence.secondaryColor,
          } : null);

        // Merge with extracted_intelligence taking priority
        const brandSettings = {
          ...navBrandSettings,
          ...(extractedIntelBrand?.primaryColor ? { primaryColor: extractedIntelBrand.primaryColor } : {}),
          ...(extractedIntelBrand?.logoUrl ? { logoUrl: extractedIntelBrand.logoUrl } : {}),
          ...(extractedIntelBrand?.secondaryColor ? { secondaryColor: extractedIntelBrand.secondaryColor } : {}),
        };

        const brandSource = extractedIntelBrand?.primaryColor ? 'extracted_intelligence' 
          : navBrandSettings?.primaryColor ? 'brandSettings/websiteIntelligence'
          : 'none';
        
        console.log(`🎨 [Brand Pipeline] Using colors from: ${brandSource}`);
        console.log('🔍 [Brand Pipeline] extractedIntelBrand:', extractedIntelBrand);
        console.log('🔍 [Brand Pipeline] navBrandSettings:', navBrandSettings);
        console.log('🔍 [Brand Pipeline] Resolved brandSettings:', brandSettings);
        
        const ds = generateDesignSystem({
          industry: consultationData.industry || 'default',
          tone: structuredBrief?.tone || 'professional',
          brandOverrides: brandSettings ? {
            primaryColor: brandSettings.primaryColor,
            secondaryColor: brandSettings.secondaryColor,
            extractedColors: strategicData.consultationData?.websiteIntelligence?.brandColors,
          } : strategicData.consultationData?.websiteIntelligence ? {
            primaryColor: strategicData.consultationData.websiteIntelligence.primaryColor,
            extractedColors: strategicData.consultationData.websiteIntelligence.colors,
          } : undefined,
        });
        setDesignSystem(ds);
        
        // Generate combined CSS variables from both legacy design system and new industry tokens
        const legacyCssVars = designSystemToCSSVariables(ds);
        
        // Detect industry variant early to generate industry-specific CSS
        // PREFER stored classification from consultation
        let earlyVariant: IndustryVariant;
        const storedClassificationEarly = strategicData.industryClassification;
        if (storedClassificationEarly?.variant && storedClassificationEarly.variant !== 'default') {
          earlyVariant = storedClassificationEarly.variant as IndustryVariant;
          console.log('🧠 [Generate-Early] Using stored classification:', earlyVariant);
        } else {
          earlyVariant = detectIndustryVariantNew(
            consultationData.industry,
            strategicData.consultationData?.industryCategory,
            strategicData.consultationData?.industrySubcategory,
            strategicData.consultationData?.pageType || undefined
          );
          console.log('🏭 [Generate-Early] Using sync detection:', earlyVariant);
        }
        const earlyTokens = getIndustryTokens(earlyVariant);
        const industryCssVars = generateIndustryCSSString(earlyTokens, {
          primaryColor: brandSettings?.primaryColor,
          accentColor: brandSettings?.secondaryColor,
        });
        
        // Merge both CSS variable sets (industry vars take precedence for new sections)
        const mergedCssVars = `${legacyCssVars}\n  /* Industry-specific tokens */\n  ${industryCssVars}`;
        setCssVariables(mergedCssVars);
        
        console.log('🎨 Generated design system:', ds.id);
        console.log('🏭 Early industry variant:', earlyVariant);
        
        // Use hero image resolution with caching and AI generation fallback
        const businessName = strategicData.consultationData?.businessName || consultationData.industry || 'Our Company';
        const userSelectedHeroImage = strategicData.heroBackgroundUrl || strategicData.consultationData?.heroBackgroundUrl;
        
        // AI hero images disabled — use CSS gradient backgrounds instead
        // Only use user-selected images (manual picks via editor)
        const heroImageUrl = userSelectedHeroImage || '';
        console.log('🖼️ [Generate] Hero image disabled — using CSS gradient. User-selected:', !!userSelectedHeroImage);
        
        // Get brand settings for passing to sections
        // BRAND DATA PIPELINE: Check all possible paths for logoUrl and primaryColor
        const logoUrl = brandSettings?.logoUrl 
          || strategicData.consultationData?.websiteIntelligence?.logoUrl 
          || strategicData.websiteIntelligence?.logoUrl
          || null;
        
        // COLOR CASCADE: Generate SDI palette for brand color resolution
        const sdiPaletteForBrief = generateSDIPalette(
          brandSettings?.primaryColor,
          consultationData.industry || 'default',
          extractedIntel?.backgroundColor
        );
        
        const primaryColor = brandSettings?.primaryColor 
          || strategicData.consultationData?.websiteIntelligence?.primaryColor
          || strategicData.websiteIntelligence?.primaryColor
          || ds.colors?.primary 
          || sdiPaletteForBrief.primary  // SDI palette fallback — never null
          || null;
        const pageType = strategicData.consultationData?.pageType || null;
        const pageGoal = strategicData.consultationData?.goal || consultationData.goal || 'generate-leads';
        
        console.log('🖼️ [Brand Pipeline] Logo URL for sections:', logoUrl);
        console.log('🎨 [Brand Pipeline] Primary color for sections:', primaryColor, '| SDI palette primary:', sdiPaletteForBrief.primary);
        console.log('📄 Page type:', pageType);
        console.log('🎯 Page goal:', pageGoal);
        
        // ============ BRIEF TO PAGE DEBUG ============
        console.log('📋 ============ BRIEF TO PAGE DEBUG ============');
        console.log('📋 Strategy Brief received:', {
          hasHeadlines: !!structuredBrief?.headlines,
          headlineOptions: structuredBrief?.headlines,
          hasProofPoints: !!structuredBrief?.proofPoints,
          proofPoints: structuredBrief?.proofPoints,
          hasMessagingPillars: !!structuredBrief?.messagingPillars,
          pillarCount: structuredBrief?.messagingPillars?.length,
          pillars: structuredBrief?.messagingPillars,
          hasObjections: !!structuredBrief?.objections,
          objectionCount: structuredBrief?.objections?.length,
          objections: structuredBrief?.objections,
          hasProblemStatement: !!structuredBrief?.problemStatement,
          problemStatement: structuredBrief?.problemStatement?.substring(0, 100),
          hasAISearchOptimization: !!(strategicData.aiSeoData || strategicData.consultationData?.ai_seo_data || strategicData.consultationData?.aiSeoData),
          authoritySignals: strategicData.aiSeoData?.authoritySignals || strategicData.consultationData?.ai_seo_data?.authoritySignals,
          hasPageStructure: !!structuredBrief?.pageStructure,
          pageStructure: structuredBrief?.pageStructure,
          hasTestimonials: !!structuredBrief?.testimonials,
          testimonialCount: structuredBrief?.testimonials?.length,
          tone: structuredBrief?.tone,
        });
        console.log('📋 Full structuredBrief object:', structuredBrief);
        
        // Detect industry variant - PREFER stored classification from consultation
        const storedClassification = strategicData.industryClassification;
        let detectedVariant: IndustryVariant;
        
        if (storedClassification?.variant && storedClassification.variant !== 'default') {
          detectedVariant = storedClassification.variant as IndustryVariant;
          console.log('🧠 [Generate] Using stored classification:', detectedVariant, '| Source:', storedClassification.source, '| Reasoning:', storedClassification.reasoning);
        } else {
          detectedVariant = detectIndustryVariantNew(
            consultationData.industry,
            strategicData.consultationData?.industryCategory,
            strategicData.consultationData?.industrySubcategory,
            pageType || undefined
          );
          console.log('🏭 [Generate] Using sync detection:', detectedVariant);
        }
        
        const tokens = getIndustryTokens(detectedVariant);
        
        // Set industry state for use in render
        setIndustryVariantState(detectedVariant);
        setIndustryTokens(tokens);
        
        // Determine available proof for optimal proof stack
        const availableProof = {
          hasMetrics: !!structuredBrief.proofPoints?.clientCount || !!structuredBrief.proofPoints?.yearsInBusiness,
          hasTestimonials: !!structuredBrief.testimonials?.length,
          hasCaseStudies: !!strategicData.consultationData?.caseStudyHighlight,
          hasCertifications: !!strategicData.consultationData?.credentials,
          hasSecurityBadges: !!strategicData.consultationData?.securityBadges,
          hasGuarantee: !!strategicData.consultationData?.guaranteeOffer,
        };
        
        const optimalProofStack = getOptimalProofStack(detectedVariant, availableProof);
        setProofStack(optimalProofStack);
        
        console.log('🏭 Industry variant detected:', detectedVariant);
        console.log('🎨 Industry tokens:', tokens);
        console.log('📊 Optimal proof stack:', optimalProofStack);
        
        // DIRECT MAPPING: Use the brief as-is, no AI regeneration
        const sections = mapBriefToSections(structuredBrief, {
          businessName,
          heroImageUrl,
          logoUrl,
          primaryColor,
          accentColor: brandSettings?.secondaryColor,
          pageType,
          pageGoal,
          industry: consultationData.industry,
          industryCategory: strategicData.consultationData?.industryCategory,
          industrySubcategory: strategicData.consultationData?.industrySubcategory,
          serviceType: consultationData.service_type,
          // Check multiple paths for AI SEO data
          aiSearchOptimization: strategicData.aiSeoData || strategicData.consultationData?.ai_seo_data || strategicData.consultationData?.aiSeoData || null,
          // Pass available proof for intelligent section building
          availableProof,
          // CRITICAL: Pass stored AI classification for accurate industry styling
          industryClassification: storedClassification,
          // SDI Layer 1.5: Messaging architecture for section reordering/suppression
          messagingArchitecture: messagingArchitecture?.primary || null,
        });
        
        console.log('📊 aiSearchOptimization passed to mapper:', strategicData.aiSeoData ? 'from strategicData.aiSeoData' : strategicData.consultationData?.ai_seo_data ? 'from consultationData.ai_seo_data' : 'null');
        
        // Log mapped sections for debugging
        console.log('📋 Mapped sections:', sections.map(s => ({
          type: s.type,
          order: s.order,
          visible: s.visible,
          hasContent: !!s.content,
          contentKeys: Object.keys(s.content || {}),
          // Show key content values for debugging
          contentPreview: {
            headline: s.content?.headline?.substring?.(0, 50),
            subheadline: s.content?.subheadline?.substring?.(0, 50),
            featureCount: s.content?.features?.length,
            statCount: s.content?.stats?.length,
            faqCount: s.content?.faqItems?.length,
          }
        })));
        console.log('📋 ============ END BRIEF DEBUG ============');
        
        console.log(`✅ BRIEF-FIRST: Built ${sections.length} sections directly from structuredBrief`);
        return sections;
      }
      
      // FALLBACK: If we have strategyBrief text but no structuredBrief, call the edge function
      if (fromStrategicConsultation && strategicData?.strategyBrief && !strategicData?.structuredBrief) {
        console.log('📋 Using strategyBrief text (requires AI parsing)');
        
        const brandSettings = strategicData.brandSettings || strategicData.consultationData?.brandSettings;
        const ds = generateDesignSystem({
          industry: consultationData.industry || 'default',
          tone: 'professional',
          brandOverrides: brandSettings ? {
            primaryColor: brandSettings.primaryColor,
            secondaryColor: brandSettings.secondaryColor,
          } : undefined,
        });
        setDesignSystem(ds);
        
        // Generate industry-aware CSS variables
        const variant = detectIndustryVariantNew(consultationData.industry);
        const tokens = getIndustryTokens(variant);
        const industryCss = generateIndustryCSSString(tokens, {
          primaryColor: brandSettings?.primaryColor,
          accentColor: brandSettings?.secondaryColor,
        });
        setCssVariables(`${designSystemToCSSVariables(ds)}\n  ${industryCss}`);
        
        // ── Archetype Optimization (SDI Layer 1.5) ────────────────────────────
        let optimizationConstraints: string | null = null;
        let optimizationPrimary: any = null;
        try {
          const sc = strategicData?.consultationData || {};
          const intelProfile: IntelProfile = {
            industry: sc?.industry || sc?.industryCategory || consultationData.industry,
            audience: sc?.idealClient,
            pricePoint: parseFloat(
              String(sc?.investmentRange || '0').replace(/[^0-9.]/g, '')
            ),
            painPoints: sc?.clientFrustration,
            tone: sc?.tone,
            valueProp: sc?.mainOffer,
            edge: sc?.uniqueStrength,
          };
          const optimizationResult = optimizeFromProfile(intelProfile);
          optimizationConstraints = optimizationResult.generationConstraints;
          optimizationPrimary = optimizationResult.primary;
          setMessagingArchitecture(optimizationResult);
          console.log('🎯 [ArchetypeOptimizer] Locked:', optimizationResult.primary.archetype, '→', optimizationResult.primary.stateKey);
        } catch (err) {
          console.warn('🎯 [ArchetypeOptimizer] Optimization failed (non-blocking):', err);
          // Fallback to nav state if optimizer fails
          optimizationPrimary = strategicData?.messagingArchitecture || null;
          optimizationConstraints = strategicData?.messagingConstraints || null;
          if (optimizationPrimary) console.log('🎯 [ArchetypeOptimizer] Using nav state fallback');
        }

        const { data: result, error } = await supabase.functions.invoke('generate-page-content', {
          body: {
            strategyBrief: strategicData.strategyBrief,
            structuredBrief: null,
            strategicConsultation: strategicData.consultationData,
            industry: consultationData.industry,
            pageType: strategicData.consultationData?.pageType || null,
            messagingArchitecture: optimizationPrimary,
            messagingConstraints: optimizationConstraints,
          }
        });
        
        if (error) {
          console.warn('⚠️ Strategy brief generation failed:', error);
        } else if (result?.success && result?.content) {
          console.log('✅ Strategy brief parsed content:', result.content);
          return await mapStrategyBriefContentToSections(result.content, consultationData, strategicData.consultationData);
        }
      }
      
      // Generate fallback design system for non-strategic flows
      if (!designSystem) {
        // CRITICAL FIX: Detect industry variant FIRST, then use it for design system
        const fallbackVariant = detectIndustryVariantNew(consultationData.industry);
        
        // Map industry variant to design system industry type
        // This ensures "consulting" variant gets "professional-services" design system, not "default"
        const industryTypeMap: Record<string, string> = {
          'consulting': 'professional-services',
          'saas': 'saas-software',
          'healthcare': 'healthcare-medical',
          'realestate': 'real-estate',
          'fitness': 'fitness-wellness',
          'manufacturing': 'manufacturing-industrial',
          'legal': 'legal-services',
          'financial': 'financial-services',
          'ecommerce': 'ecommerce-retail',
          'agency': 'agency-creative',
          'education': 'education-coaching',
        };
        
        const mappedIndustryType = industryTypeMap[fallbackVariant] || consultationData.industry || 'default';
        
        const ds = generateDesignSystem({
          industry: mappedIndustryType,
          tone: 'professional',
        });
        setDesignSystem(ds);
        
        // Generate industry-aware CSS variables for fallback
        const fallbackTokens = getIndustryTokens(fallbackVariant);
        const fallbackIndustryCss = generateIndustryCSSString(fallbackTokens);
        setCssVariables(`${designSystemToCSSVariables(ds)}\n  ${fallbackIndustryCss}`);
        console.log('🎨 Using', fallbackVariant, 'design system (industry type:', mappedIndustryType, ')');
      }

      // PRIORITY 1: Use pre-generated content from wizard if available
      if (preGeneratedContent) {
        console.log('✅ Using pre-generated content from wizard');
        return await mapGeneratedContentToSections(preGeneratedContent, consultationData);
      }

      // PRIORITY 2: Generate with intelligence if available
      if (intelligence) {
        console.log('🧠 Generating with market intelligence');
        const result = await generateIntelligentContent(
          {
            industry: consultationData.industry,
            targetAudience: consultationData.target_audience,
            serviceType: consultationData.service_type,
            challenge: consultationData.challenge,
            goal: consultationData.goal,
            uniqueValue: consultationData.unique_value,
            offer: consultationData.offer,
          },
          intelligence
        );

        if (result.success && result.content) {
          console.log('✅ Intelligence-generated content:', result.content);
          return await mapGeneratedContentToSections(result.content, consultationData);
        } else {
          console.warn('⚠️ Intelligence generation failed, falling back:', result.error);
        }
      }

      // PRIORITY 3: Use old intelligent content generation (no persona)
      // Using static import from top of file

      console.log("🚀 Starting fallback content generation...");
      const generated = await generateIntelligentContentLegacy({
        industry: consultationData.industry,
        service_type: consultationData.service_type,
        goal: consultationData.goal,
        target_audience: consultationData.target_audience,
        challenge: consultationData.challenge,
        unique_value: consultationData.unique_value,
        offer: consultationData.offer,
      });

      console.log("✅ Generated content:", generated);
      
      // Use mapStrategyBriefContentToSections for intelligent extraction
      // This calls mapBriefToSections with briefExtractor functions
      return await mapStrategyBriefContentToSections(generated, consultationData, {
        businessName: consultationData.companyName || consultationData.industry,
        pageType: consultationData.pageType,
        primaryGoal: consultationData.goal,
        brandSettings: effectiveNavState?.strategicData?.brandSettings,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("❌ AI CONTENT GENERATION FAILED:", {
        error: errorMessage,
        fullError: error,
      });

      // Show error to user
      toast({
        title: "AI Content Generation Failed",
        description: `Error: ${errorMessage}. Using template content instead.`,
        variant: "destructive",
      });

      // Fallback to template-based generation
      return await generateFallbackSections(consultationData);
    }
  };

  // Map new GeneratedContent format to Section[]
  const mapGeneratedContentToSections = async (
    content: GeneratedContent, 
    consultationData: any
  ): Promise<Section[]> => {
    // Fetch images with industry context
    const effectiveIndustry = consultationData?.industry || consultationData?.industryCategory || 'professional services';
    const heroImageUrl = await fetchHeroImage(
      content.images?.hero || `${consultationData.industry || ''} ${consultationData.target_audience || ''}`.trim(),
      effectiveIndustry
    );
    const galleryImages = await fetchGalleryImages(content.images?.gallery || []);

    const sections: Section[] = [];
    let order = 0;

    // Hero - NO hardcoded trust badges
    sections.push({
      type: "hero",
      order: order++,
      visible: true,
      content: {
        headline: content.headline,
        subheadline: content.subheadline,
        ctaText: content.ctaText,
        ctaLink: "#signup",
        backgroundImage: heroImageUrl,
        // trustBadges deliberately omitted - no fabrication
      },
    });

    // Stats Bar (after hero) - use clean statistics from generated content or intelligence
    let statisticsToShow: Array<{ value: string; label: string; source?: string }> = [];
    
    // First priority: use statistics from generated content
    if (content.statistics && Array.isArray(content.statistics) && content.statistics.length > 0) {
      statisticsToShow = content.statistics.slice(0, 3);
    } 
    // Fallback: try to extract from intelligence claims
    else if (intelligence?.marketResearch?.claims) {
      const statClaims = intelligence.marketResearch.claims
        .filter((c: any) => c.category === 'statistic')
        .slice(0, 3);
      
      statisticsToShow = statClaims.map((stat: any) => {
        // Try to parse "21,714 wedding businesses" -> { value: "21,714", label: "wedding businesses" }
        const match = stat.claim.match(/^([\d,.$%]+(?:[KMB])?)\s+(.*)$/i);
        if (match) {
          return { value: match[1], label: match[2], source: stat.source };
        }
        // If no match, try to find number anywhere
        const numMatch = stat.claim.match(/([\d,.$%]+(?:[KMB])?)/);
        if (numMatch) {
          const label = stat.claim.replace(numMatch[0], '').trim();
          return { value: numMatch[1], label: label || 'Market statistic', source: stat.source };
        }
        return null;
      }).filter(Boolean);
    }
    
    if (statisticsToShow.length > 0) {
      sections.push({
        type: "stats-bar",
        order: order++,
        visible: true,
        content: {
          statistics: statisticsToShow,
        },
      });
    }

    // Problem-Solution
    sections.push({
      type: "problem-solution",
      order: order++,
      visible: true,
      content: {
        problem: content.problemStatement,
        solution: content.solutionStatement,
      },
    });

    // Features
    sections.push({
      type: "features",
      order: order++,
      visible: true,
      content: {
        features: content.features,
      },
    });

    // Gallery (if we have images)
    if (galleryImages.length > 0) {
      sections.push({
        type: "photo-gallery",
        order: order++,
        visible: true,
        content: {
          images: galleryImages,
          title: `${consultationData.industry} Gallery`,
        },
      });
    }

    // Social Proof with testimonial (no duplicate stats)
    sections.push({
      type: "social-proof",
      order: order++,
      visible: true,
      content: {
        stats: [], // Stats are shown in stats-bar section
        industry: consultationData.industry,
        testimonial: {
          quote: content.socialProof || `${consultationData.industry} professionals across the region trust us for their most important needs.`,
          name: "Sarah M.",
          title: "Satisfied Customer",
          company: "",
          rating: 5,
        },
      },
    });

    // FAQ Section (from aiSeoData if available)
    const aiSeoData = consultationData.aiSeoData || consultationData.ai_seo_data;
    if (isAISeoDataValid(aiSeoData) && aiSeoData.faqItems?.length > 0) {
      const faqConfig = createFAQSectionConfig(aiSeoData.faqItems);
      sections.push({
        ...faqConfig,
        order: order++,
      });
      console.log('✅ Added FAQ section with', aiSeoData.faqItems.length, 'items');
    }

    // Final CTA
    sections.push({
      type: "final-cta",
      order: order++,
      visible: true,
      content: {
        headline: "Ready to Get Started?",
        ctaText: content.ctaText,
        ctaLink: "#signup",
      },
    });

    return sections;
  };

  // Map strategy brief generated content to Section[]
  // BRIEF-FIRST: Uses the new strict mapper that treats structuredBrief as single source of truth
  const mapStrategyBriefContentToSections = async (
    content: any,
    consultationData: any,
    strategicConsultation: any
  ): Promise<Section[]> => {
    const businessName = strategicConsultation?.businessName || consultationData.industry || 'Our Company';
    const pageType = strategicConsultation?.pageType || null;
    
    console.log('[mapStrategyBriefContentToSections] pageType:', pageType);
    
    // Fetch hero image with full industry context
    const effectiveIndustry = strategicConsultation?.industry || consultationData?.industry || 'professional services';
    const heroImageUrl = await fetchHeroImage(
      `${businessName} ${strategicConsultation?.target_audience || ''} ${strategicConsultation?.unique_value || ''}`.trim(),
      effectiveIndustry
    );

    // BRAND DATA PIPELINE: Resolve from priority chain with source logging
    // Priority 1: consultation.extracted_intelligence
    const extractedIntel = strategicConsultation?.extracted_intelligence 
      || consultationData?.extracted_intelligence;
    const extractedIntelBrand = extractedIntel ? {
      primaryColor: extractedIntel.colors?.[0] || extractedIntel.brandColors?.primary || null,
      secondaryColor: extractedIntel.colors?.[1] || extractedIntel.brandColors?.secondary || null,
      logoUrl: extractedIntel.logoUrl || null,
    } : null;

    // Priority 2: brandSettings from nav state
    let navBrandSettings = strategicConsultation?.brandSettings 
      || effectiveNavState?.strategicData?.brandSettings
      || effectiveNavState?.strategicData?.consultationData?.brandSettings
      || null;
    
    // Priority 3: localStorage brand data
    if (!navBrandSettings?.logoUrl && !navBrandSettings?.primaryColor) {
      const localStorageBrandPaths = [
        'pageconsult_brand_settings',
        'brand_settings', 
        'pageconsult_brand_data',
        'consultation_brand_data'
      ];
      
      for (const path of localStorageBrandPaths) {
        try {
          const stored = localStorage.getItem(path);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed?.primaryColor || parsed?.logoUrl) {
              console.log(`🎨 [Brand Pipeline] Retrieved brand from localStorage "${path}"`);
              navBrandSettings = { ...navBrandSettings, ...parsed };
              break;
            }
          }
        } catch (e) {
          // Silently continue to next path
        }
      }
    }

    // Merge: extracted_intelligence > brandSettings > websiteIntelligence
    const logoUrl = extractedIntelBrand?.logoUrl
      || navBrandSettings?.logoUrl
      || strategicConsultation?.websiteIntelligence?.logoUrl 
      || effectiveNavState?.strategicData?.consultationData?.websiteIntelligence?.logoUrl
      || effectiveNavState?.strategicData?.websiteIntelligence?.logoUrl
      || null;
    const primaryColor = extractedIntelBrand?.primaryColor
      || navBrandSettings?.primaryColor 
      || strategicConsultation?.websiteIntelligence?.primaryColor
      || effectiveNavState?.strategicData?.consultationData?.websiteIntelligence?.primaryColor
      || designSystem?.colors?.primary
      // COLOR CASCADE: SDI palette fallback — ensures brand color ALWAYS flows through
      || (() => {
        const sdiData = consultationData?.designIntelligence;
        if (sdiData?.palette?.primary) {
          console.log('🎨 [Brand Pipeline] Using SDI palette primary as fallback:', sdiData.palette.primary);
          return sdiData.palette.primary;
        }
        return null;
      })()
      || null;

    const brandSource = extractedIntelBrand?.primaryColor ? 'extracted_intelligence'
      : navBrandSettings?.primaryColor ? 'brandSettings'
      : strategicConsultation?.websiteIntelligence?.primaryColor ? 'websiteIntelligence'
      : designSystem?.colors?.primary ? 'designSystem'
      : consultationData?.designIntelligence?.palette?.primary ? 'sdi-palette'
      : 'none';
    
    console.log(`🎨 [Brand Pipeline] Using colors from: ${brandSource}`);
    console.log('🖼️ [Brand Pipeline] mapStrategyBriefContentToSections logoUrl:', logoUrl ? logoUrl.substring(0, 60) + '...' : null);
    console.log('🎨 [Brand Pipeline] mapStrategyBriefContentToSections primaryColor:', primaryColor);

    // Check if content is a valid structured brief
    if (isStructuredBriefContent(content)) {
      console.log('📋 Using BRIEF-FIRST mapper with structuredBrief');
      console.log('📐 Page structure:', content.pageStructure);
      console.log('📊 Proof points:', content.proofPoints);
      console.log('🎯 Messaging pillars:', content.messagingPillars?.length);
      console.log('📄 Page type:', pageType);
      
      // Extract page goal from consultation data
      const pageGoal = strategicConsultation?.primaryGoal || 
                       strategicConsultation?.goal || 
                       consultationData.goal || 
                       'generate-leads';
      
      // Get AI search optimization data if available (from consultation, not brief)
      const aiSearchOptimization = strategicConsultation?.aiSearchOptimization || 
                                   consultationData?.ai_seo_data || 
                                   null;
      
      console.log('🎯 Page goal for headline selection:', pageGoal);
      console.log('📈 AI Search Optimization data:', !!aiSearchOptimization);
      
      // Use the strict brief-first mapper with INTELLIGENT EXTRACTION
      const sections = mapBriefToSections(content, {
        businessName,
        heroImageUrl,
        logoUrl,
        primaryColor,
        pageType,
        pageGoal,                                   // For intelligent headline selection
        industry: consultationData.industry,       // For industry variant detection
        serviceType: consultationData.service_type, // For industry variant detection
        aiSearchOptimization,                       // For authority signal extraction
        messagingArchitecture: messagingArchitecture?.primary || null,
      });
      
      console.log(`✅ Brief-first mapper built ${sections.length} sections with intelligent extraction`);
      return sections;
    }
    
    // Fallback for legacy content format that doesn't match StructuredBrief
    console.log('⚠️ Content is not a valid StructuredBrief, using legacy mapping');
    
    // Ensure SDI is included in consultationData before passing to legacy mapper
    // consultationData.designIntelligence should be set from the transformation step
    const sdiFromData = consultationData?.designIntelligence;
    
    const consultationDataWithSDI = {
      ...consultationData,
      designIntelligence: sdiFromData,
    };
    
    console.log('🎨 [Generate] Passing SDI to legacy mapper:', sdiFromData ? 'YES' : 'NO');
    console.log('🎨 [Generate] SDI industry:', sdiFromData?.industry);
    
    return mapLegacyStrategyContent(content, consultationDataWithSDI, strategicConsultation, heroImageUrl);
  };
  
  // Legacy mapping for non-structured brief content
  const mapLegacyStrategyContent = async (
    content: any,
    consultationData: any,
    strategicConsultation: any,
    heroImageUrl: string
  ): Promise<Section[]> => {
    // DEBUG: Check if designIntelligence is being passed
    console.log('🔍 [DEBUG] consultationData.designIntelligence:', consultationData?.designIntelligence);
    
    // DEBUG: Log full content structure to find where data lives
    console.log('🔍 [mapLegacyStrategyContent] Full content keys:', Object.keys(content || {}));
    console.log('🔍 [mapLegacyStrategyContent] Full content:', JSON.stringify(content, null, 2).slice(0, 3000));
    console.log('🔍 [mapLegacyStrategyContent] consultationData keys:', Object.keys(consultationData || {}));
    console.log('🔍 [mapLegacyStrategyContent] strategicConsultation keys:', Object.keys(strategicConsultation || {}));
    
    const sections: Section[] = [];
    let order = 0;
    
    // Extract intelligence from ALL possible locations — do this ONCE at the top
    const extractedIntel: any = 
      consultationData?.extracted_intelligence ||
      strategicConsultation?.extracted_intelligence ||
      consultationData?.strategicConsultation?.extracted_intelligence ||
      consultationData?.strategic_consultation?.extracted_intelligence ||
      (() => {
        // Fallback: read from localStorage if consultation record is missing it
        try {
          const raw = localStorage.getItem('pageconsult_demo_extracted');
          if (raw) {
            console.log('📦 [mapLegacyStrategyContent] Using localStorage fallback for extractedIntel');
            return JSON.parse(raw);
          }
        } catch { }
        return null;
      })();
    
    console.log('🔍 [mapLegacyStrategyContent] extractedIntel found:', !!extractedIntel);
    if (extractedIntel) {
      console.log('🔍 [mapLegacyStrategyContent] extractedIntel keys:', Object.keys(extractedIntel));
      console.log('🔍 [mapLegacyStrategyContent] buyerObjections:', extractedIntel.buyerObjections);
      console.log('🔍 [mapLegacyStrategyContent] painPoints:', extractedIntel.painPoints);
    }
    
    // Use company name from extracted intelligence for subtitle/headline personalization
    const companyName = extractedIntel?.companyName 
      || consultationData?.company_name 
      || consultationData?.business_name
      || strategicConsultation?.businessName
      || (() => {
        try {
          const brandData = JSON.parse(localStorage.getItem('pageconsult_brand_data') || '{}');
          return brandData.companyName || '';
        } catch { return ''; }
      })();
    const businessName = companyName || strategicConsultation?.businessName || '';
    
    // CRITICAL: Get pageType for beta section mapping
    const pageType = strategicConsultation?.pageType || consultationData.pageType || null;
    const isBetaPage = pageType === 'beta-prelaunch';
    console.log('🏗️ [mapLegacyStrategyContent] pageType:', pageType, '| isBetaPage:', isBetaPage);
    
    // PRIORITY: Extract SDI (Strategic Design Intelligence) if available
    const sdi = consultationData?.designIntelligence;
    
    // DEBUG: Log SDI design system availability
    console.log('🎨 [mapLegacyStrategyContent] SDI available:', {
      hasPalette: !!sdi?.palette,
      hasSectionThemes: !!sdi?.sectionThemes,
      hasTypography: !!sdi?.sdiTypography,
      primaryColor: sdi?.palette?.primary,
    });
    
    if (sdi) {
      console.log('🎨 [SDI] Legacy mapper found design intelligence:', {
        industry: sdi.industry,
        mode: sdi.colors?.mode,
        proofDensity: sdi.proofDensity,
        hasProofPoints: !!sdi.proofPoints,
      });
    }
    
    // PRIORITY ORDER for industry variant:
    // 1. Stored AI classification (from consultation completion)
    // 2. SDI industry
    // 3. Sync keyword detection
    let industryVariant: IndustryVariant;
    const storedClassificationSDI = effectiveNavState?.strategicData?.industryClassification;
    
    if (storedClassificationSDI?.variant && storedClassificationSDI.variant !== 'default') {
      industryVariant = storedClassificationSDI.variant as IndustryVariant;
      console.log('🧠 [Generate-SDI] Using stored classification:', industryVariant, '| Source:', storedClassificationSDI.source);
    } else if (sdi?.industry) {
      industryVariant = sdi.industry as IndustryVariant;
      console.log('🎨 [SDI] Using industry from SDI:', industryVariant);
    } else {
      // Fallback to sync detection
      industryVariant = detectIndustryVariantNew(
        consultationData?.industry || strategicConsultation?.industry,
        strategicConsultation?.industryCategory,
        strategicConsultation?.industrySubcategory,
        pageType
      );
      console.log('🔍 [Legacy] Detected industry from string:', industryVariant);
    }
    
    // Get mode from SDI colors — PRIORITY: extracted brand colorMode > SDI detected > industry default
    // This ensures dark-mode brands (e.g., Ankura) don't get forced to light mode by industry rules
    const extractedBrandColorMode = 
      strategicConsultation?.websiteIntelligence?.colorMode ||
      consultationData?.websiteIntelligence?.colorMode ||
      effectiveNavState?.strategicData?.consultationData?.websiteIntelligence?.colorMode ||
      effectiveNavState?.strategicData?.websiteIntelligence?.colorMode ||
      null;
    const sdiMode = extractedBrandColorMode || sdi?.colors?.mode || 'dark';
    console.log('🎨 [sectionMapper] Mode priority:', {
      brandExtracted: extractedBrandColorMode,
      sdiDetected: sdi?.colors?.mode,
      final: sdiMode,
    });
    
    // Get brand settings for passing to sections
    // BRAND DATA PIPELINE: Check all possible paths
    const brandSettings = strategicConsultation?.brandSettings 
      || effectiveNavState?.strategicData?.brandSettings
      || effectiveNavState?.strategicData?.consultationData?.brandSettings
      || null;
    const logoUrl = brandSettings?.logoUrl 
      || strategicConsultation?.websiteIntelligence?.logoUrl 
      || effectiveNavState?.strategicData?.consultationData?.websiteIntelligence?.logoUrl
      || effectiveNavState?.strategicData?.websiteIntelligence?.logoUrl
      || null;
    const primaryColor = brandSettings?.primaryColor 
      || strategicConsultation?.websiteIntelligence?.primaryColor
      || effectiveNavState?.strategicData?.consultationData?.websiteIntelligence?.primaryColor
      || designSystem?.colors?.primary 
      || sdi?.palette?.primary  // COLOR CASCADE: SDI palette fallback
      || null;

    // LAYOUT TEMPLATE INTEGRATION:
    // Priority 1: Use layoutSections from SDI (from layout template system)
    // Priority 2: Use content.pageStructure (from strategy brief generation)
    // Priority 3: Use SDI section selection (computed)
    let pageStructure: string[];
    let layoutSource: string = 'unknown';
    
    if (sdi?.layoutSections && sdi.layoutSections.length > 0) {
      // Use layout template sections from SDI
      pageStructure = sdi.layoutSections;
      layoutSource = `layout-template:${sdi.layoutId}`;
      console.log(`📐 [mapLegacyStrategyContent] Using layout template "${sdi.layoutId}" with ${pageStructure.length} sections:`, pageStructure);
      console.log(`📐 [mapLegacyStrategyContent] Layout reasoning: ${sdi.layoutReasoning}`);
      console.log(`📐 [mapLegacyStrategyContent] Layout confidence: ${sdi.layoutConfidence}`);
    } else if (content.pageStructure && content.pageStructure.length > 0) {
      pageStructure = content.pageStructure;
      layoutSource = 'content-strategy-brief';
      console.log('📋 [mapLegacyStrategyContent] Using page structure from content:', pageStructure);
    } else {
      // Fallback to SDI-driven section selection
      const sdiSelectionResult = selectSectionsFromSDI(sdi, { isBetaPage });
      pageStructure = sdiSelectionResult.sections;
      layoutSource = 'sdi-computed';
      console.log('🏗️ [mapLegacyStrategyContent] SDI-driven section selection:', {
        awarenessLevel: sdi?.awarenessLevel,
        proofDensity: sdi?.proofDensity,
        heroVariant: sdiSelectionResult.heroVariant,
        reasoning: sdiSelectionResult.reasoning,
        pageStructure
      });
    }
    
    // SUPPORTED_SECTION_TYPES: Only section types with working renderer components
    const SUPPORTED_SECTION_TYPES = new Set([
      'hero',
      'features',
      'stats-bar',
      'social-proof',
      'process', 'how-it-works',
      'faq',
      'final-cta',
      'problem-solution',
      'founder',
      'waitlist-proof',
      'beta-perks',
      'beta-hero-teaser',
      'beta-final-cta',
      // Consulting-specific
      'credentials-bar',
      'the-real-challenge',
      'our-approach',
      'expertise-areas',
      'engagement-model',
      'client-results',
      // SDI-driven
      'stakes-amplify',
      'risk-reversal',
      'comparison',
    ]);

    // Map alternate names to canonical supported types (null = explicitly skip)
    const SECTION_TYPE_ALIASES: Record<string, string | null> = {
      'stats_bar': 'stats-bar',
      'statsbar': 'stats-bar',
      'stats-bar': 'stats-bar',
      'testimonials': 'social-proof',
      'process_timeline': 'how-it-works',
      'process-timeline': 'how-it-works',
      'howItWorks': 'how-it-works',
      'case_study': 'social-proof',      // fallback: render as social proof
      'case-study': 'social-proof',      // until dedicated case-study renderer exists
      'product-demo': null,              // explicitly unsupported, skip silently
      'integrations': null,              // explicitly unsupported, skip silently
      'pricing-tiers': null,             // explicitly unsupported, skip silently
      'pricing': null,                   // explicitly unsupported, skip silently
    };

    const MIN_SECTIONS = 5;
    const TARGET_SECTIONS = 7;

    // Resolve section types through alias mapping, then filter against supported set
    const resolvedStructure = pageStructure
      .map(s => {
        if (s in SECTION_TYPE_ALIASES) {
          const alias = SECTION_TYPE_ALIASES[s];
          if (alias === null) {
            console.log(`📐 [mapLegacyStrategyContent] Skipping unsupported layout section: ${s}`);
            return null;
          }
          if (alias !== s) {
            console.log(`📐 [mapLegacyStrategyContent] Alias: ${s} → ${alias}`);
          }
          return alias;
        }
        return s;
      })
      .filter((s): s is string => s !== null)
      .filter(s => SUPPORTED_SECTION_TYPES.has(s));

    // Deduplicate (e.g. if both 'testimonials' and 'social-proof' mapped to same type)
    let filteredStructure = [...new Set(resolvedStructure)];

    const droppedCount = pageStructure.length - filteredStructure.length;
    if (droppedCount > 0) {
      console.warn(`⚠️ [mapLegacyStrategyContent] Dropped ${droppedCount} sections after alias resolution`);
    }

    // If filtering reduced below MIN_SECTIONS, backfill from AI-suggested content.sections
    if (filteredStructure.length < MIN_SECTIONS && content.sections && Array.isArray(content.sections)) {
      const alreadyIncluded = new Set(filteredStructure);
      const aiSuggested = (content.sections as string[])
        .map(s => SECTION_TYPE_ALIASES[s] !== undefined ? SECTION_TYPE_ALIASES[s] : s)
        .filter((s): s is string => s !== null && SUPPORTED_SECTION_TYPES.has(s) && !alreadyIncluded.has(s));
      
      for (const aiSection of aiSuggested) {
        if (filteredStructure.length >= TARGET_SECTIONS) break;
        // Insert before final-cta if present
        const ctaIndex = filteredStructure.indexOf('final-cta');
        if (ctaIndex >= 0) {
          filteredStructure.splice(ctaIndex, 0, aiSection);
        } else {
          filteredStructure.push(aiSection);
        }
        alreadyIncluded.add(aiSection);
      }
      
      if (aiSuggested.length > 0) {
        console.log(`📋 [mapLegacyStrategyContent] Backfilled from AI suggestions. Final sections:`, filteredStructure);
      }
    }

    console.log('📐 [mapLegacyStrategyContent] Layout source:', layoutSource,
      '| Original:', pageStructure.length,
      '| Resolved:', filteredStructure.length,
      '| Structure:', filteredStructure);

    // Use resolved structure for rendering
    pageStructure = filteredStructure;

    // Helper to parse objections string into FAQ items
    const parseObjectionsString = (objStr: string): Array<{ question: string; answer: string }> => {
      if (!objStr) return [];
      return objStr.split(',').map(q => {
        const trimmed = q.trim();
        return {
          question: trimmed.endsWith('?') ? trimmed : trimmed + '?',
          answer: 'We address this concern directly in our consultation process and provide clear solutions tailored to your situation.'
        };
      }).filter(item => item.question.length > 5);
    };

    // Reframe a buyer objection into a natural prospect question
    const reframeObjectionAsQuestion = (objection: string): string => {
      const lower = objection.toLowerCase().trim();
      // Already a question
      if (lower.endsWith('?')) return objection;
      // Common objection patterns → question reframes
      if (lower.startsWith('we already') || lower.includes('already have') || lower.includes('already use')) {
        return `How is this different from the tools we already use?`;
      }
      if (lower.includes('too expensive') || lower.includes('cost') || lower.includes('price') || lower.includes('budget')) {
        return `What's the expected ROI and how does pricing work?`;
      }
      if (lower.includes('don\'t have time') || lower.includes('too busy') || lower.includes('bandwidth')) {
        return `How much time does implementation and onboarding take?`;
      }
      if (lower.includes('not sure') || lower.includes('not ready') || lower.includes('need to think')) {
        return `What should we consider before making a decision?`;
      }
      if (lower.includes('competitor') || lower.includes('alternative') || lower.includes('other option')) {
        return `How do you compare to other options in the market?`;
      }
      // Generic reframe: turn statement into question
      return `${objection.charAt(0).toUpperCase()}${objection.slice(1)}${objection.endsWith('?') ? '' : '?'}`;
    };

    // Reframe a pain point into a natural prospect question
    const reframePainPointAsQuestion = (painPoint: string): string => {
      const lower = painPoint.toLowerCase().trim();
      if (lower.includes('toggling') || lower.includes('switching') || lower.includes('disconnected')) {
        return `Will this replace our existing tools or work alongside them?`;
      }
      if (lower.includes('manual') || lower.includes('time-consuming') || lower.includes('repetitive')) {
        return `How much of the manual work does this automate?`;
      }
      if (lower.includes('visibility') || lower.includes('tracking') || lower.includes('reporting')) {
        return `What kind of visibility and reporting do we get?`;
      }
      if (lower.includes('scaling') || lower.includes('growth') || lower.includes('growing')) {
        return `How does this scale as our business grows?`;
      }
      // Generic reframe
      return `How do you help with ${painPoint.toLowerCase().replace(/[.!]$/, '')}?`;
    };

    // ========== CONSULTING SECTION DATA EXTRACTION HELPERS ==========
    
    // Extract credentials from proof points and consultation data
    const extractCredentials = (): Array<{icon: string, value: string, label: string}> => {
      const credentials: Array<{icon: string, value: string, label: string}> = [];
      
      // PRIORITY 1: Use SDI proof points (extracted during design intelligence phase)
      if (sdi?.proofPoints) {
        const proof = sdi.proofPoints;
        
        // Years in business
        if (proof.yearsInBusiness) {
          const match = proof.yearsInBusiness.match(/(\d+)\+?/);
          if (match) {
            credentials.push({ icon: 'award', value: `${match[1]}+`, label: 'Years Experience' });
          }
        }
        
        // Client count
        if (proof.clientCount) {
          const match = proof.clientCount.match(/(\d+[\d,]*)\+?/);
          if (match) {
            credentials.push({ icon: 'users', value: `${match[1].replace(',', '')}+`, label: 'Clients Served' });
          }
        }
        
        // Industry awards/recognition from raw text
        if (proof.rawProofText) {
          const rawText = proof.rawProofText.toLowerCase();
          if (rawText.includes('forrester') || rawText.includes('gartner')) {
            credentials.push({ icon: 'badge', value: 'Leader', label: 'Analyst Recognition' });
          }
          if (rawText.includes('fortune 500') || rawText.includes('fortune500')) {
            credentials.push({ icon: 'shield', value: 'Trusted', label: 'By Fortune 500' });
          }
          // Countries/offices
          const countryMatch = rawText.match(/(\d+)\+?\s*(countries|offices|locations|global offices)/i);
          if (countryMatch) {
            credentials.push({ icon: 'globe', value: `${countryMatch[1]}+`, label: countryMatch[2].charAt(0).toUpperCase() + countryMatch[2].slice(1) });
          }
        }
      }
      
      // PRIORITY 2: Extract from strategicConsultation proof text
      const proofText = strategicConsultation?.proofPoints || consultationData?.proofPoints || '';
      if (typeof proofText === 'string' && proofText.length > 0 && credentials.length < 3) {
        // Years
        const yearsMatch = proofText.match(/(\d+)\+?\s*years?/i);
        if (yearsMatch && !credentials.some(c => c.label.includes('Years'))) {
          credentials.push({ icon: 'award', value: `${yearsMatch[1]}+`, label: 'Years Experience' });
        }
        
        // Clients
        const clientsMatch = proofText.match(/(\d+[\d,]*)\+?\s*(clients?|companies|organizations|businesses)/i);
        if (clientsMatch && !credentials.some(c => c.label.includes('Clients'))) {
          credentials.push({ icon: 'users', value: `${clientsMatch[1].replace(',', '')}+`, label: 'Clients Served' });
        }
      }
      
      console.log('📊 [extractCredentials] Found:', credentials.length, 'credentials');
      return credentials.slice(0, 4);
    };

    // Extract challenges from pain points, objections, and problem statements
    const extractChallenges = (): Array<{title: string, description: string, impact: string}> => {
      const challenges: Array<{title: string, description: string, impact: string}> = [];
      
      // PRIORITY 1: Use problem statement as primary challenge
      if (content.problemStatement) {
        challenges.push({
          title: 'Strategic Uncertainty',
          description: content.problemStatement,
          impact: 'Delays critical decisions',
        });
      }
      
      // PRIORITY 2: Invert features into implied challenges
      // If feature is "ROI-Focused Strategy" → challenge is "Unclear ROI"
      if (content.features && content.features.length > 0 && challenges.length < 3) {
        const featureToChallengeMap = [
          { keyword: 'roi', title: 'Unclear ROI', impact: 'Stalls executive buy-in' },
          { keyword: 'implementation', title: 'Execution Gaps', impact: 'Slows growth trajectory' },
          { keyword: 'market', title: 'Market Uncertainty', impact: 'Creates competitive risk' },
          { keyword: 'c-suite', title: 'Alignment Issues', impact: 'Fragments leadership focus' },
          { keyword: 'performance', title: 'Accountability Gaps', impact: 'Undermines results tracking' },
          { keyword: 'partnership', title: 'Collaboration Gaps', impact: 'Limits strategic outcomes' },
          { keyword: 'expansion', title: 'Growth Barriers', impact: 'Constrains market reach' },
          { keyword: 'strategy', title: 'Strategic Drift', impact: 'Misaligns organizational focus' },
        ];
        
        content.features.slice(0, 5).forEach((feature: any) => {
          if (challenges.length >= 3) return;
          
          const featureText = (feature.title + ' ' + feature.description).toLowerCase();
          const matchedChallenge = featureToChallengeMap.find(m => featureText.includes(m.keyword));
          
          if (matchedChallenge && !challenges.some(c => c.title === matchedChallenge.title)) {
            challenges.push({
              title: matchedChallenge.title,
              description: `Without ${feature.title.toLowerCase()}, organizations struggle to achieve sustainable growth.`,
              impact: matchedChallenge.impact,
            });
          }
        });
      }
      
      // PRIORITY 3: Use SDI pain spikes if still need more
      if (sdi?.audienceAnalysis?.painSpikes && challenges.length < 3) {
        sdi.audienceAnalysis.painSpikes.slice(0, 3 - challenges.length).forEach((pain: string, idx: number) => {
          const titles = ['Execution Gaps', 'Market Pressure', 'Resource Constraints'];
          const impacts = ['Slows growth trajectory', 'Creates competitive risk', 'Limits capability'];
          if (!challenges.some(c => c.title === titles[idx])) {
            challenges.push({
              title: titles[idx] || 'Business Challenge',
              description: pain,
              impact: impacts[idx] || 'Impacts bottom line',
            });
          }
        });
      }
      
      // PRIORITY 4: Use pain points / objections as fallback
      const painPoints = strategicConsultation?.painPoints || consultationData?.painPoints;
      if (painPoints && typeof painPoints === 'string' && challenges.length < 3) {
        challenges.push({
          title: 'Core Challenge',
          description: painPoints.slice(0, 200),
          impact: 'Requires expert guidance',
        });
      }
      
      console.log('📊 [extractChallenges] Found:', challenges.length, 'challenges from sources:', {
        problemStatement: !!content.problemStatement,
        features: content.features?.length || 0,
        painSpikes: sdi?.audienceAnalysis?.painSpikes?.length || 0,
        painPoints: !!painPoints
      });
      return challenges.slice(0, 3);
    };

    // Extract approach principles from value prop, methodology, features
    const extractApproachPrinciples = (): Array<{title: string, description: string, icon: string}> => {
      const principles: Array<{title: string, description: string, icon: string}> = [];
      
      // PRIORITY 1: Use methodology steps if available
      const methodologySteps = strategicConsultation?.methodologySteps || consultationData?.methodologySteps;
      if (methodologySteps && Array.isArray(methodologySteps) && methodologySteps.length > 0) {
        methodologySteps.slice(0, 3).forEach((step: any, idx: number) => {
          const icons = ['lightbulb', 'target', 'rocket'];
          principles.push({
            title: step.title || step.name || `Step ${idx + 1}`,
            description: step.description || step.content || '',
            icon: icons[idx] || 'check',
          });
        });
      }
      
      // PRIORITY 2: Extract from features
      if (principles.length < 3 && content.features && content.features.length > 0) {
        content.features.slice(0, 3 - principles.length).forEach((f: any, idx: number) => {
          const icons = ['lightbulb', 'target', 'rocket'];
          principles.push({
            title: f.title || 'Our Approach',
            description: f.description || '',
            icon: icons[principles.length + idx] || 'check',
          });
        });
      }
      
      // PRIORITY 3: Use value proposition
      if (principles.length < 1) {
        const valueProp = strategicConsultation?.uniqueValue || content.solutionStatement || consultationData?.uniqueValue;
        if (valueProp) {
          principles.push({
            title: 'Value-Driven Results',
            description: valueProp.slice(0, 200),
            icon: 'target',
          });
        }
      }
      
      console.log('📊 [extractApproachPrinciples] Found:', principles.length, 'principles');
      return principles.slice(0, 3);
    };

    // Extract expertise areas from features
    const extractExpertiseAreas = (): Array<{title: string, description: string, icon: string, examples: string[]}> => {
      const areas: Array<{title: string, description: string, icon: string, examples: string[]}> = [];
      const icons = ['briefcase', 'chart', 'users', 'layers'];
      
      // Use features as expertise areas
      if (content.features && content.features.length > 0) {
        content.features.slice(0, 4).forEach((f: any, idx: number) => {
          areas.push({
            title: f.title || 'Expertise Area',
            description: f.description || '',
            icon: icons[idx] || 'briefcase',
            examples: f.examples || f.bulletPoints || [],
          });
        });
      }
      
      console.log('📊 [extractExpertiseAreas] Found:', areas.length, 'areas');
      return areas;
    };

    // Extract client results from proof points and testimonials
    const extractClientResults = (): Array<{metric: string, description: string, client?: string, industry?: string}> => {
      const results: Array<{metric: string, description: string, client?: string, industry?: string}> = [];
      const seenMetrics = new Set<string>(); // Track metrics we've already added
      
      // Helper to add result only if metric is unique
      const addUniqueResult = (result: {metric: string, description: string, client?: string, industry?: string}) => {
        const normalizedMetric = result.metric.toLowerCase().trim();
        if (!seenMetrics.has(normalizedMetric) && results.length < 3) {
          seenMetrics.add(normalizedMetric);
          results.push(result);
          return true;
        }
        return false;
      };
      
      // PRIORITY 1: Use SDI proof point stats
      if (sdi?.proofPoints) {
        const proof = sdi.proofPoints;
        
        // Percentage stats
        if (proof.percentageStats && proof.percentageStats.length > 0) {
          proof.percentageStats.forEach((stat: string) => {
            const match = stat.match(/(\d+%)/);
            if (match) {
              let description = stat.replace(match[1], '').trim();
              description = description.replace(/^of\s+/i, '').replace(/^our\s+/i, '').trim();
              if (description.length > 5) {
                addUniqueResult({
                  metric: match[1],
                  description: description.charAt(0).toUpperCase() + description.slice(1),
                  industry: industryVariant,
                });
              }
            }
          });
        }
        
        // Dollar stats
        if (proof.dollarStats && proof.dollarStats.length > 0) {
          proof.dollarStats.forEach((stat: string) => {
            const match = stat.match(/(\$[\d,.]+[kmb]?)/i);
            if (match) {
              let description = stat.replace(match[1], '').trim();
              description = description.replace(/^in\s+/i, '').trim();
              if (description.length > 3) {
                addUniqueResult({
                  metric: match[1],
                  description: description.charAt(0).toUpperCase() + description.slice(1),
                  industry: industryVariant,
                });
              }
            }
          });
        }
        
        // Multiplier stats (3x, 10x, etc.)
        if (proof.rawProofText) {
          const multiplierMatches = proof.rawProofText.match(/(\d+x)\s+([^,.]+)/gi);
          if (multiplierMatches) {
            multiplierMatches.forEach((match: string) => {
              const parts = match.match(/(\d+x)\s+(.+)/i);
              if (parts) {
                addUniqueResult({
                  metric: parts[1],
                  description: parts[2].charAt(0).toUpperCase() + parts[2].slice(1),
                  industry: industryVariant,
                });
              }
            });
          }
        }
      }
      
      // PRIORITY 2: Use case study highlight if still need more
      if (results.length < 3) {
        const caseStudy = strategicConsultation?.caseStudyHighlight || consultationData?.caseStudyHighlight;
        if (caseStudy && typeof caseStudy === 'string') {
          const metricMatch = caseStudy.match(/(\d+%|\$[\d,.]+[kmb]?|\d+x)/i);
          addUniqueResult({
            metric: metricMatch ? metricMatch[1] : 'Success',
            description: caseStudy.slice(0, 150),
            client: 'Client Case Study',
          });
        }
      }
      
      console.log('📊 [extractClientResults] Found:', results.length, 'unique results');
      return results;
    };

    // Extract engagement model steps from process steps
    const extractEngagementSteps = (): Array<{number: number, title: string, description: string, duration?: string}> => {
      const steps: Array<{number: number, title: string, description: string, duration?: string}> = [];
      
      // PRIORITY 1: Use process steps from content
      const processSteps = content.processSteps || strategicConsultation?.processSteps || consultationData?.processSteps;
      if (processSteps && Array.isArray(processSteps) && processSteps.length > 0) {
        processSteps.slice(0, 4).forEach((step: any, idx: number) => {
          steps.push({
            number: idx + 1,
            title: step.title || step.name || `Step ${idx + 1}`,
            description: step.description || step.content || '',
            duration: step.duration || step.timeline,
          });
        });
      }
      
      // PRIORITY 2: Use methodology steps
      const methodologySteps = strategicConsultation?.methodologySteps || consultationData?.methodologySteps;
      if (steps.length < 3 && methodologySteps && Array.isArray(methodologySteps)) {
        methodologySteps.slice(0, 4 - steps.length).forEach((step: any, idx: number) => {
          steps.push({
            number: steps.length + 1,
            title: step.title || step.name || `Phase ${steps.length + 1}`,
            description: step.description || '',
            duration: step.duration,
          });
        });
      }
      
      console.log('📊 [extractEngagementSteps] Found:', steps.length, 'steps');
      return steps;
    };

    // Build statistics from SDI proof points FIRST, then fallback to legacy logic
    const buildStatistics = (): Array<{ value: string; label: string }> => {
      const stats: Array<{ value: string; label: string }> = [];
      
      // PRIORITY 1: Use SDI extracted proof points
      if (sdi?.proofPoints) {
        const proof = sdi.proofPoints;
        
        // Extract percentage stats (e.g., "94% of clients pass")
        if (proof.percentageStats && proof.percentageStats.length > 0) {
          proof.percentageStats.slice(0, 4).forEach((stat: string) => {
            const match = stat.match(/(\d+%)/);
            if (match) {
              let label = stat.replace(match[1], '').trim();
              label = label
                .replace(/^of\s+(our\s+)?/i, '')
                .replace(/^we\s+/i, '')
                .replace(/\s+$/g, '')
                .slice(0, 40);
              if (label.length < 3) label = 'Success Rate';
              label = label.charAt(0).toUpperCase() + label.slice(1);
              stats.push({ value: match[1], label });
            }
          });
        }
        
        // Extract dollar stats (e.g., "$1.5M fines")
        if (proof.dollarStats && proof.dollarStats.length > 0 && stats.length < 4) {
          proof.dollarStats.slice(0, 4 - stats.length).forEach((stat: string) => {
            const match = stat.match(/(\$[\d,.]+[kmb]?)/i);
            if (match) {
              let label = stat.replace(match[1], '').trim();
              label = label.replace(/^in\s+/i, '').slice(0, 40);
              if (label.length < 3) label = 'Value Delivered';
              label = label.charAt(0).toUpperCase() + label.slice(1);
              stats.push({ value: match[1], label });
            }
          });
        }
        
        // Add client count if available
        if (proof.clientCount && stats.length < 4) {
          const match = proof.clientCount.match(/(\d+\+?)/);
          if (match) {
            stats.push({ value: match[1] + '+', label: 'Clients Served' });
          }
        }
        
        // Add years in business if available
        if (proof.yearsInBusiness && stats.length < 4) {
          const match = proof.yearsInBusiness.match(/(\d+\+?)/);
          if (match) {
            stats.push({ value: match[1] + '+', label: 'Years Experience' });
          }
        }
        
        if (stats.length >= 2) {
          console.log('🎨 [SDI] Using extracted proof points for stats:', stats);
          return stats.slice(0, 4);
        }
      }
      
      // PRIORITY 2: Legacy extraction from content/consultationData
      const proofPoints = content.proofPoints || {};
      const clientCount = proofPoints.clientCount || content.clientCount || consultationData?.clientCount;
      const yearsInBusiness = proofPoints.yearsInBusiness || content.yearsInBusiness || consultationData?.yearsInBusiness;
      const otherStats = proofPoints.otherStats || content.otherStats || consultationData?.otherStats || [];
      
      console.log('🔍 [buildStatistics] Legacy sources:', { 
        fromContent: { clientCount: content.clientCount, yearsInBusiness: content.yearsInBusiness },
        fromConsultation: { clientCount: consultationData?.clientCount, yearsInBusiness: consultationData?.yearsInBusiness },
        resolved: { clientCount, yearsInBusiness }
      });
      
      if (clientCount) {
        const countMatch = String(clientCount).match(/(\d+[\d,]*)/);
        if (countMatch) {
          const hasPlus = String(clientCount).includes('+');
          stats.push({ value: countMatch[1] + (hasPlus ? '+' : ''), label: "Clients Served" });
        }
      }
      if (yearsInBusiness) {
        const yearsMatch = String(yearsInBusiness).match(/(\d+)/);
        if (yearsMatch) {
          const hasPlus = String(yearsInBusiness).includes('+');
          stats.push({ value: yearsMatch[1] + (hasPlus ? '+' : ''), label: "Years Experience" });
        }
      }
      if (Array.isArray(otherStats)) {
        otherStats.forEach((stat: string) => {
          const match = String(stat).match(/^([\d,.$%]+(?:[KMB+])?)\s+(.*)$/i);
          if (match) {
            stats.push({ value: match[1], label: match[2] });
          }
        });
      }
      
      // PRIORITY 3: If proof density is sparse and no stats found, DON'T fabricate
      if (sdi?.proofDensity === 'sparse' && stats.length < 2) {
        console.log('🎨 [SDI] Proof density sparse - not fabricating stats');
        return [];
      }
      
      // NO FABRICATION: If no real proof data exists, return empty array
      // Stats bar will be hidden rather than showing fake data
      if (stats.length === 0) {
        console.log('🚫 [buildStatistics] No real proof data found - stats bar will be hidden (zero-fabrication policy)');
        return [];
      }
      
      console.log('🔍 [buildStatistics] Built stats:', stats.length);
      return stats.slice(0, 4);
    };

    // Iterate through pageStructure and build sections in order
    for (const sectionType of pageStructure) {
      console.log('🔍 [mapLegacyStrategyContent] Processing section:', sectionType);
      
      switch (sectionType) {
        case 'hero':
          sections.push({
            type: isBetaPage ? "beta-hero-teaser" : "hero",
            order: order++,
            visible: true,
            content: isBetaPage ? {
              headline: content.headline,
              subheadline: content.subheadline,
              ctaText: content.ctaText || "Get Early Access",
              ctaLink: "#signup",
              backgroundImage: heroImageUrl,
              productName: strategicConsultation?.productName || businessName,
              launchDate: strategicConsultation?.launchDate || null,
              logoUrl,
              primaryColor: sdi?.palette?.primary || primaryColor,
              industryVariant,
              mode: sdiMode,
              designIntelligence: sdi,
              palette: sdi?.palette,
              sectionThemes: sdi?.sectionThemes,
              sdiTypography: sdi?.sdiTypography,
            } : {
              headline: content.headline,
              subheadline: content.subheadline,
              ctaText: content.ctaText || "Get Started",
              ctaLink: "#contact",
              backgroundImage: heroImageUrl,
              logoUrl,
              primaryColor: sdi?.palette?.primary || primaryColor,
              industryVariant,
              mode: sdiMode,
              designIntelligence: sdi,
              palette: sdi?.palette,
              sectionThemes: sdi?.sectionThemes,
              sdiTypography: sdi?.sdiTypography,
            },
          });
          break;

        case 'stats-bar':
        case 'stats_bar':
          const statistics = buildStatistics();
          console.log('🔍 [mapLegacyStrategyContent] stats-bar: found', statistics.length, 'stats');
          // Render if we have at least 1 stat (lowered threshold)
          if (statistics.length >= 1) {
            sections.push({
              type: "stats-bar",
              order: order++,
              visible: true,
              content: { 
                statistics, 
                industryVariant, 
                mode: sdiMode,
                primaryColor: sdi?.palette?.primary || primaryColor,
                designIntelligence: sdi,
                palette: sdi?.palette,
                sectionThemes: sdi?.sectionThemes,
                sdiTypography: sdi?.sdiTypography,
              },
            });
          } else {
            console.log('⚠️ [mapLegacyStrategyContent] stats-bar skipped: no stats found');
          }
          break;

        case 'problem-solution': {
          const problem = content.problemStatement || extractedIntel?.painPoints || '';
          const solution = content.solutionStatement || extractedIntel?.valueProp || '';
          
          if (problem && solution) {
            sections.push({
              type: "problem-solution",
              order: order++,
              visible: true,
              content: {
                problemTitle: 'The Challenge',
                problem,
                solutionTitle: `The ${companyName || ''} Solution`.trim(),
                solution,
                industryVariant,
                mode: sdiMode,
                primaryColor: sdi?.palette?.primary || primaryColor,
                designIntelligence: sdi,
                palette: sdi?.palette,
                sectionThemes: sdi?.sectionThemes,
                sdiTypography: sdi?.sdiTypography,
              },
            });
          } else {
            console.log('⚠️ [mapLegacyStrategyContent] problem-solution skipped: missing problem or solution data');
          }
          break;
        }

        case 'features':
          if (isBetaPage) {
            // Beta pages use beta-perks instead of features
            sections.push({
              type: "beta-perks",
              order: order++,
              visible: true,
              content: {
                headline: "Early Adopter Perks",
                subheadline: "Exclusive benefits for founding members",
                perks: strategicConsultation?.betaPerks || consultationData.betaPerks || ['lifetime-discount', 'founding-member', 'priority-support'],
                scarcityMessage: `Only ${strategicConsultation?.maxSignups || consultationData.maxSignups || 100} spots available`,
                industryVariant,
                mode: sdiMode,
                primaryColor: sdi?.palette?.primary || primaryColor,
                designIntelligence: sdi,
                palette: sdi?.palette,
                sectionThemes: sdi?.sectionThemes,
                sdiTypography: sdi?.sdiTypography,
              },
            });
          } else if (content.features && content.features.length > 0) {
            // Infer icons from feature titles when default/checkmark icons are used
            const inferFeatureIcon = (title: string): string => {
              const lower = title.toLowerCase();
              if (lower.includes('goal') || lower.includes('align') || lower.includes('objective')) return 'Target';
              if (lower.includes('real-time') || lower.includes('dashboard') || lower.includes('monitor') || lower.includes('visib')) return 'BarChart3';
              if (lower.includes('automat') || lower.includes('workflow') || lower.includes('orchestrat')) return 'Zap';
              if (lower.includes('data') || lower.includes('intelligen') || lower.includes('analytic')) return 'Lightbulb';
              if (lower.includes('integrat') || lower.includes('connect') || lower.includes('enterprise')) return 'Globe';
              if (lower.includes('security') || lower.includes('compliance') || lower.includes('protect')) return 'Shield';
              if (lower.includes('team') || lower.includes('collaborat') || lower.includes('cross-functional')) return 'Users';
              if (lower.includes('scale') || lower.includes('grow') || lower.includes('expand')) return 'TrendingUp';
              if (lower.includes('report') || lower.includes('insight')) return 'FileText';
              if (lower.includes('time') || lower.includes('speed') || lower.includes('fast')) return 'Clock';
              if (lower.includes('custom') || lower.includes('configur') || lower.includes('flexib')) return 'Settings';
              if (lower.includes('support') || lower.includes('help')) return 'Headset';
              // Fallback rotation to avoid all-same icons
              const fallbacks = ['Sparkles', 'Layers', 'Rocket', 'Star', 'Briefcase'];
              const hash = lower.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
              return fallbacks[hash % fallbacks.length];
            };
            
            const featureSubtitle = companyName 
              ? `What sets ${companyName} apart`
              : 'What makes the difference';
            
            // Derive a specific heading from value prop or audience
            const audience = consultationData?.targetAudience || consultationData?.target_audience || '';
            const featureTitle = audience 
              ? `The infrastructure ${audience.split(',')[0].trim().toLowerCase()} depends on`
              : 'Why Choose Us';
            
            sections.push({
              type: "features",
              order: order++,
              visible: true,
              content: {
                title: featureTitle,
                subtitle: featureSubtitle,
                features: content.features.map((f: any, i: number) => ({
                  title: f.title,
                  description: f.description,
                  icon: (f.icon && f.icon !== '✓' && f.icon !== '✔' && f.icon !== 'CheckCircle')
                    ? f.icon
                    : inferFeatureIcon(f.title || `feature-${i}`),
                })),
                industryVariant,
                mode: sdiMode,
                primaryColor: sdi?.palette?.primary || primaryColor,
                designIntelligence: sdi,
                palette: sdi?.palette,
                sectionThemes: sdi?.sectionThemes,
                sdiTypography: sdi?.sdiTypography,
              },
            });
          }
          break;

        case 'how-it-works':
        case 'process': {
          let processSteps = content.processSteps || content.steps || [];
          console.log('🔍 [mapLegacyStrategyContent] how-it-works: found', processSteps.length, 'steps');
          
          // Generate process steps from consultation intelligence when none exist
          if (processSteps.length === 0 && extractedIntel) {
            const compName = extractedIntel.companyName || companyName || 'our platform';
            processSteps = [
              {
                step: 1,
                title: 'Strategic Assessment',
                description: `We start by understanding your specific challenges and objectives to ensure ${compName} is configured for your exact needs.`,
              },
              {
                step: 2,
                title: 'Custom Configuration',
                description: `Your dedicated team configures the platform to align with your existing workflows, integrations, and reporting requirements.`,
              },
              {
                step: 3,
                title: 'Launch & Optimize',
                description: `Go live with full support, then continuously refine based on real performance data and team feedback.`,
              },
            ];
            console.log(`🔧 [how-it-works] Generated ${processSteps.length} process steps from intelligence`);
          }
          
          if (processSteps.length > 0) {
            sections.push({
              type: "how-it-works",
              order: order++,
              visible: true,
              content: {
                title: `How ${companyName || 'It'} Works`,
                subtitle: 'Your path to results',
                steps: processSteps.map((step: any, i: number) => ({
                  step: step.step || i + 1,
                  title: step.title,
                  description: step.description,
                })),
                industryVariant,
                mode: sdiMode,
                primaryColor: sdi?.palette?.primary || primaryColor,
                designIntelligence: sdi,
                palette: sdi?.palette,
                sectionThemes: sdi?.sectionThemes,
                sdiTypography: sdi?.sdiTypography,
              },
            });
          } else {
            console.log('⚠️ [mapLegacyStrategyContent] how-it-works skipped: no steps found and no intelligence available');
          }
          break;
        }

        case 'social-proof':
        case 'testimonials':
          const testimonials = content.testimonials || [];
          console.log('🔍 [mapLegacyStrategyContent] social-proof: found', testimonials.length, 'testimonials');
          const firstTestimonial = testimonials[0];
          const hasRealTestimonial = firstTestimonial && 
            !firstTestimonial.author?.includes('[') &&
            !firstTestimonial.quote?.includes('[');

          // Always add social-proof section, even without testimonials (can show stats)
          sections.push({
            type: "social-proof",
            order: order++,
            visible: true,
            content: {
              stats: [],
              industry: businessName,
              testimonial: hasRealTestimonial ? {
                quote: firstTestimonial.quote,
                name: firstTestimonial.author,
                title: firstTestimonial.title,
                company: "",
                rating: 5,
              } : undefined,
              industryVariant,
              mode: sdiMode,
              primaryColor: sdi?.palette?.primary || primaryColor,
              designIntelligence: sdi,
              palette: sdi?.palette,
              sectionThemes: sdi?.sectionThemes,
              sdiTypography: sdi?.sdiTypography,
            },
          });
          break;
          
        case 'founder':
          // Add founder section for beta pages
          const founder = strategicConsultation?.founder || consultationData.founder;
          sections.push({
            type: "founder",
            order: order++,
            visible: true,
              content: {
                name: strategicConsultation?.founderName || founder?.name || 'Founder',
                title: strategicConsultation?.founderTitle || founder?.title || 'Founder & CEO',
                story: strategicConsultation?.founderStory || founder?.story || '',
                credentials: strategicConsultation?.founderCredentials || founder?.credentials || [],
                photo: strategicConsultation?.founderPhoto || founder?.photo || null,
                industryVariant,
                mode: sdiMode,
                primaryColor: sdi?.palette?.primary || primaryColor,
                designIntelligence: sdi,
                palette: sdi?.palette,
                sectionThemes: sdi?.sectionThemes,
                sdiTypography: sdi?.sdiTypography,
              },
            });
            break;
          
        case 'waitlist-proof':
          // Add waitlist proof section for beta pages
          sections.push({
            type: "waitlist-proof",
            order: order++,
            visible: true,
              content: {
                totalSignups: 0,
                todaySignups: 0,
                spotsRemaining: strategicConsultation?.maxSignups || consultationData.maxSignups || 100,
                industryVariant,
                mode: sdiMode,
                primaryColor: sdi?.palette?.primary || primaryColor,
                designIntelligence: sdi,
                palette: sdi?.palette,
                sectionThemes: sdi?.sectionThemes,
                sdiTypography: sdi?.sdiTypography,
              },
            });
            break;

        case 'faq': {
          // ============ OBJECTION-TO-FAQ PIPELINE ============
          // Priority: content.faqItems > content.objections > extracted_intelligence > consultationData.objections > painPoints
          let faqData: Array<{ question: string; answer: string }> = content.faqItems || [];
          
          // Helper: add FAQ only if not a duplicate
          const addFAQ = (question: string, answer: string) => {
            const normalized = question.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().slice(0, 40);
            const isDuplicate = faqData.some(existing => {
              const existingNorm = existing.question.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().slice(0, 40);
              return existingNorm === normalized;
            });
            if (!isDuplicate) {
              faqData.push({ question, answer });
            } else {
              console.log(`🔍 [faq] Skipping duplicate question: "${question.slice(0, 50)}..."`);
            }
          };

          // Helper: build polished answer from objection data
          const buildObjectionAnswer = (objection: string, summary: string): string => {
            if (summary && summary.length > 20) {
              let cleaned = summary
                .replace(/^(a |the )?(significant |common |frequent )?(buyer |customer )?objection (is|involves|relates to)[^,.]*/i, '')
                .replace(/^[,.\s]+/, '')
                .trim();
              if (cleaned.length > 0) cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
              if (cleaned.length >= 20) return cleaned;
            }
            return `${companyName || 'Our platform'} is designed to complement and unify your existing tools, not replace them. We integrate with the systems you already use while providing a strategic layer that connects everything.`;
          };

          // Helper: build polished answer from proof data
          const buildProofAnswer = (proofEl: string, proofSum: string): string => {
            const combined = `${proofEl} ${proofSum}`.toLowerCase();
            const facts: string[] = [];
            const timelineMatch = combined.match(/(\d+[-–]\d+\s*weeks?|\d+\s*weeks?|\d+[-–]\d+\s*days?|\d+\s*days?)/i);
            if (timelineMatch) facts.push(`Our typical onboarding takes ${timelineMatch[1]}`);
            if (combined.includes('user count') || combined.includes('per user') || combined.includes('per seat')) {
              facts.push('pricing is tailored based on your team size and the modules you need');
            }
            if (facts.length > 0) {
              return `${facts[0]}, with a dedicated team guiding you through setup, configuration, and training. ${facts.length > 1 ? `Our ${facts.slice(1).join(', ')}, so you get exactly what your organization needs.` : 'We ensure your team is fully operational and confident before handoff.'}`;
            }
            return `${companyName || 'Our'} team provides hands-on onboarding support to ensure a smooth transition. We handle setup, configuration, and training so your team can start seeing results quickly.`;
          };
          
          // Source 1: Content objections array
          if (faqData.length === 0 && content.objections && Array.isArray(content.objections)) {
            for (const o of content.objections) {
              if (o.question && o.answer) addFAQ(o.question, o.answer);
            }
          }
          
          // Source 2: extracted_intelligence buyerObjections
          const faqIntel = extractedIntel;
          console.log('🔍 [faq] intel available:', !!faqIntel, 'buyerObjections:', faqIntel?.buyerObjections);
          if (faqData.length < 2 && faqIntel) {
            // Use buyerObjectionsFull preferentially (richer), DON'T process both
            const buyerObjections = faqIntel.buyerObjectionsFull || faqIntel.buyerObjections || '';
            const objSummary = typeof faqIntel.objectionsSummary === 'string' ? faqIntel.objectionsSummary : '';
            
            if (typeof buyerObjections === 'string' && buyerObjections.length > 10) {
              // Only split on semicolons and pipes — NOT "and" (too aggressive)
              const parts = buyerObjections.split(/[;|]/)
                .map((s: string) => s.trim())
                .filter((s: string) => s.length > 10);
              
              for (const objPart of parts) {
                if (faqData.length >= 6) break;
                const reframed = reframeObjectionAsQuestion(objPart);
                addFAQ(reframed, buildObjectionAnswer(objPart, objSummary));
              }
            } else if (Array.isArray(buyerObjections)) {
              for (const obj of buyerObjections) {
                if (faqData.length >= 6) break;
                const objText = typeof obj === 'string' ? obj : obj?.objection || obj?.text || obj?.question || '';
                const answerText = typeof obj === 'string' ? '' : obj?.answer || obj?.counterStrategy || obj?.response || '';
                if (objText.length > 10) {
                  const reframed = reframeObjectionAsQuestion(objText);
                  addFAQ(reframed, answerText || buildObjectionAnswer(objText, objSummary));
                }
              }
            }
            
            console.log('🔍 [faq] After objections:', faqData.length, 'items');
            
            // Source 2b: Pain points as FAQ entries
            if (faqData.length < 3) {
              const painText = typeof faqIntel.painPoints === 'string' ? faqIntel.painPoints : 
                               typeof faqIntel.painPointsFull === 'string' ? faqIntel.painPointsFull : '';
              const painSummary = typeof faqIntel.painSummary === 'string' ? faqIntel.painSummary : '';
              
              if (painText.length > 5) {
                const reframed = reframePainPointAsQuestion(painText);
                const answer = painSummary || `Our platform directly addresses ${painText} by providing a unified solution.`;
                addFAQ(reframed, answer);
              }
            }
            
            // Source 2c: Onboarding/implementation FAQ from proof elements
            if (faqData.length < 5) {
              const proofText = typeof faqIntel.proofElements === 'string' ? faqIntel.proofElements : 
                                typeof faqIntel.proofElementsFull === 'string' ? faqIntel.proofElementsFull : '';
              const proofSum = typeof faqIntel.proofSummary === 'string' ? faqIntel.proofSummary : '';
              const combinedProof = (proofText + ' ' + proofSum).toLowerCase();
              
              if (combinedProof.match(/onboard|week|day|implementation|setup/)) {
                addFAQ('What does the onboarding process look like?', buildProofAnswer(proofText, proofSum));
              }
            }
            
            console.log('🔍 [faq] After extracted_intelligence:', faqData.length, 'items');
          }
          
          // Source 3: consultationData.objections string
          if (faqData.length < 2 && consultationData?.objections) {
            console.log('🔍 [faq] parsing objections from consultationData:', consultationData.objections);
            const parsed = parseObjectionsString(consultationData.objections);
            for (const p of parsed) addFAQ(p.question, p.answer);
          }
          
          // Source 3b: Precomputed objections (same source as Objections tab in sidebar)
          if (faqData.length < 2) {
            const industryRaw = consultationData?.industry || strategicConsultation?.industry || extractedIntel?.industry || '';
            if (industryRaw) {
              try {
                const { resolveIndustry: resolveInd } = await import('@/lib/resolveIndustry');
                const { getPrecomputedObjections: getPrecomp } = await import('@/data/precomputedObjections');
                const resolution = resolveInd(industryRaw);
                const targetMarket = consultationData?.target_audience || extractedIntel?.targetMarket || null;
                const precomputed = getPrecomp(resolution.industry, targetMarket);
                if (precomputed.length > 0) {
                  console.log('🔍 [faq] Using', precomputed.length, 'precomputed objections as FAQ source');
                  for (const obj of precomputed) {
                    if (faqData.length >= 6) break;
                    addFAQ(
                      reframeObjectionAsQuestion(obj.objection),
                      obj.counterStrategy
                    );
                  }
                }
              } catch (e) {
                console.warn('🔍 [faq] Failed to load precomputed objections:', e);
              }
            }
          }
          
          // Source 4: Pain points reframed as FAQs
          if (faqData.length < 2) {
            const painPoints = faqIntel?.painPoints || faqIntel?.audiencePainPoints || 
                               consultationData?.audience_pain_points || [];
            if (Array.isArray(painPoints)) {
              for (const pain of painPoints) {
                if (faqData.length >= 6) break;
                const painText = typeof pain === 'string' ? pain : pain?.text || '';
                if (painText.length > 10) {
                  const reframed = reframePainPointAsQuestion(painText);
                  addFAQ(reframed, 'Our solution is specifically designed to address this challenge.');
                }
              }
              console.log('🔍 [faq] After pain points:', faqData.length, 'items');
            }
          }
          
          // ZERO-FABRICATION: Require at least 2 real FAQ items
          if (faqData.length < 2) {
            console.log('🚫 [mapLegacyStrategyContent] faq: Only', faqData.length, 'items — need 2+ (zero-fabrication policy)');
            break;
          }
          
          console.log('🔍 [mapLegacyStrategyContent] faq: rendering', faqData.length, 'items');
          sections.push({
            type: "faq",
            order: order++,
            visible: true,
            content: {
              title: "Frequently Asked Questions",
              items: faqData.map((faq: any) => ({
                question: faq.question,
                answer: faq.answer,
              })),
              industryVariant,
              mode: sdiMode,
              primaryColor: sdi?.palette?.primary || primaryColor,
              designIntelligence: sdi,
              palette: sdi?.palette,
              sectionThemes: sdi?.sectionThemes,
              sdiTypography: sdi?.sdiTypography,
            },
          });
          break;
        }

        case 'final-cta':
          // Consultation data takes PRIORITY over AI-generated content
          console.log('🎯 [final-cta] Building with sources:', {
            aiCtaText: content.ctaText,
            consultationPrimaryCTA: consultationData.primaryCTA || consultationData.primary_cta,
            consultationUrgency: consultationData.urgencyAngle || consultationData.urgency_angle,
            consultationGuarantee: consultationData.guaranteeOffer || consultationData.guarantee_offer,
            consultationSecondaryCTA: consultationData.secondaryCTA || consultationData.secondary_cta,
          });
          
          const ctaText = consultationData.primaryCTA || 
                          consultationData.primary_cta ||
                          strategicConsultation?.primaryCTA ||
                          content.ctaText || 
                          'Get Started';
          
          const secondaryCta = consultationData.secondaryCTA ||
                               consultationData.secondary_cta ||
                               strategicConsultation?.secondaryCTA ||
                               null;
          
          const urgencyText = consultationData.urgencyAngle ||
                              consultationData.urgency_angle ||
                              strategicConsultation?.urgencyAngle ||
                              null;
          
          const guaranteeText = consultationData.guaranteeOffer ||
                                consultationData.guarantee_offer ||
                                consultationData.guarantee ||
                                strategicConsultation?.guaranteeOffer ||
                                null;
          
          const ctaSubtext = content.solutionStatement?.split(".")[0] ||
                             consultationData.uniqueValue?.slice(0, 150) ||
                             consultationData.unique_value?.slice(0, 150) ||
                             null;
          
          sections.push({
            type: isBetaPage ? "beta-final-cta" : "final-cta",
            order: order++,
            visible: true,
            content: isBetaPage ? {
              headline: "Join the Waitlist",
              subheadline: "Be first to experience the future",
              ctaText: ctaText || "Get Early Access",
              ctaLink: "#signup",
              spotsRemaining: strategicConsultation?.maxSignups || consultationData.maxSignups || 100,
              primaryColor: sdi?.palette?.primary || primaryColor,
              industryVariant,
              mode: sdiMode,
              secondaryCta,
              urgencyText,
              guaranteeText,
              designIntelligence: sdi,
              palette: sdi?.palette,
              sectionThemes: sdi?.sectionThemes,
              sdiTypography: sdi?.sdiTypography,
            } : {
              headline: (() => {
                // Build a clean CTA headline — NEVER insert problemStatement directly
                // If we have a dedicated CTA headline from AI, use it
                if (content.ctaHeadline) return content.ctaHeadline;
                
                // Build from value prop — extract a transformation, don't concatenate raw text
                const valueProp = extractedIntel?.valueProp || extractedIntel?.valuePropSummary || '';
                if (valueProp) {
                  // Try to extract a verb+object pattern from the value prop
                  const verbMatch = valueProp.match(/(align|transform|automate|streamline|accelerate|optimize|connect|bridge|eliminate|reduce|improve|scale|grow|simplify|create|deliver|drive|enable|unlock|unify|empower|modernize|consolidate|integrate|centralize)\s+(.{10,60}?)[\.,;!]?$/i);
                  if (verbMatch) {
                    const verb = verbMatch[1].charAt(0).toLowerCase() + verbMatch[1].slice(1);
                    const object = verbMatch[2].trim().replace(/[.,;!?]+$/, '');
                    return `Ready to ${verb} ${object}?`;
                  }
                  // Try audience-based rewrite: "X for Y" → "Ready to bring X to your Y?"
                  const forMatch = valueProp.match(/^(.{5,40})\s+for\s+(.{5,40})$/i);
                  if (forMatch) {
                    return `Ready to bring ${forMatch[1].charAt(0).toLowerCase() + forMatch[1].slice(1)} to your ${forMatch[2]}?`;
                  }
                  // Fallback: use company name or generic
                  if (companyName) return `Ready to Get Started with ${toTitleCase(companyName)}?`;
                  return 'Ready to Transform Your Results?';
                }
                
                // Extract a transformation verb+object from solution (not problem)
                const solution = content.solutionStatement || extractedIntel?.solutionStatement || '';
                if (solution) {
                  const transformMatch = solution.match(/(align|transform|automate|streamline|accelerate|optimize|connect|bridge|eliminate|reduce|improve|scale|grow|simplify|create|deliver|drive|enable|unlock|unify)\s+(.{10,50}?)[\.,;]/i);
                  if (transformMatch) {
                    const verb = transformMatch[1].charAt(0).toUpperCase() + transformMatch[1].slice(1);
                    const object = transformMatch[2].trim();
                    return `Ready to ${verb} ${object}?`;
                  }
                }
                
                // Fallback — clean and simple
                if (companyName) return `Ready to Get Started with ${toTitleCase(companyName)}?`;
                return 'Ready to Transform Your Results?';
              })(),
              subtext: (() => {
                // Subheadline: solution context + audience framing (audience belongs HERE, not in headline)
                const solution = content.solutionStatement || '';
                const audience = extractedIntel?.audience || '';
                
                if (solution && audience) {
                  const firstSentence = solution.split(/[.!]/)[0].trim();
                  const shortSentence = firstSentence.length > 150 ? firstSentence.slice(0, 150) + '...' : firstSentence;
                  return `${shortSentence} — built for ${audience.split(',')[0].trim()} who demand results.`;
                }
                
                let sub = solution;
                if (sub.length > 200) sub = sub.split('.')[0] + '.';
                if (!sub && ctaSubtext) {
                  sub = ctaSubtext.charAt(0).toUpperCase() + ctaSubtext.slice(1);
                  if (!sub.endsWith('.')) sub += '.';
                }
                return sub || ctaSubtext;
              })(),
              ctaText,
              ctaLink: "#contact",
              primaryColor: sdi?.palette?.primary || primaryColor,
              industryVariant,
              mode: sdiMode,
              secondaryCta,
              urgencyText,
              guaranteeText,
              trustIndicators: [
                { icon: 'check', text: 'No credit card required' },
                { icon: 'check', text: 'Free consultation' },
                { icon: 'check', text: 'Cancel anytime' },
              ],
              brandColors: {
                primary: extractedIntel?.colors?.[0] || null,
                secondary: extractedIntel?.colors?.[1] || null,
              },
              designIntelligence: sdi,
              palette: sdi?.palette,
              sectionThemes: sdi?.sectionThemes,
              sdiTypography: sdi?.sdiTypography,
            },
          });
          break;

        // SDI-driven section types
        case 'stakes-amplify':
          sections.push({
            type: "stakes-amplify",
            order: order++,
            visible: true,
            content: {
              headline: 'The Real Cost of Inaction',
              stakes: content.problemStatement || 'Every day without a solution increases your risk.',
              consequences: sdi?.emotionalDrivers?.includes('urgency') 
                ? 'Time is running out to address this critical issue.'
                : undefined,
              industryVariant,
              mode: sdiMode,
              primaryColor: sdi?.palette?.primary || primaryColor,
              designIntelligence: sdi,
              palette: sdi?.palette,
              sectionThemes: sdi?.sectionThemes,
              sdiTypography: sdi?.sdiTypography,
            },
          });
          break;

        case 'risk-reversal':
          sections.push({
            type: "risk-reversal",
            order: order++,
            visible: true,
            content: {
              headline: 'Our Guarantee',
              guarantee: consultationData?.guaranteeOffer || consultationData?.guarantee_offer || 
                         strategicConsultation?.guaranteeOffer || 
                         'Your satisfaction is 100% guaranteed.',
              industryVariant,
              mode: sdiMode,
              primaryColor: sdi?.palette?.primary || primaryColor,
              designIntelligence: sdi,
              palette: sdi?.palette,
              sectionThemes: sdi?.sectionThemes,
              sdiTypography: sdi?.sdiTypography,
            },
          });
          break;

        case 'comparison':
          sections.push({
            type: "comparison",
            order: order++,
            visible: true,
            content: {
              headline: 'A Better Approach',
              oldWay: {
                title: 'The Old Way',
                points: [
                  'Time-consuming manual processes',
                  'Inconsistent results',
                  'Hidden costs and surprises',
                  'Limited support when you need it'
                ]
              },
              newWay: {
                title: 'Our Approach',
                points: content.features?.slice(0, 4).map((f: any) => f.title || f.description) || [
                  'Streamlined, efficient process',
                  'Predictable, reliable outcomes',
                  'Transparent pricing upfront',
                  'Dedicated support every step'
                ]
              },
              industryVariant,
              mode: sdiMode,
              primaryColor: sdi?.palette?.primary || primaryColor,
              designIntelligence: sdi,
              palette: sdi?.palette,
              sectionThemes: sdi?.sectionThemes,
              sdiTypography: sdi?.sdiTypography,
            },
          });
          break;

        // CONSULTING-SPECIFIC SECTION TYPES (from layout templates)
        case 'credentials-bar':
          console.log(`📐 [mapLegacyStrategyContent] Creating consulting section: credentials-bar`);
          const extractedCredentials = extractCredentials();
          console.log(`📊 [credentials-bar] Passing ${extractedCredentials.length} credentials to component`);
          sections.push({
            type: "credentials-bar",
            order: order++,
            visible: true,
            content: {
              industryVariant,
              mode: sdiMode,
              businessName,
              credentials: extractedCredentials,
              primaryColor: sdi?.palette?.primary || primaryColor,
              designIntelligence: sdi,
              palette: sdi?.palette,
              sectionThemes: sdi?.sectionThemes,
              sdiTypography: sdi?.sdiTypography,
            },
          });
          break;
          
        case 'the-real-challenge':
          console.log(`📐 [mapLegacyStrategyContent] Creating consulting section: the-real-challenge`);
          const extractedChallenges = extractChallenges();
          console.log(`📊 [the-real-challenge] Passing ${extractedChallenges.length} challenges to component`);
          sections.push({
            type: "the-real-challenge",
            order: order++,
            visible: true,
            content: {
              industryVariant,
              mode: sdiMode,
              businessName,
              headline: content.problemStatement ? "The Challenges You're Facing" : undefined,
              challenges: extractedChallenges,
              primaryColor: sdi?.palette?.primary || primaryColor,
              designIntelligence: sdi,
              palette: sdi?.palette,
              sectionThemes: sdi?.sectionThemes,
              sdiTypography: sdi?.sdiTypography,
            },
          });
          break;
          
        case 'our-approach':
          console.log(`📐 [mapLegacyStrategyContent] Creating consulting section: our-approach`);
          const extractedPrinciples = extractApproachPrinciples();
          console.log(`📊 [our-approach] Passing ${extractedPrinciples.length} principles to component`);
          sections.push({
            type: "our-approach",
            order: order++,
            visible: true,
            content: {
              industryVariant,
              mode: sdiMode,
              businessName,
              headline: "Our Approach",
              subtitle: strategicConsultation?.uniqueValue || content.solutionStatement || "A proven methodology that delivers results",
              principles: extractedPrinciples,
              primaryColor: sdi?.palette?.primary || primaryColor,
              designIntelligence: sdi,
              palette: sdi?.palette,
              sectionThemes: sdi?.sectionThemes,
              sdiTypography: sdi?.sdiTypography,
            },
          });
          break;
          
        case 'expertise-areas':
          console.log(`📐 [mapLegacyStrategyContent] Creating consulting section: expertise-areas`);
          const extractedAreas = extractExpertiseAreas();
          console.log(`📊 [expertise-areas] Passing ${extractedAreas.length} areas to component`);
          sections.push({
            type: "expertise-areas",
            order: order++,
            visible: true,
            content: {
              industryVariant,
              mode: sdiMode,
              businessName,
              headline: "Areas of Practice",
              subtitle: `Deep expertise across critical business domains`,
              areas: extractedAreas,
              primaryColor: sdi?.palette?.primary || primaryColor,
              designIntelligence: sdi,
              palette: sdi?.palette,
              sectionThemes: sdi?.sectionThemes,
              sdiTypography: sdi?.sdiTypography,
            },
          });
          break;
          
        case 'engagement-model':
          console.log(`📐 [mapLegacyStrategyContent] Creating consulting section: engagement-model`);
          const extractedSteps = extractEngagementSteps();
          console.log(`📊 [engagement-model] Passing ${extractedSteps.length} steps to component`);
          sections.push({
            type: "engagement-model",
            order: order++,
            visible: true,
            content: {
              industryVariant,
              mode: sdiMode,
              businessName,
              headline: "Our Engagement Model",
              subtitle: "A structured approach designed for your success",
              steps: extractedSteps,
              primaryColor: sdi?.palette?.primary || primaryColor,
              designIntelligence: sdi,
              palette: sdi?.palette,
              sectionThemes: sdi?.sectionThemes,
              sdiTypography: sdi?.sdiTypography,
            },
          });
          break;
          
        case 'client-results':
          console.log(`📐 [mapLegacyStrategyContent] Creating consulting section: client-results`);
          const extractedResults = extractClientResults();
          console.log(`📊 [client-results] Passing ${extractedResults.length} results to component`);
          sections.push({
            type: "client-results",
            order: order++,
            visible: true,
            content: {
              industryVariant,
              mode: sdiMode,
              businessName,
              headline: "Client Success Stories",
              subtitle: "Measurable results that speak for themselves",
              results: extractedResults,
              testimonials: content.testimonials || [],
              primaryColor: sdi?.palette?.primary || primaryColor,
              designIntelligence: sdi,
              palette: sdi?.palette,
              sectionThemes: sdi?.sectionThemes,
              sdiTypography: sdi?.sdiTypography,
            },
          });
          break;

        default:
          console.warn(`⚠️ Unknown section type in pageStructure: ${sectionType}`);
      }
    }

    // COLOR CASCADE: Ensure every section has mode, primaryColor, secondaryColor
    const resolvedPrimary = primaryColor || sdi?.palette?.primary || null;
    const resolvedSecondary = brandSettings?.secondaryColor || sdi?.palette?.primaryTint || null;
    for (const section of sections) {
      if (!section.content.mode) {
        section.content.mode = sdiMode;
      }
      if (!section.content.primaryColor && resolvedPrimary) {
        section.content.primaryColor = resolvedPrimary;
      }
      if (!section.content.secondaryColor && resolvedSecondary) {
        section.content.secondaryColor = resolvedSecondary;
      }
    }
    if (resolvedPrimary) {
      console.log(`🎨 [sectionMapper] Injected primaryColor "${resolvedPrimary}" into ${sections.length} sections`);
    }

    console.log(`✅ Legacy mapper built ${sections.length} sections from SDI-driven structure (isBeta: ${isBetaPage})`);
    return applyArtDirectorDirectives(sections);
  };

  // Map old generation format
  const mapOldGeneratedContent = async (generated: any, consultationData: any): Promise<Section[]> => {
    const heroImageUrl = await fetchHeroImage(generated.images?.hero || consultationData.industry);
    const galleryImages = await fetchGalleryImages(generated.images?.gallery || []);
    
    // CRITICAL: Get pageType for beta section mapping
    const pageType = consultationData.pageType || 
                     effectiveNavState?.strategicData?.consultationData?.pageType ||
                     null;
    const isBetaPage = pageType === 'beta-prelaunch';
    console.log('🔧 [mapOldGeneratedContent] pageType:', pageType, '| isBetaPage:', isBetaPage);
    
    // CRITICAL: Detect industry variant for styling (use NEW detection for better accuracy)
    const industryVariant = detectIndustryVariantNew(
      consultationData.industry, 
      consultationData.industryCategory,
      consultationData.industrySubcategory,
      pageType
    );
    console.log('🎨 [mapOldGeneratedContent] industryVariant:', industryVariant);
    
    // DEBUG: Log all new wizard fields
    console.log('🔧 [mapOldGeneratedContent] New fields check:', {
      identitySentence: consultationData.identitySentence,
      sharpDifferentiator: consultationData.sharpDifferentiator,
      audienceExclusion: consultationData.audienceExclusion,
      painSpike: consultationData.painSpike,
      secondaryCTA: consultationData.secondaryCTA,
      concreteProofStory: consultationData.concreteProofStory,
      methodologySteps: consultationData.methodologySteps,
    });

    // Helper function for secondary CTA text
    const getSecondaryCTAText = (type: string): string => {
      const texts: Record<string, string> = {
        'see-demo': 'See How It Works',
        'explore-features': 'Explore Features',
        'view-cases': 'View Case Studies',
        'get-guide': "Get the Buyer's Guide",
        'talk-customer': 'Talk to a Customer',
      };
      return texts[type] || '';
    };

    let mappedSections: Section[] = generated.sections.map((sectionType: string, index: number) => {
      switch (sectionType) {
        case "hero":
          return {
            type: isBetaPage ? "beta-hero-teaser" : "hero",
            order: index,
            visible: true,
            content: {
              headline: generated.headline,
              // USE identitySentence as subheadline if provided
              subheadline: consultationData.identitySentence || generated.subheadline,
              ctaText: isBetaPage ? "Get Early Access" : generated.ctaText,
              ctaLink: "#signup",
              backgroundImage: heroImageUrl,
              productName: consultationData.productName || consultationData.businessName || consultationData.industry,
              launchDate: consultationData.launchDate || null,
              // ADD secondary CTA
              secondaryCTA: consultationData.secondaryCTA && consultationData.secondaryCTA !== 'none' ? {
                type: consultationData.secondaryCTA,
                text: consultationData.secondaryCTA === 'custom' 
                  ? consultationData.secondaryCTACustom 
                  : getSecondaryCTAText(consultationData.secondaryCTA),
              } : null,
            },
          };
        case "features":
          return {
            type: isBetaPage ? "beta-perks" : "features",
            order: index,
            visible: true,
            content: isBetaPage ? {
              headline: "Early Adopter Perks",
              subheadline: "Exclusive benefits for founding members",
              perks: consultationData.betaPerks || ['lifetime-discount', 'founding-member', 'priority-support'],
              scarcityMessage: `Only ${consultationData.maxSignups || 100} spots available`,
            } : { features: generated.features },
          };
        case "problem-solution":
          return {
            type: "problem-solution",
            order: index,
            visible: true,
            content: {
              // Use painSpike as the problem if provided
              problem: consultationData.painSpike || generated.problemStatement,
              solution: generated.solutionStatement,
            },
          };
        case "photo_gallery":
          return {
            type: "photo-gallery",
            order: index,
            visible: true,
            content: {
              images: galleryImages,
              title: `${consultationData.industry} Gallery`,
            },
          };
        case "testimonials":
          return {
            type: "social-proof",
            order: index,
            visible: true,
            content: {
              stats: [{ label: generated.socialProof, value: "" }],
              industry: consultationData.industry,
              // NEW: Concrete proof story callout
              proofStory: consultationData.concreteProofStory || null,
              proofStoryContext: consultationData.proofStoryContext || null,
            },
          };
        case "final_cta":
          // Determine appropriate trust text based on industry/page type
          const industry = consultationData.industry?.toLowerCase() || '';
          const pageTypeForTrust = consultationData.pageType || '';
          
          let trustText = 'No credit card required · Free to start'; // default for SaaS
          
          if (pageTypeForTrust === 'beta-prelaunch' || pageTypeForTrust === 'waitlist') {
            trustText = 'No spam · Unsubscribe anytime';
          } else if (
            industry.includes('consulting') ||
            industry.includes('manufacturing') ||
            industry.includes('services') ||
            industry.includes('agency') ||
            industry.includes('professional')
          ) {
            trustText = 'Free consultation · No obligation';
          }
            
          return {
            type: isBetaPage ? "beta-final-cta" : "final-cta",
            order: index,
            visible: true,
            content: isBetaPage ? {
              headline: "Join the Waitlist",
              subheadline: "Be first to experience the future",
              ctaText: generated.ctaText || "Get Early Access",
              ctaLink: "#signup",
              spotsRemaining: consultationData.maxSignups || 100,
            } : {
              headline: "Ready to Get Started?",
              ctaText: generated.ctaText,
              ctaLink: "#signup",
              trustText: trustText,
            },
          };
        default:
          return {
            type: sectionType,
            order: index,
            visible: true,
            content: { title: sectionType.replace(/_/g, " ").toUpperCase() },
          };
      }
    });

    // FOR BETA PAGES: Filter and enhance
    if (isBetaPage) {
      console.log('🔧 [mapOldGeneratedContent] Filtering for beta page');
      
      // 1. REMOVE sections that don't belong on beta pages
      const betaExcludedTypes = ['video_hero', 'video-hero', 'process_timeline', 'process-timeline', 'stats_bar', 'stats-bar', 'social-proof', 'testimonials', 'problem-solution', 'photo-gallery', 'photo_gallery', 'faq'];
      mappedSections = mappedSections.filter(section => {
        const excluded = betaExcludedTypes.includes(section.type);
        if (excluded) {
          console.log('🔧 [mapOldGeneratedContent] Removing excluded section:', section.type);
        }
        return !excluded;
      });

      // 2. ADD founder section if data exists - check multiple possible locations
      const founderObj = consultationData.founder || {};
      const founderName = founderObj.name || consultationData.founderName || null;
      const founderTitle = founderObj.title || consultationData.founderTitle || null;
      const founderStory = founderObj.story || consultationData.founderStory || null;
      const founderCredentials = founderObj.credentials || consultationData.founderCredentials || [];
      const founderPhoto = founderObj.photo || consultationData.founderPhoto || null;
      
      console.log('🔧 [mapOldGeneratedContent] Founder check - name:', founderName, '| story:', !!founderStory);
      
      if (founderName || founderStory) {
        console.log('🔧 [mapOldGeneratedContent] Adding founder section');
        // Insert before final CTA
        const ctaIndex = mappedSections.findIndex(s => s.type === 'beta-final-cta');
        const founderSection: Section = {
          type: 'founder',
          order: ctaIndex >= 0 ? ctaIndex : mappedSections.length,
          visible: true,
          content: {
            name: founderName || 'Founder',
            title: founderTitle || 'Founder & CEO',
            story: founderStory || '',
            credentials: founderCredentials,
            photo: founderPhoto,
          },
        };
        if (ctaIndex >= 0) {
          mappedSections.splice(ctaIndex, 0, founderSection);
        } else {
          mappedSections.push(founderSection);
        }
      }

      // 3. ADD waitlist-proof section
      console.log('🔧 [mapOldGeneratedContent] Adding waitlist-proof section');
      const ctaIndex = mappedSections.findIndex(s => s.type === 'beta-final-cta');
      const waitlistSection: Section = {
        type: 'waitlist-proof',
        order: ctaIndex >= 0 ? ctaIndex : mappedSections.length,
        visible: true,
        content: {
          totalSignups: 0,
          todaySignups: 0,
          spotsRemaining: consultationData.maxSignups || 100,
        },
      };
      if (ctaIndex >= 0) {
        mappedSections.splice(ctaIndex, 0, waitlistSection);
      } else {
        mappedSections.push(waitlistSection);
      }

      // 4. UPDATE beta-perks to use consultation data perks
      const perksSection = mappedSections.find(s => s.type === 'beta-perks');
      if (perksSection && consultationData.betaPerks && consultationData.betaPerks.length > 0) {
        console.log('🔧 [mapOldGeneratedContent] Using consultation perks:', consultationData.betaPerks);
        perksSection.content.perks = consultationData.betaPerks;
      }

      // 5. REORDER sections
      mappedSections = mappedSections.map((section, index) => ({
        ...section,
        order: index,
      }));

      console.log('🔧 [mapOldGeneratedContent] Final beta sections:', mappedSections.map(s => s.type));
    }

    // ADD differentiator callout if sharpDifferentiator exists
    if (consultationData.sharpDifferentiator) {
      console.log('🔧 [mapOldGeneratedContent] Adding differentiator callout');
      // Insert after hero (index 1)
      const diffSection: Section = {
        type: 'differentiator-callout',
        order: 1,
        visible: true,
        content: {
          text: consultationData.sharpDifferentiator,
        },
      };
      mappedSections.splice(1, 0, diffSection);
    }

    // ADD credibility-strip if proofStats exist
    if (consultationData.proofStats && consultationData.proofStats.length > 0) {
      console.log('🔧 [mapOldGeneratedContent] Adding credibility strip');
      // Insert after hero (or after differentiator-callout if it exists)
      const insertIndex = consultationData.sharpDifferentiator ? 2 : 1;
      const credibilitySection: Section = {
        type: 'credibility-strip',
        order: insertIndex,
        visible: true,
        content: {
          stats: consultationData.proofStats,
        },
      };
      mappedSections.splice(insertIndex, 0, credibilitySection);
    }

    // ADD audience-fit section if audienceExclusion or target_audience exists
    if (consultationData.audienceExclusion || consultationData.target_audience) {
      console.log('🔧 [mapOldGeneratedContent] Adding audience-fit section');
      // Insert before final CTA
      const ctaIndex = mappedSections.findIndex(s => s.type === 'final-cta' || s.type === 'beta-final-cta');
      const audienceSection: Section = {
        type: 'audience-fit',
        order: ctaIndex >= 0 ? ctaIndex : mappedSections.length,
        visible: true,
        content: {
          forWho: consultationData.target_audience || null,
          notForWho: consultationData.audienceExclusion || null,
        },
      };
      if (ctaIndex >= 0) {
        mappedSections.splice(ctaIndex, 0, audienceSection);
      } else {
        mappedSections.push(audienceSection);
      }
    }

    // ADD how-it-works if methodologySteps exists
    const methodologySteps = consultationData.methodologySteps?.filter((s: string) => s && s.trim());
    if (methodologySteps && methodologySteps.length > 0) {
      console.log('🔧 [mapOldGeneratedContent] Adding how-it-works from methodology steps');
      // Check if how-it-works already exists
      const existingHowItWorks = mappedSections.findIndex(s => s.type === 'how-it-works');
      if (existingHowItWorks === -1) {
        // Insert before social-proof or final-cta
        const socialIndex = mappedSections.findIndex(s => s.type === 'social-proof');
        const insertIndex = socialIndex >= 0 ? socialIndex : mappedSections.length - 1;
        
        const howItWorksSection: Section = {
          type: 'how-it-works',
          order: insertIndex,
          visible: true,
          content: {
            title: 'How It Works',
            subtitle: 'What happens in the first 30 days',
            steps: methodologySteps.map((step: string, i: number) => ({
              number: i + 1,
              title: `Week ${i + 1}${i === 2 ? '-4' : ''}`,
              description: step,
            })),
          },
        };
        mappedSections.splice(insertIndex, 0, howItWorksSection);
      }
    }

    // REORDER all sections after insertions AND inject industryVariant into ALL sections
    mappedSections = mappedSections.map((section, index) => ({
      ...section,
      order: index,
      content: {
        ...section.content,
        industryVariant: industryVariant, // CRITICAL: Inject into every section
      },
    }));

    return mappedSections;
  };

  // FEATURE FLAG: AI hero images disabled until QC pipeline is ready
  // Clean CSS gradients with brand colors are used instead
  const ENABLE_AI_HERO_IMAGES = false;

  // Fetch hero image - DISABLED: returns empty to use CSS gradient backgrounds instead
  const fetchHeroImage = async (query: string, industry?: string): Promise<string> => {
    if (!ENABLE_AI_HERO_IMAGES) {
      console.log('🖼️ [fetchHeroImage] AI hero images DISABLED — using CSS gradient background');
      return "";
    }

    try {
      const effectiveIndustry = industry || 
        consultation?.industry || 
        effectiveNavState?.strategicData?.consultationData?.industry ||
        'professional services';
      
      const aiPrompt = buildHeroImagePrompt(effectiveIndustry, query);
      
      console.log('🖼️ [fetchHeroImage] Generating AI hero image for:', { query, industry: effectiveIndustry });
      
      const { data, error } = await supabase.functions.invoke('generate-hero-images', {
        body: {
          prompts: [aiPrompt],
          cacheKey: `fallback::${effectiveIndustry.toLowerCase()}::${query.toLowerCase().replace(/\s+/g, '-').slice(0, 30)}::v${Date.now() % 5}`,
        },
      });
      
      if (!error && data?.images?.[0]?.url) {
        console.log('✅ [fetchHeroImage] AI image generated successfully');
        return data.images[0].url;
      }
      
      console.warn('⚠️ [fetchHeroImage] AI generation failed, returning empty');
      return "";
    } catch (err) {
      console.error('❌ [fetchHeroImage] Error:', err);
      return "";
    }
  };
  
  /**
   * Build an industry-appropriate hero image prompt
   * Creates professional, subtle images that support text overlay
   */
  const buildHeroImagePrompt = (industry: string, businessContext: string): string => {
    const industryLower = industry.toLowerCase();
    
    // Industry-specific subject matter for more targeted imagery
    const industrySubjects: Record<string, string> = {
      'manufacturing': 'modern factory floor, precision engineering, industrial automation, clean manufacturing lines',
      'healthcare': 'modern healthcare technology, patient care environment, medical innovation, bright clinical space',
      'consulting': 'strategic planning session, professional collaboration, executive boardroom, city skyline',
      'coaching': 'inspiring workspace, personal growth environment, warm inviting atmosphere, mentorship setting',
      'fintech': 'financial data visualization, fintech interface, wealth management, digital banking',
      'saas': 'abstract data visualization, modern software interface, cloud technology, digital dashboard',
      'devtools': 'developer workspace with code elements, modern tech environment, dark theme with accent lighting',
      'creative': 'design studio, creative workspace, artistic environment, bold expressive atmosphere',
      'ecommerce': 'premium product display, clean commercial photography, minimalist retail backdrop',
      'realestate': 'beautiful architectural interior, modern luxury space, natural light, welcoming atmosphere',
      'legal': 'traditional professional office, warm wood tones, law library aesthetic, trustworthy setting',
      'finance': 'modern financial district, city views, clean professional atmosphere, secure environment',
      'education': 'modern learning environment, academic campus, knowledge and growth, bright study space',
    };
    
    // Find matching industry subject or use default
    const subject = Object.entries(industrySubjects).find(([key]) => 
      industryLower.includes(key)
    )?.[1] || 'professional modern business environment, innovation and growth';

    // Pull tone from consultation data if available
    const tone = effectiveNavState?.strategicData?.consultationData?.tone || 
      effectiveNavState?.strategicData?.consultationData?.communicationStyle?.tone ||
      'professional';

    // Pull brand color hint if available
    const brandColor = effectiveNavState?.strategicData?.consultationData?.primaryColor || '';
    const colorHint = brandColor ? `Color palette hints: tones compatible with ${brandColor}.` : '';
    
    // Add variation seed for regeneration uniqueness
    const variationSeed = Date.now() % 5;
    const variations = ['wide angle', 'close-up detail', 'aerial view', 'side angle', 'symmetrical'];
    const compositionVariation = variations[variationSeed];
    
    // Build the final prompt with full context
    return `Professional wide-angle photograph for a ${industry} company landing page. Subject: ${subject}. Style: ${tone} corporate photography. Composition: ${compositionVariation}, main subject on right side, clear space on left for text overlay. Lighting: Soft, professional, warm. ${colorHint} NO: People's faces in focus, text, logos, watermarks, cluttered scenes. YES: Clean backgrounds, depth of field, professional quality. 16:9 aspect ratio. Cinematic lighting. ${businessContext} context.`;
  };

  // Fetch gallery images from Unsplash
  const fetchGalleryImages = async (queries: string[]): Promise<string[]> => {
    if (!queries.length) return [];
    try {
      const results = await Promise.allSettled(
        queries.slice(0, 3).map(query =>
          supabase.functions.invoke("unsplash-search", {
            body: { query, count: 1 },
          })
        )
      );
      return results
        .filter((r) => r.status === "fulfilled")
        .map((r) => (r as any).value?.data?.results?.[0]?.urls?.regular)
        .filter(Boolean);
    } catch {
      return [];
    }
  };

  // Fallback template generation
  const generateFallbackSections = async (consultationData: any): Promise<Section[]> => {
    // CRITICAL: Get pageType for beta section mapping
    const pageType = consultationData.pageType || 
                     effectiveNavState?.strategicData?.consultationData?.pageType ||
                     null;
    const isBetaPage = pageType === 'beta-prelaunch';
    
    // CRITICAL: Detect industry variant for proper styling (consulting = light mode)
    // Use the already-imported detectIndustryVariantNew for consistency
    const industryVariant = detectIndustryVariantNew(
      consultationData.industry,
      consultationData.industryCategory,
      consultationData.industrySubcategory,
      pageType
    );
    
    console.log('🚀 [generateFallbackSections] pageType:', pageType, '| isBetaPage:', isBetaPage, '| industryVariant:', industryVariant);
    
    // Using static imports from top of file
    const headline = generateHeadline(consultationData);
    const subheadline = generateSubheadline(consultationData);
    const features = genFeatures(consultationData);
    const cta = generateCTA(consultationData);
    const socialProof = await genSocialProof(consultationData);
    const problemStatement = transformProblemStatement(consultationData.challenge);
    const solutionStatement = transformSolutionStatement(consultationData.unique_value, consultationData.industry);

    // BETA PAGE: Use beta-specific section types
    if (isBetaPage) {
      console.log('🚀 [generateFallbackSections] Building BETA sections');
      const sections: Section[] = [
        {
          type: "beta-hero-teaser",
          order: 0,
          visible: true,
          content: { 
            headline, 
            subheadline, 
            ctaText: cta.text || "Get Early Access", 
            ctaLink: "#signup",
            productName: consultationData.productName || consultationData.businessName || consultationData.industry,
            launchDate: consultationData.launchDate || null,
          },
        },
        {
          type: "beta-perks",
          order: 1,
          visible: true,
          content: {
            headline: "Early Adopter Perks",
            subheadline: "Exclusive benefits for founding members",
            perks: consultationData.betaPerks || ['lifetime-discount', 'founding-member', 'priority-support'],
            scarcityMessage: `Only ${consultationData.maxSignups || 100} spots available`,
          },
        },
      ];
      
      // Add founder section if founder data exists
      if (consultationData.founderName || consultationData.founder) {
        console.log('🚀 [generateFallbackSections] Adding founder section');
        sections.push({
          type: "founder",
          order: sections.length,
          visible: true,
          content: {
            name: consultationData.founderName || consultationData.founder?.name || 'Founder',
            title: consultationData.founderTitle || consultationData.founder?.title || 'Founder & CEO',
            story: consultationData.founderStory || consultationData.founder?.story || '',
            credentials: consultationData.founderCredentials || consultationData.founder?.credentials || [],
            photo: consultationData.founderPhoto || consultationData.founder?.photo || null,
          },
        });
      }
      
      // Add waitlist proof section
      sections.push({
        type: "waitlist-proof",
        order: sections.length,
        visible: true,
        content: {
          totalSignups: 0,
          todaySignups: 0,
          spotsRemaining: consultationData.maxSignups || 100,
        },
      });
      
      // Add beta final CTA
      sections.push({
        type: "beta-final-cta",
        order: sections.length,
        visible: true,
        content: { 
          headline: "Join the Waitlist", 
          subheadline: "Be first to experience the future",
          ctaText: cta.text || "Get Early Access", 
          ctaLink: "#signup",
          spotsRemaining: consultationData.maxSignups || 100,
        },
      });
      
      console.log('🚀 [generateFallbackSections] Built', sections.length, 'beta sections:', sections.map(s => s.type));
      return sections;
    }

    // STANDARD PAGE: Use standard section types
    console.log('🚀 [generateFallbackSections] Building STANDARD sections');
    return [
      {
        type: "hero",
        order: 0,
        visible: true,
        content: { headline, subheadline, ctaText: cta.text, ctaLink: "#signup", industryVariant },
      },
      {
        type: "problem-solution",
        order: 1,
        visible: true,
        content: { problem: problemStatement, solution: solutionStatement, industryVariant },
      },
      {
        type: "features",
        order: 2,
        visible: true,
        content: { features, industryVariant },
      },
      {
        type: "social-proof",
        order: 3,
        visible: true,
        content: { ...socialProof, industry: consultationData.industry, industryVariant },
      },
      {
        type: "final-cta",
        order: 4,
        visible: true,
        content: { headline: "Ready to Get Started?", ctaText: cta.text, ctaLink: "#signup", industryVariant },
      },
    ];
  };

  // Handle regeneration with intelligence
  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const consultationData = effectiveNavState?.consultationData || consultation;
      
      const result = await generateIntelligentContent(
        {
          industry: consultationData.industry,
          targetAudience: consultationData.target_audience,
          serviceType: consultationData.service_type,
          challenge: consultationData.challenge,
          goal: consultationData.goal,
          uniqueValue: consultationData.unique_value,
          offer: consultationData.offer,
        },
        intelligence
      );

      if (result.success && result.content) {
        const newSections = await mapGeneratedContentToSections(result.content, consultationData);
        const patternedRegen = newSections.map((s, i) => {
          const { patternClass, glowClass } = getPatternForSection(i, s.type);
          return { ...s, content: { ...s.content, patternClass, glowClass } };
        });
        const regenCompanyName = consultationData?.businessName || consultationData?.business_name || consultation?.businessName || '';
        const regenIntelForQC = (() => {
          try {
            const stored = localStorage.getItem('pageconsult_demo_extracted') || localStorage.getItem('pageconsult_extracted_intelligence');
            if (stored) { const p = JSON.parse(stored); if (p && typeof p === 'object' && Object.keys(p).length > 3) return p; }
          } catch {}
          return consultationData?.extracted_intelligence || consultationData;
        })();
        const { sections: qcRegenSections } = autoQCPass(patternedRegen, regenIntelForQC, consultationData, regenCompanyName);
        setSections(qcRegenSections);
        toast({
          title: "Content Regenerated",
          description: intelligence 
            ? "New content generated using market intelligence" 
            : "New content generated",
        });
      } else {
        throw new Error(result.error || "Regeneration failed");
      }
    } catch (err) {
      console.error("Regeneration error:", err);
      toast({
        title: "Regeneration Failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  // Handle full page regeneration - deletes existing page and triggers fresh generation
  const handleRegeneratePage = async () => {
    if (!pageData?.id) {
      console.log('🔄 [Generate] No existing page to regenerate');
      return;
    }
    
    const confirmed = window.confirm(
      'This will delete the current page and generate a fresh one with the latest layout logic. Continue?'
    );
    if (!confirmed) return;
    
    setIsRegenerating(true);
    console.log('🔄 [Generate] User requested page regeneration');
    console.log('🗑️ [Generate] Deleting page:', pageData.id);
    
    try {
      // Delete existing page
      const { error } = await supabase
        .from('landing_pages')
        .delete()
        .eq('id', pageData.id);
      
      if (error) throw error;
      
      console.log('✅ [Generate] Deleted existing page, triggering fresh generation');
      console.log('🚀 [Generate] Starting fresh generation...');
      
      // Clear page data to trigger fresh generation
      setPageData(null);
      setExistingPageLoaded(false);
      setSections([]);
      
      // Reset phase to generating
      setPhase("generating");
      setIsGenerating(true);
      setProgress(0);
      
      // Re-navigate with force regenerate to trigger the generation flow
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('regenerate', 'true');
      window.history.replaceState({}, '', currentUrl.toString());
      
      // Force reload the component to trigger generation with new layout templates
      window.location.reload();
      
    } catch (err) {
      console.error('❌ [Generate] Failed to delete page:', err);
      toast({
        title: "Failed to regenerate page",
        description: "Could not delete existing page. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  // Handle regeneration of a single section
  const handleRegenerateSection = async (sectionType: string) => {
    setIsRegenerating(true);
    
    try {
      const consultationData = effectiveNavState?.consultationData || consultation;
      
      // Build intelligence context for the API
      const intelligenceContext = intelligence ? {
        persona: {
          name: intelligence.synthesizedPersona?.name,
          primaryPain: intelligence.synthesizedPersona?.painPoints?.[0]?.pain,
          primaryDesire: intelligence.synthesizedPersona?.desires?.[0]?.desire,
          keyObjections: intelligence.synthesizedPersona?.objections?.map((o: any) => o.objection),
          languagePatterns: intelligence.synthesizedPersona?.languagePatterns,
        },
        market: {
          topPainPoints: intelligence.marketResearch?.painPoints,
          keyStatistics: intelligence.marketResearch?.claims?.map((c: any) => c.claim),
        }
      } : null;
      
      // Get current section content for context
      const currentSection = sections.find(s => s.type === sectionType);
      
      // Call edge function for section-specific regeneration
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          action: 'regenerate_section',
          sectionType,
          consultationData: {
            industry: consultationData.industry,
            target_audience: consultationData.target_audience,
            service_type: consultationData.service_type,
            challenge: consultationData.challenge,
            goal: consultationData.goal,
            unique_value: consultationData.unique_value,
            offer: consultationData.offer,
          },
          intelligenceContext,
          currentContent: currentSection?.content
        }
      });
      
      if (error) throw error;
      
      if (data?.success && data?.content) {
        // Update just that section
        setSections(prev => prev.map(section => 
          section.type === sectionType 
            ? { ...section, content: { ...section.content, ...data.content } }
            : section
        ));
        
        // Save to undo history
        pushHistory(sections);
        
        toast({
          title: 'Section Regenerated',
          description: `${sectionType.replace(/-/g, ' ')} updated with fresh content`,
        });
      } else {
        throw new Error(data?.error || 'Regeneration failed');
      }
    } catch (err) {
      console.error('Section regeneration error:', err);
      toast({
        title: 'Regeneration Failed',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsRegenerating(false);
    }
  };


  const handleSave = async () => {
    if (!pageData) return;

    const { error } = await supabase
      .from("landing_pages")
      .update({ sections, updated_at: new Date().toISOString() })
      .eq("id", pageData.id);

    if (error) {
      toast({
        title: "Save failed",
        description: "Could not save changes. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "✓ Saved",
        description: "Your changes have been saved.",
      });
    }
  };

  const handleUndo = () => {
    const previousState = undo();
    if (previousState) {
      setSections(previousState);
      toast({
        title: "Undone",
        description: "Reverted to previous version",
      });
    }
  };

  const handleRedo = () => {
    const nextState = redo();
    if (nextState) {
      setSections(nextState);
      toast({
        title: "Redone",
        description: "Restored next version",
      });
    }
  };

  const updateSections = (newSections: Section[]) => {
    setSections(newSections);
    pushHistory(newSections);
  };

  const handlePreview = () => {
    if (pageData) {
      window.open(`/preview/${pageData.slug}`, "_blank");
    }
  };

  // Unified Generation Phase - single loading experience
  if (phase === "generating") {
    return (
      <UnifiedGenerationFlow 
        consultation={consultation}
        isGenerating={isGenerating}
        onComplete={() => {
          setPhase("editor");
        }}
      />
    );
  }


  // Phase 3: Editor
  return (
    <EditingProvider>
      <EditorContent
        consultation={consultation}
        pageData={pageData}
        sections={sections}
        setSections={updateSections}
        handleSave={handleSave}
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        isSaving={isSaving}
        handlePreview={handlePreview}
        publishModalOpen={publishModalOpen}
        setPublishModalOpen={setPublishModalOpen}
        aiConsultantOpen={aiConsultantOpen}
        setAiConsultantOpen={setAiConsultantOpen}
        stylePickerOpen={stylePickerOpen}
        setStylePickerOpen={setStylePickerOpen}
        calculatorUpgradeOpen={calculatorUpgradeOpen}
        setCalculatorUpgradeOpen={setCalculatorUpgradeOpen}
        intelligence={intelligence}
        preGeneratedContent={preGeneratedContent}
        isRegenerating={isRegenerating}
        handleRegenerate={handleRegenerate}
        handleRegenerateSection={handleRegenerateSection}
        handleRegeneratePage={handleRegeneratePage}
        existingPageLoaded={existingPageLoaded}
        landingPageBestPractices={landingPageBestPractices}
        strategicData={strategicData}
        cssVariables={cssVariables}
        designSystem={designSystem}
        seoData={seoData}
      />
    </EditingProvider>
  );
}

function EditorContent({
  consultation,
  pageData,
  sections,
  setSections,
  handleSave,
  handleUndo,
  handleRedo,
  canUndo,
  canRedo,
  isSaving,
  handlePreview,
  publishModalOpen,
  setPublishModalOpen,
  aiConsultantOpen,
  setAiConsultantOpen,
  stylePickerOpen,
  setStylePickerOpen,
  calculatorUpgradeOpen,
  setCalculatorUpgradeOpen,
  intelligence,
  preGeneratedContent,
  isRegenerating,
  handleRegenerate,
  handleRegenerateSection,
  handleRegeneratePage,
  existingPageLoaded,
  landingPageBestPractices,
  strategicData,
  cssVariables,
  designSystem,
  seoData,
}: any) {
  const { toast } = useToast();
  const { pageStyle, setPageStyle } = useEditing();
  
  // Get current user
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [strategyBriefOpen, setStrategyBriefOpen] = useState(false);
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
      setUserEmail(user?.email || null);
    });
  }, []);

  // Handler for applying consultant suggestions to sections
  const handleApplyConsultantChange = useCallback((
    sectionType: string, 
    field: string, 
    value: string
  ) => {
    setSections((prev: any[]) => prev.map(section => {
      if (section.type === sectionType) {
        return {
          ...section,
          content: {
            ...section.content,
            [field]: value
          }
        };
      }
      return section;
    }));
  }, [setSections]);

  // Consultant integration for AI-powered copy suggestions  
  const consultantIntegration = useConsultantIntegration({
    consultationData: strategicData?.consultationData || consultation || {},
    sections: sections.map((s: any) => ({ type: s.type, content: s.content })),
    onApplyChange: handleApplyConsultantChange,
    debounceMs: 2500,
    enabled: sections.length > 0
  });

  // Page builder integration for completeness tracking
  const pageBuilder = usePageBuilder({
    consultationData: strategicData?.consultationData || consultation || {},
    sections: sections.map((s: any) => ({ type: s.type, content: s.content })),
    onSectionsChange: setSections,
    consultantEnabled: false // Using consultantIntegration separately
  });

  // AI Actions usage tracking (pass email for dev mode detection)
  const aiActions = useAIActions(userId, userEmail);
  const { credits } = useCredits(userId);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [zeroBalanceModalOpen, setZeroBalanceModalOpen] = useState(false);
  const [usageHistoryOpen, setUsageHistoryOpen] = useState(false);
  const [upgradeDrawerOpen, setUpgradeDrawerOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: AIActionType;
    cost: number;
    callback: () => void;
    sectionType?: string;
  } | null>(null);
const [showLowBalanceAlert, setShowLowBalanceAlert] = useState(false);
  
  // Achievement modal and confetti celebration
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [hasShownConversionReady, setHasShownConversionReady] = useState(false);
  // Removed showDigitalChampion toggle - using single consistent design
  const [variantModalOpen, setVariantModalOpen] = useState(false);

  // Show low balance alert when needed
  useEffect(() => {
    if (aiActions.isLowBalance && !aiActions.isZeroBalance) {
      setShowLowBalanceAlert(true);
    }
  }, [aiActions.isLowBalance, aiActions.isZeroBalance]);
  
  // Celebrate when hitting conversion-ready for the first time
  useEffect(() => {
    if (pageBuilder.isConversionReady && !hasShownConversionReady) {
      setHasShownConversionReady(true);
      
      // Confetti celebration!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      setTimeout(() => {
        setShowAchievementModal(true);
      }, 1500);
    }
  }, [pageBuilder.isConversionReady, hasShownConversionReady]);

  // Wrapper function to check and track AI actions
  const executeWithUsageCheck = async (
    actionType: AIActionType,
    callback: () => void,
    sectionType?: string
  ) => {
    // DEV MODE or Agency tier: Always allow, skip confirmation
    if (aiActions.devMode || aiActions.isUnlimited) {
      if (aiActions.devMode) {
        console.log(`[DEV MODE] Executing ${actionType} without credit check`);
      }
      callback();
      return;
    }

    const check = aiActions.checkAction(actionType);
    
    if (!check.allowed) {
      setZeroBalanceModalOpen(true);
      return;
    }

    // Skip confirmation if user opted out
    if (aiActions.dontShowConfirm) {
      const result = await aiActions.trackAction(actionType, pageData?.id, sectionType);
      if (result.allowed) {
        callback();
      } else {
        setZeroBalanceModalOpen(true);
      }
      return;
    }

    // Show confirmation modal
    setPendingAction({
      type: actionType,
      cost: check.cost,
      callback,
      sectionType,
    });
    setConfirmModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    
    setConfirmModalOpen(false);
    
    const result = await aiActions.trackAction(
      pendingAction.type,
      pageData?.id,
      pendingAction.sectionType
    );
    
    if (result.allowed) {
      pendingAction.callback();
    } else {
      setZeroBalanceModalOpen(true);
    }
    
    setPendingAction(null);
  };

  // Wrapped handlers with usage tracking
  const handleRegenerateWithUsage = () => {
    executeWithUsageCheck('page_generation', handleRegenerate);
  };

  const handleRegenerateSectionWithUsage = (sectionType: string) => {
    executeWithUsageCheck('section_regeneration', () => handleRegenerateSection(sectionType), sectionType);
  };

  const handleStyleChangeWithUsage = (style: StylePresetName) => {
    executeWithUsageCheck('style_change', () => {
      setPageStyle(style);
      const styleNames: Record<StylePresetName, string> = {
        premium: 'Premium',
        minimal: 'Minimal', 
        bold: 'Bold',
        elegant: 'Elegant'
      };
      toast({
        title: `Style applied: ${styleNames[style] || style}`,
        description: "Your page now uses the new design preset",
      });
    });
  };

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo) handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, handleUndo, handleRedo]);

  const handleAddCalculator = async (config: { type: string; inputs: string[] }) => {
    // Add calculator section to the page
    const newCalculatorSection = {
      type: "calculator",
      order: 2,
      visible: true,
      content: config,
    };

    // Insert calculator after problem-solution section
    const updatedSections = [...sections];
    updatedSections.splice(2, 0, newCalculatorSection);

    // Reorder remaining sections
    updatedSections.forEach((section, index) => {
      section.order = index;
    });

    setSections(updatedSections);

    // Save to database
    if (pageData) {
      await supabase.from("landing_pages").update({ sections: updatedSections }).eq("id", pageData.id);
    }

    toast({
      title: "Calculator added!",
      description: "Your interactive calculator has been added to the page.",
    });
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#0f0a1f] via-[#1a1332] to-[#0f0a1f] relative overflow-hidden">
      {/* SEO Head - inject meta tags and schema markup */}
      {seoData && <SEOHead seo={seoData} />}
      
      {/* Ambient orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      
      {/* Top toolbar */}
      <header className="h-14 border-b border-white/10 backdrop-blur-md bg-white/5 flex items-center justify-between px-4 relative z-10">
        <div className="flex items-center gap-4">
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={logo} alt="PageConsult AI" className="h-8 w-auto" />
          </a>
          
          {/* Dev Mode Indicator */}
          {aiActions.devMode && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/40">
              <span className="text-xs font-medium text-yellow-400">🛠️ DEV MODE</span>
            </div>
          )}
          
          {/* Credits Display - Simple understated style matching main Header */}
          {userId && !aiActions.loading && (
            <div 
              className="flex items-center gap-1.5 text-sm text-slate-400 cursor-pointer hover:text-slate-300 transition-colors"
              onClick={() => setUsageHistoryOpen(true)}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>
                {aiActions.isUnlimited 
                  ? '∞' 
                  : aiActions.available
                } credits
              </span>
            </div>
          )}
          
          {/* Intelligence badge */}
          {intelligence && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30">
              <Brain className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-purple-300">
                Persona: {intelligence.synthesizedPersona?.name || "Custom"}
              </span>
              {preGeneratedContent?.intelligenceUsed?.confidenceScore > 0 && (
                <span className="text-xs text-purple-400/80">
                  ({Math.round(preGeneratedContent.intelligenceUsed.confidenceScore * 100)}%)
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Regenerate button */}
          {intelligence && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerateWithUsage}
              disabled={isRegenerating}
              className="gap-2 bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
            >
              {isRegenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              Regenerate
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={!canUndo}
            className="gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-30"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRedo}
            disabled={!canRedo}
            className="gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-30"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-white/10 mx-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setVariantModalOpen(true)}
            className="gap-2 relative pl-5 builder-button bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            <span className="absolute left-0 top-0 w-1 h-full bg-purple-500 rounded-l"></span>
            <Sparkles className="w-4 h-4" />
            Generate Variant
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            className="relative pl-5 builder-button save-draft-btn bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            <span className="absolute left-0 top-0 w-1 h-full bg-yellow-500 rounded-l"></span>
            {isSaving ? "Saving..." : "Save Draft"}
          </Button>
          {/* Regenerate button - only shows for existing loaded pages */}
          {pageData?.id && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegeneratePage}
              disabled={isRegenerating}
              className="relative pl-5 builder-button bg-white/5 border-white/10 text-white hover:bg-white/10 gap-2"
            >
              <span className="absolute left-0 top-0 w-1 h-full bg-amber-500 rounded-l"></span>
              <RefreshCw className={cn("h-4 w-4", isRegenerating && "animate-spin")} />
              {isRegenerating ? 'Regenerating...' : 'Regenerate'}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreview}
            className="relative pl-5 builder-button preview-btn bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            <span className="absolute left-0 top-0 w-1 h-full bg-cyan-500 rounded-l"></span>
            Preview
          </Button>
          {/* Share Preview + Publish Toolbar */}
          {pageData?.id && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSharePreviewOpen(true)}
                className="border-white/10 text-white/70 hover:bg-white/10"
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
              <PublishToolbar
                pageId={pageData.id}
                slug={pageData.slug}
                isPublished={pageData.status === 'published' || pageData.is_published}
                publishedAt={pageData.published_at}
                onOpenPublishModal={() => setPublishModalOpen(true)}
              />
            </>
          )}
          
          {/* Fallback Publish button when page not yet saved */}
          {!pageData?.id && (
            <Button
              size="sm"
              onClick={() => setPublishModalOpen(true)}
              className="relative pl-5 builder-button publish-btn bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white border-0"
            >
              <span className="absolute left-0 top-0 w-1 h-full bg-green-500 rounded-l"></span>
              Publish
            </Button>
          )}
        </div>
      </header>

      {/* Editor layout */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left sidebar with Credits + Persona Insights + Section Manager */}
<div className="w-72 border-r border-white/10 bg-white/5 backdrop-blur-md flex flex-col overflow-hidden">
          {/* Page Score Meter - Single consistent design */}
          <div className="p-3 border-b border-white/10">
            <DigitalChampionMeter 
              completeness={pageBuilder.completeness}
              brandName={strategicData?.consultationData?.businessName || consultation?.industry || 'Your Brand'}
              logoUrl={strategicData?.brandSettings?.logoUrl || strategicData?.consultationData?.websiteIntelligence?.logoUrl}
              className="bg-transparent border-white/10"
            />
          </div>
          
          {/* Conversion Ready Banner */}
          {pageBuilder.isConversionReady && (
            <div className="p-3 border-b border-white/10 bg-gradient-to-r from-green-500/10 to-emerald-500/10 animate-glow-green">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-green-400">
                  <Trophy className="w-4 h-4" />
                  <span className="font-medium text-sm">Conversion-Ready!</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAchievementModal(true)}
                  className="h-7 px-2 text-green-400 hover:text-green-300 hover:bg-green-500/20"
                >
                  <Share2 className="w-3 h-3 mr-1" />
                  Share
                </Button>
              </div>
              <p className="text-xs text-green-300/80 mb-2">
                Your page has all the elements for high conversion.
              </p>
              <Button
                size="sm"
                onClick={() => setPublishModalOpen(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Preview & Publish
              </Button>
            </div>
          )}

          {/* Strong Page Banner */}
          {pageBuilder.isStrong && !pageBuilder.isConversionReady && (
            <div className="p-3 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <Sparkles className="w-4 h-4" />
                <span className="font-medium text-sm">Looking Strong!</span>
              </div>
              <p className="text-xs text-blue-300/80">
                {pageBuilder.nextUnlock?.hint || "Add more content to reach conversion-ready status."}
              </p>
            </div>
          )}

          
          {/* Persona Insights Panel */}
          {intelligence?.synthesizedPersona && (
            <PersonaInsightsPanel 
              intelligence={intelligence} 
              landingPageBestPractices={landingPageBestPractices}
            />
          )}
          
          {/* Section Manager */}
          <div className="flex-1 overflow-auto">
            <SectionManager
              sections={sections}
              onSectionsChange={setSections}
              onSave={handleSave}
              onAddCalculator={() => setCalculatorUpgradeOpen(true)}
              onRegenerateSection={handleRegenerateSectionWithUsage}
              isRegenerating={isRegenerating}
              actionCost={1}
            />
          </div>
        </div>
        
<LivePreview 
          sections={sections} 
          onSectionsChange={setSections} 
          cssVariables={cssVariables}
          iconStyle={designSystem?.components?.iconStyle}
          industryVariant={
            // PRIORITY 1: Read from persisted pageData.design_intelligence
            (pageData?.design_intelligence as any)?.industryVariant ||
            // PRIORITY 2: Derive from consultation industry
            consultation?.industryCategory ||
            consultation?.industry ||
            strategicData?.consultationData?.industryCategory ||
            strategicData?.consultationData?.industry ||
            'default'
          }
          colorMode={(() => {
            // PRIORITY 1: Read from persisted pageData.design_intelligence (multi-user safe)
            const persistedMode = (pageData?.design_intelligence as any)?.colorMode;
            if (persistedMode) {
              return (persistedMode === 'light' || persistedMode === 'warm') ? 'light' : 'dark';
            }
            // PRIORITY 2: Fallback to consultation/strategicData (during generation before save)
            const mode = consultation?.designIntelligence?.colors?.mode ||
                        consultation?.colorMode ||
                        strategicData?.consultationData?.colorMode ||
                        'dark';
            return (mode === 'light' || mode === 'warm') ? 'light' : 'dark';
          })()}
          brandSettings={(() => {
            // Helper to get extracted_intelligence colors array
            const extractedIntel = consultation?.extracted_intelligence as any || {};
            const colorsArray = extractedIntel.colors || [];
            
            const resolved = {
              // PRIORITY: strategicData > pageData > consultation.websiteIntelligence > extracted_intelligence > hero section
              companyName: 
                strategicData?.consultationData?.businessName ||
                (pageData?.consultation_data as any)?.businessName ||
                (pageData?.website_intelligence as any)?.companyName ||
                consultation?.businessName ||
                consultation?.business_name ||
                (consultation?.websiteIntelligence as any)?.companyName ||
                extractedIntel.companyName ||
                null,
              logoUrl:
                strategicData?.brandSettings?.logoUrl ||
                strategicData?.consultationData?.websiteIntelligence?.logoUrl ||
                (pageData?.website_intelligence as any)?.logoUrl ||
                (pageData?.consultation_data as any)?.websiteIntelligence?.logoUrl ||
                (consultation?.websiteIntelligence as any)?.logoUrl ||
                extractedIntel.logoUrl ||
                sections.find(s => s.type === 'hero')?.content?.logoUrl ||
                null,
              primaryColor:
                strategicData?.brandSettings?.primaryColor ||
                (pageData?.design_intelligence as any)?.brandColors?.primary ||
                (consultation?.websiteIntelligence as any)?.primaryColor ||
                colorsArray[0] || // extracted_intelligence.colors[0]
                extractedIntel.brandColors?.primary ||
                designSystem?.colors?.primary ||
                null,
              secondaryColor:
                strategicData?.brandSettings?.secondaryColor ||
                (pageData?.design_intelligence as any)?.brandColors?.secondary ||
                (consultation?.websiteIntelligence as any)?.secondaryColor ||
                colorsArray[1] || // extracted_intelligence.colors[1]
                extractedIntel.brandColors?.secondary ||
                designSystem?.colors?.secondary ||
                null,
              accentColor:
                (pageData?.design_intelligence as any)?.brandColors?.accent ||
                (consultation?.websiteIntelligence as any)?.accentColor ||
                colorsArray[2] || // extracted_intelligence.colors[2]
                extractedIntel.brandColors?.accent ||
                designSystem?.colors?.accent ||
                null,
            };
            
            console.log('🎨 [LivePreview] Resolved brandSettings:', {
              logoUrl: resolved.logoUrl,
              primaryColor: resolved.primaryColor,
              secondaryColor: resolved.secondaryColor,
              hasColorsArray: colorsArray.length > 0,
            });
            
            return resolved;
          })()}
          getSectionLockStatus={pageBuilder.getSectionLockStatus}
        />
      </div>

      {/* Strategy Brief Panel - Fixed to right edge */}
      <StrategyBriefPanel
        brief={strategicData?.strategyBrief || (pageData?.strategy_brief as string | null) || null}
        businessName={strategicData?.consultationData?.businessName || (pageData?.consultation_data as any)?.businessName}
        consultationData={strategicData?.consultationData || (pageData?.consultation_data as any) || consultation}
        consultationId={consultation?.id || pageData?.consultation_id}
        aiSeoData={strategicData?.aiSeoData || (pageData?.consultation_data as any)?.aiSeoData || null}
        onDataUpdated={(updatedData) => {
          // Update local state with new data
          console.log('Brief data updated:', updatedData);
        }}
        onRegenerate={async (updatedData) => {
          // Trigger page regeneration with updated data
          console.log('Regenerating with updated brief:', updatedData);
          handleRegenerate();
        }}
        onOpenChange={setStrategyBriefOpen}
      />

      <PublishModal
        open={publishModalOpen}
        onOpenChange={setPublishModalOpen}
        pageData={pageData}
        sections={sections}
        styles={pageData?.styles}
        designIntelligence={pageData?.design_intelligence}
        brandSettings={{
          companyName: pageData?.consultation_data?.businessName || pageData?.title,
          logoUrl: pageData?.consultation_data?.logoUrl,
          primaryColor: pageData?.consultation_data?.brandColors?.primary,
        }}
      />

      <AIConsultantSidebar
        isOpen={aiConsultantOpen}
        onClose={() => setAiConsultantOpen(false)}
        pageContent={{
          headline: sections.find((s) => s.type === "hero")?.content?.headline,
          subheadline: sections.find((s) => s.type === "hero")?.content?.subheadline,
          features: sections.find((s) => s.type === "features")?.content?.features,
          cta: sections.find((s) => s.type === "hero")?.content?.cta?.text,
          industry: consultation?.industry,
          serviceType: consultation?.service_type,
          targetAudience: consultation?.target_audience,
        }}
        onApplySuggestion={(suggestion) => {
          // TODO: Implement applying AI suggestions
          console.log("Apply suggestion:", suggestion);
        }}
      />

      <StylePicker
        open={stylePickerOpen}
        onOpenChange={setStylePickerOpen}
        currentStyle={pageStyle}
        onStyleSelect={handleStyleChangeWithUsage}
      />

      <VariantGeneratorModal
        isOpen={variantModalOpen}
        onClose={() => setVariantModalOpen(false)}
        originalPageData={pageData}
        onGenerateVariant={async (variantType, config) => {
          console.log('Generating variant:', { variantType, config });
          toast({
            title: 'Variant feature coming soon!',
            description: `${variantType} variant will be generated based on your configuration.`,
          });
        }}
      />

      <CalculatorUpgradeModal
        open={calculatorUpgradeOpen}
        onOpenChange={setCalculatorUpgradeOpen}
        onAddCalculator={handleAddCalculator}
        industry={consultation?.industry}
      />

      {/* Usage Tracking Modals */}
      <ActionConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setPendingAction(null);
        }}
        onConfirm={handleConfirmAction}
        actionType={pendingAction?.type || 'section_regeneration'}
        actionCost={pendingAction?.cost || 1}
        remaining={aiActions.available}
        dontShowAgain={aiActions.dontShowConfirm}
        onDontShowAgainChange={aiActions.setDontShowConfirm}
      />

      <ZeroBalanceModal
        isOpen={zeroBalanceModalOpen}
        onClose={() => setZeroBalanceModalOpen(false)}
        onRequestGrace={aiActions.requestGraceActions}
        graceAlreadyUsed={aiActions.usage?.grace_actions_given || false}
      />

      <UsageHistoryModal
        isOpen={usageHistoryOpen}
        onClose={() => setUsageHistoryOpen(false)}
        usageLog={aiActions.usageLog}
        available={aiActions.available}
        limit={aiActions.limit}
        rollover={aiActions.usage?.ai_actions_rollover || 0}
        isPro={aiActions.isPro}
        daysUntilReset={aiActions.daysUntilReset}
      />

      {showLowBalanceAlert && aiActions.isLowBalance && !aiActions.isZeroBalance && (
        <LowBalanceAlert
          remaining={aiActions.available}
          onUpgrade={() => setUpgradeDrawerOpen(true)}
          onDismiss={() => setShowLowBalanceAlert(false)}
        />
      )}

      <UpgradeDrawer
        open={upgradeDrawerOpen}
        onOpenChange={setUpgradeDrawerOpen}
        currentPlan={credits.plan}
        currentUsage={{ used: credits.used, total: credits.total }}
        onSelectPlan={(planId) => {
          console.log('Selected plan:', planId);
          // TODO: Connect to Stripe checkout
          toast({
            title: "Redirecting to checkout...",
            description: `Upgrading to ${planId} plan`,
          });
        }}
        onPurchaseActions={(amount) => {
          console.log('Purchase actions:', amount);
          // TODO: Connect to Stripe checkout
          toast({
            title: "Redirecting to checkout...",
            description: `Purchasing ${amount} actions`,
          });
        }}
      />

{/* AI Consultant Panel - slides in from right when suggestions available */}
      <ConsultantPanel
        isOpen={consultantIntegration.isOpen}
        isLoading={consultantIntegration.isLoading}
        summary={consultantIntegration.summary}
        suggestions={consultantIntegration.suggestions}
        onAccept={consultantIntegration.acceptSuggestion}
        onSkip={consultantIntegration.skipSuggestion}
        onAcceptAll={consultantIntegration.acceptAll}
        onDismiss={consultantIntegration.dismiss}
      />

      {/* Premium AI Consultant Chat - floating bottom right, hidden when Strategy Brief is open */}
      {!strategyBriefOpen && (
        <ConsultantChat
          consultationData={strategicData?.consultationData || consultation || {}}
          sections={sections}
          completeness={pageBuilder.completeness}
          onApplyChange={handleApplyConsultantChange}
        />
      )}

      {/* Achievement Share Modal */}
      <Dialog open={showAchievementModal} onOpenChange={setShowAchievementModal}>
        <DialogContent className="max-w-lg p-0 overflow-hidden bg-gradient-to-br from-background to-muted border-2 border-primary/20">
          <ShareableAchievementCard
            completeness={pageBuilder.completeness}
            brandName={strategicData?.consultationData?.businessName || consultation?.industry || 'Your Brand'}
            logoUrl={strategicData?.brandSettings?.logoUrl || strategicData?.consultationData?.websiteIntelligence?.logoUrl}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
