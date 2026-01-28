import { Link } from 'react-router-dom';

interface PageFooterProps {
  companyName?: string | null;
  logoUrl?: string | null;
  showPoweredBy?: boolean; // Whether to show "Powered by PageConsult AI" 
}

export function PageFooter({ 
  companyName, 
  logoUrl,
  showPoweredBy = true,
}: PageFooterProps) {
  const currentYear = new Date().getFullYear();
  const displayName = companyName || 'PageConsult AI';
  
  // Determine if we're showing brand (user's company) or PageConsult branding
  const isUserBrand = !!companyName && companyName !== 'PageConsult AI';
  
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo / Brand */}
          <div className="flex items-center gap-2">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={displayName} 
                className="h-6 w-auto object-contain" 
              />
            ) : (
              <img 
                src="/logo/whiteAsset_6iconmark_lightmode.svg" 
                alt="PageConsult AI" 
                className="h-6 w-6" 
              />
            )}
            <span className="text-slate-400 text-sm">{displayName}</span>
          </div>
          
          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-1 text-sm text-slate-500">
            <span>© {currentYear} {isUserBrand ? displayName : 'Hyperbrand Creative, Ltd'}</span>
            
            {/* Show powered by when using user's brand */}
            {isUserBrand && showPoweredBy && (
              <>
                <span className="mx-2">•</span>
                <span className="text-slate-600">
                  Powered by{' '}
                  <a 
                    href="https://pageconsult.ai" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    PageConsult AI
                  </a>
                </span>
              </>
            )}
            
            {/* Only show legal links for PageConsult branding */}
            {!isUserBrand && (
              <>
                <span className="mx-2">•</span>
                <Link to="/terms" className="hover:text-cyan-400 transition-colors">Terms</Link>
                <span className="mx-2">•</span>
                <Link to="/privacy" className="hover:text-cyan-400 transition-colors">Privacy</Link>
                <span className="mx-2">•</span>
                <Link to="/trust-center" className="hover:text-cyan-400 transition-colors">Trust & Security</Link>
                <span className="mx-2">•</span>
                <a href="mailto:support@pageconsult.ai" className="hover:text-cyan-400 transition-colors">Support</a>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default PageFooter;
