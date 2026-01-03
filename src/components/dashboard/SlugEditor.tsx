import { useState, useEffect } from 'react';
import { Link as LinkIcon, Check, X, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SlugEditorProps {
  pageId: string;
  currentSlug: string;
  pageTitle?: string;
  onSlugChange?: (newSlug: string) => void;
}

export function SlugEditor({
  pageId,
  currentSlug,
  pageTitle,
  onSlugChange,
}: SlugEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [slug, setSlug] = useState(currentSlug);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const baseUrl = `${window.location.origin}/page/`;

  // Generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  };

  // Check slug availability
  const checkAvailability = async (slugToCheck: string) => {
    if (!slugToCheck || slugToCheck === currentSlug) {
      setIsAvailable(null);
      return;
    }

    setIsChecking(true);
    try {
      const { data, error } = await supabase
        .from('landing_pages')
        .select('id')
        .eq('slug', slugToCheck)
        .neq('id', pageId)
        .limit(1);

      if (error) throw error;
      setIsAvailable(data.length === 0);
    } catch (err) {
      console.error('Error checking slug:', err);
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  };

  // Debounced availability check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isEditing && slug !== currentSlug) {
        checkAvailability(slug);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [slug, isEditing, currentSlug]);

  // Handle slug input change
  const handleSlugChange = (value: string) => {
    const sanitized = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
    setSlug(sanitized);
    setIsAvailable(null);
  };

  // Save the new slug
  const handleSave = async () => {
    if (!slug || slug === currentSlug || isAvailable === false) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('landing_pages')
        .update({ slug })
        .eq('id', pageId);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'URL Already Taken',
            description: 'Please choose a different URL.',
            variant: 'destructive',
          });
          setIsAvailable(false);
          return;
        }
        throw error;
      }

      toast({
        title: 'URL Updated',
        description: 'Your page URL has been changed.',
      });

      onSlugChange?.(slug);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving slug:', err);
      toast({
        title: 'Save Failed',
        description: 'Could not update the URL. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setSlug(currentSlug);
    setIsEditing(false);
    setIsAvailable(null);
  };

  // Suggest slug from title
  const handleSuggest = () => {
    if (pageTitle) {
      const suggested = generateSlug(pageTitle);
      setSlug(suggested);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Page URL</label>

      {!isEditing ? (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/30">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <LinkIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm text-muted-foreground">{baseUrl}</span>
            <span className="text-sm font-medium text-foreground truncate">
              {currentSlug}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-primary"
          >
            Edit
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-2 rounded-lg border border-primary bg-background">
            <div className="flex items-center flex-1 min-w-0">
              <span className="text-sm text-muted-foreground pl-2 flex-shrink-0">
                {baseUrl}
              </span>
              <Input
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className="flex-1 border-0 shadow-none focus-visible:ring-0 text-sm"
                placeholder="your-page-url"
                autoFocus
              />
              <div className="flex-shrink-0 w-6 flex items-center justify-center">
                {isChecking && (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                )}
                {!isChecking && isAvailable === true && (
                  <Check className="w-4 h-4 text-emerald-500" />
                )}
                {!isChecking && isAvailable === false && (
                  <X className="w-4 h-4 text-destructive" />
                )}
              </div>
            </div>
          </div>

          {isAvailable === false && (
            <div className="flex items-center gap-2 text-xs text-destructive">
              <AlertCircle className="w-3 h-3" />
              This URL is already taken
            </div>
          )}
          {isAvailable === true && (
            <div className="flex items-center gap-2 text-xs text-emerald-600">
              <Check className="w-3 h-3" />
              This URL is available
            </div>
          )}

          <div className="flex items-center gap-2">
            {pageTitle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSuggest}
                className="text-xs text-muted-foreground"
              >
                Suggest from title
              </Button>
            )}
            <div className="flex-1" />
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!slug || slug === currentSlug || isAvailable === false || isSaving}
            >
              {isSaving && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
              Save
            </Button>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Choose a memorable URL for your page. Use lowercase letters, numbers, and hyphens only.
      </p>
    </div>
  );
}
