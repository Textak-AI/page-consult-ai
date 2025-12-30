import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to PageConsult AI
        </Link>
        
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 1, 2025</p>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-lg text-muted-foreground">
            Full privacy policy coming soon. By using PageConsult AI, you agree to use the service 
            responsibly and in accordance with applicable laws.
          </p>
          
          <div className="mt-8 p-4 bg-muted/50 rounded-lg border">
            <p className="text-sm text-muted-foreground">
              Questions about your privacy? Contact us at{" "}
              <a href="mailto:privacy@pageconsult.ai" className="text-primary hover:underline">
                privacy@pageconsult.ai
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
