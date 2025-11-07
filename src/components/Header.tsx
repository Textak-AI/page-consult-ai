import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import logo from "@/assets/pageconsult-logo.svg";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-lg" : "bg-white/95 backdrop-blur-sm shadow-sm"
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-[72px]">
          <a href="/" className="flex items-center gap-3 py-2 hover:opacity-80 transition-opacity">
            <img src={logo} alt="PageConsult AI" className="h-12 w-auto" />
            <span className="text-2xl font-bold text-foreground hidden sm:inline">PageConsult AI</span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-foreground hover:text-primary transition-colors duration-200"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-foreground hover:text-primary transition-colors duration-200"
            >
              Pricing
            </a>
            <a
              href="#demo"
              className="text-foreground hover:text-primary transition-colors duration-200"
            >
              Demo
            </a>
          </nav>

          <Button variant="hero" size="default">
            Start Free
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
