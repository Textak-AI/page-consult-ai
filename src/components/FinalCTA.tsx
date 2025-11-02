import { Button } from "@/components/ui/button";

const FinalCTA = () => {
  return (
    <section className="py-20 px-6 bg-gradient-to-br from-primary to-primary/80 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
      
      <div className="container mx-auto max-w-4xl text-center relative z-10">
        <div className="animate-fade-in">
          <h2 className="text-5xl font-bold text-white mb-6">
            Ready to Build Pages That Convert?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Start with strategy. Launch with confidence.
          </p>
          
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-white/90 text-lg px-10 py-6 h-auto shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            Start Free Trial
          </Button>
          
          <p className="text-white/80 mt-4 text-sm">
            No credit card required • 14-day trial
          </p>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
