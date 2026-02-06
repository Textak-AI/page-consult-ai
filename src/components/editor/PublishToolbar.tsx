import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Rocket, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getPublicPageUrl, copyPageUrlToClipboard } from "@/utils/slugUtils";
import { cn } from "@/lib/utils";

interface PublishToolbarProps {
  pageId: string;
  slug: string;
  isPublished: boolean;
  publishedAt?: string | null;
  className?: string;
}

export function PublishToolbar({
  pageId,
  slug,
  isPublished: initialIsPublished,
  className,
}: PublishToolbarProps) {
  // Manage publish state internally after initial load
  const [internalIsPublished, setInternalIsPublished] = useState(initialIsPublished);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);

  const publicUrl = getPublicPageUrl(slug);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const { error } = await supabase
        .from('landing_pages')
        .update({
          status: 'published',
          is_published: true,
          published_at: new Date().toISOString(),
          published_url: `/p/${slug}`,
        })
        .eq('id', pageId);

      if (error) throw error;

      // Update internal state
      setInternalIsPublished(true);

      // Show success toast with Copy Link action
      toast.success("Page published! 🎉", {
        description: publicUrl,
        action: {
          label: "Copy Link",
          onClick: () => {
            copyPageUrlToClipboard(slug);
          },
        },
        duration: 6000,
      });
    } catch (error) {
      console.error('Publish error:', error);
      toast.error("Failed to publish", {
        description: "Please try again.",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    setIsUnpublishing(true);
    try {
      const { error } = await supabase
        .from('landing_pages')
        .update({
          status: 'draft',
          is_published: false,
          published_at: null,
        })
        .eq('id', pageId);

      if (error) throw error;

      // Update internal state
      setInternalIsPublished(false);

      toast.success("Page unpublished", {
        description: "Your page is no longer publicly accessible.",
      });
    } catch (error) {
      console.error('Unpublish error:', error);
      toast.error("Failed to unpublish", {
        description: "Please try again.",
      });
    } finally {
      setIsUnpublishing(false);
    }
  };

  // Draft state - show Publish button
  if (!internalIsPublished) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          onClick={handlePublish}
          disabled={isPublishing}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
        >
          {isPublishing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4 mr-2" />
              Publish Page
            </>
          )}
        </Button>
      </div>
    );
  }

  // Published state - show Unpublish button only
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="outline"
        size="default"
        onClick={handleUnpublish}
        disabled={isUnpublishing}
        className="text-slate-300 border-slate-600 hover:bg-slate-800"
      >
        {isUnpublishing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Unpublishing...
          </>
        ) : (
          <>
            <EyeOff className="w-4 h-4 mr-2" />
            Unpublish
          </>
        )}
      </Button>
    </div>
  );
}
