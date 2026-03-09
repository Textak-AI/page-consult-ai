import { useMemo } from 'react';
import { sanitizeFullCSS } from '@/lib/sanitizeCSS';
import { cn } from '@/lib/utils';
import { getSectionTier, getSectionSpacing, getSectionDivider, getAmbientOrbColors } from '@/lib/premiumPageEffects';
import { resolveArchetypeFromStorage, type DesignProfile } from '@/lib/archetypeProfiles';
import { HeroSection } from '@/components/sections/HeroSection';
import { ProblemSolutionSection } from '@/components/sections/ProblemSolutionSection';
import { CalculatorSection } from '@/components/sections/CalculatorSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { SocialProofSection } from '@/components/sections/SocialProofSection';
import { FinalCTASection } from '@/components/sections/FinalCTASection';
import { PhotoGallerySection } from '@/components/sections/PhotoGallerySection';
import { StatsBarSection } from '@/components/sections/StatsBarSection';
import { FAQSection } from '@/components/sections/FAQSection';
import { HowItWorksSection } from '@/components/sections/HowItWorksSection';
import { DifferentiatorCalloutSection } from '@/components/sections/DifferentiatorCalloutSection';
import { AudienceFitSection } from '@/components/sections/AudienceFitSection';
import { CredibilityStripSection } from '@/components/sections/CredibilityStripSection';
// SDI-driven sections
import { StakesAmplifySection } from '@/components/sections/StakesAmplifySection';
import { RiskReversalSection } from '@/components/sections/RiskReversalSection';
import { ComparisonSection } from '@/components/sections/ComparisonSection';
// Consulting-specific sections (layout template system)
import { CredentialsBarSection } from '@/components/sections/CredentialsBarSection';
import { TheRealChallengeSection } from '@/components/sections/TheRealChallengeSection';
import { OurApproachSection } from '@/components/sections/OurApproachSection';
import { ExpertiseAreasSection } from '@/components/sections/ExpertiseAreasSection';
import { EngagementModelSection } from '@/components/sections/EngagementModelSection';
import { ClientResultsSection } from '@/components/sections/ClientResultsSection';
// Beta sections
import { 
  BetaHeroTeaserSection, 
  BetaPerksSection, 
  WaitlistProofSection, 
  BetaFinalCTASection,
  FounderCredibilitySection 
} from '@/components/sections/beta';
import { PageFooter } from '@/components/PageFooter';
import { Helmet } from 'react-helmet-async';

type Section = {
  type: string;
  order: number;
  visible: boolean;
  content: any;
};

interface PublicPageRendererProps {
  sections: Section[];
  styles?: any;
  metaTitle?: string | null;
  metaDescription?: string | null;
  heroThumbnailUrl?: string | null;
  // Design intelligence for color mode and brand colors
  designIntelligence?: {
    colorMode?: 'light' | 'dark';
    industryVariant?: string;
    brandColors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
    };
  } | null;
  // Brand settings fallback
  brandSettings?: {
    companyName?: string | null;
    logoUrl?: string | null;
    primaryColor?: string | null;
  } | null;
  // Show "Built with PageConsult" badge
  showPoweredBy?: boolean;
}

export function PublicPageRenderer({ 
  sections, 
  styles,
  metaTitle,
  metaDescription,
  heroThumbnailUrl,
  designIntelligence,
  brandSettings,
  showPoweredBy = false
}: PublicPageRendererProps) {
  
  // Derive colorMode from design intelligence
  const colorMode = designIntelligence?.colorMode || 'dark';
  const industryVariant = designIntelligence?.industryVariant || 'default';
  
  // Resolve archetype design profile
  const archetypeProfile = useMemo<DesignProfile>(() => {
    // Check if hero section has archetype
    const heroSection = sections?.find(s => s.type === 'hero' && s.visible);
    if (heroSection?.content?.archetype) return heroSection.content.archetype as DesignProfile;
    return resolveArchetypeFromStorage();
  }, [sections]);
  
  // Sort sections by order
  const sortedSections = useMemo(() => {
    return [...sections]
      .filter(s => s.visible)
      .sort((a, b) => a.order - b.order);
  }, [sections]);

  const renderSection = (section: Section, index: number) => {
    // Read-only render - no editing, no update callbacks
    const noOp = () => {};

    switch (section.type) {
      case 'hero':
        return (
          <HeroSection
            key={index}
            content={section.content}
            onUpdate={noOp}
            isEditing={false}
          />
        );
      case 'stats-bar':
        return (
          <StatsBarSection 
            key={index}
            statistics={section.content.statistics || []} 
            industryVariant={section.content.industryVariant}
            mode={section.content.mode}
            onUpdate={noOp}
            isEditing={false}
          />
        );
      case 'problem-solution':
        return (
          <ProblemSolutionSection
            key={index}
            content={section.content}
            onUpdate={noOp}
            isEditing={false}
          />
        );
      case 'calculator':
        return (
          <CalculatorSection 
            key={index} 
            content={section.content} 
            onUpdate={noOp} 
          />
        );
      case 'features':
        return (
          <FeaturesSection
            key={index}
            content={section.content}
            onUpdate={noOp}
            isEditing={false}
          />
        );
      case 'photo-gallery':
        return (
          <PhotoGallerySection
            key={index}
            content={section.content}
            onUpdate={noOp}
            isEditing={false}
          />
        );
      case 'social-proof':
        return (
          <SocialProofSection 
            key={index}
            content={section.content} 
            onUpdate={noOp} 
            isEditing={false}
          />
        );
      case 'final-cta':
        return (
          <FinalCTASection
            key={index}
            content={section.content}
            onUpdate={noOp}
            isEditing={false}
          />
        );
      case 'faq':
        return (
          <FAQSection
            key={index}
            content={section.content}
            onUpdate={noOp}
            isEditing={false}
          />
        );
      case 'how-it-works':
        return (
          <HowItWorksSection 
            key={index}
            content={section.content} 
            onUpdate={noOp} 
            isEditing={false}
          />
        );
      case 'beta-hero-teaser':
        return (
          <BetaHeroTeaserSection
            key={index}
            content={section.content}
            onUpdate={noOp}
            isEditing={false}
          />
        );
      case 'beta-perks':
        return (
          <BetaPerksSection 
            key={index} 
            content={section.content} 
            onUpdate={noOp} 
          />
        );
      case 'waitlist-proof':
        return (
          <WaitlistProofSection 
            key={index} 
            content={section.content} 
          />
        );
      case 'beta-final-cta':
        return (
          <BetaFinalCTASection
            key={index}
            content={section.content}
            onUpdate={noOp}
            isEditing={false}
          />
        );
      case 'differentiator-callout':
        return (
          <DifferentiatorCalloutSection 
            key={index} 
            content={section.content} 
          />
        );
      case 'audience-fit':
        return (
          <AudienceFitSection
            key={index}
            content={section.content}
            onUpdate={noOp}
            isEditing={false}
          />
        );
      case 'credibility-strip':
        return (
          <CredibilityStripSection 
            key={index} 
            content={section.content} 
          />
        );
      case 'founder':
        return (
          <FounderCredibilitySection
            key={index}
            content={section.content}
            onUpdate={noOp}
            isEditing={false}
          />
        );
      // SDI-driven section types
      case 'stakes-amplify':
        return (
          <StakesAmplifySection
            key={index}
            content={section.content}
            onUpdate={noOp}
            isEditing={false}
          />
        );
      case 'risk-reversal':
        return (
          <RiskReversalSection
            key={index}
            content={section.content}
            onUpdate={noOp}
            isEditing={false}
          />
        );
      case 'comparison':
        return (
          <ComparisonSection
            key={index}
            content={section.content}
            onUpdate={noOp}
            isEditing={false}
          />
        );
      // Consulting-specific section types (from layout templates)
      case 'credentials-bar':
        console.log('🎨 [PublicRenderer] Rendering section: credentials-bar');
        return (
          <CredentialsBarSection key={index} content={section.content} />
        );
      case 'the-real-challenge':
        console.log('🎨 [PublicRenderer] Rendering section: the-real-challenge');
        return (
          <TheRealChallengeSection key={index} content={section.content} />
        );
      case 'our-approach':
        console.log('🎨 [PublicRenderer] Rendering section: our-approach');
        return (
          <OurApproachSection key={index} content={section.content} />
        );
      case 'expertise-areas':
        console.log('🎨 [PublicRenderer] Rendering section: expertise-areas');
        return (
          <ExpertiseAreasSection key={index} content={section.content} />
        );
      case 'engagement-model':
        console.log('🎨 [PublicRenderer] Rendering section: engagement-model');
        return (
          <EngagementModelSection key={index} content={section.content} />
        );
      case 'client-results':
        console.log('🎨 [PublicRenderer] Rendering section: client-results');
        return (
          <ClientResultsSection key={index} content={section.content} />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        {metaTitle && <title>{metaTitle}</title>}
        {metaDescription && <meta name="description" content={metaDescription} />}
        {/* Open Graph tags */}
        {metaTitle && <meta property="og:title" content={metaTitle} />}
        {metaDescription && <meta property="og:description" content={metaDescription} />}
        {heroThumbnailUrl && <meta property="og:image" content={heroThumbnailUrl} />}
        <meta property="og:type" content="website" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        {metaTitle && <meta name="twitter:title" content={metaTitle} />}
        {metaDescription && <meta name="twitter:description" content={metaDescription} />}
        {heroThumbnailUrl && <meta name="twitter:image" content={heroThumbnailUrl} />}
      </Helmet>

      {/* Apply custom styles if provided (sanitized) */}
      {styles?.cssVariables && (
        <style dangerouslySetInnerHTML={{ __html: sanitizeFullCSS(styles.cssVariables) }} />
      )}

      <div 
        data-mode={colorMode}
        data-industry={industryVariant}
        className={cn(
          colorMode === 'light' ? 'min-h-screen bg-white' : 'min-h-screen bg-slate-950',
          colorMode === 'dark' && 'page-noise-overlay',
          'relative'
        )}
        style={(() => {
          const styles: React.CSSProperties = {};
          const primaryColor = designIntelligence?.brandColors?.primary || brandSettings?.primaryColor;
          if (primaryColor) {
            styles['--color-brand' as any] = primaryColor;
            styles['--color-primary' as any] = primaryColor;
            styles['--brand-primary' as any] = primaryColor;
          }
          const secondaryColor = designIntelligence?.brandColors?.secondary;
          if (secondaryColor) {
            styles['--color-secondary' as any] = secondaryColor;
            styles['--brand-secondary' as any] = secondaryColor;
          }
          return Object.keys(styles).length > 0 ? styles : undefined;
        })()}
      >
        {/* Ambient floating orbs — dark mode only */}
        {colorMode === 'dark' && (() => {
          const orbColors = getAmbientOrbColors(industryVariant);
          return (
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
              <div
                className="absolute w-[500px] h-[500px] rounded-full blur-[120px] animate-float-orb-slow will-change-transform"
                style={{ background: orbColors.primary, top: '10%', right: '-5%' }}
              />
              <div
                className="absolute w-[400px] h-[400px] rounded-full blur-[120px] animate-float-orb-reverse will-change-transform"
                style={{ background: orbColors.secondary, bottom: '15%', left: '-8%' }}
              />
              <div
                className="absolute w-[350px] h-[350px] rounded-full blur-[120px] animate-float-orb-drift will-change-transform"
                style={{ background: orbColors.tertiary, top: '45%', left: '30%' }}
              />
            </div>
          );
        })()}

        {/* Render all visible sections with tier wrappers */}
        <div className="relative z-10">
          {sortedSections.map((section, index) => {
            const tier = getSectionTier(section.type, index);
            const spacing = getSectionSpacing(section.type);
            const divider = getSectionDivider(section.type, index);

            return colorMode === 'dark' ? (
              <div
                key={`tier-${index}`}
                className={cn(
                  `section-tier-${tier}`,
                  `section-spacing-${spacing}`,
                  divider,
                  'relative'
                )}
              >
                <div className="relative z-10">
                  {renderSection(section, index)}
                </div>
              </div>
            ) : (
              renderSection(section, index)
            );
          })}
        </div>
        
        {/* Footer with brand info */}
        <div className="relative z-10">
          <PageFooter 
            companyName={brandSettings?.companyName}
            logoUrl={brandSettings?.logoUrl}
          />
        </div>
        
        {/* "Built with PageConsult" badge */}
        {showPoweredBy && (
          <a 
            href="https://pageconsult.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-full text-xs text-slate-400 hover:text-white hover:border-purple-500/50 transition-all duration-200 shadow-lg"
          >
            <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.5 2c-5.621 0-10.211 4.443-10.475 10h-3.025l5 6.625 5-6.625h-2.975c.257-3.351 3.06-6 6.475-6 3.584 0 6.5 2.916 6.5 6.5s-2.916 6.5-6.5 6.5c-1.863 0-3.542-.793-4.728-2.053l-2.427 3.216c1.877 1.754 4.389 2.837 7.155 2.837 5.79 0 10.5-4.71 10.5-10.5s-4.71-10.5-10.5-10.5z"/>
            </svg>
            <span>Built with PageConsult</span>
          </a>
        )}
      </div>
    </>
  );
}
