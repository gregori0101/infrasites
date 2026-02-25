import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Check, X } from 'lucide-react';

interface EditableObservationCardProps {
  title: string;
  value: string | undefined;
  onSave: (value: string) => Promise<void>;
  canEdit: boolean;
  placeholder?: string;
}

export function EditableObservationCard({ title, value, onSave, canEdit, placeholder = 'Adicionar observação...' }: EditableObservationCardProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  const handleStartEdit = () => { setEditValue(value || ''); setEditing(true); };
  const handleSave = async () => { setSaving(true); try { await onSave(editValue.trim()); setEditing(false); } finally { setSaving(false); } };
  const handleCancel = () => { setEditing(false); setEditValue(''); };

  if (!value && !canEdit) return null;

  return (
    <Card className="transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          {canEdit && !editing && (
            <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={handleStartEdit}>
              <Edit className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="space-y-2">
            <Textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} placeholder={placeholder} rows={4} autoFocus className="text-sm" />
            <div className="flex items-center gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={handleCancel} disabled={saving}><X className="w-4 h-4 mr-1" />Cancelar</Button>
              <Button size="sm" onClick={handleSave} disabled={saving}><Check className="w-4 h-4 mr-1" />{saving ? 'Salvando...' : 'Salvar'}</Button>
            </div>
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap">{value || <span className="text-muted-foreground italic">Nenhuma observação</span>}</p>
        )}
      </CardContent>
    </Card>
  );
}
