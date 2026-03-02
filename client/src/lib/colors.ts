export const COLORS = {
  // Core Utility
  UTILITY: {
    DATE_TEXT: "#f7f7f7",
    BACKGROUND_DARK: "#171719",
    FOOTER_DARK: "#363636",
    FOOTER_TEXT: "#565656",
    TEXT_BLACK: "#000000",
    TEXT_WHITE: "white",
  },

  // Dark Neumorphic Theme
  THEME: {
    CARD_BG: "#1E1E22",
    CARD_BG_ELEVATED: "#242428",
    LABEL_TEXT: "#B8B8BC",
    HEADLINE_TEXT: "#E8E8EC",
    BODY_TEXT: "#C8C8CC",
    CAPTION_TEXT: "#9A9A9E",
  },

  // Above Ground Module — MTA Yellow (N/Q/R lines)
  ABOVE_GROUND: {
    BACKGROUND: "#FCCC0A",
    LABEL: "#FFF2B3",
    BUTTON: "#FDDA4A",
    TEXT: "#000000",
  },

  // Factle Module — MTA Blue (A/C/E lines)
  FACTLE: {
    BACKGROUND: "#0039A6",
    LABEL: "#668EC2",
    FRONT_CAP: "#011e8c",
    BACK_CAP: "#F3F0EB",
    CAP_TEXT_DARK: "#1a1a1a",
    CAP_TEXT_MEDIUM: "#555555",
    CAP_BORDER: "#A2A2A2",
  },

  // Thought Experiment Module — MTA Dark Gray (S shuttle)
  THOUGHT_EXPERIMENT: {
    BACKGROUND: "#808183",
    LABEL: "#B3B4B6",
    BUTTON: "#9A9B9D",
    TEXT: "#FFFFFF",
  },

  // Micro History Module — MTA Green (G line)
  MICRO_HISTORY: {
    BACKGROUND: "#6CBE45",
    LABEL: "#B5DEA2",
    BUTTON: "#89CE6A",
    TEXT_DARK: "#000000",
    TEXT_LIGHT: "white",
  },

  // Wiki Summary Module — MTA Dark Green (4/5/6 lines)
  WIKI_SUMMARY: {
    BACKGROUND: "#00933C",
    LABEL: "#5DB87D",
    BUTTON: "#2BA854",
    ACCENT: "#A8E5B8",
    TEXT: "white",
  },

  // Quarter Cards
  TRIVIA: {
    BACKGROUND: "#B933AD",
    LABEL: "#D3D4D5",
    TEXT: "#000000",
  },

  RIDDLE: {
    BACKGROUND: "#FF6319",
    LABEL: "#FFB088",
    TEXT: "#000000",
  },

  ON_THIS_DAY: {
    BACKGROUND: "#996633",
    LABEL: "#C4A882",
    TEXT: "#FFFFFF",
  },

  WORD_OF_THE_DAY: {
    BACKGROUND: "#00ADD0",
    TEXT: "#FFFFFF",
  },

  // Games Module — MTA Red (1/2/3 lines)
  GAMES: {
    BACKGROUND: "#EE352E",
    LABEL: "#F5ADA8",
    BUTTON: "#F47A75",
    NAV_BUTTON: "#C42B26",
    ARROW: "#FFFFFF",
  },

  // Interactive Elements
  INTERACTIVE: {
    DOT_ACTIVE: "rgba(255,255,255,0.85)",
    DOT_INACTIVE: "rgba(255,255,255,0.25)",
    SHADOW: "rgba(0,0,0,0.25)",
  },
} as const;

// Helper type for TypeScript autocomplete
export type ModuleColors = keyof typeof COLORS;
