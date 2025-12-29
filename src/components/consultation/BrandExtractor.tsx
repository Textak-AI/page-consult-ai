import { useState } from 'react';
import { extractBrandFromUrl, ExtractedBrand } from '@/lib/brandExtraction';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Globe, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BrandExtractorProps {
  onExtracted: (brand: ExtractedBrand, url: string) => void;
  onSkip: () => void;
}

export function BrandExtractor({ onExtracted, onSkip }: BrandExtractorProps) {
  const [url, setUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedBrand | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!url.trim()) {
      toast.error('Please enter a website URL');
      return;
    }

    setIsExtracting(true);
    setError(null);
    setExtracted(null);

    const result = await extractBrandFromUrl(url);

    setIsExtracting(false);

    if (result.success && result.brand) {
      setExtracted(result.brand);
      toast.success('Got it!', {
        description: result.brand.companyName || 'Brand info extracted'
      });
    } else {
      setError(result.error || 'Could not access that website');
    }
  };

  const handleContinue = () => {
    if (extracted) {
      onExtracted(extracted, url);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-white">Have an existing website?</h2>
        <p className="text-sm text-slate-300">
          We'll grab your company info to get started faster
        </p>
      </div>

      {/* URL Input */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
                setExtracted(null);
              }}
              placeholder="yourcompany.com"
              className="pl-10"
              onKeyDown={(e) => e.key === 'Enter' && !isExtracting && handleExtract()}
              disabled={isExtracting}
            />
          </div>
          <Button onClick={handleExtract} disabled={isExtracting || !url.trim()}>
            {isExtracting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Go'
            )}
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}. You can enter details manually below.
          </div>
        )}
      </div>

      {/* Extracted Preview */}
      {extracted && (
        <div className="p-4 rounded-lg border border-border bg-card space-y-3 animate-fade-in">
          <div className="flex items-center gap-3">
            {extracted.faviconUrl && (
              <img
                src={extracted.faviconUrl}
                alt=""
                className="w-8 h-8 rounded object-contain bg-muted"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground truncate">
                {extracted.companyName || extracted.domain}
              </div>
              <div className="text-sm text-muted-foreground truncate">
                {extracted.domain}
              </div>
            </div>
            {extracted.themeColor && (
              <div
                className="w-6 h-6 rounded-full border border-border"
                style={{ backgroundColor: extracted.themeColor }}
              />
            )}
          </div>

          {extracted.tagline && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {extracted.tagline}
            </p>
          )}

          <Button onClick={handleContinue} className="w-full">
            <Check className="h-4 w-4 mr-2" />
            Use this info
          </Button>
        </div>
      )}

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-700" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-slate-900 text-sm text-slate-400">
            or
          </span>
        </div>
      </div>

      {/* Skip Button */}
      <Button variant="ghost" onClick={onSkip} className="w-full text-slate-300 hover:text-white hover:bg-slate-800">
        Start fresh
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}
