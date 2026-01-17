import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Globe, Image, FileText, Palette, ArrowRight, 
  Upload, Check, Loader2, Monitor, Smartphone,
  ChevronDown, ChevronUp, X, Sparkles, Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  
  // State
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractionResults, setExtractionResults] = useState<ExtractionResults | null>(null);
  const [extractionSuccess, setExtractionSuccess] = useState(false);
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
  
  // Track if brand guide has set colors (takes priority over website extraction)
  const [colorsFromBrandGuide, setColorsFromBrandGuide] = useState(false);

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
        if (consultationData.website_url) {
          setWebsiteUrl(consultationData.website_url);
        } else if (intel?.websiteUrl) {
          setWebsiteUrl(intel.websiteUrl);
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
        }
        
        setIsLoadingSession(false);
        return;
      }
      
      // Fallback: check demo_sessions table
      console.log('📂 [EnhancedBrandSetup] Not in consultations, checking demo_sessions...');
      const { data: demoData, error: demoError } = await supabase
        .from('demo_sessions')
        .select('*')
        .eq('session_id', idToLoad)
        .maybeSingle();

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
        if (intel?.websiteUrl) {
          setWebsiteUrl(intel.websiteUrl);
        }
        if (intel?.logoUrl) {
          setLogo(intel.logoUrl);
        }
      } else {
        console.error('❌ [EnhancedBrandSetup] Not found in either table:', { consultationError, demoError });
      }
      
      setIsLoadingSession(false);
    };

    loadSessionData();
  }, [sessionId, searchParams, navigate]);
  
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

  // Standard font options
  const STANDARD_HEADING_FONTS = ['Inter', 'Plus Jakarta Sans', 'DM Sans', 'Outfit', 'Space Grotesk', 'Sora', 'Playfair Display', 'Montserrat', 'Nunito Sans'];
  const STANDARD_BODY_FONTS = ['Inter', 'Plus Jakarta Sans', 'DM Sans', 'IBM Plex Sans', 'Source Sans Pro', 'Lato', 'Nunito Sans'];

  // Dynamic font options that include detected/matched/custom fonts
  const headingFontOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    
    // Add custom uploaded font first
    if (customFonts.heading) {
      options.push({ value: customFonts.heading.name, label: `${customFonts.heading.name} (uploaded)` });
    }
    
    // Add matched font
    if (fontMatches.heading && !options.some(o => o.value === fontMatches.heading?.match)) {
      options.push({ value: fontMatches.heading.match, label: `${fontMatches.heading.match} (matches ${fontMatches.heading.original})` });
    }
    
    // Add detected font if not in standard list
    if (detectedFonts.heading && !STANDARD_HEADING_FONTS.includes(detectedFonts.heading) && !options.some(o => o.value === detectedFonts.heading)) {
      options.push({ value: detectedFonts.heading, label: `${detectedFonts.heading} (detected)` });
    }
    
    // Add standard fonts
    STANDARD_HEADING_FONTS.forEach(font => {
      if (!options.some(o => o.value === font)) {
        options.push({ value: font, label: font });
      }
    });
    
    return options;
  }, [customFonts.heading, fontMatches.heading, detectedFonts.heading]);

  const bodyFontOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    
    // Add custom uploaded font first
    if (customFonts.body) {
      options.push({ value: customFonts.body.name, label: `${customFonts.body.name} (uploaded)` });
    }
    
    // Add matched font
    if (fontMatches.body && !options.some(o => o.value === fontMatches.body?.match)) {
      options.push({ value: fontMatches.body.match, label: `${fontMatches.body.match} (matches ${fontMatches.body.original})` });
    }
    
    // Add detected font if not in standard list
    if (detectedFonts.body && !STANDARD_BODY_FONTS.includes(detectedFonts.body) && !options.some(o => o.value === detectedFonts.body)) {
      options.push({ value: detectedFonts.body, label: `${detectedFonts.body} (detected)` });
    }
    
    // Add standard fonts
    STANDARD_BODY_FONTS.forEach(font => {
      if (!options.some(o => o.value === font)) {
        options.push({ value: font, label: font });
      }
    });
    
    return options;
  }, [customFonts.body, fontMatches.body, detectedFonts.body]);

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
    try {
      let formattedUrl = websiteUrl.trim();
      if (!formattedUrl.startsWith('http')) {
        formattedUrl = `https://${formattedUrl}`;
      }

      const response = await supabase.functions.invoke('extract-website-intelligence', {
        body: { url: formattedUrl }
      });

      console.log('Full response:', response);
      console.log('Response data:', response.data);

      if (response.error) throw response.error;

      // Handle nested data structure: { success: true, data: { logoUrl, brandColors, ... } }
      if (response.data?.success && response.data?.data) {
        const extracted = response.data.data;
        console.log('Extracted data:', extracted);

        // Set logo
        if (extracted.logoUrl) {
          setLogo(extracted.logoUrl);
          console.log('Logo set:', extracted.logoUrl);
        }

        // Set colors - skip whites, near-whites, grays, and near-blacks
        // Only apply website colors if brand guide hasn't set them
        if (!colorsFromBrandGuide && extracted.brandColors && extracted.brandColors.length > 0) {
          const isUsableColor = (hex: string) => {
            const h = hex.toLowerCase().replace('#', '');
            
            // Handle 3-char hex
            const fullHex = h.length === 3 
              ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2] 
              : h;
            
            if (fullHex.length !== 6) return false;
            
            // Convert to RGB
            const r = parseInt(fullHex.substring(0, 2), 16);
            const g = parseInt(fullHex.substring(2, 4), 16);
            const b = parseInt(fullHex.substring(4, 6), 16);
            
            if (isNaN(r) || isNaN(g) || isNaN(b)) return false;
            
            // Calculate luminance (0 = black, 255 = white)
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
            
            // Skip if too light (> 240) or too dark (< 30)
            if (luminance > 240 || luminance < 30) return false;
            
            // Skip grays (where R, G, B are very similar)
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            if (max - min < 30 && luminance > 100 && luminance < 200) return false;
            
            return true;
          };
          
          const filteredColors = extracted.brandColors.filter(isUsableColor);
          console.log('Filtered brand colors:', filteredColors);
          
          setColors({
            primary: filteredColors[0] || DEFAULT_COLORS.primary,
            secondary: filteredColors[1] || filteredColors[0] || DEFAULT_COLORS.secondary,
            accent: filteredColors[2] || filteredColors[1] || DEFAULT_COLORS.accent,
          });
        } else if (colorsFromBrandGuide) {
          console.log('[BrandSetup] Skipping website colors - brand guide takes priority');
        }

        // Set company name - try to extract from title "Home - Envita" → "Envita"
        let name = extracted.companyName;
        if (extracted.title && extracted.title.includes(' - ')) {
          name = extracted.title.split(' - ').pop() || name;
        }
        if (name && name !== 'Home') {
          setCompanyName(name);
          console.log('Company name set:', name);
        }

        // Store tagline for use in preview
        if (extracted.tagline) {
          setTagline(extracted.tagline);
          console.log('Tagline set:', extracted.tagline);
        }

        // Apply fonts if found - with intelligent matching
        if (extracted.fonts) {
          const headingMatch = extracted.fonts.heading ? findFontMatch(extracted.fonts.heading) : null;
          const bodyMatch = extracted.fonts.body ? findFontMatch(extracted.fonts.body) : null;
          
          setFontMatches({ heading: headingMatch, body: bodyMatch });
          
          setDetectedFonts({
            heading: extracted.fonts.heading || null,
            body: extracted.fonts.body || null
          });
          
          // Use matched fonts (or detected if it's a known Google Font)
          const headingFont = headingMatch?.match || (FONT_OPTIONS.includes(extracted.fonts.heading) ? extracted.fonts.heading : null);
          const bodyFont = bodyMatch?.match || (FONT_OPTIONS.includes(extracted.fonts.body) ? extracted.fonts.body : null);
          
          setFontSettings(prev => ({
            ...prev,
            ...(headingFont && { h1: headingFont, h2: headingFont, h3: headingFont }),
            ...(bodyFont && { body: bodyFont, small: bodyFont })
          }));
          
          console.log('Font matches:', { headingMatch, bodyMatch });
        }

        const results: ExtractionResults = {
          logoUrl: extracted.logoUrl || null,
          colors: extracted.brandColors || [],
          companyName: name || null,
          tagline: extracted.tagline || extracted.description || null,
          pageCopy: extracted.pageCopy || null,
        };
        setExtractionResults(results);
        setExtractionSuccess(true);

        // Trigger communication style extraction if we have enough text
        if (extracted.pageCopy && extracted.pageCopy.length >= 100) {
          extractCommunicationStyle(
            extracted.pageCopy,
            name || companyName,
            (demoSession?.extracted_intelligence as any)?.industry || ''
          );
        }

        toast.success('Website analyzed successfully!');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze website. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

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
      // Save brand data and communication style to consultation
      await supabase
        .from('consultations')
        .update({ 
          communication_style: communicationStyle as any,
          business_name: companyName,
          website_url: websiteUrl,
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
      
      // High readiness: show Strategy Document with complete blueprint
      if (readinessScore >= 50) {
        console.log('🚀 [EnhancedBrandSetup] High readiness - navigating to Strategy Document');
        navigate(`/strategy-document?consultationId=${consultationId}`, { replace: true });
      } else {
        // Low readiness: go directly to wizard for more info
        console.log('🚀 [EnhancedBrandSetup] Low readiness - navigating to wizard');
        navigate(`/wizard?consultationId=${consultationId}`, { replace: true });
      }
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
      
      // If high readiness, create a consultation first and route to huddle
      if (readiness >= 50 && hasIntelligence) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const intel = demoSession.extracted_intelligence as any;
          
          // Create consultation from demo intelligence
          const { data: newConsultation, error: createError } = await supabase
            .from('consultations')
            .insert({
              user_id: user.id,
              industry: intel.industry,
              target_audience: intel.audience,
              unique_value: intel.valueProp,
              competitor_differentiator: intel.competitorDifferentiator,
              audience_pain_points: intel.painPoints ? [intel.painPoints] : [],
              authority_markers: intel.proofElements ? [intel.proofElements] : [],
              extracted_intelligence: {
                ...intel,
                source: 'demo',
                migratedAt: new Date().toISOString(),
              },
              business_name: companyName,
              website_url: websiteUrl,
              communication_style: communicationStyle as any,
              consultation_status: 'not_started',
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
              })
              .eq('session_id', sessionId)
              .is('claimed_by', null);
            
            console.log('✅ [EnhancedBrandSetup] Created consultation from demo:', newConsultation.id);
            navigate(`/strategy-document?consultationId=${newConsultation.id}`, { replace: true });
            return;
          } else {
            console.error('❌ [EnhancedBrandSetup] Failed to create consultation:', createError);
          }
        }
      }
      
      // Fallback: navigate to generate with session
      navigate(`/generate?session=${sessionId}`);
    } else {
      navigate('/wizard');
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

  return (
    <div className="min-h-screen bg-slate-900">
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
                    <Loader2 className="w-4 h-4 animate-spin" />
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
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">H1 / Hero</label>
                    <select
                      value={fontSettings.h1}
                      onChange={(e) => setFontSettings({...fontSettings, h1: e.target.value})}
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                    >
                      {headingFontOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* H2 */}
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">H2 / Section</label>
                    <select
                      value={fontSettings.h2}
                      onChange={(e) => setFontSettings({...fontSettings, h2: e.target.value})}
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                    >
                      {headingFontOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* H3 */}
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">H3 / Card</label>
                    <select
                      value={fontSettings.h3}
                      onChange={(e) => setFontSettings({...fontSettings, h3: e.target.value})}
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                    >
                      {headingFontOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
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
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Body Text</label>
                    <select
                      value={fontSettings.body}
                      onChange={(e) => setFontSettings({...fontSettings, body: e.target.value})}
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                    >
                      {bodyFontOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Small/Caption */}
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Small / Caption</label>
                    <select
                      value={fontSettings.small}
                      onChange={(e) => setFontSettings({...fontSettings, small: e.target.value})}
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                    >
                      {bodyFontOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
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

            {/* 5. Communication Style Section */}
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

                      {/* Stats Row */}
                      <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                        <span>500+ Clients</span>
                        <span className="w-1 h-1 bg-slate-600 rounded-full" />
                        <span>98% Satisfaction</span>
                        <span className="w-1 h-1 bg-slate-600 rounded-full" />
                        <span>24/7 Support</span>
                      </div>
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
