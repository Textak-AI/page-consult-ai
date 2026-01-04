import { BrandSettings } from '@/components/BrandSettings';
import { EmailSignatureSettings } from '@/components/settings/EmailSignatureSettings';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground mb-8">
          Manage your brand and preferences
        </p>

        <div className="space-y-8">
          <EmailSignatureSettings />
          <BrandSettings />
        </div>
      </div>
    </div>
  );
}
