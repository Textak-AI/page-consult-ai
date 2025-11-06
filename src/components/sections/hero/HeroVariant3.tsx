import { Button } from "@/components/ui/button";
import { Award, Calendar } from "lucide-react";

interface HeroVariant3Props {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage?: string;
}

export function HeroVariant3({ headline, subheadline, ctaText, ctaLink, backgroundImage }: HeroVariant3Props) {
  const backgroundStyle = backgroundImage
    ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        background: 'linear-gradient(135deg, hsl(var(--primary)/0.2) 0%, hsl(var(--secondary)/0.2) 100%)',
      };

  return (
    <section 
      className="relative py-20 md:py-28 px-6 min-h-[700px] flex items-end"
      style={backgroundStyle}
    >
      <div className="container mx-auto max-w-6xl">
        {/* Text Content - Bottom Left */}
        <div className="max-w-2xl space-y-6 pb-8">
          <h1 
            className="text-4xl md:text-5xl font-bold text-white leading-tight"
            style={{ textShadow: '2px 2px 12px rgba(0,0,0,0.9)' }}
          >
            {headline}
          </h1>
          
          <p 
            className="text-lg md:text-xl text-white/95 leading-relaxed"
            style={{ textShadow: '2px 2px 12px rgba(0,0,0,0.9)' }}
          >
            {subheadline}
          </p>

          {/* Trust Signals */}
          <div className="flex flex-wrap gap-6 text-white/90">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span className="text-sm font-medium" style={{ textShadow: '2px 2px 12px rgba(0,0,0,0.9)' }}>
                15+ Years Experience
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              <span className="text-sm font-medium" style={{ textShadow: '2px 2px 12px rgba(0,0,0,0.9)' }}>
                Award-Winning Portfolio
              </span>
            </div>
          </div>

          {/* Subtle CTA */}
          <div className="pt-4">
            <Button 
              asChild 
              size="lg" 
              className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 shadow-lg"
            >
              <a href={ctaLink}>{ctaText}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
