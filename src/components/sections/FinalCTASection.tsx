import { Button } from "@/components/ui/button";

interface FinalCTASectionProps {
  content: {
    headline: string;
    ctaText: string;
    ctaLink: string;
  };
  onUpdate: (content: any) => void;
}

export function FinalCTASection({ content }: FinalCTASectionProps) {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
      <div className="container mx-auto max-w-3xl text-center space-y-6">
        <h2 className="text-4xl font-bold">{content.headline}</h2>
        <div className="pt-4">
          <Button size="lg" variant="secondary" className="text-lg px-8">
            {content.ctaText}
          </Button>
        </div>
      </div>
    </section>
  );
}
