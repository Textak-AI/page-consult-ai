interface TemplateContext {
  businessName: string;
  industry: string;
  ownerName?: string;
  serviceDescription?: string;
}

export interface EmailTemplate {
  name: string;
  subject: string;
  body: (clientName: string) => string;
  bestFor: string;
}

export interface IndustryHints {
  resultExamples: string[];
  commonProjects: string[];
  valuePhrases: string[];
}

const INDUSTRY_TEMPLATE_HINTS: Record<string, IndustryHints> = {
  'saas': {
    resultExamples: ['reduced churn by X%', 'increased MRR', 'saved X hours/week'],
    commonProjects: ['implementation', 'onboarding', 'migration'],
    valuePhrases: ['streamlined our workflow', 'game-changer for our team', 'ROI within weeks']
  },
  'software': {
    resultExamples: ['reduced churn by X%', 'increased MRR', 'saved X hours/week'],
    commonProjects: ['implementation', 'onboarding', 'integration'],
    valuePhrases: ['streamlined our workflow', 'game-changer for our team', 'ROI within weeks']
  },
  'consulting': {
    resultExamples: ['increased efficiency', 'strategic clarity', 'measurable improvements'],
    commonProjects: ['strategy engagement', 'assessment', 'transformation'],
    valuePhrases: ['invaluable insights', 'exceeded expectations', 'true partner']
  },
  'professional-services': {
    resultExamples: ['increased efficiency', 'strategic clarity', 'measurable improvements'],
    commonProjects: ['strategy engagement', 'assessment', 'project'],
    valuePhrases: ['invaluable insights', 'exceeded expectations', 'true partner']
  },
  'ecommerce': {
    resultExamples: ['increased conversions', 'higher AOV', 'better customer retention'],
    commonProjects: ['website redesign', 'optimization', 'launch'],
    valuePhrases: ['sales increased immediately', 'customers love it', 'best investment']
  },
  'retail': {
    resultExamples: ['increased foot traffic', 'higher sales', 'better customer experience'],
    commonProjects: ['store redesign', 'marketing campaign', 'launch'],
    valuePhrases: ['customers love it', 'best investment', 'immediate results']
  },
  'healthcare': {
    resultExamples: ['improved patient satisfaction', 'reduced wait times', 'better outcomes'],
    commonProjects: ['system implementation', 'process improvement', 'training'],
    valuePhrases: ['transformed our practice', 'patients notice the difference', 'highly professional']
  },
  'medical': {
    resultExamples: ['improved patient satisfaction', 'reduced wait times', 'better outcomes'],
    commonProjects: ['system implementation', 'process improvement', 'training'],
    valuePhrases: ['transformed our practice', 'patients notice the difference', 'highly professional']
  },
  'manufacturing': {
    resultExamples: ['reduced downtime', 'improved yield', 'cost savings'],
    commonProjects: ['optimization project', 'system upgrade', 'consulting engagement'],
    valuePhrases: ['understood our industry', 'practical solutions', 'measurable results']
  },
  'industrial': {
    resultExamples: ['reduced downtime', 'improved yield', 'cost savings'],
    commonProjects: ['optimization project', 'system upgrade', 'implementation'],
    valuePhrases: ['understood our industry', 'practical solutions', 'measurable results']
  },
  'finance': {
    resultExamples: ['improved compliance', 'better client retention', 'increased AUM'],
    commonProjects: ['advisory engagement', 'system implementation', 'consulting'],
    valuePhrases: ['trusted advisor', 'exceeded expectations', 'highly recommend']
  },
  'real-estate': {
    resultExamples: ['sold quickly', 'above asking price', 'smooth transaction'],
    commonProjects: ['home sale', 'purchase', 'investment'],
    valuePhrases: ['made the process easy', 'true professional', 'highly recommend']
  },
  'education': {
    resultExamples: ['improved outcomes', 'higher engagement', 'better results'],
    commonProjects: ['course', 'program', 'training'],
    valuePhrases: ['transformed my approach', 'practical and actionable', 'worth every penny']
  },
  'fitness': {
    resultExamples: ['lost X pounds', 'gained strength', 'achieved goals'],
    commonProjects: ['training program', 'coaching', 'membership'],
    valuePhrases: ['life-changing', 'best decision', 'exceeded my goals']
  },
  'hospitality': {
    resultExamples: ['increased bookings', 'higher reviews', 'better guest experience'],
    commonProjects: ['renovation', 'service improvement', 'marketing'],
    valuePhrases: ['guests love it', 'immediate impact', 'professional team']
  },
  'legal': {
    resultExamples: ['favorable outcome', 'protected interests', 'clear guidance'],
    commonProjects: ['case', 'contract', 'consultation'],
    valuePhrases: ['thorough and professional', 'peace of mind', 'highly recommend']
  }
};

const DEFAULT_HINTS: IndustryHints = {
  resultExamples: ['achieved goals', 'saw improvements', 'got results'],
  commonProjects: ['project', 'engagement', 'work together'],
  valuePhrases: ['exceeded expectations', 'highly professional', 'would recommend']
};

export function getIndustryHints(industry: string): IndustryHints {
  const normalized = industry.toLowerCase().replace(/[^a-z-]/g, '');
  return INDUSTRY_TEMPLATE_HINTS[normalized] || DEFAULT_HINTS;
}

export function generateEmailTemplates(context: TemplateContext): EmailTemplate[] {
  const { businessName, ownerName } = context;
  const signOff = ownerName || 'The Team';

  return [
    {
      name: 'Friendly',
      subject: `Quick favor? 🙏`,
      bestFor: 'Clients you have a good relationship with',
      body: (clientName) => `Hi ${clientName},

Hope you're doing well! I'm reaching out with a small favor to ask.

I'm updating the ${businessName} website and would love to feature a testimonial from you — if you're open to it.

It doesn't need to be long! Even 2-3 sentences about your experience would be incredibly helpful. Something like:
- What made you decide to work with us?
- What results have you seen?
- Would you recommend us to others?

If you're comfortable, I can even draft something based on our work together for you to edit and approve — whatever's easiest for you.

No pressure at all if you'd rather not, I totally understand. But if you're willing, it would mean a lot to me.

Thanks for considering it!

${signOff}
${businessName}`
    },
    {
      name: 'Professional',
      subject: `Would you share your experience with ${businessName}?`,
      bestFor: 'Corporate clients, formal relationships',
      body: (clientName) => `Dear ${clientName},

I hope this message finds you well.

As we continue to grow ${businessName}, we're gathering feedback from clients we've had the privilege of working with. Your perspective would be invaluable.

Would you be willing to provide a brief testimonial about your experience? Specifically, it would be helpful to hear:

1. The challenge or goal that led you to work with us
2. The results or value you've experienced
3. Whether you would recommend our services

This can be as brief as 3-4 sentences. If you prefer, I'm happy to draft something based on our project together for your review and approval.

Your testimonial would be featured on our website and marketing materials, with full attribution to you and your organization (or anonymously, if you prefer).

Please let me know if you have any questions. Thank you for your consideration.

Best regards,

${signOff}
${businessName}`
    },
    {
      name: 'Quick Ask',
      subject: `30 seconds to help ${businessName}?`,
      bestFor: 'Busy clients, simple requests',
      body: (clientName) => `Hey ${clientName}!

Super quick ask — would you mind writing 2-3 sentences about working with ${businessName}?

I'm updating our website and a testimonial from you would really help. Here's an easy template if it helps:

"I worked with ${businessName} on [project]. The result was [outcome]. I'd recommend them because [reason]."

Totally fine if you're too busy — just thought I'd ask!

Thanks,
${signOff}`
    },
    {
      name: 'Results-Focused',
      subject: `Celebrating your results — can I share them?`,
      bestFor: 'After delivering measurable results',
      body: (clientName) => `Hi ${clientName},

I've been reflecting on the work we did together, and I'm really proud of the results we achieved.

I'd love to share this success story on the ${businessName} website. Would you be comfortable providing a brief testimonial?

A few questions that might help:
- What was your situation before we started?
- What specific results have you seen?
- What would you tell someone considering working with us?

I can also draft something based on our project for you to review — whichever is easier.

Let me know what you think!

${signOff}
${businessName}`
    }
  ];
}

export function generateRequestPageUrl(businessName: string): string {
  const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `https://pageconsult.ai/review/${slug}`;
}
