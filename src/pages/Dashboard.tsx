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
  Plus, ArrowRight, Clock, Sparkles, 
  Zap, Search, FileText, Edit3
} from 'lucide-react';
import { format, parseISO, startOfDay } from 'date-fns';
import { DayAccordion } from '@/components/dashboard/DayAccordion';
import { PageWithVersions, PageVersion } from '@/components/dashboard/PageCard';
import { useToast } from '@/hooks/use-toast';

interface DayGroup {
  date: Date;
  pages: PageWithVersions[];
  totalVersions: number;
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

  // Group pages by day
  const dayGroups = useMemo(() => {
    const filtered = searchQuery
      ? pagesWithVersions.filter(p => 
          p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.consultation_data as any)?.industry?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : pagesWithVersions;

    const groups: Map<string, DayGroup> = new Map();

    filtered.forEach(page => {
      const dayKey = format(parseISO(page.updated_at), 'yyyy-MM-dd');
      
      if (!groups.has(dayKey)) {
        groups.set(dayKey, {
          date: startOfDay(parseISO(page.updated_at)),
          pages: [],
          totalVersions: 0
        });
      }

      const group = groups.get(dayKey)!;
      group.pages.push(page);
      group.totalVersions += page.versions?.length || 1;
    });

    // Sort by date descending
    return Array.from(groups.values()).sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );
  }, [pagesWithVersions, searchQuery]);

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <TrialBanner />
      
      <main className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Welcome back{getUserDisplayName() ? `, ${getUserDisplayName()}` : ''}
            </h1>
            <p className="text-muted-foreground text-lg">
              {actualPageCount > 0 
                ? `You have ${actualPageCount} landing page${actualPageCount > 1 ? 's' : ''}`
                : "Let's build your first high-converting landing page"
              }
            </p>
          </div>

          {/* In Progress Alert */}
          {inProgressConsultation && (
            <div className="mb-8">
              <div className={`bg-gradient-to-r ${hasExistingPage ? 'from-emerald-500/10 to-cyan-500/10 border-emerald-500/30' : 'from-primary/10 to-secondary/10 border-primary/30'} border rounded-xl p-5`}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 ${hasExistingPage ? 'bg-emerald-500/20' : 'bg-primary/20'} rounded-lg`}>
                      {hasExistingPage ? (
                        <Edit3 className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <Clock className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-foreground font-semibold">
                        {hasExistingPage ? 'Page Ready for Editing' : 'Consultation in Progress'}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {hasExistingPage 
                          ? `${existingPageTitle || inProgressConsultation.industry || 'Your Page'} — Continue editing your landing page`
                          : `${inProgressConsultation.industry || 'Untitled'} — Continue where you left off`
                        }
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleContinueConsultation(inProgressConsultation.id)}
                    className={hasExistingPage ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-primary hover:bg-primary/90'}
                  >
                    {hasExistingPage ? 'Edit Page' : 'Continue'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
            <button
              onClick={() => navigate('/new')}
              className="p-6 bg-card border border-border rounded-xl 
                         hover:border-primary/50 transition text-left group"
            >
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/30 transition">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-foreground font-semibold mb-1">
                New Landing Page
              </h3>
              <p className="text-muted-foreground text-sm">
                Start a strategic consultation
              </p>
            </button>

            <button
              onClick={() => setQuickPivotOpen(true)}
              className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/30 rounded-xl 
                         hover:border-purple-500/60 hover:from-purple-500/15 hover:to-purple-600/10 transition text-left group"
            >
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-foreground font-semibold mb-1">
                Quick Pivot
              </h3>
              <p className="text-muted-foreground text-sm">
                Personalized prospect pages
              </p>
            </button>
            
            <button
              onClick={() => navigate('/brand-setup')}
              className="p-6 bg-card border border-border rounded-xl 
                         hover:border-secondary/50 transition text-left group"
            >
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-secondary/30 transition">
                <Sparkles className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h3 className="text-foreground font-semibold mb-1">
                Brand Setup
              </h3>
              <p className="text-muted-foreground text-sm">
                Configure your brand identity
              </p>
            </button>
            
            <button
              onClick={() => navigate('/settings')}
              className="p-6 bg-card border border-border rounded-xl 
                         hover:border-accent/50 transition text-left group"
            >
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/30 transition">
                <Zap className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="text-foreground font-semibold mb-1">
                Account Settings
              </h3>
              <p className="text-muted-foreground text-sm">
                Manage your account & credits
              </p>
            </button>
          </div>

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
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
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
                className="pl-10"
              />
            </div>

            {/* Day Groups */}
            {isLoading ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading your pages...</p>
              </div>
            ) : dayGroups.length > 0 ? (
              <div className="space-y-4">
                {dayGroups.map((group, index) => (
                  <DayAccordion
                    key={format(group.date, 'yyyy-MM-dd')}
                    date={group.date}
                    pages={group.pages}
                    totalVersions={group.totalVersions}
                    defaultExpanded={index === 0}
                    onEditPage={handleEditPage}
                    onRestoreVersion={handleRestoreVersion}
                    onDeletePage={handleDeletePage}
                    onDuplicatePage={handleDuplicatePage}
                  />
                ))}
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
            ) : searchQuery ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No pages found matching "{searchQuery}"</p>
              </div>
            ) : null}
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
                        className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 shrink-0"
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
