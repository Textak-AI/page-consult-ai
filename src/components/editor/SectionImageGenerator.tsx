import { useState } from "react";
import { Sparkles, Zap, Loader2, RefreshCw, Check, X } from "lucide-react";
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
import { cn } from "@/lib/utils";

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
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
    setSelectedImage(null);
    setError(null);
  };

  const handleClose = () => {
    // Don't clear generated images - user might want to come back
    // Only clear on successful apply or explicit reset
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate Image for {sectionLabel}
          </SheetTitle>
          <SheetDescription>
            Describe the image you want or choose a suggestion below.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
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

          {/* Error */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              {error}
            </div>
          )}

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

          {/* Generated Images Grid */}
          {!isLoading && generatedImages.length > 0 && (
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
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={cn(
                      "relative aspect-video rounded-lg overflow-hidden border-2 transition-all",
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
  );
}
