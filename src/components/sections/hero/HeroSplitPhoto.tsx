import { useUsableImage } from '@/hooks/useUsableImage';
import { useUsableLogo } from '@/hooks/useUsableLogo';
import { typeScale, typeClass, shape } from '@/lib/design/tokens';
/**
 * HeroSplitPhoto — Emotional Connector / Warmth hero
 * 
 * Light background, text left (55%) with photo/visual right (45%),
 * warm serif headline, rounded CTA, generous spacing, organic feel.
 */

import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { getSectionBackgroundStyles } from "@/lib/artDirectorBrief";

interface HeroSplitPhotoProps {
  content: Record<string, any>;
  onUpdate: (content: any) => void;
  isEditing?: boolean;
}

export default function HeroSplitPhoto({ content, onUpdate, isEditing }: HeroSplitPhotoProps) {
  const bgStyles = getSectionBackgroundStyles(content.sectionBackground || 'light', content.primaryColor);
  // Render-time logo guard: a missing/broken/blank logo collapses the slot.
  const usableLogo = useUsableLogo(content.logoUrl);
  const primaryColor = content.primaryColor || '#6366F1';

  const handleBlur = (field: string, e: React.FocusEvent<HTMLElement>) => {
    onUpdate({
      ...content,
      [field]: e.currentTarget.textContent || content[field],
    });
  };

  const credibilityItems = content.credibilityBar || [];
  const trustBadges = content.trustBadges || [];
  const allTrustSignals = [
    ...credibilityItems.map((c: any) => c.text || c),
    ...trustBadges,
  ].filter(Boolean).slice(0, 3);

  const headingWeight = content.headingWeight || 500;
  const usesSerif = content.typographyPairing === 'serif-sans';

  const heroImage = useUsableImage(content.backgroundImage || content.heroImage);

  return (
    <section
      className="relative py-16 md:py-24 flex items-center overflow-hidden"
      style={{ backgroundColor: bgStyles.bg }}
    >
      {/* Editing outline */}
      {isEditing && (
        <div className="absolute inset-0 border-2 border-blue-500/50 rounded-lg pointer-events-none z-20" />
      )}

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-28 w-full">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Text content — left 55% */}
          <div className={`${heroImage ? 'lg:col-span-7' : 'lg:col-span-12 max-w-3xl'} space-y-8`}>
            {/* Logo */}
            {usableLogo ? (
              <img
                src={usableLogo}
                alt={content.businessName || 'Logo'}
                className="h-10 md:h-12 mb-4"
              />
            ) : content.businessName ? (
              <p
                className="text-sm font-semibold uppercase tracking-wider mb-4"
                style={{ color: primaryColor }}
              >
                {content.businessName}
              </p>
            ) : null}

            {/* Headline */}
            <h1
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur('headline', e)}
              className={`${typeClass.leadingH1} ${isEditing ? 'outline-dashed outline-2 outline-cyan-500/30 rounded px-2' : ''}`}
              style={{
                color: bgStyles.text,
                fontWeight: headingWeight,
                ...typeScale.h1,
                fontFamily: usesSerif ? 'Georgia, "Times New Roman", serif' : 'inherit',
              }}
            >
              {content.headline}
            </h1>

            {/* Subheadline */}
            <p
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur('subheadline', e)}
              className={`${typeClass.leadLarge} max-w-xl ${isEditing ? 'outline-dashed outline-2 outline-cyan-500/30 rounded px-2' : ''}`}
              style={{ color: bgStyles.textMuted }}
            >
              {content.subheadline}
            </p>

            {/* CTA */}
            <div className="pt-2">
              <Button
                asChild
                size="lg"
                className="text-base px-8 py-6 font-medium shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                style={{
                  backgroundColor: primaryColor,
                  color: '#FFFFFF',
                  borderRadius: '24px',
                }}
              >
                <a href={content.ctaLink || '#contact'}>
                  {content.ctaText || 'Get Started'}
                </a>
              </Button>
            </div>

            {/* Trust signals */}
            {allTrustSignals.length > 0 && (
              <div className="flex flex-wrap gap-x-6 gap-y-3 pt-4">
                {allTrustSignals.map((signal: string, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm"
                    style={{ color: bgStyles.textMuted }}
                  >
                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: primaryColor }} />
                    <span>{signal}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visual — right 45%. Without a loadable image the column is
              omitted and the text spans the row (typographic fallback). */}
          {heroImage && (
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/5]">
                <img
                  src={heroImage}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>
            </div>
          )}
        </div>
      </div>

    </section>
  );
}
