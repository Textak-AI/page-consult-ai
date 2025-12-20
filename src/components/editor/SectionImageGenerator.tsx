import { useState, useRef } from "react";
import { Sparkles, Zap, Loader2, RefreshCw, Check, X, Upload, ImageIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface SectionImageGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  sectionType: string;
  sectionContent: any;
  strategyBrief: any;
  industryContext?: string;
  onApplyImage: (imageUrl: string) => void;
}

const getImageSuggestions = (sectionType: string, industry: string): string[] => {
  const suggestions: Record<string, Record<string, string[]>> = {
    hero: {
      'Agency / Creative': [
        'Creative team brainstorming in modern studio, warm lighting',
        'Abstract visualization of growth and digital transformation',
        'Diverse marketing team collaborating on campaign strategy',
        'Modern agency workspace with creative energy'
      ],
      'B2B SaaS / Software': [
        'Professional team reviewing analytics dashboard',
        'Modern tech office with collaborative workspace',
        'Abstract data visualization, flowing connections',
        'Business leaders in strategic planning session'
      ],
      'Professional Services': [
        'Consultant presenting to executive team',
        'Professional handshake, partnership concept',
        'Modern conference room strategic meeting',
        'Abstract success and growth visualization'
      ],
      'default': [
        'Professional team collaboration in modern office',
        'Abstract business growth visualization',
        'Confident business leader, professional setting',
        'Modern workspace with natural lighting'
      ]
    },
    features: {
      'default': [
        'Abstract icons representing key features',
        'Modern interface elements with soft gradients',
        'Professional workspace with technology focus',
        'Minimalist product showcase'
      ]
    },
    'problem-solution': {
      'default': [
        'Transformation journey visualization',
        'Before and after concept, professional style',
        'Problem to solution path illustration',
        'Success achievement celebration'
      ]
    },
    'photo-gallery': {
      'default': [
        'Professional team portrait in modern office',
        'Candid workplace collaboration moment',
        'Company culture showcase',
        'Team celebration or achievement'
      ]
    }
  };
  
  return suggestions[sectionType]?.[industry] || 
         suggestions[sectionType]?.['default'] || 
         suggestions['hero']['default'];
};

export function SectionImageGenerator({
  isOpen,
  onClose,
  sectionType,
  sectionContent,
  strategyBrief,
  industryContext,
  onApplyImage
}: SectionImageGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [quality, setQuality] = useState<'quick' | 'standard'>('quick');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("generate");
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const industry = industryContext || strategyBrief?.industry || 'default';
  const suggestions = getImageSuggestions(sectionType, industry);

  const sectionLabel = sectionType
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const handleGenerate = async (customPrompt?: string) => {
    const finalPrompt = customPrompt || prompt;
    if (!finalPrompt.trim()) {
      setError("Please enter a prompt or select a suggestion");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);
    setSelectedImage(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-section-image', {
        body: {
          prompt: finalPrompt,
          sectionType,
          industry,
          quality,
          aspectRatio: sectionType === 'hero' ? 'wide' : 'square'
        }
      });

      if (fnError) throw fnError;
      
      if (data.success && data.images) {
        setGeneratedImages(data.images);
      } else {
        throw new Error(data.error || 'Failed to generate images');
      }
    } catch (err) {
      console.error('Image generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate images');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    console.log('handleApply called');
    console.log('selectedImage:', selectedImage);
    if (selectedImage) {
      console.log('Calling onApplyImage with:', selectedImage);
      onApplyImage(selectedImage);
      // Reset state after successful apply
      handleReset();
      onClose();
    }
  };

  const handleReset = () => {
    setPrompt("");
    setGeneratedImages([]);
    setUploadedImages([]);
    setSelectedImage(null);
    setError(null);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Please sign in to upload images");
      }

      const newUploadedImages: string[] = [];

      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not an image file`,
            variant: "destructive",
          });
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds 5MB limit`,
            variant: "destructive",
          });
          continue;
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Upload to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
          .from('section-images')
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
          .from('section-images')
          .getPublicUrl(data.path);

        newUploadedImages.push(publicUrl);
      }

      if (newUploadedImages.length > 0) {
        setUploadedImages(prev => [...prev, ...newUploadedImages]);
        setSelectedImage(newUploadedImages[0]);
        toast({
          title: "Upload successful",
          description: `${newUploadedImages.length} image(s) uploaded`,
        });
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      // Create a fake event to reuse handleFileSelect logic
      const fakeEvent = {
        target: { files }
      } as React.ChangeEvent<HTMLInputElement>;
      await handleFileSelect(fakeEvent);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDeleteImage = async (imageUrl: string) => {
    try {
      // Extract the file path from the public URL
      // URL format: https://<project>.supabase.co/storage/v1/object/public/section-images/<user-id>/<filename>
      const urlParts = imageUrl.split('/section-images/');
      if (urlParts.length !== 2) {
        throw new Error('Invalid image URL format');
      }
      const filePath = urlParts[1];

      // Delete from Supabase Storage
      const { error: deleteError } = await supabase.storage
        .from('section-images')
        .remove([filePath]);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw deleteError;
      }

      // Remove from local state
      setUploadedImages(prev => prev.filter(img => img !== imageUrl));
      
      // Clear selection if this image was selected
      if (selectedImage === imageUrl) {
        setSelectedImage(null);
      }

      toast({
        title: "Image deleted",
        description: "The image has been removed",
      });
    } catch (err) {
      console.error('Delete error:', err);
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : 'Failed to delete image',
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    // Don't clear generated images - user might want to come back
    // Only clear on successful apply or explicit reset
    onClose();
  };

  // Combine all images for display
  const allImages = [...generatedImages, ...uploadedImages];

  return (
    <>
      {/* Large hover preview - fixed position outside drawer */}
      {hoveredImage && (
        <div 
          className="fixed z-[200] pointer-events-none hidden lg:block"
          style={{
            right: 'calc(36rem + 24px)', // Drawer width (~xl) + gap
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        >
          <div className="rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 bg-black">
            <img 
              src={hoveredImage} 
              alt="Preview" 
              className="w-[500px] h-auto max-h-[70vh] object-contain"
            />
          </div>
        </div>
      )}
      
      <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            Add Image to {sectionLabel}
          </SheetTitle>
          <SheetDescription>
            Generate an AI image or upload your own.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Generate
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-4 mt-4">
              {/* Prompt Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Describe your image</label>
                <Textarea
                  placeholder="e.g., Professional team meeting in a modern office with natural light..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              {/* Suggestions */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Suggestions for {industry}
                </label>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="text-xs h-auto py-1.5 px-2 whitespace-normal text-left"
                      onClick={() => {
                        setPrompt(suggestion);
                        handleGenerate(suggestion);
                      }}
                      disabled={isLoading}
                    >
                      {suggestion.length > 50 ? suggestion.slice(0, 50) + '...' : suggestion}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Quality Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Quality</label>
                <div className="flex gap-2">
                  <Button
                    variant={quality === 'quick' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setQuality('quick')}
                    className="flex-1"
                  >
                    <Zap className="h-4 w-4 mr-1.5" />
                    Quick (~10s)
                  </Button>
                  <Button
                    variant={quality === 'standard' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setQuality('standard')}
                    className="flex-1"
                  >
                    <Sparkles className="h-4 w-4 mr-1.5" />
                    Standard (~20s)
                  </Button>
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={() => handleGenerate()}
                disabled={isLoading || !prompt.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating your images...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Images
                  </>
                )}
              </Button>

              {/* Loading Skeletons */}
              {isLoading && (
                <div className="grid grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="aspect-video rounded-lg bg-muted animate-pulse flex items-center justify-center"
                    >
                      <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="upload" className="space-y-4 mt-4">
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
                    <p className="text-sm font-medium">Drop images here or click to browse</p>
                    <p className="text-xs text-muted-foreground">
                      Supports JPG, PNG, WebP up to 5MB
                    </p>
                  </div>
                )}
              </div>

              {/* Uploaded Images Preview */}
              {uploadedImages.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Uploaded images</label>
                  <div className="grid grid-cols-2 gap-3">
                    {uploadedImages.map((img, i) => (
                      <div 
                        key={i} 
                        className="group relative"
                        onMouseEnter={() => setHoveredImage(img)}
                        onMouseLeave={() => setHoveredImage(null)}
                      >
                        <button
                          onClick={() => setSelectedImage(img)}
                          className={cn(
                            "relative aspect-video rounded-lg overflow-hidden border-2 transition-all w-full",
                            selectedImage === img
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-transparent hover:border-muted-foreground/30"
                          )}
                        >
                          <img
                            src={img}
                            alt={`Uploaded ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {selectedImage === img && (
                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                        </button>
                        
                        {/* Delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteImage(img);
                          }}
                          className="absolute top-2 left-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90 z-10"
                          title="Delete image"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Error */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Generated Images Grid (shown in Generate tab) */}
          {activeTab === "generate" && !isLoading && generatedImages.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Select an image</label>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="h-8"
                  >
                    <X className="h-3.5 w-3.5 mr-1.5" />
                    Start Over
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleGenerate()}
                    className="h-8"
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                    Regenerate
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {generatedImages.map((img, i) => (
                  <div 
                    key={i} 
                    className="group relative"
                    onMouseEnter={() => setHoveredImage(img)}
                    onMouseLeave={() => setHoveredImage(null)}
                  >
                    <button
                      onClick={() => setSelectedImage(img)}
                      className={cn(
                        "relative aspect-video rounded-lg overflow-hidden border-2 transition-all w-full",
                        selectedImage === img
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-transparent hover:border-muted-foreground/30"
                      )}
                    >
                      <img
                        src={img}
                        alt={`Generated option ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {selectedImage === img && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {selectedImage && (
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-1.5" />
                Cancel
              </Button>
              <Button
                onClick={handleApply}
                className="flex-1"
              >
                <Check className="h-4 w-4 mr-1.5" />
                Use Selected
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
    </>
  );
}
