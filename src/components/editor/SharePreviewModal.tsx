import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, RefreshCw, Loader2, Link2, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createPreviewLink, getOrCreatePreviewLink } from '@/lib/editor/previewLink';

interface SharePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  landingPageId: string;
}

export function SharePreviewModal({ open, onOpenChange, landingPageId }: SharePreviewModalProps) {
  const [previewLink, setPreviewLink] = useState<{ token: string; expires_at: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const previewUrl = previewLink
    ? `${window.location.origin}/preview/${previewLink.token}`
    : '';

  useEffect(() => {
    if (open && landingPageId) {
      fetchOrCreateLink();
    }
  }, [open, landingPageId]);

  const fetchOrCreateLink = async () => {
    setLoading(true);
    try {
      setPreviewLink(await getOrCreatePreviewLink(landingPageId));
    } catch (err) {
      console.error('Failed to fetch preview link:', err);
    } finally {
      setLoading(false);
    }
  };

  const createNewLink = async () => {
    const link = await createPreviewLink(landingPageId);
    if (!link) {
      toast.error('Failed to create preview link');
      return;
    }
    setPreviewLink(link);
  };

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      // Delete existing links for this page
      await supabase
        .from('preview_links')
        .delete()
        .eq('landing_page_id', landingPageId);

      await createNewLink();
      toast.success('New preview link generated');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(previewUrl);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const expiryDate = previewLink
    ? new Date(previewLink.expires_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Link2 className="w-5 h-5" />
            Share Preview Link
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : previewLink ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                readOnly
                value={previewUrl}
                className="text-sm bg-muted"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Expires in 7 days ({expiryDate})
            </p>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Regenerate Link
            </Button>

            <div className="flex items-start gap-2 p-3 rounded-md bg-muted/50 text-xs text-muted-foreground">
              <Info className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Preview links don't track views. Anyone with this link can view the page.</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4">Failed to generate preview link.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
