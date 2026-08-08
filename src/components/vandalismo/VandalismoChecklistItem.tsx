import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { VandalismoItemDef, VandalismoItemState } from '@/types/vandalismo';
import { VandalismoPhotoGrid } from './VandalismoPhotoGrid';

interface Props {
  def: VandalismoItemDef;
  state: VandalismoItemState;
  onChange: (next: VandalismoItemState) => void;
  siteCode?: string;
  opcional?: boolean;
}

export function VandalismoChecklistItem({ def, state, onChange, siteCode, opcional }: Props) {
  const vulneravel = state.vulneravel;
  const faltaFoto = state.fotos.length < def.minFotos;

  return (
    <Card
      className={cn(
        'border-l-4 transition-colors',
        vulneravel ? 'border-l-destructive' : state.fotos.length > 0 ? 'border-l-emerald-500' : 'border-l-muted',
      )}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium text-sm text-foreground">{def.rotulo}</p>
            <p className="text-xs text-muted-foreground">
              {opcional ? 'Opcional' : `Mínimo ${def.minFotos} foto(s)`}
              {!opcional && faltaFoto && ' — pendente'}
            </p>
          </div>
          {vulneravel ? (
            <Badge variant="destructive" className="shrink-0">
              <ShieldAlert className="h-3 w-3 mr-1" /> Vulnerável
            </Badge>
          ) : (
            <Badge className="shrink-0 bg-emerald-600 hover:bg-emerald-600 text-white">
              <ShieldCheck className="h-3 w-3 mr-1" /> Não Vulnerável
            </Badge>
          )}
        </div>

        <VandalismoPhotoGrid
          value={state.fotos}
          onChange={(fotos) => onChange({ ...state, fotos })}
          category={`vandalismo_${def.key}`}
          siteCode={siteCode}
          max={def.maxFotos}
        />

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={!vulneravel ? 'default' : 'outline'}
            className={cn(!vulneravel && 'bg-emerald-600 hover:bg-emerald-700 text-white')}
            size="sm"
            onClick={() => onChange({ ...state, vulneravel: false })}
          >
            <ShieldCheck className="h-4 w-4 mr-2" /> Não Vulnerável
          </Button>
          <Button
            type="button"
            variant={vulneravel ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => onChange({ ...state, vulneravel: true })}
          >
            <ShieldAlert className="h-4 w-4 mr-2" /> Vulnerável
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
