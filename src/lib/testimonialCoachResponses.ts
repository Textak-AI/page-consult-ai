export interface Message {
  id: string;
  role: 'coach' | 'user';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  action?: {
    type: 'generate-email' | 'show-template' | 'set-reminder';
    data?: any;
  };
}

export const INITIAL_MESSAGE: Message = {
  id: '1',
  role: 'coach',
  content: `Hey! I'm here to help you get testimonials from your happy clients. 🎯

A few quick questions to get started:

**Do you have past clients you could reach out to?** Even 2-3 successful projects is enough to start.`,
  timestamp: new Date(),
  suggestions: [
    "Yes, I have a few in mind",
    "I'm not sure who to ask",
    "I'm a new business with no clients yet"
  ]
};

export function generateCoachResponse(
  userMessage: string, 
  businessName: string,
  industry: string,
  conversationContext?: Message[]
): Message {
  const lower = userMessage.toLowerCase();
  
  // User has clients in mind
  if (lower.includes('yes') && (lower.includes('few') || lower.includes('mind') || lower.includes('some'))) {
    return {
      id: Date.now().toString(),
      role: 'coach',
      content: `Great! Let's start with your best one. 

**Think about a client who:**
- Got clear results from working with you
- Seemed genuinely happy or grateful
- Would likely say yes to a small favor

Who comes to mind first?`,
      timestamp: new Date(),
      suggestions: [
        "Let me describe them",
        "I have someone but not sure they'd help",
        "Can you help me figure out who to ask?"
      ]
    };
  }
  
  // User is unsure who to ask
  if (lower.includes('not sure') || lower.includes("don't know") || lower.includes('figure out who')) {
    return {
      id: Date.now().toString(),
      role: 'coach',
      content: `No problem! Let's figure it out together.

**Quick brainstorm:**
- Who was your most recent successful project?
- Who has complimented your work or thanked you?
- Who referred someone else to you?

Any of those ring a bell?`,
      timestamp: new Date(),
      suggestions: [
        "Actually, yes - someone did thank me recently",
        "I got a referral once",
        "Honestly I'm drawing a blank"
      ]
    };
  }
  
  // New business / no clients
  if (lower.includes('new business') || lower.includes('no clients')) {
    return {
      id: Date.now().toString(),
      role: 'coach',
      content: `Totally understand! Here are some alternatives that work great for new businesses:

**Options:**
1. **Industry statistics** - We can add compelling data points with sources
2. **Founder credibility** - Your background and expertise
3. **Guarantees** - Money-back, satisfaction guarantee builds trust
4. **Beta testimonials** - Offer your service free to 2-3 people in exchange for feedback

Which sounds most relevant for you?`,
      timestamp: new Date(),
      suggestions: [
        "Let's use industry statistics",
        "I could offer a beta deal",
        "Tell me more about founder credibility"
      ]
    };
  }
  
  // User wants to describe a client
  if (lower.includes('describe') || lower.includes('let me tell')) {
    return {
      id: Date.now().toString(),
      role: 'coach',
      content: `Perfect! Tell me:

1. **What did you help them with?**
2. **What was the result?**
3. **How would you describe your relationship?** (formal, friendly, etc.)

I'll use this to draft a personalized ask for them.`,
      timestamp: new Date()
    };
  }

  // Someone thanked them / positive interaction
  if (lower.includes('thank') || lower.includes('complimented') || lower.includes('happy')) {
    return {
      id: Date.now().toString(),
      role: 'coach',
      content: `That's a perfect person to ask! When someone expresses gratitude, they're already in a giving mindset.

**Here's an easy approach:**

"I really appreciated your kind words about [project]. Would you mind if I shared that as a testimonial on my website?"

Often, they'll say yes on the spot. Or you can offer to write something for their approval.

Want me to help you craft the perfect ask for this person?`,
      timestamp: new Date(),
      suggestions: [
        "Yes, help me draft an ask",
        "What if they say they're too busy?",
        "I'd rather send them a form to fill out"
      ]
    };
  }

  // Referral scenario
  if (lower.includes('referral') || lower.includes('referred')) {
    return {
      id: Date.now().toString(),
      role: 'coach',
      content: `Someone who referred you is an *excellent* testimonial source! 

They've already "voted" for you by recommending you to others. That's the strongest endorsement.

**Try this approach:**

"Thanks so much for referring [person] to me! Since you've seen the results of my work firsthand, would you be willing to share a brief testimonial I could use on my website?"

This reminds them of their positive experience AND the favor they already did for you.`,
      timestamp: new Date(),
      suggestions: [
        "Draft an email for them",
        "What should I ask them to include?",
        "How long should the testimonial be?"
      ]
    };
  }

  // Drawing a blank
  if (lower.includes('blank') || lower.includes('nothing') || lower.includes("can't think")) {
    return {
      id: Date.now().toString(),
      role: 'coach',
      content: `No worries! Let's try a different angle.

**Look through these sources:**
- Email inbox - search for "thank you" or "great job"
- Any reviews you've gotten (Google, LinkedIn, etc.)
- Past invoices/contracts - remind yourself who you've worked with

Often we forget about great projects from 6-12 months ago. Those clients still remember you fondly!`,
      timestamp: new Date(),
      suggestions: [
        "I found someone in my emails!",
        "I have some LinkedIn recommendations",
        "Still nothing - what else can I do?"
      ]
    };
  }

  // User wants to draft an email
  if (lower.includes('draft') && (lower.includes('email') || lower.includes('ask'))) {
    return {
      id: Date.now().toString(),
      role: 'coach',
      content: `Here's a personalized email based on our conversation:

---

**Subject:** Quick favor from a happy client? 🙏

Hi [Client Name],

I was just thinking about the work we did together and how great it turned out.

I'm updating my ${businessName} website and would love to feature a brief testimonial from you. Would you be open to sharing 2-3 sentences about your experience?

No pressure at all if you'd rather not. But if you're willing, it would mean a lot!

Thanks for considering it,
[Your name]

---

Want me to adjust anything, or shall I apply this to your email template?`,
      timestamp: new Date(),
      suggestions: [
        "Apply this email",
        "Make it more formal",
        "Make it shorter"
      ],
      action: {
        type: 'generate-email',
        data: {
          subject: 'Quick favor from a happy client? 🙏',
          body: `Hi [Client Name],

I was just thinking about the work we did together and how great it turned out.

I'm updating my ${businessName} website and would love to feature a brief testimonial from you. Would you be open to sharing 2-3 sentences about your experience?

No pressure at all if you'd rather not. But if you're willing, it would mean a lot!

Thanks for considering it,
[Your name]`
        }
      }
    };
  }

  // Apply email action
  if (lower.includes('apply') && lower.includes('email')) {
    return {
      id: Date.now().toString(),
      role: 'coach',
      content: `Done! I've applied the email to your template. 

You can now personalize it with your client's name and send it. Good luck! 🎉

**Quick reminder:** The best time to send is early in the week (Tuesday-Wednesday), mid-morning. That's when people are most responsive.`,
      timestamp: new Date(),
      action: {
        type: 'generate-email',
        data: { apply: true }
      },
      suggestions: [
        "Thanks! Got any follow-up tips?",
        "What if they don't respond?",
        "Help me with another client"
      ]
    };
  }

  // Make it more formal
  if (lower.includes('formal')) {
    return {
      id: Date.now().toString(),
      role: 'coach',
      content: `Here's a more formal version:

---

**Subject:** Request for a Brief Testimonial

Dear [Client Name],

I hope this message finds you well.

As I update my professional materials for ${businessName}, I'm reaching out to valued clients for feedback on their experience.

If you would be willing, I would greatly appreciate a brief testimonial (2-3 sentences) about our work together. Your perspective would be invaluable.

Please let me know if you have any questions. Thank you for your consideration.

Best regards,
[Your name]

---`,
      timestamp: new Date(),
      suggestions: [
        "Apply this email",
        "Make it friendlier again",
        "Perfect, thanks!"
      ],
      action: {
        type: 'generate-email',
        data: {
          subject: 'Request for a Brief Testimonial',
          body: `Dear [Client Name],

I hope this message finds you well.

As I update my professional materials for ${businessName}, I'm reaching out to valued clients for feedback on their experience.

If you would be willing, I would greatly appreciate a brief testimonial (2-3 sentences) about our work together. Your perspective would be invaluable.

Please let me know if you have any questions. Thank you for your consideration.

Best regards,
[Your name]`
        }
      }
    };
  }

  // Make it shorter
  if (lower.includes('shorter') || lower.includes('brief')) {
    return {
      id: Date.now().toString(),
      role: 'coach',
      content: `Here's a shorter version:

---

**Subject:** Quick favor? 🙏

Hi [Client Name],

Would you write a 2-sentence testimonial about working with ${businessName}? It would really help!

No worries if you're too busy. Thanks either way!

[Your name]

---`,
      timestamp: new Date(),
      suggestions: [
        "Apply this email",
        "Maybe a bit longer",
        "Perfect!"
      ]
    };
  }

  // What if no response
  if (lower.includes("don't respond") || lower.includes('no response') || lower.includes("don't hear")) {
    return {
      id: Date.now().toString(),
      role: 'coach',
      content: `A gentle follow-up is totally fine! People are busy, not ignoring you.

**Wait 5-7 days, then try this:**

"Hi [Name], just bumping this up in case it got buried. No worries if you're too busy — I completely understand. But if you have 2 minutes, I'd really appreciate it!"

**If still no response:** Let it go. Move on to the next client. Some people just won't respond, and that's okay.`,
      timestamp: new Date(),
      suggestions: [
        "Got it, thanks!",
        "Help me ask another client",
        "How many testimonials do I need?"
      ]
    };
  }

  // How many testimonials
  if (lower.includes('how many')) {
    return {
      id: Date.now().toString(),
      role: 'coach',
      content: `**The magic number is 3.**

With 3 solid testimonials, you can:
- Show variety (different types of clients/projects)
- Prove a pattern (not just one lucky success)
- Address different objections

**But even 1 is better than 0!** Start with one, and you can always add more later.

For maximum impact, try to get testimonials from people similar to your target audience.`,
      timestamp: new Date(),
      suggestions: [
        "Makes sense!",
        "What makes a testimonial 'solid'?",
        "Help me get my first one"
      ]
    };
  }

  // Industry statistics option
  if (lower.includes('industry statistics') || lower.includes('statistics')) {
    return {
      id: Date.now().toString(),
      role: 'coach',
      content: `Great choice! Industry stats can be just as powerful as testimonials for building credibility.

I can help you add data like:
- "${industry}" market trends and growth rates
- ROI statistics from research studies
- Customer behavior data

The key is using **specific numbers from credible sources**.

Want me to suggest some stats for your industry?`,
      timestamp: new Date(),
      suggestions: [
        "Yes, suggest some stats",
        "I'll find my own stats",
        "Maybe I should try testimonials first"
      ]
    };
  }

  // Beta deal option
  if (lower.includes('beta') || lower.includes('free')) {
    return {
      id: Date.now().toString(),
      role: 'coach',
      content: `Smart strategy! Here's how to do a beta deal right:

**The offer:**
"I'm looking for 2-3 [target clients] to try my [service] at no cost, in exchange for detailed feedback and a testimonial if you're happy with the results."

**Who to approach:**
- People who've shown interest but haven't bought
- Connections who match your ideal client
- People who've engaged with your content

**Set expectations:**
- Clear timeline
- What feedback you need
- Agreement to provide testimonial if satisfied

Want help crafting your beta offer?`,
      timestamp: new Date(),
      suggestions: [
        "Yes, help me write the offer",
        "How do I find beta clients?",
        "What if the beta goes wrong?"
      ]
    };
  }

  // Founder credibility option
  if (lower.includes('credibility') || lower.includes('founder')) {
    return {
      id: Date.now().toString(),
      role: 'coach',
      content: `Founder credibility is powerful, especially for new businesses!

**Leverage your background:**
- Years of experience in the field
- Previous companies/clients you've worked with
- Certifications, education, awards
- Speaking engagements, publications
- Specific expertise or methodology

**Example credibility statement:**
"With 10+ years in [industry] and experience at [notable company], I bring enterprise-level expertise to growing businesses."

What's your background we can highlight?`,
      timestamp: new Date(),
      suggestions: [
        "Let me tell you my background",
        "I don't have impressive credentials",
        "I'd rather focus on getting real testimonials"
      ]
    };
  }
  
  // User is describing a client/project (longer message)
  if (lower.length > 80) {
    return {
      id: Date.now().toString(),
      role: 'coach',
      content: `This is really helpful! Based on what you've shared, here's a personalized approach:

**Timing:** Since they had a good experience, reach out within the next few days while it's fresh.

**Angle:** Lead with celebrating their results, then ask if they'd be willing to share their experience.

Want me to draft a custom email based on this? Or would you prefer to use one of our templates and personalize it yourself?`,
      timestamp: new Date(),
      suggestions: [
        "Draft a custom email for me",
        "I'll use a template",
        "What should I include in the email?"
      ]
    };
  }
  
  // Default / fallback
  return {
    id: Date.now().toString(),
    role: 'coach',
    content: `Got it! Tell me more about your situation and I'll help you figure out the best approach to getting testimonials.

You can also ask me things like:
- "What should I say in the email?"
- "How do I ask without being awkward?"
- "What if they say no?"`,
    timestamp: new Date(),
    suggestions: [
      "What makes a good testimonial?",
      "How do I ask without being pushy?",
      "What if I don't hear back?"
    ]
  };
}
