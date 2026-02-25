import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useReparos } from '@/fiber-guardian/hooks/useReparos';
import { getCausaLabel, getConclusaoLabel, getCategoriaLabel } from '@/fiber-guardian/lib/constants';
import { getStatusLabel } from '@/fiber-guardian/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function ExportarExcel() {
  const navigate = useNavigate();
  const { reparos, loading } = useReparos();
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    setExporting(true);
    try {
      const data = reparos.map(r => ({
        'TA': r.ta_titulo,
        'Trecho': r.trecho || '',
        'Causa': getCausaLabel(r.causa),
        'Categoria': getCategoriaLabel(r.categoria),
        'Status': getStatusLabel(r.status),
        'Conclusão': getConclusaoLabel(r.conclusao_ta),
        'Técnico': r.profiles?.nome || '',
        'Caixa Bomba': r.caixa_bomba ? 'Sim' : 'Não',
        'Tipo Rede': r.tipo_rede?.toUpperCase() || '',
        'Observações': r.observacoes || '',
        'Criado em': format(new Date(r.criado_em), 'dd/MM/yyyy HH:mm'),
        'Latitude': r.latitude || '',
        'Longitude': r.longitude || '',
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'Reparos');
      XLSX.writeFile(wb, `reparos_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
      toast.success('Arquivo exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar');
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <Helmet><title>Exportar | Auditoria TA</title></Helmet>
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b bg-card px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">Exportar Dados</h1>
        </header>

        <main className="flex-1 p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Exportar para Excel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Exporta todos os {reparos.length} registro(s) visíveis para um arquivo Excel.
              </p>
              <Button onClick={handleExport} disabled={exporting || loading || reparos.length === 0} className="w-full">
                {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Exportar Excel
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}
