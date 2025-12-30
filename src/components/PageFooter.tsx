import { Link } from 'react-router-dom';

export function PageFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img 
              src="/logo/whiteAsset_6iconmark_lightmode.svg" 
              alt="PageConsult AI" 
              className="h-6 w-6" 
            />
            <span className="text-slate-400 text-sm">PageConsult AI</span>
          </div>
          
          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-1 text-sm text-slate-500">
            <span>© 2026 Hyperbrand Creative, Ltd</span>
            <span className="mx-2">•</span>
            <Link to="/terms" className="hover:text-cyan-400 transition-colors">Terms</Link>
            <span className="mx-2">•</span>
            <Link to="/privacy" className="hover:text-cyan-400 transition-colors">Privacy</Link>
            <span className="mx-2">•</span>
            <a href="mailto:support@pageconsult.ai" className="hover:text-cyan-400 transition-colors">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default PageFooter;
