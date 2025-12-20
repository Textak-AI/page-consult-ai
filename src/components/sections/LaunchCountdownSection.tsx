import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, PartyPopper, ExternalLink } from 'lucide-react';

interface LaunchCountdownSectionProps {
  content: {
    headline: string;
    targetDate: string;
    showProductHuntBadge?: boolean;
    productHuntUrl?: string;
  };
  primaryColor?: string;
  headingFont?: string;
  bodyFont?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownDigit = ({ 
  value, 
  label,
  primaryColor 
}: { 
  value: number; 
  label: string;
  primaryColor: string;
}) => {
  const displayValue = value.toString().padStart(2, '0');
  
  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative overflow-hidden rounded-xl border border-border/30 backdrop-blur-sm"
        style={{ 
          background: `linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)`,
          boxShadow: `0 8px 32px ${primaryColor}20`
        }}
      >
        <AnimatePresence mode="popLayout">
          <motion.div
            key={value}
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30 
            }}
            className="px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6"
          >
            <span 
              className="text-3xl sm:text-4xl md:text-6xl font-bold tabular-nums"
              style={{ color: primaryColor }}
            >
              {displayValue}
            </span>
          </motion.div>
        </AnimatePresence>
        
        {/* Shine effect */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 50%)'
          }}
        />
      </div>
      
      <span className="mt-2 text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
};

const Separator = ({ primaryColor }: { primaryColor: string }) => (
  <div className="flex flex-col justify-center gap-2 px-1 sm:px-2">
    <motion.div
      animate={{ 
        opacity: [1, 0.3, 1],
        scale: [1, 0.8, 1]
      }}
      transition={{ 
        duration: 1, 
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
      style={{ backgroundColor: primaryColor }}
    />
    <motion.div
      animate={{ 
        opacity: [1, 0.3, 1],
        scale: [1, 0.8, 1]
      }}
      transition={{ 
        duration: 1, 
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.5
      }}
      className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
      style={{ backgroundColor: primaryColor }}
    />
  </div>
);

const ProductHuntBadge = ({ url }: { url: string }) => (
  <motion.a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.6 }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card transition-colors"
  >
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-[#DA552F]"
    >
      <path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        fill="currentColor"
      />
      <path
        d="M13.0909 12.4545H11.0909V9.54545H13.0909C13.8909 9.54545 14.5454 10.2 14.5454 11C14.5454 11.8 13.8909 12.4545 13.0909 12.4545ZM13.0909 8H9.54541V16H11.0909V14H13.0909C14.7454 14 16.0909 12.6545 16.0909 11C16.0909 9.34545 14.7454 8 13.0909 8Z"
        fill="white"
      />
    </svg>
    <span className="text-sm font-medium text-foreground">
      Follow on Product Hunt
    </span>
    <ExternalLink className="w-3 h-3 text-muted-foreground" />
  </motion.a>
);

const LaunchCountdownSection: React.FC<LaunchCountdownSectionProps> = ({
  content,
  primaryColor = '#6366f1',
  headingFont = 'inherit',
  bodyFont = 'inherit',
}) => {
  const { headline, targetDate, showProductHuntBadge, productHuntUrl } = content;
  
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setIsLive(true);
        return null;
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      if (newTimeLeft) {
        setTimeLeft(newTimeLeft);
      } else {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <section className="py-16 sm:py-20 md:py-24 px-4 relative overflow-hidden">
      {/* Background glow */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${primaryColor}10 0%, transparent 70%)`
        }}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto text-center relative z-10"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full mb-6"
          style={{ backgroundColor: `${primaryColor}20` }}
        >
          {isLive ? (
            <PartyPopper className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: primaryColor }} />
          ) : (
            <Rocket className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: primaryColor }} />
          )}
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-8 sm:mb-12"
          style={{ fontFamily: headingFont }}
        >
          {headline}
        </motion.h2>

        <AnimatePresence mode="wait">
          {isLive ? (
            <motion.div
              key="live"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="space-y-6"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="inline-block"
              >
                <span 
                  className="text-4xl sm:text-5xl md:text-7xl font-bold"
                  style={{ 
                    fontFamily: headingFont,
                    color: primaryColor,
                    textShadow: `0 0 40px ${primaryColor}40`
                  }}
                >
                  🎉 We're Live!
                </span>
              </motion.div>
              
              <p 
                className="text-lg text-muted-foreground"
                style={{ fontFamily: bodyFont }}
              >
                The wait is over. Jump in now!
              </p>
            </motion.div>
          ) : timeLeft ? (
            <motion.div
              key="countdown"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-start justify-center gap-2 sm:gap-4"
              style={{ fontFamily: bodyFont }}
            >
              <CountdownDigit 
                value={timeLeft.days} 
                label="Days" 
                primaryColor={primaryColor}
              />
              <Separator primaryColor={primaryColor} />
              <CountdownDigit 
                value={timeLeft.hours} 
                label="Hours" 
                primaryColor={primaryColor}
              />
              <Separator primaryColor={primaryColor} />
              <CountdownDigit 
                value={timeLeft.minutes} 
                label="Minutes" 
                primaryColor={primaryColor}
              />
              <Separator primaryColor={primaryColor} />
              <CountdownDigit 
                value={timeLeft.seconds} 
                label="Seconds" 
                primaryColor={primaryColor}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Product Hunt Badge */}
        {showProductHuntBadge && productHuntUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="mt-10 sm:mt-12"
          >
            <ProductHuntBadge url={productHuntUrl} />
          </motion.div>
        )}
      </motion.div>
    </section>
  );
};

export default LaunchCountdownSection;
