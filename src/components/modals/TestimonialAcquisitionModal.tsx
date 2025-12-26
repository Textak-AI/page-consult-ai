import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Mail, ExternalLink, Clock, Sparkles, CheckCircle, MessageSquare, Lightbulb, HelpCircle, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateEmailTemplates, generateRequestPageUrl, getIndustryHints } from '@/lib/testimonialTemplates';
import { TestimonialCoach } from '@/components/testimonials/TestimonialCoach';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface TestimonialAcquisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
  industry: string;
  ownerName?: string;
  serviceDescription?: string;
  consultationId?: string;
}

export function TestimonialAcquisitionModal({ 
  isOpen, 
  onClose, 
  businessName,
  industry,
  ownerName,
  serviceDescription,
  consultationId
}: TestimonialAcquisitionModalProps) {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [clientEmail, setClientEmail] = useState('');
  const [clientName, setClientName] = useState('');
  const [reminder, setReminder] = useState('none');
  const [showCoach, setShowCoach] = useState(false);
  const [customEmailBody, setCustomEmailBody] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sentEmails, setSentEmails] = useState<string[]>([]);
  
  const templates = generateEmailTemplates({
    businessName,
    industry,
    ownerName,
    serviceDescription
  });

  const requestPageUrl = generateRequestPageUrl(businessName);
  const hints = getIndustryHints(industry);

  const handleCopyEmail = () => {
    const emailText = customEmailBody || templates[selectedTemplate].body(clientName || '[Client Name]');
    navigator.clipboard.writeText(emailText);
    toast.success('Email copied to clipboard!');
  };

  const handleOpenEmailClient = () => {
    const subject = encodeURIComponent(templates[selectedTemplate].subject);
    const body = encodeURIComponent(customEmailBody || templates[selectedTemplate].body(clientName || '[Client Name]'));
    window.open(`mailto:${clientEmail}?subject=${subject}&body=${body}`);
  };

  const handleApplyEmail = (subject: string, body: string) => {
    setCustomEmailBody(body);
    setShowCoach(false);
    toast.success('Custom email applied! Review it below.');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(requestPageUrl);
    toast.success('Link copied!');
  };

  const handleSendEmail = async () => {
    if (!clientEmail || !clientName) {
      toast.error('Please enter client name and email');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!user?.id) {
      toast.error('Please sign in to send emails');
      return;
    }

    if (sentEmails.includes(clientEmail)) {
      toast.error('Email already sent to this recipient');
      return;
    }
    
    setIsSending(true);
    
    try {
      const emailBody = customEmailBody || templates[selectedTemplate].body(clientName);
      
      const { data, error } = await supabase.functions.invoke('send-testimonial-request', {
        body: {
          to: clientEmail,
          clientName: clientName,
          senderName: ownerName || 'The Team',
          businessName: businessName,
          emailSubject: templates[selectedTemplate].subject,
          emailBody: emailBody,
          requestPageUrl: requestPageUrl,
          userId: user.id,
          consultationId: consultationId,
        },
      });

      if (error) throw error;

      setSentEmails(prev => [...prev, clientEmail]);
      toast.success(`Email sent to ${clientName}!`, {
        description: 'They\'ll receive it in a few moments.',
      });
      
      // Clear fields for next recipient
      setClientEmail('');
      setClientName('');
      
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const alreadySent = sentEmails.includes(clientEmail);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
        <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-white">
          <MessageSquare className="w-5 h-5 text-cyan-400" />
          Get Testimonials from Happy Clients
        </DialogTitle>
        <DialogDescription className="text-slate-400">
          We'll help you ask the right way. Most clients are happy to help — they just need to be asked.
        </DialogDescription>

        <Tabs defaultValue="templates" className="mt-4">
          <TabsList className="grid w-full grid-cols-3 bg-slate-700/50">
            <TabsTrigger value="templates" className="data-[state=active]:bg-slate-600">
              <Mail className="w-4 h-4 mr-2" />
              Email Templates
            </TabsTrigger>
            <TabsTrigger value="page" className="data-[state=active]:bg-slate-600">
              <ExternalLink className="w-4 h-4 mr-2" />
              Request Page
            </TabsTrigger>
            <TabsTrigger value="tips" className="data-[state=active]:bg-slate-600">
              <Lightbulb className="w-4 h-4 mr-2" />
              What Works
            </TabsTrigger>
          </TabsList>

          {/* EMAIL TEMPLATES TAB */}
          <TabsContent value="templates" className="space-y-4 mt-4">
            {/* Template Selector */}
            <div className="flex flex-wrap gap-2">
              {templates.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedTemplate(i)}
                  className={`px-3 py-1.5 rounded-full text-sm transition ${
                    selectedTemplate === i 
                      ? 'bg-cyan-500 text-white' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>

            <p className="text-xs text-slate-500">
              Best for: {templates[selectedTemplate].bestFor}
            </p>

            {/* Personalization Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Client's Name
                </label>
                <Input
                  placeholder="Sarah"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Client's Email
                </label>
                <Input
                  placeholder="sarah@company.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Generated Email Preview */}
            <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-700">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">
                    Subject: <span className="text-slate-200">{templates[selectedTemplate].subject}</span>
                  </span>
                  {customEmailBody && (
                    <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                      Custom
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {customEmailBody && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCustomEmailBody(null)}
                      className="text-slate-500 hover:text-white text-xs"
                    >
                      Reset
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyEmail}
                    className="text-slate-400 hover:text-white"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans leading-relaxed max-h-64 overflow-y-auto">
                {customEmailBody || templates[selectedTemplate].body(clientName || '[Client Name]')}
              </pre>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Primary: Send directly */}
              <Button
                onClick={handleSendEmail}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400"
                disabled={!clientEmail || !clientName || isSending || alreadySent}
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : alreadySent ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Sent!
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Email Now
                  </>
                )}
              </Button>
              
              {/* Secondary options */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleOpenEmailClient}
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                  disabled={!clientEmail}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Open in Email App
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCopyEmail}
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Text
                </Button>
              </div>
            </div>

            {/* Sent confirmation */}
            {sentEmails.length > 0 && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2 text-green-400 text-sm font-medium mb-2">
                  <CheckCircle className="w-4 h-4" />
                  Sent to {sentEmails.length} recipient{sentEmails.length > 1 ? 's' : ''}
                </div>
                <div className="flex flex-wrap gap-2">
                  {sentEmails.map((email, i) => (
                    <span key={i} className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                      {email}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Industry Hints */}
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-700">
              <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Personalization tips for {industry}
              </h4>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-500">Result examples:</span>
                  <ul className="mt-1 space-y-0.5 text-slate-400">
                    {hints.resultExamples.map((ex, i) => (
                      <li key={i}>• {ex}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-slate-500">Common projects:</span>
                  <ul className="mt-1 space-y-0.5 text-slate-400">
                    {hints.commonProjects.map((ex, i) => (
                      <li key={i}>• {ex}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-slate-500">Value phrases:</span>
                  <ul className="mt-1 space-y-0.5 text-slate-400">
                    {hints.valuePhrases.map((ex, i) => (
                      <li key={i}>• {ex}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* REQUEST PAGE TAB */}
          <TabsContent value="page" className="space-y-4 mt-4">
            <div className="bg-slate-700/30 rounded-lg p-6 border border-slate-700 text-center">
              <div className="text-4xl mb-3">🔗</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Your Testimonial Request Page
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Send clients this link — they fill out a simple form and their testimonial 
                appears in your dashboard ready to use.
              </p>
              
              <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-3 mb-4">
                <Input
                  value={requestPageUrl}
                  readOnly
                  className="bg-transparent border-0 text-cyan-400 text-sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyLink}
                  className="shrink-0 text-slate-400 hover:text-white"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              <Button
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                onClick={() => window.open(requestPageUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Preview Request Page
              </Button>
            </div>

            {/* What the form asks */}
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-700">
              <h4 className="text-sm font-medium text-slate-300 mb-3">What clients see:</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                  "What was your situation before working with {businessName}?"
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                  "What specific results did you achieve?"
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                  "What would you tell someone considering {businessName}?"
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                  Name, title, company (optional photo)
                </li>
              </ul>
            </div>
          </TabsContent>

          {/* TIPS TAB */}
          <TabsContent value="tips" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-700">
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  ✅ Testimonials That Convert
                </h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><strong className="text-slate-300">Specific results:</strong> "Increased conversions by 40%" beats "Great service!"</li>
                  <li><strong className="text-slate-300">Before/after:</strong> "I was struggling with X, now I have Y"</li>
                  <li><strong className="text-slate-300">Credible source:</strong> Name, title, company adds trust</li>
                  <li><strong className="text-slate-300">Addresses objections:</strong> "I was skeptical at first, but..."</li>
                </ul>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-700">
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  ⏰ When to Ask
                </h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><strong className="text-slate-300">Right after a win:</strong> Just delivered results? Ask now!</li>
                  <li><strong className="text-slate-300">At project completion:</strong> Natural moment for reflection</li>
                  <li><strong className="text-slate-300">After positive feedback:</strong> "Would you mind if I quoted you?"</li>
                  <li><strong className="text-slate-300">Quarterly check-ins:</strong> "How have things been going?"</li>
                </ul>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-700">
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  💡 Pro Tips
                </h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><strong className="text-slate-300">Make it easy:</strong> Offer to draft it for their approval</li>
                  <li><strong className="text-slate-300">Be specific:</strong> Ask about a particular project or result</li>
                  <li><strong className="text-slate-300">Give context:</strong> Explain where it will be used</li>
                  <li><strong className="text-slate-300">Follow up once:</strong> A gentle reminder is fine</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Reminder Setup & Help Button */}
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowCoach(true)}
              className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              Need help deciding who to ask?
            </button>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Clock className="w-4 h-4" />
                Reminder
              </div>
              <Select value={reminder} onValueChange={setReminder}>
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="none">No reminder</SelectItem>
                  <SelectItem value="3days">In 3 days</SelectItem>
                  <SelectItem value="1week">In 1 week</SelectItem>
                  <SelectItem value="2weeks">In 2 weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Testimonial Coach */}
        <TestimonialCoach
          businessName={businessName}
          industry={industry}
          isOpen={showCoach}
          onClose={() => setShowCoach(false)}
          onApplyEmail={handleApplyEmail}
        />
      </DialogContent>
    </Dialog>
  );
}
