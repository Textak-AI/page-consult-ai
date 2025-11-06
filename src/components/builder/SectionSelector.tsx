import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, ChevronRight, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { HeroVariant1 } from "@/components/sections/hero/HeroVariant1";
import { HeroVariant2 } from "@/components/sections/hero/HeroVariant2";
import { HeroVariant3 } from "@/components/sections/hero/HeroVariant3";
import { HeroVariant4 } from "@/components/sections/hero/HeroVariant4";
import { HeroVariant5 } from "@/components/sections/hero/HeroVariant5";

interface SectionSelectorProps {
  userHeadline?: string;
  userSubheadline?: string;
  onContinue: (selectedVariant: number) => void;
}

interface HeroVariant {
  id: number;
  name: string;
  description: string;
  component: React.ComponentType<any>;
}

const heroVariants: HeroVariant[] = [
  {
    id: 1,
    name: "Corporate Clean",
    description: "Professional split layout ideal for B2B SaaS and tech companies",
    component: HeroVariant1,
  },
  {
    id: 2,
    name: "Bold Image",
    description: "Full-width impact perfect for e-commerce and consumer brands",
    component: HeroVariant2,
  },
  {
    id: 3,
    name: "Portfolio Showcase",
    description: "Visual-first design for creatives, events, and photographers",
    component: HeroVariant3,
  },
  {
    id: 4,
    name: "Local Trust",
    description: "Community-focused layout for service businesses and contractors",
    component: HeroVariant4,
  },
  {
    id: 5,
    name: "Minimal Elegant",
    description: "Sophisticated centered design for professional services",
    component: HeroVariant5,
  },
];

export function SectionSelector({ 
  userHeadline = "Your Business Headline",
  userSubheadline = "Your compelling subheadline goes here",
  onContinue 
}: SectionSelectorProps) {
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [showBanner, setShowBanner] = useState(true);
  const { toast } = useToast();

  const handleSelect = (variantId: number) => {
    setSelectedVariant(variantId);
    toast({
      title: "✓ Hero style selected!",
      description: "You can customize colors, text, and images next.",
    });
  };

  const handleContinue = () => {
    if (selectedVariant) {
      localStorage.setItem('selectedHeroVariant', selectedVariant.toString());
      onContinue(selectedVariant);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-sm font-semibold text-primary mb-2">STEP 1 OF 4</p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Choose Your Hero Style
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Pick what feels closest to your vision
          </p>
        </div>

        {/* Reassurance Banner */}
        {showBanner && (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8 relative">
            <button
              onClick={() => setShowBanner(false)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3 pr-8">
              <span className="text-2xl">💡</span>
              <div>
                <p className="text-sm text-foreground font-medium">
                  Don't worry - you can customize colors, text, and images after you choose.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  This just picks the layout that works best for your business.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Variant Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {heroVariants.map((variant) => {
            const isSelected = selectedVariant === variant.id;
            const VariantComponent = variant.component;

            return (
              <Card
                key={variant.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                  isSelected 
                    ? 'ring-2 ring-primary shadow-lg' 
                    : 'hover:ring-1 hover:ring-muted-foreground/20'
                }`}
                onClick={() => handleSelect(variant.id)}
              >
                <CardContent className="p-4">
                  {/* Preview */}
                  <div className="relative overflow-hidden rounded-lg mb-4 h-[200px] bg-muted">
                    <div className="scale-[0.3] origin-top-left w-[1000px] h-[667px]">
                      <VariantComponent
                        headline={userHeadline}
                        subheadline={userSubheadline}
                        ctaText="Get Started"
                        ctaLink="#"
                      />
                    </div>
                    
                    {/* Selected Overlay */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                        <div className="bg-primary text-primary-foreground rounded-full p-3">
                          <Check className="w-8 h-8" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Variant Info */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-lg text-foreground">
                        {variant.name}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-xs bg-accent/50 text-accent-foreground px-2 py-1 rounded-full whitespace-nowrap">
                        <Pencil className="w-3 h-3" />
                        Editable
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {variant.description}
                    </p>

                    {/* Select Button */}
                    <Button
                      variant={isSelected ? "default" : "outline"}
                      className="w-full mt-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(variant.id);
                      }}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Selected
                        </>
                      ) : (
                        "Select This Style"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            disabled={!selectedVariant}
            onClick={handleContinue}
            className="text-lg px-8"
          >
            Continue to Features
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
