import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 min-h-[72px]",
        isScrolled 
          ? "bg-slate-900/95 backdrop-blur-sm shadow-lg shadow-black/20" 
          : "bg-slate-900/80 backdrop-blur-sm shadow-sm"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid layout: 3 columns for stable positioning */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center h-[72px]">
          {/* Logo - fixed width container to prevent shift */}
          <div className="flex items-center justify-start">
            <a href="/" className="flex items-center py-2 hover:opacity-80 transition-opacity">
              <div className="h-8 w-32 flex items-center flex-shrink-0">
                <img 
                  src="/logo/whiteAsset_3combimark_darkmode.svg" 
                  alt="PageConsult AI" 
                  onLoad={() => setLogoLoaded(true)}
                  className={cn(
                    "h-8 w-auto transition-opacity duration-200",
                    logoLoaded ? "opacity-100" : "opacity-0"
                  )}
                />
              </div>
            </a>
          </div>

          {/* Navigation - centered column */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-gray-300 hover:text-white transition-all duration-300 relative group"
            >
              Features
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full" />
            </a>
            <a
              href="#pricing"
              className="text-gray-300 hover:text-white transition-all duration-300 relative group"
            >
              Pricing
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full" />
            </a>
            <a
              href="#demo"
              className="text-gray-300 hover:text-white transition-all duration-300 relative group"
            >
              Demo
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full" />
            </a>
            <Link
              to="/brand-setup"
              className="text-gray-300 hover:text-white transition-all duration-300 relative group"
            >
              Brand Setup
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full" />
            </Link>
          </nav>

          {/* Right side - fixed width for balance */}
          <div className="flex items-center justify-end gap-4">
            <Link 
              to="/signup?mode=login"
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              Login
            </Link>
            <Link to="/new">
              <Button 
                variant="default" 
                size="default" 
                className="bg-white text-slate-900 font-semibold px-6 py-2.5 rounded-xl shadow-xl shadow-white/20 hover:shadow-2xl hover:shadow-white/30 hover:scale-105 transition-all duration-300"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
