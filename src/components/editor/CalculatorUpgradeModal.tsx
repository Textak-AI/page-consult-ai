import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface CalculatorUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCalculator: (config: { type: string; inputs: string[] }) => void;
  industry?: string;
}

export function CalculatorUpgradeModal({
  open,
  onOpenChange,
  onAddCalculator,
  industry = "b2b_saas"
}: CalculatorUpgradeModalProps) {
  const [step, setStep] = useState<"offer" | "type" | "inputs">("offer");
  const [calculatorType, setCalculatorType] = useState("");
  const [selectedInputs, setSelectedInputs] = useState<string[]>([]);

  const handleAccept = () => {
    setStep("type");
  };

  const handleTypeSelect = (type: string) => {
    setCalculatorType(type);
    setStep("inputs");
  };

  const handleComplete = () => {
    onAddCalculator({
      type: calculatorType,
      inputs: selectedInputs
    });
    onOpenChange(false);
    // Reset for next time
    setStep("offer");
    setCalculatorType("");
    setSelectedInputs([]);
  };

  const getCalculatorTypes = () => {
    if (industry === "professional") {
      return [
        { id: "cost", title: "Project Cost Estimate", icon: "💰", description: "Help visitors estimate project costs" },
        { id: "time", title: "Time Savings Calculator", icon: "⏱️", description: "Show time saved vs DIY" },
        { id: "roi", title: "ROI Calculator", icon: "📈", description: "Calculate return on investment" },
        { id: "value", title: "Property Value Increase", icon: "🏠", description: "Show home value increase" }
      ];
    }
    return [
      { id: "roi", title: "ROI Calculator", icon: "📈", description: "Calculate return on investment" },
      { id: "savings", title: "Cost Savings Calculator", icon: "💵", description: "Show cost savings" },
      { id: "time", title: "Time Savings Calculator", icon: "⏱️", description: "Show time saved" }
    ];
  };

  const getInputOptions = () => {
    if (calculatorType.toLowerCase().includes("cost") || calculatorType.toLowerCase().includes("project")) {
      return ["Square footage / Size", "Current condition", "Material preference", "Timeline urgency", "Location/Zip code"];
    }
    if (calculatorType.toLowerCase().includes("roi") || calculatorType.toLowerCase().includes("savings") || calculatorType.toLowerCase().includes("time")) {
      return ["Current monthly cost", "Team size", "Hours spent per week", "Current solution cost"];
    }
    return ["Budget range", "Quantity/Volume", "Time period", "Custom field"];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Boost Conversions with an Interactive Calculator
          </DialogTitle>
          <DialogDescription>
            {step === "offer" && "Calculators increase engagement and conversions by 40%+"}
            {step === "type" && "Choose the calculator type that fits your business"}
            {step === "inputs" && "Select the input fields for your calculator"}
          </DialogDescription>
        </DialogHeader>

        {step === "offer" && (
          <div className="space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-lg">Why Add a Calculator?</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span><strong>40%+ higher conversion rates</strong> - visitors stay longer and engage more</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span><strong>Captures qualified leads</strong> - users self-identify their needs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span><strong>Personalized value demonstration</strong> - shows ROI specific to them</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleAccept} className="flex-1">
                Add Calculator
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Maybe Later
              </Button>
            </div>
          </div>
        )}

        {step === "type" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {getCalculatorTypes().map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleTypeSelect(type.title)}
                  className="bg-card border-2 border-border rounded-lg p-4 text-center hover:-translate-y-0.5 hover:shadow-md hover:border-primary transition-all"
                >
                  <div className="text-3xl mb-2">{type.icon}</div>
                  <div className="font-semibold text-sm mb-1">{type.title}</div>
                  <div className="text-xs text-muted-foreground">{type.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "inputs" && (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-sm mb-3">Select input fields:</h4>
              {getInputOptions().map((input) => (
                <label key={input} className="flex items-center gap-3 p-2 hover:bg-accent rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedInputs.includes(input)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedInputs([...selectedInputs, input]);
                      } else {
                        setSelectedInputs(selectedInputs.filter(i => i !== input));
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{input}</span>
                </label>
              ))}
            </div>
            <Button 
              onClick={handleComplete}
              disabled={selectedInputs.length === 0}
              className="w-full"
            >
              Add Calculator to Page
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
