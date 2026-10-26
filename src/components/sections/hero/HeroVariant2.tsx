import { Button } from "@/components/ui/button";

interface HeroVariant2Props {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage?: string;
}

export function HeroVariant2({ headline, subheadline, ctaText, ctaLink, backgroundImage }: HeroVariant2Props) {
  const backgroundStyle = backgroundImage
    ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)',
      };

  return (
    <section 
      className="py-20 md:py-32 px-6 min-h-[700px] flex items-center justify-center"
      style={backgroundStyle}
    >
      <div className="container mx-auto max-w-6xl text-center">
        <div className="space-y-8">
          <h1 
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight max-w-4xl mx-auto"
            style={{ textShadow: '2px 2px 12px rgba(0,0,0,0.9)' }}
          >
            {headline}
          </h1>
          
          <p 
            className="text-xl md:text-2xl text-white/95 leading-relaxed max-w-3xl mx-auto"
            style={{ textShadow: '2px 2px 12px rgba(0,0,0,0.9)' }}
          >
            {subheadline}
          </p>

          {/* CTA Button */}
          <div className="pt-6">
            <Button 
              asChild 
              size="lg" 
              className="text-xl px-12 py-7 bg-white text-primary hover:bg-white/90 shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <a href={ctaLink}>{ctaText}</a>
            </Button>
          </div>

          {/* Social proof renders only from real user-supplied data; nothing fabricated */}
        </div>
      </div>
    </section>
  );
}
