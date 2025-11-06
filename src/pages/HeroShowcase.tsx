import { HeroVariant1 } from "@/components/sections/hero/HeroVariant1";
import { HeroVariant2 } from "@/components/sections/hero/HeroVariant2";
import { HeroVariant3 } from "@/components/sections/hero/HeroVariant3";
import { HeroVariant4 } from "@/components/sections/hero/HeroVariant4";
import { HeroVariant5 } from "@/components/sections/hero/HeroVariant5";

const HeroShowcase = () => {
  const sampleProps = {
    variant1: {
      headline: "Transform Your Business with Enterprise-Grade Solutions",
      subheadline: "Streamline operations, boost productivity, and scale effortlessly with our AI-powered platform trusted by industry leaders.",
      ctaText: "Start Free Trial",
      ctaLink: "#demo",
      backgroundImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80",
    },
    variant2: {
      headline: "Discover Your Perfect Style Today",
      subheadline: "Premium quality, unbeatable prices, and free shipping on orders over $50. Shop the collection everyone's talking about.",
      ctaText: "Shop Now",
      ctaLink: "#shop",
      backgroundImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80",
    },
    variant3: {
      headline: "Capturing Life's Most Beautiful Moments",
      subheadline: "Award-winning photography that tells your unique story with artistry and emotion.",
      ctaText: "View Portfolio",
      ctaLink: "#portfolio",
      backgroundImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80",
    },
    variant4: {
      headline: "Serving Denver Since 1998",
      subheadline: "Fast, reliable, and affordable HVAC services you can trust. Family-owned and locally operated with same-day emergency service available.",
      ctaText: "Call Now",
      ctaLink: "tel:+15551234567",
      backgroundImage: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1600&q=80",
    },
    variant5: {
      headline: "Excellence in Legal Representation",
      subheadline: "Providing sophisticated legal counsel with personalized attention to protect your interests and achieve your goals.",
      ctaText: "Schedule Consultation",
      ctaLink: "#contact",
      backgroundImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1600&q=80",
    },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary py-12 px-6">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Hero Component Showcase
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            5 professional hero variants designed for different industries and use cases. 
            Each variant is production-ready and optimized for conversion.
          </p>
        </div>
      </div>

      {/* Variant 1 - Corporate Clean */}
      <div className="border-b-8 border-primary/20">
        <div className="bg-muted py-8 px-6 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">Variant 1: Corporate Clean</h2>
          <p className="text-muted-foreground">B2B SaaS • Split Layout • Trust-Focused</p>
        </div>
        <HeroVariant1 {...sampleProps.variant1} />
      </div>

      {/* Variant 2 - Bold Image */}
      <div className="border-b-8 border-primary/20">
        <div className="bg-muted py-8 px-6 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">Variant 2: Bold Image</h2>
          <p className="text-muted-foreground">B2C Ecommerce • Full-Width • Emotional</p>
        </div>
        <HeroVariant2 {...sampleProps.variant2} />
      </div>

      {/* Variant 3 - Portfolio Showcase */}
      <div className="border-b-8 border-primary/20">
        <div className="bg-muted py-8 px-6 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">Variant 3: Portfolio Showcase</h2>
          <p className="text-muted-foreground">Creative/Events • Visual-First • Elegant</p>
        </div>
        <HeroVariant3 {...sampleProps.variant3} />
      </div>

      {/* Variant 4 - Local Trust */}
      <div className="border-b-8 border-primary/20">
        <div className="bg-muted py-8 px-6 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">Variant 4: Local Trust</h2>
          <p className="text-muted-foreground">Service Business • Community-Focused • Call-to-Action</p>
        </div>
        <HeroVariant4 {...sampleProps.variant4} />
      </div>

      {/* Variant 5 - Minimal Elegant */}
      <div className="border-b-8 border-primary/20">
        <div className="bg-muted py-8 px-6 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">Variant 5: Minimal Elegant</h2>
          <p className="text-muted-foreground">Professional Services • Sophisticated • Authority</p>
        </div>
        <HeroVariant5 {...sampleProps.variant5} />
      </div>

      {/* Footer */}
      <div className="bg-foreground text-background py-12 px-6 text-center">
        <p className="text-lg">
          All variants are fully responsive, accessible, and production-ready.
        </p>
      </div>
    </div>
  );
};

export default HeroShowcase;
