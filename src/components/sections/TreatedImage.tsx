import { useState, type ImgHTMLAttributes } from 'react';
import { imageTreatment } from '@/lib/design/tokens';
import { cn } from '@/lib/utils';
interface Props extends ImgHTMLAttributes<HTMLImageElement> { background?: boolean; contain?: boolean; priority?: boolean }
/** Source-independent treatment; identity images can keep their existing geometry. */
export function TreatedImage({ background = false, contain = false, priority = false, className, style, onError, ...props }: Props) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return <span data-treated-image className={cn('treated-image', background && 'treated-image-background', className)} style={{ ...(!background ? { aspectRatio: imageTreatment.aspectRatio } : {}), ...style }}>
    <img {...props} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" className={contain ? 'h-full w-full object-contain' : 'h-full w-full object-cover'} onError={e => { setFailed(true); onError?.(e); }} />
  </span>;
}