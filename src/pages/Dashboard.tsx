import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Plus, ArrowRight, FileText, Clock, Sparkles, 
  TrendingUp, Eye, Edit, Zap 
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Fetch user's landing pages
  const { data: landingPages, isLoading } = useQuery({
    queryKey: ['user-landing-pages', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('landing_pages')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch user's consultations
  const { data: consultations } = useQuery({
    queryKey: ['user-consultations', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const inProgressConsultation = consultations?.find(c => c.status === 'in_progress');
  const draftPages = landingPages?.filter(p => p.status === 'draft') || [];
  const publishedPages = landingPages?.filter(p => p.is_published) || [];
  const allPages = landingPages || [];

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.email) return user.email.split('@')[0];
    return '';
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Welcome Header */}
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Welcome back{getUserDisplayName() ? `, ${getUserDisplayName()}` : ''}
            </h1>
            <p className="text-slate-400 text-lg">
              {allPages.length > 0 
                ? `You have ${allPages.length} landing page${allPages.length > 1 ? 's' : ''}`
                : "Let's build your first high-converting landing page"
              }
            </p>
          </div>

          {/* In Progress Alert */}
          {inProgressConsultation && (
            <div className="mb-8">
              <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-cyan-500/20 rounded-lg">
                      <Clock className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Consultation in Progress</p>
                      <p className="text-slate-400 text-sm">
                        {inProgressConsultation.industry || 'Untitled'} — Continue where you left off
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate('/new')}
                    className="bg-cyan-500 hover:bg-cyan-600"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <button
              onClick={() => navigate('/new')}
              className="p-6 bg-slate-800 border border-slate-700 rounded-xl 
                         hover:border-cyan-500/50 transition text-left group"
            >
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-cyan-500/30 transition">
                <Plus className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-white font-semibold mb-1">
                New Landing Page
              </h3>
              <p className="text-slate-400 text-sm">
                Start a strategic consultation
              </p>
            </button>
            
            <button
              onClick={() => navigate('/brand-setup')}
              className="p-6 bg-slate-800 border border-slate-700 rounded-xl 
                         hover:border-purple-500/50 transition text-left group"
            >
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold mb-1">
                Brand Setup
              </h3>
              <p className="text-slate-400 text-sm">
                Configure your brand identity
              </p>
            </button>
            
            <button
              onClick={() => navigate('/settings')}
              className="p-6 bg-slate-800 border border-slate-700 rounded-xl 
                         hover:border-amber-500/50 transition text-left group"
            >
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-500/30 transition">
                <Zap className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-white font-semibold mb-1">
                Account Settings
              </h3>
              <p className="text-slate-400 text-sm">
                Manage your account & credits
              </p>
            </button>
          </div>

          {/* Your Pages */}
          {allPages.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-semibold text-white mb-6">Your Pages</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allPages.map((page) => (
                  <div
                    key={page.id}
                    className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition group"
                  >
                    {/* Page Thumbnail */}
                    <div className="relative aspect-video bg-slate-700">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FileText className="w-12 h-12 text-slate-500" />
                      </div>
                      
                      {/* Status Badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          page.is_published 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {page.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      
                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate(`/generate?id=${page.id}`)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        {page.is_published && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(page.published_url || `/preview/${page.slug}`, '_blank')}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Page Info */}
                    <div className="p-4">
                      <h3 className="text-white font-medium mb-1 truncate">
                        {page.title || 'Untitled Page'}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(page.updated_at).toLocaleDateString()}
                        </span>
                        {page.ai_seo_score && (
                          <span className="flex items-center gap-1 text-cyan-400">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {page.ai_seo_score}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {allPages.length === 0 && !inProgressConsultation && !isLoading && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No pages yet</h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                Start your first strategic consultation to create a high-converting landing page in minutes.
              </p>
              <Button 
                onClick={() => navigate('/new')}
                className="bg-gradient-to-r from-cyan-500 to-purple-500"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Start Strategic Consultation
              </Button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-16">
              <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-400">Loading your pages...</p>
            </div>
          )}

        </div>
      </main>
      
      <Footer />
    </div>
  );
}
