import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Home, FileX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicPageRenderer } from '@/components/public/PublicPageRenderer';

interface LandingPage {
  id: string;
  title: string;
  slug: string;
  sections: any[];
  styles: any;
  is_published: boolean;
  meta_title: string | null;
  meta_description: string | null;
  consultation_data: any;
}

export default function PublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<LandingPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPage() {
      if (!slug) {
        setError('Page not found');
        setIsLoading(false);
        return;
      }

      try {
        // Fetch the page by slug (RLS policy allows public access to published pages)
        const { data, error: fetchError } = await supabase
          .from('landing_pages')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .single();

        if (fetchError || !data) {
          setError('Page not found or not published');
          setIsLoading(false);
          return;
        }

        setPage(data as LandingPage);

        // Track the view (fire and forget)
        trackPageView(data.id);
      } catch (err) {
        console.error('Error fetching page:', err);
        setError('Something went wrong');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPage();
  }, [slug]);

  // Track page view without blocking render
  async function trackPageView(pageId: string) {
    try {
      await supabase.rpc('increment_page_view', { page_id: pageId });
    } catch (err) {
      // Silently fail - tracking shouldn't break the page
      console.error('Failed to track view:', err);
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-purple-600 mx-auto" />
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-6 p-8 max-w-md">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
            <FileX className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h1>
            <p className="text-slate-500">
              This page doesn't exist or hasn't been published yet.
            </p>
          </div>
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Render the page
  return (
    <PublicPageRenderer 
      sections={page.sections} 
      styles={page.styles}
      metaTitle={page.meta_title}
      metaDescription={page.meta_description}
    />
  );
}
