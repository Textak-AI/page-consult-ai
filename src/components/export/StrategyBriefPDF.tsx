import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

// Register hyphenation callback to prevent word breaks
Font.registerHyphenationCallback((word) => [word]);

// Design tokens from spec
const colors = {
  primary: '#7C3AED',
  secondary: '#4F46E5',
  accentBg: '#F5F3FF',
  textDark: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  divider: '#E2E8F0',
  cardBorder: '#CBD5E1',
  white: '#FFFFFF',
  questionBg: '#F8FAFC',
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Styles
const styles = StyleSheet.create({
  page: {
    paddingTop: 54,
    paddingBottom: 72,
    paddingHorizontal: 54,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.6,
    color: colors.textDark,
    backgroundColor: colors.white,
  },
  // Cover page styles
  coverPage: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 54,
    fontFamily: 'Helvetica',
    position: 'relative',
    height: '100%',
  },
  clientLogo: {
    maxHeight: 48,
    maxWidth: 180,
    objectFit: 'contain',
  },
  clientLogoFallback: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: colors.textDark,
  },
  coverTitleBlock: {
    marginTop: 'auto',
    marginBottom: 'auto',
    alignItems: 'center',
    paddingVertical: 100,
  },
  coverRule: {
    height: 1,
    backgroundColor: colors.divider,
    width: '80%',
    marginBottom: 32,
  },
  coverTitle: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 32,
  },
  coverRuleBottom: {
    height: 1,
    backgroundColor: colors.divider,
    width: '80%',
    marginTop: 32,
    marginBottom: 48,
  },
  preparedFor: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  companyName: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: 16,
  },
  coverDate: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  coverFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 'auto',
  },
  confidential: {
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pageConsultBadge: {
    maxWidth: 80,
    opacity: 0.9,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 36,
    left: 54,
    right: 54,
  },
  footerDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginBottom: 12,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 9,
    color: colors.textSecondary,
  },
  // Section headers
  sectionHeader: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  sectionUnderline: {
    height: 2,
    width: 48,
    backgroundColor: colors.primary,
    marginBottom: 24,
  },
  subsectionHeader: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: colors.textDark,
    marginBottom: 12,
    marginTop: 24,
  },
  bodyText: {
    fontSize: 11,
    lineHeight: 1.6,
    color: colors.textDark,
    marginBottom: 12,
  },
  // Highlight card (quotes, headlines)
  highlightCard: {
    backgroundColor: colors.accentBg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
  },
  highlightText: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: colors.textDark,
    fontStyle: 'italic',
  },
  // Standard card
  standardCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
  },
  // Stats box
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.accentBg,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // Bullet list
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: {
    color: colors.primary,
    marginRight: 8,
    fontSize: 11,
  },
  bulletText: {
    flex: 1,
    fontSize: 11,
    color: colors.textDark,
  },
  // Q&A Card
  qaCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  qaQuestion: {
    backgroundColor: colors.questionBg,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  qaQuestionText: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: colors.textDark,
  },
  qaAnswer: {
    padding: 16,
  },
  qaAnswerText: {
    fontSize: 11,
    color: colors.textDark,
    lineHeight: 1.6,
  },
  // Headline card with label
  headlineCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 8,
    padding: 20,
    marginBottom: 12,
  },
  headlineCardRecommended: {
    backgroundColor: colors.accentBg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    borderRadius: 8,
    padding: 20,
    marginBottom: 12,
  },
  headlineLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headlineLetter: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: colors.textSecondary,
  },
  headlineType: {
    fontSize: 9,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  recommendedBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  recommendedText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headlineText: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: colors.textDark,
  },
  // Pillar card
  pillarCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
  },
  pillarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pillarNumber: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
    marginRight: 16,
  },
  pillarTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: colors.textDark,
  },
  pillarUnderline: {
    height: 2,
    width: 40,
    backgroundColor: colors.primary,
    marginBottom: 12,
    marginLeft: 40,
  },
  pillarDescription: {
    fontSize: 11,
    color: colors.textDark,
    lineHeight: 1.6,
    marginLeft: 40,
  },
  // Two column layout
  twoColumn: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  columnHalf: {
    flex: 1,
    backgroundColor: colors.accentBg,
    borderRadius: 8,
    padding: 16,
  },
  columnLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  columnValue: {
    fontSize: 11,
    color: colors.textDark,
  },
  // Page structure diagram
  structureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  structureNumber: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
    width: 24,
  },
  structureLine: {
    height: 1,
    backgroundColor: colors.divider,
    flex: 1,
    marginHorizontal: 12,
  },
  structureLabel: {
    fontSize: 11,
    color: colors.textDark,
    width: 180,
  },
  // Checkbox items
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: colors.textSecondary,
    borderRadius: 2,
    marginRight: 12,
  },
  checkboxText: {
    fontSize: 11,
    color: colors.textDark,
  },
  // Testimonial
  testimonialCard: {
    backgroundColor: colors.accentBg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    borderRadius: 8,
    padding: 20,
    marginTop: 16,
  },
  testimonialText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.textDark,
    marginBottom: 12,
  },
  testimonialAuthor: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  // Final page branding
  finalBranding: {
    textAlign: 'center',
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  brandingText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
  },
});

export interface StrategyBriefData {
  businessName: string;
  industry?: string;
  industrySubcategory?: string;
  idealClient?: string;
  clientFrustration?: string;
  desiredOutcome?: string;
  companySize?: string;
  buyerContext?: string;
  problemStatement?: string;
  solutionStatement?: string;
  headlines?: {
    optionA?: string;
    optionB?: string;
    optionC?: string;
  };
  subheadline?: string;
  messagingPillars?: Array<{
    title: string;
    description: string;
  }>;
  proofPoints?: {
    clientCount?: string;
    yearsInBusiness?: string;
    achievements?: string;
  };
  objections?: Array<{
    question: string;
    answer: string;
  }>;
  testimonialText?: string;
  testimonialAuthor?: string;
  pageStructure?: string[];
}

interface StrategyBriefPDFProps {
  brief: StrategyBriefData;
  clientLogoUrl?: string;
  isAgencyTier?: boolean;
}

// Page structure labels
const structureLabels: Record<string, string> = {
  'hero': 'Hero + Primary CTA',
  'stats-bar': 'Authority Bar (Stats)',
  'problem-solution': 'Problem / Solution',
  'features': 'Key Features (Pillars)',
  'how-it-works': 'How It Works',
  'testimonials': 'Social Proof',
  'social-proof': 'Social Proof',
  'faq': 'FAQ (Objections)',
  'final-cta': 'Final CTA',
};

// Footer component
const Footer = ({ pageNumber, companyName }: { pageNumber: number; companyName: string }) => (
  <View style={styles.footer} fixed>
    <View style={styles.footerDivider} />
    <View style={styles.footerContent}>
      <Text style={styles.footerText}>{companyName} | Strategic Positioning Brief</Text>
      <Text style={styles.footerText}>Page {pageNumber}</Text>
    </View>
  </View>
);

// Cover Page
const CoverPage = ({ 
  brief, 
  clientLogoUrl, 
  isAgencyTier 
}: { 
  brief: StrategyBriefData; 
  clientLogoUrl?: string; 
  isAgencyTier?: boolean;
}) => {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <Page size="LETTER" style={styles.coverPage}>
      {/* Client Logo */}
      <View>
        {clientLogoUrl ? (
          <Image src={clientLogoUrl} style={styles.clientLogo} />
        ) : (
          <Text style={styles.clientLogoFallback}>{brief.businessName}</Text>
        )}
      </View>

      {/* Title Block */}
      <View style={styles.coverTitleBlock}>
        <View style={styles.coverRule} />
        <Text style={styles.coverTitle}>STRATEGIC POSITIONING BRIEF</Text>
        <View style={styles.coverRuleBottom} />
        <Text style={styles.preparedFor}>Prepared for</Text>
        <Text style={styles.companyName}>{brief.businessName}</Text>
        <Text style={styles.coverDate}>{formattedDate}</Text>
      </View>

      {/* Footer */}
      <View style={styles.coverFooter}>
        <Text style={styles.confidential}>CONFIDENTIAL</Text>
        {!isAgencyTier && (
          <Image 
            src="/images/pageconsult-logo-light.png" 
            style={styles.pageConsultBadge} 
          />
        )}
      </View>
    </Page>
  );
};

// Executive Summary Page
const ExecutiveSummaryPage = ({ brief }: { brief: StrategyBriefData }) => {
  const opportunitySummary = brief.problemStatement && brief.solutionStatement
    ? `${brief.problemStatement} ${brief.solutionStatement}`
    : brief.solutionStatement || 'Strategic opportunity analysis pending.';

  const differentiators = brief.messagingPillars?.slice(0, 3).map(p => p.title) || [];

  return (
    <Page size="LETTER" style={styles.page}>
      <Text style={styles.sectionHeader}>EXECUTIVE SUMMARY</Text>
      <View style={styles.sectionUnderline} />

      <Text style={styles.subsectionHeader}>THE OPPORTUNITY</Text>
      <Text style={styles.bodyText}>{opportunitySummary}</Text>

      {brief.headlines?.optionA && (
        <>
          <Text style={styles.subsectionHeader}>RECOMMENDED POSITIONING</Text>
          <View style={styles.highlightCard}>
            <Text style={styles.highlightText}>"{brief.headlines.optionA}"</Text>
          </View>
          {brief.subheadline && (
            <Text style={styles.bodyText}>{brief.subheadline}</Text>
          )}
        </>
      )}

      {differentiators.length > 0 && (
        <>
          <Text style={styles.subsectionHeader}>KEY DIFFERENTIATORS</Text>
          {differentiators.map((diff, i) => (
            <View key={i} style={styles.bulletItem}>
              <Text style={styles.bullet}>●</Text>
              <Text style={styles.bulletText}>{diff}</Text>
            </View>
          ))}
        </>
      )}

      <Footer pageNumber={2} companyName={brief.businessName} />
    </Page>
  );
};

// Target Audience Page
const TargetAudiencePage = ({ brief }: { brief: StrategyBriefData }) => {
  if (!brief.idealClient && !brief.clientFrustration && !brief.desiredOutcome) {
    return null;
  }

  return (
    <Page size="LETTER" style={styles.page}>
      <Text style={styles.sectionHeader}>TARGET AUDIENCE</Text>
      <View style={styles.sectionUnderline} />

      {brief.idealClient && (
        <>
          <Text style={styles.subsectionHeader}>IDEAL CLIENT PROFILE</Text>
          <Text style={styles.bodyText}>{brief.idealClient}</Text>
        </>
      )}

      {(brief.industry || brief.companySize) && (
        <View style={styles.twoColumn}>
          {brief.industry && (
            <View style={styles.columnHalf}>
              <Text style={styles.columnLabel}>INDUSTRY</Text>
              <Text style={styles.columnValue}>{brief.industry}</Text>
              {brief.industrySubcategory && (
                <Text style={styles.columnValue}>{brief.industrySubcategory}</Text>
              )}
            </View>
          )}
          {(brief.companySize || brief.buyerContext) && (
            <View style={styles.columnHalf}>
              <Text style={styles.columnLabel}>COMPANY CONTEXT</Text>
              {brief.companySize && <Text style={styles.columnValue}>{brief.companySize}</Text>}
              {brief.buyerContext && <Text style={styles.columnValue}>{brief.buyerContext}</Text>}
            </View>
          )}
        </View>
      )}

      {brief.clientFrustration && (
        <>
          <Text style={styles.subsectionHeader}>PRIMARY PAIN POINTS</Text>
          <View style={styles.highlightCard}>
            <Text style={styles.highlightText}>"{brief.clientFrustration}"</Text>
          </View>
        </>
      )}

      {brief.desiredOutcome && (
        <>
          <Text style={styles.subsectionHeader}>DESIRED OUTCOME</Text>
          <Text style={styles.bodyText}>{brief.desiredOutcome}</Text>
        </>
      )}

      <Footer pageNumber={3} companyName={brief.businessName} />
    </Page>
  );
};

// Messaging Architecture Page
const MessagingArchitecturePage = ({ brief }: { brief: StrategyBriefData }) => {
  if (!brief.headlines?.optionA && !brief.headlines?.optionB && !brief.headlines?.optionC) {
    return null;
  }

  return (
    <Page size="LETTER" style={styles.page}>
      <Text style={styles.sectionHeader}>MESSAGING ARCHITECTURE</Text>
      <View style={styles.sectionUnderline} />

      <Text style={styles.subsectionHeader}>HEADLINE OPTIONS</Text>
      <Text style={styles.bodyText}>
        We recommend testing these headline approaches:
      </Text>

      {brief.headlines?.optionA && (
        <View style={styles.headlineCardRecommended}>
          <View style={styles.headlineLabel}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.headlineLetter}>A</Text>
              <Text style={[styles.headlineType, { marginLeft: 12 }]}>BENEFIT-FOCUSED</Text>
            </View>
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedText}>RECOMMENDED</Text>
            </View>
          </View>
          <Text style={styles.headlineText}>"{brief.headlines.optionA}"</Text>
        </View>
      )}

      {brief.headlines?.optionB && (
        <View style={styles.headlineCard}>
          <View style={styles.headlineLabel}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.headlineLetter}>B</Text>
              <Text style={[styles.headlineType, { marginLeft: 12 }]}>PROBLEM-FOCUSED</Text>
            </View>
          </View>
          <Text style={styles.headlineText}>"{brief.headlines.optionB}"</Text>
        </View>
      )}

      {brief.headlines?.optionC && (
        <View style={styles.headlineCard}>
          <View style={styles.headlineLabel}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.headlineLetter}>C</Text>
              <Text style={[styles.headlineType, { marginLeft: 12 }]}>OUTCOME-FOCUSED</Text>
            </View>
          </View>
          <Text style={styles.headlineText}>"{brief.headlines.optionC}"</Text>
        </View>
      )}

      {brief.subheadline && (
        <>
          <Text style={styles.subsectionHeader}>SUPPORTING SUBHEADLINE</Text>
          <Text style={styles.bodyText}>{brief.subheadline}</Text>
        </>
      )}

      <Footer pageNumber={4} companyName={brief.businessName} />
    </Page>
  );
};

// Messaging Pillars Page
const MessagingPillarsPage = ({ brief }: { brief: StrategyBriefData }) => {
  if (!brief.messagingPillars || brief.messagingPillars.length === 0) {
    return null;
  }

  return (
    <Page size="LETTER" style={styles.page}>
      <Text style={styles.sectionHeader}>MESSAGING PILLARS</Text>
      <View style={styles.sectionUnderline} />

      <Text style={styles.bodyText}>
        These pillars form the foundation of all marketing communications. 
        Each should be consistently reinforced across landing pages, sales materials, and content.
      </Text>

      {brief.messagingPillars.map((pillar, index) => (
        <View key={index} style={styles.pillarCard} wrap={false}>
          <View style={styles.pillarHeader}>
            <Text style={styles.pillarNumber}>{String(index + 1).padStart(2, '0')}</Text>
            <Text style={styles.pillarTitle}>{pillar.title}</Text>
          </View>
          <View style={styles.pillarUnderline} />
          <Text style={styles.pillarDescription}>{pillar.description}</Text>
        </View>
      ))}

      <Footer pageNumber={5} companyName={brief.businessName} />
    </Page>
  );
};

// Proof Points Page
const ProofPointsPage = ({ brief }: { brief: StrategyBriefData }) => {
  const hasProofPoints = brief.proofPoints?.clientCount || 
    brief.proofPoints?.yearsInBusiness || 
    brief.proofPoints?.achievements;
  const hasTestimonial = brief.testimonialText;

  if (!hasProofPoints && !hasTestimonial) {
    return null;
  }

  const achievements = brief.proofPoints?.achievements?.split('.').filter(a => a.trim()) || [];

  return (
    <Page size="LETTER" style={styles.page}>
      <Text style={styles.sectionHeader}>PROOF POINTS & CREDIBILITY</Text>
      <View style={styles.sectionUnderline} />

      <Text style={styles.bodyText}>
        These evidence points should be prominently featured to build trust and overcome skepticism.
      </Text>

      {(brief.proofPoints?.clientCount || brief.proofPoints?.yearsInBusiness) && (
        <>
          <Text style={styles.subsectionHeader}>AUTHORITY SIGNALS</Text>
          <View style={styles.statsRow}>
            {brief.proofPoints?.clientCount && (
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{brief.proofPoints.clientCount.split(' ')[0]}</Text>
                <Text style={styles.statLabel}>{brief.proofPoints.clientCount.split(' ').slice(1).join(' ') || 'Clients'}</Text>
              </View>
            )}
            {brief.proofPoints?.yearsInBusiness && (
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{brief.proofPoints.yearsInBusiness.split(' ')[0]}</Text>
                <Text style={styles.statLabel}>{brief.proofPoints.yearsInBusiness.split(' ').slice(1).join(' ') || 'Years'}</Text>
              </View>
            )}
          </View>
        </>
      )}

      {achievements.length > 0 && (
        <>
          <Text style={styles.subsectionHeader}>KEY ACHIEVEMENTS</Text>
          {achievements.map((achievement, i) => (
            <View key={i} style={styles.bulletItem}>
              <Text style={styles.bullet}>●</Text>
              <Text style={styles.bulletText}>{achievement.trim()}</Text>
            </View>
          ))}
        </>
      )}

      {brief.testimonialText && (
        <>
          <Text style={styles.subsectionHeader}>FEATURED TESTIMONIAL</Text>
          <View style={styles.testimonialCard}>
            <Text style={styles.testimonialText}>"{brief.testimonialText}"</Text>
            {brief.testimonialAuthor && (
              <Text style={styles.testimonialAuthor}>— {brief.testimonialAuthor}</Text>
            )}
          </View>
        </>
      )}

      <Footer pageNumber={6} companyName={brief.businessName} />
    </Page>
  );
};

// Objection Handling Page
const ObjectionHandlingPage = ({ brief }: { brief: StrategyBriefData }) => {
  if (!brief.objections || brief.objections.length === 0) {
    return null;
  }

  return (
    <Page size="LETTER" style={styles.page}>
      <Text style={styles.sectionHeader}>OBJECTION HANDLING</Text>
      <View style={styles.sectionUnderline} />

      <Text style={styles.bodyText}>
        Anticipate and address these common concerns in all communications.
      </Text>

      {brief.objections.map((objection, index) => (
        <View key={index} style={styles.qaCard} wrap={false}>
          <View style={styles.qaQuestion}>
            <Text style={styles.qaQuestionText}>Q: {objection.question}</Text>
          </View>
          <View style={styles.qaAnswer}>
            <Text style={styles.qaAnswerText}>{objection.answer}</Text>
          </View>
        </View>
      ))}

      <Footer pageNumber={7} companyName={brief.businessName} />
    </Page>
  );
};

// Page Structure & Next Steps
const PageStructurePage = ({ brief, isAgencyTier }: { brief: StrategyBriefData; isAgencyTier?: boolean }) => {
  const structure = brief.pageStructure || [
    'hero', 'stats-bar', 'problem-solution', 'features', 
    'how-it-works', 'social-proof', 'faq', 'final-cta'
  ];

  const nextSteps = [
    'Review and approve this strategic brief',
    'Generate landing page from this brief',
    'Create personalized prospect pages as needed',
    'Set up form submission notifications',
    'Launch and monitor engagement',
  ];

  return (
    <Page size="LETTER" style={styles.page}>
      <Text style={styles.sectionHeader}>RECOMMENDED PAGE STRUCTURE</Text>
      <View style={styles.sectionUnderline} />

      <Text style={styles.bodyText}>
        Based on this strategic brief, we recommend the following landing page structure:
      </Text>

      <View style={{ marginTop: 24, marginBottom: 32 }}>
        {structure.map((section, index) => (
          <View key={index} style={styles.structureItem}>
            <Text style={styles.structureNumber}>{index + 1}</Text>
            <View style={styles.structureLine} />
            <Text style={styles.structureLabel}>
              {structureLabels[section] || section}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.subsectionHeader}>NEXT STEPS</Text>
      {nextSteps.map((step, index) => (
        <View key={index} style={styles.checkboxItem}>
          <View style={styles.checkbox} />
          <Text style={styles.checkboxText}>{step}</Text>
        </View>
      ))}

      {!isAgencyTier && (
        <View style={styles.finalBranding}>
          <Text style={styles.brandingText}>Generated by PageConsult AI</Text>
          <Text style={styles.brandingText}>www.pageconsult.ai</Text>
        </View>
      )}

      <Footer pageNumber={8} companyName={brief.businessName} />
    </Page>
  );
};

// Main PDF Document
const StrategyBriefPDF = ({ brief, clientLogoUrl, isAgencyTier = false }: StrategyBriefPDFProps) => {
  return (
    <Document
      title={`${brief.businessName} - Strategic Positioning Brief`}
      author="PageConsult AI"
      subject="Strategic Positioning Brief"
      keywords="strategy, positioning, marketing, landing page"
    >
      <CoverPage brief={brief} clientLogoUrl={clientLogoUrl} isAgencyTier={isAgencyTier} />
      <ExecutiveSummaryPage brief={brief} />
      <TargetAudiencePage brief={brief} />
      <MessagingArchitecturePage brief={brief} />
      <MessagingPillarsPage brief={brief} />
      <ProofPointsPage brief={brief} />
      <ObjectionHandlingPage brief={brief} />
      <PageStructurePage brief={brief} isAgencyTier={isAgencyTier} />
    </Document>
  );
};

export default StrategyBriefPDF;
