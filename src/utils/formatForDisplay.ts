const abbreviations: Record<string, string> = {
  'exec': 'Executive',
  'coach': 'Coaching',
  'mktg': 'Marketing',
  'mgmt': 'Management',
  'dev': 'Development',
  'syndr': 'Syndrome',
  'empath': 'Empathy',
  'attrib': 'Attribution',
  'dashboa': 'Dashboards',
  'consult': 'Consulting',
  'strat': 'Strategy',
  'serv': 'Services',
  'tech': 'Technology',
  'prof': 'Professional',
  'biz': 'Business',
  'mkting': 'Marketing',
  'advsr': 'Advisory',
  'perf': 'Performance',
  'optim': 'Optimization',
  'autom': 'Automation',
  'integr': 'Integration',
  'analyt': 'Analytics',
  'transf': 'Transformation',
};

const properNouns: Record<string, string> = {
  'saas': 'SaaS',
  'b2b': 'B2B',
  'b2c': 'B2C',
  'cto': 'CTO',
  'ceo': 'CEO',
  'cfo': 'CFO',
  'cmo': 'CMO',
  'roi': 'ROI',
  'roas': 'ROAS',
  'seo': 'SEO',
  'ppc': 'PPC',
  'ai': 'AI',
  'crm': 'CRM',
  'erp': 'ERP',
  'hr': 'HR',
  'it': 'IT',
  'smb': 'SMB',
  'ecommerce': 'eCommerce',
  'e-commerce': 'eCommerce',
  'fintech': 'FinTech',
  'edtech': 'EdTech',
  'healthtech': 'HealthTech',
  'martech': 'MarTech',
  'proptech': 'PropTech',
  'insurtech': 'InsurTech',
  'regtech': 'RegTech',
  'legaltech': 'LegalTech',
  'ux': 'UX',
  'ui': 'UI',
  'api': 'API',
  'cbd': 'CBD',
  'cpa': 'CPA',
  'kpi': 'KPI',
};

export function formatForHeadline(value: string): string {
  if (!value) return '';
  
  let result = value
    // Remove trailing ellipsis
    .replace(/\.{2,}$/, '')
    // Remove trailing partial words (likely truncated)
    .trim();
  
  // Expand known abbreviations
  Object.entries(abbreviations).forEach(([abbr, full]) => {
    const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
    result = result.replace(regex, full);
  });
  
  // Fix proper nouns
  Object.entries(properNouns).forEach(([lower, proper]) => {
    const regex = new RegExp(`\\b${lower}\\b`, 'gi');
    result = result.replace(regex, proper);
  });
  
  // Title case everything else
  result = result
    .split(' ')
    .map(word => {
      // Skip if already handled by properNouns
      if (Object.values(properNouns).includes(word)) return word;
      // Skip if already handled by abbreviations
      if (Object.values(abbreviations).some(full => word.includes(full))) return word;
      // Skip short connecting words
      if (['for', 'and', 'the', 'of', 'in', 'to', 'a', 'an'].includes(word.toLowerCase())) {
        return word.toLowerCase();
      }
      // Title case
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
  
  // Ensure first character is uppercase
  if (result.length > 0) {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }
  
  return result;
}
