import { useRef, useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { COLORS } from "@/lib/colors";

const RIDDLE = {
  question: "The more you take, the more you leave behind. What am I?",
  answer: "Footsteps",
};

// Percentage of canvas that must be scratched before auto-reveal
const REVEAL_THRESHOLD = 0.55;
// Brush size in CSS pixels (width — height scales proportionally from SVG aspect ratio 87:67)
const BRUSH_W = 14;
const BRUSH_H = Math.round(BRUSH_W * (67 / 87));

// SVG brush shape — irregular edge for scratchy texture
const BRUSH_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="87" height="67" viewBox="0 0 87 67" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M84.8043 6.81621L84.5137 7.93432L84.514 7.93544L83.9566 10.1173L83.8711 10.4514L83.0477 12.7679L82.9737 12.9753L82.1385 14.9309L81.9189 15.4712L82.5593 15.8821L85.6983 19.7517L83.7092 22.0426L83.722 22.0994L83.8544 22.7034L83.81 25.8288L83.243 28.3889L82.0824 33.917L80.6083 34.4411L80.5062 34.7603L80.1094 35.9977L79.405 39.7123L78.5229 47.3806L76.9459 45.8932L76.9119 46.5788L76.9043 46.7273L77.1822 47.314L76.9669 48.9438L77.2442 51.317L76.5637 52.0009L76.5417 52.1692L76.3036 52.7733L76.7419 53.922L75.9006 58.7975L75.5322 59.6221L75.421 59.8695C75.3265 60.584 75.1269 61.3137 74.82 61.9828C74.327 63.0576 73.6601 61.756 73.0028 61.9953L73.1772 66.5471L68.1652 66.5346L66.8832 65.4167L65.9353 64.7816L65.8253 64.7074L65.1816 64.0875L63.6339 66.0898L62.7348 64.4899L62.277 64.3831L61.1855 64.2908L61.0737 64.2818L60.9662 64.2519L59.6827 63.9004L58.9131 63.4696L58.4166 63.5973L56.5392 64.7585L55.4272 64.1701L52.0324 64.8576L51.3764 63.3495L50.4109 63.0681L50.3541 63.052L50.2996 63.0301L49.1894 62.588L49.0207 62.5202L48.8926 62.4224L46.2938 64.6192L44.9166 62.5249L44.3124 62.5519L43.1844 61.1944L42.5141 61.0085L41.5939 60.846L40.5891 60.9678L39.1429 61.1696L38.9333 61.1276L37.7816 60.8934L37.7447 60.8867L36.5693 60.5725L35.7562 60.367L34.6195 60.6631L34.4048 60.6481L33.3576 60.5724L31.6019 60.8028L30.8051 59.934L30.4649 60.103L29.8383 60.4128L28.9471 60.0168L27.6683 61.0706L25.8756 60.541L24.7837 60.3434L24.7609 60.3396L24.7388 60.335L24.6435 60.3139L22.9755 61.2805L22.1936 60.4481L21.9363 60.5523L20.9798 60.9364L19.8057 59.4609L18.6493 60.6291L16.0262 61.2352L15.5818 59.626L14.3297 61.1229L12.6237 59.3282L12.4129 59.3557L10.8112 60.379L9.08561 59.7979L8.84249 59.7332L7.16052 61.5335L5.48812 60.1969L5.2038 60.2422L1.73915 62.6443L1.49375 57.0868L0.800835 58.1609L0.0176614 52.9861L-0.000539105 52.8666L1.1682 51.6854L0.35496 49.9639L1.40699 45.438L0.209537 42.3939L2.73781 36.6464L2.59991 36.6007L2.97126 36.1153L3.57255 34.749L3.5039 34.0616L3.80717 34.215L3.88059 34.0481L4.14393 34.3859L4.25334 34.4412L6.91622 30.964L7.10199 30.7208L6.82123 30.6075L5.64529 27.8971L5.23989 25.5438L5.2111 25.3783L5.19282 25.2057L4.14893 15.4661L8.35431 17.1808L8.37148 17.1876L8.12877 16.4416L10.7316 9.83467L12.4574 10.57L12.9594 10.785L13.0402 10.7489L11.0176 6.21116L15.3063 7.51419L15.6936 8.71752L16.1362 7.8054C16.1548 7.64021 16.1785 7.47283 16.2089 7.30502L16.2538 6.95296L16.3136 6.47905L16.433 6.01351L16.4587 5.91267C17.0288 3.6834 18.4463 2.2277 19.6245 2.66213C20.0484 2.81849 20.3829 3.19947 20.6118 3.72531L21.2798 3.52945L21.8957 3.34765L22.3878 -0.000170555L26.0273 4.20402L26.998 4.2365L28.0606 5.84058L28.4743 5.95894L29.0134 5.9016L31.1209 2.38784L31.9789 3.42588L32.0858 3.55465L32.2253 3.44858L32.8755 2.94896L34.5677 3.24483L35.6572 3.269L36.1108 3.27804L37.3466 4.34562L37.8104 4.54432L38.5782 4.28092L38.7767 4.2123L40.177 4.1321L40.291 4.12588L40.4025 4.13895L41.393 4.25895L43.0055 3.99735L43.9348 4.75558L44.5001 4.56311L45.2708 4.29928L46.5449 5.49785L46.9117 5.54177L47.8145 5.11824L47.8875 5.08464L47.9601 5.05824L49.6597 4.4337L51.0029 4.77695L52.0171 4.72586L52.579 4.69626L53.2548 5.36463L53.5829 5.16182L54.3439 4.68969L55.9046 5.49542L56.8577 5.62423L57.0588 5.65092L57.9785 6.1071L58.7867 5.96683L58.8131 5.96196L58.8398 5.9582L60.0513 5.79344L60.1827 5.77632L61.0023 5.82804L62.5797 4.78397L64.3266 5.71019L65.2052 6.01705L65.2982 6.01894L65.8135 5.3315L66.4037 4.54212L69.1425 3.60821L69.6545 4.16918L70.6819 2.83012L72.3009 3.72212L73.4068 3.05902L74.633 3.42867L75.7842 2.81993L77.1456 3.02114L78.0895 2.76046L78.33 2.69338L78.8613 2.73751L80.7643 4.3524L82.4495 6.09382L86.3538 4.83649L84.8043 6.81621ZM48.0322 12.0482L47.5724 13.1838L47.7077 13.2206L48.9389 12.8631L48.6092 12.7791L48.0322 12.0482ZM58.0261 14.1524L57.7702 14.1964L58.1816 14.3737L58.2331 14.4231L58.4691 14.0915L58.0261 14.1524Z" fill="black"/></svg>`;

// Pre-render the SVG brush to an offscreen canvas (called once)
function createBrushStamp(): Promise<HTMLCanvasElement> {
  return new Promise((resolve) => {
    const stamp = document.createElement("canvas");
    const dpr = window.devicePixelRatio || 1;
    stamp.width = BRUSH_W * dpr;
    stamp.height = BRUSH_H * dpr;
    const ctx = stamp.getContext("2d")!;

    const img = new Image();
    const blob = new Blob([BRUSH_SVG], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      ctx.drawImage(img, 0, 0, stamp.width, stamp.height);
      URL.revokeObjectURL(url);
      resolve(stamp);
    };
    img.src = url;
  });
}

// Lighten a hex color toward white by a factor (0 = unchanged, 1 = white)
function lightenHex(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.round(r + (255 - r) * factor)}, ${Math.round(g + (255 - g) * factor)}, ${Math.round(b + (255 - b) * factor)})`;
}

function ScratchCard({
  question,
  answer,
  bgColor,
  labelColor,
}: {
  question: string;
  answer: string;
  bgColor: string;
  labelColor: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const brushRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [healing, setHealing] = useState(false);
  const [hasScratched, setHasScratched] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);

  // Load brush stamp once
  useEffect(() => {
    createBrushStamp().then((stamp) => {
      brushRef.current = stamp;
    });
  }, []);

  // Draw the scratch layer (the question text on the card color)
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    // Fill with the card background color
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw the question text
    const scale = parseFloat(
      getComputedStyle(document.getElementById("underground-root")!).getPropertyValue("--scale") || "1"
    );
    const fontSize = 22 * scale;
    const padding = 18 * scale;

    ctx.fillStyle = "#000000";
    ctx.font = `700 ${fontSize}px 'Satoshi-Bold', Helvetica, sans-serif`;
    ctx.textBaseline = "top";

    // Word-wrap the question
    const maxWidth = rect.width - padding * 2;
    const words = question.split(" ");
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + " " + words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);

    // Position text at bottom of card (matching the original layout)
    const lineHeight = fontSize * 1.08;
    const textBlockHeight = lines.length * lineHeight;
    const startY = rect.height - padding - textBlockHeight;

    lines.forEach((line, i) => {
      ctx.fillText(line, padding, startY + i * lineHeight);
    });

    // Draw "RIDDLE" label at top
    const labelFontSize = 10 * scale;
    ctx.fillStyle = labelColor;
    ctx.font = `700 ${labelFontSize}px 'Sora', Helvetica, sans-serif`;
    ctx.letterSpacing = "1px";
    ctx.textBaseline = "middle";
    ctx.fillText("RIDDLE", padding, padding + (30 * scale) / 2);
  }, [bgColor, labelColor, question]);

  useEffect(() => {
    initCanvas();
    setRevealed(false);
    setScratchPercent(0);
  }, [initCanvas]);

  // Recalculate on resize
  useEffect(() => {
    const handleResize = () => {
      if (!revealed) initCanvas();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [initCanvas, revealed]);

  const getPos = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    };
  };

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current;
    const brush = brushRef.current;
    if (!canvas || !brush) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    // Reset transform to avoid stacking with initCanvas's dpr scale
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "destination-out";

    const halfW = BRUSH_W / 2;
    const halfH = BRUSH_H / 2;

    const stampAt = (sx: number, sy: number) => {
      ctx.drawImage(brush, sx - halfW, sy - halfH, BRUSH_W, BRUSH_H);
    };

    // Interpolate between last point and current for smooth strokes
    if (lastPoint.current) {
      const lp = lastPoint.current;
      const dist = Math.sqrt((x - lp.x) ** 2 + (y - lp.y) ** 2);
      const steps = Math.max(Math.ceil(dist / 3), 1);

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        stampAt(lp.x + (x - lp.x) * t, lp.y + (y - lp.y) * t);
      }
    } else {
      stampAt(x, y);
    }

    ctx.restore();
    lastPoint.current = { x, y };
  };

  const checkReveal = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;
    const total = pixels.length / 4;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparent++;
    }

    const percent = transparent / total;
    setScratchPercent(percent);

    if (percent >= REVEAL_THRESHOLD) {
      setRevealed(true);
    }
  };

  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (revealed) return;
    e.preventDefault();
    isDrawing.current = true;
    lastPoint.current = null;
    if (!hasScratched) setHasScratched(true);
    const pos = getPos(e);
    scratch(pos.x, pos.y);
  };

  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing.current || revealed) return;
    e.preventDefault();
    const pos = getPos(e);
    scratch(pos.x, pos.y);
  };

  const handleEnd = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    lastPoint.current = null;
    checkReveal();
  };

  // Two-phase wipe: (1) solid color wipes up over scratched canvas, (2) fresh canvas wipes up
  const healAnimRef = useRef(0);
  const heal = useCallback(() => {
    setHealing(true);
    setHasScratched(false);
    setScratchPercent(0);
    setRevealed(false);
    lastPoint.current = null;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) { setHealing(false); return; }
    const ctx = canvas.getContext("2d");
    if (!ctx) { setHealing(false); return; }

    const dpr = window.devicePixelRatio || 1;
    const cssW = container.getBoundingClientRect().width;
    const cssH = container.getBoundingClientRect().height;

    // Phase 1: solid color wipes bottom→top over the scratched canvas
    const wipe1Duration = 350;
    // Phase 2: fresh content wipes bottom→top
    const wipe2Duration = 400;
    const start = performance.now();

    // Snapshot the scratched canvas so we can composite
    const scratchedData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    cancelAnimationFrame(healAnimRef.current);

    const step = (now: number) => {
      const elapsed = now - start;

      if (elapsed < wipe1Duration) {
        // Phase 1: wipe solid bg color up from bottom
        const t = elapsed / wipe1Duration;
        const ease = 1 - (1 - t) * (1 - t); // ease-out
        const wipeY = cssH * (1 - ease); // top edge of the wipe

        // Restore scratched state first
        ctx.putImageData(scratchedData, 0, 0);

        // Draw solid bg rect from wipeY to bottom
        ctx.save();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, wipeY, cssW, cssH - wipeY);
        ctx.restore();

        healAnimRef.current = requestAnimationFrame(step);
      } else if (elapsed < wipe1Duration + wipe2Duration) {
        // Phase 2: redraw fresh canvas, clip to wipe region from bottom
        const t2 = (elapsed - wipe1Duration) / wipe2Duration;
        const ease2 = 1 - (1 - t2) * (1 - t2);
        const wipeY2 = cssH * (1 - ease2);

        // Start with solid bg
        ctx.save();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, cssW, cssH);
        ctx.restore();

        // Draw fresh content clipped to the revealed region
        // We need to temporarily redraw the full content, so save/init/clip
        initCanvas();

        // Now mask out everything above the wipe line
        ctx.save();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, cssW, wipeY2);
        ctx.restore();

        healAnimRef.current = requestAnimationFrame(step);
      } else {
        // Done — full fresh canvas
        initCanvas();
        setHealing(false);
      }
    };

    healAnimRef.current = requestAnimationFrame(step);
  }, [initCanvas, bgColor]);

  // Tap the revealed card to heal it back
  const handleRevealedTap = () => {
    if (!revealed || healing) return;
    heal();
  };

  const reset = () => {
    if (healing) return;
    heal();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        ref={containerRef}
        onClick={handleRevealedTap}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "195 / 190",
          borderRadius: "var(--card-radius)",
          overflow: "hidden",
          cursor: revealed ? "pointer" : "crosshair",
          touchAction: "none",
        }}
      >
        {/* Bottom layer: the answer on a lighter shade */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: lightenHex(bgColor, 0.3),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--card-padding)",
          }}
        >
          <div
            className="type-headline"
            style={{
              color: "#000",
              textAlign: "center",
            }}
          >
            {answer}
          </div>
        </div>

        {/* Top layer: scratch canvas */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            opacity: revealed ? 0 : 1,
            transition: "opacity 0.5s ease",
            pointerEvents: revealed || healing ? "none" : "auto",
          }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />

        {/* Top-right icon: matches CardHeader placement (padding-inset, --close-btn-size hit area) */}
        <button
          style={{
            position: "absolute",
            top: "var(--card-padding)",
            right: "var(--card-padding)",
            width: "var(--close-btn-size)",
            height: "var(--close-btn-size)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            background: "none",
            border: "none",
            padding: 0,
            pointerEvents: hasScratched && !revealed ? "auto" : "none",
            cursor: hasScratched && !revealed ? "pointer" : "default",
          }}
          onClick={(e) => {
            if (hasScratched && !revealed) {
              e.stopPropagation();
              reset();
            }
          }}
        >
          <AnimatePresence mode="wait">
            {!hasScratched ? (
              <motion.div
                key="finger"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.2 }}
              >
                {/* Hand SVG with diagonal scratch hint animation */}
                <motion.svg
                  width="24"
                  height="28"
                  viewBox="0 0 24 28"
                  fill="none"
                  style={{
                    width: "calc(var(--close-btn-size) * 0.45)",
                    height: "auto",
                  }}
                  animate={{
                    // middle → top-right → bottom-left → top-right → middle → pause
                    x: [0, 3, -3, 3, 0, 0],
                    y: [0, -3, 3, -3, 0, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.15, 0.35, 0.55, 0.7, 1],
                  }}
                >
                  <path
                    d="M0.267182 5.15433L4.51495 15.7295L3.26176 16.2379C1.8673 16.8049 0.799594 18.0101 0.40461 19.4641C-0.234476 21.8292 0.996606 24.3058 3.26753 25.2245L7.94572 27.1168C9.32856 27.6761 10.8889 27.5888 12.2007 26.8787L21.0889 22.0676C23.3237 20.8579 24.2957 18.1644 23.3483 15.8064L20.4931 8.69958C19.8011 6.97453 18.0847 6.09134 16.4298 6.59492L10.571 8.25703C10.0789 8.39663 9.5608 8.14238 9.37014 7.66774L7.23563 2.35389C6.84545 1.3842 6.06125 0.614417 5.08388 0.243459C4.10843 -0.126539 3.01093 -0.0736822 2.07488 0.394341C0.337338 1.26119 -0.456475 3.3524 0.267182 5.15433ZM2.95327 2.15495C3.40495 1.93103 3.9143 1.90508 4.38521 2.08384C4.85707 2.26259 5.2213 2.62009 5.40967 3.08811L7.86815 9.21016C8.24943 10.1596 9.28579 10.6682 10.2701 10.3889L16.9853 8.48335C17.6638 8.27481 18.3586 8.66595 18.6671 9.43285L21.2 15.7389C21.9576 17.625 21.1801 19.7795 19.3926 20.7473L12.0796 24.7066C10.7678 25.4168 9.20742 25.5042 7.8245 24.9449L4.0056 23.4005C2.65631 22.8546 1.92496 21.3833 2.30457 19.9783C2.53906 19.1153 3.17335 18.3983 4.00175 18.062L5.24918 17.5565L6.02985 19.5411C6.22805 20.045 6.79374 20.2968 7.30076 20.1068C7.82216 19.9114 8.08056 19.3251 7.873 18.8084L2.09314 4.42011C1.74909 3.56286 2.12678 2.5682 2.95327 2.15495Z"
                    fill={labelColor}
                  />
                </motion.svg>
              </motion.div>
            ) : (
              <motion.div
                key="reset"
                initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              >
                {/* Reset / undo arrow — same 0.35 scale as chevron/X */}
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{
                    width: "calc(var(--close-btn-size) * 0.35)",
                    height: "calc(var(--close-btn-size) * 0.35)",
                  }}
                >
                  <path
                    d="M2.5 2.5v4h4"
                    stroke={labelColor}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2.8 6.5A5.5 5.5 0 1 1 3 10"
                    stroke={labelColor}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Debug info */}
      <span
        style={{
          fontFamily: "'Satoshi-Regular', Helvetica, sans-serif",
          fontSize: 13,
          color: "#555",
        }}
      >
        {revealed
          ? "Revealed — tap card to reset"
          : hasScratched
            ? `${Math.round(scratchPercent * 100)}% — tap ↺ to reset`
            : "Scratch to reveal"}
      </span>
    </div>
  );
}

export function ScratchLab() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.UTILITY.BACKGROUND_DARK,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        gap: 32,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1
          className="type-headline"
          style={{ color: "#fff", marginBottom: 4 }}
        >
          Scratch-Off Reveal
        </h1>
        <p
          className="type-caption"
          style={{ color: "#888" }}
        >
          Swipe to scratch away the question and reveal the answer
        </p>
      </div>

      {/* Card at mobile size */}
      <div style={{ width: 195, maxWidth: "80vw" }}>
        <ScratchCard
          question={RIDDLE.question}
          answer={RIDDLE.answer}
          bgColor={COLORS.RIDDLE.BACKGROUND}
          labelColor={COLORS.RIDDLE.LABEL}
        />
      </div>

      {/* Also show it at a bigger size for easier testing */}
      <div style={{ textAlign: "center" }}>
        <p
          className="type-caption"
          style={{ color: "#666", marginBottom: 8 }}
        >
          Larger preview
        </p>
      </div>
      <div style={{ width: 340, maxWidth: "90vw" }}>
        <ScratchCard
          question={RIDDLE.question}
          answer={RIDDLE.answer}
          bgColor={COLORS.RIDDLE.BACKGROUND}
          labelColor={COLORS.RIDDLE.LABEL}
        />
      </div>
    </div>
  );
}
