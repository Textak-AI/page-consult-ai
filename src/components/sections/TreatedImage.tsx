import { useState, useRef, useEffect, type ImgHTMLAttributes } from 'react';
import { imageTreatment } from '@/lib/design/tokens';
import { cn } from '@/lib/utils';
interface Props extends ImgHTMLAttributes<HTMLImageElement> { background?: boolean; contain?: boolean; priority?: boolean }
/** Source-independent treatment; identity images can keep their existing geometry. */
export function TreatedImage({ background = false, contain = false, priority = false, className, style, onError, ...props }: Props) {
  const [failed, setFailed] = useState(false);
  const [intensity, setIntensity] = useState<keyof typeof imageTreatment.overlay>('restrained');
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const mode = ref.current?.closest('[data-image-intensity]')?.getAttribute('data-image-intensity');
    setIntensity(mode === 'expressive' || mode === 'balanced' ? mode : 'restrained');
  }, []);
  useEffect(() => { setFailed(false); }, [props.src]);
  if (failed) return null;
  return <span ref={ref} data-treated-image className={cn('treated-image', background && 'treated-image-background', className)} style={{ '--image-radius': `${imageTreatment.radius}px`, '--image-overlay-opacity': imageTreatment.overlay[intensity], ...(!background ? { aspectRatio: imageTreatment.aspectRatio } : {}), ...style } as React.CSSProperties}>
    <img {...props} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" className={contain ? 'h-full w-full object-contain' : 'h-full w-full object-cover'} onError={e => { setFailed(true); onError?.(e); }} />
  </span>;
}