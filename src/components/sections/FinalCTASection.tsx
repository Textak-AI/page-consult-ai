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
    <section className={`py-20 px-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground relative overflow-hidden ${
      isEditing ? "relative" : ""
    }`}>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
      {isEditing && (
        <div className="absolute inset-0 border-2 border-secondary/80 rounded-lg pointer-events-none z-10" />
      )}
      <div className="container mx-auto max-w-4xl text-center space-y-8 relative z-10">
        <h2 
          className={`text-5xl font-bold ${
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
            className={`text-lg px-12 py-6 h-auto shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 ${
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
