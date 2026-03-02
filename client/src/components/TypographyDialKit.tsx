import { useState, useCallback, useEffect, useRef } from "react";

/**
 * TypographyDialKit — Live control panel for tuning the typography system.
 * Toggle with the floating Aa button (bottom-right corner).
 */

interface DialDef {
  label: string;
  variable: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  scaled?: boolean;
}

// ── Dials grouped by typography role (5-type system) ──

const HEADLINE_DIALS: DialDef[] = [
  { label: "Font Size", variable: "--text-headline", min: 14, max: 40, step: 1, unit: "px", scaled: true },
  { label: "Line Height", variable: "--leading-headline", min: 1.0, max: 1.6, step: 0.05, unit: "" },
  { label: "Tracking", variable: "--tracking-tight", min: -0.1, max: 0.05, step: 0.005, unit: "em" },
];

const READING_DIALS: DialDef[] = [
  { label: "Font Size", variable: "--text-reading", min: 12, max: 24, step: 0.5, unit: "px", scaled: true },
  { label: "Line Height", variable: "--leading-reading", min: 1.2, max: 2.0, step: 0.05, unit: "" },
  { label: "Tracking", variable: "--tracking-reading", min: -1, max: 1, step: 0.05, unit: "px" },
];

const CAPTION_DIALS: DialDef[] = [
  { label: "Font Size", variable: "--text-caption", min: 10, max: 20, step: 0.5, unit: "px", scaled: true },
  { label: "Line Height", variable: "--leading-caption", min: 1.1, max: 1.8, step: 0.05, unit: "" },
  { label: "Tracking", variable: "--tracking-caption", min: -1, max: 1, step: 0.05, unit: "px" },
];

const LABEL_DIALS: DialDef[] = [
  { label: "Font Size", variable: "--text-label", min: 6, max: 18, step: 0.5, unit: "px", scaled: true },
  { label: "Tracking", variable: "--tracking-wide", min: 0, max: 4, step: 0.25, unit: "px" },
];

const GLOBAL_DIALS: DialDef[] = [
  { label: "Tight Leading", variable: "--leading-tight", min: 1.0, max: 2.0, step: 0.05, unit: "" },
];

const ALL_SECTIONS = [
  { title: "Headline", dials: HEADLINE_DIALS, preview: "type-headline", previewColor: "#fff" },
  { title: "Reading", dials: READING_DIALS, preview: "type-reading", previewColor: "#ccc" },
  { title: "Caption", dials: CAPTION_DIALS, preview: "type-caption", previewColor: "#999" },
  { title: "Label", dials: LABEL_DIALS, preview: "type-label", previewColor: "#8b5cf6" },
  { title: "Shared", dials: GLOBAL_DIALS, preview: null, previewColor: null },
];

// ── Helpers ──

function getRoot(): HTMLElement | null {
  return document.getElementById("underground-root") || document.documentElement;
}

function setVariable(variable: string, value: number, unit: string, scaled?: boolean) {
  const root = getRoot();
  if (!root) return;
  if (scaled) {
    root.style.setProperty(variable, `calc(${value}${unit} * var(--scale))`);
  } else {
    root.style.setProperty(variable, `${value}${unit}`);
  }
}

// ── Defaults ──

const DEFAULTS: Record<string, { value: number; unit: string; scaled?: boolean }> = {
  "--text-headline": { value: 22, unit: "px", scaled: true },
  "--text-reading": { value: 15, unit: "px", scaled: true },
  "--text-caption": { value: 13, unit: "px", scaled: true },
  "--text-label": { value: 10, unit: "px", scaled: true },
  "--leading-headline": { value: 1.2, unit: "" },
  "--leading-reading": { value: 1.5, unit: "" },
  "--leading-caption": { value: 1.38, unit: "" },
  "--leading-tight": { value: 1.3, unit: "" },
  "--tracking-tight": { value: -0.04, unit: "em" },
  "--tracking-reading": { value: -0.2, unit: "px" },
  "--tracking-caption": { value: -0.15, unit: "px" },
  "--tracking-wide": { value: 1, unit: "px" },
};

// ── Components ──

function Dial({ def, value, onChange }: { def: DialDef; value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 0" }}>
      <label style={{ width: 80, fontSize: 10, color: "#888", flexShrink: 0 }}>{def.label}</label>
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
      <span style={{ fontSize: 9, color: "#555", width: 18 }}>{def.unit}</span>
    </div>
  );
}

const PREVIEW_TEXT: Record<string, string> = {
  "type-headline": "Card headline text",
  "type-reading": "Expanded body and descriptions",
  "type-caption": "Teaser preview, metadata, sources",
  "type-label": "CATEGORY LABEL",
};

function Section({ title, dials, preview, previewColor, values, onChange }: {
  title: string;
  dials: DialDef[];
  preview: string | null;
  previewColor: string | null;
  values: Record<string, number>;
  onChange: (variable: string, value: number, unit: string, scaled?: boolean) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

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
          padding: "6px 0",
          width: "100%",
        }}
      >
        <span>{title}</span>
        <span style={{ color: "#555", fontSize: 10, transform: collapsed ? "rotate(-90deg)" : "rotate(0)", transition: "transform 0.15s" }}>
          ▾
        </span>
      </button>
      {!collapsed && (
        <div>
          {preview && (
            <div
              className={preview}
              style={{ color: previewColor || "#fff", marginBottom: 6, padding: "2px 0" }}
            >
              {PREVIEW_TEXT[preview] || "Sample text"}
            </div>
          )}
          {dials.map((d) => (
            <Dial
              key={d.variable}
              def={d}
              value={values[d.variable] ?? 0}
              onChange={(v) => onChange(d.variable, v, d.unit, d.scaled)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Shared hook for typography state ──

export function useTypographyState() {
  const [values, setValues] = useState<Record<string, number>>({});

  useEffect(() => {
    const initial: Record<string, number> = {};
    for (const [key, def] of Object.entries(DEFAULTS)) {
      initial[key] = def.value;
    }
    setValues(initial);
  }, []);

  const handleChange = useCallback((variable: string, value: number, unit: string, scaled?: boolean) => {
    setValues((prev) => ({ ...prev, [variable]: value }));
    setVariable(variable, value, unit, scaled);
  }, []);

  const handleReset = useCallback(() => {
    const fresh: Record<string, number> = {};
    for (const [key, def] of Object.entries(DEFAULTS)) {
      fresh[key] = def.value;
      setVariable(key, def.value, def.unit, def.scaled);
    }
    setValues(fresh);
  }, []);

  const handleCopyCSS = useCallback(() => {
    const lines = Object.entries(values).map(([key, val]) => {
      const def = DEFAULTS[key];
      if (!def) return `  ${key}: ${val};`;
      if (def.scaled) return `  ${key}: calc(${val}${def.unit} * var(--scale));`;
      return `  ${key}: ${val}${def.unit};`;
    });
    navigator.clipboard.writeText(lines.join("\n"));
  }, [values]);

  const handleApply = useCallback(async () => {
    const variables: Record<string, { value: number; unit: string; scaled?: boolean }> = {};
    for (const [key, val] of Object.entries(values)) {
      const def = DEFAULTS[key];
      if (def) {
        variables[key] = { value: val, unit: def.unit, scaled: def.scaled };
      }
    }
    const res = await fetch("/api/dev/save-typography", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variables }),
    });
    if (!res.ok) return false;
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return false;
    const data = await res.json();
    return !!data.success;
  }, [values]);

  return { values, handleChange, handleReset, handleCopyCSS, handleApply };
}

// ── Embeddable Panel (for use inside AnimationLab) ──

export { ALL_SECTIONS as TYPOGRAPHY_SECTIONS };
export { DEFAULTS as TYPOGRAPHY_DEFAULTS };

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
        transition: "background 0.25s ease",
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

export function TypographyDialKitPanel({
  values,
  onChange,
  onReset,
  onApply,
}: {
  values: Record<string, number>;
  onChange: (variable: string, value: number, unit: string, scaled?: boolean) => void;
  onReset: () => void;
  onApply: () => Promise<boolean>;
}) {
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
        {ALL_SECTIONS.map((s) => (
          <Section
            key={s.title}
            title={s.title}
            dials={s.dials}
            preview={s.preview}
            previewColor={s.previewColor}
            values={values}
            onChange={onChange}
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

// ── Floating Panel (original, for main app) ──

export function TypographyDialKit() {
  const [open, setOpen] = useState(false);
  const { values, handleChange, handleReset, handleCopyCSS } = useTypographyState();
  const panelRef = useRef<HTMLDivElement>(null);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 99999,
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "#8b5cf6",
          border: "none",
          color: "#fff",
          fontSize: 18,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(139,92,246,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
        title="Typography DialKit"
      >
        Aa
      </button>
    );
  }

  return (
    <div
      ref={panelRef}
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: 320,
        zIndex: 99999,
        background: "#1a1a1a",
        borderLeft: "1px solid #333",
        display: "flex",
        flexDirection: "column",
        fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          borderBottom: "1px solid #333",
          flexShrink: 0,
        }}
      >
        <span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>
          Typography
        </span>
        <button
          onClick={() => setOpen(false)}
          style={{
            background: "none",
            border: "none",
            color: "#666",
            fontSize: 18,
            cursor: "pointer",
            padding: "0 4px",
          }}
        >
          ×
        </button>
      </div>

      <TypographyDialKitPanel
        values={values}
        onChange={handleChange}
        onReset={handleReset}
        onApply={async () => { handleCopyCSS(); return true; }}
      />
    </div>
  );
}
