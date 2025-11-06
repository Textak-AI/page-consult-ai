import { Button } from "@/components/ui/button";
import { BadgeCheck, GraduationCap, Briefcase } from "lucide-react";

interface HeroVariant5Props {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage?: string;
}

export function HeroVariant5({ headline, subheadline, ctaText, ctaLink, backgroundImage }: HeroVariant5Props) {
  const backgroundStyle = backgroundImage
    ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        background: 'linear-gradient(to bottom, hsl(var(--background)), hsl(var(--muted)/0.3))',
      };

  return (
    <section 
      className="py-20 md:py-20 px-6 min-h-[650px] flex items-center"
      style={backgroundStyle}
    >
      <div className="container mx-auto max-w-4xl text-center">
        <div className="space-y-8">
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
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

          {/* Credentials - Centered */}
          <div className="flex flex-wrap items-center justify-center gap-8 pt-6">
            <div className="flex items-center gap-2 text-white/95">
              <GraduationCap className="w-6 h-6" />
              <span className="text-sm font-medium" style={{ textShadow: '2px 2px 12px rgba(0,0,0,0.9)' }}>
                Harvard Law
              </span>
            </div>
            <div className="flex items-center gap-2 text-white/95">
              <Briefcase className="w-6 h-6" />
              <span className="text-sm font-medium" style={{ textShadow: '2px 2px 12px rgba(0,0,0,0.9)' }}>
                30+ Years Experience
              </span>
            </div>
            <div className="flex items-center gap-2 text-white/95">
              <BadgeCheck className="w-6 h-6" />
              <span className="text-sm font-medium" style={{ textShadow: '2px 2px 12px rgba(0,0,0,0.9)' }}>
                Board Certified
              </span>
            </div>
          </div>

          {/* Understated CTA */}
          <div className="pt-8">
            <Button 
              asChild 
              size="lg" 
              className="text-lg px-10 bg-white/95 text-foreground hover:bg-white shadow-xl transition-all duration-300 hover:scale-105"
            >
              <a href={ctaLink}>{ctaText}</a>
            </Button>
          </div>

          {/* Subtle Secondary Action */}
          <div className="pt-4">
            <a 
              href="#contact" 
              className="text-white/90 hover:text-white underline underline-offset-4 transition-colors text-sm"
              style={{ textShadow: '2px 2px 12px rgba(0,0,0,0.9)' }}
            >
              Or schedule a consultation
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
