import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export default function Generate() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-2xl">
        <div className="flex items-center justify-center gap-2 mb-6">
          <MessageCircle className="w-12 h-12 text-primary" />
        </div>
        
        <h1 className="text-4xl font-bold mb-4">🚧 Page Generation Launching Soon!</h1>
        
        <p className="text-lg text-muted-foreground mb-8">
          Your strategy is saved. We'll email you when the builder is ready.
        </p>
        
        <Button onClick={() => navigate("/")} size="lg">
          Return to Home
        </Button>
      </div>
    </div>
  );
}