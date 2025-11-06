import { Button } from "@/components/ui/button";
import { MapPin, Phone, Award, Clock } from "lucide-react";

interface HeroVariant4Props {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage?: string;
}

export function HeroVariant4({ headline, subheadline, ctaText, ctaLink, backgroundImage }: HeroVariant4Props) {
  const backgroundStyle = backgroundImage
    ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        background: 'linear-gradient(135deg, hsl(var(--primary)/0.1) 0%, hsl(var(--background)) 50%, hsl(var(--secondary)/0.1) 100%)',
      };

  return (
    <section 
      className="py-20 md:py-20 px-6 min-h-[600px] flex items-center"
      style={backgroundStyle}
    >
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content - Left 50% */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-white" />
              <span className="text-sm font-semibold uppercase tracking-wide text-white" style={{ textShadow: '2px 2px 12px rgba(0,0,0,0.9)' }}>
                Proudly Serving Your Community
              </span>
            </div>

            <h1 
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight"
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

            {/* Phone Number - Prominent */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 inline-block transition-transform duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <Phone className="w-6 h-6 text-white" />
                <div>
                  <p className="text-sm text-white/80" style={{ textShadow: '2px 2px 12px rgba(0,0,0,0.9)' }}>
                    Call Us Today
                  </p>
                  <a 
                    href="tel:+15551234567" 
                    className="text-2xl font-bold text-white hover:text-primary transition-colors"
                    style={{ textShadow: '2px 2px 12px rgba(0,0,0,0.9)' }}
                  >
                    (555) 123-4567
                  </a>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Button 
                asChild 
                size="lg" 
                className="text-lg px-8 bg-primary hover:bg-primary/90 shadow-lg transition-all duration-300 hover:scale-105"
              >
                <a href={ctaLink}>
                  <Phone className="w-5 h-5 mr-2" />
                  {ctaText}
                </a>
              </Button>
            </div>

            {/* Local Trust Signals */}
            <div className="flex flex-wrap gap-6 pt-6">
              <div className="flex items-center gap-2 text-white/95">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-medium" style={{ textShadow: '2px 2px 12px rgba(0,0,0,0.9)' }}>
                  25+ Years Serving
                </span>
              </div>
              <div className="flex items-center gap-2 text-white/95">
                <Award className="w-5 h-5" />
                <span className="text-sm font-medium" style={{ textShadow: '2px 2px 12px rgba(0,0,0,0.9)' }}>
                  BBB A+ Rated
                </span>
              </div>
            </div>
          </div>

          {/* Location/Map - Right 50% */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-2xl transition-transform duration-300 hover:scale-105">
            <div className="aspect-square bg-gradient-to-br from-primary/30 to-secondary/30 rounded-xl flex items-center justify-center">
              <div className="text-white/50 text-center">
                <MapPin className="w-24 h-24 mx-auto mb-4" />
                <p className="text-sm" style={{ textShadow: '2px 2px 12px rgba(0,0,0,0.9)' }}>
                  Service Area Map
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
