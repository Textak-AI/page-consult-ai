import { Button } from "@/components/ui/button";
import { ImagePicker } from "@/components/editor/ImagePicker";
import { useState } from "react";
import { ImagePlus, Shield, Clock, Award, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const getButtonTextColor = (primaryColor: string): string => {
  const hex = primaryColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#1E293B' : '#FFFFFF';
};

interface CitedStat {
  statistic: string;
  claim: string;
  source: string;
  year: number;
  fullCitation: string;
}

import type { IndustryVariant } from '@/config/designSystem/industryVariants';

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
  const isConsulting = content.industryVariant === 'consulting';
  
  // Debug logging
  console.log('🎨 [HeroSection] content.industryVariant:', content.industryVariant);
  console.log('🎨 [HeroSection] isConsulting:', isConsulting);

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

  const credibilityItems = content.credibilityBar || [];
  const trustBadges = content.trustBadges || [];

  // Consulting: Light mode, warm backgrounds
  // Default: Dark SaaS style
  const sectionStyles = isConsulting
    ? { backgroundColor: '#fafaf9' } // stone-50
    : { backgroundColor: 'hsl(217, 33%, 6%)' };

  const textStyles = isConsulting
    ? { primary: '#1c1917', secondary: '#57534e', accent: '#0d9488' } // stone-900, stone-600, teal-600
    : { primary: 'white', secondary: 'hsl(215, 20%, 65%)', accent: '#22d3ee' };

  return (
    <section 
      className={`min-h-screen flex items-center relative overflow-hidden ${isEditing ? "" : ""}`}
      style={sectionStyles}
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
      <div className="container mx-auto max-w-5xl text-center relative z-10 px-6 py-32">
        <div className="flex flex-col items-center gap-8">
          
          {/* Logo */}
          {content.logoUrl && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img 
                src={content.logoUrl} 
                alt="Company logo" 
                className="h-12 md:h-16 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </motion.div>
          )}

          {/* Eyebrow Badge */}
          {content.fomo?.badge && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                isConsulting 
                  ? 'bg-teal-50 border border-teal-200' 
                  : 'bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-sm'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${isConsulting ? 'text-teal-600' : 'text-cyan-400'}`} strokeWidth={1.5} />
              <span className={`text-sm font-medium tracking-wide ${isConsulting ? 'text-teal-700' : 'text-cyan-400'}`}>
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
                  ? 'bg-white border border-stone-200 shadow-sm'
                  : 'bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
              }`}
            >
              <div className={`text-4xl md:text-5xl font-bold mb-2 ${isConsulting ? 'text-teal-600' : 'text-gradient-premium'}`}>
                {content.citedStat.statistic}
              </div>
              <div className={`text-base mb-3 ${isConsulting ? 'text-stone-600' : 'text-slate-300'}`}>
                {content.citedStat.claim}
              </div>
              <cite className={`text-xs not-italic ${isConsulting ? 'text-stone-400' : 'text-slate-500'}`}>
                Source: {content.citedStat.fullCitation}
              </cite>
            </motion.div>
          )}
          
          {/* Headline — THE STATEMENT */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem] font-bold tracking-tight leading-[1.1] max-w-4xl ${
              isEditing ? "outline-dashed outline-2 outline-cyan-500/30 rounded px-2" : ""
            }`}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => handleBlur("headline", e)}
            style={{ 
              color: textStyles.primary,
              fontFamily: isConsulting ? '"Source Serif 4", Georgia, serif' : undefined,
              textShadow: isConsulting ? 'none' : '0 4px 40px hsla(0, 0%, 0%, 0.5)',
            }}
          >
            {content.headline}
          </motion.h1>
          
          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className={`text-lg md:text-xl lg:text-2xl max-w-2xl leading-relaxed ${
              isEditing ? "outline-dashed outline-2 outline-cyan-500/30 rounded px-2" : ""
            }`}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => handleBlur("subheadline", e)}
            style={{ color: textStyles.secondary }}
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
                    ? 'bg-teal-600 hover:bg-teal-700 shadow-md hover:shadow-lg'
                    : 'bg-brand-gradient shadow-brand-glow hover:shadow-brand-glow-lg'
                } ${isEditing ? "outline-dashed outline-2 outline-cyan-500/30" : ""}`}
                style={{
                  color: 'white',
                  borderRadius: isConsulting ? '8px' : '12px',
                }}
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
                    ? 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                {content.secondaryCTA.text}
              </Button>
            )}
            
            {/* Urgency text */}
            {content.fomo?.urgency && (
              <p className={`text-sm font-medium sm:ml-4 ${isConsulting ? 'text-teal-600' : 'text-brand'}`}>
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
              className="flex flex-wrap justify-center gap-6 pt-6"
            >
              {credibilityItems.map((item, i) => (
                <div 
                  key={i} 
                  className={`flex items-center gap-2 text-sm ${isConsulting ? 'text-stone-500' : 'text-slate-400'}`}
                >
                  <CheckCircle className={`w-4 h-4 ${isConsulting ? 'text-teal-500' : 'text-cyan-400'}`} strokeWidth={1.5} />
                  <span>{item.text}</span>
                </div>
              ))}
              {trustBadges.map((badge, i) => {
                const icons = [Shield, Clock, Award];
                const Icon = icons[i % icons.length];
                return (
                  <div key={i} className={`flex items-center gap-2 text-sm ${isConsulting ? 'text-stone-500' : 'text-slate-400'}`}>
                    <Icon className={`w-4 h-4 ${isConsulting ? 'text-teal-500' : 'text-cyan-400'}`} strokeWidth={1.5} />
                    <span>{badge}</span>
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
    </section>
  );
}
