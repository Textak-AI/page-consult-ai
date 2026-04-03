import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Globe, Image, FileText, Palette, ArrowRight, 
  Upload, Check, Loader2, Monitor, Smartphone,
  ChevronDown, ChevronUp, X, Sparkles, Brain, Eye
} from 'lucide-react';
import { StyleInspirationInput } from '@/components/styleIntelligence';
import type { StyleInspiration } from '@/lib/styleIntelligence';
import { Button } from '@/components/ui/button';
import { CuratedFontSelect, CURATED_HEADING_FONTS, CURATED_BODY_FONTS, loadCuratedFonts, type CuratedFontOption } from '@/components/brand/CuratedFontSelect';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getNextStep, updateFlowState } from '@/services/flowEngine';
import { CommunicationStyleCard } from '@/components/brand/CommunicationStyleCard';
import { intelligenceConcierge, type IntelligenceAccumulator, type BrandData } from '@/lib/intelligenceConcierge';
import { ProgressRail } from '@/components/flow/ProgressRail';
import type { FlowState } from '@/hooks/useFlowNavigation';

// ===== Helper: Persist brand data to all storage locations =====
function persistBrandDataToStorage(brandData: {
  logo: string | null;
  colors: { primary: string; secondary: string; accent: string };
  companyName: string;
  tagline: string;
  websiteUrl: string;
  fontSettings?: Record<string, string>;
  extractionResults?: any;
  communicationStyle?: any;
  styleInspiration?: any;
}) {
  console.log('💾 [BrandSetup] Persisting brand data to storage:', {
    logo: brandData.logo ? '(present)' : null,
    primary: brandData.colors.primary,
    companyName: brandData.companyName,
  });

  // 1. Save to pageconsult_brand_data
  const dataToSave = {
    websiteUrl: brandData.websiteUrl,
    logo: brandData.logo,
    companyName: brandData.companyName,
    tagline: brandData.tagline,
    colors: brandData.colors,
    fontSettings: brandData.fontSettings,
    extractionResults: brandData.extractionResults,
    communicationStyle: brandData.communicationStyle,
    styleInspiration: brandData.styleInspiration,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem('pageconsult_brand_data', JSON.stringify(dataToSave));

  // 2. Update pageconsult_intelligence_accumulator with brand data
  try {
    const existingAccumulator = JSON.parse(
      localStorage.getItem('pageconsult_intelligence_accumulator') || '{}'
    );
    
    const updatedAccumulator = {
      ...existingAccumulator,
      brandSettings: {
        ...(existingAccumulator.brandSettings || {}),
        logoUrl: brandData.logo || null,
        primaryColor: brandData.colors.primary,
        secondaryColor: brandData.colors.secondary,
        accentColor: brandData.colors.accent,
        companyName: brandData.companyName,
      },
      websiteIntelligence: {
        ...(existingAccumulator.websiteIntelligence || {}),
        logo: brandData.logo || null,
        logoUrl: brandData.logo || null,
        colors: {
          primary: brandData.colors.primary,
          secondary: brandData.colors.secondary,
          accent: brandData.colors.accent,
        },
        companyName: brandData.companyName,
        tagline: brandData.tagline,
      },
      updatedAt: new Date().toISOString(),
    };
    
    console.log('🧠 [BrandSetup] Updating accumulator brandSettings:', {
      logoUrl: updatedAccumulator.brandSettings.logoUrl ? '(present)' : null,
      primaryColor: updatedAccumulator.brandSettings.primaryColor,
    });
    
    localStorage.setItem('pageconsult_intelligence_accumulator', JSON.stringify(updatedAccumulator));
  } catch (accError) {
    console.warn('🧠 [BrandSetup] Failed to update accumulator:', accError);
  }

  // 3. Update pageconsult_consultation_data if it exists
  try {
    const existingConsultation = JSON.parse(
      localStorage.getItem('pageconsult_consultation_data') || '{}'
    );
    
    if (Object.keys(existingConsultation).length > 0) {
      existingConsultation.brandSettings = {
        ...(existingConsultation.brandSettings || {}),
        logoUrl: brandData.logo || null,
        primaryColor: brandData.colors.primary,
        secondaryColor: brandData.colors.secondary,
        accentColor: brandData.colors.accent,
        companyName: brandData.companyName,
      };
      existingConsultation.websiteIntelligence = {
        ...(existingConsultation.websiteIntelligence || {}),
        logo: brandData.logo || null,
        logoUrl: brandData.logo || null,
        primaryColor: brandData.colors.primary,
        secondaryColor: brandData.colors.secondary,
        companyName: brandData.companyName,
      };
      localStorage.setItem('pageconsult_consultation_data', JSON.stringify(existingConsultation));
      console.log('📋 [BrandSetup] Updated pageconsult_consultation_data with brand settings');
    }
  } catch (consultError) {
    console.warn('📋 [BrandSetup] Failed to update consultation data:', consultError);
  }
}

interface CommunicationStyle {
  tone: { descriptors: string[]; primary: string };
  voice: { pov: string; addressesReader: boolean; sentenceStyle: string };
  vocabulary: { favoredWords: string[]; avoidedPatterns: string[] };
  formality: { level: number; description: string };
}

const FONT_OPTIONS = [
  'Inter',
  'Plus Jakarta Sans', 
  'DM Sans',
  'Outfit',
  'Space Grotesk',
  'Sora',
  'Playfair Display',
  'Montserrat',
  'Nunito Sans',
  'IBM Plex Mono',
  'IBM Plex Sans',
  'Source Sans Pro',
  'Lato',
];

const DEFAULT_COLORS = {
  primary: '#7C3AED',
  secondary: '#4F46E5',
  accent: '#06B6D4',
};

// Font matching map: proprietary fonts to Google Font equivalents
const fontMatchMap: Record<string, { match: string; similarity: string }> = {
  // Geometric Sans
  'sohne': { match: 'Inter', similarity: 'Very close - clean geometric sans' },
  'sohne-var': { match: 'Inter', similarity: 'Very close - clean geometric sans' },
  'circular': { match: 'DM Sans', similarity: 'Similar rounded geometric' },
  'product sans': { match: 'Plus Jakarta Sans', similarity: 'Similar Google-style geometric' },
  'sf pro': { match: 'Inter', similarity: 'Similar system UI font' },
  'sf pro display': { match: 'Plus Jakarta Sans', similarity: 'Similar display weight' },
  
  // Humanist Sans  
  'proxima nova': { match: 'Montserrat', similarity: 'Similar humanist proportions' },
  'avenir': { match: 'Nunito Sans', similarity: 'Similar geometric humanist' },
  'gotham': { match: 'Montserrat', similarity: 'Similar geometric structure' },
  'helvetica neue': { match: 'Inter', similarity: 'Similar neutral sans' },
  'arial': { match: 'Inter', similarity: 'Similar neutral sans' },
  
  // Modern Sans
  'futura': { match: 'Outfit', similarity: 'Similar geometric modern' },
  'century gothic': { match: 'Outfit', similarity: 'Similar geometric style' },
  'brandon grotesque': { match: 'DM Sans', similarity: 'Similar friendly geometric' },
  
  // Serif
  'georgia': { match: 'Playfair Display', similarity: 'Similar traditional serif' },
  'times new roman': { match: 'Playfair Display', similarity: 'Similar classic serif' },
  
  // Monospace
  'source code pro': { match: 'IBM Plex Mono', similarity: 'Same category - code font' },
  'sourcecodepro': { match: 'IBM Plex Mono', similarity: 'Same category - code font' },
  'fira code': { match: 'IBM Plex Mono', similarity: 'Similar code font' },
  'monaco': { match: 'IBM Plex Mono', similarity: 'Similar monospace' },
};

// Function to find best font match
const findFontMatch = (detectedFont: string): { original: string; match: string; similarity: string } | null => {
  const normalized = detectedFont.toLowerCase().replace(/-/g, ' ').trim();
  
  for (const [key, value] of Object.entries(fontMatchMap)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return { original: detectedFont, ...value };
    }
  }
  
  return null;
};

interface ExtractionResults {
  logoUrl: string | null;
  colors: string[];
  companyName: string | null;
  tagline: string | null;
  pageCopy?: string | null;
  industry?: string | null;
}

export default function EnhancedBrandSetup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  
  console.log('📂 [EnhancedBrandSetup] Component rendering, sessionId:', sessionId);
  
  // Demo session state
  const [demoSession, setDemoSession] = useState<any>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(!!sessionId);
  const [sessionNotFound, setSessionNotFound] = useState(false);
  
  // State
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractionResults, setExtractionResults] = useState<ExtractionResults | null>(null);
  const [extractionSuccess, setExtractionSuccess] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [colors, setColors] = useState(DEFAULT_COLORS);
  const [fontSettings, setFontSettings] = useState({
    h1: 'Inter',
    h2: 'Inter',
    h3: 'Inter',
    body: 'Inter',
    small: 'Inter'
  });
  const [brandGuide, setBrandGuide] = useState<File | null>(null);
  const [skipBrandGuide, setSkipBrandGuide] = useState(false);
  const [isExtractingBrief, setIsExtractingBrief] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [logoBackground, setLogoBackground] = useState<'dark' | 'light' | 'check'>('light');
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(true);
  const [companyName, setCompanyName] = useState('Your Company');
  const [tagline, setTagline] = useState('Your compelling tagline goes here');
  
  // Communication style state
  const [communicationStyle, setCommunicationStyle] = useState<CommunicationStyle | null>(null);
  const [styleLoading, setStyleLoading] = useState(false);
  
  // Intelligence Accumulator state
  const [accumulator, setAccumulator] = useState<IntelligenceAccumulator | null>(null);
  
  // localStorage intelligence state (from demo session)
  const [localStorageIntelligence, setLocalStorageIntelligence] = useState<{
    industry: string | null;
    audience: string | null;
    valueProp: string | null;
    competitorDifferentiator: string | null;
    painPoints: string | null;
    buyerObjections: string | null;
    proofElements: string | null;
    businessName?: string | null;
    targetMarket?: string | null;
  } | null>(null);
  
  // Track if brand guide has set colors (takes priority over website extraction)
  const [colorsFromBrandGuide, setColorsFromBrandGuide] = useState(false);
  
  // Style inspiration state (from reference websites)
  const [styleInspiration, setStyleInspiration] = useState<StyleInspiration | null>(null);

  // ===== CRITICAL: Restore saved brand data on mount =====
  useEffect(() => {
    try {
      const savedBrand = localStorage.getItem('pageconsult_brand_data');
      if (savedBrand && savedBrand !== 'undefined' && savedBrand !== 'null') {
        const parsed = JSON.parse(savedBrand);
        console.log('📂 [BrandSetup] Restoring saved brand data:', {
          logo: parsed.logo ? '(present)' : null,
          primary: parsed.colors?.primary,
          companyName: parsed.companyName,
          hasExtraction: !!parsed.extractionResults
        });
        
        // Only restore if we have actual brand data (not defaults)
        if (parsed.logo) {
          setLogo(parsed.logo);
        }
        if (parsed.colors?.primary && parsed.colors.primary !== DEFAULT_COLORS.primary) {
          setColors(parsed.colors);
        }
        if (parsed.companyName && parsed.companyName !== 'Your Company') {
          setCompanyName(parsed.companyName);
        }
        if (parsed.tagline && parsed.tagline !== 'Your compelling tagline goes here') {
          setTagline(parsed.tagline);
        }
        if (parsed.extractionResults) {
          setExtractionResults(parsed.extractionResults);
          setExtractionSuccess(true);
        }
        if (parsed.communicationStyle) {
          setCommunicationStyle(parsed.communicationStyle);
        }
        if (parsed.fontSettings) {
          setFontSettings(parsed.fontSettings);
        }
        if (parsed.websiteUrl) {
          setWebsiteUrl(parsed.websiteUrl);
        }
        if (parsed.styleInspiration) {
          setStyleInspiration(parsed.styleInspiration);
        }
      }
    } catch (e) {
      console.warn('📂 [BrandSetup] Failed to restore saved brand data:', e);
    }
  }, []);

  // Load localStorage intelligence on mount (demo session data)
  useEffect(() => {
    try {
      const storedData = localStorage.getItem('pageconsult_demo_extracted');
      if (storedData && storedData !== 'undefined' && storedData !== 'null') {
        const parsed = JSON.parse(storedData);
        if (parsed && typeof parsed === 'object') {
          console.log('🧠 [Brand Setup] Loaded localStorage intelligence:', parsed);
          setLocalStorageIntelligence(parsed);
          
          // Also pre-fill company name and tagline from localStorage if not already set
          if (parsed.businessName && companyName === 'Your Company') {
            setCompanyName(parsed.businessName);
          }
          if (parsed.valueProp && tagline === 'Your compelling tagline goes here') {
            setTagline(parsed.valueProp);
          }
        }
      }
    } catch (e) {
      console.warn('🧠 [Brand Setup] Failed to parse localStorage intelligence:', e);
    }
  }, []);
  
  // Load accumulator on mount
  useEffect(() => {
    const loadAccumulator = async () => {
      const consultationId = searchParams.get('consultationId');
      if (consultationId) {
        const acc = await intelligenceConcierge.getBySessionId(consultationId);
        if (acc) {
          setAccumulator(acc);
          console.log('🧠 [Brand Setup] Loaded accumulator:', acc.completionStage);
        }
      }
    };
    loadAccumulator();
  }, [searchParams]);

  // ===== CRITICAL: Save brand data on unmount to prevent data loss =====
  useEffect(() => {
    return () => {
      const data = brandDataRef.current;
      // Check if we have any non-default data worth saving using ref
      const hasLogo = data.logo && data.logo.length > 0;
      const hasCustomColors = data.colors.primary !== DEFAULT_COLORS.primary || 
                              data.colors.secondary !== DEFAULT_COLORS.secondary;
      const hasCustomCompanyName = data.companyName !== 'Your Company';
      const hasWebsite = data.websiteUrl && data.websiteUrl.length > 0;
      
      if (hasLogo || hasCustomColors || hasCustomCompanyName || hasWebsite) {
        console.log('🚪 [BrandSetup] Component unmounting, saving brand data...');
        persistBrandDataToStorage({
          logo: data.logo,
          colors: data.colors,
          companyName: data.companyName,
          tagline: data.tagline,
          websiteUrl: data.websiteUrl,
          fontSettings: data.fontSettings,
          extractionResults: data.extractionResults || undefined,
          communicationStyle: data.communicationStyle || undefined,
          styleInspiration: data.styleInspiration || undefined,
        });
      }
    };
    // Empty deps is correct - we use ref to capture latest state
  }, []);

  // Load demo session if session param exists, OR load consultation data
  // Also check if brand setup should be skipped (user already has brand data + brief generated)
  useEffect(() => {
    const loadSessionData = async () => {
      const consultationId = searchParams.get('consultationId');
      const sessionParam = searchParams.get('session') || sessionId;
      const idToLoad = consultationId || sessionParam;
      
      if (!idToLoad) {
        setIsLoadingSession(false);
        return;
      }
      
      console.log('📂 [EnhancedBrandSetup] Loading data for:', { consultationId, sessionParam, idToLoad });
      
      // Try consultations table first
      let { data: consultationData, error: consultationError } = await supabase
        .from('consultations')
        .select('*')
        .eq('id', idToLoad)
        .maybeSingle();
      
      if (consultationData) {
        console.log('✅ [EnhancedBrandSetup] Consultation loaded:', {
          hasIntelligence: !!consultationData.extracted_intelligence,
          businessName: consultationData.business_name,
          industry: consultationData.industry,
          flowState: consultationData.flow_state,
          hasBrief: !!consultationData.strategy_brief,
        });
        
        const intel = consultationData.extracted_intelligence as any;
        
        // GUARD: Check if brand setup should be skipped
        // Skip if: has strategy_brief AND (has website_url OR has logo in intel OR flow_state indicates completion)
        const hasBrief = !!consultationData.strategy_brief;
        const hasBrandData = !!(consultationData.website_url || intel?.logoUrl || intel?.colors);
        const flowAllowsSkip = ['brief_generated', 'page_generated', 'published'].includes(consultationData.flow_state || '');
        
        if (hasBrief && hasBrandData && flowAllowsSkip) {
          console.log('📂 [EnhancedBrandSetup] Brand data exists & brief generated, skipping to pre_page huddle');
          navigate(`/huddle?type=pre_page&consultationId=${consultationId}`, { replace: true });
          return;
        }
        
        // Pre-fill company name
        const companyFromData = consultationData.business_name;
        
        if (companyFromData) {
          setCompanyName(companyFromData);
        } else if (intel?.companyName || intel?.businessName) {
          setCompanyName(intel.companyName || intel.businessName);
        }
        
        // Pre-fill tagline from unique value
        if (consultationData.unique_value) {
          setTagline(consultationData.unique_value);
        } else if (intel?.valueProp || intel?.uniqueValue) {
          setTagline(intel.valueProp || intel.uniqueValue);
        }
        
        // Pre-fill website URL if available
        let foundWebsiteUrl = consultationData.website_url || intel?.websiteUrl;
        
        // Pre-fill logo if available
        if (intel?.logoUrl) {
          setLogo(intel.logoUrl);
        }
        
        // Pre-fill colors if available
        if (intel?.colors && Array.isArray(intel.colors) && intel.colors.length > 0) {
          setColors({
            primary: intel.colors[0] || DEFAULT_COLORS.primary,
            secondary: intel.colors[1] || intel.colors[0] || DEFAULT_COLORS.secondary,
            accent: intel.colors[2] || intel.colors[1] || DEFAULT_COLORS.accent,
          });
        }
        
        // FALLBACK: If no websiteUrl found but consultation has guest_session_id, 
        // try to load demo_sessions record to extract URL from conversation
        if (!foundWebsiteUrl && consultationData.guest_session_id) {
          console.log('📂 [EnhancedBrandSetup] No websiteUrl in consultation, checking demo_sessions via guest_session_id...');
          
          const { data: demoFallback } = await supabase
            .from('demo_sessions')
            .select('messages, extracted_intelligence')
            .eq('id', consultationData.guest_session_id)
            .maybeSingle();
          
          if (demoFallback) {
            const demoIntel = demoFallback.extracted_intelligence as any;
            foundWebsiteUrl = demoIntel?.websiteUrl;
            
            // Extract URL from conversation messages as last resort
            if (!foundWebsiteUrl && demoFallback.messages && Array.isArray(demoFallback.messages)) {
              const urlRegex = /(https?:\/\/[^\s]+)|([a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi;
              for (const msg of demoFallback.messages as any[]) {
                if (msg.role === 'user' && msg.content) {
                  const matches = msg.content.match(urlRegex);
                  if (matches && matches.length > 0) {
                    foundWebsiteUrl = matches[0].startsWith('http') ? matches[0] : `https://${matches[0]}`;
                    console.log('🔗 [EnhancedBrandSetup] Extracted URL from demo conversation:', foundWebsiteUrl);
                    break;
                  }
                }
              }
            }
            
            // Pre-fill logo from demo if not already set
            if (!logo && demoIntel?.logoUrl) {
              setLogo(demoIntel.logoUrl);
            }
            
            // Pre-fill colors from demo if still defaults
            if (demoIntel?.colors && Array.isArray(demoIntel.colors) && demoIntel.colors.length > 0) {
              if (colors.primary === DEFAULT_COLORS.primary) {
                setColors({
                  primary: demoIntel.colors[0] || DEFAULT_COLORS.primary,
                  secondary: demoIntel.colors[1] || demoIntel.colors[0] || DEFAULT_COLORS.secondary,
                  accent: demoIntel.colors[2] || demoIntel.colors[1] || DEFAULT_COLORS.accent,
                });
              }
            }
            
            // Pre-fill company name from demo if not set
            if (!companyFromData && (demoIntel?.companyName || demoIntel?.businessName)) {
              setCompanyName(demoIntel.companyName || demoIntel.businessName);
            }
          }
        }
        
        if (foundWebsiteUrl) {
          setWebsiteUrl(foundWebsiteUrl);
        }
        
        setIsLoadingSession(false);
        return;
      }
      
      // Fallback: check demo_sessions table
      console.log('📂 [EnhancedBrandSetup] Not in consultations, checking demo_sessions...', {
        idToLoad,
        sessionIdFromUrl: sessionId,
        consultationIdFromUrl: searchParams.get('consultationId'),
      });
      
      const { data: demoData, error: demoError } = await supabase
        .from('demo_sessions')
        .select('*')
        .eq('session_id', idToLoad)
        .maybeSingle();

      // Log the query result for debugging
      console.log('📂 [EnhancedBrandSetup] Demo query result:', {
        hasData: !!demoData,
        error: demoError?.message || null,
        errorCode: demoError?.code || null,
        dataId: demoData?.id || null,
      });

      if (demoData) {
        console.log('✅ [EnhancedBrandSetup] Demo session loaded:', {
          hasIntelligence: !!demoData.extracted_intelligence,
          readiness: demoData.readiness,
          claimedBy: demoData.claimed_by,
        });
        setDemoSession(demoData);
        
        // Pre-fill company name from intelligence if available
        const intel = demoData.extracted_intelligence as any;
        if (intel?.companyName || intel?.businessName) {
          setCompanyName(intel.companyName || intel.businessName);
        }
        if (intel?.valueProp || intel?.uniqueValue) {
          setTagline(intel.valueProp || intel.uniqueValue);
        }
        
        // Pre-fill website URL - check intelligence first, then extract from conversation
        let extractedUrl = intel?.websiteUrl;
        if (!extractedUrl && demoData.messages && Array.isArray(demoData.messages)) {
          // Extract URL from conversation messages as fallback
          const urlRegex = /(https?:\/\/[^\s]+)|([a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi;
          for (const msg of demoData.messages as any[]) {
            if (msg.role === 'user' && msg.content) {
              const matches = msg.content.match(urlRegex);
              if (matches && matches.length > 0) {
                extractedUrl = matches[0].startsWith('http') ? matches[0] : `https://${matches[0]}`;
                console.log('🔗 [EnhancedBrandSetup] Extracted URL from conversation:', extractedUrl);
                break;
              }
            }
          }
        }
        if (extractedUrl) {
          setWebsiteUrl(extractedUrl);
        }
        
        // Pre-fill logo if available
        if (intel?.logoUrl) {
          setLogo(intel.logoUrl);
        }
        
        // Pre-fill colors if available
        if (intel?.colors && Array.isArray(intel.colors) && intel.colors.length > 0) {
          setColors({
            primary: intel.colors[0] || DEFAULT_COLORS.primary,
            secondary: intel.colors[1] || intel.colors[0] || DEFAULT_COLORS.secondary,
            accent: intel.colors[2] || intel.colors[1] || DEFAULT_COLORS.accent,
          });
          console.log('🎨 [EnhancedBrandSetup] Pre-filled colors from intelligence:', intel.colors);
        }
      } else {
        console.error('❌ [EnhancedBrandSetup] Not found in either table:', { 
          consultationError: consultationError?.message, 
          demoError: demoError?.message,
          demoErrorCode: demoError?.code,
          idToLoad,
        });
        // Only set sessionNotFound if we were explicitly given a session ID to load
        if (sessionId || searchParams.get('consultationId')) {
          setSessionNotFound(true);
        }
      }
      
      setIsLoadingSession(false);
    };

    loadSessionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);
  
  // Font matching states
  const [fontMatches, setFontMatches] = useState<{
    heading: { original: string; match: string; similarity: string } | null;
    body: { original: string; match: string; similarity: string } | null;
  }>({ heading: null, body: null });
  
  const [detectedFonts, setDetectedFonts] = useState<{
    heading: string | null;
    body: string | null;
  }>({ heading: null, body: null });
  
  const [customFonts, setCustomFonts] = useState<{
    heading: { name: string; url: string } | null;
    body: { name: string; url: string } | null;
  }>({ heading: null, body: null });

  // Standard font options from curated lists
  const STANDARD_HEADING_FONTS = CURATED_HEADING_FONTS.map(f => f.value);
  const STANDARD_BODY_FONTS = CURATED_BODY_FONTS.map(f => f.value);
  
  // Load curated fonts on mount
  useEffect(() => {
    loadCuratedFonts();
  }, []);

  // Dynamic custom font options (for detected/matched/uploaded fonts)
  const customHeadingFonts = useMemo((): CuratedFontOption[] => {
    const options: CuratedFontOption[] = [];
    
    // Add custom uploaded font first
    if (customFonts.heading) {
      options.push({ 
        value: customFonts.heading.name, 
        label: customFonts.heading.name,
        description: 'Your uploaded font',
        category: 'uploaded'
      });
    }
    
    return options;
  }, [customFonts.heading]);

  const customBodyFonts = useMemo((): CuratedFontOption[] => {
    const options: CuratedFontOption[] = [];
    
    // Add custom uploaded font first
    if (customFonts.body) {
      options.push({ 
        value: customFonts.body.name, 
        label: customFonts.body.name,
        description: 'Your uploaded font',
        category: 'uploaded'
      });
    }
    
    return options;
  }, [customFonts.body]);

  // Keep legacy headingFontOptions/bodyFontOptions for compatibility with existing code paths
  const headingFontOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    
    if (customFonts.heading) {
      options.push({ value: customFonts.heading.name, label: `${customFonts.heading.name} (uploaded)` });
    }
    
    if (fontMatches.heading && !options.some(o => o.value === fontMatches.heading?.match)) {
      options.push({ value: fontMatches.heading.match, label: `${fontMatches.heading.match} (matches ${fontMatches.heading.original})` });
    }
    
    if (detectedFonts.heading && !STANDARD_HEADING_FONTS.includes(detectedFonts.heading) && !options.some(o => o.value === detectedFonts.heading)) {
      options.push({ value: detectedFonts.heading, label: `${detectedFonts.heading} (detected)` });
    }
    
    STANDARD_HEADING_FONTS.forEach(font => {
      if (!options.some(o => o.value === font)) {
        options.push({ value: font, label: font });
      }
    });
    
    return options;
  }, [customFonts.heading, fontMatches.heading, detectedFonts.heading, STANDARD_HEADING_FONTS]);

  const bodyFontOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    
    if (customFonts.body) {
      options.push({ value: customFonts.body.name, label: `${customFonts.body.name} (uploaded)` });
    }
    
    if (fontMatches.body && !options.some(o => o.value === fontMatches.body?.match)) {
      options.push({ value: fontMatches.body.match, label: `${fontMatches.body.match} (matches ${fontMatches.body.original})` });
    }
    
    if (detectedFonts.body && !STANDARD_BODY_FONTS.includes(detectedFonts.body) && !options.some(o => o.value === detectedFonts.body)) {
      options.push({ value: detectedFonts.body, label: `${detectedFonts.body} (detected)` });
    }
    
    STANDARD_BODY_FONTS.forEach(font => {
      if (!options.some(o => o.value === font)) {
        options.push({ value: font, label: font });
      }
    });
    
    return options;
  }, [customFonts.body, fontMatches.body, detectedFonts.body, STANDARD_BODY_FONTS]);

  // Load detected fonts from Google Fonts
  useEffect(() => {
    const fontsToLoad: string[] = [];
    
    if (detectedFonts.heading && !customFonts.heading) {
      fontsToLoad.push(detectedFonts.heading);
    }
    if (detectedFonts.body && detectedFonts.body !== detectedFonts.heading && !customFonts.body) {
      fontsToLoad.push(detectedFonts.body);
    }
    
    if (fontsToLoad.length > 0) {
      const families = fontsToLoad.map(f => f.replace(/ /g, '+')).join('&family=');
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${families}:wght@400;500;600;700&display=swap`;
      link.rel = 'stylesheet';
      link.id = 'detected-fonts-loader';
      
      // Remove existing if present
      const existing = document.getElementById('detected-fonts-loader');
      if (existing) existing.remove();
      
      document.head.appendChild(link);
    }
  }, [detectedFonts, customFonts]);

  // Track if auto-extraction has been triggered
  const [autoExtractTriggered, setAutoExtractTriggered] = useState(false);
  
  // Store pending URL for auto-extraction (will be processed after handleAnalyzeWebsite is defined)
  const pendingAutoExtractRef = useRef<string | null>(null);
  
  // Ref to capture latest brand data for save-on-unmount (avoids stale closure issue)
  const brandDataRef = useRef<{
    logo: string | null;
    colors: typeof DEFAULT_COLORS;
    companyName: string;
    tagline: string;
    websiteUrl: string;
    fontSettings: typeof fontSettings;
    extractionResults: ExtractionResults | null;
    communicationStyle: CommunicationStyle | null;
    styleInspiration: StyleInspiration | null;
  }>({
    logo: null,
    colors: DEFAULT_COLORS,
    companyName: 'Your Company',
    tagline: 'Your compelling tagline goes here',
    websiteUrl: '',
    fontSettings: { h1: 'Inter', h2: 'Inter', h3: 'Inter', body: 'Inter', small: 'Inter' },
    extractionResults: null,
    communicationStyle: null,
    styleInspiration: null,
  });
  
  // Keep brandDataRef in sync with state
  useEffect(() => {
    brandDataRef.current = {
      logo,
      colors,
      companyName,
      tagline,
      websiteUrl,
      fontSettings,
      extractionResults,
      communicationStyle,
      styleInspiration,
    };
  }, [logo, colors, companyName, tagline, websiteUrl, fontSettings, extractionResults, communicationStyle, styleInspiration]);

  // Check if we should queue auto-extraction
  useEffect(() => {
    // Only run once per session and when data is ready
    if (autoExtractTriggered || isLoadingSession || isAnalyzing) return;
    
    // Check if we have a URL but no brand data
    const hasUrl = websiteUrl && websiteUrl.trim().length > 0;
    const hasLogo = logo && logo !== '';
    const hasCustomColors = colors.primary !== DEFAULT_COLORS.primary;
    
    // If we have a URL but no logo or custom colors, queue extraction
    if (hasUrl && !hasLogo && !hasCustomColors) {
      console.log('🚀 [EnhancedBrandSetup] Queuing auto-extraction for:', websiteUrl);
      pendingAutoExtractRef.current = websiteUrl;
      setAutoExtractTriggered(true);
    }
  }, [websiteUrl, logo, colors, isLoadingSession, autoExtractTriggered, isAnalyzing]);

  // Calculate brand completeness
  const brandCompleteness = useMemo(() => {
    let score = 0;
    // Company/website info
    if (websiteUrl || extractionResults?.companyName || companyName !== 'Your Company') score += 20;
    // Logo
    if (logo) score += 25;
    // Colors (check if any color differs from defaults)
    if (colors.primary !== DEFAULT_COLORS.primary || 
        colors.secondary !== DEFAULT_COLORS.secondary || 
        colors.accent !== DEFAULT_COLORS.accent) score += 20;
    // Typography (check if any font differs from default)
    const hasCustomFonts = Object.values(fontSettings).some(f => f !== 'Inter');
    if (hasCustomFonts) score += 15;
    // Brand guide
    if (brandGuide || skipBrandGuide) score += 20;
    return Math.min(score, 100);
  }, [websiteUrl, extractionResults, logo, colors, fontSettings, brandGuide, skipBrandGuide, companyName]);

  // Handle website analysis
  const handleAnalyzeWebsite = async () => {
    if (!websiteUrl.trim()) {
      toast.error('Please enter a website URL');
      return;
    }

    setIsAnalyzing(true);
    setExtractionError(null);
    try {
      let formattedUrl = websiteUrl.trim();
      if (!formattedUrl.startsWith('http')) {
        formattedUrl = `https://${formattedUrl}`;
      }

      const response = await supabase.functions.invoke('extract-website-intelligence', {
        body: { url: formattedUrl }
      });

      console.log('[BrandSetup] Full extraction response:', response);
      console.log('[BrandSetup] Response data:', response.data);

      if (response.error) throw response.error;

      // Handle response - edge function returns { success: true, companyName, logoUrl, brandColors, primary, secondary, accent, ... }
      // Also support legacy nested format: { success: true, data: { ... } }
      const extracted = response.data?.data || response.data;
      
      if (extracted?.success !== false && extracted) {
        console.log('[BrandSetup] Extracted data:', extracted);
        console.log('[BrandSetup] Colors in response:', {
          primary: extracted.primary,
          secondary: extracted.secondary,
          accent: extracted.accent,
          brandColors: extracted.brandColors,
          extractedFonts: extracted.extractedFonts,
          fonts: extracted.fonts,
        });

        // Set logo
        if (extracted.logoUrl) {
          setLogo(extracted.logoUrl);
          console.log('[BrandSetup] Logo set:', extracted.logoUrl);
        }

        // Set colors - use the new enhanced primary/secondary/accent fields first
        // Only apply website colors if brand guide hasn't set them
        if (!colorsFromBrandGuide) {
          // Priority: new direct fields > brandColors array > defaults
          const primary = extracted.primary || (extracted.brandColors?.[0]) || null;
          const secondary = extracted.secondary || (extracted.brandColors?.[1]) || null;
          const accent = extracted.accent || (extracted.brandColors?.[2]) || null;
          
          console.log('[BrandSetup] Applying extracted colors:', { primary, secondary, accent });
          
          if (primary || secondary || accent) {
            setColors({
              primary: primary || DEFAULT_COLORS.primary,
              secondary: secondary || primary || DEFAULT_COLORS.secondary,
              accent: accent || secondary || DEFAULT_COLORS.accent,
            });
          }
        } else {
          console.log('[BrandSetup] Skipping website colors - brand guide takes priority');
        }

        // Set company name - try to extract from title "Home - Envita" → "Envita"
        let name = extracted.companyName;
        if (extracted.title && extracted.title.includes(' - ')) {
          name = extracted.title.split(' - ').pop() || name;
        }
        if (name && name !== 'Home') {
          setCompanyName(name);
          console.log('[BrandSetup] Company name set:', name);
        }

        // Store tagline for use in preview
        if (extracted.tagline) {
          setTagline(extracted.tagline);
          console.log('[BrandSetup] Tagline set:', extracted.tagline);
        }

        // Apply fonts if found - with intelligent matching
        // Support both new extractedFonts and legacy fonts structure
        const fontsData = extracted.extractedFonts || extracted.fonts;
        if (fontsData) {
          console.log('[BrandSetup] Applying extracted fonts:', fontsData);
          
          const headingMatch = fontsData.heading ? findFontMatch(fontsData.heading) : null;
          const bodyMatch = fontsData.body ? findFontMatch(fontsData.body) : null;
          
          setFontMatches({ heading: headingMatch, body: bodyMatch });
          
          setDetectedFonts({
            heading: fontsData.heading || null,
            body: fontsData.body || null
          });
          
          // Use matched fonts (or detected if it's a known Google Font)
          const headingFont = headingMatch?.match || (FONT_OPTIONS.includes(fontsData.heading) ? fontsData.heading : null);
          const bodyFont = bodyMatch?.match || (FONT_OPTIONS.includes(fontsData.body) ? fontsData.body : null);
          
          setFontSettings(prev => ({
            ...prev,
            ...(headingFont && { h1: headingFont, h2: headingFont, h3: headingFont }),
            ...(bodyFont && { body: bodyFont, small: bodyFont })
          }));
          
          console.log('[BrandSetup] Font matches:', { headingMatch, bodyMatch });
        }

        const results: ExtractionResults = {
          logoUrl: extracted.logoUrl || null,
          colors: extracted.brandColors || [extracted.primary, extracted.secondary, extracted.accent].filter(Boolean),
          companyName: name || null,
          tagline: extracted.tagline || extracted.description || null,
          pageCopy: extracted.pageCopy || null,
          industry: extracted.inferredIndustry || null,
        };
        setExtractionResults(results);
        setExtractionSuccess(true);

        // Trigger communication style extraction if we have enough text
        if (extracted.pageCopy && extracted.pageCopy.length >= 100) {
          extractCommunicationStyle(
            extracted.pageCopy,
            name || companyName,
            extracted.inferredIndustry || (demoSession?.extracted_intelligence as any)?.industry || ''
          );
        }

        toast.success('Website analyzed successfully!');

        // ===== CRITICAL: Persist brand data immediately after extraction =====
        // This ensures data survives navigation before handleContinue is called
        persistBrandDataToStorage({
          logo: extracted.logoUrl || logo,
          colors: {
            primary: extracted.primary || results.colors?.[0] || colors.primary,
            secondary: extracted.secondary || results.colors?.[1] || colors.secondary,
            accent: extracted.accent || results.colors?.[2] || colors.accent,
          },
          companyName: name || companyName,
          tagline: extracted.tagline || tagline,
          websiteUrl: formattedUrl,
          fontSettings,
          extractionResults: results,
          communicationStyle,
        });
        console.log('✅ [BrandSetup] Brand data persisted after extraction');
      } else {
        // Edge function returned success: false or empty data
        setExtractionError("We couldn't extract brand data from this URL automatically — some sites block this. Upload your logo below and we'll use your consultation colors.");
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setExtractionError("We couldn't extract brand data from this URL automatically — some sites block this. Upload your logo below and we'll use your consultation colors.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Effect to trigger auto-extraction after handleAnalyzeWebsite is defined
  useEffect(() => {
    if (pendingAutoExtractRef.current && !isAnalyzing) {
      console.log('🚀 [EnhancedBrandSetup] Executing queued auto-extraction for:', pendingAutoExtractRef.current);
      pendingAutoExtractRef.current = null;
      
      // Delay slightly to ensure UI is ready
      setTimeout(() => {
        handleAnalyzeWebsite();
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoExtractTriggered]);

  // Extract communication style from website copy
  const extractCommunicationStyle = async (pageCopy: string, company: string, industry: string) => {
    if (!pageCopy || pageCopy.length < 100) return;
    
    setStyleLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('extract-communication-style', {
        body: { websiteText: pageCopy, companyName: company, industry }
      });
      
      if (error) {
        console.error('Style extraction error:', error);
        return;
      }
      
      if (data?.success && data?.style) {
        setCommunicationStyle(data.style);
        console.log('✅ Communication style extracted:', data.style);
      }
    } catch (err) {
      console.error('Style extraction failed:', err);
    } finally {
      setStyleLoading(false);
    }
  };

  // Handle logo upload
  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogo(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Handle logo drop
  const handleLogoDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogo(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Handle brand guide upload
  const handleBrandGuideUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Set loading state FIRST, before setting brandGuide
    // This ensures the loading UI shows instead of the checkmark
    setIsExtractingBrief(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        
        const { data, error } = await supabase.functions.invoke('extract-brand-brief', {
          body: { 
            pdfBase64: base64,
            fileName: file.name,
          }
        });

        if (error) throw error;

        console.log('[BrandSetup] Brand brief extraction response:', data);

        // Handle nested response structure from API
        const brandBrief = data?.brandBrief || data;
        const extractedColors = brandBrief?.colors;
        const extractedTypography = brandBrief?.typography;
        const extractedVoiceTone = brandBrief?.voice_tone;

        // Update colors - handle both {hex, name} objects and direct hex strings
        if (extractedColors) {
          setColors(prev => ({
            primary: extractedColors.primary?.hex || extractedColors.primary || prev.primary,
            secondary: extractedColors.secondary?.hex || extractedColors.secondary || prev.secondary,
            accent: extractedColors.accent?.hex || extractedColors.accent || prev.accent,
          }));
          // Mark brand guide as the authoritative source for colors
          setColorsFromBrandGuide(true);
          console.log('[BrandSetup] Brand guide set as color authority');
        }

        // Update typography/font settings
        if (extractedTypography) {
          const headlineFont = extractedTypography.headlineFont || extractedTypography.heading;
          const bodyFont = extractedTypography.bodyFont || extractedTypography.body;
          
          if (headlineFont) {
            setFontSettings(prev => ({
              ...prev,
              h1: headlineFont,
              h2: headlineFont,
              h3: headlineFont,
            }));
          }
          
          if (bodyFont) {
            setFontSettings(prev => ({
              ...prev,
              body: bodyFont,
              small: bodyFont,
            }));
          }
        }

        // Update communication style from voice_tone
        if (extractedVoiceTone) {
          // Map voice_tone to communication style format if needed
          const mappedStyle: CommunicationStyle = {
            tone: {
              descriptors: extractedVoiceTone.personality || [],
              primary: extractedVoiceTone.personality?.[0] || '',
            },
            voice: {
              pov: 'first-person',
              addressesReader: true,
              sentenceStyle: 'balanced',
            },
            vocabulary: {
              favoredWords: extractedVoiceTone.doSay || [],
              avoidedPatterns: extractedVoiceTone.avoidSay || [],
            },
            formality: {
              level: 3,
              description: extractedVoiceTone.description || '',
            },
          };
          setCommunicationStyle(mappedStyle);
        }

        console.log('[BrandSetup] Applied brand brief to UI state:', { 
          colors: extractedColors, 
          typography: extractedTypography, 
          voice_tone: extractedVoiceTone 
        });

        // Set brandGuide AFTER extraction completes, then clear loading state
        setBrandGuide(file);
        toast.success('Brand guide extracted successfully!');
        setIsExtractingBrief(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Brand guide extraction error:', error);
      toast.error('Failed to extract brand guide');
      setIsExtractingBrief(false);
    }
  };

  // Handle custom font upload
  const handleFontUpload = useCallback((file: File, type: 'heading' | 'body') => {
    // Validate file type
    const validTypes = ['.woff', '.woff2', '.ttf', '.otf'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validTypes.includes(ext)) {
      toast.error('Please upload a .woff, .woff2, .ttf, or .otf file');
      return;
    }
    
    // Extract font name from filename
    const fontName = file.name.replace(/\.(woff2?|ttf|otf)$/i, '').replace(/[-_]/g, ' ');
    
    // Create object URL for preview
    const url = URL.createObjectURL(file);
    
    // Create @font-face rule
    const formatMap: Record<string, string> = {
      '.woff2': 'woff2',
      '.woff': 'woff',
      '.ttf': 'truetype',
      '.otf': 'opentype'
    };
    
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: '${fontName}';
        src: url('${url}') format('${formatMap[ext]}');
        font-weight: normal;
        font-style: normal;
      }
    `;
    document.head.appendChild(style);
    
    setCustomFonts(prev => ({ ...prev, [type]: { name: fontName, url } }));
    
    // Auto-apply to font settings
    if (type === 'heading') {
      setFontSettings(prev => ({ ...prev, h1: fontName, h2: fontName, h3: fontName }));
    } else {
      setFontSettings(prev => ({ ...prev, body: fontName, small: fontName }));
    }
    
    toast.success(`Custom ${type} font loaded: ${fontName}`);
  }, []);

  // Handle continue - save brand data before navigating
  const handleContinue = async () => {
    const brandData = {
      websiteUrl,
      logo,
      companyName,
      tagline,
      colors,
      fontSettings,
      extractionResults,
      communicationStyle,
      styleInspiration, // Include extracted style inspiration
    };
    
    localStorage.setItem('pageconsult_brand_data', JSON.stringify(brandData));
    
    // Get consultationId from URL params
    const consultationId = searchParams.get('consultationId');
    
    // 🧠 Merge brand data to accumulator if exists
    if (consultationId && accumulator) {
      try {
        const accBrandData: BrandData = {
          companyName: companyName,
          website: websiteUrl,
          logo: logo || undefined,
          colors: {
            primary: colors.primary,
            secondary: colors.secondary,
            accent: colors.accent,
          },
          fonts: {
            heading: fontSettings.h1,
            body: fontSettings.body,
          },
          extractionSource: extractionResults ? 'website' : (brandGuide ? 'upload' : 'manual'),
        };
        await intelligenceConcierge.addBrandData(consultationId, accBrandData);
        console.log('🧠 [Brand Setup] Brand data merged to accumulator');
      } catch (accError) {
        console.error('🧠 [Brand Setup] Failed to merge brand data (non-blocking):', accError);
      }
    }
    
    if (consultationId) {
      // Fetch existing extracted_intelligence to merge brand data
      const { data: existingConsultation } = await supabase
        .from('consultations')
        .select('extracted_intelligence')
        .eq('id', consultationId)
        .single();
      
      const existingIntel = (existingConsultation?.extracted_intelligence as Record<string, any>) || {};
      
      // Merge brand data into extracted_intelligence
      const updatedIntelligence = {
        ...existingIntel,
        logoUrl: logo,
        companyName: companyName,
        websiteUrl: websiteUrl,
        brandColors: {
          primary: colors.primary,
          secondary: colors.secondary,
          accent: colors.accent,
        },
        brandFonts: {
          heading: fontSettings.h1,
          body: fontSettings.body,
        },
        brandUpdatedAt: new Date().toISOString(),
      };
      
      // Save brand data and communication style to consultation
      await supabase
        .from('consultations')
        .update({ 
          communication_style: communicationStyle as any,
          business_name: companyName,
          website_url: websiteUrl,
          extracted_intelligence: updatedIntelligence,
        })
        .eq('id', consultationId);
      
      // Update flow state
      await updateFlowState(consultationId, 'brand_captured', 'brand_setup_complete');
      
      // Check if this consultation has high readiness (demo user) - go to huddle for "I listened" moment
      const { data: consultation } = await supabase
        .from('consultations')
        .select('readiness_score, strategy_brief')
        .eq('id', consultationId)
        .single();
      
      const readinessScore = consultation?.readiness_score || 0;
      
      console.log('🚀 [EnhancedBrandSetup] Brand captured:', { consultationId, readinessScore });
      
      // Always navigate to Strategy Document - the "View Your Strategy Blueprint" destination
      console.log('🚀 [EnhancedBrandSetup] Navigating to Strategy Document');
      navigate(`/strategy-document?consultationId=${consultationId}`, { replace: true });
    } else if (demoSession && sessionId) {
      // Demo session flow - need to check if we should create consultation first
      console.log('🚀 [EnhancedBrandSetup] Demo user - checking for high-readiness flow');
      
      // Check readiness from demo session
      const readiness = demoSession.readiness || 0;
      const hasIntelligence = !!demoSession.extracted_intelligence;
      
      console.log('[Demo Handoff] Route decision:', {
        hasStrategyBrief: false,
        score: readiness,
        hasIntelligence,
        route: readiness >= 50 ? 'create consultation then huddle' : 'generate with session',
      });
      
      // If high readiness, create a consultation first and route to strategy document
      if (readiness >= 50 && hasIntelligence) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const intel = demoSession.extracted_intelligence as any;
          const marketResearch = demoSession.market_research as any;
          
          // Merge market research into extracted intelligence for complete data handoff
          const mergedIntelligence = {
            ...intel,
            // Include market research data in extracted_intelligence for Strategy Document
            marketResearch: marketResearch,
            positioning: marketResearch?.positioning,
            audiencePainPoints: marketResearch?.audiencePainPoints,
            keyDifferentiators: marketResearch?.keyDifferentiators,
            industryInsights: marketResearch?.industryInsights,
            messagingDirection: marketResearch?.messagingDirection,
            competitiveAngle: marketResearch?.competitiveAngle,
            // Brand data captured in this step - include at TOP LEVEL for Generate.tsx hydration
            logoUrl: logo,
            companyName: companyName,
            websiteUrl: websiteUrl,
            brandColors: {
              primary: colors.primary,
              secondary: colors.secondary,
              accent: colors.accent,
            },
            brandFonts: {
              heading: fontSettings.h1,
              body: fontSettings.body,
            },
            source: 'demo',
            migratedAt: new Date().toISOString(),
          };
          
          console.log('🎨 [BrandExtraction] Persisting brand data from demo:', {
            companyName,
            primaryColor: colors.primary,
            logoUrl: logo ? '(present)' : null,
          });
          
          // Create consultation from demo intelligence with ALL data
          const { data: newConsultation, error: createError } = await supabase
            .from('consultations')
            .insert({
              user_id: user.id,
              industry: intel.industry,
              target_audience: intel.audience,
              unique_value: intel.valueProp,
              competitor_differentiator: intel.competitorDifferentiator,
              audience_pain_points: marketResearch?.audiencePainPoints || (intel.painPoints ? [intel.painPoints] : []),
              key_benefits: marketResearch?.keyDifferentiators || [],
              authority_markers: intel.proofElements ? [intel.proofElements] : [],
              extracted_intelligence: mergedIntelligence,
              // Store market research in strategy_brief for Strategy Document to access
              strategy_brief: marketResearch ? {
                positioning: marketResearch.positioning,
                messagingDirection: marketResearch.messagingDirection,
                competitiveAngle: marketResearch.competitiveAngle,
                audiencePainPoints: marketResearch.audiencePainPoints,
                keyDifferentiators: marketResearch.keyDifferentiators,
                industryInsights: marketResearch.industryInsights,
              } : null,
              business_name: companyName,
              website_url: websiteUrl,
              communication_style: communicationStyle as any,
              consultation_status: 'demo_complete', // Valid: not_started, demo_started, demo_complete, wizard_in_progress, wizard_complete, generation_ready
              status: 'in_progress',
              readiness_score: readiness,
              flow_state: 'brand_captured',
            })
            .select()
            .single();
          
          if (!createError && newConsultation) {
            // Claim the demo session
            await supabase
              .from('demo_sessions')
              .update({
                claimed_by: user.id,
                claimed_at: new Date().toISOString(),
                continued_to_consultation: true,
              })
              .eq('session_id', sessionId)
              .is('claimed_by', null);
            
            console.log('✅ [EnhancedBrandSetup] Created consultation from demo with full intelligence:', newConsultation.id);
            console.log('✅ [EnhancedBrandSetup] Readiness score:', readiness, 'Market research included:', !!marketResearch);
            navigate(`/strategy-document?consultationId=${newConsultation.id}`, { replace: true });
            return;
          } else {
            console.error('❌ [EnhancedBrandSetup] Failed to create consultation:', createError);
          }
        }
      }
      
      // Fallback for low-readiness demo: still go to strategy document, not generate
      console.log('🚀 [EnhancedBrandSetup] Low-readiness demo - creating consultation for strategy review');
      const { data: { user: demoUser } } = await supabase.auth.getUser();
      if (demoUser) {
        const intel = demoSession.extracted_intelligence as any;
        const { data: newConsultation, error: createError } = await supabase
          .from('consultations')
          .insert({
            user_id: user.id,
            industry: intel?.industry || null,
            business_name: companyName,
            website_url: websiteUrl,
            extracted_intelligence: {
              ...intel,
              logoUrl: logo,
              companyName,
              websiteUrl,
              brandColors: { primary: colors.primary, secondary: colors.secondary, accent: colors.accent },
              source: 'demo',
              migratedAt: new Date().toISOString(),
            },
            consultation_status: 'demo_complete',
            status: 'in_progress',
            readiness_score: demoSession.readiness || 10,
            flow_state: 'brand_captured',
          })
          .select()
          .single();
        
        if (!createError && newConsultation) {
          await supabase
            .from('demo_sessions')
            .update({ claimed_by: user.id, claimed_at: new Date().toISOString(), continued_to_consultation: true })
            .eq('session_id', sessionId)
            .is('claimed_by', null);
          
          navigate(`/strategy-document?consultationId=${newConsultation.id}`, { replace: true });
          return;
        }
      }
      // Ultimate fallback if consultation creation fails
      navigate(`/strategy-document?session=${sessionId}`, { replace: true });
      // No consultationId and no demo session - create consultation from brand data if we have extraction results
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && (extractionResults || companyName)) {
        console.log('🚀 [EnhancedBrandSetup] Creating consultation from brand setup data...');
        
        // Create a new consultation with the extracted brand data
        // Include all brand fields at top level for Generate.tsx hydration to find
        const brandIntelligence = {
          ...extractionResults,
          brandColors: {
            primary: colors.primary,
            secondary: colors.secondary,
            accent: colors.accent,
          },
          logoUrl: logo || (extractionResults as any)?.logoUrl || null,
          companyName: companyName,
          websiteUrl: websiteUrl,
          source: 'brand_setup',
          migratedAt: new Date().toISOString(),
        };
        
        const { data: newConsultation, error: createError } = await supabase
          .from('consultations')
          .insert({
            user_id: user.id,
            industry: (extractionResults as any)?.inferredIndustry || extractionResults?.industry || null,
            business_name: companyName,
            website_url: websiteUrl,
            extracted_intelligence: brandIntelligence,
            consultation_status: 'not_started',
            status: 'in_progress',
            readiness_score: extractionResults ? 25 : 10, // Some readiness from brand extraction
            flow_state: 'brand_captured',
          })
          .select()
          .single();
        
        if (!createError && newConsultation) {
          console.log('✅ [EnhancedBrandSetup] Created consultation:', newConsultation.id);
          console.log('🎨 [BrandExtraction] Persisted brand data to consultation:', newConsultation.id, {
            primaryColor: colors.primary,
            logoUrl: logo ? '(present)' : null,
            companyName,
          });
          
          // Save brand data to localStorage for consultation to pick up
          const brandData = {
            companyName,
            websiteUrl,
            colors,
            logo, // Include logo URL
            extractionResults,
            consultationId: newConsultation.id,
          };
          localStorage.setItem('pageconsult_brand_data', JSON.stringify(brandData));
          
          // Navigate to strategy document
          navigate(`/strategy-document?consultationId=${newConsultation.id}`, { replace: true });
          return;
        } else {
          console.error('❌ [EnhancedBrandSetup] Failed to create consultation:', createError);
        }
      }
      
      // Ultimate fallback: create consultation and go to strategy document
      console.log('🚀 [EnhancedBrandSetup] Fallback - creating consultation for strategy review');
      
      const brandData = {
        companyName,
        websiteUrl,
        colors,
        logo,
        extractionResults,
        source: 'brand_setup',
      };
      localStorage.setItem('pageconsult_brand_data', JSON.stringify(brandData));
      
      // Navigate to strategy document — never skip directly to generate
      navigate('/strategy-document', {
        replace: true,
        state: {
          fromBrandSetup: true,
          brandData,
        }
      });
    }
  };

  // Color picker component
  const ColorPicker = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div className="flex items-center gap-3">
      <label className="relative">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div 
          className="w-10 h-10 rounded-lg border-2 border-slate-600 cursor-pointer hover:border-slate-500 transition-colors"
          style={{ backgroundColor: value }}
        />
      </label>
      <div className="flex-1">
        <p className="text-sm text-slate-400 mb-1">{label}</p>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 bg-slate-900/50 border-slate-600 font-mono text-sm uppercase text-white placeholder:text-slate-500"
          maxLength={7}
        />
      </div>
    </div>
  );

  // Build flow state for ProgressRail - MUST be before any conditional returns (Rules of Hooks)
  // Extract primitive values for stable dependencies to avoid infinite re-renders
  const demoReadiness = demoSession?.readiness;
  const demoIntelReadiness = (demoSession?.extracted_intelligence as any)?.readinessScore;
  const consultationIdFromParams = searchParams.get('consultationId');
  
  const flowState: FlowState = useMemo(() => {
    // Get consultation score from demo session or consultation
    const consultationScore = demoReadiness || demoIntelReadiness || 70; // Default to 70 if we're on brand setup (means consultation passed)
    
    return {
      consultationScore,
      briefGenerated: true, // Brief was generated to reach brand setup
      brandVisited: true, // We're on brand setup
      strategyVisited: false,
      sessionId: sessionId || consultationIdFromParams,
      consultationId: consultationIdFromParams,
    };
  }, [demoReadiness, demoIntelReadiness, sessionId, consultationIdFromParams]);

  // Show loading state while fetching session
  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading your session...</p>
        </div>
      </div>
    );
  }

  // Show error state if session not found
  if (sessionNotFound) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <X className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Session Not Found</h2>
          <p className="text-slate-400 mb-6">
            We couldn't find your consultation session. This can happen if the session expired or the link is invalid.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate('/try')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Start New Consultation
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Progress Rail */}
      <ProgressRail currentStep="brand" flowState={flowState} />
      
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {demoSession ? 'Add Your Brand Assets' : "Let's capture your brand"}
          </h1>
          <p className="text-slate-400 mt-1">
            {demoSession 
              ? 'Optional: Add your logo and colors to personalize your page'
              : "We'll extract everything automatically"
            }
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Demo Session Summary Card */}
        {demoSession && (
          <div className="mb-8 p-6 bg-gradient-to-r from-purple-900/30 to-cyan-900/30 border border-purple-500/30 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  Strategy Session Complete
                </h3>
                <p className="text-slate-400 text-sm mb-3">
                  Your consultation data is ready. Add your brand assets below, then generate your page.
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  {(demoSession.extracted_intelligence as any)?.businessName && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Business:</span>
                      <span className="text-white font-medium">
                        {(demoSession.extracted_intelligence as any).businessName}
                      </span>
                    </div>
                  )}
                  {(demoSession.extracted_intelligence as any)?.industry && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Industry:</span>
                      <span className="text-white font-medium">
                        {(demoSession.extracted_intelligence as any).industry}
                      </span>
                    </div>
                  )}
                  {demoSession.readiness && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Readiness:</span>
                      <span className="text-emerald-400 font-medium">
                        {demoSession.readiness}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Intelligence Accumulator Summary */}
        {accumulator && (
          <div className="mb-8 bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-3xl">📊</div>
              <div>
                <h3 className="text-lg font-semibold text-white">Intelligence Gathered</h3>
                <p className="text-sm text-purple-200">From your strategy consultation</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {accumulator.consultationData?.industry && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-purple-300 uppercase tracking-wider">Industry</div>
                  <p className="text-white font-medium">{accumulator.consultationData.industry}</p>
                </div>
              )}
              
              {accumulator.consultationData?.audience && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-purple-300 uppercase tracking-wider">Target Audience</div>
                  <p className="text-white font-medium">{accumulator.consultationData.audience}</p>
                </div>
              )}
              
              {accumulator.consultationData?.valueProp && (
                <div className="md:col-span-2 space-y-1">
                  <div className="text-xs font-medium text-purple-300 uppercase tracking-wider">Value Proposition</div>
                  <p className="text-white">{accumulator.consultationData.valueProp}</p>
                </div>
              )}
              
              {accumulator.consultationData?.edge && (
                <div className="md:col-span-2 space-y-1">
                  <div className="text-xs font-medium text-purple-300 uppercase tracking-wider">Competitive Edge</div>
                  <p className="text-white">{accumulator.consultationData.edge}</p>
                </div>
              )}
              
              {accumulator.consultationData?.painPoints && accumulator.consultationData.painPoints.length > 0 && (
                <div className="md:col-span-2 space-y-1">
                  <div className="text-xs font-medium text-purple-300 uppercase tracking-wider">Key Pain Points</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {accumulator.consultationData.painPoints.slice(0, 3).map((pain, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-500/20 text-purple-100 text-sm rounded-full border border-purple-500/30">
                        {pain}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="md:col-span-2 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-purple-300 uppercase tracking-wider">Intelligence Score</div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-white">{accumulator.readinessScore}/100</span>
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs font-medium rounded-full border border-green-500/30">
                        ✓ Ready for Generation
                      </span>
                    </div>
                  </div>
                  
                  {accumulator.marketData?.designConventions && (
                    <div className="text-right space-y-1">
                      <div className="text-xs font-medium text-purple-300 uppercase tracking-wider">Design System</div>
                      <div className="flex gap-2 justify-end">
                        <span className="px-2 py-1 bg-slate-800/50 text-slate-300 text-xs rounded border border-slate-700">
                          {accumulator.marketData.designConventions.colorMode === 'dark' ? '🌙 Dark' : '☀️ Light'}
                        </span>
                        <span className="px-2 py-1 bg-slate-800/50 text-slate-300 text-xs rounded border border-slate-700 capitalize">
                          {accumulator.marketData.designConventions.cardStyle}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* localStorage Intelligence Panel (from demo session) */}
        {localStorageIntelligence && !accumulator && (
          <div className="mb-8 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 backdrop-blur-sm rounded-xl border border-emerald-500/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Brain className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Intelligence Gathered</h3>
                <p className="text-sm text-emerald-200">From your strategy conversation</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {localStorageIntelligence.industry && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-emerald-300 uppercase tracking-wider">Industry</div>
                  <p className="text-white font-medium">{localStorageIntelligence.industry}</p>
                </div>
              )}
              
              {localStorageIntelligence.audience && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-emerald-300 uppercase tracking-wider">Target Audience</div>
                  <p className="text-white font-medium">{localStorageIntelligence.audience}</p>
                </div>
              )}
              
              {localStorageIntelligence.valueProp && (
                <div className="md:col-span-2 space-y-1">
                  <div className="text-xs font-medium text-emerald-300 uppercase tracking-wider">Value Proposition</div>
                  <p className="text-white">{localStorageIntelligence.valueProp}</p>
                </div>
              )}
              
              {localStorageIntelligence.competitorDifferentiator && (
                <div className="md:col-span-2 space-y-1">
                  <div className="text-xs font-medium text-emerald-300 uppercase tracking-wider">Competitive Edge</div>
                  <p className="text-white">{localStorageIntelligence.competitorDifferentiator}</p>
                </div>
              )}
              
              {localStorageIntelligence.painPoints && (
                <div className="md:col-span-2 space-y-1">
                  <div className="text-xs font-medium text-emerald-300 uppercase tracking-wider">Pain Points Addressed</div>
                  <p className="text-white">{localStorageIntelligence.painPoints}</p>
                </div>
              )}
              
              {localStorageIntelligence.proofElements && (
                <div className="md:col-span-2 space-y-1">
                  <div className="text-xs font-medium text-emerald-300 uppercase tracking-wider">Proof Elements</div>
                  <p className="text-white">{localStorageIntelligence.proofElements}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT COLUMN - Extraction Panels */}
          <div className="flex-1 space-y-6">
            {/* 1. Website URL Section */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Your Website</h2>
                  <p className="text-sm text-slate-400">We'll extract your logo, colors, and brand info</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Input
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="yourcompany.com"
                  className="flex-1 bg-slate-900/50 border-slate-600 rounded-xl focus:border-purple-500 focus:ring-purple-500/50 text-white placeholder:text-slate-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeWebsite()}
                />
                <Button
                  onClick={handleAnalyzeWebsite}
                  disabled={isAnalyzing}
                  className="bg-purple-600 hover:bg-purple-700 rounded-xl px-6"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze'
                  )}
                </Button>
              </div>

              {/* Extraction loading state */}
              {isAnalyzing && (
                <div className="mt-4 p-4 bg-purple-500/10 rounded-xl border border-purple-500/30">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                    <p className="text-white font-medium">Extracting logo, colors & company info...</p>
                  </div>
                </div>
              )}

              {extractionResults && !isAnalyzing && (
                <div className="mt-4 p-4 bg-slate-900/50 rounded-xl border border-emerald-500/30">
                  <div className="flex items-center gap-2 text-emerald-400 mb-3">
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Extracted successfully</span>
                  </div>
                  
                  {/* Summary of extracted items */}
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Logo thumbnail */}
                    {extractionResults.logoUrl && (
                      <div className="flex items-center gap-2">
                        <img 
                          src={extractionResults.logoUrl} 
                          alt="Logo" 
                          className="w-10 h-10 object-contain bg-white rounded-lg p-1"
                        />
                        <span className="text-xs text-slate-400">Logo</span>
                      </div>
                    )}
                    
                    {/* Color swatches */}
                    {extractionResults.colors.length > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {extractionResults.colors.slice(0, 4).map((color, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                if (i === 0) setColors(prev => ({ ...prev, primary: color }));
                                else if (i === 1) setColors(prev => ({ ...prev, secondary: color }));
                                else if (i === 2) setColors(prev => ({ ...prev, accent: color }));
                              }}
                              className="w-6 h-6 rounded-md border border-slate-600 hover:border-white transition-colors hover:scale-110"
                              style={{ backgroundColor: color }}
                              title={`Click to use: ${color}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-slate-400">Colors</span>
                      </div>
                    )}
                    
                    {/* Company name */}
                    {extractionResults.companyName && (
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-medium">{extractionResults.companyName}</span>
                        <span className="text-xs text-slate-400">Name</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Show what was applied */}
                  <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <p className="text-xs text-slate-500">
                      Applied: {[
                        extractionResults.logoUrl && 'logo',
                        extractionResults.colors.length > 0 && `${Math.min(extractionResults.colors.length, 3)} colors`,
                        extractionResults.companyName && 'company name'
                      ].filter(Boolean).join(', ') || 'No data extracted'}
                    </p>
                  </div>
                </div>
               )}

              {/* Extraction error - contextual inline message */}
              {extractionError && !isAnalyzing && !extractionResults && (
                <div className="mt-4 p-4 bg-amber-500/10 rounded-xl border border-amber-500/30">
                  <p className="text-sm text-amber-200">
                    {extractionError}
                  </p>
                </div>
              )}

              <button className="mt-3 text-sm text-slate-500 hover:text-slate-400 transition-colors">
                No website yet? Continue manually →
              </button>
            </div>

            {/* 2. Logo Upload Section */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                  <Image className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Your Logo</h2>
                  <p className="text-sm text-slate-400">PNG, SVG, JPG, or ZIP</p>
                </div>
              </div>

              {!logo ? (
                <label
                  onDrop={handleLogoDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-600 rounded-xl hover:border-cyan-500/50 transition-colors cursor-pointer"
                >
                  <Upload className="w-10 h-10 text-slate-500 mb-3" />
                  <p className="text-slate-400 text-center">
                    Drag and drop or <span className="text-cyan-400">browse</span>
                  </p>
                  <input
                    type="file"
                    accept="image/*,.zip"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative">
                  {/* Logo preview with background options */}
                  <div 
                    className={`
                      rounded-xl p-6 flex items-center justify-center min-h-[120px]
                      ${logoBackground === 'dark' 
                        ? 'bg-slate-900' 
                        : logoBackground === 'light'
                          ? 'bg-white'
                          : 'bg-[url("data:image/svg+xml,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23f0f0f0%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23f0f0f0%22%2F%3E%3Crect%20x%3D%2210%22%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23ffffff%22%2F%3E%3Crect%20y%3D%2210%22%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23ffffff%22%2F%3E%3C%2Fsvg%3E")]'
                      }
                    `}
                  >
                    <img src={logo} alt="Logo" className="max-h-16 max-w-full object-contain" />
                  </div>
                  
                  {/* Background toggle */}
                  <div className="flex gap-1 mt-3">
                    <button
                      onClick={() => setLogoBackground('light')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        logoBackground === 'light' 
                          ? 'bg-white text-slate-900' 
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => setLogoBackground('dark')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        logoBackground === 'dark' 
                          ? 'bg-slate-700 text-white' 
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Dark
                    </button>
                    <button
                      onClick={() => setLogoBackground('check')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        logoBackground === 'check' 
                          ? 'bg-slate-700 text-white' 
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Transparent
                    </button>
                  </div>
                  
                  {/* Remove button */}
                  <button 
                    onClick={() => setLogo(null)} 
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-700/80 hover:bg-slate-600 flex items-center justify-center text-slate-300 hover:text-white text-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <p className="mt-3 text-xs text-slate-500">
                Tip: Transparent PNGs work best for versatile placement
              </p>
            </div>

            {/* 3. Brand Guide Section */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Brand Guide <span className="text-slate-500 font-normal">(Optional)</span>
                  </h2>
                  <p className="text-sm text-slate-400">Upload your brand guidelines PDF</p>
                </div>
              </div>

              {!skipBrandGuide && (
                <>
                  {isExtractingBrief ? (
                    <div className="flex flex-col items-center justify-center p-8 bg-amber-500/5 border-2 border-amber-500/30 rounded-xl">
                      <Loader2 className="w-10 h-10 text-amber-400 animate-spin mb-3" />
                      <p className="text-white font-medium">Analyzing brand guide...</p>
                      <p className="text-slate-400 text-sm mt-1">Extracting colors, typography & voice</p>
                    </div>
                  ) : !brandGuide ? (
                    <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-600 rounded-xl hover:border-amber-500/50 transition-colors cursor-pointer">
                      <FileText className="w-8 h-8 text-slate-500 mb-2" />
                      <p className="text-slate-400 text-sm">Drop PDF here</p>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleBrandGuideUpload}
                        className="hidden"
                        disabled={isExtractingBrief}
                      />
                    </label>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-xl border border-emerald-500/30">
                      <Check className="w-5 h-5 text-emerald-400" />
                      <span className="text-white flex-1 truncate">{brandGuide.name}</span>
                      <button
                        onClick={() => setBrandGuide(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}

              <div className="flex items-center gap-2 mt-4">
                <Checkbox
                  id="skip-guide"
                  checked={skipBrandGuide}
                  onCheckedChange={(checked) => setSkipBrandGuide(checked as boolean)}
                />
                <Label htmlFor="skip-guide" className="text-slate-400 text-sm cursor-pointer">
                  I don't have a brand guide
                </Label>
              </div>
            </div>

            {/* 4. Colors and Typography Section */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden">
              {/* Loading overlay */}
              {(isExtractingBrief || isAnalyzing) && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-2" />
                    <p className="text-white font-medium">
                      {isExtractingBrief ? 'Applying brand guide...' : 'Extracting from website...'}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center flex-shrink-0">
                  <Palette className="w-6 h-6 text-pink-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-white">Colors & Typography</h2>
                  <p className="text-sm text-slate-400">Customize your brand appearance</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setColors(DEFAULT_COLORS);
                    setFontSettings({ h1: 'Inter', h2: 'Inter', h3: 'Inter', body: 'Inter', small: 'Inter' });
                    setColorsFromBrandGuide(false); // Reset brand guide authority
                  }}
                  className="text-slate-400 border-slate-600 hover:bg-slate-700"
                >
                  Use Defaults
                </Button>
              </div>

              {/* Colors */}
              <div className={`grid grid-cols-3 gap-4 mb-6 transition-opacity ${(isExtractingBrief || isAnalyzing) ? 'opacity-50' : ''}`}>
                <ColorPicker 
                  label="Primary" 
                  value={colors.primary} 
                  onChange={(v) => setColors(prev => ({ ...prev, primary: v }))} 
                />
                <ColorPicker 
                  label="Secondary" 
                  value={colors.secondary} 
                  onChange={(v) => setColors(prev => ({ ...prev, secondary: v }))} 
                />
                <ColorPicker 
                  label="Accent" 
                  value={colors.accent} 
                  onChange={(v) => setColors(prev => ({ ...prev, accent: v }))} 
                />
              </div>

              {/* Extracted color suggestions */}
              {extractionResults?.colors && extractionResults.colors.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs text-slate-500 mb-2">Extracted from your website:</p>
                  <div className="flex gap-2">
                    {extractionResults.colors.map((color, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          if (i === 0) setColors(prev => ({ ...prev, primary: color }));
                          else if (i === 1) setColors(prev => ({ ...prev, secondary: color }));
                          else setColors(prev => ({ ...prev, accent: color }));
                        }}
                        className="w-8 h-8 rounded-lg border-2 border-slate-600 hover:border-white transition-colors hover:scale-110"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Typography - Granular Controls */}
              <div className="space-y-4">
                <p className="text-sm text-slate-400 mb-2">Typography</p>
                
                {/* Font matching info */}
                {(fontMatches.heading || fontMatches.body) && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                    <div className="flex items-center gap-2 text-emerald-400 mb-2">
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">Font matching applied</span>
                    </div>
                    {fontMatches.heading && (
                      <div className="flex items-center gap-2 text-xs mb-1">
                        <span className="text-slate-400">
                          Detected: <span className="text-white">{fontMatches.heading.original}</span>
                        </span>
                        <span className="text-emerald-400">
                          → Using: {fontMatches.heading.match}
                        </span>
                      </div>
                    )}
                    {fontMatches.body && fontMatches.body.original !== fontMatches.heading?.original && (
                      <div className="flex items-center gap-2 text-xs mb-1">
                        <span className="text-slate-400">
                          Detected: <span className="text-white">{fontMatches.body.original}</span>
                        </span>
                        <span className="text-emerald-400">
                          → Using: {fontMatches.body.match}
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-slate-500 mt-2">
                      {fontMatches.heading?.similarity || fontMatches.body?.similarity}
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-3 gap-4">
                  {/* H1 */}
                  <CuratedFontSelect
                    label="H1 / Hero"
                    type="heading"
                    value={fontSettings.h1}
                    onChange={(v) => setFontSettings({...fontSettings, h1: v})}
                    customFonts={customHeadingFonts}
                    matchedFont={fontMatches.heading}
                    detectedFont={detectedFonts.heading}
                  />
                  
                  {/* H2 */}
                  <CuratedFontSelect
                    label="H2 / Section"
                    type="heading"
                    value={fontSettings.h2}
                    onChange={(v) => setFontSettings({...fontSettings, h2: v})}
                    customFonts={customHeadingFonts}
                    matchedFont={fontMatches.heading}
                    detectedFont={detectedFonts.heading}
                  />
                  
                  {/* H3 */}
                  <CuratedFontSelect
                    label="H3 / Card"
                    type="heading"
                    value={fontSettings.h3}
                    onChange={(v) => setFontSettings({...fontSettings, h3: v})}
                    customFonts={customHeadingFonts}
                    matchedFont={fontMatches.heading}
                    detectedFont={detectedFonts.heading}
                  />
                </div>
                
                {/* Custom heading font upload */}
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    Upload custom heading font
                    <input
                      type="file"
                      accept=".woff,.woff2,.ttf,.otf"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFontUpload(e.target.files[0], 'heading')}
                    />
                  </label>
                  {customFonts.heading && (
                    <div className="flex items-center gap-2 px-2 py-1 bg-slate-900/50 rounded-lg">
                      <span className="text-xs text-emerald-400">{customFonts.heading.name}</span>
                      <button
                        onClick={() => setCustomFonts(prev => ({ ...prev, heading: null }))}
                        className="text-slate-500 hover:text-slate-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Body */}
                  <CuratedFontSelect
                    label="Body Text"
                    type="body"
                    value={fontSettings.body}
                    onChange={(v) => setFontSettings({...fontSettings, body: v})}
                    customFonts={customBodyFonts}
                    matchedFont={fontMatches.body}
                    detectedFont={detectedFonts.body}
                  />
                  
                  {/* Small/Caption */}
                  <CuratedFontSelect
                    label="Small / Caption"
                    type="body"
                    value={fontSettings.small}
                    onChange={(v) => setFontSettings({...fontSettings, small: v})}
                    customFonts={customBodyFonts}
                    matchedFont={fontMatches.body}
                    detectedFont={detectedFonts.body}
                  />
                </div>
                
                {/* Custom body font upload */}
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    Upload custom body font
                    <input
                      type="file"
                      accept=".woff,.woff2,.ttf,.otf"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFontUpload(e.target.files[0], 'body')}
                    />
                  </label>
                  {customFonts.body && (
                    <div className="flex items-center gap-2 px-2 py-1 bg-slate-900/50 rounded-lg">
                      <span className="text-xs text-emerald-400">{customFonts.body.name}</span>
                      <button
                        onClick={() => setCustomFonts(prev => ({ ...prev, body: null }))}
                        className="text-slate-500 hover:text-slate-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Quick action: Match all to H1 */}
                <button 
                  onClick={() => setFontSettings({
                    h1: fontSettings.h1,
                    h2: fontSettings.h1,
                    h3: fontSettings.h1,
                    body: fontSettings.body,
                    small: fontSettings.body
                  })}
                  className="text-xs text-purple-400 hover:text-purple-300"
                >
                  Match all headings to H1
                </button>
              </div>
            </div>

            {/* 5. Style Inspiration Section */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                  <Eye className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Style Inspiration <span className="text-slate-500 font-normal">(Optional)</span>
                  </h2>
                  <p className="text-sm text-slate-400">Share websites you love the look of</p>
                </div>
              </div>

              <StyleInspirationInput
                onStyleExtracted={(style) => {
                  setStyleInspiration(style);
                  // Optionally apply extracted colors if no brand guide colors
                  if (!colorsFromBrandGuide && style.colors) {
                    setColors(prev => ({
                      primary: style.colors.primary || prev.primary,
                      secondary: style.colors.secondary || prev.secondary,
                      accent: style.colors.accent || prev.accent,
                    }));
                  }
                }}
                placeholder="stripe.com, linear.app, notion.so..."
                showRecentUrls={true}
                useVisionAI={true}
              />

              {styleInspiration && (
                <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                  <div className="flex items-center gap-2 text-indigo-400 mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">Style DNA captured</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {styleInspiration.mood.primary} design with {styleInspiration.spacing.density} spacing
                    {styleInspiration.visionAnalysis?.patterns?.length ? ` • Inspired by: ${styleInspiration.visionAnalysis.patterns.slice(0, 2).join(', ')}` : ''}
                  </p>
                </div>
              )}
            </div>

            {/* 6. Communication Style Section */}
            {(communicationStyle || styleLoading) && (
              <CommunicationStyleCard
                style={communicationStyle}
                loading={styleLoading}
                onEdit={() => {
                  // Future: open style editor modal
                  console.log('Edit communication style');
                }}
              />
            )}
          </div>

          {/* RIGHT COLUMN - Live Preview */}
          <div className="lg:w-[400px] lg:flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              {/* Mobile toggle */}
              <button
                onClick={() => setMobilePreviewOpen(!mobilePreviewOpen)}
                className="lg:hidden w-full flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl mb-4"
              >
                <span className="text-white font-medium">Live Preview</span>
                {mobilePreviewOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>

              <div className={`${mobilePreviewOpen ? 'block' : 'hidden'} lg:block`}>
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
                  {/* Preview Header */}
                  <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
                    <span className="text-sm font-medium text-slate-300">Live Preview</span>
                    <div className="flex items-center gap-1 bg-slate-900/50 rounded-lg p-1">
                      <button
                        onClick={() => setPreviewMode('desktop')}
                        className={`p-1.5 rounded-md transition-colors ${
                          previewMode === 'desktop' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Monitor className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setPreviewMode('mobile')}
                        className={`p-1.5 rounded-md transition-colors ${
                          previewMode === 'mobile' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Smartphone className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Preview Content */}
                  <div 
                    className={`p-6 transition-all ${previewMode === 'mobile' ? 'max-w-[280px] mx-auto' : ''} ${(isExtractingBrief || isAnalyzing) ? 'animate-pulse' : ''}`}
                    style={{ 
                      fontFamily: fontSettings.body,
                    }}
                  >
                    {/* Mini Hero Preview */}
                    <div className="bg-slate-900 rounded-xl p-6 text-center">
                      {/* Logo */}
                      {logo && (
                        <img 
                          src={logo} 
                          alt="Logo" 
                          className="h-10 object-contain mx-auto mb-4"
                        />
                      )}

                      {/* Headline */}
                      <h3 
                        className="text-xl font-bold text-white mb-2"
                        style={{ fontFamily: fontSettings.h1 }}
                      >
                        {companyName}
                      </h3>

                      {/* Tagline */}
                      <p 
                        className="text-slate-400 text-sm mb-6"
                        style={{ fontFamily: fontSettings.body }}
                      >
                        {tagline}
                      </p>

                      {/* CTA Buttons */}
                      <div className="flex gap-3 justify-center mb-6">
                        <button
                          className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90"
                          style={{ backgroundColor: colors.primary }}
                        >
                          Get Started
                        </button>
                        <button
                          className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90"
                          style={{ backgroundColor: colors.secondary }}
                        >
                          Learn More
                        </button>
                      </div>

                      {/* Stats Row - Only show if we have real proof elements from consultation */}
                      {localStorageIntelligence?.proofElements && (
                        <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                          <span>{localStorageIntelligence.proofElements}</span>
                        </div>
                      )}
                    </div>

                    {/* Color Legend */}
                    <div className="flex items-center justify-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.primary }} />
                        <span className="text-xs text-slate-500">Primary</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.secondary }} />
                        <span className="text-xs text-slate-500">Secondary</span>
                      </div>
                    </div>
                  </div>

                  {/* Brand Completeness */}
                  <div className="p-4 border-t border-slate-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Brand Completeness</span>
                      <span className="text-sm font-medium text-white">{brandCompleteness}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-purple-500 to-cyan-500"
                        style={{ width: `${brandCompleteness}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-12 pt-8 border-t border-slate-800">
          <button 
            onClick={() => demoSession ? navigate(`/generate?session=${sessionId}`) : navigate('/wizard')}
            className="text-slate-500 hover:text-slate-400 text-sm transition-colors"
          >
            {demoSession ? 'Skip brand setup' : 'Skip for now (use defaults)'}
          </button>
          <Button
            onClick={handleContinue}
            className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white px-8 py-6 rounded-xl font-medium"
          >
            {demoSession ? (
              <>
                View Your Strategy Blueprint
                <Sparkles className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                View Your Strategy Blueprint
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
