import { Button } from "@/components/ui/button";
import { ImagePicker } from "@/components/editor/ImagePicker";
import { LogoUploader } from "@/components/editor/LogoUploader";
import { useState } from "react";
import { ImagePlus, Shield, Clock, Award, CheckCircle, ArrowRight, Sparkles, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { getIndustryTokens, type IndustryVariant } from "@/config/designSystem/industryVariants";

interface CitedStat {
  statistic: string;
  claim: string;
  source: string;
  year: number;
  fullCitation: string;
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
    trustBadge?: string; // Single trust badge for hero (credential)
    credibilityBar?: Array<{
      icon?: string;
      text: string;
    }>;
    primaryColor?: string;
    logoUrl?: string | null;
    secondaryCTA?: {
      type: string;
      text: string;
    } | null;
    industryVariant?: IndustryVariant;
  };
  onUpdate: (content: any) => void;
  isEditing?: boolean;
}

export function HeroSection({ content, onUpdate, isEditing }: HeroSectionProps) {
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [logoUploaderOpen, setLogoUploaderOpen] = useState(false);
  
  // Get industry tokens
  const industryVariant = content.industryVariant || 'default';
  const tokens = getIndustryTokens(industryVariant);
  const isLightMode = tokens.mode === 'light';
  const isConsulting = industryVariant === 'consulting';
  
  console.log('🎨 [HeroSection] industryVariant:', industryVariant, 'isLightMode:', isLightMode);

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
    });
  };

  const handleLogoApply = (logoUrl: string | null) => {
    onUpdate({
      ...content,
      logoUrl: logoUrl,
    });
  };

  const credibilityItems = content.credibilityBar || [];
  const trustBadges = content.trustBadges || [];
  
  // Single trust badge (credential) for consulting hero
  const trustBadge = content.trustBadge || content.fomo?.badge;

  return (
    <section 
      className={`relative overflow-hidden ${isEditing ? "" : ""}`}
      style={{
        backgroundColor: isConsulting ? 'white' : 'hsl(217, 33%, 6%)',
        minHeight: isConsulting ? 'auto' : '100vh',
      }}
    >
      {/* Premium Background Layer - only for non-consulting */}
      {!isConsulting && (
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
          <div 
            className="absolute inset-0" 
            style={{
              background: `linear-gradient(135deg, hsla(217, 33%, 6%, 0.85), hsla(217, 33%, 6%, 0.75))`,
            }}
          />
        </div>
      )}
      
      {isEditing && (
        <>
          <div className="absolute inset-0 border-2 border-cyan-500/50 rounded-lg pointer-events-none z-20" />
          <Button
            className="absolute top-4 right-4 z-20"
            size="sm"
            onClick={() => setImagePickerOpen(true)}
          >
            <ImagePlus className="h-4 w-4 mr-2" />
            {content.backgroundImage ? 'Change' : 'Add'} Background
          </Button>
        </>
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
                <div className="relative inline-block">
                  <img 
                    src={content.logoUrl} 
                    alt="Logo" 
                    className="h-12 md:h-14 mx-auto object-contain"
                    onError={(e) => {
                      console.log('Logo failed to load:', content.logoUrl);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {isEditing && (
                    <button
                      onClick={() => setLogoUploaderOpen(true)}
                      className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors shadow-md"
                      title="Change logo"
                    >
                      <Camera className="w-3 h-3 text-white" />
                    </button>
                  )}
                </div>
              ) : isEditing ? (
                <button
                  onClick={() => setLogoUploaderOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 hover:bg-blue-50/50 transition-colors text-slate-500 hover:text-blue-500"
                >
                  <Camera className="w-4 h-4" />
                  <span className="text-sm font-medium">Add Logo</span>
                </button>
              ) : null}
            </motion.div>
          )}

          {/* Trust Badge - Consulting specific credential */}
          {isConsulting && trustBadge && (
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
                isConsulting
                  ? 'bg-white border border-slate-200 shadow-sm'
                  : 'bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
              }`}
            >
              <div className={`text-4xl md:text-5xl font-bold mb-2 ${isConsulting ? 'text-slate-900' : 'text-gradient-premium'}`}>
                {content.citedStat.statistic}
              </div>
              <div className={`text-base mb-3 ${isConsulting ? 'text-slate-600' : 'text-slate-300'}`}>
                {content.citedStat.claim}
              </div>
              <cite className={`text-xs not-italic ${isConsulting ? 'text-slate-400' : 'text-slate-500'}`}>
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
              color: isConsulting ? '#0f172a' : 'white',
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
            style={{ color: isConsulting ? '#475569' : 'hsl(215, 20%, 65%)' }}
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
                  isConsulting
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                {content.secondaryCTA.text}
              </Button>
            )}
            
            {/* Urgency text */}
            {content.fomo?.urgency && (
              <p className={`text-sm font-medium sm:ml-4 ${isConsulting ? 'text-slate-600' : 'text-brand'}`}>
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
                  className={`flex items-center gap-2 text-sm ${isConsulting ? 'text-slate-500' : 'text-slate-400'}`}
                >
                  <CheckCircle className={`w-4 h-4 ${isConsulting ? 'text-green-600' : 'text-cyan-400'}`} strokeWidth={1.5} />
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
                  <div key={i} className={`flex items-center gap-2 text-sm ${isConsulting ? 'text-slate-500' : 'text-slate-400'}`}>
                    <CheckCircle className={`w-4 h-4 ${isConsulting ? 'text-green-600' : 'text-cyan-400'}`} strokeWidth={1.5} />
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
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs z-10 text-slate-500">
          Photo by{' '}
          <a
            href={content.imageAttribution.photographerLink}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-400 transition-colors"
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
