import { motion } from "framer-motion";
import { formatStatValue, getTypography } from "@/lib/typographyScale";
import { getArchetypeStatClass, type DesignProfile } from "@/lib/archetypeProfiles";

interface Statistic {
  value: string;
  label: string;
  source?: string;
}

interface StatsBarSectionProps {
  statistics: Statistic[];
  industryVariant?: string;
  // SDI mode override - takes precedence over industry detection
  mode?: 'light' | 'dark' | 'warm' | 'cold';
  archetype?: DesignProfile;
  onUpdate?: (content: any) => void;
  isEditing?: boolean;
}

/**
 * Stats Bar Section - PREMIUM DESIGN
 * 
 * Features:
 * - Hero stat (large, prominent) + supporting stats (smaller, hierarchy)
 * - Visual connector to hero section
 * - Staggered hover animations
 * - Industry-specific color accents
 */
export function StatsBarSection({ statistics, industryVariant, mode, archetype = 'precision', onUpdate, isEditing }: StatsBarSectionProps) {
  const typography = getTypography(industryVariant);
  const isConsulting = industryVariant === 'consulting';
  const isHealthcare = industryVariant === 'healthcare';
  const isSaas = industryVariant === 'saas';
  const isLocalServices = industryVariant === 'local-services';
  // PRIORITY: SDI mode prop > industry-based detection
  const isLightMode = mode 
    ? (mode === 'light' || mode === 'warm')
    : (isConsulting || isHealthcare || isLocalServices);
  
  console.log('🎨 [StatsBarSection] Mode:', mode, 'isLightMode:', isLightMode, 'industryVariant:', industryVariant);

  const handleStatBlur = (index: number, field: 'value' | 'label', e: React.FocusEvent<HTMLElement>) => {
    if (!onUpdate) return;
    const updatedStats = [...statistics];
    updatedStats[index] = {
      ...updatedStats[index],
      [field]: e.currentTarget.textContent || updatedStats[index][field],
    };
    onUpdate({ statistics: updatedStats, industryVariant });
  };
  
  // NO FABRICATION: Only render stats that actually exist
  if (!statistics || statistics.length === 0) {
    return null;
  }

  /**
   * Safe parse: handle statistics arriving as a stringified JSON string,
   * an array of objects, or deeply nested/corrupt structures
   */
  const parsedStatistics: Statistic[] = (() => {
    let raw: any = statistics;
    
    // If it's a string, try to parse it
    if (typeof raw === 'string') {
      try {
        raw = JSON.parse(raw);
      } catch {
        console.warn('⚠️ [StatsBarSection] Failed to parse statistics string');
        return [];
      }
    }
    
    if (!Array.isArray(raw)) return [];
    
    return raw.map((item: any) => {
      if (!item || typeof item !== 'object') return null;
      const value = typeof item.value === 'string' ? item.value : String(item.value || '');
      const label = typeof item.label === 'string' ? item.label : String(item.label || '');
      return { value, label, source: item.source };
    }).filter(Boolean) as Statistic[];
  })();

  /**
   * Validate stat for display:
   * - Has non-empty value and label
   * - Value is reasonable length (not a sentence)
   * - Label doesn't contain JSON field name patterns or syntax chars
   * - Label isn't truncated mid-word
   */
  const isValidStat = (stat: Statistic): boolean => {
    if (!stat.value || !stat.label) return false;
    if (stat.value.length > 15) return false;  // Values like "94%" or "$1.5M"
    if (stat.label.length < 3) return false;   // Too short
    
    // Must contain a recognizable numeric value (%, x multiplier, $, or plain number)
    if (!/\d/.test(stat.value) && !/[%x$+]/.test(stat.value)) return false;
    
    // Reject labels containing JSON syntax characters
    if (/[{}[\]":]/.test(stat.label)) return false;
    
    // Reject JSON field name patterns — camelCase anywhere
    if (/[a-z][A-Z]/.test(stat.label) && !/\s/.test(stat.label)) return false;
    if (/^[a-z_]+$/i.test(stat.label) && !/\s/.test(stat.label)) return false; // single identifier
    
    // Reject concatenated lowercase (>8 chars, no spaces) — JSON key leakage
    if (/^[a-z]{9,}$/i.test(stat.label) && !/\s/.test(stat.label)) return false;
    
    // Reject known JSON field name prefixes
    if (/^(valueprop|buyerobject|painpoint|proofelem|percent|dollar|clientcount|yearsinbusiness|authority|uniquevalue|targetmark|industr|compet|differ|credent|guaran)/i.test(stat.label)) return false;
    
    // Clean label: strip embedded camelCase tokens
    const cleanedLabel = stat.label.replace(/\b[a-z]{2,}[A-Z][a-zA-Z]*\b/g, '').trim();
    if (cleanedLabel.length < 3) return false;
    
    // Label must contain at least one space (be human-readable, not a single token)
    // Exception: short known words like "Satisfaction" or "Revenue"
    if (!/\s/.test(stat.label) && stat.label.length > 15) return false;
    
    return true;
  };

  /**
   * Truncate label at word boundary if too long
   */
  const truncateLabel = (label: string, maxLen: number = 60): string => {
    if (label.length <= maxLen) return label;
    const truncated = label.slice(0, maxLen);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > maxLen * 0.5) {
      return truncated.slice(0, lastSpace) + '…';
    }
    return truncated + '…';
  };

  // Clean and deduplicate stats
  const seenNumericValues = new Set<string>();
  const seenLabels = new Set<string>();
  const cleanStats = parsedStatistics
    .map(stat => ({
      ...stat,
      label: truncateLabel(stat.label), // Ensure no truncated labels
    }))
    .filter(stat => {
      if (!isValidStat(stat)) {
        console.log('⚠️ [StatsBarSection] Rejected invalid stat:', stat);
        return false;
      }
      
      // Extract numeric portion for aggressive dedup
      const numericOnly = stat.value.replace(/[^0-9.]/g, '');
      const normalizedValue = stat.value.replace(/[^0-9a-z%$+x]/gi, '').toLowerCase();
      
      if (seenNumericValues.has(normalizedValue)) {
        console.log('🔄 [StatsBarSection] Skipping duplicate value:', stat.value);
        return false;
      }
      // Also dedup by raw numeric (catches "94%" appearing with different labels)
      if (numericOnly && numericOnly.length >= 2 && seenNumericValues.has(numericOnly)) {
        console.log('🔄 [StatsBarSection] Skipping duplicate numeric:', stat.value, stat.label);
        return false;
      }
      seenNumericValues.add(normalizedValue);
      if (numericOnly) seenNumericValues.add(numericOnly);
      
      // Deduplicate by normalized label
      const normalizedLabel = stat.label.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (seenLabels.has(normalizedLabel)) {
        console.log('🔄 [StatsBarSection] Skipping duplicate label:', stat.label);
        return false;
      }
      seenLabels.add(normalizedLabel);
      
      return true;
    }).slice(0, 4); // Max 4 stats

  console.log('📊 [StatsBarSection] Rendering', cleanStats.length, 'valid stats from', parsedStatistics.length, 'input');

  // Graceful fallback: hide if fewer than 2 valid stats
  if (cleanStats.length < 2) {
    return null;
  }

  // Local Services variant - light mode with trust-forward design
  if (isLocalServices) {
    return (
      <section className={`relative py-16 bg-slate-50 border-y border-slate-200 ${isEditing ? 'relative' : ''}`}>
        {isEditing && (
          <div className="absolute inset-0 border-2 border-blue-500/50 rounded-lg pointer-events-none z-10" />
        )}
        
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {cleanStats.slice(0, 4).map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div 
                  className={`text-4xl md:text-5xl font-bold text-blue-600 ${
                    isEditing ? "cursor-text hover:ring-2 hover:ring-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-2 inline-block" : ""
                  }`}
                  style={{ fontSize: 'var(--archetype-stat-size, 2.5rem)', fontWeight: 'var(--archetype-heading-weight, 700)' as any }}
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => handleStatBlur(index, 'value', e)}
                >
                  {formatStatValue(stat.value)}
                </div>
                
                <p 
                  className={`mt-2 text-sm font-medium text-slate-600 ${
                    isEditing ? "cursor-text hover:ring-2 hover:ring-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-1" : ""
                  }`}
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => handleStatBlur(index, 'label', e)}
                >
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // SaaS variant - gradient dark with cyan accents
  if (isSaas) {
    const [heroStat, ...supportingStats] = cleanStats;
    
    return (
      <section className={`relative py-20 bg-gradient-to-b from-slate-900 to-slate-800 ${isEditing ? 'relative' : ''}`}>
        {/* Visual connector from hero */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-purple-500/50 to-transparent" />
        
        {isEditing && (
          <div className="absolute inset-0 border-2 border-purple-500/50 rounded-lg pointer-events-none z-10" />
        )}
        
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Hero stat - dramatic, large */}
            <div className="lg:col-span-5">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative p-8 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700"
                style={{ borderRadius: 'var(--archetype-card-radius, 1rem)' }}
              >
                {/* Accent corner */}
                <div className="absolute top-0 left-0 w-24 h-1 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500" />
                
                <div 
                  className={`text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent ${
                    isEditing ? "cursor-text hover:ring-2 hover:ring-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded px-2 inline-block" : ""
                  }`}
                  style={{ fontWeight: 'var(--archetype-heading-weight, 700)' as any }}
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => handleStatBlur(0, 'value', e)}
                >
                  {formatStatValue(heroStat.value)}
                </div>
                
                <p 
                  className={`mt-4 text-lg lg:text-xl leading-relaxed text-slate-300 ${
                    isEditing ? "cursor-text hover:ring-2 hover:ring-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded px-1" : ""
                  }`}
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => handleStatBlur(0, 'label', e)}
                >
                  {heroStat.label}
                </p>
                
                {heroStat.source && (
                  <div className="text-xs text-slate-500 mt-2">
                    Source: {heroStat.source}
                  </div>
                )}
              </motion.div>
            </div>
            
            {/* Supporting stats - smaller, staggered */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {supportingStats.slice(0, 3).map((stat, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (index + 1) * 0.1, duration: 0.5 }}
                    className="p-6 bg-slate-800/50 hover:bg-slate-800 transition-all duration-300 hover:scale-105 border border-slate-700/50"
                    style={{ transitionDelay: `${index * 50}ms`, borderRadius: 'var(--archetype-card-radius, 0.75rem)' }}
                  >
                    <div 
                      className={`text-3xl lg:text-4xl font-bold text-white ${
                        isEditing ? "cursor-text hover:ring-2 hover:ring-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded px-2 inline-block" : ""
                      }`}
                      style={{ fontWeight: 'var(--archetype-heading-weight, 700)' as any }}
                      contentEditable={isEditing}
                      suppressContentEditableWarning
                      onBlur={(e) => handleStatBlur(index + 1, 'value', e)}
                    >
                      {formatStatValue(stat.value)}
                    </div>
                    
                    <p 
                      className={`mt-2 text-sm leading-relaxed text-slate-400 ${
                        isEditing ? "cursor-text hover:ring-2 hover:ring-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded px-1" : ""
                      }`}
                      contentEditable={isEditing}
                      suppressContentEditableWarning
                      onBlur={(e) => handleStatBlur(index + 1, 'label', e)}
                    >
                      {stat.label}
                    </p>
                    
                    {stat.source && (
                      <div className="text-xs text-slate-500 mt-1">
                        Source: {stat.source}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              
              {/* Contextual statement */}
              <p className="mt-8 text-sm italic text-slate-500">
                Results from actual client engagements — not industry averages.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Healthcare or Consulting: PREMIUM Light mode with hero stat layout
  if (isHealthcare || isConsulting) {
    const [heroStat, ...supportingStats] = cleanStats;
    const accentColor = isHealthcare ? 'teal' : 'violet';
    const valueColor = isHealthcare ? 'text-teal-600' : 'text-violet-600';
    
    return (
      <section className={`relative py-20 bg-white ${isEditing ? 'relative' : ''}`}>
        {/* Visual connector from hero */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b ${
          isHealthcare ? 'from-teal-500/50' : 'from-violet-500/50'
        } to-transparent`} />
        
        {isEditing && (
          <div className={`absolute inset-0 border-2 ${isHealthcare ? 'border-teal-500/50' : 'border-violet-500/50'} rounded-lg pointer-events-none z-10`} />
        )}
        
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Hero stat - dramatic, large */}
            <div className="lg:col-span-5">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100"
              >
                {/* Accent corner */}
                <div className={`absolute top-0 left-0 w-24 h-1 rounded-full ${
                  isHealthcare ? 'bg-teal-500' : 'bg-violet-500'
                }`} />
                
                <div 
                  className={`text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight ${valueColor} ${
                    isEditing ? `cursor-text hover:ring-2 hover:ring-${accentColor}-400 focus:outline-none focus:ring-2 focus:ring-${accentColor}-400 rounded px-2 inline-block` : ""
                  }`}
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => handleStatBlur(0, 'value', e)}
                >
                  {formatStatValue(heroStat.value)}
                </div>
                
                <p 
                  className={`mt-4 text-lg lg:text-xl leading-relaxed text-slate-600 ${
                    isEditing ? `cursor-text hover:ring-2 hover:ring-${accentColor}-400 focus:outline-none focus:ring-2 focus:ring-${accentColor}-400 rounded px-1` : ""
                  }`}
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => handleStatBlur(0, 'label', e)}
                >
                  {heroStat.label}
                </p>
                
                {heroStat.source && (
                  <div className="text-xs text-slate-500 mt-2">
                    Source: {heroStat.source}
                  </div>
                )}
              </motion.div>
            </div>
            
            {/* Supporting stats - smaller, staggered */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {supportingStats.slice(0, 3).map((stat, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (index + 1) * 0.1, duration: 0.5 }}
                    className="p-6 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all duration-300 hover:scale-105"
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    <div 
                      className={`text-3xl lg:text-4xl font-bold text-slate-900 ${
                        isEditing ? `cursor-text hover:ring-2 hover:ring-${accentColor}-400 focus:outline-none focus:ring-2 focus:ring-${accentColor}-400 rounded px-2 inline-block` : ""
                      }`}
                      contentEditable={isEditing}
                      suppressContentEditableWarning
                      onBlur={(e) => handleStatBlur(index + 1, 'value', e)}
                    >
                      {formatStatValue(stat.value)}
                    </div>
                    
                    <p 
                      className={`mt-2 text-sm leading-relaxed text-slate-500 ${
                        isEditing ? `cursor-text hover:ring-2 hover:ring-${accentColor}-400 focus:outline-none focus:ring-2 focus:ring-${accentColor}-400 rounded px-1` : ""
                      }`}
                      contentEditable={isEditing}
                      suppressContentEditableWarning
                      onBlur={(e) => handleStatBlur(index + 1, 'label', e)}
                    >
                      {stat.label}
                    </p>
                    
                    {stat.source && (
                      <div className="text-xs text-slate-400 mt-1">
                        Source: {stat.source}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              
              {/* Contextual statement */}
              <p className="mt-8 text-sm italic text-slate-400">
                Results from actual client engagements — not industry averages.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Default dark mode styling - also use premium layout
  const [heroStat, ...supportingStats] = cleanStats;
  const archetypeStats = getArchetypeStatClass(archetype);
  
  return (
    <section 
      className={`relative py-20 ${isEditing ? 'relative' : ''}`}
      style={{
        backgroundColor: 'hsl(217, 33%, 6%)',
      }}
    >
      {/* Visual connector from hero */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-cyan-500/50 to-transparent" />
      
      {isEditing && (
        <div className="absolute inset-0 border-2 border-cyan-500/50 rounded-lg pointer-events-none z-10" />
      )}
      
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Hero stat - dramatic, large */}
          <div className="lg:col-span-5">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative p-8"
              style={{
                backgroundColor: 'hsl(217, 33%, 10%)',
                borderWidth: '1px',
                borderColor: 'hsl(217, 33%, 18%)',
                borderStyle: 'solid',
                borderRadius: 'var(--archetype-card-radius, 1rem)',
              }}
            >
              {/* Accent corner */}
              <div className="absolute top-0 left-0 w-24 h-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
              
              <div 
                className={`text-cyan-400 ${archetypeStats.numberClass} ${
                  isEditing ? "cursor-text hover:ring-2 hover:ring-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded px-2 inline-block" : ""
                }`}
                style={{ fontFamily: 'var(--font-heading)', fontSize: archetype === 'command' ? 'clamp(3rem, 8vw, 6rem)' : undefined }}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => handleStatBlur(0, 'value', e)}
              >
                {formatStatValue(heroStat.value)}
              </div>
              
              <p 
                className={`mt-4 text-lg lg:text-xl leading-relaxed text-slate-300 ${
                  isEditing ? "cursor-text hover:ring-2 hover:ring-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded px-1" : ""
                }`}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => handleStatBlur(0, 'label', e)}
              >
                {heroStat.label}
              </p>
              
              {heroStat.source && (
                <div className="text-xs text-slate-500 mt-2">
                  Source: {heroStat.source}
                </div>
              )}
            </motion.div>
          </div>
          
          {/* Supporting stats - smaller, staggered */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {supportingStats.slice(0, 3).map((stat, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (index + 1) * 0.1, duration: 0.5 }}
                    className="p-6 transition-all duration-300 hover:scale-105"
                    style={{ 
                      backgroundColor: 'hsl(217, 33%, 10%)',
                      transitionDelay: `${index * 50}ms`,
                      borderRadius: 'var(--archetype-card-radius, 0.75rem)',
                    }}
                  >
                    <div 
                      className={`text-white ${archetypeStats.numberClass} ${
                        isEditing ? "cursor-text hover:ring-2 hover:ring-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded px-2 inline-block" : ""
                    }`}
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={(e) => handleStatBlur(index + 1, 'value', e)}
                  >
                    {formatStatValue(stat.value)}
                  </div>
                  
                    <p 
                      className={`leading-relaxed text-slate-400 ${archetypeStats.labelClass} ${
                        isEditing ? "cursor-text hover:ring-2 hover:ring-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded px-1" : ""
                    }`}
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={(e) => handleStatBlur(index + 1, 'label', e)}
                  >
                    {stat.label}
                  </p>
                  
                  {stat.source && (
                    <div className="text-xs text-slate-500 mt-1">
                      Source: {stat.source}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            
            {/* Contextual statement */}
            <p className="mt-8 text-sm italic text-slate-500">
              Results from actual client engagements — not industry averages.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}