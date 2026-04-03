import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Globe, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

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
          Published
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
