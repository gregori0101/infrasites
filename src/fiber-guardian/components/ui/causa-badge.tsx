import { Badge } from '@/components/ui/badge';
import { CausaReparo } from '@/fiber-guardian/types/database';
import { getCausaLabel, CAUSA_COLORS } from '@/fiber-guardian/lib/constants';

interface CausaBadgeProps {
  causa: CausaReparo;
  className?: string;
}

export function CausaBadge({ causa, className }: CausaBadgeProps) {
  const color = CAUSA_COLORS[causa] || '#6b7280';
  
  return (
    <Badge 
      className={`border-0 text-white ${className || ''}`}
      style={{ backgroundColor: color }}
    >
      {getCausaLabel(causa)}
    </Badge>
  );
}
