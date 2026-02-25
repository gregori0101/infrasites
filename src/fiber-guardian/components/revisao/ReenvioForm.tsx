import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Send, X, RefreshCw, Plus } from 'lucide-react';
import { PhotoPicker } from '@/fiber-guardian/components/ui/photo-picker';

interface ReenvioFormProps {
  onReenviar: (mensagem: string, fotos: File[]) => Promise<boolean>;
  sending: boolean;
}

export function ReenvioForm({ onReenviar, sending }: ReenvioFormProps) {
  const [mensagem, setMensagem] = useState('');
  const [fotos, setFotos] = useState<File[]>([]);

  const handlePhotosSelected = (files: FileList | null) => {
    if (files) setFotos(prev => [...prev, ...Array.from(files)]);
  };

  const removePhoto = (index: number) => setFotos(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!mensagem.trim()) return;
    const success = await onReenviar(mensagem, fotos);
    if (success) { setMensagem(''); setFotos([]); }
  };

  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-primary" />Reenviar para Aprovação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mensagem-reenvio">Descreva as correções realizadas *</Label>
          <Textarea id="mensagem-reenvio" placeholder="Ex: Realizei os ajustes solicitados..." value={mensagem}
            onChange={(e) => setMensagem(e.target.value)} rows={3} className="resize-none" />
        </div>
        <div className="space-y-2">
          <Label>Novas fotos da correção (opcional)</Label>
          <PhotoPicker onPhotosSelected={handlePhotosSelected} multiple>
            <Button type="button" variant="outline" size="sm" className="w-full"><Plus className="w-4 h-4 mr-2" />Adicionar Foto</Button>
          </PhotoPicker>
          {fotos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {fotos.map((foto, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <img src={URL.createObjectURL(foto)} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md hover:bg-destructive/90 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <Button onClick={handleSubmit} disabled={!mensagem.trim() || sending} className="w-full">
          <Send className="w-4 h-4 mr-2" />{sending ? 'Reenviando...' : 'Reenviar para Aprovação'}
        </Button>
        <p className="text-xs text-muted-foreground text-center">O reparo será reenviado para análise do administrador</p>
      </CardContent>
    </Card>
  );
}
