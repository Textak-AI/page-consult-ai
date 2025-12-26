import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, Star, Sparkles, PenLine, 
  MousePointerClick, FileText, ChevronRight,
  Lightbulb, Quote
} from 'lucide-react';
import { toast } from 'sonner';

// ============================================
// INDUSTRY-SPECIFIC CONTENT
// ============================================

interface IndustryContent {
  challenges: string[];
  results: string[];
  qualities: string[];
  recommendations: string[];
  madLibsTemplate: {
    before: string[];
    after: string[];
    would: string[];
  };
}

const INDUSTRY_CONTENT: Record<string, IndustryContent> = {
  'consulting': {
    challenges: [
      'unclear strategy',
      'team alignment issues', 
      'growth plateau',
      'operational inefficiencies',
      'market positioning'
    ],
    results: [
      'gained strategic clarity',
      'aligned our team around a clear vision',
      'identified new growth opportunities',
      'streamlined our operations',
      'improved our market positioning'
    ],
    qualities: [
      'strategic thinking',
      'ability to simplify complex problems',
      'genuine partnership approach',
      'actionable recommendations',
      'deep industry knowledge'
    ],
    recommendations: [
      'wants a true strategic partner',
      'needs clarity on their direction',
      'is ready to level up their business',
      'values expertise and results'
    ],
    madLibsTemplate: {
      before: ['growing our business', 'defining our strategy', 'aligning our team', 'scaling operations'],
      after: ['clear roadmap', 'actionable strategy', 'aligned team', 'growth plan'],
      would: ['strategic guidance', 'business clarity', 'a trusted advisor', 'real results']
    }
  },
  'software': {
    challenges: [
      'manual processes',
      'disconnected systems',
      'scaling issues',
      'technical debt',
      'user adoption'
    ],
    results: [
      'automated key workflows',
      'integrated our systems',
      'scaled without issues',
      'reduced technical debt',
      'improved user adoption significantly'
    ],
    qualities: [
      'technical excellence',
      'clear communication',
      'on-time delivery',
      'proactive problem-solving',
      'attention to detail'
    ],
    recommendations: [
      'needs reliable software development',
      'wants a technical partner who communicates well',
      'is looking for quality over shortcuts',
      'values long-term partnerships'
    ],
    madLibsTemplate: {
      before: ['managing our data', 'automating workflows', 'scaling our platform', 'integrating systems'],
      after: ['streamlined process', 'automated workflow', 'scalable solution', 'integrated platform'],
      would: ['quality development', 'reliable delivery', 'technical expertise', 'a true partner']
    }
  },
  'marketing': {
    challenges: [
      'low conversion rates',
      'unclear messaging',
      'inconsistent branding',
      'reaching our audience',
      'measuring ROI'
    ],
    results: [
      'increased conversions significantly',
      'clarified our brand message',
      'consistent brand presence',
      'reached our target audience',
      'clear visibility into ROI'
    ],
    qualities: [
      'creative excellence',
      'data-driven approach',
      'brand understanding',
      'strategic thinking',
      'responsive communication'
    ],
    recommendations: [
      'wants marketing that actually converts',
      'needs help clarifying their message',
      'is ready to invest in their brand',
      'values creativity backed by data'
    ],
    madLibsTemplate: {
      before: ['converting visitors', 'communicating our value', 'standing out', 'reaching customers'],
      after: ['higher conversions', 'clear messaging', 'strong brand', 'engaged audience'],
      would: ['results-driven marketing', 'creative strategy', 'brand expertise', 'measurable growth']
    }
  },
  'default': {
    challenges: [
      'achieving our goals',
      'solving a key problem',
      'finding the right partner',
      'getting quality results',
      'meeting deadlines'
    ],
    results: [
      'achieved our objectives',
      'solved the problem effectively',
      'found a reliable partner',
      'received excellent quality',
      'delivered on time'
    ],
    qualities: [
      'professionalism',
      'expertise',
      'communication',
      'reliability',
      'quality of work'
    ],
    recommendations: [
      'wants quality results',
      'values professionalism',
      'needs a reliable partner',
      'is looking for expertise'
    ],
    madLibsTemplate: {
      before: ['solving our challenge', 'achieving our goals', 'finding help', 'getting results'],
      after: ['solution', 'achievement', 'results', 'outcome'],
      would: ['professional help', 'quality work', 'reliable service', 'great results']
    }
  }
};

// ============================================
// COMPONENT
// ============================================

type InputMode = 'madlibs' | 'guided' | 'freeform';

export default function TestimonialRequest() {
  const { businessSlug } = useParams();
  const [searchParams] = useSearchParams();
  
  // Get context from URL
  const businessName = searchParams.get('b') || 
    businessSlug?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 
    'This Business';
  const industry = searchParams.get('i') || 'default';
  const projectContext = searchParams.get('p') || '';
  
  const content = INDUSTRY_CONTENT[industry] || INDUSTRY_CONTENT['default'];
  
  // State
  const [mode, setMode] = useState<InputMode>('madlibs');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Mad-libs state
  const [madLibs, setMadLibs] = useState({
    before: '',
    beforeCustom: '',
    after: '',
    afterCustom: '',
    quality: '',
    qualityCustom: '',
    would: '',
    wouldCustom: ''
  });
  
  // Guided state
  const [guided, setGuided] = useState({
    challenge: '',
    results: [] as string[],
    qualities: [] as string[],
    recommendation: ''
  });
  
  // Free-form state
  const [freeForm, setFreeForm] = useState({
    testimonial: ''
  });
  
  // Personal info (shared across modes)
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    title: '',
    photo: null as File | null
  });

  // Get value for mad-libs (custom or selected)
  const getMadLibValue = (field: 'before' | 'after' | 'quality' | 'would') => {
    const value = madLibs[field];
    const customValue = madLibs[`${field}Custom` as keyof typeof madLibs];
    return value === 'custom' ? customValue : value;
  };

  // Generate final testimonial text based on mode
  const generateTestimonial = () => {
    switch (mode) {
      case 'madlibs':
        const before = getMadLibValue('before');
        const after = getMadLibValue('after');
        const quality = getMadLibValue('quality');
        const would = getMadLibValue('would');
        if (!before || !after || !quality || !would) return '';
        return `Before working with ${businessName}, I was struggling with ${before}. Now I have ${after}. What impressed me most was their ${quality}. I'd recommend them to anyone who needs ${would}.`;
      
      case 'guided':
        const resultsText = guided.results.join(', ');
        const qualitiesText = guided.qualities.join(' and ');
        const parts = [];
        if (guided.challenge) parts.push(guided.challenge);
        if (resultsText) parts.push(`After working with ${businessName}, we ${resultsText}.`);
        if (qualitiesText) parts.push(`Their ${qualitiesText} made all the difference.`);
        if (guided.recommendation) parts.push(guided.recommendation);
        return parts.join(' ');
      
      case 'freeform':
        return freeForm.testimonial;
      
      default:
        return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!personalInfo.name) {
      toast.error('Please enter your name');
      return;
    }
    
    const testimonial = generateTestimonial();
    if (!testimonial || testimonial.length < 20) {
      toast.error('Please complete the testimonial');
      return;
    }
    
    setIsSubmitting(true);
    
    // TODO: Submit to Supabase
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSubmitted(true);
    setIsSubmitting(false);
  };

  // Success screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800 rounded-2xl p-8 max-w-lg text-center border border-slate-700"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Thank You!</h1>
          <p className="text-slate-400 mb-6">
            Your testimonial has been submitted. {businessName} really appreciates you taking the time!
          </p>
          <div className="bg-slate-700/50 rounded-xl p-5 text-left">
            <Quote className="w-5 h-5 text-cyan-400 mb-2" />
            <p className="text-slate-300 italic text-sm leading-relaxed">
              "{generateTestimonial()}"
            </p>
            <p className="text-slate-500 text-sm mt-3">— {personalInfo.name}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4">
      <div className="max-w-xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-6 h-6 text-amber-400 fill-amber-400" />
            ))}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Share Your Experience
          </h1>
          <p className="text-lg text-slate-400">
            with {businessName}
          </p>
          {projectContext && (
            <p className="text-sm text-cyan-400 mt-2">
              Re: {projectContext}
            </p>
          )}
        </motion.div>

        {/* Mode Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex bg-slate-800 rounded-xl p-1.5 mb-6 border border-slate-700"
        >
          <button
            type="button"
            onClick={() => setMode('madlibs')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition ${
              mode === 'madlibs' 
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Mad-Libs</span>
            <span className="text-xs opacity-75">(Quick)</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('guided')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition ${
              mode === 'guided' 
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <MousePointerClick className="w-4 h-4" />
            <span>Guided</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('freeform')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition ${
              mode === 'freeform' 
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <PenLine className="w-4 h-4" />
            <span>Free-Form</span>
          </button>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
        >
          
          {/* ========== MAD-LIBS MODE ========== */}
          {mode === 'madlibs' && (
            <div className="space-y-6">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-medium text-white">Fill in the Blanks</h3>
                </div>
                
                <div className="space-y-4 text-slate-300 leading-relaxed">
                  {/* Sentence 1 */}
                  <p className="flex flex-wrap items-center gap-2">
                    <span>Before working with {businessName}, I was struggling with</span>
                    <select
                      value={madLibs.before}
                      onChange={(e) => setMadLibs(prev => ({ ...prev, before: e.target.value }))}
                      className="bg-slate-700 border-b-2 border-cyan-500 text-cyan-400 
                                 px-3 py-1.5 rounded-t appearance-none cursor-pointer
                                 focus:outline-none focus:border-cyan-400"
                    >
                      <option value="">select one...</option>
                      {content.madLibsTemplate.before.map((option, i) => (
                        <option key={i} value={option}>{option}</option>
                      ))}
                      <option value="custom">✏️ Write my own...</option>
                    </select>
                    {madLibs.before === 'custom' && (
                      <Input
                        placeholder="describe your challenge..."
                        value={madLibs.beforeCustom}
                        onChange={(e) => setMadLibs(prev => ({ ...prev, beforeCustom: e.target.value }))}
                        className="bg-slate-700 border-cyan-500 text-cyan-400 w-48"
                      />
                    )}
                    <span>.</span>
                  </p>
                  
                  {/* Sentence 2 */}
                  <p className="flex flex-wrap items-center gap-2">
                    <span>Now I have</span>
                    <select
                      value={madLibs.after}
                      onChange={(e) => setMadLibs(prev => ({ ...prev, after: e.target.value }))}
                      className="bg-slate-700 border-b-2 border-purple-500 text-purple-400 
                                 px-3 py-1.5 rounded-t appearance-none cursor-pointer
                                 focus:outline-none"
                    >
                      <option value="">select one...</option>
                      {content.madLibsTemplate.after.map((option, i) => (
                        <option key={i} value={option}>{option}</option>
                      ))}
                      <option value="custom">✏️ Write my own...</option>
                    </select>
                    {madLibs.after === 'custom' && (
                      <Input
                        placeholder="describe your result..."
                        value={madLibs.afterCustom}
                        onChange={(e) => setMadLibs(prev => ({ ...prev, afterCustom: e.target.value }))}
                        className="bg-slate-700 border-purple-500 text-purple-400 w-48"
                      />
                    )}
                    <span>.</span>
                  </p>
                  
                  {/* Sentence 3 */}
                  <p className="flex flex-wrap items-center gap-2">
                    <span>What impressed me most was their</span>
                    <select
                      value={madLibs.quality}
                      onChange={(e) => setMadLibs(prev => ({ ...prev, quality: e.target.value }))}
                      className="bg-slate-700 border-b-2 border-green-500 text-green-400 
                                 px-3 py-1.5 rounded-t appearance-none cursor-pointer
                                 focus:outline-none"
                    >
                      <option value="">select one...</option>
                      {content.qualities.map((option, i) => (
                        <option key={i} value={option}>{option}</option>
                      ))}
                      <option value="custom">✏️ Write my own...</option>
                    </select>
                    {madLibs.quality === 'custom' && (
                      <Input
                        placeholder="describe what impressed you..."
                        value={madLibs.qualityCustom}
                        onChange={(e) => setMadLibs(prev => ({ ...prev, qualityCustom: e.target.value }))}
                        className="bg-slate-700 border-green-500 text-green-400 w-48"
                      />
                    )}
                    <span>.</span>
                  </p>
                  
                  {/* Sentence 4 */}
                  <p className="flex flex-wrap items-center gap-2">
                    <span>I'd recommend them to anyone who needs</span>
                    <select
                      value={madLibs.would}
                      onChange={(e) => setMadLibs(prev => ({ ...prev, would: e.target.value }))}
                      className="bg-slate-700 border-b-2 border-amber-500 text-amber-400 
                                 px-3 py-1.5 rounded-t appearance-none cursor-pointer
                                 focus:outline-none"
                    >
                      <option value="">select one...</option>
                      {content.madLibsTemplate.would.map((option, i) => (
                        <option key={i} value={option}>{option}</option>
                      ))}
                      <option value="custom">✏️ Write my own...</option>
                    </select>
                    {madLibs.would === 'custom' && (
                      <Input
                        placeholder="describe who should hire them..."
                        value={madLibs.wouldCustom}
                        onChange={(e) => setMadLibs(prev => ({ ...prev, wouldCustom: e.target.value }))}
                        className="bg-slate-700 border-amber-500 text-amber-400 w-48"
                      />
                    )}
                    <span>.</span>
                  </p>
                </div>
              </div>
              
              {/* Preview */}
              {generateTestimonial() && (
                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Quote className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-slate-400 uppercase tracking-wider">Preview</span>
                  </div>
                  <p className="text-slate-300 italic">
                    "{generateTestimonial()}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ========== GUIDED MODE ========== */}
          {mode === 'guided' && (
            <div className="space-y-6">
              
              {/* Challenge */}
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <label className="block text-sm font-medium text-white mb-3">
                  What challenge were you facing?
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {content.challenges.map((challenge, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setGuided(prev => ({ 
                        ...prev, 
                        challenge: `We were dealing with ${challenge}.` 
                      }))}
                      className={`text-sm px-4 py-2 rounded-full transition border ${
                        guided.challenge.includes(challenge)
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                          : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {challenge}
                    </button>
                  ))}
                </div>
                <Textarea
                  value={guided.challenge}
                  onChange={(e) => setGuided(prev => ({ ...prev, challenge: e.target.value }))}
                  placeholder="Or write your own..."
                  className="bg-slate-700 border-slate-600 text-white min-h-20"
                />
              </div>

              {/* Results */}
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <label className="block text-sm font-medium text-white mb-1">
                  What results did you achieve?
                </label>
                <p className="text-xs text-slate-400 mb-3">Select all that apply</p>
                <div className="flex flex-wrap gap-2">
                  {content.results.map((result, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setGuided(prev => ({
                          ...prev,
                          results: prev.results.includes(result)
                            ? prev.results.filter(r => r !== result)
                            : [...prev.results, result]
                        }));
                      }}
                      className={`text-sm px-4 py-2 rounded-full transition border ${
                        guided.results.includes(result)
                          ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                          : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {guided.results.includes(result) && '✓ '}
                      {result}
                    </button>
                  ))}
                </div>
              </div>

              {/* Qualities */}
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <label className="block text-sm font-medium text-white mb-1">
                  What stood out about working with them?
                </label>
                <p className="text-xs text-slate-400 mb-3">Select up to 3</p>
                <div className="flex flex-wrap gap-2">
                  {content.qualities.map((quality, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setGuided(prev => ({
                          ...prev,
                          qualities: prev.qualities.includes(quality)
                            ? prev.qualities.filter(q => q !== quality)
                            : prev.qualities.length < 3 
                              ? [...prev.qualities, quality]
                              : prev.qualities
                        }));
                      }}
                      className={`text-sm px-4 py-2 rounded-full transition border ${
                        guided.qualities.includes(quality)
                          ? 'bg-green-500/20 border-green-500 text-green-300'
                          : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {guided.qualities.includes(quality) && '✓ '}
                      {quality}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recommendation */}
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <label className="block text-sm font-medium text-white mb-3">
                  Who would you recommend them to?
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {content.recommendations.map((rec, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setGuided(prev => ({ 
                        ...prev, 
                        recommendation: `I'd recommend them to anyone who ${rec}.` 
                      }))}
                      className={`text-sm px-4 py-2 rounded-full transition border ${
                        guided.recommendation.includes(rec)
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      Anyone who {rec}
                    </button>
                  ))}
                </div>
                <Input
                  value={guided.recommendation}
                  onChange={(e) => setGuided(prev => ({ ...prev, recommendation: e.target.value }))}
                  placeholder="Or write your own recommendation..."
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              
              {/* Preview */}
              {generateTestimonial() && (
                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Quote className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-slate-400 uppercase tracking-wider">Preview</span>
                  </div>
                  <p className="text-slate-300 italic">
                    "{generateTestimonial()}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ========== FREE-FORM MODE ========== */}
          {mode === 'freeform' && (
            <div className="space-y-6">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <label className="block text-sm font-medium text-white mb-2">
                  Share your experience in your own words
                </label>
                
                {/* Inspiration prompts */}
                <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span className="text-sm text-slate-300">Need inspiration?</span>
                  </div>
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li>• What problem did they help you solve?</li>
                    <li>• What results did you see?</li>
                    <li>• What made them great to work with?</li>
                    <li>• Would you recommend them? Why?</li>
                  </ul>
                </div>
                
                <Textarea
                  value={freeForm.testimonial}
                  onChange={(e) => setFreeForm({ testimonial: e.target.value })}
                  placeholder="Working with them was..."
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 min-h-40"
                />
                
                <p className="text-xs text-slate-500 mt-2">
                  💡 Tip: Specific details and numbers make testimonials more powerful
                </p>
              </div>
            </div>
          )}

          {/* ========== PERSONAL INFO (All modes) ========== */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mt-6">
            <h3 className="font-medium text-white mb-4">Your Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Your Name *</label>
                <Input
                  value={personalInfo.name}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Sarah Johnson"
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Title / Company</label>
                <Input
                  value={personalInfo.title}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="CEO, Acme Corp"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-slate-400 mb-1">Photo (optional)</label>
              <p className="text-xs text-slate-500 mb-2">
                Testimonials with photos are 3x more trusted
              </p>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setPersonalInfo(prev => ({ ...prev, photo: e.target.files?.[0] || null }))}
                className="bg-slate-700 border-slate-600 text-slate-400"
              />
            </div>
          </div>

          {/* Submit */}
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-purple-500 
                       hover:opacity-90 py-6 text-lg font-medium"
          >
            {isSubmitting ? (
              'Submitting...'
            ) : (
              <>
                Submit Testimonial
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          <p className="text-xs text-slate-500 text-center mt-4">
            By submitting, you agree to let {businessName} use your testimonial 
            on their website and marketing materials.
          </p>
        </motion.form>
      </div>
    </div>
  );
}
