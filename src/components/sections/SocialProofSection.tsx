interface SocialProofSectionProps {
  content: {
    stats: Array<{
      label: string;
      value: string;
    }>;
  };
  onUpdate: (content: any) => void;
}

export function SocialProofSection({ content }: SocialProofSectionProps) {
  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">Trusted by Businesses</h2>
          <p className="text-muted-foreground">
            Join hundreds of satisfied customers
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {content.stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
