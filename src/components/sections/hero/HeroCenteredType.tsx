/**
 * HeroCenteredType — Analytical Validator / Precision hero
 * 
 * Full-viewport dark background, centered headline, single CTA,
 * optional grid texture, inline trust signals. Typography does the visual work.
 */

import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { getSectionBackgroundStyles } from "@/lib/artDirectorBrief";

interface HeroCenteredTypeProps {
  content: Record<string, any>;
  onUpdate: (content: any) => void;
  isEditing?: boolean;
}

export default function HeroCenteredType({ content, onUpdate, isEditing }: HeroCenteredTypeProps) {
  const bgStyles = getSectionBackgroundStyles(content.sectionBackground || 'dark', content.primaryColor);
  const primaryColor = content.primaryColor || '#6366F1';
  const isSerif = content.typographyPairing === 'serif-sans';

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
    ...(content.credibilityItems || []).map((c: any) => c.text || c.label || c),
  ].filter(Boolean).slice(0, 4);

  const trustSignals = allTrustSignals.length > 0 ? allTrustSignals : [
    'Free consultation',
    'No commitment required',
    'Response within 48 hours',
  ];

  const headingWeight = content.headingWeight || 400;
  const trackingStyle = content.trackingStyle || 'tight';
  const trackingValue = trackingStyle === 'tight' ? '-0.03em' : '0';

  return (
    <>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=JetBrains+Mono:wght@400;500;600&display=swap');`}</style>
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: bgStyles.bg }}
    >
      {/* Editing outline */}
      {isEditing && (
        <div className="absolute inset-0 border-2 border-blue-500/50 rounded-lg pointer-events-none z-20" />
      )}

      {/* Grid texture overlay */}
      {content.hasGridTexture && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      )}

      {/* Optional accent glow */}
      {content.hasAccentGlow && (
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none z-0"
          style={{ backgroundColor: `${primaryColor}15` }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Logo / brand name */}
        {content.logoUrl ? (
          <img
            src={content.logoUrl}
            alt={content.businessName || 'Logo'}
            className="h-8 md:h-10 mx-auto mb-12 opacity-70"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        ) : content.businessName ? (
          <p
            className="text-xs md:text-sm font-mono uppercase tracking-[0.2em] mb-12"
            style={{ color: bgStyles.textMuted }}
          >
            {content.businessName}
          </p>
        ) : null}

        {/* Headline */}
        <h1
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) => handleBlur('headline', e)}
          className={`leading-[1.08] mb-8 ${isEditing ? 'outline-dashed outline-2 outline-cyan-500/30 rounded px-2' : ''}`}
          style={{
            color: bgStyles.text,
            fontWeight: headingWeight,
            letterSpacing: trackingValue,
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
          }}
        >
          {content.headline}
        </h1>

        {/* Subheadline */}
        <p
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) => handleBlur('subheadline', e)}
          className={`max-w-2xl mx-auto leading-relaxed mb-12 text-lg md:text-xl ${isEditing ? 'outline-dashed outline-2 outline-cyan-500/30 rounded px-2' : ''}`}
          style={{ color: bgStyles.textMuted }}
        >
          {content.subheadline}
        </p>

        {/* Single CTA */}
        <div className="mb-12">
          <Button
            asChild
            size="lg"
            className="text-base px-8 py-6 font-medium shadow-lg transition-all duration-300 hover:scale-[1.02]"
            style={{
              backgroundColor: primaryColor,
              color: '#FFFFFF',
              borderRadius: 'var(--archetype-card-radius, 8px)',
            }}
          >
            <a href={content.ctaLink || '#contact'}>
              {content.ctaText || 'Get Started'}
            </a>
          </Button>
        </div>

        {/* Inline trust signals */}
        {allTrustSignals.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
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
    </section>
  );
}
