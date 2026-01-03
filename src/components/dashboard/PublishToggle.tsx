import { useState } from 'react';
import { Globe, GlobeLock, Copy, ExternalLink, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PublishToggleProps {
  pageId: string;
  isPublished: boolean;
  slug: string;
  onStatusChange?: (isPublished: boolean) => void;
}

export function PublishToggle({
  pageId,
  isPublished: initialPublished,
  slug,
  onStatusChange,
}: PublishToggleProps) {
  const [isPublished, setIsPublished] = useState(initialPublished);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const publicUrl = `${window.location.origin}/page/${slug}`;

  const handleToggle = async (checked: boolean) => {
    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from('landing_pages')
        .update({
          is_published: checked,
          published_at: checked ? new Date().toISOString() : null,
        })
        .eq('id', pageId);

      if (error) throw error;

      setIsPublished(checked);
      onStatusChange?.(checked);

      toast({
        title: checked ? 'Page Published!' : 'Page Unpublished',
        description: checked 
          ? 'Your page is now live and accessible to anyone with the link.'
          : 'Your page is now private.',
      });
    } catch (err) {
      console.error('Error updating publish status:', err);
      toast({
        title: 'Error',
        description: 'Failed to update publish status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    toast({
      title: 'Link Copied!',
      description: 'Public page link copied to clipboard.',
    });
  };

  const openPage = () => {
    window.open(publicUrl, '_blank');
  };

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isPublished ? (
            <Globe className="w-5 h-5 text-emerald-500" />
          ) : (
            <GlobeLock className="w-5 h-5 text-slate-400" />
          )}
          <div>
            <p className="font-medium text-sm text-foreground">
              {isPublished ? 'Published' : 'Draft'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isPublished ? 'Publicly accessible' : 'Only you can see this'}
            </p>
          </div>
        </div>

        <Switch
          checked={isPublished}
          onCheckedChange={handleToggle}
          disabled={isUpdating}
        />
      </div>

      {isPublished && (
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <div className="flex-1 text-xs text-muted-foreground truncate font-mono bg-muted/50 px-2 py-1.5 rounded">
            /page/{slug}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={copyLink}
            className="h-8 w-8 p-0"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={openPage}
            className="h-8 w-8 p-0"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      )}

      {isUpdating && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-xl">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
