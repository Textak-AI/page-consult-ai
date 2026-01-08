// Assumptive follow-up message generator
// Generates natural follow-up messages that reference discovered facts assumptively
// Like a consultant who did their homework, not a bot announcing search results

export interface CompanyResearch {
  companyName: string;
  website: string | null;
  description: string | null;
  services: string[];
  targetMarket: string | null;
  founded: string | null;
  location: string | null;
  differentiators: string[];
  publicProof: string[];
  industryPosition: string | null;
  confidence: 'low' | 'medium' | 'high';
}

interface UsableFact {
  type: 'tenure' | 'services' | 'market' | 'differentiator' | 'proof';
  fact: any;
  since?: string;
}

export function generateAssumptiveFollowUp(
  companyResearch: CompanyResearch,
  currentIndustry?: string | null
): string {
  const { companyName, services, targetMarket, founded, differentiators, publicProof, confidence } = companyResearch;
  
  // Only use facts we're confident about
  const usableFacts: UsableFact[] = [];
  
  // Tenure
  if (founded && confidence !== 'low') {
    const yearsInBusiness = new Date().getFullYear() - parseInt(founded);
    if (yearsInBusiness > 0 && yearsInBusiness < 100) {
      usableFacts.push({
        type: 'tenure',
        fact: `${yearsInBusiness} years`,
        since: founded,
      });
    }
  }
  
  // Services
  if (services.length > 0) {
    usableFacts.push({
      type: 'services',
      fact: services.slice(0, 3),
    });
  }
  
  // Target market
  if (targetMarket) {
    usableFacts.push({
      type: 'market',
      fact: targetMarket,
    });
  }
  
  // Differentiator
  if (differentiators.length > 0) {
    usableFacts.push({
      type: 'differentiator',
      fact: differentiators[0],
    });
  }
  
  // Proof points
  if (publicProof.length > 0) {
    usableFacts.push({
      type: 'proof',
      fact: publicProof[0],
    });
  }
  
  return buildAssumptiveMessage(companyName, usableFacts, confidence);
}

function buildAssumptiveMessage(
  companyName: string,
  facts: UsableFact[],
  confidence: 'low' | 'medium' | 'high'
): string {
  // Templates that reference facts assumptively (NOT "I found that...")
  
  const tenure = facts.find(f => f.type === 'tenure');
  const market = facts.find(f => f.type === 'market');
  const services = facts.find(f => f.type === 'services');
  const diff = facts.find(f => f.type === 'differentiator');
  const proof = facts.find(f => f.type === 'proof');
  
  // High confidence combinations
  if (confidence === 'high') {
    if (tenure && market) {
      return `After ${tenure.fact} in the ${market.fact} space, you've likely seen the buyer conversation shift. What's the primary objection you're hearing now that wasn't as common two years ago?`;
    }
    
    if (services && market) {
      const serviceList = services.fact as string[];
      return `${serviceList[0]} for ${market.fact} is competitive. What's the thing you do differently that your clients actually notice - not just what you say in proposals?`;
    }
    
    if (diff) {
      return `"${diff.fact}" - that's strong positioning. Is that something prospects bring up, or does it take a few conversations before they understand why it matters?`;
    }
  }
  
  // Medium confidence - frame as questions to confirm
  if (confidence === 'medium') {
    if (services && services.fact.length >= 2) {
      const serviceList = services.fact as string[];
      return `Of your core offerings - ${serviceList.slice(0, 3).join(', ')} - which one is the entry point for most clients? And which one actually drives the most value once they're working with you?`;
    }
    
    if (tenure) {
      return `Since ${tenure.since}, you've built expertise that newer competitors can't match. How do you convey that depth without sounding like you're just listing years of experience?`;
    }
    
    if (market) {
      return `In ${market.fact}, trust is everything. What's the proof point that actually moves the needle - the one thing skeptical buyers respond to?`;
    }
  }
  
  // Low confidence - acknowledge we have context but ask to confirm
  if (proof) {
    return `I noticed ${proof.fact} - that's solid credibility. What's the story behind that, and does it come up in sales conversations?`;
  }
  
  // Fallback - we have company name but limited facts
  return `Now that I have context on ${companyName}, let's get specific. What's the single biggest reason deals stall or fall through?`;
}
