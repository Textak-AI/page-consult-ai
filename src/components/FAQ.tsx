import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Will my page look like everyone else's?",
    answer:
      "No. PageConsult doesn't use templates — every page is generated from your specific strategy brief. Your positioning, your audience, your proof points. Two businesses in the same industry will get completely different pages because their strategies are different.",
  },
  {
    question: "I'm not a designer or copywriter. Can I still create something good?",
    answer:
      "That's exactly who this is for. You answer questions about your business in plain English — the AI handles strategy, copy, and design. If you can describe what you do and who you help, you can build a high-converting page.",
  },
  {
    question: "How is this different from Unbounce, Wix, or Carrd?",
    answer:
      "Those tools give you templates and leave the strategy to you. You still have to figure out what to say, how to position yourself, and what will actually convert. PageConsult starts with strategy — we interview you like a consultant would, then build the page around that intelligence.",
  },
  {
    question: "What if I don't know my positioning or target audience yet?",
    answer:
      "That's exactly what the consultation is for. The AI asks questions that help you articulate your value — even if you haven't put it into words before. Many users discover clarity about their own business through the process.",
  },
  {
    question: "How long does it take?",
    answer:
      "A page can be generated in just a few minutes. But the magic is in the conversation — the more thoughtful your answers, the more strategic intelligence PageConsult has to work with. A rushed 3-minute session gets you a page. A thoughtful 10-minute conversation gets you a strategy.",
  },
  {
    question: "Can I edit the page after it's generated?",
    answer:
      "Yes. You can make AI-assisted edits to any section — tweak copy, swap images, adjust messaging, or regenerate specific parts. You're never locked into the first version.",
  },
  {
    question: "I've tried AI writers before and the copy felt generic. How is this different?",
    answer:
      "Generic AI copy happens when you give generic inputs. PageConsult extracts specific details about your business — your audience's pain points, your competitive edge, your proof points — and writes copy based on that intelligence. The output is only as generic as your input.",
  },
  {
    question: "What do I get with Founding Member pricing?",
    answer:
      "Unlimited landing pages, all premium features, priority AI generation, and the price locked forever — even when we raise prices after beta. Founding Members also get direct input on the product roadmap.",
  },
];

const FAQ = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-slate-50 to-slate-100 relative overflow-hidden">
      {/* Subtle gradient orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-purple-500/[0.03] rounded-full blur-[100px]" />

      <div className="max-w-3xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-purple-600 text-sm font-semibold tracking-wide uppercase mb-3">
            FAQ
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Questions Before You Start
          </h2>
        </div>

        {/* Accordion */}
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-white rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow overflow-hidden data-[state=open]:shadow-md"
            >
              <AccordionTrigger className="w-full px-5 py-4 text-left gap-4 hover:bg-slate-50 transition-colors hover:no-underline [&>svg]:text-slate-400 [&[data-state=open]>svg]:text-purple-600">
                <span className="font-medium text-slate-900 text-[15px] text-left">
                  {faq.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-4 text-slate-600 text-[15px] leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
