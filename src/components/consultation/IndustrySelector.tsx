import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Check, 
  Search,
  Heart,
  Landmark,
  Cloud,
  Cpu,
  ShoppingCart,
  Briefcase,
  Home,
  GraduationCap,
  Film,
  Smartphone,
  HeartHandshake,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Industry data structure
interface SubIndustry {
  id: string;
  label: string;
}

interface IndustryCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  subIndustries: SubIndustry[];
}

const INDUSTRY_DATA: IndustryCategory[] = [
  {
    id: 'healthcare',
    label: 'Healthcare / Medical',
    icon: Heart,
    subIndustries: [
      { id: 'biotech', label: 'Biotechnology' },
      { id: 'medical-devices', label: 'Medical Devices' },
      { id: 'digital-health', label: 'Digital Health / Telemedicine' },
      { id: 'pharma', label: 'Pharmaceuticals' },
      { id: 'healthcare-it', label: 'Healthcare IT / EMR' },
      { id: 'mental-health', label: 'Mental Health / Wellness' },
      { id: 'clinical-research', label: 'Clinical Research' },
      { id: 'health-insurance', label: 'Health Insurance' },
      { id: 'other-healthcare', label: 'Other Healthcare' },
    ],
  },
  {
    id: 'financial',
    label: 'Financial Services',
    icon: Landmark,
    subIndustries: [
      { id: 'banking', label: 'Banking / Neobanks' },
      { id: 'insurance', label: 'Insurance / InsurTech' },
      { id: 'payments', label: 'Payments / FinTech' },
      { id: 'investment', label: 'Investment / WealthTech' },
      { id: 'lending', label: 'Lending / Credit' },
      { id: 'crypto', label: 'Cryptocurrency / Web3' },
      { id: 'accounting', label: 'Accounting / Tax' },
      { id: 'other-financial', label: 'Other Financial' },
    ],
  },
  {
    id: 'b2b-saas',
    label: 'B2B SaaS / Software',
    icon: Cloud,
    subIndustries: [
      { id: 'marketing-sales', label: 'Marketing / Sales Tools' },
      { id: 'hr-people', label: 'HR / People Operations' },
      { id: 'dev-tools', label: 'Developer Tools' },
      { id: 'ai-ml', label: 'AI / Machine Learning' },
      { id: 'analytics', label: 'Analytics / Business Intelligence' },
      { id: 'security', label: 'Security / Compliance' },
      { id: 'productivity', label: 'Productivity / Collaboration' },
      { id: 'finance-tools', label: 'Finance / Accounting Tools' },
      { id: 'customer-success', label: 'Customer Support / Success' },
      { id: 'other-saas', label: 'Other SaaS' },
    ],
  },
  {
    id: 'technology',
    label: 'Technology / Hardware',
    icon: Cpu,
    subIndustries: [
      { id: 'consumer-electronics', label: 'Consumer Electronics' },
      { id: 'iot', label: 'IoT / Smart Devices' },
      { id: 'robotics', label: 'Robotics / Automation' },
      { id: 'semiconductors', label: 'Semiconductors' },
      { id: 'cleantech', label: 'Clean Tech / Energy' },
      { id: 'aerospace', label: 'Aerospace / Defense' },
      { id: 'networking', label: 'Networking / Infrastructure' },
      { id: 'other-hardware', label: 'Other Hardware' },
    ],
  },
  {
    id: 'ecommerce',
    label: 'E-commerce / Retail',
    icon: ShoppingCart,
    subIndustries: [
      { id: 'fashion', label: 'Fashion / Apparel' },
      { id: 'food-beverage', label: 'Food / Beverage' },
      { id: 'beauty', label: 'Beauty / Personal Care' },
      { id: 'home-furniture', label: 'Home / Furniture' },
      { id: 'electronics', label: 'Electronics / Gadgets' },
      { id: 'marketplace', label: 'Marketplace / Multi-vendor' },
      { id: 'subscription', label: 'Subscription / DTC' },
      { id: 'other-retail', label: 'Other Retail' },
    ],
  },
  {
    id: 'professional',
    label: 'Professional Services',
    icon: Briefcase,
    subIndustries: [
      { id: 'legal', label: 'Legal / LegalTech' },
      { id: 'consulting', label: 'Consulting' },
      { id: 'marketing-agency', label: 'Marketing / Advertising Agency' },
      { id: 'design-agency', label: 'Design / Creative Agency' },
      { id: 'recruiting', label: 'Recruiting / Staffing' },
      { id: 'bookkeeping', label: 'Accounting / Bookkeeping' },
      { id: 'other-services', label: 'Other Services' },
    ],
  },
  {
    id: 'real-estate',
    label: 'Real Estate / PropTech',
    icon: Home,
    subIndustries: [
      { id: 'residential', label: 'Residential' },
      { id: 'commercial', label: 'Commercial' },
      { id: 'property-mgmt', label: 'Property Management' },
      { id: 'mortgage', label: 'Mortgage / Lending' },
      { id: 'construction', label: 'Construction / Development' },
      { id: 'other-real-estate', label: 'Other Real Estate' },
    ],
  },
  {
    id: 'education',
    label: 'Education / EdTech',
    icon: GraduationCap,
    subIndustries: [
      { id: 'k12', label: 'K-12' },
      { id: 'higher-ed', label: 'Higher Education' },
      { id: 'corporate-training', label: 'Corporate Training' },
      { id: 'online-courses', label: 'Online Courses / MOOCs' },
      { id: 'tutoring', label: 'Tutoring / Test Prep' },
      { id: 'language', label: 'Language Learning' },
      { id: 'other-education', label: 'Other Education' },
    ],
  },
  {
    id: 'media',
    label: 'Media / Entertainment',
    icon: Film,
    subIndustries: [
      { id: 'streaming', label: 'Streaming / Video' },
      { id: 'gaming', label: 'Gaming' },
      { id: 'music', label: 'Music / Audio' },
      { id: 'publishing', label: 'Publishing / News' },
      { id: 'social-media', label: 'Social Media' },
      { id: 'sports', label: 'Sports / Fitness' },
      { id: 'other-media', label: 'Other Media' },
    ],
  },
  {
    id: 'consumer',
    label: 'Consumer Apps',
    icon: Smartphone,
    subIndustries: [
      { id: 'dating', label: 'Dating / Social' },
      { id: 'travel', label: 'Travel / Hospitality' },
      { id: 'food-delivery', label: 'Food Delivery' },
      { id: 'transportation', label: 'Transportation / Mobility' },
      { id: 'personal-finance', label: 'Personal Finance' },
      { id: 'health-fitness', label: 'Health / Fitness' },
      { id: 'other-consumer', label: 'Other Consumer' },
    ],
  },
  {
    id: 'nonprofit',
    label: 'Non-Profit / Social Impact',
    icon: HeartHandshake,
    subIndustries: [
      { id: 'environmental', label: 'Environmental / Climate' },
      { id: 'social-services', label: 'Social Services' },
      { id: 'arts-culture', label: 'Arts / Culture' },
      { id: 'international', label: 'International Development' },
      { id: 'animal-welfare', label: 'Animal Welfare' },
      { id: 'community', label: 'Community / Local' },
      { id: 'other-nonprofit', label: 'Other Non-Profit' },
    ],
  },
];

interface IndustrySelectorProps {
  value: {
    category: string;
    subcategory: string;
  };
  onChange: (value: { category: string; subcategory: string }) => void;
}

export function IndustrySelector({ value, onChange }: IndustrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Get selected category data
  const selectedCategory = INDUSTRY_DATA.find(c => c.label === value.category);
  const activeCategory = hoveredCategory 
    ? INDUSTRY_DATA.find(c => c.id === hoveredCategory) 
    : selectedCategory;

  // Filter categories by search
  const filteredCategories = searchQuery
    ? INDUSTRY_DATA.filter(cat => 
        cat.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.subIndustries.some(sub => 
          sub.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : INDUSTRY_DATA;

  // Filter sub-industries by search within active category
  const filteredSubIndustries = activeCategory?.subIndustries.filter(sub =>
    !searchQuery || sub.label.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleSelect = (category: IndustryCategory, subIndustry: SubIndustry) => {
    onChange({
      category: category.label,
      subcategory: subIndustry.label,
    });
    setIsOpen(false);
    setSearchQuery('');
    setHoveredCategory(null);
  };

  const displayValue = value.category && value.subcategory
    ? `${value.category} → ${value.subcategory}`
    : 'Select your industry...';

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between",
          "bg-slate-800 border border-slate-600 text-left rounded-lg px-4 py-3",
          "transition-all duration-150",
          "hover:border-slate-500",
          isOpen && "border-cyan-500/50 ring-1 ring-cyan-500/20",
          value.category ? "text-white" : "text-slate-500"
        )}
      >
        <span className="truncate pr-2">{displayValue}</span>
        <ChevronDown 
          className={cn(
            "w-5 h-5 text-slate-400 transition-transform duration-200 flex-shrink-0",
            isOpen && "rotate-180"
          )} 
        />
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute z-50 mt-2 w-full",
              "bg-slate-800/95 backdrop-blur-lg",
              "border border-slate-700",
              "rounded-xl shadow-2xl shadow-cyan-500/10",
              "overflow-hidden"
            )}
          >
            {/* Search Bar */}
            <div className="p-3 border-b border-slate-700/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search industries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "w-full pl-9 pr-4 py-2",
                    "bg-slate-700/50 border border-slate-600 rounded-lg",
                    "text-white placeholder:text-slate-500",
                    "focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20",
                    "transition-all duration-150"
                  )}
                />
              </div>
            </div>

            {/* Two-column layout */}
            <div className="flex max-h-[400px]">
              {/* Left Column: Categories */}
              <div className="w-1/2 border-r border-slate-700/50 overflow-y-auto">
                {filteredCategories.map((category) => {
                  const Icon = category.icon;
                  const isSelected = value.category === category.label;
                  const isHovered = hoveredCategory === category.id;
                  
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onMouseEnter={() => setHoveredCategory(category.id)}
                      onClick={() => setHoveredCategory(category.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5",
                        "text-left transition-all duration-150",
                        isSelected && "text-cyan-400 bg-cyan-500/10 border-l-2 border-cyan-500",
                        !isSelected && isHovered && "text-white bg-slate-700/50",
                        !isSelected && !isHovered && "text-slate-300"
                      )}
                    >
                      <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                      <span className="truncate text-sm">{category.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Sub-industries */}
              <div className="w-1/2 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {activeCategory && (
                    <motion.div
                      key={activeCategory.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {filteredSubIndustries.map((subIndustry) => {
                        const isSelected = 
                          value.category === activeCategory.label && 
                          value.subcategory === subIndustry.label;
                        
                        return (
                          <button
                            key={subIndustry.id}
                            type="button"
                            onClick={() => handleSelect(activeCategory, subIndustry)}
                            className={cn(
                              "w-full flex items-center justify-between px-4 py-2",
                              "text-left transition-all duration-150",
                              isSelected && "text-cyan-400",
                              !isSelected && "text-slate-400 hover:text-white hover:bg-slate-700/30"
                            )}
                          >
                            <span className="truncate text-sm">{subIndustry.label}</span>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex-shrink-0"
                              >
                                <Check className="w-4 h-4 text-cyan-400" />
                              </motion.div>
                            )}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { INDUSTRY_DATA };
