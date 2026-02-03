import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Site, updateSite } from "@/lib/siteDatabase";
import { toast } from "sonner";

interface SiteEditDialogProps {
  site: Site | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function SiteEditDialog({ site, open, onOpenChange, onSuccess }: SiteEditDialogProps) {
  const [siteCode, setSiteCode] = React.useState("");
  const [uf, setUf] = React.useState("");
  const [tipo, setTipo] = React.useState("");
  const [municipio, setMunicipio] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (site) {
      setSiteCode(site.site_code);
      setUf(site.uf);
      setTipo(site.tipo);
      setMunicipio(site.municipio || "");
    }
  }, [site]);

  const handleSave = async () => {
    if (!site) return;

    if (!siteCode.trim() || !uf.trim() || !tipo.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsLoading(true);
    try {
      await updateSite(site.id, {
        site_code: siteCode.toUpperCase().trim(),
        uf: uf.toUpperCase().trim(),
        tipo: tipo.trim(),
        municipio: municipio.trim() || undefined,
      });
      toast.success("Site atualizado com sucesso");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao atualizar site: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Site</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="site-code">Código do Site *</Label>
            <Input
              id="site-code"
              value={siteCode}
              onChange={(e) => setSiteCode(e.target.value)}
              placeholder="Ex: PACRE"
              className="uppercase"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="uf">UF *</Label>
            <Input
              id="uf"
              value={uf}
              onChange={(e) => setUf(e.target.value)}
              placeholder="Ex: PA"
              maxLength={2}
              className="uppercase"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="municipio">Município</Label>
            <Input
              id="municipio"
              value={municipio}
              onChange={(e) => setMunicipio(e.target.value)}
              placeholder="Ex: Belém"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo *</Label>
            <Input
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              placeholder="Ex: Indoor, Outdoor, Rooftop"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
