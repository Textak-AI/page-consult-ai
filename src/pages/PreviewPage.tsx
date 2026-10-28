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
  const [showBadge, setShowBadge] = useState(true);

  useEffect(() => {
    if (!token) {
      setState('not_found');
      return;
    }

    const load = async () => {
      // Token is resolved server-side; preview_links has no anonymous read access.
      const { data, error } = await supabase.functions.invoke('get-preview-link', {
        body: { token },
      });

      if (data?.status === 'expired') {
        setState('expired');
        return;
      }

      if (error || data?.status !== 'ready' || !data?.page) {
        setState('not_found');
        return;
      }

      setShowBadge(data.showBadge !== false);
      setPageData(data.page);
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
          businessName={pageData?.consultation_data?.businessName || null}
          showBadge={showBadge}
        />
      </div>
    </div>
  );
}
