import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  Check, 
  Loader2, 
  Lightbulb, 
  FileText,
  Palette,
  Type,
  MessageSquare,
  Pencil,
  Globe,
  ArrowLeft,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { LogoEditor } from '@/components/consultation/LogoEditor';

interface BrandBrief {
  id: string;
  name: string;
  logo_url?: string;
  logo_storage_path?: string;
  website_url?: string;
  colors: {
    primary?: { hex: string; name?: string };
    secondary?: { hex: string; name?: string };
    accent?: { hex: string; name?: string };
  };
  typography: {
    headlineFont?: string;
    bodyFont?: string;
  };
  voice_tone: {
    personality?: string[];
    description?: string;
    doSay?: string[];
    dontSay?: string[];
  };
  source_file_name?: string;
}

interface DemoSession {
  id: string;
  session_id: string;
  extracted_intelligence: any;
  market_research: any;
  readiness: number;
  completed: boolean;
}

export default function BrandSetup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Check if this is a fresh start (e.g., from Reset Brand or new user)
  const isFreshStart = searchParams.get('fresh') === 'true';
  // Check if we should skip draft modal (coming from Edit button in wizard)
  const skipDraftModal = searchParams.get('skipDraftModal') === 'true';
  // Check for demo session
  const sessionId = searchParams.get('session');
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [brandGuideUploaded, setBrandGuideUploaded] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [noBrandGuide, setNoBrandGuide] = useState(false);
  const [manualColor, setManualColor] = useState('#0ea5e9'); // Default cyan, not stale data
  const [brandBrief, setBrandBrief] = useState<BrandBrief | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Demo session state
  const [demoSession, setDemoSession] = useState<DemoSession | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  
  // Website URL state
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isAnalyzingWebsite, setIsAnalyzingWebsite] = useState(false);
  const [websiteAnalyzed, setWebsiteAnalyzed] = useState(false);
  
  // Logo editor state
  const [logoEditorOpen, setLogoEditorOpen] = useState(false);
  const [logoEditorUrl, setLogoEditorUrl] = useState<string | null>(null);

  // Load demo session if present
  useEffect(() => {
    const loadDemoSession = async () => {
      if (!sessionId) return;
      
      console.log('📂 [BrandSetup] Loading demo session:', sessionId);
      
      const { data, error } = await supabase
        .from('demo_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();
      
      if (data && !error) {
        console.log('✅ [BrandSetup] Demo session loaded:', {
          hasIntelligence: !!data.extracted_intelligence,
          readiness: data.readiness,
        });
        setDemoSession(data as DemoSession);
      } else {
        console.error('❌ [BrandSetup] Failed to load demo session:', error);
      }
    };
    
    loadDemoSession();
  }, [sessionId]);

  // Check if user already has brand setup
  useEffect(() => {
    console.log('📂 [BrandSetup] Component mounted, sessionId from URL:', sessionId);
    checkExistingBrand();
  }, [isFreshStart, skipDraftModal, sessionId]);

  const checkExistingBrand = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/signup');
        return;
      }
      
      setUserId(user.id);

      // If fresh start, skipDraftModal, or coming from demo session, don't redirect
      if (isFreshStart || skipDraftModal || sessionId) {
        console.log('📂 [BrandSetup] Skipping redirect check:', { isFreshStart, skipDraftModal, sessionId });
        // Load existing data for display/editing but don't redirect
        const { data: existingBrief } = await supabase
          .from('brand_briefs')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();
          
        if (existingBrief) {
          if (existingBrief.logo_url) {
            setLogoPreview(existingBrief.logo_url);
          }
          const colors = existingBrief.colors as { primary?: { hex: string } } | null;
          if (colors?.primary?.hex) {
            setManualColor(colors.primary.hex);
          }
          if (existingBrief.website_url) {
            setWebsiteUrl(existingBrief.website_url);
            setWebsiteAnalyzed(true);
          }
        }
        setIsLoading(false);
        return;
      }

      const { data: existingBrief } = await supabase
        .from('brand_briefs')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (existingBrief?.logo_url) {
        // Already has brand setup, redirect to consultation wizard
        navigate('/consultation');
        return;
      }

      // Don't pre-populate colors from incomplete brand briefs
      // Only load logo if it exists
      if (existingBrief) {
        if (existingBrief.logo_url) {
          setLogoPreview(existingBrief.logo_url);
        }
        // Don't set manualColor from stale data - keep default
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking brand:', error);
      setIsLoading(false);
    }
  };

  // Handle logo file selection
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/png', 'image/svg+xml', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PNG, SVG, or JPG file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image under 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setLogoFile(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    
    // Open logo editor for background removal
    setLogoEditorUrl(previewUrl);
    setLogoEditorOpen(true);
  };

  // Handle logo drop
  const handleLogoDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    // Create a synthetic change event
    const input = document.getElementById('logo-upload') as HTMLInputElement;
    if (input) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, []);

  // Handle logo editor save
  const handleLogoEditorSave = async (editedImageUrl: string) => {
    setLogoEditorOpen(false);
    setIsUploadingLogo(true);

    try {
      if (!userId) throw new Error('Not authenticated');

      // Convert data URL to blob
      const response = await fetch(editedImageUrl);
      const blob = await response.blob();
      
      // Generate unique filename
      const fileName = `${userId}/logo-${Date.now()}.png`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('section-images')
        .upload(fileName, blob, {
          contentType: 'image/png',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('section-images')
        .getPublicUrl(fileName);

      // Update or create brand brief with logo
      const { data: existingBrief } = await supabase
        .from('brand_briefs')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingBrief) {
        await supabase
          .from('brand_briefs')
          .update({
            logo_url: publicUrl,
            logo_storage_path: fileName,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingBrief.id);
      } else {
        await supabase
          .from('brand_briefs')
          .insert({
            user_id: userId,
            logo_url: publicUrl,
            logo_storage_path: fileName,
          });
      }

      setLogoPreview(publicUrl);
      toast({ title: 'Logo uploaded successfully!' });

    } catch (error: any) {
      console.error('Logo upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Handle brand guide upload
  const handleBrandGuideChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.includes('pdf')) {
      toast({ title: 'Please upload a PDF file', variant: 'destructive' });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload a PDF under 10MB.',
        variant: 'destructive',
      });
      return;
    }

    setBrandGuideUploaded(true);
    setIsExtracting(true);

    try {
      if (!userId) throw new Error('Not authenticated');

      // Convert to base64
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);

      // Call edge function
      const { data, error } = await supabase.functions.invoke('extract-brand-brief', {
        body: {
          pdfBase64: base64,
          fileName: file.name,
          userId: userId,
        },
      });

      if (error) throw error;

      setBrandBrief(data.brandBrief);
      setShowReview(true);
      toast({ title: 'Brand guide extracted!' });

    } catch (error: any) {
      console.error('Brand guide extraction error:', error);
      toast({
        title: 'Extraction failed',
        description: error.message,
        variant: 'destructive',
      });
      setBrandGuideUploaded(false);
    } finally {
      setIsExtracting(false);
    }
  };

  // Handle brand guide drop
  const handleBrandGuideDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const input = document.getElementById('brand-guide-upload') as HTMLInputElement;
    if (input) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, []);

  // Save manual color
  const saveManualColor = async () => {
    if (!userId) return;

    try {
      const { data: existingBrief } = await supabase
        .from('brand_briefs')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      const colorData = {
        primary: { hex: manualColor, name: 'Primary' },
        secondary: null,
        accent: null,
      };

      if (existingBrief) {
        await supabase
          .from('brand_briefs')
          .update({
            colors: colorData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingBrief.id);
      } else {
        await supabase
          .from('brand_briefs')
          .insert({
            user_id: userId,
            colors: colorData,
          });
      }
    } catch (error) {
      console.error('Error saving color:', error);
    }
  };

  // Handle website analysis
  const handleAnalyzeWebsite = async () => {
    if (!websiteUrl) return;
    
    setIsAnalyzingWebsite(true);
    
    try {
      if (!userId) throw new Error('Not authenticated');
      
      // Normalize URL
      let normalizedUrl = websiteUrl.trim();
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl;
      }
      
      console.log('[BrandSetup] Analyzing website:', normalizedUrl);
      
      // Call the website intelligence edge function
      const { data: result, error } = await supabase.functions.invoke('extract-website-intelligence', {
        body: { url: normalizedUrl }
      });
      
      console.log('[BrandSetup] Website analysis result:', result);
      
      if (error) throw error;
      
      if (result.success && result.data) {
        // Update brand brief with website data
        const { data: existingBrief } = await supabase
          .from('brand_briefs')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();
        
        const extractedData = result.data;
        const brandUpdate: any = {
          website_url: normalizedUrl,
          updated_at: new Date().toISOString(),
        };
        
        // Extract logo if found
        if (extractedData.logoUrl) {
          setLogoPreview(extractedData.logoUrl);
          brandUpdate.logo_url = extractedData.logoUrl;
        }
        
        // Extract brand colors if found
        if (extractedData.brandColors?.length > 0) {
          brandUpdate.colors = {
            primary: { hex: extractedData.brandColors[0], name: 'Primary' },
            secondary: extractedData.brandColors[1] ? { hex: extractedData.brandColors[1], name: 'Secondary' } : null,
            accent: extractedData.brandColors[2] ? { hex: extractedData.brandColors[2], name: 'Accent' } : null,
          };
          setManualColor(extractedData.brandColors[0]);
        }
        
        // Extract company name
        if (extractedData.companyName) {
          brandUpdate.name = extractedData.companyName;
        }
        
        if (existingBrief) {
          await supabase
            .from('brand_briefs')
            .update(brandUpdate)
            .eq('id', existingBrief.id);
        } else {
          await supabase
            .from('brand_briefs')
            .insert({
              user_id: userId,
              ...brandUpdate,
            });
        }
        
        setWebsiteAnalyzed(true);
        toast({ 
          title: 'Website analyzed!', 
          description: 'We extracted your branding automatically.' 
        });
      } else {
        toast({
          title: 'Analysis complete',
          description: 'No branding found. You can upload manually below.',
        });
        setWebsiteAnalyzed(true);
      }
    } catch (error: any) {
      console.error('Website analysis error:', error);
      toast({
        title: 'Analysis failed',
        description: error.message || 'Could not analyze website. Continue with manual setup.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzingWebsite(false);
    }
  };

  // Handle continue - navigate to wizard, not generate
  const handleContinue = async () => {
    if (noBrandGuide) {
      await saveManualColor();
    }
    // Navigate to consultation wizard, not directly to generate
    navigate('/consultation');
  };

  // Handle generate from demo session - streamlined flow
  const handleGenerateFromDemo = async () => {
    if (!demoSession || !userId) return;
    
    setIsGenerating(true);
    
    try {
      // Step 1: Save brand settings
      setGenerationStep('Saving brand settings...');
      
      if (noBrandGuide) {
        await saveManualColor();
      }
      
      // Get or create brand brief
      const { data: existingBrief } = await supabase
        .from('brand_briefs')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();
      
      const brandData = existingBrief || {
        user_id: userId,
        logo_url: logoPreview,
        colors: { primary: { hex: manualColor, name: 'Primary' } },
        website_url: websiteUrl || null,
      };
      
      // Step 2: Navigate to generate page with session data
      setGenerationStep('Preparing generation...');
      
      // Store the intelligence data for the generate page
      sessionStorage.setItem('demoSessionForGeneration', JSON.stringify({
        sessionId: demoSession.session_id,
        intelligence: demoSession.extracted_intelligence,
        marketResearch: demoSession.market_research,
        readiness: demoSession.readiness,
        brand: brandData,
      }));
      
      console.log('🚀 [BrandSetup] Navigating to generate with demo session data');
      navigate(`/generate?session=${demoSession.session_id}`, { replace: true });
      
    } catch (error) {
      console.error('Generation preparation failed:', error);
      setGenerationStep('');
      setIsGenerating(false);
      toast({
        title: 'Preparation failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Check if we have enough brand data to continue
  const hasBrandData = logoPreview || noBrandGuide;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Review screen after brand guide extraction
  if (showReview && brandBrief) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReview(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <img src="/pageconsult-logo.png" alt="PageConsult AI" className="h-10 w-auto" />
          </div>
        </header>
        
        <div className="max-w-2xl mx-auto py-12 px-4">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">
              Brand Guide Extracted
            </h1>
            <p className="text-muted-foreground">
              Here's what we found. You can edit these anytime in Settings.
            </p>
          </div>

          {/* Logo */}
          {logoPreview && (
            <div className="bg-card rounded-xl p-6 mb-4 border border-border">
              <div className="flex items-center gap-4">
                <img src={logoPreview} alt="Logo" className="h-12 object-contain" />
                <span className="text-sm text-muted-foreground">Your logo</span>
              </div>
            </div>
          )}

          {/* Colors */}
          {brandBrief.colors?.primary?.hex && (
            <div className="bg-card rounded-xl p-6 mb-4 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Palette className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Colors</h3>
              </div>
              <div className="flex gap-4">
                {Object.entries(brandBrief.colors).map(([key, color]) => (
                  color?.hex && (
                    <div key={key} className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-lg border border-border"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-sm text-muted-foreground capitalize">{key}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Typography */}
          {(brandBrief.typography?.headlineFont || brandBrief.typography?.bodyFont) && (
            <div className="bg-card rounded-xl p-6 mb-4 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Type className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Typography</h3>
              </div>
              <div className="space-y-2 text-sm">
                {brandBrief.typography.headlineFont && (
                  <p className="text-muted-foreground">
                    Headlines: <span className="text-foreground">{brandBrief.typography.headlineFont}</span>
                  </p>
                )}
                {brandBrief.typography.bodyFont && (
                  <p className="text-muted-foreground">
                    Body: <span className="text-foreground">{brandBrief.typography.bodyFont}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Voice & Tone */}
          {brandBrief.voice_tone?.personality?.length && (
            <div className="bg-card rounded-xl p-6 mb-8 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Voice & Tone</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {brandBrief.voice_tone.personality.map((trait, i) => (
                  <span 
                    key={i}
                    className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                  >
                    {trait}
                  </span>
                ))}
              </div>
              {brandBrief.voice_tone.description && (
                <p className="text-sm text-muted-foreground mt-3">
                  {brandBrief.voice_tone.description}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/settings/brand')}
              className="flex-1 gap-2"
            >
              <Pencil className="w-4 h-4" />
              Edit Details
            </Button>
            <Button
              onClick={handleContinue}
              className="flex-1"
            >
              Looks Good — Continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Back Button */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <img src="/pageconsult-logo.png" alt="PageConsult AI" className="h-10 w-auto" />
        </div>
      </header>

      <div className="max-w-2xl mx-auto py-12 px-4">
        
        {/* Progress Steps - only show for demo sessions */}
        {demoSession && (
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-primary font-medium">Strategy</span>
            </div>
            <div className="w-12 h-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                2
              </div>
              <span className="text-foreground font-medium">Brand</span>
            </div>
            <div className="w-12 h-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                3
              </div>
              <span className="text-muted-foreground">Generate</span>
            </div>
          </div>
        )}
        
        {/* Session Summary Card (if coming from demo) */}
        {demoSession && (
          <div className="bg-card rounded-xl p-6 mb-8 border border-primary/20">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Your strategy session is ready
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  We captured everything from your demo conversation.
                </p>
                
                <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {demoSession.extracted_intelligence?.industry && (
                    <>
                      <dt className="text-muted-foreground">Industry</dt>
                      <dd className="text-foreground">{demoSession.extracted_intelligence.industry}</dd>
                    </>
                  )}
                  {demoSession.extracted_intelligence?.audience && (
                    <>
                      <dt className="text-muted-foreground">Audience</dt>
                      <dd className="text-foreground">{demoSession.extracted_intelligence.audience}</dd>
                    </>
                  )}
                  {demoSession.extracted_intelligence?.valueProp && (
                    <>
                      <dt className="text-muted-foreground">Value Prop</dt>
                      <dd className="text-foreground truncate">{demoSession.extracted_intelligence.valueProp}</dd>
                    </>
                  )}
                  {demoSession.market_research?.commonObjections?.length > 0 && (
                    <>
                      <dt className="text-muted-foreground">Objections</dt>
                      <dd className="text-foreground">{demoSession.market_research.commonObjections.length} identified</dd>
                    </>
                  )}
                </dl>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-2xl font-bold text-primary">
                  {demoSession.readiness}%
                </div>
                <div className="text-xs text-muted-foreground">Ready</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-3">
            {demoSession ? "One more thing: your brand" : "Let's set up your brand"}
          </h1>
          <p className="text-muted-foreground">
            {demoSession 
              ? "We'll use your logo and colors to make the page uniquely yours."
              : "This takes 2 minutes and makes every page on-brand."}
          </p>
        </div>

        {/* Step 1: Website URL (Optional) */}
        <div className="bg-card rounded-xl p-8 mb-6 border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
              1
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Your Website
              <span className="text-muted-foreground font-normal text-base ml-2">(Optional)</span>
            </h2>
          </div>
          
          <p className="text-muted-foreground text-sm mb-4">
            Have a website? We'll pull your branding automatically.
          </p>
          
          {websiteAnalyzed ? (
            <div className="flex items-center gap-3 text-primary">
              <Check className="w-5 h-5" />
              <span>Website analyzed: {websiteUrl}</span>
              <button
                onClick={() => {
                  setWebsiteAnalyzed(false);
                  setWebsiteUrl('');
                }}
                className="text-muted-foreground text-sm hover:text-foreground transition-colors ml-auto"
              >
                Change
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-3">
                <Input
                  type="url"
                  placeholder="yourwebsite.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && websiteUrl) {
                      handleAnalyzeWebsite();
                    }
                  }}
                />
                <Button 
                  onClick={handleAnalyzeWebsite}
                  disabled={!websiteUrl || isAnalyzingWebsite}
                  variant="outline"
                >
                  {isAnalyzingWebsite ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Globe className="w-4 h-4" />
                  )}
                  <span className="ml-2">Analyze</span>
                </Button>
              </div>
              
              <p className="text-muted-foreground/70 text-xs mt-3">
                No website yet? No problem — continue below.
              </p>
            </>
          )}
        </div>

        {/* Step 2: Logo */}
        <div className="bg-card rounded-xl p-8 mb-6 border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
              2
            </div>
            <h2 className="text-xl font-semibold text-foreground">Upload Your Logo</h2>
          </div>

          {isUploadingLogo ? (
            <div className="flex items-center gap-3 text-primary">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Uploading logo...</span>
            </div>
          ) : logoPreview ? (
            <div className="flex items-center gap-6">
              <img src={logoPreview} alt="Logo" className="h-16 object-contain bg-muted/50 rounded-lg p-2" />
              <div>
                <p className="text-primary text-sm flex items-center gap-1">
                  <Check className="w-4 h-4" /> {websiteAnalyzed ? 'Extracted from website' : 'Uploaded'}
                </p>
                <button
                  onClick={() => setLogoPreview(null)}
                  className="text-muted-foreground text-sm hover:text-foreground transition-colors"
                >
                  Change logo
                </button>
              </div>
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-border rounded-xl p-8 text-center 
                         hover:border-primary/50 transition-colors cursor-pointer"
              onDrop={handleLogoDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <input
                type="file"
                accept=".png,.svg,.jpg,.jpeg"
                onChange={handleLogoChange}
                className="hidden"
                id="logo-upload"
              />
              <label htmlFor="logo-upload" className="cursor-pointer">
                <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-foreground font-medium">Drop your logo here</p>
                <p className="text-muted-foreground text-sm mt-1">PNG, SVG, or JPG</p>
              </label>
            </div>
          )}

          <p className="text-muted-foreground text-xs mt-3 flex items-center gap-1">
            <Lightbulb className="w-3 h-3" />
            Transparent PNG works best — we'll help you remove the background
          </p>
        </div>

        {/* Step 3: Brand Guide */}
        <div className="bg-card rounded-xl p-8 mb-8 border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
              3
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Upload Brand Guide
              <span className="text-muted-foreground font-normal text-base ml-2">(Optional)</span>
            </h2>
          </div>

          {isExtracting ? (
            <div className="flex items-center gap-3 text-primary">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing your brand guide...</span>
            </div>
          ) : brandGuideUploaded ? (
            <div className="flex items-center gap-3 text-primary">
              <Check className="w-5 h-5" />
              <span>Brand guide uploaded</span>
            </div>
          ) : (
            <>
              <div
                className="border-2 border-dashed border-border rounded-xl p-8 text-center 
                           hover:border-primary/50 transition-colors cursor-pointer"
                onDrop={handleBrandGuideDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleBrandGuideChange}
                  className="hidden"
                  id="brand-guide-upload"
                  disabled={noBrandGuide}
                />
                <label 
                  htmlFor="brand-guide-upload" 
                  className={`cursor-pointer ${noBrandGuide ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-foreground font-medium">Drop your brand guide PDF</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    We'll extract colors, fonts, and voice guidelines
                  </p>
                </label>
              </div>

              <label className="flex items-center gap-2 mt-4 text-muted-foreground text-sm cursor-pointer">
                <Checkbox
                  checked={noBrandGuide}
                  onCheckedChange={(checked) => setNoBrandGuide(checked as boolean)}
                />
                I don't have a brand guide — I'll set colors manually
              </label>
            </>
          )}
        </div>

        {/* Manual Color Picker */}
        {noBrandGuide && (
          <div className="bg-card rounded-xl p-8 mb-8 border border-border">
            <h3 className="text-lg font-medium text-foreground mb-4">Set Your Brand Color</h3>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={manualColor}
                onChange={(e) => setManualColor(e.target.value)}
                className="w-12 h-12 rounded cursor-pointer border-0"
              />
              <Input
                type="text"
                value={manualColor}
                onChange={(e) => setManualColor(e.target.value)}
                className="w-28"
                placeholder="#0ea5e9"
              />
            </div>
          </div>
        )}

        {/* Continue/Generate Button */}
        <div className="mt-8">
          {isGenerating ? (
            <div className="bg-card rounded-xl p-6 text-center border border-border">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-foreground font-medium">{generationStep}</p>
              <p className="text-muted-foreground text-sm mt-1">This usually takes 30-60 seconds</p>
            </div>
          ) : demoSession ? (
            // Demo session flow - streamlined generate
            <>
              <Button
                onClick={handleGenerateFromDemo}
                disabled={!hasBrandData}
                className="w-full py-4 text-lg h-auto bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              >
                Generate My Page
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              {!hasBrandData && (
                <p className="text-center text-muted-foreground text-sm mt-3">
                  Add your brand info above to continue
                </p>
              )}
            </>
          ) : (
            // Normal flow - continue to wizard
            <div className="text-center">
              <Button
                onClick={handleContinue}
                disabled={!logoPreview && !noBrandGuide}
                className="px-8 py-3 text-lg h-auto"
              >
                Continue →
              </Button>

              <button
                onClick={() => navigate('/consultation')}
                className="block mx-auto mt-4 text-muted-foreground text-sm hover:text-foreground transition-colors"
              >
                Skip for now (use defaults)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Logo Editor Modal */}
      {logoEditorUrl && (
        <LogoEditor
          imageUrl={logoEditorUrl}
          open={logoEditorOpen}
          onClose={() => {
            setLogoEditorOpen(false);
            setLogoEditorUrl(null);
          }}
          onSave={handleLogoEditorSave}
        />
      )}
    </div>
  );
}
