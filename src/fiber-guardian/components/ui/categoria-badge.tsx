import { Badge } from '@/components/ui/badge';
import { CategoriaReparo } from '@/fiber-guardian/types/database';
import { Wrench, TrendingUp, HardHat } from 'lucide-react';

interface CategoriaBadgeProps {
  categoria: CategoriaReparo;
}

const categoriaConfig: Record<CategoriaReparo, { label: string; className: string; icon: typeof Wrench }> = {
  manutencao: {
    label: 'Manutenção',
    className: 'bg-primary/10 text-primary border-primary/30',
    icon: Wrench,
  },
  melhoria: {
    label: 'Melhoria',
    className: 'bg-secondary text-secondary-foreground border-secondary',
    icon: TrendingUp,
  },
  obras: {
    label: 'Obras',
    className: 'bg-accent/10 text-accent border-accent/30',
    icon: HardHat,
  },
};

export function CategoriaBadge({ categoria }: CategoriaBadgeProps) {
  const config = categoriaConfig[categoria];
  const Icon = config.icon;
  
  return (
    <Badge variant="outline" className={`${config.className} gap-1`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}
