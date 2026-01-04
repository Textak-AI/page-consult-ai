import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Rocket, Zap } from "lucide-react";

interface PublishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageData: any;
  onPublish: () => void;
}

export function PublishModal({
  open,
  onOpenChange,
  pageData,
  onPublish,
}: PublishModalProps) {
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [slug, setSlug] = useState(pageData?.slug || "");
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [quickPivotEnabled, setQuickPivotEnabled] = useState(pageData?.quick_pivot_enabled ?? true);

  const handlePublish = async () => {
    if (!pageData) return;

    setPublishing(true);

    try {
      const { error } = await supabase
        .from("landing_pages")
        .update({
          is_published: true,
          published_at: new Date().toISOString(),
          published_url: `/p/${slug}`,
          slug,
          analytics_enabled: analyticsEnabled,
          quick_pivot_enabled: quickPivotEnabled,
        })
        .eq("id", pageData.id);

      if (error) throw error;

      setTimeout(() => {
        setPublishing(false);
        setPublished(true);
        onPublish();
      }, 2000);
    } catch (error) {
      console.error("Publish error:", error);
      setPublishing(false);
    }
  };

  if (publishing) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="text-center space-y-4 py-8">
            <Rocket className="w-16 h-16 mx-auto text-primary animate-bounce" />
            <h3 className="text-xl font-bold">Publishing your page...</h3>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (published) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="text-center space-y-4 py-4">
            <div className="text-4xl">🎉</div>
            <h3 className="text-2xl font-bold">Your Page is Live!</h3>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Visit your page:</p>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={`${window.location.origin}/p/${slug}`}
                  className="text-sm"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/p/${slug}`
                    );
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
            <div className="flex gap-2 justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => window.open(`/p/${slug}`, "_blank")}
              >
                Open in New Tab
              </Button>
              <Button onClick={() => onOpenChange(false)}>Keep Editing</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ready to Publish Your Page? 🚀</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Page URL</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {window.location.origin}/p/
              </span>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="my-page"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Options</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="analytics"
                checked={analyticsEnabled}
                onCheckedChange={(checked) =>
                  setAnalyticsEnabled(checked as boolean)
                }
              />
              <label
                htmlFor="analytics"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Enable analytics
              </label>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Quick Pivot</p>
                  <p className="text-xs text-muted-foreground">Allow personalized prospect pages</p>
                </div>
              </div>
              <Switch
                checked={quickPivotEnabled}
                onCheckedChange={setQuickPivotEnabled}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handlePublish}>Publish Now</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
