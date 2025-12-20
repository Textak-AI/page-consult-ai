import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface DisclaimersSectionProps {
  forwardLookingStatement?: string;
  riskFactors?: string[];
  additionalDisclosures?: string;
  styles?: {
    primaryColor?: string;
    headingFont?: string;
    bodyFont?: string;
  };
}

const DEFAULT_FORWARD_LOOKING = `This presentation contains forward-looking statements within the meaning of the Private Securities Litigation Reform Act of 1995. These statements involve known and unknown risks, uncertainties, and other factors that may cause actual results to differ materially from those expressed or implied. Investors should not place undue reliance on these forward-looking statements, which speak only as of the date of this presentation.`;

const DEFAULT_DISCLAIMER = `The information contained in this presentation is for informational purposes only and does not constitute an offer to sell or a solicitation of an offer to buy any securities. This is not investment advice. Investors should consult with their own financial, legal, and tax advisors before making any investment decisions.`;

export function DisclaimersSection({ 
  forwardLookingStatement,
  riskFactors,
  additionalDisclosures,
  styles 
}: DisclaimersSectionProps) {
  return (
    <section className="py-16 px-6 bg-slate-950 border-t border-slate-800">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 
              className="text-lg font-semibold text-white"
              style={{ fontFamily: styles?.headingFont }}
            >
              Important Disclosures
            </h2>
          </div>

          <div className="space-y-6 text-sm text-slate-400">
            {/* Forward-Looking Statements */}
            <div>
              <h3 className="text-white font-medium mb-2">Forward-Looking Statements</h3>
              <p style={{ fontFamily: styles?.bodyFont }}>
                {forwardLookingStatement || DEFAULT_FORWARD_LOOKING}
              </p>
            </div>

            {/* Risk Factors */}
            {riskFactors && riskFactors.length > 0 && (
              <div>
                <h3 className="text-white font-medium mb-2">Key Risk Factors</h3>
                <ul className="list-disc list-inside space-y-1">
                  {riskFactors.map((risk, index) => (
                    <li key={index}>{risk}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Not Investment Advice */}
            <div>
              <h3 className="text-white font-medium mb-2">Disclaimer</h3>
              <p style={{ fontFamily: styles?.bodyFont }}>
                {additionalDisclosures || DEFAULT_DISCLAIMER}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
