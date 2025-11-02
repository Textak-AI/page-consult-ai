import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface CalculatorSectionProps {
  content: any;
  onUpdate: (content: any) => void;
}

export function CalculatorSection({ content }: CalculatorSectionProps) {
  const [inputs, setInputs] = useState<{ [key: string]: number }>({});
  const [results, setResults] = useState<any>(null);

  const handleCalculate = () => {
    // Simple ROI calculation example
    const monthlySpend = inputs.monthlySpend || 0;
    const hoursPerWeek = inputs.hoursPerWeek || 0;
    const teamSize = inputs.teamSize || 1;

    const annualSavings = monthlySpend * 0.15 * 12;
    const hoursSaved = hoursPerWeek * 52 * teamSize;
    const roi = (annualSavings / (monthlySpend * 12)) * 100;

    setResults({
      annualSavings: `$${annualSavings.toLocaleString()}`,
      hoursSaved: hoursSaved.toLocaleString(),
      roi: `${roi.toFixed(1)}%`,
    });
  };

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Calculate Your ROI</h2>
          <p className="text-muted-foreground">
            See how much you could save with our solution
          </p>
        </div>

        <Card className="p-6 space-y-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthlySpend">Monthly Spend ($)</Label>
              <Input
                id="monthlySpend"
                type="number"
                placeholder="5000"
                onChange={(e) =>
                  setInputs({ ...inputs, monthlySpend: Number(e.target.value) })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hoursPerWeek">Hours Per Week</Label>
              <Input
                id="hoursPerWeek"
                type="number"
                placeholder="10"
                onChange={(e) =>
                  setInputs({ ...inputs, hoursPerWeek: Number(e.target.value) })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamSize">Team Size</Label>
              <Input
                id="teamSize"
                type="number"
                placeholder="5"
                onChange={(e) =>
                  setInputs({ ...inputs, teamSize: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <Button onClick={handleCalculate} className="w-full">
            Calculate Savings
          </Button>

          {results && (
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {results.annualSavings}
                </div>
                <div className="text-sm text-muted-foreground">
                  Annual Savings
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">
                  {results.hoursSaved}
                </div>
                <div className="text-sm text-muted-foreground">
                  Hours Saved
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">
                  {results.roi}
                </div>
                <div className="text-sm text-muted-foreground">ROI</div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}
