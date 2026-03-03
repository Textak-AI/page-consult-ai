import { Button } from "@/components/ui/button";
import { ImagePicker } from "@/components/editor/ImagePicker";
import { LogoUploader } from "@/components/editor/LogoUploader";
import { useState, useMemo } from "react";
import { ImagePlus, Shield, Clock, Award, CheckCircle, ArrowRight, Sparkles, Camera, Star, Image, Layers, PlayCircle, Check, HeartPulse, Factory, TrendingUp, Lightbulb, Palette, GraduationCap, ShoppingBag, Scale, Home, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { getIndustryTokens, type IndustryVariant } from "@/config/designSystem/industryVariants";

// Industry-aware hero icon mapping
const heroIconMap: Record<string, { icon: LucideIcon; label: string }> = {
  healthcare: { icon: HeartPulse, label: 'Patient Care' },
  saas: { icon: Layers, label: 'Platform' },
  manufacturing: { icon: Factory, label: 'Operations' },
  finance: { icon: TrendingUp, label: 'Growth' },
  fintech: { icon: TrendingUp, label: 'Growth' },
  consulting: { icon: Lightbulb, label: 'Strategy' },
  coaching: { icon: Lightbulb, label: 'Strategy' },
  creative: { icon: Palette, label: 'Design' },
  education: { icon: GraduationCap, label: 'Learning' },
  ecommerce: { icon: ShoppingBag, label: 'Commerce' },
  legal: { icon: Scale, label: 'Justice' },
  realestate: { icon: Home, label: 'Property' },
  'real-estate': { icon: Home, label: 'Property' },
  'local-services': { icon: Award, label: 'Service' },
  devtools: { icon: Layers, label: 'Developer Tools' },
};
const defaultHeroIcon = { icon: Sparkles, label: 'Innovation' };

function getHeroIcon(industryVariant: string): { icon: LucideIcon; label: string } {
  const key = industryVariant.toLowerCase();
  return heroIconMap[key] || 
    Object.entries(heroIconMap).find(([k]) => key.includes(k))?.[1] || 
    defaultHeroIcon;
}
import type { SDIPalette, SDISectionThemes, SDITypography } from '@/lib/designIntelligence/types';
import { HeroVisualComposition } from "@/components/sections/hero/HeroVisualComposition";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getAmbientHeroGradient } from "@/lib/industryPatterns";
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

// Helper to check if logo appears to be a dark logo that needs inversion on dark backgrounds
// Looks for "dark" in the filename OR assumes dark if mode is dark and we don't know
function shouldInvertLogoForDarkMode(logoUrl: string | null | undefined, isDarkMode: boolean): boolean {
  if (!isDarkMode || !logoUrl) return false;
  
  // Check if the logo URL contains 'dark' - these definitely need inversion
  const lowerUrl = logoUrl.toLowerCase();
  if (lowerUrl.includes('dark') || lowerUrl.includes('-dark') || lowerUrl.includes('_dark')) {
    return true;
  }
  
  // For SVGs on dark backgrounds, default to inverting since most logos are designed for light backgrounds
  // This is a heuristic - users can manually replace with light versions in the editor
  if (lowerUrl.endsWith('.svg')) {
    return true;
  }
  
  return false;
}

// Logo image component with dark mode support
function LogoImage({ 
  src, 
  alt, 
  className, 
  isDarkMode,
  onError 
}: { 
  src: string; 
  alt: string; 
  className: string; 
  isDarkMode: boolean;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}) {
  const shouldInvert = shouldInvertLogoForDarkMode(src, isDarkMode);
  
  return (
    <img 
      src={src} 
      alt={alt} 
      className={`${className}${shouldInvert ? ' brightness-0 invert' : ''}`}
      onError={onError}
    />
  );
}

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
    proofPoints?: {
      rating?: string;
      clientCount?: string;
      achievements?: string[];
      revenue?: string;
      satisfaction?: string;
    };
    primaryColor?: string;
    logoUrl?: string | null;
    logoSize?: LogoSize;
    darkOverlay?: boolean;
    secondaryCTA?: {
      type: string;
      text: string;
    } | null;
    industryVariant?: IndustryVariant;
    // SDI mode override - takes precedence over industry token mode
    mode?: 'light' | 'dark' | 'warm' | 'cold';
    // SDI Design System
    palette?: SDIPalette;
    sectionThemes?: SDISectionThemes;
    sdiTypography?: SDITypography;
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
  // PRIORITY: Consulting ALWAYS light mode, then SDI mode prop > industry token mode
  const isConsulting = industryVariant === 'consulting';
  const isHealthcare = industryVariant === 'healthcare';
  const isSaas = industryVariant === 'saas';
  const isLocalServices = industryVariant === 'local-services';
  
  // Force light mode for consulting - this is a design requirement
  const isLightMode = isConsulting 
    ? true 
    : (content.mode 
      ? (content.mode === 'light' || content.mode === 'warm')
      : tokens.mode === 'light');
  
  console.log('🎨 [HeroSection] Mode:', content.mode, 'isLightMode:', isLightMode, 'industryVariant:', industryVariant, 'forcedLight:', isConsulting);
  
  // AI hero images disabled — always use CSS gradient backgrounds
  // User-selected images (via editor) are still honored
  const ENABLE_HERO_BG_IMAGES = false;
  const hasBackgroundImage = ENABLE_HERO_BG_IMAGES && !!content.backgroundImage;
  const showDarkOverlay = hasBackgroundImage && (content.darkOverlay !== false);
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
  
  // SDI Typography - use passed typography or fallback
  const sdiTypography = content.sdiTypography;
  const heroHeadlineClass = sdiTypography?.heroHeadline || 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]';
  const heroSubheadlineClass = sdiTypography?.sectionSubtitle || 'text-lg md:text-xl lg:text-2xl leading-relaxed';

  console.log('🎨 [HeroSection] SDI Typography:', {
    received: !!content.sdiTypography,
    heroHeadline: content.sdiTypography?.heroHeadline,
    appliedClass: heroHeadlineClass,
  });

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
                    <LogoImage 
                      src={content.logoUrl} 
                      alt="Logo" 
                      className={logoSizeClasses[logoSize] + " object-contain mx-auto"} 
                      isDarkMode={!isLightMode}
                    />
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
              className={`${heroHeadlineClass} text-slate-900 mb-6 ${
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
              className={`${heroSubheadlineClass} text-slate-600 mb-8 max-w-3xl mx-auto ${
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

  // SaaS variant: Full-bleed hero with gradient background (same pattern as default)
  // Product screenshot is now an OPT-IN editor feature, not the default
  if (isSaas) {
    // Determine CTA button style - use brand color if available
    const ctaStyle = content.primaryColor 
      ? { backgroundColor: content.primaryColor, boxShadow: `0 10px 30px -10px ${content.primaryColor}66` }
      : undefined;
    const ctaClassName = content.primaryColor
      ? "px-8 py-6 text-lg font-semibold text-white rounded-xl shadow-lg hover:opacity-90 transition-opacity"
      : "px-8 py-6 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl shadow-lg shadow-purple-500/25";

    console.log('🎨 [HeroSection SaaS] primaryColor:', content.primaryColor, 'backgroundImage:', content.backgroundImage);

    return (
      <section 
        className="relative min-h-screen flex flex-col overflow-hidden"
        style={{
          background: !hasBackgroundImage 
            ? 'linear-gradient(135deg, hsl(265, 80%, 15%) 0%, hsl(220, 40%, 8%) 50%, hsl(210, 50%, 12%) 100%)'
            : 'hsl(217, 33%, 6%)',
        }}
      >
        {/* Minimal Top Nav Bar */}
        <nav className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-4 z-20 border-b border-white/10" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-3">
            {content.logoUrl ? (
              <LogoImage src={content.logoUrl} alt="Logo" className="h-7 object-contain" isDarkMode={true} />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                <span className="text-white/60 text-xs font-bold">★</span>
              </div>
            )}
            <span className="text-white text-sm font-medium tracking-wide">{content.headline?.split(' ').slice(0, 3).join(' ') || 'Product'}</span>
          </div>
          <Button
            size="sm"
            className="text-xs px-4 py-1.5 h-auto rounded-md font-medium bg-white hover:bg-white/90"
            style={content.primaryColor ? { backgroundColor: '#fff', color: content.primaryColor } : { color: '#7c3aed' }}
            onClick={() => {
              const ctaEl = document.getElementById('contact');
              if (ctaEl) ctaEl.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {content.ctaText || 'Get Started Free'}
          </Button>
        </nav>

        {/* Background Image Layer (if provided) - FULL BLEED */}
        {hasBackgroundImage && (
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${content.backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
          </div>
        )}
        
        {/* Premium gradient mesh when no background image */}
        {!hasBackgroundImage && (
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-blue-900/20" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-600/15 via-transparent to-transparent" />
            {/* Brand-colored orbs */}
            <div 
              className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-15"
              style={{ backgroundColor: content.primaryColor || '#7c3aed' }}
            />
            <div 
              className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] opacity-10"
              style={{ backgroundColor: content.primaryColor || '#3b82f6' }}
            />
          </div>
        )}
        
        {isEditing && (
          <>
            <div className="absolute inset-0 border-2 border-purple-500/50 rounded-lg pointer-events-none z-20" />
            <div className="absolute top-4 right-4 z-20">
              <Button size="sm" onClick={() => setImagePickerOpen(true)}>
                <ImagePlus className="h-4 w-4 mr-2" />
                {hasBackgroundImage ? 'Change' : 'Add'} Background
              </Button>
            </div>
          </>
        )}
        
        {/* Content - Centered with max width */}
        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-32 z-10 text-center flex-1 flex flex-col justify-center">
          {/* Logo - only show standalone in editing mode (nav bar handles display mode) */}
          {isEditing && (
            <div className="mb-8">
              {content.logoUrl ? (
                <div className="relative inline-block">
                  <LogoImage 
                    src={content.logoUrl} 
                    alt="Logo" 
                    className={`${logoSizeClasses[logoSize]} object-contain mx-auto`}
                    isDarkMode={!isLightMode}
                  />
                  <button
                    onClick={() => setLogoUploaderOpen(true)}
                    className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors"
                  >
                    <Camera className="w-2.5 h-2.5 text-white" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setLogoUploaderOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:border-purple-400 hover:text-purple-400 transition-all"
                >
                  <Image className="w-4 h-4" />
                  Add Logo
                </button>
              )}
            </div>
          )}
          
          {/* Headline */}
          <h1
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => handleBlur("headline", e)}
            className={`${heroHeadlineClass} text-white mb-6 max-w-4xl mx-auto ${isEditing ? "cursor-text hover:ring-2 hover:ring-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded px-2" : ""}`}
          >
            {content.headline}
          </h1>
          
          {/* Subheadline */}
          <p
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => handleBlur("subheadline", e)}
            className={`${heroSubheadlineClass} text-slate-300 mb-10 max-w-3xl mx-auto ${isEditing ? "cursor-text hover:ring-2 hover:ring-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded px-2" : ""}`}
          >
            {content.subheadline}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mb-10">
            <Button 
              size="lg" 
              className={ctaClassName}
              style={ctaStyle}
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
              <Button 
                variant="outline" 
                size="lg" 
                className={`px-8 py-6 text-lg rounded-xl transition-all ${
                  content.primaryColor ? 'hover:opacity-80' : 'border-slate-600 text-slate-300 hover:bg-slate-800'
                }`}
                style={content.primaryColor ? { borderColor: content.primaryColor, color: content.primaryColor } : undefined}
              >
                {content.secondaryCTA.text}
              </Button>
            )}
          </div>
          
          {/* Social proof strip */}
          {/* Social proof strip - ONLY render if proof data exists */}
          {(content.proofPoints?.rating || content.proofPoints?.clientCount || content.proofPoints?.achievements?.length) && (
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
              {content.proofPoints?.rating && (
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-2">{content.proofPoints.rating}</span>
                </div>
              )}
              {content.proofPoints?.clientCount && (
                <>
                  {content.proofPoints?.rating && <span className="hidden sm:inline">•</span>}
                  <span>{content.proofPoints.clientCount}</span>
                </>
              )}
              {content.proofPoints?.achievements?.map((achievement: string, i: number) => (
                <span key={i} className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  {achievement}
                </span>
              ))}
            </div>
          )}
        </div>

        <ImagePicker
          open={imagePickerOpen}
          onClose={() => setImagePickerOpen(false)}
          onSelect={handleImageSelect}
          defaultQuery="software technology"
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

  // Consulting: Warm, credible, authority-first light mode layout
  if (isConsulting) {
    const hasBrandColor = !!content.primaryColor;
    
    return (
      <section 
        className={`relative min-h-[85vh] flex items-center overflow-hidden ${
          content.backgroundImage 
            ? '' 
            : 'bg-gradient-to-br from-white via-slate-50 to-white'
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
              <>
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 bg-gradient-to-r from-white from-5% via-white/95 via-40% to-white/30 to-90%" />
              </>
            )}
          </div>
        )}
        
        {/* Subtle warm gradient orbs - no glassmorphism */}
        {!content.backgroundImage && (
          <>
            <div 
              className="absolute top-20 right-[10%] w-[400px] h-[400px] rounded-full blur-3xl opacity-10"
              style={{ backgroundColor: content.primaryColor || '#94a3b8' }}
            />
            <div 
              className="absolute bottom-20 left-[5%] w-[250px] h-[250px] rounded-full blur-3xl opacity-8"
              style={{ backgroundColor: content.primaryColor || '#94a3b8' }}
            />
          </>
        )}
        
        {isEditing && (
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
            <Button size="sm" onClick={() => setImagePickerOpen(true)}>
              <ImagePlus className="h-4 w-4 mr-2" />
              {content.backgroundImage ? 'Change' : 'Add'} Background
            </Button>
            {hasBackgroundImage && (
              <div className="flex items-center gap-2 bg-white/90 rounded-lg px-3 py-2 shadow-md">
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
          <div className="absolute inset-0 border-2 border-blue-500/50 rounded-lg pointer-events-none z-10" />
        )}

        <div className="max-w-6xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-3xl">
            {/* Logo */}
            {(content.logoUrl || isEditing) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                {content.logoUrl ? (
                  <div className="relative inline-block">
                    <LogoImage 
                      src={content.logoUrl} 
                      alt="Logo" 
                      className={`${logoSizeClasses[logoSize]} object-contain`} 
                      isDarkMode={hasBackgroundImage && showDarkOverlay}
                    />
                    {isEditing && (
                      <button
                        onClick={() => setLogoUploaderOpen(true)}
                        className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors shadow-md"
                      >
                        <Camera className="w-3 h-3 text-white" />
                      </button>
                    )}
                  </div>
                ) : isEditing ? (
                  <button
                    onClick={() => setLogoUploaderOpen(true)}
                    className="w-[120px] h-[48px] flex flex-col items-center justify-center gap-1 border-2 border-dashed rounded-lg transition-all border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 text-slate-400 hover:text-blue-600"
                  >
                    <Image className="w-5 h-5" />
                    <span className="text-xs font-medium">Add Logo</span>
                  </button>
                ) : null}
              </motion.div>
            )}
            
            {/* Trust Badge */}
            {trustBadge && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-6"
              >
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                  hasBackgroundImage && showDarkOverlay 
                    ? 'bg-white/10 text-white border border-white/20' 
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  <Award className="w-4 h-4" />
                  {trustBadge}
                </span>
              </motion.div>
            )}
            
            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("headline", e)}
              className={`${heroHeadlineClass} mb-8 ${
                hasBackgroundImage && showDarkOverlay ? 'text-white' : 'text-slate-900'
              } ${isEditing ? "cursor-text hover:ring-2 hover:ring-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-2" : ""}`}
            >
              {content.headline}
            </motion.h1>
            
            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("subheadline", e)}
              className={`${heroSubheadlineClass} mb-8 max-w-2xl ${
                hasBackgroundImage && showDarkOverlay ? 'text-slate-200' : 'text-slate-600'
              } ${isEditing ? "cursor-text hover:ring-2 hover:ring-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-2" : ""}`}
            >
              {content.subheadline}
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8"
            >
              <Button 
                size="lg" 
                className={`group px-8 py-6 rounded-lg font-semibold text-lg transition-all shadow-md hover:shadow-lg ${
                  isEditing ? "outline-dashed outline-2 outline-blue-500/30" : ""
                }`}
                style={hasBrandColor 
                  ? { backgroundColor: content.primaryColor, color: 'white' }
                  : { backgroundColor: '#1E3A5F', color: 'white' }
                }
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
              
              {content.secondaryCTA && (
                <Button 
                  variant="outline" 
                  size="lg"
                  className={`px-8 py-6 text-lg font-semibold rounded-lg transition-all ${
                    hasBrandColor 
                      ? 'hover:opacity-80'
                      : hasBackgroundImage && showDarkOverlay 
                        ? 'border-white text-white hover:bg-white/10' 
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                  style={hasBrandColor ? { borderColor: content.primaryColor, color: content.primaryColor } : undefined}
                >
                  {content.secondaryCTA.text}
                </Button>
              )}
            </motion.div>
            
            {/* Trust micro-copy */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className={`flex flex-wrap items-center gap-6 text-sm ${
                hasBackgroundImage && showDarkOverlay ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Free consultation
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-600" />
                No commitment required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Response within 24 hours
              </span>
            </motion.div>
          </div>
        </div>

        <ImagePicker
          open={imagePickerOpen}
          onClose={() => setImagePickerOpen(false)}
          onSelect={handleImageSelect}
          defaultQuery="professional business consulting"
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

  // Healthcare: PREMIUM Light mode layout with teal accents
  if (isHealthcare) {
    return (
      <section 
        className={`relative min-h-[85vh] flex items-center overflow-hidden ${
          content.backgroundImage 
            ? '' 
            : 'bg-gradient-to-br from-slate-50 via-white to-slate-50'
        }`}
      >
        {/* Background Image Layer (if provided) — atmospheric with strong text-readability gradient */}
        {content.backgroundImage && (
          <div className="absolute inset-0 z-0">
            <img 
              src={content.backgroundImage} 
              alt="" 
              className="w-full h-full object-cover"
            />
            {/* Light mode: near-solid white on left for text readability, fading right to reveal image */}
            <div className="absolute inset-0 bg-gradient-to-r from-white from-5% via-white/95 via-40% to-white/30 to-90%" />
          </div>
        )}
        
        {/* Clean background — no blur orbs */}
        
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
          <div className="absolute inset-0 border-2 border-teal-500/50 rounded-lg pointer-events-none z-10" />
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
                      <LogoImage 
                        src={content.logoUrl} 
                        alt="Logo" 
                        className={`${logoSizeClasses[logoSize]} object-contain`} 
                        isDarkMode={!isLightMode}
                      />
                      {isEditing && (
                        <button
                          onClick={() => setLogoUploaderOpen(true)}
                          className="absolute -bottom-1 -right-1 w-6 h-6 bg-teal-500 hover:bg-teal-600 rounded-full flex items-center justify-center transition-colors shadow-md"
                        >
                          <Camera className="w-3 h-3 text-white" />
                        </button>
                      )}
                    </div>
                  ) : isEditing ? (
                    <button
                      onClick={() => setLogoUploaderOpen(true)}
                      className="w-[120px] h-[48px] flex flex-col items-center justify-center gap-1 border-2 border-dashed rounded-lg transition-all border-slate-300 hover:border-teal-400 hover:bg-teal-50/50 text-slate-400 hover:text-teal-600"
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
                <div className="h-px w-12" style={{ backgroundColor: content.primaryColor || '#14b8a6' }} />
                <span className={`text-sm font-medium tracking-wide uppercase ${
                  hasBackgroundImage && showDarkOverlay ? 'text-slate-300' : 'text-slate-500'
                }`}>
                  Healthcare Cybersecurity
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
                className={`${heroHeadlineClass} ${
                  hasBackgroundImage && showDarkOverlay ? 'text-white' : 'text-slate-900'
                } ${isEditing ? "cursor-text hover:ring-2 hover:ring-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400 rounded px-2" : ""}`}
              >
                <HeadlineWithHighlight 
                  text={content.headline}
                  highlightColor="teal"
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
                className={`${heroSubheadlineClass} max-w-xl ${
                  hasBackgroundImage && showDarkOverlay ? 'text-slate-300' : 'text-slate-600'
                } ${isEditing ? "cursor-text hover:ring-2 hover:ring-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400 rounded px-2" : ""}`}
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
                {(() => {
                  const hasBrandColor = !!content.primaryColor;
                  const ctaStyle = hasBrandColor 
                    ? { backgroundColor: content.primaryColor, boxShadow: `0 10px 30px -10px ${content.primaryColor}66` }
                    : undefined;
                  const ctaClassName = hasBrandColor
                    ? `group px-8 py-6 rounded-xl font-semibold text-lg transition-all duration-300 hover:-translate-y-0.5 text-white ${isEditing ? "outline-dashed outline-2 outline-cyan-500/30" : ""}`
                    : `group px-8 py-6 rounded-xl font-semibold text-lg transition-all duration-300 hover:-translate-y-0.5 bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 ${isEditing ? "outline-dashed outline-2 outline-cyan-500/30" : ""}`;
                  
                  return (
                    <Button 
                      size="lg" 
                      className={ctaClassName}
                      style={ctaStyle}
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
                  );
                })()}
                
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
            
            {/* Visual element - 5 columns: Brand Intelligence Card */}
            <div className="lg:col-span-5 relative flex items-center justify-center h-full">
              <HeroVisualComposition
                industry={content.industryVariant || industryVariant || 'Strategic Intelligence'}
                industryIcon={getHeroIcon(industryVariant).icon}
                primaryColor={content.primaryColor || '#14b8a6'}
                companyName={(content as any).companyName || (content as any).businessName || 'Page Analysis'}
                colorMode={isLightMode ? 'light' : 'dark'}
              />
            </div>
          </div>
        </div>

        <ImagePicker
          open={imagePickerOpen}
          onClose={() => setImagePickerOpen(false)}
          onSelect={handleImageSelect}
          defaultQuery="healthcare security"
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

  // Get industry-aware ambient gradient for when no background image is provided
  const industryKey = String(industryVariant).toLowerCase();
  const ambientGradient = useMemo(() => 
    getAmbientHeroGradient(industryVariant as any, isLightMode ? 'light' : 'dark'),
    [industryVariant, isLightMode]
  );

  // Industry-specific gradient mesh colors
  const getIndustryMeshColors = () => {
    if (industryKey.includes('manufactur')) {
      return {
        mesh: `radial-gradient(at 40% 20%, hsla(210, 80%, 35%, 0.15) 0px, transparent 50%),
               radial-gradient(at 80% 0%, hsla(35, 90%, 50%, 0.08) 0px, transparent 50%),
               radial-gradient(at 0% 50%, hsla(210, 80%, 35%, 0.08) 0px, transparent 50%)`,
        orb1: 'hsla(210, 80%, 35%, 0.08)',
        orb2: 'hsla(35, 90%, 50%, 0.06)',
      };
    }
    if (industryKey.includes('health')) {
      return {
        mesh: `radial-gradient(at 40% 20%, hsla(175, 70%, 45%, 0.12) 0px, transparent 50%),
               radial-gradient(at 80% 0%, hsla(195, 80%, 50%, 0.10) 0px, transparent 50%),
               radial-gradient(at 0% 50%, hsla(175, 70%, 45%, 0.08) 0px, transparent 50%)`,
        orb1: 'hsla(175, 70%, 45%, 0.08)',
        orb2: 'hsla(195, 80%, 50%, 0.06)',
      };
    }
    if (industryKey.includes('fintech') || industryKey.includes('finance')) {
      return {
        mesh: `radial-gradient(at 40% 20%, hsla(230, 70%, 60%, 0.15) 0px, transparent 50%),
               radial-gradient(at 80% 0%, hsla(170, 60%, 50%, 0.08) 0px, transparent 50%),
               radial-gradient(at 0% 50%, hsla(230, 70%, 60%, 0.10) 0px, transparent 50%)`,
        orb1: 'hsla(230, 70%, 60%, 0.08)',
        orb2: 'hsla(170, 60%, 50%, 0.06)',
      };
    }
    // Default SaaS/tech colors
    return {
      mesh: `radial-gradient(at 40% 20%, hsla(189, 95%, 43%, 0.15) 0px, transparent 50%),
             radial-gradient(at 80% 0%, hsla(270, 95%, 60%, 0.12) 0px, transparent 50%),
             radial-gradient(at 0% 50%, hsla(189, 95%, 43%, 0.08) 0px, transparent 50%),
             radial-gradient(at 100% 100%, hsla(270, 95%, 60%, 0.08) 0px, transparent 50%)`,
      orb1: 'hsla(189, 95%, 43%, 0.08)',
      orb2: 'hsla(270, 95%, 60%, 0.06)',
    };
  };

  const meshColors = getIndustryMeshColors();

  return (
    <section 
      className={`relative overflow-hidden ${isEditing ? "" : ""}`}
      style={{
        // Use industry-aware base color when no background image
        background: !hasBackgroundImage ? ambientGradient : 'hsl(217, 33%, 6%)',
        minHeight: '100vh',
      }}
    >
      {/* Premium Background Layer - only when no background image */}
      {!hasBackgroundImage && (
        <div className="absolute inset-0 z-0">
          {/* Gradient Mesh Background - industry-aware */}
          <div 
            className="absolute inset-0"
            style={{ background: meshColors.mesh }}
          />
          
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-40" />
          
          {/* Brand-colored floating orbs */}
          <div 
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] animate-float-slow"
            style={{ backgroundColor: content.primaryColor ? `${content.primaryColor}15` : meshColors.orb1 }}
          />
          <div 
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[100px] animate-float-delayed"
            style={{ backgroundColor: content.primaryColor ? `${content.primaryColor}10` : meshColors.orb2 }}
          />
        </div>
      )}

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
            <>
              {/* Base overlay */}
              <div className="absolute inset-0 bg-black/40" />
              {/* Text readability gradient panel - stronger on left/center where text lives */}
              <div className={`absolute inset-0 ${
                isLightMode 
                  ? 'bg-gradient-to-b from-white/80 via-white/60 to-white/40'
                  : 'bg-gradient-to-b from-slate-900/85 via-slate-900/70 to-slate-900/50'
              }`} />
            </>
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
                  <LogoImage 
                    src={content.logoUrl} 
                    alt="Logo" 
                    className={`${logoSizeClasses[logoSize]} mx-auto object-contain`} 
                    isDarkMode={!isLightMode}
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
            className={`${heroHeadlineClass} max-w-4xl ${isEditing ? "outline-dashed outline-2 outline-cyan-500/30 rounded px-2" : ""}`}
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
            className={`${heroSubheadlineClass} max-w-3xl ${isEditing ? "outline-dashed outline-2 outline-cyan-500/30 rounded px-2" : ""}`}
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
            {/* Primary CTA - Use brand color if available */}
            <div className="relative group">
              {(() => {
                // Determine CTA button styling based on brand color availability
                const hasBrandColor = !!content.primaryColor;
                const ctaStyle = hasBrandColor 
                  ? { backgroundColor: content.primaryColor, boxShadow: `0 10px 30px -10px ${content.primaryColor}66` }
                  : undefined;
                const ctaClassName = hasBrandColor
                  ? `relative overflow-hidden text-lg px-10 py-7 h-auto font-semibold text-white rounded-xl transition-all duration-300 hover:scale-[1.02] hover:opacity-90 ${isEditing ? "outline-dashed outline-2 outline-cyan-500/30" : ""}`
                  : `relative overflow-hidden text-lg px-10 py-7 h-auto font-semibold transition-all duration-300 hover:scale-[1.02] ${
                      isConsulting
                        ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:shadow-xl rounded-xl'
                        : 'bg-brand-gradient shadow-brand-glow hover:shadow-brand-glow-lg'
                    } ${isEditing ? "outline-dashed outline-2 outline-cyan-500/30" : ""}`;
                
                console.log('🎨 [HeroSection Default] primaryColor:', content.primaryColor);
                
                return (
                  <Button 
                    size="lg" 
                    className={ctaClassName}
                    style={ctaStyle}
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
                    
                    {/* Shimmer Effect - only for non-consulting and no brand color */}
                    {!isConsulting && !hasBrandColor && (
                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
                    )}
                  </Button>
                );
              })()}
            </div>

            {/* Secondary CTA - only show if configured */}
           {content.secondaryCTA?.text && (
              <Button
                variant="ghost"
                size="lg"
                className={`transition-all text-lg px-8 py-7 h-auto ${
                  content.primaryColor
                    ? 'hover:opacity-80'
                    : useLightText
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                style={content.primaryColor ? { color: content.primaryColor } : undefined}
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
