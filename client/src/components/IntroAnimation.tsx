import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Stage = "hold" | "white" | "blank" | "green" | "exit";

const TIMINGS: Record<Stage, number> = {
  hold: 500,
  white: 400,
  blank: 400,
  green: 1500,
  exit: 500,
};

const STAGE_ORDER: Stage[] = ["hold", "white", "blank", "green", "exit"];

const SIZE = 70;
const STROKE = 8;
const R = 16;
const S = STROKE / 2;

const PATHS: Record<string, string> = {
  topLeft: `M ${S} ${SIZE} V ${R + S} Q ${S} ${S} ${R + S} ${S} H ${SIZE}`,
  topRight: `M ${SIZE - S} ${SIZE} V ${R + S} Q ${SIZE - S} ${S} ${SIZE - R - S} ${S} H 0`,
  bottomLeft: `M ${S} 0 V ${SIZE - R - S} Q ${S} ${SIZE - S} ${R + S} ${SIZE - S} H ${SIZE}`,
  bottomRight: `M ${SIZE - S} 0 V ${SIZE - R - S} Q ${SIZE - S} ${SIZE - S} ${SIZE - R - S} ${SIZE - S} H 0`,
};

const POSITIONS: Record<string, React.CSSProperties> = {
  topLeft: { top: 40, left: 30 },
  topRight: { top: 40, right: 30 },
  bottomLeft: { bottom: 40, left: 30 },
  bottomRight: { bottom: 40, right: 30 },
};

const CornerBracket = ({
  position,
  color,
  glow,
}: {
  position: "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
  color: string;
  glow: string;
}) => (
  <svg
    width={SIZE}
    height={SIZE}
    viewBox={`0 0 ${SIZE} ${SIZE}`}
    fill="none"
    style={{
      position: "absolute",
      ...POSITIONS[position],
      filter: glow,
      transition: "filter 0.15s ease",
    }}
  >
    <path
      d={PATHS[position]}
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

const CORNERS: Array<"topLeft" | "topRight" | "bottomLeft" | "bottomRight"> = [
  "topLeft",
  "topRight",
  "bottomLeft",
  "bottomRight",
];

export const IntroAnimation = ({ onComplete }: { onComplete: () => void }) => {
  const [stage, setStage] = useState<Stage>("hold");
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    let stageIndex = 0;

    const advance = () => {
      stageIndex++;
      if (stageIndex >= STAGE_ORDER.length) {
        setVisible(false);
        return;
      }
      const nextStage = STAGE_ORDER[stageIndex];
      setStage(nextStage);

      setTimeout(advance, TIMINGS[nextStage]);
    };

    setTimeout(advance, TIMINGS[STAGE_ORDER[0]]);
  }, []);

  const getStrokeProps = () => {
    switch (stage) {
      case "white":
        return {
          color: "#ffffff",
          glow: "drop-shadow(0 0 18px rgba(255,255,255,0.8)) drop-shadow(0 0 36px rgba(255,255,255,0.45)) drop-shadow(0 0 60px rgba(255,255,255,0.2))",
          opacity: 1,
        };
      case "green":
      case "exit":
        return {
          color: "#7dde86",
          glow: "drop-shadow(0 0 20px rgba(125,222,134,0.85)) drop-shadow(0 0 40px rgba(125,222,134,0.5)) drop-shadow(0 0 70px rgba(125,222,134,0.25))",
          opacity: 1,
        };
      default:
        return {
          color: "#4169E1",
          glow: "drop-shadow(0 0 18px rgba(65,105,225,0.8)) drop-shadow(0 0 36px rgba(65,105,225,0.45)) drop-shadow(0 0 60px rgba(65,105,225,0.2))",
          opacity: 1,
        };
    }
  };

  const strokeProps = getStrokeProps();
  const isExit = stage === "exit";

  return (
    <AnimatePresence onExitComplete={onComplete}>
        {visible && (
          <motion.div
            key="intro-overlay"
            initial={{ y: "0%" }}
            animate={{ y: isExit ? "-100%" : "0%" }}
            exit={{ y: "-100%" }}
            transition={
              isExit
                ? { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
                : { duration: 0 }
            }
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              backgroundColor: "#171719",
              pointerEvents: "none",
            }}
          >
            {/* Corner brackets */}
            <motion.div
              animate={{ opacity: strokeProps.opacity }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              style={{ position: "absolute", inset: 0 }}
            >
              {CORNERS.map((pos) => (
                <CornerBracket
                  key={pos}
                  position={pos}
                  color={strokeProps.color}
                  glow={strokeProps.glow}
                />
              ))}
            </motion.div>

            {/* Center copy stack */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
              }}
            >
              {/* "Underground" — type-headline */}
              <motion.div
                className="type-headline"
                style={{ color: "white" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.8, 0, 1, 0.1, 0, 0.6, 1] }}
                transition={{
                  duration: 0.6,
                  delay: 0.2,
                  times: [0, 0.1, 0.2, 0.35, 0.45, 0.55, 0.7, 1],
                  ease: "linear",
                }}
              >
                Underground
              </motion.div>
              {/* Subtitle — type-label */}
              <motion.div
                className="type-label"
                style={{ color: "#B8B8BC" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.7, 0, 0.9, 0, 0.5, 0, 1] }}
                transition={{
                  duration: 0.6,
                  delay: 0.45,
                  times: [0, 0.1, 0.2, 0.35, 0.45, 0.6, 0.75, 1],
                  ease: "linear",
                }}
              >
                RIDE THE OFFLINE
              </motion.div>
            </div>
          </motion.div>
        )}
    </AnimatePresence>
  );
};
