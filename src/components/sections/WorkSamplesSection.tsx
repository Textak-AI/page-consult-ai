import { useEffect, useRef, useState } from 'react';
import { Upload, ArrowUp, ArrowDown, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { LOGO_REJECTION_TEXT } from '@/lib/logoAudit';
import { auditWorkSample, uploadedSamples, moveSample, pairSamples, sampleGroups, WORK_SAMPLE_RULES, type WorkSample } from '@/lib/workSamples';
import { shape, spacing, space, signatureTokens, typeScale } from '@/lib/design/tokens';
import { GazeReveal } from '@/components/motion/GazeReveal';

interface Props { content: { samples?: WorkSample[] }; onUpdate?: (content: any) => void; editor?: boolean }
const storageOrigin = import.meta.env.VITE_SUPABASE_URL;

/** No image picker, provider, generated text or URL input is reachable from this section. */
export function WorkSamplesSection({ content, onUpdate, editor = false }: Props) {
  const samples = uploadedSamples(content.samples, storageOrigin);
  const current = useRef({ content, samples, onUpdate });
  current.current = { content, samples, onUpdate };
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState<string[]>([]);
  const [selection, setSelection] = useState<string[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const urls = JSON.stringify(samples.map(s => s.url));
  useEffect(() => {
    let active = true;
    const candidates: string[] = JSON.parse(urls);
    Promise.all(candidates.map(async url => (await auditWorkSample(url)).ok ? url : null)).then(result => {
      if (active) setVerified(result.filter((url): url is string => !!url));
    });
    return () => { active = false; };
  }, [urls]);
  const update = (next: WorkSample[]) => current.current.onUpdate?.({ ...current.current.content, samples: next });
  const upload = async (files: FileList | null) => {
    if (!files || busy) return;
    setBusy(true); setError('');
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('Please sign in to upload work samples.');
      for (const file of Array.from(files)) {
        if (current.current.samples.length >= WORK_SAMPLE_RULES.max) throw new Error('A section can contain up to 6 images.');
        const ext = ({ 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' } as Record<string, string>)[file.type];
        if (!ext) throw new Error('Choose a PNG, JPG or WebP image.');
        if (file.size > WORK_SAMPLE_RULES.maxBytes) throw new Error('Each image must be 2MB or smaller.');
        const localUrl = URL.createObjectURL(file);
        const verdict = await auditWorkSample(localUrl);
        URL.revokeObjectURL(localUrl);
        if (!verdict.ok) throw new Error(verdict.reason === 'too-small' ? 'Images need a 16px short side and a 64px long side.' : LOGO_REJECTION_TEXT[verdict.reason || 'failed-to-load']);
        const id = crypto.randomUUID();
        const storagePath = `${user.id}/work-samples/${id}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('brand-assets').upload(storagePath, file, { upsert: false, contentType: file.type });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('brand-assets').getPublicUrl(storagePath);
        const sample: WorkSample = { id, source: 'client-upload', url: publicUrl, storagePath, width: verdict.width || 0, height: verdict.height || 0 };
        const next = [...current.current.samples, sample];
        update(next);
        // Retain successive files even before React commits this upload batch.
        current.current = { ...current.current, samples: next, content: { ...current.current.content, samples: next } };
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Upload failed. Please try again.'); }
    finally { setBusy(false); if (input.current) input.current.value = ''; }
  };
  const live = samples.filter(s => verified.includes(s.url));
  const gallery = live.length >= WORK_SAMPLE_RULES.min;
  const figure = (s: WorkSample, label?: string) => <figure key={s.id} className="min-w-0">
    {label && <p className="mb-2 font-medium" style={typeScale.small}>{label}</p>}
    <div className="overflow-hidden" style={{ aspectRatio: shape.sampleAspectRatio, borderRadius: shape.radiusImage }}>
      <img src={s.url} alt={typeof s.caption === 'string' ? s.caption : ''} width={s.width} height={s.height} loading="lazy" decoding="async" className="h-full w-full object-contain" onError={() => setVerified(v => v.filter(url => url !== s.url))} />
    </div>
    {typeof s.caption === 'string' && s.caption.trim() && <figcaption className="mt-2 break-words whitespace-pre-wrap" style={typeScale.small}>{s.caption}</figcaption>}
  </figure>;
  return <>
    {editor && <div className="px-6 py-3" data-work-samples-controls>
      <Button variant="outline" onClick={() => setOpen(true)}><Upload />{samples.length ? 'Edit work samples' : 'Add work samples'}</Button>
    </div>}
    {gallery && <GazeReveal sectionType="work-samples"><section data-work-samples aria-label="Work samples" style={spacing.section}>
      <div className="grid grid-cols-1 md:grid-cols-2 mx-auto" style={{ maxWidth: signatureTokens.maxWidth, gap: space.lg }}>
        {sampleGroups(live).map(group => group.length === 2 ? <div key={group[0].pairId} data-work-pair className="md:col-span-2 grid grid-cols-1 md:grid-cols-2" style={{ gap: space.lg }}>{figure(group[0], 'Before')}{figure(group[1], 'After')}</div> : figure(group[0]))}
      </div>
    </section></GazeReveal>}
    {editor && <Sheet open={open} onOpenChange={setOpen}><SheetContent className="w-full sm:max-w-lg overflow-y-auto">
      <SheetHeader><SheetTitle>Work samples</SheetTitle><SheetDescription>Show real work - uploads only</SheetDescription></SheetHeader>
      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" aria-label="Upload work samples" onChange={e => upload(e.target.files)} />
      <Button className="my-4" onClick={() => input.current?.click()} disabled={busy || samples.length >= 6}>{busy ? <Loader2 className="animate-spin" /> : <Upload />}Add work samples</Button>
      <p className="text-xs text-muted-foreground mb-4">2–6 images · PNG, JPG or WebP · up to 2MB each</p>
      {error && <p role="alert" className="text-destructive mb-4">{error}</p>}
      <div className="space-y-6">{samples.map((s, index) => <div key={s.id} data-sample-editor={s.id}>
        <img src={s.url} alt="" className="w-full object-contain" style={{ aspectRatio: shape.sampleAspectRatio, borderRadius: shape.radiusImage }} />
        <label className="block text-sm mt-2">Caption<input aria-label={`Caption ${index + 1}`} className="w-full rounded-md border border-input bg-background px-3 py-2 mt-1 text-sm" value={typeof s.caption === 'string' ? s.caption : ''} disabled={busy} onChange={e => update(samples.map(p => p.id === s.id ? { ...p, caption: e.target.value } : p))} /></label>
        <div className="flex items-center gap-2 flex-wrap mt-2">
          <Button size="icon" variant="ghost" title="Move image up" aria-label={`Move image ${index + 1} up`} disabled={busy || index === 0} onClick={() => update(moveSample(samples, index, -1))}><ArrowUp /></Button>
          <Button size="icon" variant="ghost" title="Move image down" aria-label={`Move image ${index + 1} down`} disabled={busy || index === samples.length - 1} onClick={() => update(moveSample(samples, index, 1))}><ArrowDown /></Button>
          <Button size="icon" variant="ghost" title="Remove image" aria-label={`Remove image ${index + 1}`} disabled={busy} onClick={() => { update(samples.filter(p => p.id !== s.id).map(p => p.pairId === s.pairId ? { ...p, pairId: undefined, pairRole: undefined } : p)); setSelection(v => v.filter(id => id !== s.id)); }}><Trash2 /></Button>
          <label className="text-sm flex items-center gap-2"><input type="checkbox" aria-label={`Pair image ${index + 1}`} checked={selection.includes(s.id)} disabled={busy || (!selection.includes(s.id) && selection.length === 2)} onChange={e => setSelection(v => e.target.checked ? [...v, s.id] : v.filter(id => id !== s.id))} />Pair</label>
          {s.pairId && <Button variant="ghost" size="sm" disabled={busy} onClick={() => update(samples.map(p => p.pairId === s.pairId ? { ...p, pairId: undefined, pairRole: undefined } : p))}>Unpair</Button>}
        </div>
      </div>)}</div>
      <Button variant="outline" className="mt-4 w-full" disabled={selection.length !== 2 || busy} onClick={() => { update(pairSamples(samples, selection[0], selection[1], crypto.randomUUID())); setSelection([]); }}>Pair as Before / After</Button>
    </SheetContent></Sheet>}
  </>;
}