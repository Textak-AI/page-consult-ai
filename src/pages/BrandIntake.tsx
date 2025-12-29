import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Palette, Globe, FileText, ArrowRight, Sparkles, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PageConsultLogo from '@/components/ui/PageConsultLogo';

export default function BrandIntake() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  const { toast } = useToast();
  
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [secondaryColor, setSecondaryColor] = useState('#06b6d4');
  const [brandGuide, setBrandGuide] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const brandGuideInputRef = useRef<HTMLInputElement>(null);
  
  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };
  
  const handleExtractFromWebsite = async () => {
    if (!websiteUrl) return;
    setIsExtracting(true);
    
    try {
      // Call edge function to extract brand from website
      const { data, error } = await supabase.functions.invoke('extract-brand', {
        body: { url: websiteUrl }
      });
      
      if (error) throw error;
      
      if (data?.brand?.themeColor) setPrimaryColor(data.brand.themeColor);
      if (data?.brand?.faviconUrl) setLogoPreview(data.brand.faviconUrl);
      
      toast({
        title: "Brand extracted!",
        description: "We found your colors and logo from your website.",
      });
    } catch (error) {
      console.error('Extract error:', error);
      toast({
        title: "Couldn't extract brand",
        description: "Enter your brand details manually below.",
        variant: "destructive"
      });
    } finally {
      setIsExtracting(false);
    }
  };
  
  const handleSubmit = async () => {
    if (!sessionId) {
      toast({ title: "Session not found", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload logo if provided
      let logoUrl = logoPreview;
      if (logo) {
        const fileName = `${sessionId}-logo-${Date.now()}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('brand-assets')
          .upload(fileName, logo);
        
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
          },
          brand_intake_completed: true,
          brand_intake_at: new Date().toISOString()
        })
        .eq('session_id', sessionId);
      
      if (updateError) throw updateError;
      
      // Navigate to page generation
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
    navigate(`/generate?session=${sessionId}`);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-white/10 p-6">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <PageConsultLogo className="h-8 w-auto text-white" />
          </div>
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
        
        {/* Website URL - Extract Brand */}
        <div className="bg-slate-800/50 rounded-xl border border-white/10 p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-white font-medium">
              <Globe className="w-5 h-5 text-cyan-400" />
              Extract from website
            </div>
            <span className="text-xs text-slate-500 uppercase">Optional</span>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Have an existing website? We'll pull your colors and logo automatically.
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
              onClick={handleExtractFromWebsite}
              disabled={!websiteUrl || isExtracting}
              className="px-5 py-3 bg-cyan-500/20 text-cyan-400 rounded-lg font-medium hover:bg-cyan-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isExtracting ? 'Extracting...' : 'Extract'}
            </button>
          </div>
        </div>
        
        {/* Logo Upload */}
        <div className="bg-slate-800/50 rounded-xl border border-white/10 p-6 mb-6">
          <div className="flex items-center gap-2 text-white font-medium mb-4">
            <Upload className="w-5 h-5 text-cyan-400" />
            Logo
          </div>
          
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="hidden"
          />
          
          {logoPreview ? (
            <div className="relative w-32 h-32 bg-slate-900 rounded-xl border border-white/10 overflow-hidden">
              <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain p-4" />
              <button
                onClick={() => { setLogo(null); setLogoPreview(null); }}
                className="absolute top-2 right-2 w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => logoInputRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-cyan-500/50 transition-colors group"
            >
              <Upload className="w-8 h-8 text-slate-500 mx-auto mb-3 group-hover:text-cyan-400 transition-colors" />
              <p className="text-slate-400 mb-1">Drop your logo here or click to upload</p>
              <p className="text-sm text-slate-500">PNG, SVG, or JPG (max 2MB)</p>
            </button>
          )}
        </div>
        
        {/* Colors */}
        <div className="bg-slate-800/50 rounded-xl border border-white/10 p-6 mb-6">
          <div className="flex items-center gap-2 text-white font-medium mb-4">
            <Palette className="w-5 h-5 text-cyan-400" />
            Brand Colors
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 block mb-2">Primary Color</label>
              <div className="flex items-center gap-2">
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
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-2">Secondary Color</label>
              <div className="flex items-center gap-2">
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
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Brand Guide Upload */}
        <div className="bg-slate-800/50 rounded-xl border border-white/10 p-6 mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-white font-medium">
              <FileText className="w-5 h-5 text-cyan-400" />
              Brand Guidelines
            </div>
            <span className="text-xs text-slate-500 uppercase">Optional</span>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Have a brand guide? Upload it and we'll match your style precisely.
          </p>
          
          <input
            ref={brandGuideInputRef}
            type="file"
            accept=".pdf"
            onChange={(e) => setBrandGuide(e.target.files?.[0] || null)}
            className="hidden"
          />
          
          {brandGuide ? (
            <div className="flex items-center justify-between bg-slate-900 px-4 py-3 rounded-lg border border-white/10">
              <span className="text-white text-sm truncate">{brandGuide.name}</span>
              <button
                onClick={() => setBrandGuide(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => brandGuideInputRef.current?.click()}
              className="w-full py-3 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
            >
              Upload PDF brand guide
            </button>
          )}
        </div>
        
        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl text-lg hover:from-cyan-400 hover:to-purple-400 transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Generate My Landing Page'}
          {!isSubmitting && <ArrowRight className="w-5 h-5" />}
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
