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

  return (
    <section
      className="relative min-h-[85vh] flex items-center overflow-hidden"
      style={{ backgroundColor: bgStyles.bg }}
    >
      {/* Editing outline */}
      {isEditing && (
        <div className="absolute inset-0 border-2 border-blue-500/50 rounded-lg pointer-events-none z-20" />
      )}

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-28 w-full">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Text content — left 55% */}
          <div className="lg:col-span-7 space-y-8">
            {/* Logo */}
            {content.logoUrl ? (
              <img
                src={content.logoUrl}
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
              className={`leading-[1.15] ${isEditing ? 'outline-dashed outline-2 outline-cyan-500/30 rounded px-2' : ''}`}
              style={{
                color: bgStyles.text,
                fontWeight: headingWeight,
                fontSize: 'clamp(2rem, 4vw, 3.5rem)',
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
              className={`text-lg md:text-xl leading-[1.75] max-w-xl ${isEditing ? 'outline-dashed outline-2 outline-cyan-500/30 rounded px-2' : ''}`}
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

          {/* Visual — right 45% */}
          <div className="lg:col-span-5">
            {content.backgroundImage ? (
              <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/5]">
                <img
                  src={content.backgroundImage}
                  alt={content.headline || 'Hero visual'}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              /* Abstract brand shape when no image */
              <div
                className="relative rounded-2xl aspect-[4/5] flex items-center justify-center overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}18 0%, ${primaryColor}08 50%, ${primaryColor}20 100%)`,
                  border: `1px solid ${bgStyles.border}`,
                }}
              >
                {/* Decorative circles */}
                <div
                  className="absolute w-48 h-48 rounded-full blur-2xl"
                  style={{ backgroundColor: `${primaryColor}15`, top: '20%', left: '10%' }}
                />
                <div
                  className="absolute w-32 h-32 rounded-full blur-xl"
                  style={{ backgroundColor: `${primaryColor}20`, bottom: '25%', right: '15%' }}
                />
                {content.logoUrl && (
                  <img
                    src={content.logoUrl}
                    alt=""
                    className="relative z-10 h-16 md:h-20 opacity-30"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
