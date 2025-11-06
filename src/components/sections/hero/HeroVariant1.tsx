import { Button } from "@/components/ui/button";
import { Shield, Users, TrendingUp } from "lucide-react";

interface HeroVariant1Props {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage?: string;
}

export function HeroVariant1({ headline, subheadline, ctaText, ctaLink, backgroundImage }: HeroVariant1Props) {
  const backgroundStyle = backgroundImage
    ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {};

  return (
    <section 
      className="py-20 px-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10"
      style={backgroundStyle}
    >
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-5 gap-12 items-center">
          {/* Text Content - 60% */}
          <div className="lg:col-span-3 space-y-6">
            <h1 
              className="text-5xl font-bold text-white leading-tight"
              style={{ textShadow: '2px 2px 12px rgba(0,0,0,0.9)' }}
            >
              {headline}
            </h1>
            <p 
              className="text-xl text-white/90 leading-relaxed max-w-2xl"
              style={{ textShadow: '2px 2px 12px rgba(0,0,0,0.9)' }}
            >
              {subheadline}
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                asChild 
                size="lg" 
                className="text-lg px-8 bg-primary hover:bg-primary/90 shadow-lg"
              >
                <a href={ctaLink}>{ctaText}</a>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <a href="#learn-more">Learn More</a>
              </Button>
            </div>

            {/* Trust Signals */}
            <div className="flex flex-wrap gap-6 pt-6">
              <div className="flex items-center gap-2 text-white/80">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">10,000+ Companies</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">99.9% Uptime</span>
              </div>
            </div>
          </div>

          {/* Visual/Image - 40% */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-2xl">
              <div className="aspect-square bg-gradient-to-br from-primary/30 to-secondary/30 rounded-xl flex items-center justify-center">
                <div className="text-white/50 text-center">
                  <TrendingUp className="w-24 h-24 mx-auto mb-4" />
                  <p className="text-sm">Product Visual</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
