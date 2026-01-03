import { useMemo } from 'react';
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
}

export function PublicPageRenderer({ 
  sections, 
  styles,
  metaTitle,
  metaDescription 
}: PublicPageRendererProps) {
  
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
      </Helmet>

      {/* Apply custom styles if provided */}
      {styles?.cssVariables && (
        <style dangerouslySetInnerHTML={{ __html: styles.cssVariables }} />
      )}

      <div className="min-h-screen bg-background">
        {/* Render all visible sections */}
        {sortedSections.map((section, index) => renderSection(section, index))}
        
        {/* Footer */}
        <PageFooter />
      </div>
    </>
  );
}
