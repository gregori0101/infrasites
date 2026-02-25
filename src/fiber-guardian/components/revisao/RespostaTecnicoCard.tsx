import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RevisaoReparo, FotoReparo } from '@/fiber-guardian/types/database';
import { User, Camera, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RespostaTecnicoCardProps {
  revisao: RevisaoReparo;
  fotosCorrecao: FotoReparo[];
}

export function RespostaTecnicoCard({ revisao, fotosCorrecao }: RespostaTecnicoCardProps) {
  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary" />Resposta do Técnico
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="w-4 h-4" />
          <span className="font-medium">{revisao.profiles?.nome || 'Técnico'}</span>
          <span>•</span>
          <span>{format(new Date(revisao.criado_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
        </div>
        <div className="p-3 rounded-lg bg-background border">
          <p className="text-sm whitespace-pre-wrap">{revisao.mensagem}</p>
        </div>
        {fotosCorrecao.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Camera className="w-4 h-4" />Fotos da correção ({fotosCorrecao.length})
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {fotosCorrecao.map((foto) => (
                <a key={foto.id} href={foto.caminho_arquivo} target="_blank" rel="noopener noreferrer"
                  className="aspect-square rounded-lg overflow-hidden bg-muted hover:opacity-90 transition-opacity ring-2 ring-primary/20">
                  <img src={foto.caminho_arquivo} alt={foto.titulo || 'Foto da correção'} className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
