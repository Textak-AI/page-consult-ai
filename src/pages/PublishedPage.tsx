import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, FileX, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicPageRenderer } from '@/components/public/PublicPageRenderer';

interface PublishedPageData {
  id: string;
  slug: string;
  page_content: any[];
  page_styles: any;
  page_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  design_intelligence: any | null;
  brand_settings: any | null;
  status: string;
}

export default function PublishedPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<PublishedPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) {
      setError(true);
      setIsLoading(false);
      return;
    }

    const fetchPage = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('published_pages')
          .select('id, slug, page_content, page_styles, page_title, meta_description, og_image_url, design_intelligence, brand_settings, status')
          .eq('slug', slug)
          .eq('status', 'published')
          .maybeSingle();

        if (fetchError || !data) {
          setError(true);
          setIsLoading(false);
          return;
        }

        setPage(data as PublishedPageData);

        // Fire-and-forget view tracking
        supabase.rpc('increment_published_page_view', { page_slug: slug } as any).then(() => {});
      } catch {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-6 p-8 max-w-md">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto">
            <FileX className="w-8 h-8 text-slate-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
            <p className="text-slate-400">This page doesn't exist or is no longer available.</p>
          </div>
          <Link to="/">
            <Button variant="outline" className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800">
              <Home className="w-4 h-4" />
              Go to PageConsult
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const designIntelligence = page.design_intelligence ? {
    colorMode: page.design_intelligence.colorMode || 'dark',
    industryVariant: page.design_intelligence.industryVariant || 'default',
    brandColors: page.design_intelligence.brandColors || {},
  } : null;

  return (
    <PublicPageRenderer
      sections={page.page_content}
      styles={page.page_styles}
      metaTitle={page.page_title}
      metaDescription={page.meta_description}
      heroThumbnailUrl={page.og_image_url}
      designIntelligence={designIntelligence as any}
      brandSettings={page.brand_settings}
      showPoweredBy={true}
      publishedPageId={page.id}
    />
  );
}
