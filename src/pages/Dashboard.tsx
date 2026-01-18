import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { TrialBanner } from '@/components/trial/TrialBanner';
import { StrategyBrief } from '@/components/strategy-brief/StrategyBrief';
import { QuickPivotModal } from '@/components/quick-pivot';
import { 
  Plus, Sparkles, Search, FileText, Zap
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { StatusCard } from '@/components/dashboard/StatusCard';
import { PageItem } from '@/components/dashboard/PageItem';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { PriorityAction } from '@/components/dashboard/PriorityAction';
import { ActionCards } from '@/components/dashboard/ActionCards';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { useCredits } from '@/hooks/useCredits';
import { useToast } from '@/hooks/use-toast';
interface PageVersion {
  id: string;
  updated_at: string;
  is_current_version: boolean;
  last_change_summary?: string | null;
}

interface PageWithVersions {
  id: string;
  title?: string;
  slug: string;
  status?: string;
  updated_at: string;
  view_count?: number;
  published_url?: string;
  sections?: any;
  consultation_data?: any;
  styles?: any;
  parent_page_id?: string | null;
  is_current_version?: boolean;
  consultation_id?: string | null;
  versions?: PageVersion[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showBrief, setShowBrief] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [quickPivotOpen, setQuickPivotOpen] = useState(false);
  
  // Fetch user's landing pages
  const { data: landingPages, isLoading, refetch } = useQuery({
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

  // Fetch user's consultations with their landing pages
  const { data: consultations } = useQuery({
    queryKey: ['user-consultations-with-pages', user?.id],
    queryFn: async () => {
      // Get consultations
      const { data: consultsData, error: consultsError } = await supabase
        .from('consultations')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });
      if (consultsError) throw consultsError;
      
      // For each consultation, check if there's an existing page
      const consultationsWithPages = await Promise.all(
        (consultsData || []).map(async (consult) => {
          const { data: pageData } = await supabase
            .from('landing_pages')
            .select('id, title')
            .eq('consultation_id', consult.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          
          return {
            ...consult,
            existingPage: pageData || null
          };
        })
      );
      
      return consultationsWithPages;
    },
    enabled: !!user?.id
  });

  // Process pages: group versions under parent pages
  const pagesWithVersions = useMemo(() => {
    if (!landingPages) return [];

    const parentPages: Map<string, PageWithVersions> = new Map();
    const versionsByParent: Map<string, PageVersion[]> = new Map();

    landingPages.forEach((page: any) => {
      const parentId = page.parent_page_id || page.id;
      
      // Determine if this should be the "main" page to show
      if (!page.parent_page_id || page.is_current_version) {
        if (!parentPages.has(parentId) || page.is_current_version) {
          parentPages.set(parentId, {
            ...page,
            consultation_data: page.consultation_data || {},
            styles: page.styles || {}
          });
        }
      }

      // Collect all versions
      if (!versionsByParent.has(parentId)) {
        versionsByParent.set(parentId, []);
      }
      versionsByParent.get(parentId)!.push({
        id: page.id,
        updated_at: page.updated_at,
        is_current_version: page.is_current_version || false,
        last_change_summary: page.last_change_summary
      });
    });

    // Attach versions to parent pages and sort versions by time
    return Array.from(parentPages.values()).map(page => ({
      ...page,
      versions: (versionsByParent.get(page.parent_page_id || page.id) || [])
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    }));
  }, [landingPages]);

  // Filter pages by search query
  const filteredPages = useMemo(() => {
    if (!searchQuery) return pagesWithVersions;
    return pagesWithVersions.filter(p => 
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.consultation_data as any)?.industry?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [pagesWithVersions, searchQuery]);

  // Split pages by status
  const inProgressPages = useMemo(() => {
    return filteredPages.filter(p => 
      !p.status || p.status === 'draft'
    );
  }, [filteredPages]);

  const publishedPages = useMemo(() => {
    return filteredPages.filter(p => p.status === 'published');
  }, [filteredPages]);

  // Calculate actual page count (unique pages, not versions)
  const actualPageCount = pagesWithVersions.length;

  // Find in-progress consultation (that doesn't already have a page generated)
  const inProgressConsultation = consultations?.find(c => 
    c.status === 'in_progress'
  );

  // Check if the in-progress consultation has an existing page
  const hasExistingPage = inProgressConsultation?.existingPage !== null;
  const existingPageId = inProgressConsultation?.existingPage?.id;
  const existingPageTitle = inProgressConsultation?.existingPage?.title;

  const handleContinueConsultation = async (consultationId: string) => {
    // Direct query to check if a page exists for this consultation
    const { data: existingPage } = await supabase
      .from('landing_pages')
      .select('id')
      .eq('consultation_id', consultationId)
      .limit(1)
      .maybeSingle();
    
    if (existingPage?.id) {
      console.log('📄 Page exists, going to editor:', existingPage.id);
      navigate(`/generate?id=${existingPage.id}`);
    } else {
      console.log('📝 No page yet, resuming wizard');
      navigate('/new', { state: { resumeConsultationId: consultationId } });
    }
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.email) return user.email.split('@')[0];
    return '';
  };

  const handleEditPage = (id: string) => {
    navigate(`/generate?id=${id}`);
  };

  const handleRestoreVersion = async (pageId: string, versionId: string) => {
    try {
      // Fetch the version to restore
      const { data: version, error: fetchError } = await supabase
        .from('landing_pages')
        .select('*')
        .eq('id', versionId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!version) {
        toast({
          title: 'Version not found',
          description: 'The selected version could not be found.',
          variant: 'destructive'
        });
        return;
      }

      // Update the current version flag
      const parentId = version.parent_page_id || pageId;
      
      // Unset current for all versions
      await supabase
        .from('landing_pages')
        .update({ is_current_version: false })
        .or(`id.eq.${parentId},parent_page_id.eq.${parentId}`);

      // Set this version as current
      await supabase
        .from('landing_pages')
        .update({ 
          is_current_version: true,
          last_change_summary: `Restored from ${format(parseISO(version.updated_at), 'h:mm a')}`
        })
        .eq('id', versionId);

      toast({
        title: 'Version restored',
        description: 'The page has been restored to the selected version.'
      });

      refetch();
    } catch (error) {
      console.error('Error restoring version:', error);
      toast({
        title: 'Error restoring version',
        description: 'Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleDeletePage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page and all its versions?')) {
      return;
    }

    try {
      // Delete all versions
      await supabase
        .from('landing_pages')
        .delete()
        .or(`id.eq.${id},parent_page_id.eq.${id}`);

      toast({
        title: 'Page deleted',
        description: 'The page and all versions have been removed.'
      });

      refetch();
    } catch (error) {
      console.error('Error deleting page:', error);
      toast({
        title: 'Error deleting page',
        description: 'Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleDuplicatePage = async (id: string) => {
    try {
      const pageToDuplicate = pagesWithVersions.find(p => p.id === id);
      if (!pageToDuplicate || !user) return;

      const { versions, ...pageData } = pageToDuplicate;
      
      const { error } = await supabase
        .from('landing_pages')
        .insert({
          ...pageData,
          id: undefined,
          user_id: user.id,
          title: `${pageData.title} (Copy)`,
          slug: `${pageData.id}-copy-${Date.now()}`,
          parent_page_id: null,
          version_number: 1,
          is_current_version: true,
          last_change_summary: 'Duplicated from existing page',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: 'Page duplicated',
        description: 'A copy of the page has been created.'
      });

      refetch();
    } catch (error) {
      console.error('Error duplicating page:', error);
      toast({
        title: 'Error duplicating page',
        description: 'Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Get credits info
  const { credits } = useCredits(user?.id ?? null);

  // Calculate draft count (pages with status draft or no status)
  const draftCount = useMemo(() => {
    return pagesWithVersions.filter(p => !p.status || p.status === 'draft').length;
  }, [pagesWithVersions]);

  // Prepare in-progress consultation data for PriorityAction
  const priorityConsultation = inProgressConsultation ? {
    id: inProgressConsultation.id,
    industry: inProgressConsultation.industry,
    existingPage: inProgressConsultation.existingPage
  } : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <TrialBanner />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Smart Header */}
          <DashboardHeader
            userName={getUserDisplayName()}
            pageCount={actualPageCount}
            draftCount={draftCount}
            credits={credits.available}
          />

          {/* Main Content + Sidebar Layout */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Priority Action */}
              <PriorityAction
                drafts={pagesWithVersions.filter(p => !p.status || p.status === 'draft')}
                pages={pagesWithVersions}
                inProgressConsultation={priorityConsultation}
                onQuickPivot={() => setQuickPivotOpen(true)}
              />

              {/* Action Cards Grid */}
              <ActionCards onQuickPivot={() => setQuickPivotOpen(true)} />

              {/* Your Pages Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Your Pages</h2>
                    <p className="text-sm text-muted-foreground">
                      {actualPageCount} {actualPageCount === 1 ? 'page' : 'pages'}
                    </p>
                  </div>
                  <Button 
                    onClick={() => navigate('/new')}
                    variant="premium"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Page
                  </Button>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search pages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-card border-border"
                  />
                </div>

                {/* Status-Based Page Cards */}
                {isLoading ? (
                  <div className="text-center py-16">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading your pages...</p>
                  </div>
                ) : actualPageCount === 0 && !inProgressConsultation ? (
                  <div className="text-center py-16 border border-dashed border-border rounded-xl">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                      <FileText className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">No pages yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Start your first strategic consultation to create a high-converting landing page in minutes.
                    </p>
                    <Button 
                      onClick={() => navigate('/new')}
                      className="bg-gradient-to-r from-primary to-secondary"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Start Strategic Consultation
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* In Progress Section */}
                    <StatusCard 
                      title="In Progress" 
                      count={inProgressPages.length} 
                      status="in-progress"
                      emptyMessage="No drafts in progress"
                      defaultExpanded={true}
                    >
                      {inProgressPages.map(page => (
                        <PageItem
                          key={page.id}
                          page={page}
                          status={page.consultation_id ? 'mid-consultation' : 'draft'}
                          onEdit={() => navigate(`/generate?id=${page.id}`)}
                          onContinue={page.consultation_id ? () => navigate(`/huddle?type=pre_brief&consultationId=${page.consultation_id}`) : undefined}
                          onDuplicate={() => handleDuplicatePage(page.id)}
                          onArchive={() => handleDeletePage(page.id)}
                        />
                      ))}
                    </StatusCard>

                    {/* Published Section */}
                    <StatusCard 
                      title="Published" 
                      count={publishedPages.length} 
                      status="published"
                      emptyMessage="No published pages yet"
                      defaultExpanded={publishedPages.length > 0}
                    >
                      {publishedPages.map(page => (
                        <PageItem
                          key={page.id}
                          page={page}
                          status="published"
                          onEdit={() => navigate(`/generate?id=${page.id}`)}
                          onView={() => window.open(page.published_url || `/preview/${page.slug}`, '_blank')}
                          onDuplicate={() => handleDuplicatePage(page.id)}
                          onArchive={() => handleDeletePage(page.id)}
                        />
                      ))}
                    </StatusCard>

                    {/* No results from search */}
                    {searchQuery && inProgressPages.length === 0 && publishedPages.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No pages found matching "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Completed Consultations with Strategy Briefs */}
              {consultations && consultations.filter(c => 
                c.consultation_status === 'proven' || c.status === 'completed'
              ).length > 0 && (
                <div className="mt-10 space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">Strategy Briefs</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download your AI-generated strategy briefs from completed consultations
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {consultations
                      .filter(c => c.consultation_status === 'proven' || c.status === 'completed')
                      .map(consultation => (
                        <div 
                          key={consultation.id}
                          className="p-4 bg-card border border-border rounded-xl flex items-center justify-between gap-4"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground truncate">
                              {consultation.business_name || consultation.industry || 'Strategy Brief'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {consultation.target_audience ? `For ${consultation.target_audience}` : 'Completed consultation'}
                            </p>
                          </div>
                          <Button
                            onClick={() => {
                              setSelectedConsultation(consultation);
                              setShowBrief(true);
                            }}
                            variant="outline"
                            size="sm"
                            className="border-primary/30 text-primary hover:bg-primary/10 shrink-0"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            View Brief
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Hidden on mobile */}
            <aside className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-28">
                <DashboardSidebar
                  credits={credits.available}
                  totalCredits={credits.total}
                  tier={credits.plan}
                />
              </div>
            </aside>
          </div>
        </div>
      </main>
      
      <Footer />

      {/* Strategy Brief Modal */}
      {showBrief && selectedConsultation && (
        <StrategyBrief
          consultation={selectedConsultation}
          onClose={() => {
            setShowBrief(false);
            setSelectedConsultation(null);
          }}
        />
      )}

      {/* Quick Pivot Modal */}
      <QuickPivotModal 
        isOpen={quickPivotOpen} 
        onClose={() => setQuickPivotOpen(false)} 
      />

      {/* Mobile FAB for Quick Pivot */}
      <button
        onClick={() => setQuickPivotOpen(true)}
        className="fixed bottom-6 right-6 md:hidden w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center z-40 transition-all hover:scale-105"
        aria-label="Quick Pivot"
      >
        <Zap className="w-6 h-6" />
      </button>
    </div>
  );
}
