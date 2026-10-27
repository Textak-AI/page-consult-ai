import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";

interface SeoPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageData: any;
  sections?: any[];
  onSaved?: (metaTitle: string | null, metaDescription: string | null) => void;
}

/**
 * Per-page SEO controls — meta title and meta description for search and
 * link previews. Persists to landing_pages under the owner's RLS.
 * Zero fabrication: empty fields are stored as null so every downstream
 * consumer falls back to the page's real title and real first-section copy.
 */
export function SeoPanel({ open, onOpenChange, pageData, sections, onSaved }: SeoPanelProps) {
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Real fallbacks — the page's own title and hero copy, never synthesized
  const heroSection = sections?.find((s: any) => s.type === 'hero' && s.visible !== false);
  const fallbackTitle = pageData?.title || "";
  const fallbackDescription = heroSection?.content?.subheadline || "";

  useEffect(() => {
    if (!open || !pageData) return;
    setMetaTitle(pageData.meta_title || "");
    setMetaDescription(pageData.meta_description || "");
  }, [open, pageData?.id]);

  const handleSave = async () => {
    if (!pageData?.id) return;
    setIsSaving(true);
    try {
      const titleValue = metaTitle.trim() || null;
      const descriptionValue = metaDescription.trim() || null;

      const { error } = await supabase
        .from('landing_pages')
        .update({
          meta_title: titleValue,
          meta_description: descriptionValue,
        })
        .eq('id', pageData.id);

      if (error) throw error;

      onSaved?.(titleValue, descriptionValue);
      toast.success("SEO settings saved");
      onOpenChange(false);
    } catch (error: any) {
      console.error('SEO save error:', error);
      toast.error("Failed to save SEO settings", { description: error.message || "Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Search className="w-5 h-5 text-primary" />
            Search & Link Preview
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            How this page appears in search results and when the link is shared.
            Leave a field empty to use your page's real title and intro copy.
          </p>

          {/* Meta Title */}
          <div className="space-y-2">
            <Label className="text-foreground">Meta Title</Label>
            <Input
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder={fallbackTitle || "Page title"}
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground text-right">
              {metaTitle.length} characters — aim for ~60
            </p>
          </div>

          {/* Meta Description */}
          <div className="space-y-2">
            <Label className="text-foreground">Meta Description</Label>
            <Textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder={fallbackDescription || "Brief description for search engines..."}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {metaDescription.length} characters — aim for ~160
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSaving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
