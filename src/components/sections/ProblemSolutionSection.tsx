import { AlertTriangle, CheckCircle, ArrowRight, Sparkles, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { EyebrowBadge } from "@/components/ui/PremiumCard";
import { getTypography } from "@/lib/typographyScale";

interface CitedStat {
  statistic: string;
  claim: string;
  source: string;
  year: number;
  fullCitation: string;
}

interface ProblemSolutionSectionProps {
  content: {
    problem: string;
    solution: string;
    problemStat?: CitedStat;
    solutionStat?: CitedStat;
    industryVariant?: string;
    sectionTitle?: string;
  };
  onUpdate: (content: any) => void;
  isEditing?: boolean;
}

export function ProblemSolutionSection({ content, onUpdate, isEditing }: ProblemSolutionSectionProps) {
  const isConsulting = content.industryVariant === 'consulting';
  const isSaas = content.industryVariant === 'saas';
  const typography = getTypography(content.industryVariant);
  
  console.log('🎨 [ProblemSolutionSection] industryVariant:', content.industryVariant, 'isConsulting:', isConsulting, 'isSaas:', isSaas);
  
  const handleBlur = (field: string, e: React.FocusEvent<HTMLElement>) => {
    onUpdate({
      ...content,
      [field]: e.currentTarget.textContent || content[field as keyof typeof content],
    });
  };

  // SaaS variant
  if (isSaas) {
    return (
      <section className={`py-24 bg-slate-900 ${isEditing ? 'relative' : ''}`}>
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
              THE PROBLEM
            </span>
            <h2
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("sectionTitle", e)}
              className={`text-3xl md:text-4xl font-bold text-white ${isEditing ? "cursor-text hover:ring-2 hover:ring-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded px-2" : ""}`}
            >
              {content.sectionTitle || "Why teams struggle"}
            </h2>
          </motion.div>
          
          {/* Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Problem Card */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-8 bg-slate-800 border border-slate-700 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-white">Without us</h3>
              </div>
              <p
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => handleBlur("problem", e)}
                className={`text-slate-300 leading-relaxed ${isEditing ? "cursor-text hover:ring-2 hover:ring-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded px-2" : ""}`}
              >
                {content.problem}
              </p>
            </motion.div>
            
            {/* Solution Card */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-8 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-purple-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-white">With us</h3>
              </div>
              <p
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => handleBlur("solution", e)}
                className={`text-slate-300 leading-relaxed ${isEditing ? "cursor-text hover:ring-2 hover:ring-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded px-2" : ""}`}
              >
                {content.solution}
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  if (isConsulting) {
    // Consulting layout: Light mode with colored cards
    return (
      <section className="py-24 bg-white">
        {isEditing && (
          <div className="absolute inset-0 border-2 border-cyan-500/50 rounded-lg pointer-events-none z-10" />
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
            <span className="inline-block px-4 py-1 bg-amber-100 text-amber-800 text-sm font-semibold rounded-full mb-4">
              THE TRANSFORMATION
            </span>
            <h2 
              className={`text-3xl md:text-4xl font-bold text-slate-900 ${isEditing ? 'cursor-text hover:ring-2 hover:ring-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded px-1' : ''}`}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("sectionTitle", e)}
            >
              {content.sectionTitle || "Why This Matters"}
            </h2>
          </motion.div>
          
          {/* Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Problem Card */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-10 bg-red-50 border border-red-100 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-red-900">The Challenge</h3>
              </div>
              <p 
                className={`text-slate-700 leading-relaxed text-lg ${
                  isEditing ? "outline-dashed outline-2 outline-cyan-500/30 rounded px-2" : ""
                }`}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => handleBlur("problem", e)}
              >
                {content.problem}
              </p>
              
              {content.problemStat && (
                <div className="mt-6 p-5 rounded-xl bg-red-100/50 border border-red-200">
                  <div className="text-2xl font-bold text-red-700 mb-2">
                    {content.problemStat.statistic}
                  </div>
                  <p className="text-slate-700 text-sm">
                    {content.problemStat.claim}
                  </p>
                  <cite className="text-xs text-slate-500 not-italic block mt-2">
                    Source: {content.problemStat.fullCitation}
                  </cite>
                </div>
              )}
            </motion.div>

            {/* Solution Card */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-10 bg-emerald-50 border border-emerald-100 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-emerald-900">Our Solution</h3>
              </div>
              <p 
                className={`text-slate-700 leading-relaxed text-lg ${
                  isEditing ? "outline-dashed outline-2 outline-cyan-500/30 rounded px-2" : ""
                }`}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => handleBlur("solution", e)}
              >
                {content.solution}
              </p>
              
              {content.solutionStat && (
                <div className="mt-6 p-5 rounded-xl bg-emerald-100/50 border border-emerald-200">
                  <div className="text-2xl font-bold text-emerald-700 mb-2">
                    {content.solutionStat.statistic}
                  </div>
                  <p className="text-slate-700 text-sm">
                    {content.solutionStat.claim}
                  </p>
                  <cite className="text-xs text-slate-500 not-italic block mt-2">
                    Source: {content.solutionStat.fullCitation}
                  </cite>
                </div>
              )}
            </motion.div>
          </div>

          {/* Visual Connector */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="hidden md:flex justify-center mt-10"
          >
            <div className="flex items-center gap-4 text-slate-400">
              <span className="text-sm font-medium">From Problem</span>
              <div className="w-24 h-px bg-slate-300 relative">
                <ArrowRight className="absolute -right-2 -top-2 w-4 h-4 text-slate-400" strokeWidth={1.5} />
              </div>
              <span className="text-sm font-medium text-emerald-600">To Solution</span>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // Default dark mode layout
  const sectionBg = 'hsl(217, 33%, 6%)';
  const cardBg = 'hsla(0, 0%, 100%, 0.02)';
  const cardBorder = 'hsla(0, 0%, 100%, 0.05)';
  const textPrimary = 'hsl(210, 40%, 80%)';
  const textSecondary = 'hsl(210, 20%, 60%)';

  return (
    <section 
      className={`relative overflow-hidden ${isEditing ? "relative" : ""}`}
      style={{
        backgroundColor: sectionBg,
        padding: '96px 24px',
      }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div 
        className="absolute top-1/2 left-0 w-[600px] h-[600px] rounded-full blur-[150px] -translate-y-1/2"
        style={{ backgroundColor: 'hsla(0, 70%, 50%, 0.05)' }}
      />
      <div 
        className="absolute top-1/2 right-0 w-[600px] h-[600px] rounded-full blur-[150px] -translate-y-1/2"
        style={{ backgroundColor: 'hsla(189, 95%, 43%, 0.05)' }}
      />

      {isEditing && (
        <div className="absolute inset-0 border-2 border-cyan-500/50 rounded-lg pointer-events-none z-10" />
      )}

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <EyebrowBadge 
            icon={<Sparkles className="w-4 h-4" strokeWidth={1.5} />} 
            text="The Transformation" 
            className="mb-6"
          />
          <h2 
            className={typography.sectionTitle}
            style={{ color: textPrimary }}
          >
            Why This Matters
          </h2>
        </motion.div>
        
        {/* Split Cards */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {/* Problem Card */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative overflow-hidden rounded-2xl p-8"
            style={{ 
              backgroundColor: cardBg, 
              border: `1px solid ${cardBorder}`,
            }}
          >
            {/* Red accent gradient */}
            <div 
              className="absolute top-0 left-0 w-full h-1"
              style={{ background: 'linear-gradient(90deg, hsl(0, 70%, 50%), hsl(30, 90%, 55%))' }}
            />
            
            <div className="flex items-center gap-4 mb-6">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, hsl(0, 70%, 50%), hsl(30, 90%, 55%))',
                  boxShadow: '0 8px 20px -4px hsla(0, 70%, 50%, 0.4)',
                }}
              >
                <AlertTriangle className="w-7 h-7 text-white" strokeWidth={1.5} />
              </div>
              <h3 className={typography.cardTitle} style={{ color: 'hsl(0, 70%, 50%)' }}>
                The Challenge
              </h3>
            </div>
            
            <p 
              className={`${typography.bodyLarge} ${
                isEditing ? "outline-dashed outline-2 outline-cyan-500/30 rounded px-2" : ""
              }`}
              style={{ color: textSecondary }}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("problem", e)}
            >
              {content.problem}
            </p>
            
            {content.problemStat && (
              <div 
                className="mt-6 p-5 rounded-xl"
                style={{ 
                  backgroundColor: 'hsla(0, 0%, 100%, 0.03)', 
                  border: '1px solid hsla(0, 70%, 50%, 0.2)' 
                }}
              >
                <div className={`${typography.statValue} mb-2`} style={{ color: 'hsl(0, 70%, 50%)' }}>
                  {content.problemStat.statistic}
                </div>
                <p className={typography.body} style={{ color: textSecondary }}>
                  {content.problemStat.claim}
                </p>
                <cite className={`${typography.citation} not-italic block mt-2`} style={{ color: textSecondary, opacity: 0.7 }}>
                  Source: {content.problemStat.fullCitation}
                </cite>
              </div>
            )}
          </motion.div>

          {/* Solution Card */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative overflow-hidden rounded-2xl p-8"
            style={{ 
              backgroundColor: cardBg, 
              border: `1px solid ${cardBorder}`,
            }}
          >
            {/* Cyan accent gradient */}
            <div 
              className="absolute top-0 left-0 w-full h-1"
              style={{ background: 'linear-gradient(90deg, hsl(189, 95%, 43%), hsl(270, 95%, 60%))' }}
            />
            
            <div className="flex items-center gap-4 mb-6">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, hsl(189, 95%, 43%), hsl(270, 95%, 60%))',
                  boxShadow: '0 8px 20px -4px hsla(189, 95%, 43%, 0.4)',
                }}
              >
                <CheckCircle className="w-7 h-7 text-white" strokeWidth={1.5} />
              </div>
              <h3 className={typography.cardTitle} style={{ color: 'hsl(189, 95%, 35%)' }}>
                Our Solution
              </h3>
            </div>
            
            <p 
              className={`${typography.bodyLarge} ${
                isEditing ? "outline-dashed outline-2 outline-cyan-500/30 rounded px-2" : ""
              }`}
              style={{ color: textSecondary }}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("solution", e)}
            >
              {content.solution}
            </p>
            
            {content.solutionStat && (
              <div 
                className="mt-6 p-5 rounded-xl"
                style={{ 
                  backgroundColor: 'hsla(189, 95%, 43%, 0.05)', 
                  border: '1px solid hsla(189, 95%, 43%, 0.2)' 
                }}
              >
                <div className={`${typography.statValue} mb-2`} style={{ color: 'hsl(189, 95%, 35%)' }}>
                  {content.solutionStat.statistic}
                </div>
                <p className={typography.body} style={{ color: textSecondary }}>
                  {content.solutionStat.claim}
                </p>
                <cite className={`${typography.citation} not-italic block mt-2`} style={{ color: textSecondary, opacity: 0.7 }}>
                  Source: {content.solutionStat.fullCitation}
                </cite>
              </div>
            )}
          </motion.div>
        </div>

        {/* Transformation Arrow */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="hidden md:flex justify-center mt-12"
        >
          <div 
            className="flex items-center gap-4 px-6 py-3 rounded-full backdrop-blur-sm"
            style={{ 
              backgroundColor: 'hsla(0, 0%, 100%, 0.03)',
              border: '1px solid hsla(0, 0%, 100%, 0.08)',
            }}
          >
            <span className="text-sm font-semibold" style={{ color: textSecondary }}>From Problem</span>
            <div className="w-12 h-[2px] bg-gradient-to-r from-red-500 to-cyan-500" />
            <ArrowRight className="w-5 h-5" style={{ color: 'hsl(189, 95%, 35%)' }} strokeWidth={1.5} />
            <div className="w-12 h-[2px] bg-gradient-to-r from-cyan-500 to-purple-500" />
            <span className="text-sm font-semibold" style={{ color: 'hsl(189, 95%, 35%)' }}>To Solution</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
