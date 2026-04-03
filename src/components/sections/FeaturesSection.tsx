import { memo } from "react";
import { 
  Zap, Target, Shield, TrendingUp, Users, Award, Grid, List, Headset, 
  DollarSign, Tag, Clock, CheckCircle, Heart, Star, Lightbulb, Rocket, 
  BarChart3, Lock, Globe, Layers, Settings, MessageSquare, Briefcase,
  Calendar, FileText, Mail, Phone, Search, ShoppingCart, Truck, Wrench,
  Sparkles,
  type LucideIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { PremiumCard, GradientIcon } from "@/components/ui/PremiumCard";
import { getIndustryTokens, type IndustryVariant } from "@/config/designSystem/industryVariants";
import { getSectionHeader } from "@/lib/industrySectionHeaders";
import { getArchetypeCardClass, type DesignProfile } from "@/lib/archetypeProfiles";
import FeaturesBentoGrid from './features/FeaturesBentoGrid';
import FeaturesStoryBlocks from './features/FeaturesStoryBlocks';
import { SectionWrapper } from './shared/SectionWrapper';
import { SectionHeader } from './shared/SectionHeader';
import { CardGrid } from './shared/CardGrid';
import { cleanDisplayText } from '@/lib/contentCleaner';

interface FeaturesSectionProps {
  content: {
    title?: string;
    subtitle?: string;
    eyebrow?: string;
    features: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
    industryVariant?: IndustryVariant;
    industry?: string;
    businessName?: string;
    mode?: 'light' | 'dark' | 'warm' | 'cold';
    primaryColor?: string;
  };
  onUpdate?: (content: any) => void;
  isEditing?: boolean;
  iconStyle?: "outline" | "solid" | "duotone";
}

// Comprehensive icon map
const iconMap: Record<string, LucideIcon> = {
  Zap, Target, Shield, TrendingUp, Users, Award, Grid, List, Headset,
  DollarSign, Tag, Clock, CheckCircle, Heart, Star, Lightbulb, Rocket,
  BarChart3, Lock, Globe, Layers, Settings, MessageSquare, Briefcase,
  Calendar, FileText, Mail, Phone, Search, ShoppingCart, Truck, Wrench,
  Sparkles,
  zap: Zap, target: Target, shield: Shield, trendingup: TrendingUp,
  users: Users, award: Award, grid: Grid, list: List, headset: Headset,
  dollarsign: DollarSign, tag: Tag, clock: Clock, checkcircle: CheckCircle,
  heart: Heart, star: Star, lightbulb: Lightbulb, rocket: Rocket,
  barchart3: BarChart3, lock: Lock, globe: Globe, layers: Layers,
  settings: Settings, messagesquare: MessageSquare, briefcase: Briefcase,
  calendar: Calendar, filetext: FileText, mail: Mail, phone: Phone,
  search: Search, shoppingcart: ShoppingCart, truck: Truck, wrench: Wrench,
  sparkles: Sparkles,
};

const getIconComponent = (iconName: string): LucideIcon => {
  if (iconMap[iconName]) return iconMap[iconName];
  const lowerName = iconName.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (iconMap[lowerName]) return iconMap[lowerName];
  return CheckCircle;
};

function FeaturesSectionBase({ content, onUpdate, isEditing, iconStyle = "outline" }: FeaturesSectionProps) {
  // Art Director composition check
  const featureLayout = (content as any)?.featureLayout;
  if (featureLayout === 'bento-grid') {
    return <FeaturesBentoGrid content={content as any} onUpdate={onUpdate || (() => {})} isEditing={isEditing} />;
  }
  if (featureLayout === 'icon-cards') {
    return <FeaturesStoryBlocks content={content as any} onUpdate={onUpdate || (() => {})} isEditing={isEditing} />;
  }

  const { 
    features,
    industryVariant = 'default',
    industry,
    businessName,
  } = content;
  const archetype: DesignProfile = (content as any).archetype || 'precision';

  // Get industry-specific headers from centralized system
  const sectionHeader = getSectionHeader(industryVariant, 'features');
  const title = content.title || sectionHeader.title;
  
  // Clean subtitle
  const rawSubtitle = content.subtitle || sectionHeader.subtitle;
  const industryLower = (industry || '').toLowerCase().replace(/[_-]/g, ' ');
  const PLACEHOLDER_NAMES = ['your company', 'company', ''];
  const isPlaceholder = !businessName || PLACEHOLDER_NAMES.includes(businessName.toLowerCase().trim());
  const subtitle = cleanDisplayText(
    (industryLower.length > 3 && rawSubtitle?.toLowerCase().includes(industryLower))
      ? (isPlaceholder ? 'What makes the difference' : `What sets ${businessName} apart`)
      : (rawSubtitle || ''),
    120
  );
  const eyebrow = content.eyebrow || sectionHeader.title.toUpperCase();

  if (!features || features.length === 0) return null;
  
  // Get industry-specific tokens
  const tokens = getIndustryTokens(industryVariant);
  const isConsulting = industryVariant === 'consulting';
  const isHealthcare = industryVariant === 'healthcare';
  const isSaas = industryVariant === 'saas';
  const isLocalServices = industryVariant === 'local-services';
  
  // PRIORITY: Consulting ALWAYS light mode, then SDI mode prop > industry token mode
  const isLightMode = isConsulting 
    ? true 
    : (content.mode 
      ? (content.mode === 'light' || content.mode === 'warm')
      : tokens.mode === 'light');

  // Brand color priority
  const brandPrimaryColor = content.primaryColor;
  const hasBrandColor = brandPrimaryColor && brandPrimaryColor !== '#' && brandPrimaryColor.length > 3;
  const accentColor = brandPrimaryColor || '#14b8a6';

  const handleBlur = (field: string, e: React.FocusEvent<HTMLElement>) => {
    if (!onUpdate) return;
    onUpdate({
      ...content,
      [field]: e.currentTarget.textContent || content[field as keyof typeof content],
    });
  };

  const handleFeatureBlur = (index: number, field: string, e: React.FocusEvent<HTMLElement>) => {
    if (!onUpdate) return;
    const updatedFeatures = [...features];
    updatedFeatures[index] = {
      ...updatedFeatures[index],
      [field]: e.currentTarget.textContent || updatedFeatures[index][field as keyof typeof updatedFeatures[0]],
    };
    onUpdate({ ...content, features: updatedFeatures });
  };

  // Determine background and section style based on variant
  const getSectionBackground = (): 'light' | 'dark' | 'darker' | 'transparent' => {
    if (isLocalServices || isHealthcare || isConsulting) return 'light';
    if (isSaas) return 'darker';
    return isLightMode ? 'light' : 'transparent';
  };

  const getSectionStyle = (): React.CSSProperties => {
    if (isSaas) return { backgroundColor: '#0F172A' };
    if (!isLightMode && !isLocalServices && !isHealthcare && !isConsulting) {
      return { backgroundColor: 'hsl(217, 33%, 6%)' };
    }
    return {};
  };

  // Determine icon styles based on variant
  const getIconStyles = (index: number): { bgStyle?: React.CSSProperties; bgClass: string; colorStyle?: React.CSSProperties; colorClass: string } => {
    if (isLocalServices) {
      return {
        bgStyle: hasBrandColor ? { backgroundColor: brandPrimaryColor } : undefined,
        bgClass: hasBrandColor ? 'w-12 h-12 rounded-lg flex items-center justify-center mb-4' : 'w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-blue-600',
        colorClass: 'w-6 h-6 text-white',
      };
    }
    if (isSaas) {
      return {
        bgClass: 'w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-6',
        colorClass: 'w-7 h-7 text-purple-400',
      };
    }
    if (isHealthcare || isConsulting) {
      const iconBg = hasBrandColor ? '' : (isHealthcare ? 'bg-teal-50' : 'bg-blue-50');
      const iconColor = hasBrandColor ? '' : (isHealthcare ? 'text-teal-600' : 'text-blue-600');
      return {
        bgStyle: hasBrandColor ? { backgroundColor: `${brandPrimaryColor}15` } : undefined,
        bgClass: `w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${iconBg}`,
        colorStyle: hasBrandColor ? { color: brandPrimaryColor } : undefined,
        colorClass: `w-7 h-7 ${iconColor}`,
      };
    }
    // Default
    return {
      bgStyle: { backgroundColor: `${accentColor}15`, color: accentColor },
      bgClass: 'w-14 h-14 rounded-xl flex items-center justify-center mb-6',
      colorClass: 'w-7 h-7',
    };
  };

  // Render a feature card based on variant
  const renderFeatureCard = (feature: typeof features[0], index: number) => {
    const Icon = getIconComponent(feature.icon);
    const iconStyles = getIconStyles(index);
    const editTitleClass = isEditing ? 'outline-dashed outline-2 outline-blue-500/30 rounded px-1' : '';
    const editDescClass = isEditing ? 'outline-dashed outline-2 outline-blue-500/30 rounded px-1' : '';

    // Default dark mode with PremiumCard
    if (!isLightMode && !isLocalServices && !isSaas && !isHealthcare && !isConsulting) {
      return (
        <PremiumCard variant="glass" glow glowColor="cyan" className="h-full group">
          <GradientIcon className="mb-6">
            <Icon className="w-7 h-7 text-white" strokeWidth={1.5} />
          </GradientIcon>
          <h3 
            className={`text-xl md:text-2xl font-semibold mb-4 text-white group-hover:text-cyan-400 transition-colors ${editTitleClass}`}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => handleFeatureBlur(index, "title", e)}
          >
            {feature.title}
          </h3>
          <p 
            className={`text-base md:text-lg text-slate-400 leading-relaxed ${editDescClass}`}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => handleFeatureBlur(index, "description", e)}
          >
            {feature.description}
          </p>
        </PremiumCard>
      );
    }

    // Light mode default card
    if (isLightMode && !isLocalServices && !isSaas && !isHealthcare && !isConsulting) {
      return (
        <div 
          className={`h-full ${getArchetypeCardClass(archetype, true)} hover:shadow-lg transition-shadow`}
          style={{ borderRadius: 'var(--archetype-card-radius, 0.5rem)', boxShadow: 'var(--archetype-card-shadow, none)' }}
        >
          <div className={iconStyles.bgClass} style={iconStyles.bgStyle}>
            <Icon className={iconStyles.colorClass} style={iconStyles.colorStyle} strokeWidth={1.5} />
          </div>
          <h3 
            className={`text-xl font-bold text-gray-900 mb-3 ${editTitleClass}`}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => handleFeatureBlur(index, "title", e)}
          >
            {feature.title}
          </h3>
          <p 
            className={`text-gray-600 leading-relaxed ${editDescClass}`}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => handleFeatureBlur(index, "description", e)}
          >
            {feature.description}
          </p>
        </div>
      );
    }

    // Variant-specific card styles
    const cardClass = isLocalServices
      ? 'h-full p-6 bg-slate-50 border border-slate-200 hover:shadow-lg hover:border-blue-200 transition-all'
      : isSaas
        ? 'h-full p-8 bg-slate-800 border border-slate-700 hover:border-purple-500/50 transition-colors premium-gen-card'
        : 'h-full p-8 bg-white shadow-sm border border-slate-100 hover:shadow-md transition-shadow';

    const titleClass = isLocalServices
      ? 'text-lg font-bold text-slate-900 mb-2'
      : isSaas
        ? 'text-xl font-bold text-white mb-3'
        : 'text-xl font-bold text-slate-900 mb-3';

    const descClass = isLocalServices
      ? 'text-slate-600 text-sm leading-relaxed'
      : isSaas
        ? 'text-slate-400 leading-relaxed'
        : 'text-slate-600 leading-relaxed';

    return (
      <div 
        className={cardClass}
        style={{ borderRadius: 'var(--archetype-card-radius, 0.75rem)', boxShadow: 'var(--archetype-card-shadow, none)' }}
      >
        <div className={iconStyles.bgClass} style={iconStyles.bgStyle}>
          <Icon className={iconStyles.colorClass} style={iconStyles.colorStyle} strokeWidth={isLocalServices ? 2 : 1.5} />
        </div>
        <h3 
          className={`${titleClass} ${editTitleClass}`}
          style={{ fontWeight: 'var(--archetype-heading-weight, 700)' as any, letterSpacing: 'var(--archetype-heading-tracking, -0.01em)' }}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) => handleFeatureBlur(index, "title", e)}
        >
          {feature.title}
        </h3>
        <p 
          className={`${descClass} ${editDescClass}`}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) => handleFeatureBlur(index, "description", e)}
        >
          {feature.description}
        </p>
      </div>
    );
  };

  // Badge accent color for SectionHeader
  const headerAccentColor = isLightMode 
    ? (hasBrandColor ? brandPrimaryColor : (isSaas ? '#a855f7' : accentColor))
    : (isSaas ? '#a855f7' : undefined);

  return (
    <SectionWrapper
      background={getSectionBackground()}
      paddingY="lg"
      style={getSectionStyle()}
      sectionType="features"
      isEditing={isEditing}
    >
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        lightMode={isLightMode}
        accentColor={isLightMode || isSaas ? headerAccentColor : undefined}
        isEditing={isEditing}
        onTitleBlur={(e) => handleBlur("title", e)}
        onSubtitleBlur={(e) => handleBlur("subtitle", e)}
      />

      <CardGrid columns={features.length <= 2 ? 2 : 3} gap="lg" maxCardWidth="420px">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="h-full"
          >
            {renderFeatureCard(feature, i)}
          </motion.div>
        ))}
      </CardGrid>
    </SectionWrapper>
  );
}

export const FeaturesSection = memo(FeaturesSectionBase);
export default FeaturesSection;
