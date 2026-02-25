import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Reparo } from '@/fiber-guardian/types/database';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';

interface RelatorioDiarioProps { reparos: Reparo[]; tecnicoNome: string; }

function calcularDistanciaKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function RelatorioDiario({ reparos, tecnicoNome }: RelatorioDiarioProps) {
  const reparosHoje = useMemo(() => reparos.filter(r => isToday(parseISO(r.criado_em)) || isToday(parseISO(r.atualizado_em))), [reparos]);

  const tempoTotalMinutos = useMemo(() => {
    let total = 0;
    reparosHoje.forEach(r => {
      const inicio = (r as any).inicio_trabalho;
      const fim = (r as any).fim_trabalho;
      if (inicio && fim) total += (new Date(fim).getTime() - new Date(inicio).getTime()) / 60000;
    });
    return Math.round(total);
  }, [reparosHoje]);

  const kmEstimada = useMemo(() => {
    const comCoordenadas = reparosHoje.filter(r => r.latitude && r.longitude)
      .sort((a, b) => new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime());
    let total = 0;
    for (let i = 1; i < comCoordenadas.length; i++) {
      total += calcularDistanciaKm(comCoordenadas[i - 1].latitude!, comCoordenadas[i - 1].longitude!, comCoordenadas[i].latitude!, comCoordenadas[i].longitude!);
    }
    return total.toFixed(1);
  }, [reparosHoje]);

  const formatTempo = (min: number) => { if (min < 60) return `${min}min`; return `${Math.floor(min / 60)}h ${min % 60}min`; };

  const gerarPdf = () => {
    const pdf = new jsPDF();
    let y = 20;
    pdf.setFontSize(18); pdf.setFont('helvetica', 'bold');
    pdf.text('Relatório Diário do Técnico', 105, y, { align: 'center' }); y += 12;
    pdf.setFontSize(12); pdf.setFont('helvetica', 'normal');
    pdf.text(`Técnico: ${tecnicoNome}`, 20, y); y += 8;
    pdf.text(`Data: ${format(new Date(), "dd/MM/yyyy", { locale: ptBR })}`, 20, y); y += 12;
    pdf.text(`Vistorias realizadas: ${reparosHoje.length}`, 20, y); y += 8;
    pdf.text(`Tempo em campo: ${formatTempo(tempoTotalMinutos)}`, 20, y); y += 8;
    pdf.text(`Distância estimada: ${kmEstimada} km`, 20, y); y += 14;
    if (reparosHoje.length > 0) {
      pdf.setFont('helvetica', 'bold'); pdf.text('Detalhes:', 20, y); y += 8;
      pdf.setFont('helvetica', 'normal');
      reparosHoje.forEach(r => { if (y > 270) { pdf.addPage(); y = 20; } pdf.text(`• TA: ${r.ta_titulo} - ${r.causa} - ${r.status}`, 25, y); y += 7; });
    }
    pdf.save(`relatorio-diario-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast.success('PDF gerado!');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />Resumo do Dia
          <span className="text-xs text-muted-foreground ml-auto">{format(new Date(), "dd/MM", { locale: ptBR })}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <CheckCircle2 className="w-4 h-4 mx-auto text-[hsl(var(--fg-status-concluido))] mb-1" />
            <p className="text-lg font-bold">{reparosHoje.length}</p>
            <p className="text-[10px] text-muted-foreground">Vistorias</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <Clock className="w-4 h-4 mx-auto text-primary mb-1" />
            <p className="text-lg font-bold">{formatTempo(tempoTotalMinutos)}</p>
            <p className="text-[10px] text-muted-foreground">Em campo</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <MapPin className="w-4 h-4 mx-auto text-primary mb-1" />
            <p className="text-lg font-bold">{kmEstimada}</p>
            <p className="text-[10px] text-muted-foreground">km estimados</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full" onClick={gerarPdf}>
          <FileText className="w-4 h-4 mr-2" />Gerar PDF do Dia
        </Button>
      </CardContent>
    </Card>
  );
}
