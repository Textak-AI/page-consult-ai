/**
 * Archetype Design Profiles — SDI Layer 1.5
 * Maps buyer archetypes from the optimizer to visual design profiles
 * that change how every component renders.
 */

export type DesignProfile = 'precision' | 'warmth' | 'command' | 'depth';

/**
 * Maps archetype names from archetypeOptimizer.ts to design profile identifiers.
 */
export function getDesignProfile(archetype: string | null | undefined): DesignProfile {
  switch (archetype) {
    case 'Analytical Validator': return 'precision';
    case 'Emotional Connector': return 'warmth';
    case 'Decisive Commander': return 'command';
    case 'Cautious Researcher': return 'depth';
    default: return 'precision';
  }
}

/**
 * Resolves the archetype design profile from localStorage bridge.
 * Uses the same key as the messaging architecture persistence bridge.
 */
export function resolveArchetypeFromStorage(): DesignProfile {
  try {
    const stored = localStorage.getItem('pageconsult_messaging_architecture');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.timestamp && Date.now() - parsed.timestamp < 2 * 60 * 60 * 1000) {
        const archetype = parsed.primary?.archetype;
        return getDesignProfile(archetype);
      }
    }
  } catch (e) {
    // Silent fail
  }
  return 'precision';
}

/**
 * Profile metadata with Tailwind class presets for component-level usage.
 * Components can use these directly or read CSS custom properties.
 */
export const PROFILE_META: Record<DesignProfile, {
  label: string;
  cardClass: string;
  btnClass: string;
  headingClass: string;
  sectionClass: string;
}> = {
  precision: {
    label: 'Precision',
    cardClass: 'rounded-lg border border-white/[0.06] bg-white/[0.02]',
    btnClass: 'rounded-md',
    headingClass: 'font-semibold tracking-tight',
    sectionClass: 'py-24',
  },
  warmth: {
    label: 'Warmth',
    cardClass: 'rounded-2xl shadow-lg border border-black/[0.04] bg-white/[0.04]',
    btnClass: 'rounded-full',
    headingClass: 'font-medium tracking-tight',
    sectionClass: 'py-28',
  },
  command: {
    label: 'Command',
    cardClass: 'rounded border border-white/10 bg-white/[0.02]',
    btnClass: 'rounded',
    headingClass: 'font-extrabold tracking-tighter',
    sectionClass: 'py-16',
  },
  depth: {
    label: 'Depth',
    cardClass: 'rounded-xl shadow-md border border-black/[0.08] bg-white/[0.03]',
    btnClass: 'rounded-lg',
    headingClass: 'font-semibold',
    sectionClass: 'py-24',
  },
};

/**
 * Get archetype-driven heading styles for inline use.
 */
export function getArchetypeHeadingStyle(archetype: DesignProfile): React.CSSProperties {
  switch (archetype) {
    case 'command':
      return { fontWeight: 800, letterSpacing: '-0.03em' };
    case 'warmth':
      return { fontWeight: 500, letterSpacing: '-0.01em' };
    case 'precision':
      return { fontWeight: 600, letterSpacing: '-0.02em' };
    case 'depth':
      return { fontWeight: 600, letterSpacing: '0' };
    default:
      return {};
  }
}

/**
 * Get archetype-driven CTA button class names.
 */
export function getArchetypeCtaClass(archetype: DesignProfile): string {
  switch (archetype) {
    case 'warmth':
      return 'rounded-full px-8 py-4 shadow-lg';
    case 'command':
      return 'rounded px-8 py-3 font-bold';
    case 'depth':
      return 'rounded-lg px-6 py-3';
    case 'precision':
    default:
      return 'rounded-md px-6 py-3';
  }
}

/**
 * Get archetype-driven feature card class names.
 */
export function getArchetypeCardClass(archetype: DesignProfile, isLightMode: boolean): string {
  switch (archetype) {
    case 'precision':
      return isLightMode
        ? 'p-6 rounded-lg border border-slate-200 bg-white'
        : 'p-6 rounded-lg border border-white/[0.06] bg-white/[0.02]';
    case 'warmth':
      return isLightMode
        ? 'p-7 rounded-2xl shadow-lg border border-black/[0.04] bg-[#FFFBF5]'
        : 'p-7 rounded-2xl shadow-lg border border-black/[0.04] bg-white/[0.04]';
    case 'command':
      return isLightMode
        ? 'p-5 rounded border border-slate-300 bg-white'
        : 'p-5 rounded border border-white/10 bg-white/[0.02]';
    case 'depth':
      return isLightMode
        ? 'p-6 rounded-xl shadow-md border border-black/[0.08] bg-white'
        : 'p-6 rounded-xl shadow-md border border-black/[0.08] bg-white/[0.03]';
    default:
      return 'p-6 rounded-lg border';
  }
}

/**
 * Get archetype-driven stat number styling.
 */
export function getArchetypeStatClass(archetype: DesignProfile): {
  numberClass: string;
  labelClass: string;
} {
  switch (archetype) {
    case 'command':
      return {
        numberClass: 'text-5xl md:text-6xl font-extrabold tracking-tighter',
        labelClass: 'text-xs uppercase tracking-widest mt-1',
      };
    case 'precision':
      return {
        numberClass: 'text-4xl md:text-5xl font-semibold tracking-tight',
        labelClass: 'text-xs mt-1.5',
      };
    case 'warmth':
      return {
        numberClass: 'text-3xl md:text-4xl font-medium',
        labelClass: 'text-sm mt-2 leading-relaxed',
      };
    case 'depth':
      return {
        numberClass: 'text-3xl md:text-4xl font-semibold',
        labelClass: 'text-xs mt-1.5',
      };
    default:
      return {
        numberClass: 'text-4xl md:text-5xl font-bold',
        labelClass: 'text-xs mt-1.5',
      };
  }
}
