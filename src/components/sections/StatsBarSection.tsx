import { motion } from "framer-motion";
import { formatStatValue, getTypography } from "@/lib/typographyScale";

interface Statistic {
  value: string;
  label: string;
  source?: string;
}

interface StatsBarSectionProps {
  statistics: Statistic[];
  industryVariant?: string;
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
export function StatsBarSection({ statistics, industryVariant, onUpdate, isEditing }: StatsBarSectionProps) {
  const typography = getTypography(industryVariant);
  const isConsulting = industryVariant === 'consulting';
  const isHealthcare = industryVariant === 'healthcare';
  const isSaas = industryVariant === 'saas';
  const isLocalServices = industryVariant === 'local-services';
  const isLightMode = isConsulting || isHealthcare || isLocalServices;
  
  console.log('🎨 [StatsBarSection] industryVariant:', industryVariant, 'isLocalServices:', isLocalServices);

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

  // Clean the stats (remove any that are clearly malformed)
  const cleanStats = statistics.filter(stat => {
    if (!stat.value || !stat.label) return false;
    if (stat.value.length > 15) return false;
    if (stat.label.length > 50) return false;
    return true;
  });

  if (cleanStats.length === 0) {
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
                className="relative p-8 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700"
              >
                {/* Accent corner */}
                <div className="absolute top-0 left-0 w-24 h-1 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500" />
                
                <div 
                  className={`text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent ${
                    isEditing ? "cursor-text hover:ring-2 hover:ring-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded px-2 inline-block" : ""
                  }`}
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
                    className="p-6 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-all duration-300 hover:scale-105 border border-slate-700/50"
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    <div 
                      className={`text-3xl lg:text-4xl font-bold text-white ${
                        isEditing ? "cursor-text hover:ring-2 hover:ring-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded px-2 inline-block" : ""
                      }`}
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
              className="relative p-8 rounded-2xl"
              style={{
                backgroundColor: 'hsl(217, 33%, 10%)',
                borderWidth: '1px',
                borderColor: 'hsl(217, 33%, 18%)',
                borderStyle: 'solid',
              }}
            >
              {/* Accent corner */}
              <div className="absolute top-0 left-0 w-24 h-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
              
              <div 
                className={`text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-cyan-400 ${
                  isEditing ? "cursor-text hover:ring-2 hover:ring-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded px-2 inline-block" : ""
                }`}
                style={{ fontFamily: 'var(--font-heading)' }}
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
                  className="p-6 rounded-xl transition-all duration-300 hover:scale-105"
                  style={{ 
                    backgroundColor: 'hsl(217, 33%, 10%)',
                    transitionDelay: `${index * 50}ms` 
                  }}
                >
                  <div 
                    className={`text-3xl lg:text-4xl font-bold text-white ${
                      isEditing ? "cursor-text hover:ring-2 hover:ring-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded px-2 inline-block" : ""
                    }`}
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={(e) => handleStatBlur(index + 1, 'value', e)}
                  >
                    {formatStatValue(stat.value)}
                  </div>
                  
                  <p 
                    className={`mt-2 text-sm leading-relaxed text-slate-400 ${
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