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
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link to="/support" className="hover:text-slate-300 transition-colors">Support</Link>
          </div>
          
          {/* Copyright */}
          <p className="text-slate-600 text-sm">
            © 2025 PageConsult AI
          </p>
        </div>
      </div>
    </footer>
  );
}

export default PageFooter;
