import { resolvePlatforms } from '@/lib/design/platformIcons';

interface Props {
  names: string[];
  links?: Record<string, string> | null;
  color: string;
  /** Icon height in px. */
  size?: number;
}

/**
 * The places the owner named, as a row of link icons (the platforms' own marks) with the
 * name as the accessible label and the fallback when no mark exists. A platform without a
 * URL shows but doesn't link; nothing here is invented.
 */
export function PlatformRow({ names, links, color, size = 22 }: Props) {
  const items = resolvePlatforms(names, links);
  if (!items.length) return null;
  return (
    <ul className="flex flex-wrap items-center gap-x-5 gap-y-3" aria-label="Where to listen">
      {items.map((p) => {
        const inner = p.path ? (
          <svg role="img" aria-label={p.title || p.name} viewBox="0 0 24 24" width={size} height={size} fill={color}><title>{p.title || p.name}</title><path d={p.path} /></svg>
        ) : (
          <span className="text-sm tracking-wide" style={{ color }}>{p.name}</span>
        );
        return (
          <li key={p.name} className="opacity-80 transition-opacity hover:opacity-100">
            {p.url ? <a href={p.url} target="_blank" rel="noopener noreferrer" title={p.name}>{inner}</a> : <span title={p.name}>{inner}</span>}
          </li>
        );
      })}
    </ul>
  );
}
