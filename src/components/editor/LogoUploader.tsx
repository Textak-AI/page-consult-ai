import { useState, useRef } from "react";
import { Upload, Loader2, Trash2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface LogoUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  currentLogoUrl?: string;
  onApplyLogo: (logoUrl: string | null) => void;
}

export function LogoUploader({
  isOpen,
  onClose,
  currentLogoUrl,
  onApplyLogo,
}: LogoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB for logos)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Logo must be under 2MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Please sign in to upload a logo");
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `logos/${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('brand-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('brand-assets')
        .getPublicUrl(data.path);

      setPreviewUrl(publicUrl);
      toast({
        title: "Logo uploaded",
        description: "Click Apply to use this logo",
      });
    } catch (err) {
      console.error('Upload error:', err);
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : 'Failed to upload logo',
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const fakeEvent = {
        target: { files: e.dataTransfer.files }
      } as React.ChangeEvent<HTMLInputElement>;
      await handleFileSelect(fakeEvent);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRemoveLogo = () => {
    setPreviewUrl(null);
  };

  const handleApply = () => {
    onApplyLogo(previewUrl);
    onClose();
  };

  const handleClose = () => {
    setPreviewUrl(currentLogoUrl || null);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            Logo Settings
          </SheetTitle>
          <SheetDescription>
            Upload a logo to display in the Hero section.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Current Logo Preview */}
          {previewUrl && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Logo</label>
              <div className="relative p-4 border rounded-lg bg-muted/50 flex items-center justify-center">
                <img 
                  src={previewUrl} 
                  alt="Logo preview" 
                  className="max-h-24 max-w-full object-contain"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={handleRemoveLogo}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              "hover:border-primary/50 hover:bg-muted/50",
              isUploading && "opacity-50 pointer-events-none"
            )}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm font-medium">
                  {previewUrl ? 'Upload a different logo' : 'Drop logo here or click to browse'}
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, SVG, or JPG up to 2MB
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1"
            >
              Apply Logo
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
