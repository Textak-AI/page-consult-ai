import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  content: {
    headline: string;
    subheadline: string;
    ctaText: string;
    ctaLink: string;
  };
  onUpdate: (content: any) => void;
}

export function HeroSection({ content }: HeroSectionProps) {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto max-w-4xl text-center space-y-6">
        <h1 className="text-5xl font-bold leading-tight">
          {content.headline}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {content.subheadline}
        </p>
        <div className="pt-4">
          <Button size="lg" className="text-lg px-8">
            {content.ctaText}
          </Button>
        </div>
      </div>
    </section>
  );
}
