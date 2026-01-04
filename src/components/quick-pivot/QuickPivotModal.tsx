import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff, Loader2, Check, Copy, ExternalLink, Send, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface QuickPivotModalProps {
  isOpen: boolean;
  onClose: () => void;
  basePageId?: string;
}

type Step = 'input' | 'generating' | 'preview' | 'success';

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  job_title: string;
  industry: string;
  context: string;
  meeting_context: string;
  custom_slug: string;
}

interface GeneratedContent {
  prospect_id: string;
  personalized_headline: string;
  personalized_subhead: string;
  personalized_cta_text: string;
  email_subject: string;
  email_body: string;
  page_url: string;
}

const INDUSTRIES = [
  { value: 'saas', label: 'SaaS / Software' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'financial-services', label: 'Financial Services' },
  { value: 'logistics', label: 'Logistics / Supply Chain' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'professional-services', label: 'Professional Services' },
  { value: 'ecommerce', label: 'E-commerce / Retail' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'education', label: 'Education' },
  { value: 'marketing', label: 'Marketing / Advertising' },
  { value: 'construction', label: 'Construction' },
  { value: 'other', label: 'Other' },
];

// Test data arrays
const TEST_FIRST_NAMES = ['Sarah', 'Michael', 'Jennifer', 'David', 'Emily', 'James', 'Amanda', 'Robert'];
const TEST_LAST_NAMES = ['Chen', 'Rodriguez', 'Patel', 'Williams', 'Kim', 'Martinez', 'Johnson', 'Thompson'];
const TEST_COMPANIES = ['Acme Corp', 'TechFlow Systems', 'Pinnacle Industries', 'Horizon Logistics', 'Summit Healthcare', 'Apex Manufacturing'];
const TEST_INDUSTRIES = ['saas', 'healthcare', 'financial-services', 'logistics', 'manufacturing', 'professional-services'];
const TEST_MEETINGS = ['SaaStr Annual 2025', 'Industry Summit', 'LinkedIn connection', 'Warm intro from Alex', 'Trade show booth', 'Webinar Q&A'];
const TEST_CONTEXTS = [
  "She's frustrated with their reporting tools, needs better visibility into delays and bottlenecks.",
  "He mentioned their CRM doesn't integrate with their warehouse system, losing deals because of it.",
  "They're scaling fast but their current solution can't handle the volume. Looking for enterprise features.",
  "Complained about spending 10+ hours weekly on manual data entry. Wants automation.",
  "Their team is distributed and collaboration tools aren't cutting it. Security is a concern too.",
  "Budget approved for Q1, actively evaluating vendors. Decision maker, not just researcher."
];

const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export default function QuickPivotModal({ isOpen, onClose, basePageId }: QuickPivotModalProps) {
  const [step, setStep] = useState<Step>('input');
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    company: '',
    job_title: '',
    industry: '',
    context: '',
    meeting_context: '',
    custom_slug: '',
  });
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [sendEmail, setSendEmail] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  // Voice input
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setFormData(prev => ({ ...prev, context: transcript }));
      };
      recog.onerror = () => setIsListening(false);
      recog.onend = () => setIsListening(false);
      recognitionRef.current = recog;
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      toast({ title: 'Voice input not supported', description: 'Your browser does not support voice input.', variant: 'destructive' });
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const isValid = formData.first_name && formData.industry && formData.context;

  const handleGenerate = async () => {
    if (!isValid) return;
    setStep('generating');

    try {
      const { data, error } = await supabase.functions.invoke('generate-prospect-pivot', {
        body: {
          ...formData,
          base_page_id: basePageId,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      setGeneratedContent({
        prospect_id: data.prospect.id,
        personalized_headline: data.personalized_headline,
        personalized_subhead: data.personalized_subhead,
        personalized_cta_text: data.personalized_cta_text,
        email_subject: data.email_subject,
        email_body: data.email_body,
        page_url: data.page_url,
      });
      setStep('preview');

    } catch (err: any) {
      console.error('Generation error:', err);
      toast({
        title: 'Generation Failed',
        description: err.message || 'Please try again',
        variant: 'destructive',
      });
      setStep('input');
    }
  };

  const handleGoLive = async () => {
    setStep('success');
    toast({ title: 'Page is live!', description: 'Your personalized page is ready to share.' });
  };

  const handleSendEmail = async () => {
    if (!formData.email || !generatedContent) {
      toast({ title: 'No email address', description: 'Please provide an email address.', variant: 'destructive' });
      return;
    }

    setIsSendingEmail(true);
    try {
      console.log('[QuickPivotModal] Sending email with:', {
        prospectId: generatedContent.prospect_id,
        pageLink: generatedContent.page_url,
      });

      const { data, error } = await supabase.functions.invoke('send-prospect-email', {
        body: {
          prospectId: generatedContent.prospect_id,
          pageLink: generatedContent.page_url,
        },
      });

      console.log('[QuickPivotModal] Edge function response:', { data, error });

      if (error) {
        // Try to extract error from response body
        const errorMsg = error.message || 'Edge function error';
        throw new Error(errorMsg);
      }
      
      if (!data?.success) {
        throw new Error(data?.error || 'Unknown error from send-prospect-email');
      }

      setEmailSent(true);
      toast({ title: 'Email sent!', description: `Email sent to ${formData.email}` });
    } catch (err: any) {
      console.error('[QuickPivotModal] Email send error:', err);
      const errorMessage = err?.message || err?.error || 'Please try again';
      toast({
        title: 'Failed to send email',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const copyLink = () => {
    if (generatedContent?.page_url) {
      navigator.clipboard.writeText(generatedContent.page_url);
      toast({ title: 'Link copied!' });
    }
  };

  const copyEmail = () => {
    if (generatedContent?.email_body) {
      navigator.clipboard.writeText(generatedContent.email_body);
      toast({ title: 'Email copied!' });
    }
  };

  const handleClose = () => {
    setStep('input');
    setFormData({
      first_name: '', last_name: '', email: '', company: '',
      job_title: '', industry: '', context: '', meeting_context: '', custom_slug: '',
    });
    setGeneratedContent(null);
    setEmailSent(false);
    onClose();
  };

  const fillTestData = () => {
    setFormData({
      first_name: pickRandom(TEST_FIRST_NAMES),
      last_name: pickRandom(TEST_LAST_NAMES),
      email: 'kyle@pageconsult.ai',
      company: pickRandom(TEST_COMPANIES),
      job_title: '',
      industry: pickRandom(TEST_INDUSTRIES),
      context: pickRandom(TEST_CONTEXTS),
      meeting_context: pickRandom(TEST_MEETINGS),
      custom_slug: '',
    });
    toast({ title: '🧪 Test data loaded' });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-background rounded-xl shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-background">
            <h2 className="text-lg font-semibold">Quick Pivot</h2>
            <div className="flex items-center gap-1">
              {step === 'input' && (
                <Button variant="ghost" size="sm" onClick={fillTestData} className="text-xs px-2">
                  🧪 Test
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {step === 'input' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium">First Name *</Label>
                    <Input
                      value={formData.first_name}
                      onChange={e => setFormData(p => ({ ...p, first_name: e.target.value }))}
                      placeholder="Sarah"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Last Name</Label>
                    <Input
                      value={formData.last_name}
                      onChange={e => setFormData(p => ({ ...p, last_name: e.target.value }))}
                      placeholder="Chen"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    placeholder="sarah@acme.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium">Company</Label>
                    <Input
                      value={formData.company}
                      onChange={e => setFormData(p => ({ ...p, company: e.target.value }))}
                      placeholder="Acme Corp"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Industry *</Label>
                    <Select value={formData.industry} onValueChange={v => setFormData(p => ({ ...p, industry: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map(ind => (
                          <SelectItem key={ind.value} value={ind.value}>{ind.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Where did you meet?</Label>
                  <Input
                    value={formData.meeting_context}
                    onChange={e => setFormData(p => ({ ...p, meeting_context: e.target.value }))}
                    placeholder="SaaStr Annual 2025"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">What did you talk about? *</Label>
                  <div className="relative">
                    <Textarea
                      value={formData.context}
                      onChange={e => setFormData(p => ({ ...p, context: e.target.value }))}
                      placeholder="She's frustrated with their reporting tools, needs better visibility into delays..."
                      rows={4}
                      className="pr-12"
                    />
                    <button
                      type="button"
                      onClick={toggleVoice}
                      className={`absolute right-2 bottom-2 p-2 rounded-full transition-all ${
                        isListening ? 'bg-destructive text-destructive-foreground animate-pulse' : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                  </div>
                  {isListening && (
                    <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                      <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                      Listening...
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium">Custom URL (optional)</Label>
                  <div 
                    className="flex items-center border rounded-lg overflow-hidden"
                    onMouseDown={e => e.stopPropagation()}
                  >
                    <span className="px-3 py-2 bg-muted text-muted-foreground text-sm">/p/</span>
                    <Input
                      value={formData.custom_slug}
                      onChange={e => setFormData(p => ({ ...p, custom_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                      placeholder="acme-proposal"
                      className="border-0 focus-visible:ring-0"
                      onMouseDown={e => e.stopPropagation()}
                    />
                  </div>
                </div>

                <Button onClick={handleGenerate} disabled={!isValid} className="w-full">
                  Generate Preview <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {step === 'generating' && (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-muted-foreground mt-4">Tailoring your message...</p>
              </div>
            )}

            {step === 'preview' && generatedContent && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Personalized Headline</p>
                  <p className="font-semibold text-lg">{generatedContent.personalized_headline}</p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Personalized Subhead</p>
                  <p>{generatedContent.personalized_subhead}</p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">CTA</p>
                  <span className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
                    {generatedContent.personalized_cta_text}
                  </span>
                </div>

                {formData.email && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-3 bg-muted">
                      <span className="text-sm font-medium">Email Preview</span>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={copyEmail}>
                          <Copy className="w-4 h-4 mr-1" /> Copy
                        </Button>
                        <Label className="flex items-center gap-2 cursor-pointer">
                          <Switch checked={sendEmail} onCheckedChange={setSendEmail} />
                          <span className="text-sm">Send</span>
                        </Label>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-muted-foreground">To: {formData.email}</p>
                      <p className="font-medium mt-1">{generatedContent.email_subject}</p>
                      <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{generatedContent.email_body}</p>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200 font-mono break-all">{generatedContent.page_url}</p>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleGoLive} className="flex-1">
                    Go Live <Send className="w-4 h-4 ml-2" />
                  </Button>
                  {formData.email && sendEmail && (
                    <Button 
                      variant="outline" 
                      onClick={handleSendEmail} 
                      disabled={isSendingEmail}
                      className="flex-1"
                    >
                      {isSendingEmail ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                      ) : (
                        <><Send className="w-4 h-4 mr-2" /> Send Email</>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {step === 'success' && generatedContent && (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">You're all set!</h3>
                <p className="text-muted-foreground mb-6">Page is live and ready to share.</p>

                <div className="w-full p-4 bg-muted rounded-lg mb-6">
                  <p className="font-mono text-sm break-all">{generatedContent.page_url}</p>
                </div>

                <div className="flex gap-3 w-full">
                  <Button variant="outline" onClick={copyLink} className="flex-1">
                    <Copy className="w-4 h-4 mr-2" /> Copy
                  </Button>
                  <Button variant="outline" onClick={() => window.open(generatedContent.page_url, '_blank')} className="flex-1">
                    <ExternalLink className="w-4 h-4 mr-2" /> View
                  </Button>
                </div>

                {formData.email && !emailSent && (
                  <Button 
                    onClick={handleSendEmail} 
                    disabled={isSendingEmail}
                    className="w-full mt-3"
                  >
                    {isSendingEmail ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending Email...</>
                    ) : (
                      <><Send className="w-4 h-4 mr-2" /> Send Email to {formData.first_name}</>
                    )}
                  </Button>
                )}

                {emailSent && (
                  <div className="w-full mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
                    <p className="text-sm text-green-800 dark:text-green-200 flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" /> Email sent to {formData.email}
                    </p>
                  </div>
                )}

                <Button onClick={handleClose} variant="outline" className="w-full mt-3">Done</Button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
