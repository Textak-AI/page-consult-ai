import { useEffect, useRef, useState } from 'react';
import { Link2, Loader2, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { uploadPageVideo } from '@/lib/editor/videoUpload';
import { parseVideoLink, usableVideo, type PageVideo, type VideoPlacement } from '@/lib/video';
import { PageVideoPlayer } from './PageVideoPlayer';

const storageOrigin = import.meta.env.VITE_SUPABASE_URL;

const COPY: Record<VideoPlacement, { title: string; description: string }> = {
  section: { title: 'Video', description: 'Upload a video, or paste a YouTube, Vimeo, Loom or Wistia link.' },
  attach: { title: 'Video in this section', description: 'Shows under this section\'s content. Upload a video, or paste a link.' },
  background: { title: 'Hero background video', description: 'Plays muted on a loop behind your headline. Uploads only; keep it short and calm. Visitors who limit motion see a still frame.' },
};

/** Editor-only: choose, replace or remove a video for one placement. */
export function VideoSheet({ open, onOpenChange, placement, value, primaryColor, onChange }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placement: VideoPlacement;
  value: unknown;
  primaryColor?: string;
  onChange: (video: PageVideo | null) => void;
}) {
  const current = usableVideo(value, storageOrigin);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [link, setLink] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const input = useRef<HTMLInputElement>(null);

  // Lower third: the owner's own words; first time, start from what they told us in onboarding.
  useEffect(() => {
    if (!open) return;
    setError('');
    setLink(current?.source === 'link' ? current.url : '');
    if (current?.source === 'upload' && current.lowerThird) {
      setName(current.lowerThird.name || '');
      setRole(current.lowerThird.role || '');
      return;
    }
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('full_name, company_name').eq('id', user.id).maybeSingle();
      setName((n) => n || data?.full_name || user.user_metadata?.full_name || '');
      setRole((r) => r || data?.company_name || '');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const withLowerThird = (v: PageVideo): PageVideo =>
    v.source === 'upload' && placement !== 'background'
      ? { ...v, lowerThird: name.trim() || role.trim() ? { name: name.trim() || undefined, role: role.trim() || undefined } : null }
      : v;

  const upload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file || busy) return;
    setBusy(true); setError('');
    try {
      onChange(withLowerThird(await uploadPageVideo(file)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed. Please try again.');
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  const useLink = () => {
    const parsed = parseVideoLink(link);
    if (!parsed) { setError('Paste a YouTube, Vimeo, Loom or Wistia link.'); return; }
    setError('');
    onChange({ source: 'link', ...parsed });
  };

  const saveLowerThird = () => current && onChange(withLowerThird(current));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{COPY[placement].title}</SheetTitle>
          <SheetDescription>{COPY[placement].description}</SheetDescription>
        </SheetHeader>

        {current && placement !== 'background' && (
          <div className="mt-5"><PageVideoPlayer video={withLowerThird(current)} primaryColor={primaryColor} /></div>
        )}
        {current && placement === 'background' && current.source === 'upload' && (
          <video src={current.url} poster={current.poster || undefined} muted loop autoPlay playsInline className="mt-5 w-full rounded-md" style={{ aspectRatio: '16 / 9', objectFit: 'cover' }} />
        )}

        <div className="mt-6 space-y-3">
          <input ref={input} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" aria-label="Upload a video" onChange={(e) => upload(e.target.files)} />
          <Button onClick={() => input.current?.click()} disabled={busy} className="w-full">
            {busy ? <Loader2 className="animate-spin" /> : <Upload />}
            {busy ? 'Uploading…' : current?.source === 'upload' ? 'Replace video' : 'Upload a video'}
          </Button>
          <p className="text-xs text-muted-foreground">MP4, MOV or WebM · up to 50 MB</p>
        </div>

        {placement !== 'background' && (
          <div className="mt-6 space-y-2">
            <Label htmlFor="video-link">Or paste a link</Label>
            <div className="flex gap-2">
              <Input id="video-link" value={link} onChange={(e) => setLink(e.target.value)} placeholder="youtube.com/watch?v=…" disabled={busy} />
              <Button variant="outline" onClick={useLink} disabled={busy || !link.trim()}><Link2 />Use</Button>
            </div>
          </div>
        )}

        {placement !== 'background' && (
          <div className="mt-8 space-y-3 border-t pt-6">
            <div>
              <p className="font-medium text-sm">Name on the video</p>
              <p className="text-xs text-muted-foreground">Shows as a lower third on uploaded videos, in your brand colour and fonts. Leave both blank for none.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lt-name">Name</Label>
              <Input id="lt-name" value={name} onChange={(e) => setName(e.target.value)} onBlur={saveLowerThird} disabled={busy} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lt-role">Title or business</Label>
              <Input id="lt-role" value={role} onChange={(e) => setRole(e.target.value)} onBlur={saveLowerThird} disabled={busy} />
            </div>
          </div>
        )}

        {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}

        {current && (
          <Button variant="ghost" className="mt-6 w-full text-destructive" disabled={busy} onClick={() => onChange(null)}>
            <Trash2 />Remove video
          </Button>
        )}
      </SheetContent>
    </Sheet>
  );
}
