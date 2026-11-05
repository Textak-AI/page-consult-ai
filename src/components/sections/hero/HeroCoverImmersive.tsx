import { useUsableImage } from '@/hooks/useUsableImage';
import { useUsableLogo } from '@/hooks/useUsableLogo';
import { GradientPayoff } from '@/components/signature/elements';
import { MagneticCta } from '@/components/motion/MagneticCta';
import { Button } from '@/components/ui/button';
import { fontStacks, typeClass, typeScale } from '@/lib/design/tokens';
import { getSectionBackgroundStyles } from '@/lib/artDirectorBrief';
import { PlatformRow } from './PlatformRow';

interface Props {
  content: Record<string, any>;
  onUpdate: (content: any) => void;
  isEditing: boolean;
}

/**
 * The immersive hero: for a record, a film, a book. A deep field sunk from the brand colour,
 * the cover as the picture (large, with its own glow), a quiet mono date caption, a display
 * headline, one ask, and the places the owner named. No chips, no checkmarks, no badges.
 */
export default function HeroCoverImmersive({ content, onUpdate, isEditing }: Props) {
  const primaryColor = content.primaryColor || '#15707F';
  const bg = getSectionBackgroundStyles('dark', primaryColor);
  const cover = useUsableImage(content.backgroundImage || content.heroImage);
  const logo = useUsableLogo(content.logoUrl);
  const listenRow: string[] = Array.isArray(content.listenRow) ? content.listenRow : [];

  const handleBlur = (field: string, e: React.FocusEvent<HTMLElement>) => {
    onUpdate({ ...content, [field]: e.currentTarget.textContent || content[field] });
  };
  const edit = isEditing ? 'outline-dashed outline-2 outline-cyan-500/30 rounded px-1' : '';

  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: bg.bg, color: bg.text }}>
      {/* Atmosphere: the brand colour as a slow field, and the cover's own glow */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-1/3 -left-1/4 h-[80vmax] w-[80vmax] rounded-full opacity-40 blur-3xl" style={{ background: `radial-gradient(circle at 40% 40%, ${primaryColor}, transparent 62%)` }} />
        {cover && <div className="absolute inset-0 opacity-25 blur-3xl scale-125 bg-center bg-cover" style={{ backgroundImage: `url(${cover})` }} />}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.35) 100%)' }} />
      </div>
      {isEditing && <div className="absolute inset-0 border-2 border-blue-500/50 rounded-lg pointer-events-none z-20" />}

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-12 md:py-28">
        <div className={`grid items-center gap-8 md:gap-16 ${cover ? 'lg:grid-cols-12' : ''}`}>
          {/* The cover: first on phones, right on desktop */}
          {cover && (
            <div className="order-first lg:order-last lg:col-span-5">
              <div className="relative mx-auto w-[min(58vw,260px)] md:w-[min(50vw,360px)] lg:w-full lg:max-w-[460px]">
                <div className="absolute -inset-6 rounded-[28px] opacity-60 blur-2xl" style={{ background: `radial-gradient(circle, ${primaryColor}66, transparent 70%)` }} aria-hidden="true" />
                <img src={cover} alt={content.productName || content.businessName || ''} className="relative w-full rounded-2xl shadow-2xl ring-1 ring-white/10" />
              </div>
            </div>
          )}

          <div className={`${cover ? 'lg:col-span-7' : 'max-w-3xl'} space-y-7`}>
            {logo ? (
              <img src={logo} alt={content.businessName || 'Logo'} className="h-8 md:h-10 opacity-90" style={{ filter: 'invert(1) brightness(1.6)', mixBlendMode: 'screen' }} />
            ) : content.businessName ? (
              <p className="text-xs font-medium uppercase tracking-[0.2em] opacity-70">{content.businessName}</p>
            ) : null}

            {content.dateLine && (
              <p className="font-mono text-xs uppercase tracking-[0.22em]" style={{ color: primaryColor, filter: 'brightness(1.5)' }}>{content.dateLine}</p>
            )}

            <h1
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur('headline', e)}
              className={`${typeClass.leadingH1} ${edit}`}
              style={{ ...typeScale.h1, fontFamily: fontStacks.serifDisplay, fontWeight: 400, letterSpacing: '-0.015em', fontSize: 'clamp(2.4rem, 6vw, 4.6rem)', lineHeight: 1.02 }}
            >
              {content.signature && !isEditing ? <GradientPayoff text={content.headline || ''} phrase={content.signature.payoff} enabled={content.signature.elements.includes('gradient')} /> : content.headline}
            </h1>

            {content.subheadline && (
              <p
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => handleBlur('subheadline', e)}
                className={`${typeClass.leadLarge} max-w-xl ${edit}`}
                style={{ color: bg.textMuted }}
              >
                {content.subheadline}
              </p>
            )}

            <div className="space-y-4 pt-1">
              {content.ctaText && (
                <MagneticCta>
                  <Button
                    asChild
                    size="lg"
                    className="pc-cta-primary text-base px-8 py-6 font-medium shadow-lg transition-all duration-300 hover:scale-[1.02]"
                    style={{ backgroundColor: primaryColor, color: '#FFFFFF', borderRadius: '999px' }}
                  >
                    <a href={content.ctaLink || '#contact'}>{content.ctaText}</a>
                  </Button>
                </MagneticCta>
              )}
              {listenRow.length > 0 && (
                <div className="pt-1">
                  <PlatformRow names={listenRow} links={content.listenLinks} color={bg.text} />
                  {isEditing && (
                    <div className="mt-3 grid gap-2 max-w-md rounded-lg border border-white/15 bg-black/30 p-3">
                      <p className="text-xs opacity-70">Links for the places you named. Leave one blank and its icon shows without a link.</p>
                      {listenRow.map((name) => (
                        <label key={name} className="flex items-center gap-2 text-xs">
                          <span className="w-28 shrink-0 opacity-80">{name}</span>
                          <input
                            type="url"
                            placeholder="https://"
                            defaultValue={content.listenLinks?.[name] || ''}
                            onBlur={(e) => {
                              const next: Record<string, string> = { ...(content.listenLinks || {}) };
                              const v = e.currentTarget.value.trim();
                              if (v) next[name] = v; else delete next[name];
                              onUpdate({ ...content, listenLinks: next });
                            }}
                            className="flex-1 rounded border border-white/20 bg-black/40 px-2 py-1 text-xs text-white placeholder:text-white/40"
                          />
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
