import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Globe, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const PUBLISH_CHANGED_EVENT = 'pc:publish-changed';
/** The Publish dialog announces publish/unpublish so the header label never goes stale. */
export function announcePublishChanged(published: boolean): void {
  try { window.dispatchEvent(new CustomEvent(PUBLISH_CHANGED_EVENT, { detail: { published } })); } catch { /* non-browser */ }
}

interface PublishToolbarProps {
  pageId: string;
  slug: string;
  isPublished: boolean;
  publishedAt?: string | null;
  onOpenPublishModal: () => void;
  className?: string;
}

export function PublishToolbar({
  pageId,
  isPublished: initialIsPublished,
  onOpenPublishModal,
  className,
}: PublishToolbarProps) {
  const [isPublished, setIsPublished] = useState(initialIsPublished);

  // Check published_pages for actual status
  useEffect(() => {
    const check = async () => {
      const { data } = await supabase
        .from('published_pages')
        .select('status')
        .eq('landing_page_id', pageId)
        .eq('status', 'published')
        .maybeSingle();
      setIsPublished(!!data);
    };
    check();
    const onChange = (e: Event) => setIsPublished(!!(e as CustomEvent).detail?.published);
    window.addEventListener(PUBLISH_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(PUBLISH_CHANGED_EVENT, onChange);
  }, [pageId]);

  if (isPublished) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          size="sm"
          variant="outline"
          onClick={onOpenPublishModal}
          className="border-green-500/30 text-green-400 hover:bg-green-500/10"
        >
          <Check className="w-4 h-4 mr-1" />
          Live · Update
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        size="sm"
        onClick={onOpenPublishModal}
        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
      >
        <Globe className="w-4 h-4 mr-1" />
        Publish
      </Button>
    </div>
  );
}
