import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Globe, Copy, ExternalLink, Link2Off, RefreshCw, Check, AlertCircle } from "lucide-react";
import { generateCleanSlug } from "@/utils/slugUtils";

interface PublishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageData: any;
  sections: any[];
  styles?: any;
  designIntelligence?: any;
  brandSettings?: any;
  onPublishStateChange?: (published: boolean, slug?: string) => void;
}

type PublishState = 'idle' | 'publishing' | 'published' | 'updating';

export function PublishModal({
  open,
  onOpenChange,
  pageData,
  sections,
  styles,
  designIntelligence,
  brandSettings,
  onPublishStateChange,
}: PublishModalProps) {
  const [publishState, setPublishState] = useState<PublishState>('idle');
  const [slug, setSlug] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [slugError, setSlugError] = useState<string | null>(null);
  const [existingPublish, setExistingPublish] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Load existing publish data or initialize defaults
  useEffect(() => {
    if (!open || !pageData) return;

    const loadExisting = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      // Check if already published
      const { data } = await supabase
        .from('published_pages')
        .select('*')
        .eq('landing_page_id', pageData.id)
        .eq('user_id', session.session.user.id)
        .maybeSingle();

      if (data) {
        setExistingPublish(data);
        setSlug(data.slug);
        setPageTitle(data.page_title || "");
        setMetaDescription(data.meta_description || "");
        setPublishState(data.status === 'published' ? 'published' : 'idle');
      } else {
        // Pre-fill from page data
        const heroSection = sections?.find((s: any) => s.type === 'hero' && s.visible);
        const companyName = brandSettings?.companyName || pageData?.title || "";
        setSlug(generateCleanSlug(companyName));
        setPageTitle(heroSection?.content?.headline || pageData?.title || "");
        setMetaDescription(heroSection?.content?.subheadline || pageData?.meta_description || "");
        setPublishState('idle');
        setExistingPublish(null);
      }
    };

    loadExisting();
  }, [open, pageData?.id]);

  const validateSlug = (value: string): boolean => {
    if (value.length < 3) {
      setSlugError("Slug must be at least 3 characters");
      return false;
    }
    if (value.length > 100) {
      setSlugError("Slug must be under 100 characters");
      return false;
    }
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(value)) {
      setSlugError("Only lowercase letters, numbers, and hyphens. No leading/trailing hyphens.");
      return false;
    }
    setSlugError(null);
    return true;
  };

  const handleSlugChange = (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(cleaned);
    if (cleaned) validateSlug(cleaned);
    else setSlugError(null);
  };

  const handlePublish = async () => {
    if (!validateSlug(slug)) return;
    if (!pageData?.id) return;

    setPublishState('publishing');

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error("Not authenticated");

      const userId = session.session.user.id;
      const contentSnapshot = {
        page_content: sections,
        page_styles: styles || pageData?.styles,
        page_title: pageTitle,
        meta_description: metaDescription,
        design_intelligence: designIntelligence || pageData?.design_intelligence,
        brand_settings: brandSettings,
      };

      // Check slug availability (excluding own record)
      const { data: existing } = await supabase
        .from('published_pages')
        .select('id')
        .eq('slug', slug)
        .neq('landing_page_id', pageData.id)
        .maybeSingle();

      if (existing) {
        // Append random suffix
        const suffix = Math.random().toString(36).substring(2, 6);
        const newSlug = `${slug}-${suffix}`;
        setSlug(newSlug);
        setSlugError(`"${slug}" is taken. Try "${newSlug}" instead.`);
        setPublishState('idle');
        return;
      }

      if (existingPublish) {
        // Update existing
        const { error } = await supabase
          .from('published_pages')
          .update({
            slug,
            page_content: contentSnapshot.page_content as any,
            page_styles: contentSnapshot.page_styles,
            page_title: pageTitle,
            meta_description: metaDescription,
            design_intelligence: contentSnapshot.design_intelligence,
            brand_settings: contentSnapshot.brand_settings,
            status: 'published',
            published_at: new Date().toISOString(),
            unpublished_at: null,
          })
          .eq('id', existingPublish.id);

        if (error) throw error;
        setExistingPublish({ ...existingPublish, slug, status: 'published' });
      } else {
        // Create new
        const { data: newPublish, error } = await supabase
          .from('published_pages')
          .insert({
            landing_page_id: pageData.id,
            user_id: userId,
            slug,
            page_content: contentSnapshot.page_content as any,
            page_styles: contentSnapshot.page_styles,
            page_title: pageTitle,
            meta_description: metaDescription,
            design_intelligence: contentSnapshot.design_intelligence,
            brand_settings: contentSnapshot.brand_settings,
            status: 'published',
          })
          .select()
          .single();

        if (error) throw error;
        setExistingPublish(newPublish);
      }

      // Also update the landing_pages record for backward compat
      await supabase
        .from('landing_pages')
        .update({
          status: 'published',
          is_published: true,
          published_at: new Date().toISOString(),
          published_url: `/p/${slug}`,
          slug,
        })
        .eq('id', pageData.id);

      setPublishState('published');
      onPublishStateChange?.(true, slug);
      toast.success("Page published! 🎉");
    } catch (error: any) {
      console.error('Publish error:', error);
      toast.error("Failed to publish", { description: error.message || "Please try again." });
      setPublishState('idle');
    }
  };

  const handleUpdate = async () => {
    if (!existingPublish) return;
    setPublishState('updating');

    try {
      const { error } = await supabase
        .from('published_pages')
        .update({
          page_content: sections as any,
          page_styles: styles || pageData?.styles,
          page_title: pageTitle,
          meta_description: metaDescription,
          design_intelligence: designIntelligence || pageData?.design_intelligence,
          brand_settings: brandSettings,
        })
        .eq('id', existingPublish.id);

      if (error) throw error;

      setPublishState('published');
      toast.success("Published page updated");
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error("Failed to update", { description: error.message });
      setPublishState('published');
    }
  };

  const handleUnpublish = async () => {
    if (!existingPublish) return;

    try {
      const { error } = await supabase
        .from('published_pages')
        .update({
          status: 'unpublished',
          unpublished_at: new Date().toISOString(),
        })
        .eq('id', existingPublish.id);

      if (error) throw error;

      // Also update landing_pages
      await supabase
        .from('landing_pages')
        .update({
          status: 'draft',
          is_published: false,
        })
        .eq('id', pageData.id);

      setExistingPublish({ ...existingPublish, status: 'unpublished' });
      setPublishState('idle');
      onPublishStateChange?.(false);
      toast.success("Page unpublished");
    } catch (error: any) {
      console.error('Unpublish error:', error);
      toast.error("Failed to unpublish");
    }
  };

  const handleCopyUrl = async () => {
    const url = `${window.location.origin}/p/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("URL copied to clipboard");
  };

  const fullUrl = `${window.location.origin}/p/${slug}`;

  // Published state view
  if (publishState === 'published' && existingPublish?.status === 'published') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Check className="w-5 h-5 text-green-500" />
              Page is Live
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 bg-muted/50 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">Your public URL</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm text-foreground truncate">{fullUrl}</code>
                <Button size="icon" variant="ghost" onClick={handleCopyUrl} className="shrink-0">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => window.open(fullUrl, '_blank')} className="shrink-0">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleUpdate}
                disabled={isUpdating}
                className="flex-1"
              >
                {isUpdating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating...</>
                ) : (
                  <><RefreshCw className="w-4 h-4 mr-2" />Update Page</>
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={handleUnpublish}
                className="text-destructive hover:text-destructive"
              >
                <Link2Off className="w-4 h-4 mr-2" />
                Unpublish
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Publishing animation
  if (publishState === 'publishing') {
    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="max-w-sm bg-card border-border">
          <div className="text-center space-y-4 py-8">
            <Globe className="w-12 h-12 mx-auto text-primary animate-pulse" />
            <h3 className="text-lg font-semibold text-foreground">Publishing your page...</h3>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div className="bg-primary h-1.5 rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Default: publish form
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Publish Your Page</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Slug */}
          <div className="space-y-2">
            <Label className="text-foreground">Page URL</Label>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {window.location.origin}/p/
              </span>
              <Input
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="my-business"
                className="text-sm"
              />
            </div>
            {slugError && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {slugError}
              </p>
            )}
            <p className="text-xs text-muted-foreground truncate">{fullUrl}</p>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label className="text-foreground">Page Title</Label>
            <Input
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              placeholder="Your landing page headline"
              maxLength={255}
            />
          </div>

          {/* Meta Description */}
          <div className="space-y-2">
            <Label className="text-foreground">Meta Description</Label>
            <Textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Brief description for search engines..."
              maxLength={160}
              rows={2}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">{metaDescription.length}/160</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button
              onClick={handlePublish}
              disabled={!slug || !!slugError}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Globe className="w-4 h-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
