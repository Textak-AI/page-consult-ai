// Premium Design Tokens for PageConsult AI
// These tokens ensure consistent, intentional, premium design across all generated pages

export const premiumTokens = {
  // Typography Scale (1.25 ratio)
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
    '7xl': '4.5rem',    // 72px
    'hero': '5.5rem',   // 88px - Statement headlines only
  },
  
  // Spacing Scale (generous)
  spacing: {
    sectionY: '120px',        // Between sections (desktop)
    sectionYMobile: '80px',   // Between sections (mobile)
    cardPadding: '32px',      // Inside cards
    cardGap: '24px',          // Between cards
    elementGap: '16px',       // Between elements
  },
  
  // Premium Shadows (layered for depth)
  shadows: {
    subtle: '0 1px 2px hsla(220, 16%, 16%, 0.05)',
    card: '0 4px 6px -1px hsla(220, 16%, 16%, 0.1), 0 2px 4px -1px hsla(220, 16%, 16%, 0.06)',
    elevated: '0 10px 15px -3px hsla(220, 16%, 16%, 0.1), 0 4px 6px -2px hsla(220, 16%, 16%, 0.05)',
    dramatic: '0 25px 50px -12px hsla(220, 16%, 16%, 0.25)',
    glow: (color: string) => `0 0 40px ${color}40, 0 0 80px ${color}20`,
    innerGlow: 'inset 0 1px 0 hsla(0, 0%, 100%, 0.1)',
    cyanGlow: '0 0 40px hsla(189, 95%, 43%, 0.4), 0 0 80px hsla(189, 95%, 43%, 0.2)',
    purpleGlow: '0 0 40px hsla(270, 95%, 60%, 0.4), 0 0 80px hsla(270, 95%, 60%, 0.2)',
  },
  
  // Animation Timing
  motion: {
    fast: '150ms',
    medium: '300ms',
    slow: '500ms',
    dramatic: '800ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // Border Radius
  radius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
  },
  
  // Gradient presets for premium look
  gradients: {
    mesh: 'radial-gradient(at 40% 20%, hsla(189, 95%, 43%, 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(270, 95%, 60%, 0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(189, 95%, 43%, 0.1) 0px, transparent 50%)',
    cyanToPurple: 'linear-gradient(135deg, hsl(189, 95%, 43%), hsl(270, 95%, 60%))',
    subtleCyan: 'linear-gradient(135deg, hsla(189, 95%, 43%, 0.1), hsla(189, 95%, 43%, 0.05))',
    darkFade: 'linear-gradient(180deg, hsl(217, 33%, 6%), hsl(217, 33%, 10%))',
  },
};

// Utility to generate glassmorphism styles
export const glass = {
  subtle: {
    background: 'hsla(0, 0%, 100%, 0.03)',
    backdropFilter: 'blur(12px)',
    border: '1px solid hsla(0, 0%, 100%, 0.08)',
    boxShadow: 'inset 0 1px 0 hsla(0, 0%, 100%, 0.05)',
  },
  medium: {
    background: 'hsla(0, 0%, 100%, 0.05)',
    backdropFilter: 'blur(16px)',
    border: '1px solid hsla(0, 0%, 100%, 0.1)',
    boxShadow: 'inset 0 1px 0 hsla(0, 0%, 100%, 0.1)',
  },
  strong: {
    background: 'hsla(0, 0%, 100%, 0.08)',
    backdropFilter: 'blur(24px)',
    border: '1px solid hsla(0, 0%, 100%, 0.15)',
    boxShadow: 'inset 0 1px 0 hsla(0, 0%, 100%, 0.15)',
  },
};
