import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import StrategyBriefPDF, { StrategyBriefData } from './StrategyBriefPDF';

interface ExportBriefButtonProps {
  brief: StrategyBriefData;
  clientLogoUrl?: string;
  isAgencyTier?: boolean;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const ExportBriefButton = ({
  brief,
  clientLogoUrl,
  isAgencyTier = false,
  variant = 'outline',
  size = 'default',
  className,
}: ExportBriefButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const sanitizeFilename = (name: string): string => {
    return name
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .trim();
  };

  const handleExport = async () => {
    if (!brief.businessName) {
      toast({
        title: 'Cannot export',
        description: 'Business name is required to generate the PDF.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Generate the PDF blob
      const blob = await pdf(
        <StrategyBriefPDF
          brief={brief}
          clientLogoUrl={clientLogoUrl}
          isAgencyTier={isAgencyTier}
        />
      ).toBlob();

      // Create filename
      const date = new Date().toISOString().split('T')[0];
      const filename = `${sanitizeFilename(brief.businessName)}_Strategy_Brief_${date}.pdf`;

      // Trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Strategy Brief downloaded',
        description: `Saved as ${filename}`,
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: 'Export failed',
        description: 'There was an error generating the PDF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={isGenerating}
      className={className}
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Export Brief
        </>
      )}
    </Button>
  );
};

export default ExportBriefButton;
