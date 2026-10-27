import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Inbox, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format, parseISO } from 'date-fns';

interface PublishedPageRow {
  id: string;
  page_title: string | null;
  slug: string;
}

interface FormSubmissionRow {
  id: string;
  published_page_id: string;
  name: string | null;
  email: string;
  company: string | null;
  message: string | null;
  submitted_at: string;
}

export default function Leads() {
  const { user } = useAuth();
  const [pageFilter, setPageFilter] = useState<string>('all');

  // Owner's published pages (RLS: user_id = auth.uid())
  const { data: pages } = useQuery({
    queryKey: ['leads-pages', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('published_pages')
        .select('id, page_title, slug')
        .eq('user_id', user!.id);
      if (error) throw error;
      return (data || []) as PublishedPageRow[];
    },
    enabled: !!user?.id,
  });

  const pageIds = useMemo(() => (pages || []).map(p => p.id), [pages]);
  const pageTitleById = useMemo(() => {
    const map = new Map<string, string>();
    (pages || []).forEach(p => map.set(p.id, p.page_title || p.slug));
    return map;
  }, [pages]);

  // All submissions across the owner's pages (RLS: owner via published_pages)
  const { data: submissions, isLoading } = useQuery({
    queryKey: ['leads-submissions', user?.id, pageIds],
    queryFn: async () => {
      if (pageIds.length === 0) return [] as FormSubmissionRow[];
      const { data, error } = await supabase
        .from('form_submissions')
        .select('id, published_page_id, name, email, company, message, submitted_at')
        .in('published_page_id', pageIds)
        .order('submitted_at', { ascending: false });
      if (error) throw error;
      return (data || []) as FormSubmissionRow[];
    },
    enabled: !!user?.id && pageIds.length > 0,
  });

  const filteredLeads = useMemo(() => {
    const all = submissions || [];
    if (pageFilter === 'all') return all;
    return all.filter(l => l.published_page_id === pageFilter);
  }, [submissions, pageFilter]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <Inbox className="w-6 h-6 text-primary" />
                Leads
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredLeads.length} {filteredLeads.length === 1 ? 'lead' : 'leads'}
                {pageFilter !== 'all' && ' on this page'}
              </p>
            </div>

            {(pages || []).length > 0 && (
              <Select value={pageFilter} onValueChange={setPageFilter}>
                <SelectTrigger className="w-56 bg-card border-border">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="All pages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All pages</SelectItem>
                  {(pages || []).map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.page_title || p.slug}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading leads...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-xl">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Inbox className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No leads yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                When someone submits a form on one of your published pages, they'll show up here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLeads.map(lead => (
                <div
                  key={lead.id}
                  className="p-4 rounded-lg bg-card/50 hover:bg-card transition-colors border border-border/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-foreground">
                          {lead.name || 'Unnamed'}
                        </p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {pageTitleById.get(lead.published_page_id) || 'Unknown page'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 flex-wrap">
                        <a href={`mailto:${lead.email}`} className="hover:text-foreground transition-colors">
                          {lead.email}
                        </a>
                        {lead.company && (
                          <>
                            <span>·</span>
                            <span>{lead.company}</span>
                          </>
                        )}
                      </div>
                      {lead.message && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {lead.message}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                      {format(parseISO(lead.submitted_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
