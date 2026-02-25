import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RotateCcw } from 'lucide-react';

interface RevisaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (comentario: string) => Promise<void>;
  loading?: boolean;
}

export function RevisaoDialog({ open, onOpenChange, onConfirm, loading }: RevisaoDialogProps) {
  const [comentario, setComentario] = useState('');

  const handleConfirm = async () => { await onConfirm(comentario); setComentario(''); };
  const handleOpenChange = (newOpen: boolean) => { if (!newOpen) setComentario(''); onOpenChange(newOpen); };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-[hsl(var(--fg-status-revisao))]" />
            Devolver para Revisão
          </DialogTitle>
          <DialogDescription>Adicione um comentário explicando o que precisa ser corrigido ou complementado pelo técnico.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="comentario">Comentário *</Label>
            <Textarea id="comentario" placeholder="Descreva o que precisa ser feito..." value={comentario}
              onChange={(e) => setComentario(e.target.value)} rows={4} className="resize-none" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={!comentario.trim() || loading}
            className="bg-[hsl(var(--fg-status-revisao))] hover:bg-[hsl(var(--fg-status-revisao))]/90">
            {loading ? 'Enviando...' : 'Devolver para Revisão'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
