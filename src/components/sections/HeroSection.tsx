import { Button } from "@/components/ui/button";
import { ImagePicker } from "@/components/editor/ImagePicker";
import { useState } from "react";
import { ImagePlus, Shield, Clock, Award, CheckCircle } from "lucide-react";
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
  };
  onUpdate: (content: any) => void;
  isEditing?: boolean;
}

export function HeroSection({ content, onUpdate, isEditing }: HeroSectionProps) {
  const [imagePickerOpen, setImagePickerOpen] = useState(false);

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

  // No longer using inline backgroundStyle - we render background as a separate div for better control

  // Only show credibility items if explicitly provided - NO FABRICATION
  const credibilityItems = content.credibilityBar || [];
  
  // Only show trust badges if explicitly provided in brief - NO FABRICATION
  const trustBadges = content.trustBadges || [];

  return (
    <section 
      className={`min-h-[85vh] flex items-center relative ${isEditing ? "" : ""}`}
      style={{
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text-primary)',
        padding: 'var(--spacing-section-y) var(--spacing-section-x)',
      }}
    >
      {/* Background Image Layer */}
      {content.backgroundImage && (
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${content.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Overlay for text readability - uses design system variables with lighter default for images */}
          <div 
            className="absolute inset-0" 
            style={{
              background: `linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(15, 23, 42, 0.4))`,
            }}
          />
        </div>
      )}
      
      {isEditing && (
        <>
          <div className="absolute inset-0 border-2 border-primary/50 rounded-lg pointer-events-none" />
          <Button
            className="absolute top-4 right-4 z-10"
            size="sm"
            onClick={() => setImagePickerOpen(true)}
          >
            <ImagePlus className="h-4 w-4 mr-2" />
            {content.backgroundImage ? 'Change' : 'Add'} Background Image
          </Button>
        </>
      )}
      <div className="container mx-auto max-w-6xl text-center relative z-10" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-stack-gap)' }}>
        {/* Logo - only render if exists */}
        {content.logoUrl && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex justify-center mb-4"
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
        {content.fomo?.badge && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm backdrop-blur-sm mx-auto"
            style={{
              backgroundColor: 'var(--color-primary-muted)',
              borderColor: 'var(--color-primary)',
              borderWidth: 'var(--border-width)',
              borderStyle: 'solid',
              color: 'var(--color-primary)',
              borderRadius: 'var(--radius-large)',
              fontFamily: 'var(--font-body)',
              fontWeight: 'var(--font-weight-body)',
            }}
          >
            <span 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: 'var(--color-primary)' }}
            />
            {content.fomo.badge}
          </motion.div>
        )}
        
        {content.citedStat && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-block backdrop-blur-sm mx-auto"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              borderWidth: 'var(--border-width)',
              borderStyle: 'solid',
              borderRadius: 'var(--radius-large)',
              padding: 'var(--spacing-card-padding)',
              boxShadow: 'var(--shadow-large)',
            }}
          >
            <div 
              className="text-4xl md:text-5xl mb-2"
              style={{ 
                color: 'var(--color-primary)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 'var(--font-weight-heading)',
              }}
            >
              {content.citedStat.statistic}
            </div>
            <div 
              className="text-base mb-3"
              style={{ 
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-body)',
                lineHeight: 'var(--line-height-body)',
              }}
            >
              {content.citedStat.claim}
            </div>
            <cite 
              className="text-xs not-italic"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Source: {content.citedStat.fullCitation}
            </cite>
          </motion.div>
        )}
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl ${
            isEditing ? "outline-dashed outline-2 outline-primary/30 rounded px-2" : ""
          }`}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) => handleBlur("headline", e)}
          style={{ 
            textShadow: content.backgroundImage ? '0 4px 30px rgba(0,0,0,0.5), 0 2px 10px rgba(0,0,0,0.3)' : 'none',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--font-weight-heading)',
            lineHeight: 'var(--line-height-heading)',
            letterSpacing: 'var(--letter-spacing-heading)',
          }}
        >
          {content.headline}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className={`text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto ${
            isEditing ? "outline-dashed outline-2 outline-primary/30 rounded px-2" : ""
          }`}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) => handleBlur("subheadline", e)}
          style={{ 
            textShadow: content.backgroundImage ? '0 2px 10px rgba(0,0,0,0.4)' : 'none',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-body)',
            fontWeight: 'var(--font-weight-body)',
            lineHeight: 'var(--line-height-body)',
          }}
        >
          {content.subheadline}
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="pt-6"
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-stack-gap)', alignItems: 'center' }}
        >
          <Button 
            size="lg" 
            className={`text-lg px-12 py-7 h-auto font-semibold transition-all duration-300 hover:scale-105 ${
              isEditing ? "outline-dashed outline-2 outline-primary/30" : ""
            }`}
            style={{
              background: `linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))`,
              color: content.primaryColor ? getButtonTextColor(content.primaryColor) : 'var(--color-text-inverse)',
              boxShadow: 'var(--shadow-large)',
              borderRadius: 'var(--radius-small)',
              fontFamily: 'var(--font-body)',
            }}
          >
            <span
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("ctaText", e)}
            >
              {content.ctaText}
            </span>
          </Button>
          
          {content.fomo?.urgency && (
            <p 
              className="text-sm font-medium"
              style={{ color: 'var(--color-primary)' }}
            >
              ⚡ {content.fomo.urgency}
            </p>
          )}

          {/* Credibility Bar - only shown if data exists */}
          {credibilityItems.length > 0 && (
            <div className="flex flex-wrap justify-center pt-4" style={{ gap: 'var(--spacing-element-gap)' }}>
              {credibilityItems.map((item, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-2 text-sm md:text-base"
                  style={{ 
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <CheckCircle 
                    className="w-5 h-5 flex-shrink-0" 
                    style={{ color: 'var(--color-primary)' }}
                    strokeWidth={1.5}
                  />
                  <span className="font-medium">{item.text}</span>
                </motion.div>
              ))}
            </div>
          )}

          {/* Trust Badges - only shown if data exists, NO FABRICATION */}
          {trustBadges.length > 0 && (
            <div className="flex flex-wrap justify-center gap-6 pt-2">
              {trustBadges.map((badge, i) => {
                const icons = [Shield, Clock, Award];
                const Icon = icons[i % icons.length];
                return (
                  <div 
                    key={i} 
                    className="flex items-center gap-2 text-xs"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <Icon 
                      className="w-3.5 h-3.5" 
                      style={{ color: 'var(--color-primary)' }}
                      strokeWidth={1.5}
                    />
                    <span>{badge}</span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {content.imageAttribution && (
          <p 
            className="text-xs mt-8"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Photo by{' '}
            <a
              href={content.imageAttribution.photographerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-80"
            >
              {content.imageAttribution.photographerName}
            </a>
            {' '}on Unsplash
          </p>
        )}
      </div>

      <ImagePicker
        open={imagePickerOpen}
        onClose={() => setImagePickerOpen(false)}
        onSelect={handleImageSelect}
        defaultQuery="business professional"
      />
    </section>
  );
}
