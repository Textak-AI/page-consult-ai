import { useAuth } from '@/hooks/useAuth';
import Dashboard from '@/pages/Dashboard';
import Index from '@/pages/Index';

/**
 * Auth-aware homepage wrapper
 * - Logged out users see the marketing page (Index)
 * - Logged in users see their dashboard
 */
export default function HomePage() {
  const { user, isLoading } = useAuth();
  
  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Logged in = Dashboard, Logged out = Marketing page
  return user ? <Dashboard /> : <Index />;
}
