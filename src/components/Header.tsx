import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { supabase } from "@/integrations/supabase/client";
import { Plus, LogOut, User, Settings, ChevronDown, Zap, LayoutDashboard, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { credits } = useCredits(user?.id ?? null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate('/');
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    }
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.email) return user.email.split('@')[0];
    return 'Account';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.charAt(0).toUpperCase();
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-200 min-h-[72px]",
        isScrolled 
          ? "bg-background/95 backdrop-blur-sm border-b border-border" 
          : "bg-background/80 backdrop-blur-sm"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid layout: 3 columns for stable positioning */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center h-[72px]">
          {/* Logo - fixed width container to prevent shift */}
          <div className="flex items-center justify-start">
            <Link to="/" className="flex items-center py-2 hover:opacity-80 transition-opacity">
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
            </Link>
          </div>

          {/* Navigation - centered column */}
          {user ? (
            // Logged-in navigation
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 text-muted-foreground hover:text-foreground transition-all duration-200 rounded-lg hover:bg-muted"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-sm">Dashboard</span>
              </Link>
              <Link
                to="/prospects"
                className="flex items-center gap-1.5 px-3 py-1.5 text-muted-foreground hover:text-foreground transition-all duration-200 rounded-lg hover:bg-muted"
              >
                <Users className="w-4 h-4" />
                <span className="text-sm">Prospects</span>
              </Link>
              <Link
                to="/brand-setup"
                className="flex items-center gap-1.5 px-3 py-1.5 text-muted-foreground hover:text-foreground transition-all duration-200 rounded-lg hover:bg-muted"
              >
                <span className="text-sm">Brand Setup</span>
              </Link>
            </nav>
          ) : (
            // Logged-out navigation
            <nav className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-muted-foreground hover:text-foreground transition-all duration-200 relative group"
              >
                Features
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-secondary transition-all duration-200 group-hover:w-full" />
              </a>
              <a
                href="#pricing"
                className="text-muted-foreground hover:text-foreground transition-all duration-200 relative group"
              >
                Pricing
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-secondary transition-all duration-200 group-hover:w-full" />
              </a>
              <a
                href="/#demo"
                onClick={(e) => {
                  if (window.location.pathname === '/' || window.location.pathname === '') {
                    e.preventDefault();
                    const demoSection = document.getElementById('demo');
                    if (demoSection) {
                      demoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }
                }}
                className="text-muted-foreground hover:text-foreground transition-all duration-200 relative group"
              >
                Demo
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-secondary transition-all duration-200 group-hover:w-full" />
              </a>
              <Link
                to="/brand-setup"
                className="text-muted-foreground hover:text-foreground transition-all duration-200 relative group"
              >
                Brand Setup
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-secondary transition-all duration-200 group-hover:w-full" />
              </Link>
            </nav>
          )}

          {/* Right side - auth-aware */}
          <div className="flex items-center justify-end gap-4">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              // Logged-in actions
              <>
                {/* Credits display - understated */}
                <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Zap className="w-3.5 h-3.5" />
                  <span>{credits.isUnlimited ? '∞' : credits.available} credits</span>
                </div>
                
                <Button 
                  onClick={() => navigate('/new')}
                  variant="premium"
                  className="hidden sm:flex"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Page
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-primary-foreground font-medium text-sm">
                        {getUserInitials()}
                      </div>
                      <ChevronDown className="w-4 h-4 hidden sm:block" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-sm font-medium text-foreground truncate">{getUserDisplayName()}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <DropdownMenuItem 
                      onClick={() => navigate('/settings')}
                      className="text-muted-foreground focus:text-foreground focus:bg-muted cursor-pointer"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="text-muted-foreground focus:text-foreground focus:bg-muted cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              // Logged-out actions
              <>
                <Link 
                  to="/signup?mode=login"
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  Login
                </Link>
                <Link to="/new">
                  <Button variant="premium">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
