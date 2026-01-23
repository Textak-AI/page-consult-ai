import { Button } from "@/components/ui/button";
import { ImagePicker } from "@/components/editor/ImagePicker";
import { LogoUploader } from "@/components/editor/LogoUploader";
import { useState, useMemo } from "react";
import { ImagePlus, Shield, Clock, Award, CheckCircle, ArrowRight, Sparkles, Camera, Star, Image, Layers, PlayCircle, Check } from "lucide-react";
import { motion } from "framer-motion";
import { getIndustryTokens, type IndustryVariant } from "@/config/designSystem/industryVariants";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Helper component for premium headline highlighting
function HeadlineWithHighlight({ text, highlightColor, mode }: { 
  text: string; 
  highlightColor: 'teal' | 'violet'; 
  mode: string;
}) {
  const words = text.split(' ');
  // Highlight last 2-4 words for emphasis
  const highlightStart = Math.max(0, words.length - 3);
  const beforeHighlight = words.slice(0, highlightStart).join(' ');
  const highlighted = words.slice(highlightStart).join(' ');
  
  const highlightClass = highlightColor === 'teal' 
    ? 'bg-gradient-to-r from-teal-500/20 to-teal-400/10 px-3 -mx-1 rounded-lg'
    : 'bg-gradient-to-r from-violet-500/20 to-violet-400/10 px-3 -mx-1 rounded-lg';
  
  if (!beforeHighlight) {
    return <>{text}</>;
  }
  
  return (
    <>
      {beforeHighlight}{' '}
      <span className={highlightClass}>{highlighted}</span>
    </>
  );
}

interface CitedStat {
  statistic: string;
  claim: string;
  source: string;
  year: number;
  fullCitation: string;
}

type LogoSize = 'small' | 'medium' | 'large';

interface HeroSectionProps {
  content: {
    headline: string;
    subheadline: string;
    ctaText: string;
    ctaLink: string;
    backgroundImage?: string;
    imageAttribution?: {
      photographerName: string;
      photographerLink: string;
    };
    fomo?: {
      badge?: string;
      urgency?: string;
    };
    citedStat?: CitedStat;
    trustBadges?: string[];
    trustBadge?: string;
    credibilityBar?: Array<{
      icon?: string;
      text: string;
    }>;
    primaryColor?: string;
    logoUrl?: string | null;
    logoSize?: LogoSize;
    darkOverlay?: boolean;
    secondaryCTA?: {
      type: string;
      text: string;
    } | null;
    industryVariant?: IndustryVariant;
  };
  onUpdate: (content: any) => void;
  isEditing?: boolean;
}

// Logo size mapping
const logoSizeClasses: Record<LogoSize, string> = {
  small: 'h-8 md:h-10',
  medium: 'h-12 md:h-14',
  large: 'h-16 md:h-20',
};

export function HeroSection({ content, onUpdate, isEditing }: HeroSectionProps) {
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [logoUploaderOpen, setLogoUploaderOpen] = useState(false);
  
  // Get industry tokens
  const industryVariant = content.industryVariant || 'default';
  const tokens = getIndustryTokens(industryVariant);
  const isLightMode = tokens.mode === 'light';
  const isConsulting = industryVariant === 'consulting';
  const isHealthcare = industryVariant === 'healthcare';
  const isSaas = industryVariant === 'saas';
  const isLocalServices = industryVariant === 'local-services';
  
  console.log('🎨 [HeroSection] industryVariant:', industryVariant, 'isLocalServices:', isLocalServices);
  
  // Determine if we should use light text (when dark overlay is active OR when not in light mode)
  const hasBackgroundImage = !!content.backgroundImage;
  const showDarkOverlay = hasBackgroundImage && (content.darkOverlay !== false); // Default to true when bg image exists
  // Use light text when: overlay is active on bg image, or when in dark mode
  const useLightText = showDarkOverlay || !isLightMode;
  
  // Logo size with default
  const logoSize = content.logoSize || 'medium';
  
  

  const handleBlur = (field: string, e: React.FocusEvent<HTMLElement>) => {
    onUpdate({
      ...content,
      [field]: e.currentTarget.textContent || content[field as keyof typeof content],
    });
  };

  const handleImageSelect = (image: any) => {
    onUpdate({
      ...content,
      backgroundImage: image.urls.regular,
      imageAttribution: {
        photographerName: image.user.name,
        photographerLink: image.user.link,
      },
      darkOverlay: true, // Auto-enable overlay when adding bg image
    });
  };

  const handleLogoApply = (logoUrl: string | null) => {
    onUpdate({
      ...content,
      logoUrl: logoUrl,
    });
  };
  
  const handleLogoSizeChange = (size: LogoSize) => {
    onUpdate({
      ...content,
      logoSize: size,
    });
  };
  
  const handleToggleOverlay = (enabled: boolean) => {
    onUpdate({
      ...content,
      darkOverlay: enabled,
    });
  };

  const credibilityItems = content.credibilityBar || [];
  const trustBadges = content.trustBadges || [];
  
  // Single trust badge (credential) for consulting hero
  const trustBadge = content.trustBadge || content.fomo?.badge;

  // Local Services variant: Light mode, trust-forward, phone-prominent
  if (isLocalServices) {
    return (
      <section className="relative py-20 md:py-28 overflow-hidden bg-white">
        {isEditing && (
          <div className="absolute inset-0 border-2 border-blue-500/50 rounded-lg pointer-events-none z-20" />
        )}
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center">
            {/* Logo */}
            {(content.logoUrl || isEditing) && (
              <div className="mb-6">
                {content.logoUrl ? (
                  <div className="relative inline-block">
                    <img src={content.logoUrl} alt="Logo" className={logoSizeClasses[logoSize] + " object-contain mx-auto"} />
                    {isEditing && (
                      <button
                        onClick={() => setLogoUploaderOpen(true)}
                        className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                      >
                        <Camera className="w-2.5 h-2.5 text-white" />
                      </button>
                    )}
                  </div>
                ) : isEditing ? (
                  <button
                    onClick={() => setLogoUploaderOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    Add Logo
                  </button>
                ) : null}
              </div>
            )}
            
            {/* Trust Badge */}
            {trustBadge && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-sm font-medium text-blue-700 mb-6">
                <Shield className="w-4 h-4" />
                {trustBadge}
              </div>
            )}
            
            {/* Headline */}
            <h1
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("headline", e)}
              className={`text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight ${
                isEditing ? "outline-dashed outline-2 outline-blue-500/30 rounded px-2 inline-block" : ""
              }`}
            >
              {content.headline}
            </h1>
            
            {/* Subheadline */}
            <p
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("subheadline", e)}
              className={`text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto ${
                isEditing ? "outline-dashed outline-2 outline-blue-500/30 rounded px-2" : ""
              }`}
            >
              {content.subheadline}
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button 
                size="lg"
                className="px-10 py-6 text-lg font-bold bg-orange-500 text-white hover:bg-orange-600 rounded-lg shadow-lg"
              >
                <span
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => handleBlur("ctaText", e)}
                >
                  {content.ctaText}
                </span>
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              {content.secondaryCTA && (
                <Button 
                  variant="outline" 
                  size="lg"
                  className="px-8 py-6 text-lg font-semibold border-2 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  {content.secondaryCTA.text}
                </Button>
              )}
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-600">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                Licensed & Insured
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Same-Day Service
              </span>
              <span className="flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600" />
                5-Star Rated
              </span>
            </div>
          </div>
        </div>
        
        {/* Logo Uploader Modal */}
        <LogoUploader
          isOpen={logoUploaderOpen}
          onClose={() => setLogoUploaderOpen(false)}
          onApplyLogo={handleLogoApply}
          currentLogoUrl={content.logoUrl}
        />
      </section>
    );
  }

  // SaaS variant: Two-column layout with product screenshot area
  if (isSaas) {
    return (
      <section className="relative py-24 md:py-32 overflow-hidden bg-slate-900">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-900 to-blue-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-600/10 via-transparent to-transparent" />
        
        {isEditing && (
          <div className="absolute inset-0 border-2 border-purple-500/50 rounded-lg pointer-events-none z-20" />
        )}
        
        <div className="relative max-w-6xl mx-auto px-6 z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              {/* Logo */}
              {(content.logoUrl || isEditing) && (
                <div className="mb-8">
                  {content.logoUrl ? (
                    <div className="relative inline-block">
                      <img src={content.logoUrl} alt="Logo" className="h-10 object-contain" />
                      {isEditing && (
                        <button
                          onClick={() => setLogoUploaderOpen(true)}
                          className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors"
                        >
                          <Camera className="w-2.5 h-2.5 text-white" />
                        </button>
                      )}
                    </div>
                  ) : isEditing ? (
                    <button
                      onClick={() => setLogoUploaderOpen(true)}
                      className="w-[120px] h-[48px] flex flex-col items-center justify-center gap-1 border-2 border-dashed border-slate-600 rounded-lg hover:border-purple-400 hover:bg-purple-500/10 transition-all text-slate-400 hover:text-purple-400"
                    >
                      <Image className="w-5 h-5" />
                      <span className="text-xs font-medium">Add Logo</span>
                    </button>
                  ) : null}
                </div>
              )}
              
              {/* Headline */}
              <h1
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => handleBlur("headline", e)}
                className={`text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 ${isEditing ? "cursor-text hover:ring-2 hover:ring-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded px-2" : ""}`}
              >
                {content.headline}
              </h1>
              
              {/* Subheadline */}
              <p
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => handleBlur("subheadline", e)}
                className={`text-xl text-slate-300 mb-8 leading-relaxed ${isEditing ? "cursor-text hover:ring-2 hover:ring-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded px-2" : ""}`}
              >
                {content.subheadline}
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-8">
                <Button 
                  size="lg" 
                  className={`px-8 py-6 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl shadow-lg shadow-purple-500/25 ${isEditing ? "outline-dashed outline-2 outline-purple-500/30" : ""}`}
                >
                  <span
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={(e) => handleBlur("ctaText", e)}
                  >
                    {content.ctaText}
                  </span>
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                
                {content.secondaryCTA?.text && (
                  <Button variant="outline" size="lg" className="px-8 py-6 text-lg border-slate-600 text-slate-300 hover:bg-slate-800 rounded-xl">
                    {content.secondaryCTA.text}
                  </Button>
                )}
              </div>
              
              {/* Social proof strip */}
              <div className="flex items-center gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-2">4.9/5 rating</span>
                </div>
                <span>•</span>
                <span>Trusted by 10,000+ teams</span>
              </div>
            </div>
            
            {/* Right: Product image/screenshot placeholder */}
            <div className="relative">
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 shadow-2xl">
                {content.backgroundImage ? (
                  <img src={content.backgroundImage} alt="Product" className="rounded-xl w-full" />
                ) : (
                  <div className="aspect-video bg-slate-700 rounded-xl flex items-center justify-center">
                    {isEditing ? (
                      <Button
                        variant="ghost"
                        onClick={() => setImagePickerOpen(true)}
                        className="text-slate-400 hover:text-white"
                      >
                        <ImagePlus className="w-6 h-6 mr-2" />
                        Add Product Screenshot
                      </Button>
                    ) : (
                      <span className="text-slate-500">Product Screenshot</span>
                    )}
                  </div>
                )}
              </div>
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-3xl -z-10" />
            </div>
          </div>
        </div>

        <ImagePicker
          open={imagePickerOpen}
          onClose={() => setImagePickerOpen(false)}
          onSelect={handleImageSelect}
          defaultQuery="software dashboard"
        />

        <LogoUploader
          isOpen={logoUploaderOpen}
          onClose={() => setLogoUploaderOpen(false)}
          currentLogoUrl={content.logoUrl || undefined}
          onApplyLogo={handleLogoApply}
        />
      </section>
    );
  }

  // Healthcare or Consulting: PREMIUM Light mode layout
  if (isHealthcare || isConsulting) {
    const accentColor = isHealthcare ? 'teal' : 'violet';
    
    return (
      <section 
        className={`relative min-h-[85vh] flex items-center overflow-hidden ${
          content.backgroundImage 
            ? '' 
            : 'bg-gradient-to-br from-slate-50 via-white to-slate-50'
        }`}
      >
        {/* Background Image Layer (if provided) */}
        {content.backgroundImage && (
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${content.backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {showDarkOverlay && (
              <div className="absolute inset-0 bg-black/60" />
            )}
          </div>
        )}
        
        {/* Subtle gradient orbs - visual anchors (only when no bg image) */}
        {!content.backgroundImage && (
          <>
            <div className={`absolute top-20 right-[10%] w-[500px] h-[500px] rounded-full blur-3xl opacity-20 ${
              isHealthcare ? 'bg-teal-400' : 'bg-violet-500'
            }`} />
            <div className={`absolute bottom-10 left-[5%] w-[300px] h-[300px] rounded-full blur-3xl opacity-10 ${
              isHealthcare ? 'bg-cyan-400' : 'bg-indigo-500'
            }`} />
          </>
        )}
        
        {isEditing && (
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
            <Button size="sm" onClick={() => setImagePickerOpen(true)}>
              <ImagePlus className="h-4 w-4 mr-2" />
              {content.backgroundImage ? 'Change' : 'Add'} Background
            </Button>
            {hasBackgroundImage && (
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
                <Layers className="h-4 w-4 text-slate-600" />
                <Label htmlFor="overlay-toggle" className="text-sm text-slate-700 whitespace-nowrap">Dark Overlay</Label>
                <Switch
                  id="overlay-toggle"
                  checked={showDarkOverlay}
                  onCheckedChange={handleToggleOverlay}
                />
              </div>
            )}
          </div>
        )}
        
        {isEditing && (
          <div className={`absolute inset-0 border-2 ${isHealthcare ? 'border-teal-500/50' : 'border-violet-500/50'} rounded-lg pointer-events-none z-10`} />
        )}

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Content - 7 columns (asymmetric split) */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Logo */}
              {(content.logoUrl || isEditing) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-2"
                >
                  {content.logoUrl ? (
                    <div className="relative inline-block">
                      <img 
                        src={content.logoUrl} 
                        alt="Logo" 
                        className={`${logoSizeClasses[logoSize]} object-contain`}
                      />
                      {isEditing && (
                        <button
                          onClick={() => setLogoUploaderOpen(true)}
                          className={`absolute -bottom-1 -right-1 w-6 h-6 ${isHealthcare ? 'bg-teal-500 hover:bg-teal-600' : 'bg-violet-500 hover:bg-violet-600'} rounded-full flex items-center justify-center transition-colors shadow-md`}
                        >
                          <Camera className="w-3 h-3 text-white" />
                        </button>
                      )}
                    </div>
                  ) : isEditing ? (
                    <button
                      onClick={() => setLogoUploaderOpen(true)}
                      className={`w-[120px] h-[48px] flex flex-col items-center justify-center gap-1 border-2 border-dashed rounded-lg transition-all ${
                        isHealthcare 
                          ? 'border-slate-300 hover:border-teal-400 hover:bg-teal-50/50 text-slate-400 hover:text-teal-600'
                          : 'border-slate-300 hover:border-violet-400 hover:bg-violet-50/50 text-slate-400 hover:text-violet-600'
                      }`}
                    >
                      <Image className="w-5 h-5" />
                      <span className="text-xs font-medium">Add Logo</span>
                    </button>
                  ) : null}
                </motion.div>
              )}
              
              {/* Eyebrow / Category tag */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex items-center gap-3"
              >
                <div className={`h-px w-12 ${isHealthcare ? 'bg-teal-500' : 'bg-violet-500'}`} />
                <span className={`text-sm font-medium tracking-wide uppercase ${
                  hasBackgroundImage && showDarkOverlay ? 'text-slate-300' : 'text-slate-500'
                }`}>
                  {isHealthcare ? 'Healthcare Cybersecurity' : 'Strategic Solutions'}
                </span>
              </motion.div>
              
              {/* Headline with highlight treatment */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => handleBlur("headline", e)}
                className={`text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight ${
                  hasBackgroundImage && showDarkOverlay ? 'text-white' : 'text-slate-900'
                } ${isEditing ? `cursor-text hover:ring-2 hover:ring-${accentColor}-400 focus:outline-none focus:ring-2 focus:ring-${accentColor}-400 rounded px-2` : ""}`}
              >
                <HeadlineWithHighlight 
                  text={content.headline}
                  highlightColor={accentColor}
                  mode={hasBackgroundImage && showDarkOverlay ? 'dark' : 'light'}
                />
              </motion.h1>
              
              {/* Subheadline with breathing room */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => handleBlur("subheadline", e)}
                className={`text-xl lg:text-2xl leading-relaxed max-w-xl ${
                  hasBackgroundImage && showDarkOverlay ? 'text-slate-300' : 'text-slate-600'
                } ${isEditing ? `cursor-text hover:ring-2 hover:ring-${accentColor}-400 focus:outline-none focus:ring-2 focus:ring-${accentColor}-400 rounded px-2` : ""}`}
              >
                {content.subheadline}
              </motion.p>
              
              {/* CTA Cluster - not a lonely button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-4"
              >
                <Button 
                  size="lg" 
                  className={`group px-8 py-6 rounded-xl font-semibold text-lg transition-all duration-300 hover:-translate-y-0.5 ${
                    isHealthcare 
                      ? 'bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40' 
                      : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40'
                  } ${isEditing ? `outline-dashed outline-2 outline-${accentColor}-500/30` : ""}`}
                >
                  <span
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={(e) => handleBlur("ctaText", e)}
                  >
                    {content.ctaText}
                  </span>
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
                
                {/* Secondary action */}
                <a 
                  href="#how-it-works" 
                  className={`flex items-center gap-2 font-medium transition-colors ${
                    hasBackgroundImage && showDarkOverlay 
                      ? 'text-slate-300 hover:text-white' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <PlayCircle className="w-5 h-5" />
                  See how it works
                </a>
              </motion.div>
              
              {/* Trust micro-copy */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className={`flex items-center gap-6 pt-2 text-sm ${
                  hasBackgroundImage && showDarkOverlay ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-green-500" />
                  No credit card required
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-green-500" />
                  Free consultation
                </span>
              </motion.div>
            </div>
            
            {/* Visual element - 5 columns (asymmetric) */}
            <div className="lg:col-span-5 relative hidden lg:block">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className={`relative aspect-square rounded-3xl ${
                  hasBackgroundImage && showDarkOverlay 
                    ? 'bg-white/5 backdrop-blur-sm' 
                    : 'bg-gradient-to-br from-slate-100 to-slate-200'
                } p-8 shadow-2xl`}
              >
                {/* Abstract representation - sophisticated placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-40 h-40 rounded-full border-4 ${
                    isHealthcare ? 'border-teal-500/30' : 'border-violet-500/30'
                  } flex items-center justify-center animate-pulse`}>
                    <div className={`w-28 h-28 rounded-full ${
                      isHealthcare ? 'bg-teal-500/20' : 'bg-violet-500/20'
                    } flex items-center justify-center`}>
                      <Shield className={`w-14 h-14 ${
                        isHealthcare ? 'text-teal-500' : 'text-violet-500'
                      }`} />
                    </div>
                  </div>
                </div>
                
                {/* Decorative rings */}
                <div className={`absolute inset-8 rounded-full border ${
                  isHealthcare ? 'border-teal-500/10' : 'border-violet-500/10'
                }`} />
                <div className={`absolute inset-16 rounded-full border ${
                  isHealthcare ? 'border-teal-500/5' : 'border-violet-500/5'
                }`} />
              </motion.div>
            </div>
          </div>
        </div>

        <ImagePicker
          open={imagePickerOpen}
          onClose={() => setImagePickerOpen(false)}
          onSelect={handleImageSelect}
          defaultQuery={isHealthcare ? "healthcare security" : "professional consulting"}
        />

        <LogoUploader
          isOpen={logoUploaderOpen}
          onClose={() => setLogoUploaderOpen(false)}
          currentLogoUrl={content.logoUrl || undefined}
          onApplyLogo={handleLogoApply}
        />
      </section>
    );
  }

  return (
    <section 
      className={`relative overflow-hidden ${isEditing ? "" : ""}`}
      style={{
        backgroundColor: 'hsl(217, 33%, 6%)',
        minHeight: '100vh',
      }}
    >
      {/* Premium Background Layer */}
      <div className="absolute inset-0 z-0">
        {/* Gradient Mesh Background */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(at 40% 20%, hsla(189, 95%, 43%, 0.15) 0px, transparent 50%),
              radial-gradient(at 80% 0%, hsla(270, 95%, 60%, 0.12) 0px, transparent 50%),
              radial-gradient(at 0% 50%, hsla(189, 95%, 43%, 0.08) 0px, transparent 50%),
              radial-gradient(at 100% 100%, hsla(270, 95%, 60%, 0.08) 0px, transparent 50%)
            `,
          }}
        />
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        
        {/* Floating Orbs */}
        <div 
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] animate-float-slow"
          style={{ backgroundColor: 'hsla(189, 95%, 43%, 0.08)' }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[100px] animate-float-delayed"
          style={{ backgroundColor: 'hsla(270, 95%, 60%, 0.06)' }}
        />
      </div>

      {/* Background Image Layer (if provided) */}
      {content.backgroundImage && (
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${content.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {showDarkOverlay && (
            <div 
              className="absolute inset-0 bg-black/60" 
            />
          )}
        </div>
      )}
      
      {isEditing && (
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <Button
            size="sm"
            onClick={() => setImagePickerOpen(true)}
          >
            <ImagePlus className="h-4 w-4 mr-2" />
            {content.backgroundImage ? 'Change' : 'Add'} Background
          </Button>
          
          {/* Dark overlay toggle - only show when bg image exists */}
          {hasBackgroundImage && (
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
              <Layers className="h-4 w-4 text-slate-600" />
              <Label htmlFor="overlay-toggle" className="text-sm text-slate-700 whitespace-nowrap">Dark Overlay</Label>
              <Switch
                id="overlay-toggle"
                checked={showDarkOverlay}
                onCheckedChange={handleToggleOverlay}
              />
            </div>
          )}
        </div>
      )}
      
      {isEditing && (
        <div className="absolute inset-0 border-2 border-cyan-500/50 rounded-lg pointer-events-none z-10" />
      )}

      {/* Content Layer */}
      <div className={`container mx-auto max-w-5xl text-center relative z-10 px-6 ${
        isConsulting ? 'py-32' : 'py-32 min-h-screen flex items-center'
      }`}>
        <div className="flex flex-col items-center gap-8 w-full">
          
          {/* Logo - positioned above trust badge (or add logo button if in edit mode) */}
          {(content.logoUrl || isEditing) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-2 relative"
            >
              {content.logoUrl ? (
                <div className="relative inline-flex flex-col items-center gap-2">
                  <img 
                    src={content.logoUrl} 
                    alt="Logo" 
                    className={`${logoSizeClasses[logoSize]} mx-auto object-contain`}
                    onError={(e) => {
                      console.log('Logo failed to load:', content.logoUrl);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {isEditing && (
                    <>
                      <button
                        onClick={() => setLogoUploaderOpen(true)}
                        className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors shadow-md"
                        title="Change logo"
                      >
                        <Camera className="w-3 h-3 text-white" />
                      </button>
                      {/* Logo size selector */}
                      <Select value={logoSize} onValueChange={(v) => handleLogoSizeChange(v as LogoSize)}>
                        <SelectTrigger className="w-24 h-7 text-xs bg-white/90 backdrop-blur-sm border-slate-200">
                          <SelectValue placeholder="Size" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200">
                          <SelectItem value="small" className="text-xs">Small</SelectItem>
                          <SelectItem value="medium" className="text-xs">Medium</SelectItem>
                          <SelectItem value="large" className="text-xs">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </>
                  )}
                </div>
              ) : isEditing ? (
                <button
                  onClick={() => setLogoUploaderOpen(true)}
                  className={`w-[120px] h-[48px] flex flex-col items-center justify-center gap-1 border-2 border-dashed rounded-lg transition-all ${
                    useLightText 
                      ? 'border-slate-500 hover:border-cyan-400 hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-400'
                      : 'border-slate-300 hover:border-cyan-400 hover:bg-cyan-50/50 text-slate-400 hover:text-cyan-600'
                  }`}
                >
                  <Image className="w-5 h-5" />
                  <span className="text-xs font-medium">Add Logo</span>
                </button>
              ) : null}
            </motion.div>
          )}

          {/* Trust Badge - Consulting specific credential (dark version for light backgrounds) */}
          {isConsulting && trustBadge && !useLightText && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full"
            >
              <Award className="w-4 h-4 text-amber-600" strokeWidth={1.5} />
              <span 
                className={`text-sm font-medium text-slate-700 ${isEditing ? 'cursor-text hover:ring-2 hover:ring-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded px-1' : ''}`}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => handleBlur("trustBadge", e)}
              >
                {trustBadge}
              </span>
            </motion.div>
          )}
          
          {/* Trust Badge - light version for dark backgrounds (when overlay is active) */}
          {isConsulting && trustBadge && useLightText && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
            >
              <Award className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
              <span 
                className={`text-sm font-medium text-white ${isEditing ? 'cursor-text hover:ring-2 hover:ring-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded px-1' : ''}`}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => handleBlur("trustBadge", e)}
              >
                {trustBadge}
              </span>
            </motion.div>
          )}

          {/* Eyebrow Badge - Non-consulting */}
          {!isConsulting && content.fomo?.badge && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                backgroundColor: 'hsla(189, 95%, 43%, 0.1)',
                borderColor: 'hsla(189, 95%, 43%, 0.2)',
                borderWidth: '1px',
                borderStyle: 'solid',
              }}
            >
              <Sparkles className="w-4 h-4 text-cyan-400" strokeWidth={1.5} />
              <span className="text-sm font-medium tracking-wide text-cyan-400">
                {content.fomo.badge}
              </span>
            </motion.div>
          )}

          {/* Cited Stat */}
          {content.citedStat && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className={`inline-block rounded-2xl p-6 ${
                useLightText
                  ? 'bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                  : 'bg-white border border-slate-200 shadow-sm'
              }`}
            >
              <div className={`text-4xl md:text-5xl font-bold mb-2 ${useLightText ? 'text-white' : 'text-slate-900'}`}>
                {content.citedStat.statistic}
              </div>
              <div className={`text-base mb-3 ${useLightText ? 'text-white/80' : 'text-slate-600'}`}>
                {content.citedStat.claim}
              </div>
              <cite className={`text-xs not-italic ${useLightText ? 'text-white/60' : 'text-slate-400'}`}>
                Source: {content.citedStat.fullCitation}
              </cite>
            </motion.div>
          )}
          
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className={`font-bold tracking-tight leading-[1.1] max-w-4xl ${
              isConsulting 
                ? 'text-4xl sm:text-5xl md:text-6xl' 
                : 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl'
            } ${isEditing ? "outline-dashed outline-2 outline-cyan-500/30 rounded px-2" : ""}`}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => handleBlur("headline", e)}
            style={{ 
              color: useLightText ? 'white' : '#0f172a',
              fontFamily: isConsulting ? tokens.typography.headingFont : undefined,
            }}
          >
            {content.headline}
          </motion.h1>
          
          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className={`max-w-3xl leading-relaxed ${
              isConsulting ? 'text-xl md:text-2xl' : 'text-lg md:text-xl lg:text-2xl'
            } ${isEditing ? "outline-dashed outline-2 outline-cyan-500/30 rounded px-2" : ""}`}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => handleBlur("subheadline", e)}
            style={{ color: useLightText ? 'rgba(255,255,255,0.85)' : '#475569' }}
          >
            {content.subheadline}
          </motion.p>
          
          {/* CTA Group */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            {/* Primary CTA */}
            <div className="relative group">
              <Button 
                size="lg" 
                className={`relative overflow-hidden text-lg px-10 py-7 h-auto font-semibold transition-all duration-300 hover:scale-[1.02] ${
                  isConsulting
                    ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:shadow-xl rounded-xl'
                    : 'bg-brand-gradient shadow-brand-glow hover:shadow-brand-glow-lg'
                } ${isEditing ? "outline-dashed outline-2 outline-cyan-500/30" : ""}`}
              >
                <span
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => handleBlur("ctaText", e)}
                  className="relative z-10"
                >
                  {content.ctaText}
                </span>
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" strokeWidth={2} />
                
                {/* Shimmer Effect - only for non-consulting */}
                {!isConsulting && (
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
                )}
              </Button>
            </div>

            {/* Secondary CTA - only show if configured */}
            {content.secondaryCTA?.text && (
              <Button
                variant="ghost"
                size="lg"
                className={`transition-all text-lg px-8 py-7 h-auto ${
                  useLightText
                    ? 'text-white/80 hover:text-white hover:bg-white/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {content.secondaryCTA.text}
              </Button>
            )}
            
            {/* Urgency text */}
            {content.fomo?.urgency && (
              <p className={`text-sm font-medium sm:ml-4 ${useLightText ? 'text-cyan-400' : 'text-slate-600'}`}>
                ⚡ {content.fomo.urgency}
              </p>
            )}
          </motion.div>

          {/* Trust Indicators */}
          {(credibilityItems.length > 0 || trustBadges.length > 0) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-wrap justify-center gap-x-8 gap-y-3 pt-6"
            >
              {credibilityItems.map((item, i) => (
                <div 
                  key={i} 
                  className={`flex items-center gap-2 text-sm ${useLightText ? 'text-white/70' : 'text-slate-500'}`}
                >
                  <CheckCircle className={`w-4 h-4 ${useLightText ? 'text-cyan-400' : 'text-green-600'}`} strokeWidth={1.5} />
                  <span
                    className={isEditing ? 'cursor-text hover:ring-2 hover:ring-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded px-1' : ''}
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const newItems = [...credibilityItems];
                      newItems[i] = { ...newItems[i], text: e.currentTarget.textContent || item.text };
                      onUpdate({ ...content, credibilityBar: newItems });
                    }}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
              {trustBadges.map((badge, i) => {
                const icons = [Shield, Clock, Award];
                const Icon = icons[i % icons.length];
                return (
                  <div key={i} className={`flex items-center gap-2 text-sm ${useLightText ? 'text-white/70' : 'text-slate-500'}`}>
                    <CheckCircle className={`w-4 h-4 ${useLightText ? 'text-cyan-400' : 'text-green-600'}`} strokeWidth={1.5} />
                    <span
                      className={isEditing ? 'cursor-text hover:ring-2 hover:ring-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded px-1' : ''}
                      contentEditable={isEditing}
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const newBadges = [...trustBadges];
                        newBadges[i] = e.currentTarget.textContent || badge;
                        onUpdate({ ...content, trustBadges: newBadges });
                      }}
                    >
                      {badge}
                    </span>
                  </div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>

      {/* Image Attribution */}
      {content.imageAttribution && (
        <p className={`absolute bottom-4 left-1/2 -translate-x-1/2 text-xs z-10 ${useLightText ? 'text-white/50' : 'text-slate-500'}`}>
          Photo by{' '}
          <a
            href={content.imageAttribution.photographerLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`underline transition-colors ${useLightText ? 'hover:text-white/70' : 'hover:text-slate-400'}`}
          >
            {content.imageAttribution.photographerName}
          </a>
          {' '}on Unsplash
        </p>
      )}

      <ImagePicker
        open={imagePickerOpen}
        onClose={() => setImagePickerOpen(false)}
        onSelect={handleImageSelect}
        defaultQuery="business professional"
      />

      <LogoUploader
        isOpen={logoUploaderOpen}
        onClose={() => setLogoUploaderOpen(false)}
        currentLogoUrl={content.logoUrl || undefined}
        onApplyLogo={handleLogoApply}
      />
    </section>
  );
}
