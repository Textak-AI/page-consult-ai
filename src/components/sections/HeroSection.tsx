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
        backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.75)), url(${content.backgroundImage})`,
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
        content.backgroundImage 
          ? 'text-white' 
          : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
      } ${isEditing ? "relative" : ""}`}
      style={backgroundStyle}
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
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-sm font-medium text-cyan-300 backdrop-blur-sm"
          >
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            {content.fomo.badge}
          </motion.div>
        )}
        
        {content.citedStat && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl"
          >
            <div className="text-4xl md:text-5xl font-bold text-cyan-400 mb-2">
              {content.citedStat.statistic}
            </div>
            <div className="text-base text-gray-300 mb-3">
              {content.citedStat.claim}
            </div>
            <cite className="text-xs text-gray-400 not-italic">
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
            textShadow: content.backgroundImage ? '0 4px 30px rgba(0,0,0,0.5), 0 2px 10px rgba(0,0,0,0.3)' : 'none' 
          }}
        >
          <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            {content.headline}
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className={`text-lg md:text-xl lg:text-2xl leading-relaxed max-w-3xl mx-auto text-gray-300 ${
            isEditing ? "outline-dashed outline-2 outline-primary/30 rounded px-2" : ""
          }`}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) => handleBlur("subheadline", e)}
          style={{ 
            textShadow: content.backgroundImage ? '0 2px 10px rgba(0,0,0,0.4)' : 'none' 
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
            className={`text-lg px-12 py-7 h-auto font-semibold bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 ${
              isEditing ? "outline-dashed outline-2 outline-primary/30" : ""
            }`}
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
            <p className="text-sm text-cyan-400 font-medium">
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
                className="flex items-center gap-2 text-sm md:text-base text-gray-300"
              >
                <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0" />
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
                <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                  <Icon className="w-3.5 h-3.5 text-cyan-600" />
                  <span>{badge}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {content.imageAttribution && (
          <p className="text-xs text-gray-500 mt-8">
            Photo by{' '}
            <a
              href={content.imageAttribution.photographerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-400"
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
