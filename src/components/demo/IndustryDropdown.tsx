import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { IndustryVariant } from '@/lib/industryDetection';

interface Category {
  id: string;
  label: string;
  variant: IndustryVariant;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: string;
  label: string;
  variant: IndustryVariant;
}

const INDUSTRY_CATEGORIES: Category[] = [
  {
    id: 'saas',
    label: 'B2B SaaS / Software',
    variant: 'saas',
    subcategories: [
      { id: 'saas-startup', label: 'Early-Stage SaaS', variant: 'saas' },
      { id: 'saas-enterprise', label: 'Enterprise Software', variant: 'saas' },
      { id: 'saas-devtools', label: 'Developer Tools', variant: 'saas' },
      { id: 'saas-martech', label: 'Marketing Technology', variant: 'saas' },
      { id: 'saas-fintech', label: 'Fintech', variant: 'finance' },
      { id: 'saas-healthtech', label: 'Healthcare Technology', variant: 'healthcare' },
    ],
  },
  {
    id: 'professional',
    label: 'Professional Services',
    variant: 'consulting',
    subcategories: [
      { id: 'agency-design', label: 'Design / Creative Agency', variant: 'creative' },
      { id: 'agency-marketing', label: 'Marketing / Advertising', variant: 'creative' },
      { id: 'consulting-management', label: 'Management Consulting', variant: 'consulting' },
      { id: 'agency-dev', label: 'Development / Technical', variant: 'consulting' },
      { id: 'coaching', label: 'Coaching / Training', variant: 'consulting' },
      { id: 'legal', label: 'Legal Services', variant: 'legal' },
      { id: 'accounting', label: 'Accounting / Finance', variant: 'finance' },
    ],
  },
  {
    id: 'healthcare',
    label: 'Healthcare / Medical',
    variant: 'healthcare',
    subcategories: [
      { id: 'biotech', label: 'Biotechnology', variant: 'healthcare' },
      { id: 'medical-devices', label: 'Medical Devices', variant: 'healthcare' },
      { id: 'digital-health', label: 'Digital Health', variant: 'healthcare' },
      { id: 'pharma', label: 'Pharmaceuticals', variant: 'healthcare' },
      { id: 'mental-health', label: 'Mental Health / Wellness', variant: 'healthcare' },
    ],
  },
  {
    id: 'ecommerce',
    label: 'E-commerce / Retail',
    variant: 'ecommerce',
    subcategories: [
      { id: 'dtc', label: 'DTC / Consumer Products', variant: 'ecommerce' },
      { id: 'fashion', label: 'Fashion / Apparel', variant: 'ecommerce' },
      { id: 'food', label: 'Food & Beverage', variant: 'ecommerce' },
      { id: 'marketplace', label: 'Marketplace', variant: 'ecommerce' },
    ],
  },
  {
    id: 'finance',
    label: 'Financial Services',
    variant: 'finance',
    subcategories: [
      { id: 'banking', label: 'Banking / Neobanks', variant: 'finance' },
      { id: 'insurance', label: 'Insurance', variant: 'finance' },
      { id: 'payments', label: 'Payments / Fintech', variant: 'finance' },
      { id: 'wealth', label: 'Wealth Management', variant: 'finance' },
    ],
  },
  {
    id: 'manufacturing',
    label: 'Manufacturing / Industrial',
    variant: 'manufacturing',
  },
  {
    id: 'realestate',
    label: 'Real Estate / PropTech',
    variant: 'consulting',
  },
  {
    id: 'education',
    label: 'Education / EdTech',
    variant: 'consulting',
  },
  {
    id: 'other',
    label: 'Other',
    variant: 'default',
  },
];

interface IndustryDropdownProps {
  currentValue?: { category: string; subcategory?: string };
  onSelect: (variant: IndustryVariant, displayName: string) => void;
  onClose: () => void;
}

export const IndustryDropdown = ({ 
  currentValue, 
  onSelect, 
  onClose 
}: IndustryDropdownProps) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleCategoryClick = (category: Category) => {
    if (category.subcategories && category.subcategories.length > 0) {
      // Expand to show subcategories
      setExpandedCategory(expandedCategory === category.id ? null : category.id);
    } else {
      // Direct selection
      onSelect(category.variant, category.label);
    }
  };

  const handleSubcategoryClick = (subcategory: Subcategory) => {
    onSelect(subcategory.variant, subcategory.label);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700/50 bg-slate-800/50">
        <span className="text-xs font-medium text-slate-300">Select Industry</span>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-700 transition-colors"
        >
          <X className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* Categories List */}
      <div className="max-h-[280px] overflow-y-auto">
        {INDUSTRY_CATEGORIES.map((category) => (
          <div key={category.id}>
            {/* Category Row */}
            <button
              onClick={() => handleCategoryClick(category)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-sm text-left",
                "hover:bg-slate-700/50 transition-colors text-slate-300",
                expandedCategory === category.id && "bg-slate-700/30"
              )}
            >
              <span>{category.label}</span>
              {category.subcategories ? (
                <motion.span
                  animate={{ rotate: expandedCategory === category.id ? 90 : 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </motion.span>
              ) : null}
            </button>

            {/* Subcategories (expanded) */}
            <AnimatePresence>
              {expandedCategory === category.id && category.subcategories && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden bg-slate-800/30"
                >
                  {category.subcategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => handleSubcategoryClick(sub)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-1.5 text-sm text-left",
                        "hover:bg-cyan-500/10 hover:text-cyan-300 transition-colors",
                        "text-slate-400 pl-6"
                      )}
                    >
                      {sub.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// Helper to get design approach text based on variant
export const getDesignApproachText = (variant: IndustryVariant, targetMarket?: string): string => {
  const approaches: Record<IndustryVariant, string> = {
    creative: 'Bold, expressive design with portfolio focus',
    consulting: 'Credible, authoritative design with expertise focus',
    saas: 'Clean, modern design optimized for conversions',
    healthcare: 'Trust-focused design with compliance awareness',
    finance: 'Professional design emphasizing security and credibility',
    ecommerce: 'Conversion-optimized design with product focus',
    manufacturing: 'Industrial design emphasizing capability and reliability',
    legal: 'Authoritative design with professionalism focus',
    default: 'Balanced design adaptable to your market',
  };

  const base = approaches[variant] || approaches.default;
  
  if (targetMarket) {
    return `${base} for ${targetMarket} buyers`;
  }
  
  return base;
};
