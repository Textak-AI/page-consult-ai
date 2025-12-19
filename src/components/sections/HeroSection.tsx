import { Button } from "@/components/ui/button";
import { ImagePicker } from "@/components/editor/ImagePicker";
import { useState } from "react";
import { ImagePlus, Shield, Clock, Award, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

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

  const backgroundStyle = content.backgroundImage
    ? {
        backgroundImage: `linear-gradient(135deg, var(--image-overlay-color, rgba(15, 23, 42, 0.85)), var(--image-overlay-color, rgba(15, 23, 42, 0.75))), url(${content.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
      }
    : {};

  // Default credibility items
  const credibilityItems = content.credibilityBar || [
    { icon: "check", text: "25+ Years Excellence" },
    { icon: "check", text: "5-Star Rated Service" },
    { icon: "check", text: "Locally Owned & Operated" }
  ];

  const defaultTrustBadges = content.trustBadges || [
    "100% Satisfaction Guarantee",
    "Same-Day Response",
    "Award-Winning Service"
  ];

  return (
    <section 
      className={`min-h-[85vh] flex items-center py-20 md:py-28 lg:py-32 px-4 ${
        isEditing ? "relative" : ""
      }`}
      style={{
        ...backgroundStyle,
        backgroundColor: content.backgroundImage ? undefined : 'var(--color-background, #0f172a)',
        color: 'var(--color-text-primary, white)',
      }}
    >
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
      <div className="container mx-auto max-w-6xl text-center space-y-8">
        {content.fomo?.badge && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium backdrop-blur-sm"
            style={{
              backgroundColor: 'var(--color-primary-muted, rgba(6, 182, 212, 0.1))',
              borderColor: 'var(--color-primary, #06b6d4)',
              borderWidth: '1px',
              color: 'var(--color-primary, #22d3ee)',
            }}
          >
            <span 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: 'var(--color-primary, #22d3ee)' }}
            />
            {content.fomo.badge}
          </motion.div>
        )}
        
        {content.citedStat && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-block backdrop-blur-sm rounded-2xl p-6 shadow-xl"
            style={{
              backgroundColor: 'var(--color-surface, rgba(255, 255, 255, 0.1))',
              borderColor: 'var(--color-border, rgba(255, 255, 255, 0.2))',
              borderWidth: '1px',
            }}
          >
            <div 
              className="text-4xl md:text-5xl font-bold mb-2"
              style={{ color: 'var(--color-primary, #22d3ee)' }}
            >
              {content.citedStat.statistic}
            </div>
            <div 
              className="text-base mb-3"
              style={{ color: 'var(--color-text-secondary, #d1d5db)' }}
            >
              {content.citedStat.claim}
            </div>
            <cite 
              className="text-xs not-italic"
              style={{ color: 'var(--color-text-muted, #9ca3af)' }}
            >
              Source: {content.citedStat.fullCitation}
            </cite>
          </motion.div>
        )}
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight ${
            isEditing ? "outline-dashed outline-2 outline-primary/30 rounded px-2" : ""
          }`}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) => handleBlur("headline", e)}
          style={{ 
            textShadow: content.backgroundImage ? '0 4px 30px rgba(0,0,0,0.5), 0 2px 10px rgba(0,0,0,0.3)' : 'none',
            color: 'var(--color-text-primary, white)',
          }}
        >
          {content.headline}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className={`text-lg md:text-xl lg:text-2xl leading-relaxed max-w-3xl mx-auto ${
            isEditing ? "outline-dashed outline-2 outline-primary/30 rounded px-2" : ""
          }`}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) => handleBlur("subheadline", e)}
          style={{ 
            textShadow: content.backgroundImage ? '0 2px 10px rgba(0,0,0,0.4)' : 'none',
            color: 'var(--color-text-secondary, #d1d5db)',
          }}
        >
          {content.subheadline}
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="pt-6 space-y-8"
        >
          <Button 
            size="lg" 
            className={`text-lg px-12 py-7 h-auto font-semibold shadow-xl transition-all duration-300 hover:scale-105 ${
              isEditing ? "outline-dashed outline-2 outline-primary/30" : ""
            }`}
            style={{
              background: `linear-gradient(135deg, var(--color-primary, #06b6d4), var(--color-primary-hover, #0891b2))`,
              color: 'var(--color-text-inverse, white)',
              boxShadow: '0 10px 30px -10px var(--color-primary, rgba(6, 182, 212, 0.4))',
              borderRadius: 'var(--radius-medium, 0.75rem)',
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
              style={{ color: 'var(--color-primary, #22d3ee)' }}
            >
              ⚡ {content.fomo.urgency}
            </p>
          )}

          {/* Credibility Bar */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 pt-4">
            {credibilityItems.map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-2 text-sm md:text-base"
                style={{ color: 'var(--color-text-secondary, #d1d5db)' }}
              >
                <CheckCircle 
                  className="w-5 h-5 flex-shrink-0" 
                  style={{ color: 'var(--color-primary, #22d3ee)' }}
                />
                <span className="font-medium">{item.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Trust Badges - smaller, below credibility */}
          <div className="flex flex-wrap justify-center gap-6 pt-2">
            {defaultTrustBadges.map((badge, i) => {
              const icons = [Shield, Clock, Award];
              const Icon = icons[i % icons.length];
              return (
                <div 
                  key={i} 
                  className="flex items-center gap-2 text-xs"
                  style={{ color: 'var(--color-text-muted, #6b7280)' }}
                >
                  <Icon 
                    className="w-3.5 h-3.5" 
                    style={{ color: 'var(--color-primary, #0891b2)' }}
                  />
                  <span>{badge}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {content.imageAttribution && (
          <p 
            className="text-xs mt-8"
            style={{ color: 'var(--color-text-muted, #6b7280)' }}
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