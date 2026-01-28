import { 
  Zap, Target, Shield, TrendingUp, Users, Award, Grid, List, Headset, 
  DollarSign, Tag, Clock, CheckCircle, Heart, Star, Lightbulb, Rocket, 
  BarChart3, Lock, Globe, Layers, Settings, MessageSquare, Briefcase,
  Calendar, FileText, Mail, Phone, Search, ShoppingCart, Truck, Wrench,
  Sparkles,
  type LucideIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { PremiumCard, GradientIcon, EyebrowBadge } from "@/components/ui/PremiumCard";
import { getIndustryTokens, type IndustryVariant } from "@/config/designSystem/industryVariants";
import { getSectionHeader } from "@/lib/industrySectionHeaders";

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
    businessName?: string;
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
  zap: Zap, target: Target, shield: Shield, trendingup: TrendingUp,
  users: Users, award: Award, grid: Grid, list: List, headset: Headset,
  dollarsign: DollarSign, tag: Tag, clock: Clock, checkcircle: CheckCircle,
  heart: Heart, star: Star, lightbulb: Lightbulb, rocket: Rocket,
  barchart3: BarChart3, lock: Lock, globe: Globe, layers: Layers,
  settings: Settings, messagesquare: MessageSquare, briefcase: Briefcase,
  calendar: Calendar, filetext: FileText, mail: Mail, phone: Phone,
  search: Search, shoppingcart: ShoppingCart, truck: Truck, wrench: Wrench,
};

const getIconComponent = (iconName: string): LucideIcon => {
  if (iconMap[iconName]) return iconMap[iconName];
  const lowerName = iconName.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (iconMap[lowerName]) return iconMap[lowerName];
  return CheckCircle;
};

export function FeaturesSection({ content, onUpdate, isEditing, iconStyle = "outline" }: FeaturesSectionProps) {
  const { 
    features,
    industryVariant = 'default',
    businessName,
  } = content;

  // Get industry-specific headers from centralized system
  const sectionHeader = getSectionHeader(industryVariant, 'features');
  const title = content.title || sectionHeader.title;
  const subtitle = content.subtitle || sectionHeader.subtitle;
  const eyebrow = content.eyebrow || sectionHeader.title.toUpperCase();

  // Debug logging
  console.log('🎨 [FeaturesSection] industryVariant:', industryVariant, 'header:', sectionHeader);

  if (!features || features.length === 0) return null;
  
  // Get industry-specific tokens
  const tokens = getIndustryTokens(industryVariant);
  const isLightMode = tokens.mode === 'light';
  const isConsulting = industryVariant === 'consulting';
  const isHealthcare = industryVariant === 'healthcare';
  const isSaas = industryVariant === 'saas';
  const isLocalServices = industryVariant === 'local-services';

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
    onUpdate({
      ...content,
      features: updatedFeatures,
    });
  };

  // Smart grid that centers incomplete last rows
  const getGridClass = () => {
    const count = features.length;
    if (count <= 2) return "md:grid-cols-2 justify-items-center";
    if (count === 3) return "md:grid-cols-3";
    if (count === 4) return "md:grid-cols-2 lg:grid-cols-4";
    // For 5+ items, use flex-based layout to center incomplete rows
    return "md:grid-cols-2 lg:grid-cols-3";
  };
  
  // Use flex layout for odd counts to center the last row
  const useFlexLayout = features.length % 3 !== 0 && features.length > 3;

  // Local Services variant: Light mode, trust-forward, service-focused
  if (isLocalServices) {
    return (
      <section className={`py-20 bg-white ${isEditing ? 'relative' : ''}`}>
        {isEditing && (
          <div className="absolute inset-0 border-2 border-blue-500/50 rounded-lg pointer-events-none z-10" />
        )}
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full mb-4">
              {eyebrow}
            </span>
            <h2 
              className={`text-3xl md:text-4xl font-bold text-slate-900 mb-4 ${
                isEditing ? "outline-dashed outline-2 outline-blue-500/30 rounded px-2 inline-block" : ""
              }`}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("title", e)}
            >
              {title}
            </h2>
            <p 
              className={`text-lg text-slate-600 max-w-2xl mx-auto ${
                isEditing ? "outline-dashed outline-2 outline-blue-500/30 rounded px-2" : ""
              }`}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("subtitle", e)}
            >
              {subtitle}
            </p>
          </motion.div>

          {/* Flex-based grid for balanced card layout */}
          <div className={useFlexLayout 
            ? "flex flex-wrap justify-center gap-6"
            : `grid gap-6 ${getGridClass()}`
          }>
            {features.map((feature, i) => {
              const Icon = getIconComponent(feature.icon);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className={useFlexLayout ? "w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]" : undefined}
                >
                  <div className="h-full p-6 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-lg hover:border-blue-200 transition-all">
                    <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                    </div>
                    <h3 
                      className={`text-lg font-bold text-slate-900 mb-2 ${
                        isEditing ? "outline-dashed outline-2 outline-blue-500/30 rounded px-1" : ""
                      }`}
                      contentEditable={isEditing}
                      suppressContentEditableWarning
                      onBlur={(e) => handleFeatureBlur(i, "title", e)}
                    >
                      {feature.title}
                    </h3>
                    <p 
                      className={`text-slate-600 text-sm leading-relaxed ${
                        isEditing ? "outline-dashed outline-2 outline-blue-500/30 rounded px-1" : ""
                      }`}
                      contentEditable={isEditing}
                      suppressContentEditableWarning
                      onBlur={(e) => handleFeatureBlur(i, "description", e)}
                    >
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // SaaS variant
  if (isSaas) {
    return (
      <section className={`py-24 bg-slate-800/30 ${isEditing ? 'relative' : ''}`} style={{ backgroundColor: '#0F172A' }}>
        {isEditing && (
          <div className="absolute inset-0 border-2 border-purple-500/50 rounded-lg pointer-events-none z-10" />
        )}
        <div className="max-w-6xl mx-auto px-6">
          {/* Section Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1 bg-purple-500/20 text-purple-400 text-sm font-semibold rounded-full mb-4">
              {eyebrow}
            </span>
            <h2 
              className={`text-3xl md:text-4xl font-bold text-white mb-4 ${
                isEditing ? "cursor-text hover:ring-2 hover:ring-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded px-2 inline-block" : ""
              }`}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("title", e)}
            >
              {title}
            </h2>
            <p 
              className={`text-lg text-slate-400 max-w-2xl mx-auto ${
                isEditing ? "cursor-text hover:ring-2 hover:ring-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded px-2" : ""
              }`}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("subtitle", e)}
            >
              {subtitle}
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className={useFlexLayout 
            ? "flex flex-wrap justify-center gap-8"
            : `grid gap-8 ${getGridClass()}`
          }>
            {features.map((feature, i) => {
              const Icon = getIconComponent(feature.icon);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className={useFlexLayout ? "w-full md:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)]" : undefined}
                >
                  <div className="h-full p-8 bg-slate-800 border border-slate-700 rounded-2xl hover:border-purple-500/50 transition-colors">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-6">
                      <Icon className="w-7 h-7 text-purple-400" strokeWidth={1.5} />
                    </div>
                    <h3 
                      className={`text-xl font-bold text-white mb-3 ${
                        isEditing ? "cursor-text hover:ring-2 hover:ring-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded px-1" : ""
                      }`}
                      contentEditable={isEditing}
                      suppressContentEditableWarning
                      onBlur={(e) => handleFeatureBlur(i, "title", e)}
                    >
                      {feature.title}
                    </h3>
                    <p 
                      className={`text-slate-400 leading-relaxed ${
                        isEditing ? "cursor-text hover:ring-2 hover:ring-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded px-1" : ""
                      }`}
                      contentEditable={isEditing}
                      suppressContentEditableWarning
                      onBlur={(e) => handleFeatureBlur(i, "description", e)}
                    >
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // Healthcare or Consulting: Light mode layout
  if (isHealthcare || isConsulting) {
    const iconBg = isHealthcare ? 'bg-teal-50' : 'bg-blue-50';
    const iconColor = isHealthcare ? 'text-teal-600' : 'text-blue-600';
    const badgeBg = isHealthcare ? 'bg-teal-100 text-teal-800' : 'bg-blue-100 text-blue-800';
    
    return (
      <section className={`py-24 bg-slate-50 ${isEditing ? 'relative' : ''}`}>
        {isEditing && (
          <div className="absolute inset-0 border-2 border-teal-500/50 rounded-lg pointer-events-none z-10" />
        )}
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className={`inline-block px-4 py-1 text-sm font-semibold rounded-full mb-4 ${badgeBg}`}>
              {eyebrow}
            </span>
            <h2 
              className={`text-3xl md:text-4xl font-bold text-slate-900 mb-4 ${
                isEditing ? "outline-dashed outline-2 outline-teal-500/30 rounded px-2 inline-block" : ""
              }`}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("title", e)}
            >
              {title}
            </h2>
            <p 
              className={`text-lg text-slate-600 max-w-2xl mx-auto ${
                isEditing ? "outline-dashed outline-2 outline-teal-500/30 rounded px-2" : ""
              }`}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("subtitle", e)}
            >
              {subtitle}
            </p>
          </motion.div>

          <div className={useFlexLayout 
            ? "flex flex-wrap justify-center gap-8"
            : `grid gap-8 ${getGridClass()}`
          }>
            {features.map((feature, i) => {
              const Icon = getIconComponent(feature.icon);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className={useFlexLayout ? "w-full md:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)]" : undefined}
                >
                  <div className="h-full p-8 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${iconBg}`}>
                      <Icon className={`w-7 h-7 ${iconColor}`} strokeWidth={1.5} />
                    </div>
                    <h3 
                      className={`text-xl font-bold text-slate-900 mb-3 ${
                        isEditing ? "outline-dashed outline-2 outline-teal-500/30 rounded px-1" : ""
                      }`}
                      contentEditable={isEditing}
                      suppressContentEditableWarning
                      onBlur={(e) => handleFeatureBlur(i, "title", e)}
                    >
                      {feature.title}
                    </h3>
                    <p 
                      className={`text-slate-600 leading-relaxed ${
                        isEditing ? "outline-dashed outline-2 outline-teal-500/30 rounded px-1" : ""
                      }`}
                      contentEditable={isEditing}
                      suppressContentEditableWarning
                      onBlur={(e) => handleFeatureBlur(i, "description", e)}
                    >
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // This block removed - consulting is handled by the isHealthcare || isConsulting block above

  // Default dark mode layout
  return (
    <section 
      className={`relative overflow-hidden ${isEditing ? 'relative' : ''}`}
      style={{ 
        backgroundColor: 'hsl(217, 33%, 6%)',
        padding: '96px 24px',
      }}
    >
      {isEditing && (
        <div className="absolute inset-0 border-2 border-cyan-500/50 rounded-lg pointer-events-none z-10" />
      )}
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[150px]"
        style={{ backgroundColor: 'hsla(189, 95%, 43%, 0.05)' }}
      />

      <div className="container mx-auto relative z-10 max-w-6xl">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20 mx-auto max-w-3xl"
        >
          <EyebrowBadge 
            icon={<Sparkles className="w-4 h-4" strokeWidth={1.5} />} 
            text={eyebrow} 
            className="mb-6"
          />
          
          <h2 
            className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-6 tracking-tight text-white ${
              isEditing ? "outline-dashed outline-2 outline-cyan-500/30 rounded px-2 inline-block" : ""
            }`}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => handleBlur("title", e)}
          >
            {title}
          </h2>
          <p 
            className={`text-lg md:text-xl leading-relaxed text-slate-400 ${
              isEditing ? "outline-dashed outline-2 outline-cyan-500/30 rounded px-2" : ""
            }`}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => handleBlur("subtitle", e)}
          >
            {subtitle}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className={useFlexLayout 
          ? "flex flex-wrap justify-center gap-6"
          : `grid gap-6 ${getGridClass()}`
        }>
          {features.map((feature, i) => {
            const Icon = getIconComponent(feature.icon);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={useFlexLayout ? "w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]" : undefined}
              >
                <PremiumCard 
                  variant="glass" 
                  glow 
                  glowColor="cyan"
                  className="h-full group"
                >
                  <GradientIcon className="mb-6">
                    <Icon className="w-7 h-7 text-white" strokeWidth={1.5} />
                  </GradientIcon>
                  
                  <h3 
                    className={`text-xl md:text-2xl font-semibold mb-4 text-white group-hover:text-cyan-400 transition-colors ${
                      isEditing ? "outline-dashed outline-2 outline-cyan-500/30 rounded px-1" : ""
                    }`}
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={(e) => handleFeatureBlur(i, "title", e)}
                  >
                    {feature.title}
                  </h3>
                  
                  <p 
                    className={`text-base md:text-lg text-slate-400 leading-relaxed ${
                      isEditing ? "outline-dashed outline-2 outline-cyan-500/30 rounded px-1" : ""
                    }`}
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={(e) => handleFeatureBlur(i, "description", e)}
                  >
                    {feature.description}
                  </p>
                </PremiumCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
