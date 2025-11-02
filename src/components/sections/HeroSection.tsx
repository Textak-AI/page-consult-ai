import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  content: {
    headline: string;
    subheadline: string;
    ctaText: string;
    ctaLink: string;
    fomo?: {
      badge?: string;
      urgency?: string;
    };
  };
  onUpdate: (content: any) => void;
  isEditing?: boolean;
}

export function HeroSection({ content, onUpdate, isEditing }: HeroSectionProps) {
  const handleBlur = (field: string, e: React.FocusEvent<HTMLElement>) => {
    onUpdate({
      ...content,
      [field]: e.currentTarget.textContent || content[field as keyof typeof content],
    });
  };

  return (
    <section 
      className={`py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10 ${
        isEditing ? "relative" : ""
      }`}
    >
      {isEditing && (
        <div className="absolute inset-0 border-2 border-primary/50 rounded-lg pointer-events-none" />
      )}
      <div className="container mx-auto max-w-4xl text-center space-y-6">
        {content.fomo?.badge && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-sm animate-pulse">
            {content.fomo.badge}
          </div>
        )}
        
        <h1 
          className={`text-5xl font-bold leading-tight ${
            isEditing ? "outline-dashed outline-2 outline-primary/30 rounded px-2" : ""
          }`}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) => handleBlur("headline", e)}
        >
          {content.headline}
        </h1>
        <p 
          className={`text-xl text-muted-foreground max-w-2xl mx-auto ${
            isEditing ? "outline-dashed outline-2 outline-primary/30 rounded px-2" : ""
          }`}
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
      </div>
    </section>
  );
}
