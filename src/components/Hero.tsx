import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { Link } from "react-router-dom";
import { AnimatedChatPreview } from "@/components/AnimatedChatPreview";

const Hero = () => {
  return (
    <section className="pt-32 pb-24 px-6 bg-gradient-to-b from-[hsl(var(--hero-gradient-start))] to-[hsl(var(--hero-gradient-end))]">
      <div className="container mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Landing Pages That Start With{" "}
              <span className="text-gradient">Strategy</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              AI consultant asks intelligent questions, then builds professional
              pages proven to convert. No templates. No guesswork.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <Button asChild variant="hero" size="lg" className="text-base w-full sm:w-auto">
                <Link to="/wizard">
                  Try AI Consultant - Free Demo
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base w-full sm:w-auto">
                <a href="#demo">
                  <Play className="w-4 h-4 mr-2" />
                  Watch How It Works
                </a>
              </Button>
            </div>
          </div>

          <div className="animate-scale-in">
            <AnimatedChatPreview />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
