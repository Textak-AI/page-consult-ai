import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[hsl(var(--hero-gradient-start))] to-[hsl(var(--hero-gradient-end))]">
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
            <div className="flex flex-col sm:flex-row gap-4">
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
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl rounded-full"></div>
              <div className="relative bg-card rounded-2xl shadow-xl p-6 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xl">🤖</span>
                    </div>
                    <div className="flex-1">
                      <div className="h-3 bg-muted rounded-full w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded-full w-1/2"></div>
                    </div>
                  </div>
                  <div className="bg-card rounded-lg p-4 shadow-sm">
                    <div className="h-2 bg-muted rounded-full w-full mb-2"></div>
                    <div className="h-2 bg-muted rounded-full w-5/6"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-muted rounded-lg h-20"></div>
                    <div className="flex-1 bg-muted rounded-lg h-20"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
