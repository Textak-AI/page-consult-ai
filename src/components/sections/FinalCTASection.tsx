import { Button } from "@/components/ui/button";

interface FinalCTASectionProps {
  content: {
    headline: string;
    ctaText: string;
    ctaLink: string;
  };
  onUpdate: (content: any) => void;
  isEditing?: boolean;
}

export function FinalCTASection({ content, onUpdate, isEditing }: FinalCTASectionProps) {
  const handleBlur = (field: string, e: React.FocusEvent<HTMLElement>) => {
    onUpdate({
      ...content,
      [field]: e.currentTarget.textContent || content[field as keyof typeof content],
    });
  };

  return (
    <section className={`py-20 px-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground ${
      isEditing ? "relative" : ""
    }`}>
      {isEditing && (
        <div className="absolute inset-0 border-2 border-secondary/80 rounded-lg pointer-events-none z-10" />
      )}
      <div className="container mx-auto max-w-3xl text-center space-y-6">
        <h2 
          className={`text-4xl font-bold ${
            isEditing ? "outline-dashed outline-2 outline-secondary/50 rounded px-2" : ""
          }`}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) => handleBlur("headline", e)}
        >
          {content.headline}
        </h2>
        <div className="pt-4">
          <Button 
            size="lg" 
            variant="secondary" 
            className={`text-lg px-8 ${
              isEditing ? "outline-dashed outline-2 outline-secondary/50" : ""
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
        </div>
      </div>
    </section>
  );
}
