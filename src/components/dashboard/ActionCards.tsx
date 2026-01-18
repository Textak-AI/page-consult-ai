import { Link } from 'react-router-dom';
import { MessageSquare, Zap, Palette, PlayCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionCard {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  onClick?: () => void;
  gradient: string;
  primary?: boolean;
}

interface ActionCardsProps {
  onQuickPivot: () => void;
}

export function ActionCards({ onQuickPivot }: ActionCardsProps) {
  const cards: ActionCard[] = [
    {
      title: "New Strategy Session",
      description: "Build a page from strategic consultation",
      icon: MessageSquare,
      href: "/new",
      gradient: "from-primary to-secondary",
      primary: true
    },
    {
      title: "Quick Pivot",
      description: "Personalize for a specific prospect",
      icon: Zap,
      href: "#",
      onClick: onQuickPivot,
      gradient: "from-secondary to-accent"
    },
    {
      title: "Brand Setup",
      description: "Configure colors, logos, and voice",
      icon: Palette,
      href: "/brand-setup",
      gradient: "from-warning to-destructive"
    },
    {
      title: "Practice Demo",
      description: "Try the experience without commitment",
      icon: PlayCircle,
      href: "/try",
      gradient: "from-success to-primary"
    }
  ];

  const cardClasses = cn(
    "group relative rounded-xl p-5 transition-all duration-300 text-left w-full",
    "bg-card border border-border",
    "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5",
    "focus:outline-none focus:ring-2 focus:ring-primary/50"
  );

  const CardContent = ({ card }: { card: ActionCard }) => (
    <>
      <div className={cn(
        "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none",
        `bg-gradient-to-br ${card.gradient}`
      )} />
      
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
        `bg-gradient-to-br ${card.gradient} opacity-20`
      )}>
        <card.icon className="w-5 h-5 text-foreground" />
      </div>
      
      <h3 className="font-semibold text-foreground mb-1">{card.title}</h3>
      <p className="text-sm text-muted-foreground">{card.description}</p>
      
      <ArrowRight className="absolute bottom-5 right-5 w-4 h-4 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-1 transition-all" />
    </>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => 
        card.onClick ? (
          <button
            key={card.title}
            onClick={card.onClick}
            type="button"
            className={cardClasses}
          >
            <CardContent card={card} />
          </button>
        ) : (
          <Link
            key={card.title}
            to={card.href}
            className={cardClasses}
          >
            <CardContent card={card} />
          </Link>
        )
      )}
    </div>
  );
}
