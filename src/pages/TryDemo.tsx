import { Link } from "react-router-dom";
import { IntelligenceProvider } from "@/contexts/IntelligenceContext";
import LiveDemoSection from "@/components/landing/LiveDemoSection";
import { Sparkles } from "lucide-react";

export default function TryDemo() {
  return (
    <IntelligenceProvider>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Minimal header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
          <div className="container mx-auto px-4 h-14 flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                PageConsult
              </span>
            </Link>

            {/* Sign In link */}
            <Link
              to="/signup"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
          </div>
        </header>

        {/* Full-page demo */}
        <main className="flex-1 pt-14">
          <LiveDemoSection />
        </main>
      </div>
    </IntelligenceProvider>
  );
}
