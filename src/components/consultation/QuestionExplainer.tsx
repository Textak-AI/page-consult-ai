import { Info, ExternalLink } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface QuestionMeta {
  insight: string;
  methodology: string;
  researchRef?: {
    title: string;
    source: string;
    url?: string;
  };
}

interface Props extends QuestionMeta {}

export function QuestionExplainer({ insight, methodology, researchRef }: Props) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            type="button"
            className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-700/50 hover:bg-slate-600/50 transition-colors ml-1.5 align-middle"
          >
            <Info className="w-2.5 h-2.5 text-slate-400" />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          align="start"
          className="max-w-xs bg-slate-800 border-slate-700 p-3"
        >
          <div className="space-y-2">
            <p className="text-xs font-medium text-cyan-400">
              {insight}
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              {methodology}
            </p>
            {researchRef && (
              <div className="pt-1 border-t border-slate-700/50">
                {researchRef.url ? (
                  <a 
                    href={researchRef.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1"
                  >
                    <span>📚</span>
                    <span>{researchRef.source}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                ) : (
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <span>📚</span>
                    <span>{researchRef.source}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Question metadata for the wizard
export const QUESTION_EXPLAINERS: Record<string, QuestionMeta> = {
  businessName: {
    insight: "Establishes brand identity and voice consistency",
    methodology: "Your business name anchors all messaging. We use it to maintain consistent brand voice across headlines, CTAs, and proof points.",
    researchRef: {
      title: "Brand Consistency & Conversion",
      source: "Nielsen Norman Group",
      url: "https://www.nngroup.com/articles/brand-recognition-memory/"
    }
  },
  
  productName: {
    insight: "Clarifies what users will see and remember",
    methodology: "If your product has a distinct name (like 'Notion' vs 'Notion Labs'), we use it in user-facing copy for clarity and brand recall.",
  },
  
  industry: {
    insight: "Unlocks industry-specific conversion patterns",
    methodology: "Different industries have different trust signals, objection patterns, and proof requirements. We tailor your page structure accordingly.",
    researchRef: {
      title: "Industry Conversion Benchmarks",
      source: "Unbounce Conversion Report",
    }
  },
  
  uniqueStrength: {
    insight: "Creates competitive differentiation in messaging",
    methodology: "Your differentiator becomes the 'So What?' answer. We weave it through headlines, features, and objection handling to make you memorable.",
    researchRef: {
      title: "Positioning Strategy",
      source: "April Dunford, Obviously Awesome",
    }
  },
  
  identitySentence: {
    insight: "Reveals authentic positioning beyond marketing speak",
    methodology: "How you describe yourself to peers often contains more truth than taglines. We use this to craft messaging that feels genuine, not salesy.",
  },
  
  idealClient: {
    insight: "Shapes language specificity and pain point framing",
    methodology: "Specific audience targeting increases conversion 2-3x over generic messaging. We use this to craft headlines that speak directly to your buyer's situation.",
    researchRef: {
      title: "Message-Market Fit",
      source: "Copyhackers Research",
    }
  },
  
  clientFrustration: {
    insight: "Drives the Problem-Solution section structure",
    methodology: "Problem-aware headlines outperform solution-first headlines by 28%. We lead with their pain, then position you as the relief.",
    researchRef: {
      title: "The PAS Framework",
      source: "Classic Copywriting Methodology",
    }
  },
  
  desiredOutcome: {
    insight: "Defines the transformation you're selling",
    methodology: "People don't buy services—they buy outcomes. We frame your offer around the end state they're trying to achieve.",
    researchRef: {
      title: "Jobs To Be Done",
      source: "Clayton Christensen",
    }
  },
  
  clientCount: {
    insight: "Builds trust signals and social proof sections",
    methodology: "Specific numbers convert 89% better than vague claims. We structure your proof points for maximum credibility.",
    researchRef: {
      title: "Social Proof in Marketing",
      source: "Cialdini, Influence",
    }
  },
  
  achievements: {
    insight: "Creates authority indicators throughout the page",
    methodology: "Awards, certifications, and press mentions reduce perceived risk. We strategically place these near decision points.",
  },
  
  testimonialText: {
    insight: "Provides authentic voice-of-customer language",
    methodology: "Real testimonials contain language that resonates with prospects. We extract key phrases to use in headlines and benefit statements.",
    researchRef: {
      title: "Voice of Customer Research",
      source: "Joanna Wiebe, Copyhackers",
    }
  },
  
  concreteProofStory: {
    insight: "Creates a specific, memorable case study",
    methodology: "Abstract claims are forgettable. Concrete stories with specific details are 22x more memorable and build trust faster.",
    researchRef: {
      title: "Story-Based Selling",
      source: "Made to Stick, Heath Brothers",
    }
  },
  
  mainOffer: {
    insight: "Structures the primary CTA and offer section",
    methodology: "Clear offer articulation reduces friction. We make sure visitors know exactly what they're getting when they take action.",
  },
  
  processDescription: {
    insight: "Reduces uncertainty about what happens next",
    methodology: "Showing a clear process reduces perceived risk by 47%. We break your approach into digestible steps.",
    researchRef: {
      title: "Reducing Purchase Anxiety",
      source: "CXL Institute Research",
    }
  },
  
  primaryGoal: {
    insight: "Determines CTA language and page structure",
    methodology: "Single clear CTA increases conversion 371% vs. multiple options. We align every section toward your one goal.",
    researchRef: {
      title: "CTA Optimization Studies",
      source: "Unbounce Conversion Benchmark",
    }
  },
  
  ctaText: {
    insight: "Crafts action-oriented button copy",
    methodology: "First-person CTAs ('Start my trial') outperform second-person ('Start your trial') by 90%. We optimize for action.",
    researchRef: {
      title: "Button Copy Testing",
      source: "ContentVerve A/B Tests",
    }
  },
  
  objectionsToOvercome: {
    insight: "Shapes FAQ and objection-handling sections",
    methodology: "Addressing objections before they arise increases conversion. We weave answers throughout the page, not just in the FAQ.",
  },
};
