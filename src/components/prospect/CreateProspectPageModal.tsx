import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, Copy, ExternalLink } from 'lucide-react';

interface CreateProspectPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceDemoSessionId?: string;
  sourceLandingPageId?: string;
  onSuccess?: (prospectPage: any) => void;
}

export const CreateProspectPageModal = ({
  isOpen,
  onClose,
  sourceDemoSessionId,
  sourceLandingPageId,
  onSuccess,
}: CreateProspectPageModalProps) => {
  const { toast } = useToast();

  const [generating, setGenerating] = useState(false);
  const [generatedPage, setGeneratedPage] = useState<{
    id: string;
    slug: string;
    url: string;
    status: string;
  } | null>(null);
  
  const [formData, setFormData] = useState({
    prospectName: '',
    prospectCompany: '',
    prospectEmail: '',
    prospectTitle: '',
    prospectIndustry: '',
    prospectCompanySize: '',
    dealStage: 'warm' as 'cold' | 'warm' | 'proposal' | 'negotiation',
    knownPainPoints: '',
    competitiveSituation: '',
    customInstructions: '',
  });

  const handleSubmit = async () => {
    if (!formData.prospectName || !formData.prospectCompany) {
      toast({
        title: 'Missing required fields',
        description: 'Please enter prospect name and company.',
        variant: 'destructive',
      });
      return;
    }

    setGenerating(true);
    try {
      const response = await supabase.functions.invoke('generate-prospect-page', {
        body: {
          sourceDemoSessionId,
          sourceLandingPageId,
          prospectName: formData.prospectName,
          prospectCompany: formData.prospectCompany,
          prospectEmail: formData.prospectEmail || undefined,
          prospectTitle: formData.prospectTitle || undefined,
          prospectIndustry: formData.prospectIndustry || undefined,
          prospectCompanySize: formData.prospectCompanySize || undefined,
          dealStage: formData.dealStage,
          knownPainPoints: formData.knownPainPoints
            ? formData.knownPainPoints.split('\n').filter((p) => p.trim())
            : undefined,
          competitiveSituation: formData.competitiveSituation || undefined,
          customInstructions: formData.customInstructions || undefined,
        },
      });

      if (response.error) throw response.error;

      setGeneratedPage(response.data.prospectPage);
      
      toast({
        title: 'Prospect page created!',
        description: `Page for ${formData.prospectCompany} is ready.`,
      });

      onSuccess?.(response.data.prospectPage);
    } catch (error: any) {
      console.error('Error creating prospect page:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create prospect page',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyUrl = () => {
    if (generatedPage?.url) {
      navigator.clipboard.writeText(generatedPage.url);
      toast({
        title: 'URL copied!',
        description: 'The prospect page URL has been copied to your clipboard.',
      });
    }
  };

  const handleClose = () => {
    setGeneratedPage(null);
    setFormData({
      prospectName: '',
      prospectCompany: '',
      prospectEmail: '',
      prospectTitle: '',
      prospectIndustry: '',
      prospectCompanySize: '',
      dealStage: 'warm',
      knownPainPoints: '',
      competitiveSituation: '',
      customInstructions: '',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-slate-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Create Prospect Page
          </DialogTitle>
          <p className="text-sm text-slate-400">
            Generate a personalized landing page for a specific prospect.
          </p>
        </DialogHeader>

        {generatedPage ? (
          <div className="py-6 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Page Created!</h3>
              <p className="text-slate-400 text-sm">
                Your personalized page for {formData.prospectCompany} is ready.
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 border border-white/10">
              <Label className="text-xs text-slate-500 uppercase tracking-wider">Page URL</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  value={generatedPage.url}
                  readOnly
                  className="bg-slate-700/50 border-white/10 text-white text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyUrl}
                  className="shrink-0 border-white/10 hover:bg-white/10"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  asChild
                  className="shrink-0 border-white/10 hover:bg-white/10"
                >
                  <a href={generatedPage.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Status: <span className="text-yellow-400 capitalize">{generatedPage.status}</span>
                {' '}- Publish to make it live
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} className="border-white/10">
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Prospect Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-cyan-400 uppercase tracking-wider">
                Prospect Information
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prospectName" className="text-slate-300">
                    Prospect Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="prospectName"
                    placeholder="Kyle Chen"
                    value={formData.prospectName}
                    onChange={(e) => setFormData((f) => ({ ...f, prospectName: e.target.value }))}
                    className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prospectCompany" className="text-slate-300">
                    Company Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="prospectCompany"
                    placeholder="Acme Industrial"
                    value={formData.prospectCompany}
                    onChange={(e) => setFormData((f) => ({ ...f, prospectCompany: e.target.value }))}
                    className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prospectTitle" className="text-slate-300">
                    Title
                  </Label>
                  <Input
                    id="prospectTitle"
                    placeholder="VP of Operations"
                    value={formData.prospectTitle}
                    onChange={(e) => setFormData((f) => ({ ...f, prospectTitle: e.target.value }))}
                    className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prospectEmail" className="text-slate-300">
                    Email
                  </Label>
                  <Input
                    id="prospectEmail"
                    placeholder="kyle@acmeindustrial.com"
                    value={formData.prospectEmail}
                    onChange={(e) => setFormData((f) => ({ ...f, prospectEmail: e.target.value }))}
                    className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* Targeting Context */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-cyan-400 uppercase tracking-wider">
                Targeting Context
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dealStage" className="text-slate-300">
                    Deal Stage <span className="text-red-400">*</span>
                  </Label>
                  <Select
                    value={formData.dealStage}
                    onValueChange={(value: 'cold' | 'warm' | 'proposal' | 'negotiation') =>
                      setFormData((f) => ({ ...f, dealStage: value }))
                    }
                  >
                    <SelectTrigger className="bg-slate-800/50 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/10">
                      <SelectItem value="cold">Cold</SelectItem>
                      <SelectItem value="warm">Warm</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="negotiation">Negotiation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prospectIndustry" className="text-slate-300">
                    Industry
                  </Label>
                  <Input
                    id="prospectIndustry"
                    placeholder="Manufacturing"
                    value={formData.prospectIndustry}
                    onChange={(e) => setFormData((f) => ({ ...f, prospectIndustry: e.target.value }))}
                    className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="knownPainPoints" className="text-slate-300">
                  Known Pain Points <span className="text-slate-500">(one per line)</span>
                </Label>
                <Textarea
                  id="knownPainPoints"
                  placeholder="High equipment downtime&#10;Difficulty tracking maintenance schedules"
                  value={formData.knownPainPoints}
                  onChange={(e) => setFormData((f) => ({ ...f, knownPainPoints: e.target.value }))}
                  className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="competitiveSituation" className="text-slate-300">
                  Competitive Situation
                </Label>
                <Input
                  id="competitiveSituation"
                  placeholder="Currently using ServiceMax, unhappy with pricing"
                  value={formData.competitiveSituation}
                  onChange={(e) => setFormData((f) => ({ ...f, competitiveSituation: e.target.value }))}
                  className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customInstructions" className="text-slate-300">
                  Custom Instructions <span className="text-slate-500">(optional)</span>
                </Label>
                <Textarea
                  id="customInstructions"
                  placeholder="Emphasize our 24/7 support - they mentioned this is important"
                  value={formData.customInstructions}
                  onChange={(e) => setFormData((f) => ({ ...f, customInstructions: e.target.value }))}
                  className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 min-h-[60px]"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleClose} className="border-white/10">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={generating || !formData.prospectName || !formData.prospectCompany}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-400 hover:to-purple-400"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Prospect Page
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateProspectPageModal;
