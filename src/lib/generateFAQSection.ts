/**
 * FAQ Section Generator
 * Creates semantic HTML and schema for FAQ content
 */

import type { FAQItem } from '@/services/intelligence/types';

export interface FAQSectionResult {
  html: string;
  schema: string;
  items: FAQItem[];
}

/**
 * Escapes HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Generates semantic HTML for FAQ section with proper microdata attributes
 */
function generateFAQHtml(faqItems: FAQItem[]): string {
  if (!faqItems || faqItems.length === 0) {
    return '';
  }

  const faqItemsHtml = faqItems
    .map((item, index) => `
    <div 
      class="faq-item border-b border-slate-700/50 last:border-b-0"
      itemscope 
      itemprop="mainEntity" 
      itemtype="https://schema.org/Question"
    >
      <button 
        class="faq-question w-full py-5 px-1 flex items-center justify-between text-left group"
        aria-expanded="false"
        aria-controls="faq-answer-${index}"
        data-faq-index="${index}"
      >
        <h3 
          class="text-lg font-medium text-foreground group-hover:text-cyan-400 transition-colors pr-4"
          itemprop="name"
        >
          ${escapeHtml(item.question)}
        </h3>
        <svg 
          class="faq-icon w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-200" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div 
        id="faq-answer-${index}"
        class="faq-answer hidden pb-5 px-1"
        itemscope 
        itemprop="acceptedAnswer" 
        itemtype="https://schema.org/Answer"
      >
        <p 
          class="text-muted-foreground leading-relaxed"
          itemprop="text"
        >
          ${escapeHtml(item.answer)}
        </p>
      </div>
    </div>`)
    .join('\n');

  return `
<section 
  class="faq-section py-16 md:py-24 px-4 bg-slate-900/50"
  itemscope 
  itemtype="https://schema.org/FAQPage"
>
  <div class="container mx-auto max-w-3xl">
    <h2 class="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
      Frequently Asked Questions
    </h2>
    <div class="space-y-0 bg-slate-800/30 rounded-2xl border border-slate-700/50 px-6">
      ${faqItemsHtml}
    </div>
  </div>
</section>

<script>
  // FAQ Accordion functionality
  document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      const answer = button.nextElementSibling;
      const icon = button.querySelector('.faq-icon');
      
      // Close all other FAQs
      document.querySelectorAll('.faq-question').forEach(btn => {
        btn.setAttribute('aria-expanded', 'false');
        btn.nextElementSibling.classList.add('hidden');
        btn.querySelector('.faq-icon').style.transform = 'rotate(0deg)';
      });
      
      // Toggle current
      if (!isExpanded) {
        button.setAttribute('aria-expanded', 'true');
        answer.classList.remove('hidden');
        icon.style.transform = 'rotate(180deg)';
      }
    });
  });
</script>`;
}

/**
 * Generates JSON-LD schema for FAQPage
 */
function generateFAQSchema(faqItems: FAQItem[]): string {
  if (!faqItems || faqItems.length === 0) {
    return '';
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
}

/**
 * Main function to generate FAQ section with HTML and schema
 */
export function generateFAQSection(faqItems: FAQItem[]): FAQSectionResult {
  return {
    html: generateFAQHtml(faqItems),
    schema: generateFAQSchema(faqItems),
    items: faqItems,
  };
}

/**
 * Generates just the FAQ items array for React components
 */
export function prepareFAQItems(faqItems: FAQItem[]): FAQItem[] {
  return faqItems.map(item => ({
    question: item.question,
    answer: item.answer,
    source: item.source,
  }));
}
