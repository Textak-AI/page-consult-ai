import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, Loader2 } from "lucide-react";

interface UnsplashImage {
  id: string;
  description: string;
  urls: {
    small: string;
    regular: string;
    full: string;
  };
  user: {
    name: string;
    username: string;
    link: string;
  };
  links: {
    download_location: string;
  };
}

interface ImagePickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (image: UnsplashImage) => void;
  defaultQuery?: string;
}

const industryDefaults: Record<string, string> = {
  'concrete': 'modern driveway concrete',
  'construction': 'construction home improvement',
  'saas': 'modern office technology',
  'healthcare': 'medical healthcare professional',
  'fitness': 'fitness gym workout',
  'food': 'restaurant food dining',
  'retail': 'shopping retail store',
  'consulting': 'business meeting professional',
};

export function ImagePicker({ open, onClose, onSelect, defaultQuery }: ImagePickerProps) {
  const [searchQuery, setSearchQuery] = useState(defaultQuery || "");
  const [results, setResults] = useState<UnsplashImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (open && defaultQuery) {
      handleSearch(defaultQuery);
    }
  }, [open, defaultQuery]);

  const handleSearch = async (query: string = searchQuery, pageNum: number = 1) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('unsplash-search', {
        body: { query: query.trim(), page: pageNum, perPage: 12 }
      });

      if (error) throw error;

      if (pageNum === 1) {
        setResults(data.results);
      } else {
        setResults(prev => [...prev, ...data.results]);
      }

      setHasMore(data.results.length === 12);
      setPage(pageNum);
    } catch (error) {
      console.error('Error searching images:', error);
      toast({
        title: "Search failed",
        description: "Could not fetch images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    handleSearch(searchQuery, page + 1);
  };

  const handleImageSelect = (image: UnsplashImage) => {
    // Track download for Unsplash attribution
    fetch(image.links.download_location, {
      headers: {
        'Authorization': 'Client-ID ' + import.meta.env.VITE_UNSPLASH_ACCESS_KEY,
      },
    }).catch(err => console.error('Failed to track download:', err));

    onSelect(image);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose Background Image</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for images (e.g., 'modern office', 'concrete driveway')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9"
              />
            </div>
            <Button onClick={() => handleSearch()} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
            </Button>
          </div>

          {/* Quick industry suggestions */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Quick searches:</span>
            {Object.entries(industryDefaults).slice(0, 4).map(([key, query]) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery(query);
                  handleSearch(query);
                }}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Button>
            ))}
          </div>

          {/* Results grid */}
          {results.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {results.map((image) => (
                <div
                  key={image.id}
                  className="group relative cursor-pointer rounded-lg overflow-hidden border hover:border-primary transition-all"
                  onClick={() => handleImageSelect(image)}
                >
                  <img
                    src={image.urls.small}
                    alt={image.description}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <div className="text-white text-xs">
                      <p className="font-medium truncate">{image.description}</p>
                      <p className="text-white/80">
                        Photo by{' '}
                        <a
                          href={image.user.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {image.user.name}
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load more button */}
          {results.length > 0 && hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Load More
              </Button>
            </div>
          )}

          {/* Empty state */}
          {!loading && results.length === 0 && searchQuery && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No images found. Try a different search term.</p>
            </div>
          )}

          {/* Attribution */}
          <p className="text-xs text-muted-foreground text-center pt-4 border-t">
            Images provided by{' '}
            <a
              href="https://unsplash.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Unsplash
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
