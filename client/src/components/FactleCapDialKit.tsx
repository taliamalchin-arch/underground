import { useDialKit } from 'dialkit';
import { COLORS } from '@/lib/colors';

// Tunable Bottle Cap Back — DialKit version
// When you're happy with the values, copy the params below into BottleCapBack component
const FactleCapDialKit = ({ fact = 'Sharks are older than trees', dayNumber = '001' }: {
  fact?: string;
  dayNumber?: string;
}) => {
  const params = useDialKit('Factle Cap Back', {
    // ─────────────────────────────────────────────────────────────
    // CENTER TEXT (Fact)
    // ─────────────────────────────────────────────────────────────
    centerText: {
      x: [450, 350, 550],           // horizontal position
      y: [360, 300, 450],           // vertical position
      fontSize: [80, 40, 100],       // text size
      letterSpacing: [-0.7, -3, 2],    // kerning
      dy: [88, 60, 120],             // vertical gap between lines
    },

    // ─────────────────────────────────────────────────────────────
    // CURVED TEXT (Underground Fact #)
    // ─────────────────────────────────────────────────────────────
    curvedText: {
      x: [0, -100, 100],              // horizontal offset (left-right shift)
      y: [550, 350, 550],            // vertical position (arc baseline)
      fontSize: [24, 20, 50],        // text size
      letterSpacing: [4, 0, 8],      // kerning (tracking)
      arcRadius: [260, 50, 400],     // arc radius (tighter to wider curve)
    },
  });

  // Split fact for display
  const words = fact.split(' ');
  const line1 = words.slice(0, 2).join(' ');
  const line2 = words.slice(2).join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ─────────────────────────────────────────────────────────────
          LIVE PREVIEW
          ───────────────────────────────────────────────────────── */}
      <div style={{ padding: 24, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
        <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 14, fontWeight: 600 }}>
          LIVE PREVIEW
        </h3>
        <svg
          viewBox="0 0 900 900"
          style={{
            width: '100%',
            maxWidth: 400,
            height: 'auto',
            border: '1px solid #ddd',
            borderRadius: 4,
            filter: `drop-shadow(-2px 3px 4px rgba(0,0,0,0.2))`,
          }}
        >
          <defs>
            {/* Arc path for curved text — dynamically positioned */}
            <path
              id="bottomArcPath"
              d={`M ${200 + params.curvedText.x} ${params.curvedText.y} A ${params.curvedText.arcRadius} ${params.curvedText.arcRadius} 0 0 0 ${700 + params.curvedText.x} ${params.curvedText.y}`}
              fill="none"
            />
          </defs>

          {/* SVG image for back cap background */}
          <image href="/figmaAssets/factle-back.svg" width="900" height="900" />

          {/* Center fact text — split into two lines */}
          <text
            x={params.centerText.x}
            y={params.centerText.y}
            textAnchor="middle"
            fill={COLORS.FACTLE.CAP_TEXT_DARK}
            fontSize={params.centerText.fontSize}
            fontFamily="Satoshi-Regular, Helvetica, sans-serif"
            fontWeight="400"
            letterSpacing={params.centerText.letterSpacing}
          >
            <tspan x={params.centerText.x} dy="0">
              {line1}
            </tspan>
            <tspan x={params.centerText.x} dy={params.centerText.dy}>
              {line2}
            </tspan>
          </text>

          {/* Curved text at BOTTOM — UNDERGROUND FACT # */}
          <text
            fill={COLORS.FACTLE.CAP_TEXT_MEDIUM}
            fontSize={params.curvedText.fontSize}
            fontFamily="Sora, sans-serif"
            fontWeight="700"
            letterSpacing={params.curvedText.letterSpacing}
          >
            <textPath xlinkHref="#bottomArcPath" startOffset="50%" textAnchor="middle">
              UNDERGROUND FACT #{dayNumber}
            </textPath>
          </text>
        </svg>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          COPYABLE VALUES
          ───────────────────────────────────────────────────────── */}
      <div style={{ padding: 16, backgroundColor: '#f9f9f9', borderRadius: 8, fontFamily: 'monospace', fontSize: 12 }}>
        <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 12, fontWeight: 600 }}>
          COPY THESE VALUES INTO BottleCapBack
        </h3>
        <pre style={{ margin: 0, overflow: 'auto', backgroundColor: '#fff', padding: 12, borderRadius: 4, border: '1px solid #ddd' }}>
{`// Center text
x: ${params.centerText.x}
y: ${params.centerText.y}
fontSize: ${params.centerText.fontSize}
letterSpacing: "${params.centerText.letterSpacing}"
dy: ${params.centerText.dy}

// Curved text
x: ${params.curvedText.x}
y: ${params.curvedText.y}
fontSize: ${params.curvedText.fontSize}
letterSpacing: "${params.curvedText.letterSpacing}"
arcRadius: ${params.curvedText.arcRadius}

// Arc path template:
d="M ${200 + params.curvedText.x} ${params.curvedText.y} A ${params.curvedText.arcRadius} ${params.curvedText.arcRadius} 0 0 0 ${700 + params.curvedText.x} ${params.curvedText.y}"`}
        </pre>
      </div>
    </div>
  );
};

export default FactleCapDialKit;
