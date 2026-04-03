import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicPageRenderer } from '@/components/public/PublicPageRenderer';

function PreviewBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 text-center py-2 px-4 text-sm font-semibold shadow-md">
      PREVIEW MODE — This page is not yet published
    </div>
  );
}

function ExpiredPreviewPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center space-y-4 max-w-md">
        <Clock className="w-16 h-16 mx-auto text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">This preview link has expired</h1>
        <p className="text-muted-foreground">
          Preview links are valid for 7 days. Contact the page owner for a new link.
        </p>
        <Button onClick={() => window.location.href = '/'} variant="outline">
          Go to PageConsult
        </Button>
      </div>
    </div>
  );
}

function NotFoundPreview() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-2xl font-bold text-foreground">Preview not found</h1>
        <p className="text-muted-foreground">This preview link is invalid or has been removed.</p>
        <Button onClick={() => window.location.href = '/'} variant="outline">
          Go to PageConsult
        </Button>
      </div>
    </div>
  );
}

export default function PreviewPage() {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<'loading' | 'expired' | 'not_found' | 'ready'>('loading');
  const [pageData, setPageData] = useState<any>(null);

  useEffect(() => {
    if (!token) {
      setState('not_found');
      return;
    }

    const load = async () => {
      // Fetch preview link
      const { data: link, error: linkError } = await supabase
        .from('preview_links')
        .select('landing_page_id, expires_at')
        .eq('token', token)
        .maybeSingle();

      if (linkError || !link) {
        setState('not_found');
        return;
      }

      // Check expiry
      if (new Date(link.expires_at) < new Date()) {
        setState('expired');
        return;
      }

      // Fetch the landing page
      const { data: page, error: pageError } = await supabase
        .from('landing_pages')
        .select('*')
        .eq('id', link.landing_page_id)
        .maybeSingle();

      if (pageError || !page) {
        setState('not_found');
        return;
      }

      setPageData(page);
      setState('ready');
    };

    load();
  }, [token]);

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (state === 'expired') return <ExpiredPreviewPage />;
  if (state === 'not_found' || !pageData) return <NotFoundPreview />;

  return (
    <div>
      <PreviewBanner />
      <div className="pt-10">
        <PublicPageRenderer
          sections={pageData.sections || []}
          styles={pageData.styles || {}}
          designIntelligence={pageData.design_intelligence}
        />
      </div>
    </div>
  );
}
