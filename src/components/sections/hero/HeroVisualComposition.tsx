import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface HeroVisualProps {
  industry?: string;
  industryIcon?: LucideIcon;
  primaryColor?: string;
  companyName?: string;
  stats?: Array<{ label: string; value: string }>;
  colorMode?: 'light' | 'dark';
}

const metrics = [
  { label: 'Message Clarity', value: 92 },
  { label: 'Audience Alignment', value: 87 },
  { label: 'Conversion Readiness', value: 78 },
];

export function HeroVisualComposition({
  industry,
  industryIcon: IndustryIcon,
  primaryColor = '#56276B',
  companyName,
  colorMode = 'light',
}: HeroVisualProps) {
  const isLight = colorMode === 'light';

  return (
    <div className="hidden lg:flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-72 xl:w-80"
      >
        {/* Main card */}
        <div
          className={`rounded-2xl p-6 ${
            isLight
              ? 'bg-white shadow-xl shadow-gray-200/50 border border-gray-100'
              : 'bg-slate-800/80 shadow-xl shadow-black/20 border border-slate-700/50'
          }`}
        >
          {/* Card header with icon and label */}
          <div className="flex items-center gap-3 mb-5">
            {IndustryIcon && (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}12` }}
              >
                <IndustryIcon
                  className="w-5 h-5"
                  style={{ color: primaryColor }}
                  strokeWidth={2}
                />
              </div>
            )}
            <div>
              <div
                className={`text-xs font-medium uppercase tracking-wider ${
                  isLight ? 'text-gray-400' : 'text-slate-500'
                }`}
              >
                {industry || 'Strategic Intelligence'}
              </div>
              <div
                className={`text-sm font-semibold ${
                  isLight ? 'text-gray-900' : 'text-white'
                }`}
              >
                {companyName || 'Page Analysis'}
              </div>
            </div>
          </div>

          {/* Visual metric bars */}
          <div className="space-y-3">
            {metrics.map((metric, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <span
                    className={`text-xs ${
                      isLight ? 'text-gray-500' : 'text-slate-400'
                    }`}
                  >
                    {metric.label}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      isLight ? 'text-gray-700' : 'text-slate-300'
                    }`}
                  >
                    {metric.value}%
                  </span>
                </div>
                <div
                  className={`h-1.5 rounded-full ${
                    isLight ? 'bg-gray-100' : 'bg-slate-700'
                  }`}
                >
                  <motion.div
                    className="h-1.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.value}%` }}
                    transition={{
                      duration: 0.8,
                      delay: 0.6 + i * 0.15,
                      ease: [0.23, 1, 0.32, 1],
                    }}
                    style={{
                      backgroundColor: primaryColor,
                      opacity: 1 - i * 0.15,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom stat row */}
          <div
            className={`mt-5 pt-4 border-t ${
              isLight ? 'border-gray-100' : 'border-slate-700'
            } flex items-center justify-between`}
          >
            <div>
              <div
                className="text-lg font-bold"
                style={{ color: primaryColor }}
              >
                A+
              </div>
              <div
                className={`text-xs ${
                  isLight ? 'text-gray-400' : 'text-slate-500'
                }`}
              >
                Strategy Score
              </div>
            </div>
            <div className="text-right">
              <div
                className={`text-lg font-bold ${
                  isLight ? 'text-gray-900' : 'text-white'
                }`}
              >
                8
              </div>
              <div
                className={`text-xs ${
                  isLight ? 'text-gray-400' : 'text-slate-500'
                }`}
              >
                Sections
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span
                  className={`text-xs font-medium ${
                    isLight ? 'text-emerald-600' : 'text-emerald-400'
                  }`}
                >
                  Live
                </span>
              </div>
              <div
                className={`text-xs ${
                  isLight ? 'text-gray-400' : 'text-slate-500'
                }`}
              >
                Status
              </div>
            </div>
          </div>
        </div>

        {/* Floating accent card behind — offset for depth */}
        <div
          className={`absolute -z-10 top-3 -right-3 w-full h-full rounded-2xl ${
            isLight
              ? 'bg-gray-50 border border-gray-100'
              : 'bg-slate-800/40 border border-slate-700/30'
          }`}
        />
      </motion.div>
    </div>
  );
}
