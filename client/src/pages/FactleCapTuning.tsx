import FactleCapDialKit from '@/components/FactleCapDialKit';

export const FactleCapTuning = () => {
  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        padding: '48px 24px',
        backgroundColor: '#fafafa',
      }}
    >
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ marginTop: 0, marginBottom: 8, fontSize: 28, fontWeight: 700 }}>
          Factle Cap Text Tuning
        </h1>
        <p style={{ margin: '0 0 32px 0', color: '#666', fontSize: 14 }}>
          Use the sliders in the top-right corner to tune the bottle cap text placement, sizing, and kerning.
          When you're happy, copy the values from the box below and paste them into the <code>BottleCapBack</code> component.
        </p>

        <FactleCapDialKit
          fact="Sharks are older than trees"
          dayNumber="001"
        />

        <div style={{ marginTop: 48, padding: 24, backgroundColor: '#fff', borderRadius: 8, border: '1px solid #ddd' }}>
          <h2 style={{ marginTop: 0, fontSize: 16, fontWeight: 600 }}>How to use:</h2>
          <ol style={{ margin: '16px 0 0 0', paddingLeft: 20, lineHeight: 1.6, fontSize: 14, color: '#333' }}>
            <li>Adjust sliders in the control panel (top-right)</li>
            <li>Watch the preview update in real time</li>
            <li>Copy the final values from the box above</li>
            <li>Paste into <code>BottleCapBack</code> component in Mockup.tsx</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
