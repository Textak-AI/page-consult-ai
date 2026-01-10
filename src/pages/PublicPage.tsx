import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Home, FileX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicPageRenderer } from '@/components/public/PublicPageRenderer';

// Only include fields returned by the secure get_public_landing_page RPC
interface PublicLandingPage {
  id: string;
  title: string;
  slug: string;
  sections: any[];
  styles: any;
  is_published: boolean;
  published_at: string | null;
  published_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  hero_thumbnail_url: string | null;
  status: string;
}

export default function PublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<PublicLandingPage | null>(null);
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
        // Use secure RPC function that only returns safe fields (no user_id, consultation_data, etc.)
        const { data, error: fetchError } = await supabase
          .rpc('get_public_landing_page', { page_slug: slug });

        if (fetchError || !data) {
          setError('Page not found or not published');
          setIsLoading(false);
          return;
        }

        // Cast through unknown since RPC returns Json type
        const pageData = data as unknown as PublicLandingPage;
        setPage(pageData);

        // Track the view (fire and forget)
        if (pageData.id) {
          trackPageView(pageData.id);
        }
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
