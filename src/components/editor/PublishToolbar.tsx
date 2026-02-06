import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Globe, 
  Check, 
  Copy, 
  ExternalLink, 
  EyeOff, 
  Loader2,
  Rocket,
  Link as LinkIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getPublicPageUrl, copyPageUrlToClipboard } from "@/utils/slugUtils";
import { cn } from "@/lib/utils";

interface PublishToolbarProps {
  pageId: string;
  slug: string;
  isPublished: boolean;
  publishedAt?: string | null;
  onPublishStateChange?: (isPublished: boolean) => void;
  className?: string;
}

export function PublishToolbar({
  pageId,
  slug,
  isPublished,
  publishedAt,
  onPublishStateChange,
  className,
}: PublishToolbarProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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

      toast.success("Page published!", {
        description: "Your page is now live and accessible to anyone with the link.",
      });
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      onPublishStateChange?.(true);
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

      toast.success("Page unpublished", {
        description: "Your page is no longer publicly accessible.",
      });
      
      onPublishStateChange?.(false);
    } catch (error) {
      console.error('Unpublish error:', error);
      toast.error("Failed to unpublish", {
        description: "Please try again.",
      });
    } finally {
      setIsUnpublishing(false);
    }
  };

  const handleCopyLink = async () => {
    const success = await copyPageUrlToClipboard(slug);
    if (success) {
      setCopied(true);
      toast.success("Link copied!", { description: publicUrl });
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Failed to copy link");
    }
  };

  const handleOpenPage = () => {
    window.open(`/p/${slug}`, '_blank');
  };

  // Draft state - show Publish button
  if (!isPublished) {
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

  // Published state - show URL, copy, open, unpublish
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Live indicator */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-sm font-medium text-emerald-400">Live</span>
      </div>

      {/* URL display */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg">
        <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-sm text-slate-300 max-w-[200px] truncate">
          /p/{slug}
        </span>
      </div>

      {/* Copy link button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
        className="gap-2"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-emerald-500" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">Copy Link</span>
          </>
        )}
      </Button>

      {/* Open in new tab */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpenPage}
        className="gap-2"
      >
        <ExternalLink className="w-4 h-4" />
        <span className="hidden sm:inline">Open</span>
      </Button>

      {/* Unpublish button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleUnpublish}
        disabled={isUnpublishing}
        className="text-slate-400 hover:text-slate-300"
      >
        {isUnpublishing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <EyeOff className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Unpublish</span>
          </>
        )}
      </Button>
      
      {/* Success animation overlay */}
      {showSuccess && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="bg-gradient-to-r from-purple-600/90 to-indigo-600/90 text-white px-8 py-4 rounded-2xl shadow-2xl animate-in zoom-in-75 fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold">Your page is live! 🎉</p>
                <p className="text-sm text-white/80">{publicUrl}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
