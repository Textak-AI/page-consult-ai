import { useState } from 'react';
import { shape } from '@/lib/design/tokens';
import { VIDEO_RULES, type PageVideo } from '@/lib/video';

const PROVIDER_NAME: Record<string, string> = { youtube: 'YouTube', vimeo: 'Vimeo', loom: 'Loom', wistia: 'Wistia' };

/**
 * Lower third over an uploaded video, styled from the page itself: the brand
 * colour as the accent bar, a brand-deep glass panel (the same colour-mix the
 * deep surfaces use), and the owner's heading font when they chose one.
 * Drawn over the player, never burned in, so it stays editable and follows
 * style changes.
 */
export function LowerThirdOverlay({ name, role, primaryColor, visible }: { name?: string; role?: string; primaryColor?: string; visible: boolean }) {
  if (!name && !role) return null;
  const accent = primaryColor || '#00B6D5';
  return (
    <div
      data-lower-third
      aria-hidden={!visible}
      className="pointer-events-none absolute left-[4%] bottom-[max(9%,3.25rem)] max-w-[78%] motion-safe:transition-all motion-safe:duration-500"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(-12px)' }}
    >
      <div
        className="flex items-stretch overflow-hidden backdrop-blur-sm"
        style={{ borderRadius: shape.radiusImage, background: `color-mix(in srgb, color-mix(in srgb, ${accent} 22%, #0B0D14) 86%, transparent)` }}
      >
        <span aria-hidden="true" style={{ width: 4, background: accent, flexShrink: 0 }} />
        <div className="px-3 py-2 sm:px-4 sm:py-2.5 min-w-0">
          {name && (
            <strong className="block truncate text-white" style={{ fontFamily: 'var(--font-heading, inherit)', fontSize: 'clamp(0.875rem, 1.6vw, 1.125rem)', lineHeight: 1.25, fontWeight: 600 }}>
              {name}
            </strong>
          )}
          {role && (
            <span className="block truncate" style={{ color: 'rgba(255,255,255,0.78)', fontSize: 'clamp(0.75rem, 1.2vw, 0.875rem)', lineHeight: 1.35 }}>
              {role}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/** One player for every placement that shows controls (Video section, video under a section). */
export function PageVideoPlayer({ video, primaryColor, className = '' }: { video: PageVideo; primaryColor?: string; className?: string }) {
  const [started, setStarted] = useState(false);
  const [time, setTime] = useState(0);
  const [failed, setFailed] = useState(false);

  if (failed) return null; // A broken upload collapses instead of showing a dead player.

  const frame = `relative w-full overflow-hidden bg-black ${className}`;
  if (video.source === 'link') {
    return (
      <div className={frame} style={{ aspectRatio: '16 / 9', borderRadius: shape.radiusImage }}>
        <iframe
          src={video.embedUrl}
          title={video.title || `${PROVIDER_NAME[video.provider]} video`}
          loading="lazy"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }

  const lt = video.lowerThird;
  const showLowerThird = !started || time < VIDEO_RULES.lowerThirdSeconds;
  return (
    <div className={frame} style={{ aspectRatio: '16 / 9', borderRadius: shape.radiusImage }}>
      <video
        src={video.url}
        poster={video.poster || undefined}
        controls
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-contain"
        onPlay={() => setStarted(true)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onError={() => setFailed(true)}
        aria-label={video.title || (lt?.name ? `Video: ${lt.name}` : 'Video')}
      />
      {lt && <LowerThirdOverlay name={lt.name} role={lt.role} primaryColor={primaryColor} visible={showLowerThird} />}
    </div>
  );
}
