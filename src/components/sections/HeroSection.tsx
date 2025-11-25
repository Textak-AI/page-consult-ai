import { Button } from "@/components/ui/button";
import { ImagePicker } from "@/components/editor/ImagePicker";
import { useState } from "react";
import { ImagePlus } from "lucide-react";

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
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${content.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {};

  return (
    <section 
      className={`py-20 px-4 ${
        content.backgroundImage 
          ? 'text-white' 
          : 'bg-gradient-to-br from-primary/10 via-background to-secondary/10'
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
      <div className="container mx-auto max-w-4xl text-center space-y-6">
        {content.fomo?.badge && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-sm animate-pulse">
            {content.fomo.badge}
          </div>
        )}
        
        {content.citedStat && (
          <div className="inline-block bg-card/80 backdrop-blur-sm border border-border rounded-lg p-4 mb-4">
            <div className="text-4xl font-bold text-primary mb-1">
              {content.citedStat.statistic}
            </div>
            <div className="text-sm text-muted-foreground mb-2">
              {content.citedStat.claim}
            </div>
            <cite className="text-xs text-muted-foreground/70 not-italic">
              Source: {content.citedStat.fullCitation}
            </cite>
          </div>
        )}
        
        <h1
          className={`text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight ${
            isEditing ? "outline-dashed outline-2 outline-primary/30 rounded px-2" : ""
          }`}
          style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) => handleBlur("headline", e)}
        >
          {content.headline}
        </h1>
        <p 
          className={`text-lg md:text-xl lg:text-2xl leading-relaxed max-w-3xl mx-auto ${
            content.backgroundImage ? 'text-white/95' : 'text-muted-foreground'
          } ${
            isEditing ? "outline-dashed outline-2 outline-primary/30 rounded px-2" : ""
          }`}
          style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) => handleBlur("subheadline", e)}
        >
          {content.subheadline}
        </p>
        
        <div className="pt-4 space-y-3">
          <Button 
            size="lg" 
            className={`text-lg px-8 ${
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
            <p className="text-sm text-accent font-medium">
              ⚡ {content.fomo.urgency}
            </p>
          )}
        </div>

        {content.imageAttribution && (
          <p className="text-xs opacity-70 mt-8">
            Photo by{' '}
            <a
              href={content.imageAttribution.photographerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
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
