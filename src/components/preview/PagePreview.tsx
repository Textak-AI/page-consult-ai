import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit, ChevronDown, Download, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExpirationTimer } from '@/components/ui/ExpirationTimer';
import { AuthWallModal } from '@/components/auth/AuthWallModal';

interface PagePreviewProps {
  pageHtml: string;
  pageId: string;
  expiresAt: string;
  isAuthenticated: boolean;
  prefillEmail?: string;
  onBack: () => void;
  onEdit: () => void;
  onPublish: () => void;
  onExport: () => void;
  onCreateAccount: (email: string, password: string) => Promise<void>;
}

export function PagePreview({
  pageHtml,
  pageId,
  expiresAt,
  isAuthenticated,
  prefillEmail,
  onBack,
  onEdit,
  onPublish,
  onExport,
  onCreateAccount
}: PagePreviewProps) {
  const [showAuthWall, setShowAuthWall] = useState(false);
  const [pendingAction, setPendingAction] = useState<'edit' | 'publish' | 'export' | null>(null);
  const [showPublishMenu, setShowPublishMenu] = useState(false);

  const handleProtectedAction = (action: 'edit' | 'publish' | 'export') => {
    if (isAuthenticated) {
      if (action === 'edit') onEdit();
      if (action === 'publish') onPublish();
      if (action === 'export') onExport();
    } else {
      setPendingAction(action);
      setShowAuthWall(true);
    }
  };

  const handleAuthSuccess = async () => {
    setShowAuthWall(false);
    if (pendingAction === 'edit') onEdit();
    if (pendingAction === 'publish') onPublish();
    if (pendingAction === 'export') onExport();
    setPendingAction(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      
      {/* Header Bar */}
      <div className="border-b border-border px-4 py-3 flex items-center justify-between bg-card/50 backdrop-blur">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <button 
            onClick={onBack}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Brief
          </button>
          <span className="text-border">|</span>
          <span className="text-foreground font-medium">Preview</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleProtectedAction('edit')}
            className="border-border text-foreground"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
          
          <div className="relative">
            <Button
              size="sm"
              onClick={() => setShowPublishMenu(!showPublishMenu)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Publish
              <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
            
            {showPublishMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-10">
                <button
                  onClick={() => { handleProtectedAction('publish'); setShowPublishMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  Publish to Web
                </button>
                <button
                  onClick={() => { handleProtectedAction('export'); setShowPublishMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export HTML
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 relative overflow-auto">
        {/* Rendered Page */}
        <iframe
          srcDoc={pageHtml}
          className="w-full h-full border-0"
          title="Page Preview"
        />
        
        {/* Watermark */}
        <div className="absolute bottom-4 right-4 px-3 py-1.5 
                        bg-card/80 backdrop-blur rounded-full
                        text-xs text-muted-foreground flex items-center gap-2
                        pointer-events-none border border-border">
          <span className="w-4 h-4 rounded bg-gradient-to-br from-primary to-secondary" />
          <span>Preview • Built with PageConsult</span>
        </div>
      </div>

      {/* Bottom CTA (for guests) */}
      {!isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-border px-4 py-4 bg-card/50 backdrop-blur"
        >
          <div className="max-w-xl mx-auto text-center">
            <ExpirationTimer expiresAt={expiresAt} />
            
            <Button
              onClick={() => setShowAuthWall(true)}
              className="mt-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground"
            >
              Save My Page — Create Free Account
            </Button>
          </div>
        </motion.div>
      )}

      {/* Auth Wall Modal */}
      <AuthWallModal
        isOpen={showAuthWall}
        onClose={() => setShowAuthWall(false)}
        onSuccess={handleAuthSuccess}
        prefillEmail={prefillEmail}
        expiresAt={expiresAt}
        onCreateAccount={onCreateAccount}
      />
    </div>
  );
}
