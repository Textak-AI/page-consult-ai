import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Check, Loader2, Palette, Type, MessageSquare, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { BrandBrief } from '@/hooks/useBrandBrief';

export const BrandSettings: React.FC = () => {
  const [brandBrief, setBrandBrief] = useState<BrandBrief | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExtracting, setIsExtracting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadBrandBrief();
  }, []);

  const loadBrandBrief = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('brand_briefs')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('[BrandSettings] Error loading:', error);
      }

      if (data) {
        setBrandBrief(data as unknown as BrandBrief);
      }
    } catch (err) {
      console.error('[BrandSettings] Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf')) {
      toast({ 
        title: 'Invalid file type', 
        description: 'Please upload a PDF file', 
        variant: 'destructive' 
      });
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({ 
        title: 'File too large', 
        description: 'Please upload a PDF under 10MB', 
        variant: 'destructive' 
      });
      return;
    }

    setIsExtracting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Convert to base64
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);

      console.log('[BrandSettings] Uploading PDF, size:', file.size, 'bytes');

      // Call edge function
      const { data, error } = await supabase.functions.invoke('extract-brand-brief', {
        body: {
          pdfBase64: base64,
          fileName: file.name,
          userId: user.id,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setBrandBrief(data.brandBrief);
      toast({ 
        title: 'Brand guide extracted!', 
        description: 'Colors, typography, and voice guidelines have been saved.' 
      });

    } catch (error: any) {
      console.error('[BrandSettings] Extraction error:', error);
      toast({ 
        title: 'Extraction failed', 
        description: error.message || 'Please try again', 
        variant: 'destructive' 
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const updateBrandBrief = async (updates: Partial<BrandBrief>) => {
    if (!brandBrief) return;

    try {
      const { error } = await supabase
        .from('brand_briefs')
        .update({ 
          ...updates, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', brandBrief.id);

      if (error) throw error;

      setBrandBrief({ ...brandBrief, ...updates });
      toast({ title: 'Brand settings saved' });
    } catch (err) {
      console.error('[BrandSettings] Update error:', err);
      toast({ title: 'Failed to save', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-card rounded-xl border border-border">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-xl font-semibold text-foreground">Brand Settings</h3>
        <p className="text-sm text-muted-foreground">
          Upload your brand guide to automatically apply your brand to all generated pages.
        </p>
      </div>

      {/* Upload Section */}
      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-brand/50 hover:bg-brand/5 transition-colors">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          className="hidden"
          disabled={isExtracting}
        />
        {isExtracting ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-brand" />
            <p className="text-sm font-medium text-foreground">Analyzing your brand guide...</p>
            <p className="text-xs text-muted-foreground">This takes about 30 seconds</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Upload Brand Guide (PDF)</p>
            <p className="text-xs text-muted-foreground">We'll extract colors, fonts, and voice guidelines</p>
          </div>
        )}
      </label>

      {brandBrief && (
        <>
          {/* Source file indicator */}
          {brandBrief.source_file_name && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
              <FileText className="w-4 h-4" />
              <span>Extracted from: {brandBrief.source_file_name}</span>
              <Check className="w-4 h-4 text-emerald-500 ml-auto" />
            </div>
          )}

          {/* Colors */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-brand" />
              <h4 className="font-medium text-foreground">Brand Colors</h4>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {(['primary', 'secondary', 'accent'] as const).map((colorType) => {
                const color = brandBrief.colors?.[colorType];
                return (
                  <div key={colorType} className="space-y-2">
                    <Label className="text-xs text-muted-foreground capitalize">{colorType}</Label>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-md border border-border shadow-inner"
                        style={{ backgroundColor: color?.hex || '#1a1a1a' }}
                      />
                      <Input
                        value={color?.hex || ''}
                        onChange={(e) => updateBrandBrief({
                          colors: {
                            ...brandBrief.colors,
                            [colorType]: { ...color, hex: e.target.value }
                          }
                        })}
                        placeholder="#000000"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-brand" />
              <h4 className="font-medium text-foreground">Typography</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Headline Font</Label>
                <Input
                  value={brandBrief.typography?.headlineFont || ''}
                  onChange={(e) => updateBrandBrief({
                    typography: { ...brandBrief.typography, headlineFont: e.target.value }
                  })}
                  placeholder="Inter"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Body Font</Label>
                <Input
                  value={brandBrief.typography?.bodyFont || ''}
                  onChange={(e) => updateBrandBrief({
                    typography: { ...brandBrief.typography, bodyFont: e.target.value }
                  })}
                  placeholder="Inter"
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Voice & Tone */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand" />
              <h4 className="font-medium text-foreground">Voice & Tone</h4>
            </div>
            
            {/* Personality traits */}
            {brandBrief.voice_tone?.personality && brandBrief.voice_tone.personality.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {brandBrief.voice_tone.personality.map((trait, i) => (
                  <span 
                    key={i}
                    className="px-2 py-1 text-xs rounded-full bg-brand/10 text-brand border border-brand/20"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {brandBrief.voice_tone?.description && (
              <p className="text-sm text-muted-foreground italic">
                "{brandBrief.voice_tone.description}"
              </p>
            )}

            {/* Do/Don't Say */}
            <div className="grid grid-cols-2 gap-4">
              {brandBrief.voice_tone?.doSay && brandBrief.voice_tone.doSay.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-medium text-emerald-500">✓ Do Say</span>
                  <div className="space-y-1">
                    {brandBrief.voice_tone.doSay.map((phrase, i) => (
                      <p key={i} className="text-xs text-muted-foreground">"{phrase}"</p>
                    ))}
                  </div>
                </div>
              )}
              {brandBrief.voice_tone?.dontSay && brandBrief.voice_tone.dontSay.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-medium text-rose-500">✗ Don't Say</span>
                  <div className="space-y-1">
                    {brandBrief.voice_tone.dontSay.map((phrase, i) => (
                      <p key={i} className="text-xs text-muted-foreground">"{phrase}"</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
