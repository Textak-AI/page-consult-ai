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
    <section id="faq" className="section-spacing bg-slate-900 relative overflow-hidden scroll-mt-16">
      {/* Subtle gradient orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />

      <div className="max-w-3xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-cyan-400 text-sm font-semibold tracking-wide uppercase mb-3">
            FAQ
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Questions Before You Start
          </h2>
        </div>

        {/* Accordion */}
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-slate-800/80 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg overflow-hidden data-[state=open]:border-purple-500/30"
            >
              <AccordionTrigger className="w-full px-5 py-4 text-left gap-4 hover:bg-white/5 transition-colors hover:no-underline [&>svg]:text-white/40 [&[data-state=open]>svg]:text-purple-400">
                <span className="font-medium text-white text-[15px] text-left">
                  {faq.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-4 text-white/60 text-[15px] leading-relaxed">
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
