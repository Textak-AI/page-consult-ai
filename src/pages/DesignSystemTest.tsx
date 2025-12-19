import { generateDesignSystem, designSystemToCSSVariables, getDesignSystemMetadata } from "@/config/designSystem";

const DesignSystemTest = () => {
  // Test generating a design system
  const designSystem = generateDesignSystem({
    industry: "manufacturing-industrial",
    tone: "authoritative",
    brandOverrides: {
      primaryColor: "#1E3A5F",
    },
  });

  const cssVariables = designSystemToCSSVariables(designSystem);
  const metadata = getDesignSystemMetadata(designSystem);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-foreground">Design System Test</h1>
        
        {/* Metadata */}
        <section className="p-6 rounded-lg border border-border bg-card">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Metadata</h2>
          <pre className="text-sm text-muted-foreground overflow-auto">
            {JSON.stringify(metadata, null, 2)}
          </pre>
        </section>

        {/* Color Swatches */}
        <section className="p-6 rounded-lg border border-border bg-card">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Colors</h2>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(designSystem.colors).map(([name, color]) => (
              <div key={name} className="space-y-1">
                <div 
                  className="w-full h-12 rounded border border-border" 
                  style={{ backgroundColor: color }}
                />
                <p className="text-xs text-muted-foreground">{name}</p>
                <p className="text-xs font-mono text-foreground">{color}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section className="p-6 rounded-lg border border-border bg-card">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Typography</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Heading:</strong> {designSystem.typography.headingFont} ({designSystem.typography.headingWeight})</p>
            <p><strong>Body:</strong> {designSystem.typography.bodyFont} ({designSystem.typography.bodyWeight})</p>
            <p><strong>Style:</strong> {designSystem.typography.style}</p>
          </div>
        </section>

        {/* CSS Variables Preview */}
        <section className="p-6 rounded-lg border border-border bg-card">
          <h2 className="text-xl font-semibold mb-4 text-foreground">CSS Variables</h2>
          <pre className="text-xs text-muted-foreground overflow-auto max-h-64 p-4 bg-muted rounded">
            {cssVariables}
          </pre>
        </section>

        <p className="text-green-500 font-semibold">✓ Design system loaded successfully!</p>
      </div>
    </div>
  );
};

export default DesignSystemTest;
