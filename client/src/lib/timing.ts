// Animation Durations
export const DURATION = {
  INSTANT: 0.08,    // Content exit, instant transitions
  QUICK: 0.2,       // Button press, hover states
  STANDARD: 0.3,    // Content transitions, fades
  CARD: 0.55,       // Card morphing, layout changes
  SLOW: 1,          // Intro animations, emphasis
} as const;

// Easing Curves
export const EASING = {
  SHARP: [0.4, 0, 0.15, 1] as const,
  STANDARD: [0.4, 0, 0.2, 1] as const,
  SOFT: "easeOut" as const,
} as const;

// ═══════════════════════════════════════════════════════
// PARENT SPRING CONFIG — single source of truth
// Change these to adjust the feel of ALL modules at once
// ═══════════════════════════════════════════════════════

export const PARENT_SPRING = {
  // Card expand/collapse — the main container resize
  expand: {
    type: "spring" as const,
    damping: 80,
    mass: 0.5,
    stiffness: 500,
  },
  // Content appearing after card opens — spring-driven opacity + y
  contentEnter: {
    type: "spring" as const,
    damping: 40,
    mass: 0.4,
    stiffness: 300,
  },
  // Content disappearing on card close — fast spring
  contentExit: {
    type: "spring" as const,
    damping: 40,
    mass: 0.3,
    stiffness: 500,
  },
  // Teaser text fading out/in — spring-driven opacity + height
  teaserFade: {
    type: "spring" as const,
    damping: 40,
    mass: 0.4,
    stiffness: 350,
  },
  // Title/element reposition within card
  reposition: {
    type: "spring" as const,
    damping: 35,
    mass: 0.5,
    stiffness: 410,
  },
  // How far content slides up from (px)
  contentYOffset: 6,
  // Delay between staggered content items (seconds, 0 = no stagger)
  contentStagger: 0,
} as const;

// ═══════════════════════════════════════════════════════
// PER-MODULE OVERRIDES — only specify what differs
// ═══════════════════════════════════════════════════════

export type ModuleName =
  | "aboveGround"
  | "thoughtExperiment"
  | "microHistory"
  | "wikiSummary"
  | "games";

type SpringConfig = {
  type?: "spring";
  damping?: number;
  mass?: number;
  stiffness?: number;
};

export type ModuleOverride = {
  expand?: SpringConfig;
  contentEnter?: SpringConfig;
  contentExit?: SpringConfig;
  teaserFade?: SpringConfig;
  reposition?: SpringConfig;
  contentYOffset?: number;
  contentStagger?: number;
};

export const MODULE_OVERRIDES: Record<ModuleName, ModuleOverride> = {
  aboveGround: {
    reposition: {
      type: "spring",
      damping: 60,
      mass: 0.5,
      stiffness: 410,
    },
  },
  thoughtExperiment: {},
  microHistory: {},
  wikiSummary: { contentStagger: 0.08 },
  games: {},
};

// ═══════════════════════════════════════════════════════
// HELPER — get merged config for a module
// ═══════════════════════════════════════════════════════

type SpringTransition = {
  type: "spring";
  damping: number;
  mass: number;
  stiffness: number;
};

export interface ModuleAnimationConfig {
  expand: SpringTransition;
  contentEnter: SpringTransition;
  contentExit: SpringTransition;
  teaserFade: SpringTransition;
  reposition: SpringTransition;
  contentYOffset: number;
  contentStagger: number;
}

export function getModuleConfig(moduleName: ModuleName): ModuleAnimationConfig {
  const overrides = MODULE_OVERRIDES[moduleName] || {};
  return {
    expand: { ...PARENT_SPRING.expand, ...overrides.expand },
    contentEnter: { ...PARENT_SPRING.contentEnter, ...overrides.contentEnter },
    contentExit: { ...PARENT_SPRING.contentExit, ...overrides.contentExit },
    teaserFade: { ...PARENT_SPRING.teaserFade, ...overrides.teaserFade },
    reposition: { ...PARENT_SPRING.reposition, ...overrides.reposition },
    contentYOffset: overrides.contentYOffset ?? PARENT_SPRING.contentYOffset,
    contentStagger: overrides.contentStagger ?? PARENT_SPRING.contentStagger,
  };
}

// ═══════════════════════════════════════════════════════
// LEGACY BRIDGE — keeps AnimationDialKit/AnimationLab working
// TODO: Remove once those are updated to new config
// ═══════════════════════════════════════════════════════

export const SPRING = {
  CONTAINER: PARENT_SPRING.expand,
  REPOSITION: PARENT_SPRING.reposition,
} as const;

export const CONTENT_TIMING = {
  enter: {
    delay: 0.15,
    duration: 0.1,
    stagger: 0.18,
    yOffset: PARENT_SPRING.contentYOffset,
  },
  exit: {
    duration: 0.05,
  },
  teaser: {
    fadeOut: 0.1,
    fadeInDelay: 0.1,
  },
  headlineSlide: {
    duration: 0.4,
  },
} as const;

