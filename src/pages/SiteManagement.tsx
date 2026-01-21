import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, Download, Trash2, ArrowLeft, FileSpreadsheet, 
  AlertCircle, CheckCircle, Search, Building2
} from "lucide-react";
import { toast } from "sonner";
import { fetchSites, insertSites, deleteSite, Site } from "@/lib/siteDatabase";
import { parseSpreadsheet, generateTemplateSpreadsheet } from "@/lib/parseSpreadsheet";
import vivoLogo from "@/assets/vivo-logo.png";

export default function SiteManagement() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [parseErrors, setParseErrors] = React.useState<string[]>([]);
  const [parsedCount, setParsedCount] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [siteToDelete, setSiteToDelete] = React.useState<Site | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Redirect non-admins
  React.useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  const { data: sites = [], isLoading } = useQuery({
    queryKey: ['sites'],
    queryFn: fetchSites,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      toast.success('Site excluído com sucesso');
      setDeleteDialogOpen(false);
      setSiteToDelete(null);
    },
    onError: (error) => {
      toast.error('Erro ao excluir site: ' + (error as Error).message);
    }
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setParseErrors([]);
    setParsedCount(0);

    try {
      const result = await parseSpreadsheet(file);
      setParsedCount(result.sites.length);
      setParseErrors(result.errors);
    } catch (error) {
      setParseErrors([(error as Error).message]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const result = await parseSpreadsheet(selectedFile);
      
      if (result.sites.length === 0) {
        toast.error('Nenhum site válido para importar');
        return;
      }

      const { inserted, duplicates } = await insertSites(result.sites);
      
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      
      toast.success(
        `Importação concluída: ${inserted} sites adicionados` + 
        (duplicates > 0 ? `, ${duplicates} duplicados ignorados` : '')
      );
      
      setSelectedFile(null);
      setParsedCount(0);
      setParseErrors([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error('Erro na importação: ' + (error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const blob = generateTemplateSpreadsheet();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modelo_sites.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Modelo baixado');
  };

  const handleDeleteClick = (site: Site) => {
    setSiteToDelete(site);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (siteToDelete) {
      deleteMutation.mutate(siteToDelete.id);
    }
  };

  const filteredSites = sites.filter(site => 
    site.site_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.uf.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sitesByUf = React.useMemo(() => {
    const grouped: Record<string, number> = {};
    sites.forEach(site => {
      grouped[site.uf] = (grouped[site.uf] || 0) + 1;
    });
    return grouped;
  }, [sites]);

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img src={vivoLogo} alt="Vivo" className="h-6" />
            <h1 className="text-lg font-semibold">Gestão de Sites</h1>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-6xl mx-auto space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-card rounded-lg border p-4 text-center">
            <Building2 className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{sites.length}</p>
            <p className="text-xs text-muted-foreground">Total Sites</p>
          </div>
          {Object.entries(sitesByUf).map(([uf, count]) => (
            <div key={uf} className="bg-card rounded-lg border p-4 text-center">
              <Badge variant="outline" className="mb-2">{uf}</Badge>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs text-muted-foreground">sites</p>
            </div>
          ))}
        </div>

        {/* Upload Section */}
        <div className="bg-card rounded-lg border p-4 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Importar Planilha de Sites
          </h2>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Baixar Modelo
            </Button>

            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="file-upload" className="sr-only">Selecionar arquivo</Label>
              <Input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
            </div>

            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || parsedCount === 0 || isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Importando...' : 'Importar'}
            </Button>
          </div>

          {selectedFile && (
            <div className="text-sm space-y-2">
              {parsedCount > 0 && (
                <p className="text-success flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  {parsedCount} sites válidos encontrados
                </p>
              )}
              {parseErrors.length > 0 && (
                <div className="text-destructive space-y-1">
                  <p className="flex items-center gap-1 font-medium">
                    <AlertCircle className="h-4 w-4" />
                    {parseErrors.length} erro(s):
                  </p>
                  <ul className="list-disc list-inside text-xs max-h-32 overflow-y-auto">
                    {parseErrors.slice(0, 10).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {parseErrors.length > 10 && (
                      <li>...e mais {parseErrors.length - 10} erros</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sites List */}
        <div className="bg-card rounded-lg border">
          <div className="p-4 border-b flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <h2 className="font-semibold">Sites Cadastrados ({filteredSites.length})</h2>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar sites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Carregando sites...
            </div>
          ) : filteredSites.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {sites.length === 0 
                ? 'Nenhum site cadastrado. Importe uma planilha para começar.'
                : 'Nenhum site encontrado com a busca.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>UF</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data Cadastro</TableHead>
                    <TableHead className="w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSites.map((site) => (
                    <TableRow key={site.id}>
                      <TableCell className="font-mono font-semibold">
                        {site.site_code}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{site.uf}</Badge>
                      </TableCell>
                      <TableCell>{site.tipo}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(site.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(site)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Site?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o site <strong>{siteToDelete?.site_code}</strong>?
              Esta ação não pode ser desfeita e removerá todas as atribuições associadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
