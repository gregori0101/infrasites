import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

const CHECKLIST_ITEMS = [
  { id: 'epi_completo', label: 'EPI completo (capacete, luvas, óculos, botas)' },
  { id: 'escada_conferida', label: 'Escada conferida e em bom estado' },
  { id: 'clima_adequado', label: 'Condições climáticas adequadas' },
  { id: 'ferramentas_verificadas', label: 'Ferramentas verificadas e disponíveis' },
  { id: 'sinalizacao_local', label: 'Sinalização do local realizada' },
  { id: 'comunicacao_equipe', label: 'Comunicação com equipe confirmada' },
];

export interface ChecklistData { [key: string]: boolean; }

interface ChecklistSegurancaProps {
  initialData?: ChecklistData;
  onConfirm: (data: ChecklistData) => void;
  readOnly?: boolean;
}

export function ChecklistSeguranca({ initialData, onConfirm, readOnly = false }: ChecklistSegurancaProps) {
  const [checklist, setChecklist] = useState<ChecklistData>(
    initialData || CHECKLIST_ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: false }), {})
  );

  const allChecked = CHECKLIST_ITEMS.every(item => checklist[item.id]);
  const checkedCount = CHECKLIST_ITEMS.filter(item => checklist[item.id]).length;

  const handleToggle = (id: string) => { if (readOnly) return; setChecklist(prev => ({ ...prev, [id]: !prev[id] })); };

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />Checklist de Segurança
          <span className="text-xs text-muted-foreground ml-auto">{checkedCount}/{CHECKLIST_ITEMS.length}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {CHECKLIST_ITEMS.map(item => (
          <label key={item.id} className={`flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer ${checklist[item.id] ? 'bg-primary/10' : 'hover:bg-muted'} ${readOnly ? 'cursor-default' : ''}`}>
            <Checkbox checked={checklist[item.id]} onCheckedChange={() => handleToggle(item.id)} disabled={readOnly} />
            <span className={`text-sm ${checklist[item.id] ? 'line-through text-muted-foreground' : ''}`}>{item.label}</span>
          </label>
        ))}
        {!readOnly && (
          <Button onClick={() => onConfirm(checklist)} disabled={!allChecked} className="w-full mt-2">
            <CheckCircle2 className="w-4 h-4 mr-2" />{allChecked ? 'Confirmar e Iniciar Vistoria' : 'Complete todos os itens'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
