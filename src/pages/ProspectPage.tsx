import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { PublicPageRenderer } from '@/components/public/PublicPageRenderer';

type Section = {
  type: string;
  order: number;
  visible: boolean;
  content: any;
};

interface PageData {
  id: string;
  title: string;
  slug: string;
  sections: Section[];
  styles: any;
  meta_title?: string | null;
  meta_description?: string | null;
}

export default function ProspectPage() {
  const { slug } = useParams<{ slug: string }>();
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPage() {
      if (!slug) {
        setError('Not found');
        setIsLoading(false);
        return;
      }

      try {
        // First try to find a prospect with this slug
        const { data: prospect, error: prospectError } = await supabase
          .from('prospects')
          .select('*')
          .eq('slug', slug)
          .single();

        if (prospect && prospect.base_page_id) {
          // Fetch the base landing page
          const { data: basePage, error: pageError } = await supabase
            .from('landing_pages')
            .select('*')
            .eq('id', prospect.base_page_id)
            .single();

          if (pageError || !basePage) {
            setError('Not found');
            setIsLoading(false);
            return;
          }

          // Parse sections from JSON
          const rawSections = basePage.sections;
          const baseSections: Section[] = Array.isArray(rawSections) 
            ? rawSections.map((s: any) => ({
                type: s.type || '',
                order: s.order || 0,
                visible: s.visible !== false,
                content: s.content || {},
              }))
            : [];

          // Merge personalized content into the base page
          const personalizedSections = baseSections.map((section: Section) => {
            if (section.type === 'hero') {
              return {
                ...section,
                content: {
                  ...section.content,
                  headline: prospect.personalized_headline || section.content?.headline,
                  subheadline: prospect.personalized_subhead || section.content?.subheadline || section.content?.subhead,
                  cta_text: prospect.personalized_cta_text || section.content?.cta_text || section.content?.ctaText,
                  ctaText: prospect.personalized_cta_text || section.content?.cta_text || section.content?.ctaText,
                }
              };
            }
            // Also personalize final CTA sections
            if (section.type === 'cta' || section.type === 'final-cta') {
              return {
                ...section,
                content: {
                  ...section.content,
                  cta_text: prospect.personalized_cta_text || section.content?.cta_text || section.content?.ctaText,
                  ctaText: prospect.personalized_cta_text || section.content?.cta_text || section.content?.ctaText,
                }
              };
            }
            return section;
          });

          setPageData({
            id: basePage.id,
            title: basePage.title,
            slug: basePage.slug,
            sections: personalizedSections,
            styles: basePage.styles,
            meta_title: basePage.meta_title,
            meta_description: basePage.meta_description,
          });

          // Track initial view
          try {
            await supabase.functions.invoke('track-prospect-view', {
              body: {
                slug,
                device_type: /Mobile|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
                referrer_source: document.referrer.includes('mail') ? 'email' : 'direct',
              }
            });
          } catch (trackError) {
            console.error('Track view error:', trackError);
          }

          setIsLoading(false);
          return;
        }

        // If no prospect found, check if it's a regular published landing page
        const { data: landingPage, error: lpError } = await supabase
          .from('landing_pages')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .single();

        if (lpError || !landingPage) {
          setError('Not found');
          setIsLoading(false);
          return;
        }

        // Parse sections from JSON
        const rawSections = landingPage.sections;
        const sections: Section[] = Array.isArray(rawSections) 
          ? rawSections.map((s: any) => ({
              type: s.type || '',
              order: s.order || 0,
              visible: s.visible !== false,
              content: s.content || {},
            }))
          : [];

        setPageData({
          id: landingPage.id,
          title: landingPage.title,
          slug: landingPage.slug,
          sections,
          styles: landingPage.styles,
          meta_title: landingPage.meta_title,
          meta_description: landingPage.meta_description,
        });

        // Track view for regular landing page
        try {
          await supabase.rpc('increment_page_view', { page_id: landingPage.id });
        } catch (trackError) {
          console.error('Track view error:', trackError);
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

  // Track engagement on unload
  useEffect(() => {
    if (!slug || !pageData) return;

    const startTime = Date.now();
    let maxScroll = 0;

    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      maxScroll = Math.max(maxScroll, scrollPercent);
    };

    const handleUnload = () => {
      const timeOnPage = Math.round((Date.now() - startTime) / 1000);
      navigator.sendBeacon(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-prospect-view`,
        JSON.stringify({
          slug,
          time_on_page: timeOnPage,
          scroll_depth: maxScroll,
          is_final: true,
        })
      );
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [slug, pageData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
          <p className="text-muted-foreground">This link may have expired.</p>
        </div>
      </div>
    );
  }

  return (
    <PublicPageRenderer 
      sections={pageData.sections}
      styles={pageData.styles}
      metaTitle={pageData.meta_title}
      metaDescription={pageData.meta_description}
    />
  );
}
