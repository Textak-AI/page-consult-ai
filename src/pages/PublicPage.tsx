import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Home, FileX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicPageRenderer } from '@/components/public/PublicPageRenderer';

// Interface for public page data from get_public_landing_page RPC
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

// Extended interface for direct query (includes design_intelligence)
interface ExtendedPublicPage extends PublicLandingPage {
  design_intelligence?: {
    colorMode?: 'light' | 'dark';
    industryVariant?: string;
    cardStyle?: string;
  } | null;
  consultation_data?: {
    businessName?: string;
    brandColors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
    };
    logoUrl?: string;
    websiteIntelligence?: {
      companyName?: string;
      logoUrl?: string;
      primaryColor?: string;
      secondaryColor?: string;
    };
  } | null;
  website_intelligence?: {
    companyName?: string;
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
  } | null;
}

export default function PublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<ExtendedPublicPage | null>(null);
  const [publishedPageId, setPublishedPageId] = useState<string | null>(null);
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
        // First check published_pages table (new snapshot-based system)
        const { data: publishedData } = await supabase
          .from('published_pages')
          .select('id, slug, page_content, page_styles, page_title, meta_description, og_image_url, design_intelligence, brand_settings, status')
          .eq('slug', slug)
          .eq('status', 'published')
          .maybeSingle();

        if (publishedData) {
          const mapped: ExtendedPublicPage = {
            id: publishedData.id,
            title: publishedData.page_title || '',
            slug: publishedData.slug,
            sections: publishedData.page_content as any[],
            styles: publishedData.page_styles,
            is_published: true,
            published_at: null,
            published_url: `/p/${publishedData.slug}`,
            meta_title: publishedData.page_title,
            meta_description: publishedData.meta_description,
            hero_thumbnail_url: publishedData.og_image_url,
            status: 'published',
            design_intelligence: publishedData.design_intelligence as any,
            consultation_data: null,
            website_intelligence: null,
          };
          // Use brand_settings from snapshot
          const bs = publishedData.brand_settings as any;
          if (bs) {
            mapped.consultation_data = {
              businessName: bs.companyName,
              logoUrl: bs.logoUrl,
              brandColors: { primary: bs.primaryColor },
            };
          }
          setPage(mapped);
          setPublishedPageId(publishedData.id);
          supabase.rpc('increment_published_page_view', { page_slug: slug } as any).then(() => {});
          setIsLoading(false);
          return;
        }

        // Fallback: try direct query on landing_pages (legacy)
        const { data: directData, error: directError } = await supabase
          .from('landing_pages')
          .select('id, title, slug, sections, styles, is_published, published_at, published_url, meta_title, meta_description, hero_thumbnail_url, status, design_intelligence, consultation_data, website_intelligence')
          .eq('slug', slug)
          .eq('status', 'published')
          .maybeSingle();

        if (!directError && directData) {
          console.log('📄 [PublicPage] Loaded via direct query:', {
            slug: directData.slug,
            status: directData.status,
            hasDesignIntelligence: !!directData.design_intelligence,
            colorMode: (directData.design_intelligence as any)?.colorMode,
          });
          setPage(directData as ExtendedPublicPage);
          
          // Track the view (fire and forget)
          trackPageView(directData.id);
          setIsLoading(false);
          return;
        }

        // Fallback to secure RPC function (doesn't include design_intelligence)
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_public_landing_page', { page_slug: slug });

        if (rpcError || !rpcData) {
          console.log('📄 [PublicPage] Page not found for slug:', slug);
          setError('Page not found or not published');
          setIsLoading(false);
          return;
        }

        const pageData = rpcData as unknown as PublicLandingPage;
        setPage(pageData as ExtendedPublicPage);

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
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-purple-500 mx-auto" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Error / 404 state
  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-6 p-8 max-w-md">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto">
            <FileX className="w-8 h-8 text-slate-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
            <p className="text-slate-400">
              This page doesn't exist or is no longer available.
            </p>
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

  // Extract design intelligence from page data
  const designIntelligence = page.design_intelligence ? {
    colorMode: page.design_intelligence.colorMode || 'dark',
    industryVariant: page.design_intelligence.industryVariant || 'default',
    brandColors: page.consultation_data?.brandColors || {
      primary: page.website_intelligence?.primaryColor || page.consultation_data?.websiteIntelligence?.primaryColor,
      secondary: page.website_intelligence?.secondaryColor || page.consultation_data?.websiteIntelligence?.secondaryColor,
    },
  } : null;

  // Extract brand settings
  const brandSettings = {
    companyName: page.consultation_data?.businessName || 
                 page.website_intelligence?.companyName || 
                 page.consultation_data?.websiteIntelligence?.companyName ||
                 page.title?.replace(' Landing Page', '') ||
                 null,
    logoUrl: page.consultation_data?.logoUrl || 
             page.website_intelligence?.logoUrl || 
             page.consultation_data?.websiteIntelligence?.logoUrl ||
             null,
    primaryColor: designIntelligence?.brandColors?.primary || null,
  };

  // Render the page
  return (
    <PublicPageRenderer 
      sections={page.sections} 
      styles={page.styles}
      metaTitle={page.meta_title}
      metaDescription={page.meta_description}
      heroThumbnailUrl={page.hero_thumbnail_url}
      designIntelligence={designIntelligence as any}
      brandSettings={brandSettings}
      showPoweredBy={true}
    />
  );
}
