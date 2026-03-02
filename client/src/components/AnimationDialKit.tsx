import { useState, useRef, useEffect } from "react";
import { SPRING, CONTENT_TIMING } from "@/lib/timing";

// ── Module Types (shared with AnimationLab) ──

export type ModuleType =
  | "aboveGround"
  | "wikiSummary"
  | "thoughtExperiment"
  | "microHistory"
  | "games"
  | "reveal";

// ── Types ──

export interface AnimationConfig {
  // Card open/close spring (the overall card resizing)
  springDamping: number;
  springStiffness: number;
  springMass: number;
  // Title slide spring (the title moving from bottom to top)
  titleDamping: number;
  titleStiffness: number;
  // Article content entering after expand
  contentDelay: number;
  contentDuration: number;
  contentStagger: number;
  contentYOffset: number;
  // Content disappearing on collapse
  exitDuration: number;
  // Preview subtitle
  teaserFadeOut: number;
  teaserFadeInDelay: number;
  // Headline rotation slide (Above Ground)
  headlineSlideDuration: number;
}

// Derive defaults from the production timing config so the lab
// always starts at the exact values the main app uses.
export const DEFAULT_CONFIG: AnimationConfig = {
  springDamping: SPRING.CONTAINER.damping,
  springStiffness: SPRING.CONTAINER.stiffness,
  springMass: SPRING.CONTAINER.mass,
  titleDamping: SPRING.REPOSITION.damping,
  titleStiffness: SPRING.REPOSITION.stiffness,
  contentDelay: CONTENT_TIMING.enter.delay,
  contentDuration: CONTENT_TIMING.enter.duration,
  contentStagger: CONTENT_TIMING.enter.stagger,
  contentYOffset: CONTENT_TIMING.enter.yOffset,
  exitDuration: CONTENT_TIMING.exit.duration,
  teaserFadeOut: CONTENT_TIMING.teaser.fadeOut,
  teaserFadeInDelay: CONTENT_TIMING.teaser.fadeInDelay,
  headlineSlideDuration: CONTENT_TIMING.headlineSlide.duration,
};

// ── Dial Definitions ──

interface DialDef {
  label: string;
  hint: string;
  key: keyof AnimationConfig;
  min: number;
  max: number;
  step: number;
  unit: string;
}

interface SectionDef {
  title: string;
  desc: string;
  dials: DialDef[];
}

// ── Section Templates ──

const CARD_SPRING: SectionDef = {
  title: "Card Open / Close",
  desc: "The card resizing when you tap to expand or collapse",
  dials: [
    {
      label: "Bounciness",
      hint: "Lower = more bounce and overshoot, higher = smoother settle",
      key: "springDamping",
      min: 5, max: 80, step: 1, unit: "",
    },
    {
      label: "Snap Speed",
      hint: "How fast the card snaps to its new size — higher = snappier",
      key: "springStiffness",
      min: 50, max: 500, step: 10, unit: "",
    },
    {
      label: "Weight",
      hint: "Heavier = slower and more momentum, lighter = instant",
      key: "springMass",
      min: 0.5, max: 5, step: 0.1, unit: "",
    },
  ],
};

const TITLE_SLIDE: SectionDef = {
  title: "Title Slide",
  desc: "The title text repositioning from bottom to top of the card",
  dials: [
    {
      label: "Bounciness",
      hint: "Lower = title overshoots its spot then settles, higher = glides in",
      key: "titleDamping",
      min: 5, max: 80, step: 1, unit: "",
    },
    {
      label: "Snap Speed",
      hint: "How fast the title slides to its new position",
      key: "titleStiffness",
      min: 50, max: 500, step: 10, unit: "",
    },
  ],
};

// Wiki Summary: staggered section entry with slide
const CONTENT_ENTER_STAGGERED: SectionDef = {
  title: "Section Stagger",
  desc: "The article sections cascading in after the card opens",
  dials: [
    {
      label: "Wait Before Showing",
      hint: "Pause after card starts opening before sections appear",
      key: "contentDelay",
      min: 0, max: 1.5, step: 0.05, unit: "s",
    },
    {
      label: "Fade-In Speed",
      hint: "How fast each section fades and slides in",
      key: "contentDuration",
      min: 0.05, max: 1, step: 0.05, unit: "s",
    },
    {
      label: "Section Stagger",
      hint: "Gap between each section starting — higher = more cascading",
      key: "contentStagger",
      min: 0, max: 0.3, step: 0.01, unit: "s",
    },
    {
      label: "Slide Distance",
      hint: "How far each section rises from below as it fades in",
      key: "contentYOffset",
      min: 0, max: 30, step: 1, unit: "px",
    },
  ],
};

// Simple content fade with slide (no stagger between sections)
const CONTENT_ENTER_SIMPLE: SectionDef = {
  title: "Content Appearing",
  desc: "The content fading in when the card opens",
  dials: [
    {
      label: "Wait Before Showing",
      hint: "Pause after card starts opening before content appears",
      key: "contentDelay",
      min: 0, max: 1.5, step: 0.05, unit: "s",
    },
    {
      label: "Fade-In Speed",
      hint: "How fast the content fades in",
      key: "contentDuration",
      min: 0.05, max: 1, step: 0.05, unit: "s",
    },
    {
      label: "Slide Distance",
      hint: "How far the content rises from below as it fades in",
      key: "contentYOffset",
      min: 0, max: 30, step: 1, unit: "px",
    },
  ],
};

const TEASER: SectionDef = {
  title: "Preview Subtitle",
  desc: "The teaser line that shows when the card is collapsed",
  dials: [
    {
      label: "Fade-Out Speed",
      hint: "How fast the preview disappears when you open the card",
      key: "teaserFadeOut",
      min: 0.05, max: 0.5, step: 0.05, unit: "s",
    },
    {
      label: "Reappear Delay",
      hint: "Wait before the preview comes back when you close the card",
      key: "teaserFadeInDelay",
      min: 0, max: 1, step: 0.05, unit: "s",
    },
  ],
};

const HEADLINE_ROTATE: SectionDef = {
  title: "Headline Rotation",
  desc: "The headline sliding in when auto-rotating or swiping",
  dials: [
    {
      label: "Slide Speed",
      hint: "How fast headlines slide in and out during rotation",
      key: "headlineSlideDuration",
      min: 0.1, max: 1, step: 0.05, unit: "s",
    },
  ],
};

const REVEAL_POOF: SectionDef = {
  title: "Reveal Animation",
  desc: "The overlay that poofs away when you tap to reveal",
  dials: [
    {
      label: "Poof Speed",
      hint: "How fast the overlay scales up and fades away",
      key: "exitDuration",
      min: 0.1, max: 1, step: 0.05, unit: "s",
    },
  ],
};

function getSectionsForModule(moduleType: ModuleType): SectionDef[] {
  switch (moduleType) {
    case "aboveGround":
      return [CARD_SPRING, HEADLINE_ROTATE, CONTENT_ENTER_SIMPLE, TEASER];
    case "wikiSummary":
      return [CARD_SPRING, TITLE_SLIDE, CONTENT_ENTER_STAGGERED, TEASER];
    case "thoughtExperiment":
      return [CARD_SPRING, CONTENT_ENTER_SIMPLE, TEASER];
    case "microHistory":
      return [CARD_SPRING, CONTENT_ENTER_SIMPLE, TEASER];
    case "games":
      return [CARD_SPRING, CONTENT_ENTER_SIMPLE, TEASER];
    case "reveal":
      return [REVEAL_POOF];
  }
}

// ── Components ──

function Dial({
  def,
  value,
  onChange,
}: {
  def: DialDef;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "3px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <label style={{ width: 110, fontSize: 10, color: "#ccc", flexShrink: 0, fontWeight: 500 }}>
          {def.label}
        </label>
        <input
          type="range"
          min={def.min}
          max={def.max}
          step={def.step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{ flex: 1, accentColor: "#8b5cf6", height: 3, cursor: "pointer" }}
        />
        <input
          type="number"
          min={def.min}
          max={def.max}
          step={def.step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{
            width: 54,
            background: "#2a2a2a",
            border: "1px solid #444",
            borderRadius: 4,
            color: "#fff",
            fontSize: 10,
            padding: "2px 4px",
            textAlign: "right",
          }}
        />
        {def.unit && (
          <span style={{ fontSize: 9, color: "#555", width: 14 }}>{def.unit}</span>
        )}
      </div>
      <div style={{ fontSize: 9, color: "#555", lineHeight: 1.3, paddingLeft: 1 }}>
        {def.hint}
      </div>
    </div>
  );
}

function Section({
  section,
  config,
  onChange,
  defaultOpen,
}: {
  section: SectionDef;
  config: AnimationConfig;
  onChange: (key: keyof AnimationConfig, value: number) => void;
  defaultOpen?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(!defaultOpen);

  return (
    <div style={{ borderBottom: "1px solid #2a2a2a", paddingBottom: 6 }}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 6,
          background: "none",
          border: "none",
          color: "#8b5cf6",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 0.5,
          cursor: "pointer",
          padding: "8px 0 4px",
          width: "100%",
          textAlign: "left",
        }}
      >
        <span>{section.title}</span>
        <span
          style={{
            color: "#555",
            fontSize: 10,
            transform: collapsed ? "rotate(-90deg)" : "rotate(0)",
            transition: "transform 0.15s",
            flexShrink: 0,
          }}
        >
          ▾
        </span>
      </button>
      {/* Section description — always visible */}
      <div
        style={{
          fontSize: 9,
          color: "#666",
          lineHeight: 1.3,
          paddingBottom: collapsed ? 0 : 6,
        }}
      >
        {section.desc}
      </div>
      {!collapsed && (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {section.dials.map((d) => (
            <Dial
              key={d.key}
              def={d}
              value={config[d.key]}
              onChange={(v) => onChange(d.key, v)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Build timing config payload for API ──

export function buildTimingPayload(config: AnimationConfig) {
  return {
    spring: {
      container: { damping: config.springDamping, mass: config.springMass, stiffness: config.springStiffness },
      reposition: { damping: config.titleDamping, mass: config.springMass, stiffness: config.titleStiffness },
    },
    contentTiming: {
      enter: { delay: config.contentDelay, duration: config.contentDuration, stagger: config.contentStagger, yOffset: config.contentYOffset },
      exit: { duration: config.exitDuration },
      teaser: { fadeOut: config.teaserFadeOut, fadeInDelay: config.teaserFadeInDelay },
      headlineSlide: { duration: config.headlineSlideDuration },
    },
  };
}

// ── Main Component (embeddable panel — no outer wrapper) ──

// ── Apply Button with success/error feedback ──

type ApplyStatus = "idle" | "loading" | "success" | "error";

function ApplyButton({ onApply }: { onApply: () => Promise<boolean> }) {
  const [status, setStatus] = useState<ApplyStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const handleClick = async () => {
    if (status === "loading") return;
    setStatus("loading");
    try {
      const ok = await onApply();
      setStatus(ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
    timerRef.current = setTimeout(() => setStatus("idle"), 1500);
  };

  const bg =
    status === "success" ? "#22c55e" :
    status === "error" ? "#ef4444" :
    "#8b5cf6";

  return (
    <button
      onClick={handleClick}
      disabled={status === "loading"}
      style={{
        flex: 1,
        padding: "7px 0",
        background: bg,
        border: "none",
        borderRadius: 6,
        color: "#fff",
        fontSize: 10,
        cursor: status === "loading" ? "wait" : "pointer",
        fontWeight: 600,
        transition: "background 0.25s ease, transform 0.15s ease",
        transform: status === "error" ? "translateX(3px)" : "none",
        animation: status === "error" ? "shake 0.3s ease" : "none",
      }}
    >
      {status === "idle" && "Apply to App"}
      {status === "loading" && "Saving..."}
      {status === "success" && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ animation: "scaleIn 0.25s ease" }}>
            <path d="M2 6.5L4.5 9L10 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Applied
        </span>
      )}
      {status === "error" && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 3L9 9M9 3L3 9" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Failed
        </span>
      )}
      <style>{`
        @keyframes scaleIn { from { transform: scale(0); } to { transform: scale(1); } }
        @keyframes shake { 0%,100% { transform: translateX(0); } 20%,60% { transform: translateX(-3px); } 40%,80% { transform: translateX(3px); } }
      `}</style>
    </button>
  );
}

// ── Main Component ──

interface AnimationDialKitProps {
  config: AnimationConfig;
  moduleType: ModuleType;
  onChange: (key: keyof AnimationConfig, value: number) => void;
  onReset: () => void;
  onApply: () => Promise<boolean>;
}

export function AnimationDialKit({ config, moduleType, onChange, onReset, onApply }: AnimationDialKitProps) {
  const sections = getSectionsForModule(moduleType);

  return (
    <>
      {/* Scrollable sections */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "4px 14px 14px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {sections.map((s, i) => (
          <Section
            key={s.title}
            section={s}
            config={config}
            onChange={onChange}
            defaultOpen={i === 0}
          />
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "10px 14px",
          borderTop: "1px solid #333",
          display: "flex",
          gap: 8,
          flexShrink: 0,
        }}
      >
        <button
          onClick={onReset}
          style={{
            flex: 1,
            padding: "7px 0",
            background: "#2a2a2a",
            border: "1px solid #444",
            borderRadius: 6,
            color: "#aaa",
            fontSize: 10,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Reset
        </button>
        <ApplyButton onApply={onApply} />
      </div>
    </>
  );
}
