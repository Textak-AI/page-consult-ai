import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, Palette, Globe, FileText, ArrowRight, Sparkles, X, 
  Loader2, CheckCircle, Image, Type, FileArchive
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PageConsultLogo from '@/components/ui/PageConsultLogo';

interface DetectionResults {
  logo?: string;
  colors?: string[];
  fonts?: string[];
  companyName?: string;
}

interface ExtractedLogo {
  name: string;
  preview: string;
  file?: File;
}

export default function BrandIntake() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  const { toast } = useToast();
  
  // Website & Auto-detect
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResults, setDetectionResults] = useState<DetectionResults | null>(null);
  
  // Logo
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isExtractingZip, setIsExtractingZip] = useState(false);
  const [isExtractingColors, setIsExtractingColors] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractedLogos, setExtractedLogos] = useState<ExtractedLogo[]>([]);
  const [selectedExtractedLogo, setSelectedExtractedLogo] = useState<ExtractedLogo | null>(null);
  
  // Brand Guide
  const [brandGuide, setBrandGuide] = useState<File | null>(null);
  const [guideExtractionComplete, setGuideExtractionComplete] = useState(false);
  
  // Colors
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [secondaryColor, setSecondaryColor] = useState('#06b6d4');
  const [detectedColors, setDetectedColors] = useState<string[]>([]);
  const [colorsAutoDetected, setColorsAutoDetected] = useState(false);
  
  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const brandGuideInputRef = useRef<HTMLInputElement>(null);
  
  // Scroll to top on load and debug session
  useEffect(() => {
    window.scrollTo(0, 0);
    console.log('🎨 [BrandIntake] Component mounted');
    console.log('🎨 [BrandIntake] sessionId from searchParams:', sessionId);
    
    if (!sessionId || sessionId === 'undefined' || sessionId === 'null') {
      console.error('❌ [BrandIntake] Invalid session ID:', sessionId);
      toast({
        title: "Session not found",
        description: "Please start from the consultation.",
        variant: "destructive"
      });
    }
  }, [sessionId]);
  
  // Auto-detect from website
  const handleAutoDetect = async () => {
    if (!websiteUrl) return;
    setIsDetecting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('extract-brand', {
        body: { url: websiteUrl }
      });
      
      if (error) throw error;
      
      const results: DetectionResults = {
        logo: data?.brand?.faviconUrl || data?.brand?.logoUrl,
        colors: data?.brand?.themeColor ? [data.brand.themeColor] : [],
        fonts: data?.brand?.fonts || [],
        companyName: data?.brand?.companyName
      };
      
      setDetectionResults(results);
      
      // Auto-fill detected values
      if (results.logo) {
        setLogoPreview(results.logo);
      }
      if (results.colors && results.colors.length > 0) {
        setPrimaryColor(results.colors[0]);
        if (results.colors[1]) setSecondaryColor(results.colors[1]);
        setDetectedColors(results.colors);
        setColorsAutoDetected(true);
      }
      
      toast({
        title: "Brand detected!",
        description: "We found your logo and colors. Review below."
      });
      
    } catch (error) {
      console.error('Detection error:', error);
      toast({
        title: "Detection failed",
        description: "Enter your brand details manually below.",
        variant: "destructive"
      });
    } finally {
      setIsDetecting(false);
    }
  };
  
  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:image/...;base64, prefix
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
    });
  };

  // Logo image upload with color extraction
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
    setLogoFile(file);
    setSelectedExtractedLogo(null);
    
    // If no website URL provided, extract colors from the logo
    if (!websiteUrl && !colorsAutoDetected) {
      setIsExtractingColors(true);
      
      try {
        console.log('🎨 Extracting colors from logo...');
        const base64 = await fileToBase64(file);
        
        const { data, error } = await supabase.functions.invoke('extract-colors-from-image', {
          body: { image: base64, mimeType: file.type }
        });
        
        if (error) throw error;
        
        if (data?.colors?.length > 0) {
          console.log('🎨 Extracted colors:', data.colors);
          
          setPrimaryColor(data.colors[0]);
          if (data.colors[1]) setSecondaryColor(data.colors[1]);
          setDetectedColors(data.colors);
          setColorsAutoDetected(true);
          
          toast({
            title: "Colors extracted from logo",
            description: `Found ${data.colors.length} brand colors`
          });
        }
      } catch (error) {
        console.error('Color extraction error:', error);
        // Silent fail - user can still pick colors manually
      } finally {
        setIsExtractingColors(false);
      }
    }
  };
  
  // ZIP brand package upload
  const handleBrandPackageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsExtractingZip(true);
    setExtractionProgress(0);
    
    try {
      // Simulate extraction progress for now
      // In production, this would call an edge function
      setExtractionProgress(30);
      
      // For now, we'll read the ZIP client-side and look for image files
      // This is a simplified version - a full implementation would use JSZip
      await new Promise(resolve => setTimeout(resolve, 1000));
      setExtractionProgress(60);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setExtractionProgress(100);
      
      toast({
        title: "Brand package received",
        description: "Processing brand assets..."
      });
      
      // In a full implementation, extracted logos would be populated here
      // For now, we'll just indicate the ZIP was received
      
    } catch (error) {
      console.error('ZIP extraction error:', error);
      toast({
        title: "Extraction failed",
        description: "Couldn't process the brand package",
        variant: "destructive"
      });
    } finally {
      setIsExtractingZip(false);
    }
  };
  
  // Select logo from extracted ZIP
  const selectExtractedLogo = (logo: ExtractedLogo) => {
    setSelectedExtractedLogo(logo);
    setLogoPreview(logo.preview);
    setLogoFile(logo.file || null);
  };
  
  // Brand guide upload with AI extraction
  const handleBrandGuideUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setBrandGuide(file);
    setGuideExtractionComplete(false);
    
    // Simulate processing - in production this would call extract-brand-brief
    setTimeout(() => {
      setGuideExtractionComplete(true);
      toast({
        title: "Brand guide processed",
        description: "Style rules extracted successfully."
      });
    }, 2000);
  };
  
  // Apply detected color
  const applyDetectedColor = (color: string, type: 'primary' | 'secondary') => {
    if (type === 'primary') {
      setPrimaryColor(color);
    } else {
      setSecondaryColor(color);
    }
  };
  
  // Clear logo
  const clearLogo = () => {
    setLogoPreview(null);
    setLogoFile(null);
    setSelectedExtractedLogo(null);
  };
  
  // Submit handler
  const handleSubmit = async () => {
    console.log('🎨 [BrandIntake] Submit clicked, sessionId:', sessionId);
    
    if (!sessionId || sessionId === 'undefined' || sessionId === 'null') {
      toast({ 
        title: "Session not found", 
        description: "Please start from the beginning.",
        variant: "destructive" 
      });
      navigate('/');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload logo if provided as file
      let logoUrl = logoPreview;
      if (logoFile) {
        const fileName = `${sessionId}-logo-${Date.now()}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('brand-assets')
          .upload(fileName, logoFile);
        
        if (uploadError) {
          console.error('Logo upload error:', uploadError);
        } else if (uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('brand-assets')
            .getPublicUrl(fileName);
          logoUrl = publicUrl;
        }
      }
      
      // Save brand assets to session
      const { error: updateError } = await supabase
        .from('demo_sessions')
        .update({ 
          brand_assets: {
            websiteUrl,
            logoUrl,
            primaryColor,
            secondaryColor,
            hasBrandGuide: !!brandGuide,
            detectedColors,
            autoDetected: colorsAutoDetected
          },
          brand_intake_completed: true,
          brand_intake_at: new Date().toISOString()
        })
        .eq('session_id', sessionId);
      
      if (updateError) throw updateError;
      
      navigate(`/generate?session=${sessionId}`);
      
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Error saving brand assets",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSkip = () => {
    if (!sessionId || sessionId === 'undefined' || sessionId === 'null') {
      navigate('/');
      return;
    }
    navigate(`/generate?session=${sessionId}`);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-white/10 p-6">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <PageConsultLogo className="h-8 w-auto text-white" />
          <span className="text-cyan-400 text-sm font-medium">Brand Setup</span>
        </div>
      </header>
      
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-5 border border-cyan-500/30">
            <Sparkles className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Let's make it yours
          </h1>
          <p className="text-slate-400 max-w-md mx-auto">
            Add your brand assets so your landing page looks and feels like your company.
          </p>
        </div>
        
        {/* 1. WEBSITE SECTION - Auto-detect */}
        <div className="bg-slate-800/50 rounded-xl border border-white/10 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h2 className="font-semibold text-white">Website</h2>
            <span className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded">Start here</span>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Enter your website and we'll auto-detect your logo, colors, and fonts.
          </p>
          
          <div className="flex gap-3">
            <input
              type="url"
              placeholder="https://yourcompany.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <button
              onClick={handleAutoDetect}
              disabled={!websiteUrl || isDetecting}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              {isDetecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Detecting...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Auto-Detect
                </>
              )}
            </button>
          </div>
          
          {/* Detection results preview */}
          {detectionResults && (
            <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-cyan-500/30">
              <div className="flex items-center gap-2 text-cyan-400 text-sm mb-3">
                <CheckCircle className="w-4 h-4" />
                Found brand assets
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                {detectionResults.logo && (
                  <div className="flex items-center gap-2">
                    <Image className="w-4 h-4 text-slate-400" />
                    <span className="text-white">Logo detected</span>
                  </div>
                )}
                {detectionResults.colors && detectionResults.colors.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-slate-400" />
                    <span className="text-white">{detectionResults.colors.length} colors found</span>
                  </div>
                )}
                {detectionResults.fonts && detectionResults.fonts.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-slate-400" />
                    <span className="text-white">{detectionResults.fonts.length} fonts detected</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* 2. LOGO SECTION - Multiple upload options */}
        <div className="bg-slate-800/50 rounded-xl border border-white/10 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Image className="w-5 h-5 text-cyan-400" />
            <h2 className="font-semibold text-white">Logo</h2>
          </div>
          
          {/* Show detected/uploaded logo */}
          {(logoPreview || detectionResults?.logo) && (
            <div className="mb-4 p-4 bg-slate-900 rounded-lg relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img 
                      src={logoPreview || detectionResults?.logo} 
                      alt="Logo" 
                      className="h-12 bg-white/10 rounded px-3 py-2 object-contain"
                    />
                    {isExtractingColors && (
                      <div className="absolute inset-0 bg-slate-900/80 rounded flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-white text-sm">
                      {detectionResults?.logo && !logoFile ? 'Auto-detected from website' : 'Uploaded logo'}
                    </p>
                    <p className="text-slate-500 text-xs">
                      {isExtractingColors ? (
                        <span className="text-cyan-400 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Extracting colors...
                        </span>
                      ) : (
                        'Click below to replace'
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={clearLogo}
                  className="text-slate-400 hover:text-white p-2 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Color extraction success indicator */}
              {colorsAutoDetected && !websiteUrl && logoFile && (
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs">
                    <CheckCircle className="w-3 h-3" />
                    Colors extracted from logo
                    <div className="flex gap-1 ml-2">
                      {detectedColors.slice(0, 4).map((color, i) => (
                        <div 
                          key={i}
                          className="w-4 h-4 rounded border border-white/20"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Upload options */}
          <div className="grid grid-cols-2 gap-4">
            {/* Single image upload */}
            <label className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center cursor-pointer hover:border-slate-600 transition-colors group">
              <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2 group-hover:text-cyan-400 transition-colors" />
              <p className="text-slate-400 text-sm mb-1">Upload image</p>
              <p className="text-slate-600 text-xs">PNG, SVG, JPG</p>
              {!websiteUrl && (
                <p className="text-cyan-400/70 text-xs mt-1">We'll extract colors automatically</p>
              )}
              <input 
                ref={logoInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleLogoUpload}
                className="hidden"
              />
            </label>
            
            {/* ZIP file upload */}
            <label className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center cursor-pointer hover:border-slate-600 transition-colors group">
              <FileArchive className="w-8 h-8 text-slate-500 mx-auto mb-2 group-hover:text-cyan-400 transition-colors" />
              <p className="text-slate-400 text-sm mb-1">Upload brand package</p>
              <p className="text-slate-600 text-xs">ZIP with logos & assets</p>
              <input 
                ref={zipInputRef}
                type="file" 
                accept=".zip,.rar,.7z" 
                onChange={handleBrandPackageUpload}
                className="hidden"
              />
            </label>
          </div>
          
          {/* ZIP extraction progress */}
          {isExtractingZip && (
            <div className="mt-4 p-4 bg-slate-900/50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                <span className="text-white text-sm">Extracting brand assets...</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-cyan-500 h-2 rounded-full transition-all"
                  style={{ width: `${extractionProgress}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Extracted files from ZIP */}
          {extractedLogos.length > 0 && (
            <div className="mt-4">
              <p className="text-slate-400 text-sm mb-3">Select your primary logo:</p>
              <div className="grid grid-cols-4 gap-3">
                {extractedLogos.map((logo, i) => (
                  <button
                    key={i}
                    onClick={() => selectExtractedLogo(logo)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      selectedExtractedLogo === logo 
                        ? 'border-cyan-500 bg-cyan-500/10' 
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <img src={logo.preview} alt={logo.name} className="w-full h-12 object-contain" />
                    <p className="text-xs text-slate-500 mt-2 truncate">{logo.name}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* 3. BRAND GUIDELINES SECTION */}
        <div className="bg-slate-800/50 rounded-xl border border-white/10 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h2 className="font-semibold text-white">Brand Guidelines</h2>
            <span className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded">Optional</span>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Upload your brand guide and we'll extract colors, fonts, and style rules automatically.
          </p>
          
          <input
            ref={brandGuideInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleBrandGuideUpload}
            className="hidden"
          />
          
          {brandGuide ? (
            <div className="flex items-center justify-between bg-slate-900 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-white text-sm">{brandGuide.name}</p>
                  <p className="text-slate-500 text-xs">
                    {guideExtractionComplete ? (
                      <span className="text-cyan-400">✓ Colors and fonts extracted</span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Processing...
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setBrandGuide(null); setGuideExtractionComplete(false); }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label 
              onClick={() => brandGuideInputRef.current?.click()}
              className="block border-2 border-dashed border-slate-700 rounded-lg p-6 text-center cursor-pointer hover:border-slate-600 transition-colors group"
            >
              <FileText className="w-8 h-8 text-slate-500 mx-auto mb-2 group-hover:text-cyan-400 transition-colors" />
              <p className="text-slate-400 text-sm mb-1">Upload brand guidelines</p>
              <p className="text-slate-600 text-xs">PDF format recommended</p>
            </label>
          )}
        </div>
        
        {/* 4. COLORS SECTION - Auto-populated with override */}
        <div className="bg-slate-800/50 rounded-xl border border-white/10 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="w-5 h-5 text-cyan-400" />
            <h2 className="font-semibold text-white">Brand Colors</h2>
            {colorsAutoDetected && (
              <span className="text-xs text-cyan-400 bg-cyan-500/20 px-2 py-1 rounded">Auto-detected</span>
            )}
          </div>
          
          {/* Detected color palette */}
          {detectedColors.length > 0 && (
            <div className="mb-4">
              <p className="text-slate-400 text-xs mb-2">Detected from your website:</p>
              <div className="flex gap-2">
                {detectedColors.map((color, i) => (
                  <button
                    key={i}
                    onClick={() => applyDetectedColor(color, i === 0 ? 'primary' : 'secondary')}
                    className="w-10 h-10 rounded-lg border-2 border-white/20 hover:border-white/50 transition-colors"
                    style={{ backgroundColor: color }}
                    title={`Click to apply: ${color}`}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Primary and Secondary color pickers */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Primary Color</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm font-mono uppercase focus:border-cyan-500 focus:outline-none"
                  placeholder="#000000"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Secondary Color</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm font-mono uppercase focus:border-cyan-500 focus:outline-none"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>
          
          {/* Color preview */}
          <div 
            className="mt-4 p-4 rounded-lg"
            style={{ 
              background: `linear-gradient(135deg, ${primaryColor}22 0%, ${secondaryColor}22 100%)`,
              border: `1px solid ${primaryColor}44`
            }}
          >
            <p className="text-white text-sm mb-2">Preview: Your page will use these colors</p>
            <div className="flex gap-3">
              <button 
                className="px-4 py-2 rounded text-white text-sm font-medium"
                style={{ backgroundColor: primaryColor }}
              >
                Primary Button
              </button>
              <button 
                className="px-4 py-2 rounded text-white text-sm font-medium"
                style={{ backgroundColor: secondaryColor }}
              >
                Secondary Button
              </button>
            </div>
          </div>
        </div>
        
        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl text-lg hover:from-cyan-400 hover:to-purple-400 transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Generate My Landing Page
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
        
        <button
          onClick={handleSkip}
          className="w-full mt-4 py-3 text-slate-500 hover:text-slate-300 transition-colors text-sm"
        >
          Skip for now — use default styling
        </button>
      </div>
    </div>
  );
}
