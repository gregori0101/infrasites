import React, { useState } from "react";
import { Download, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { SiteInfo, BatteryInfo, ACInfo, GabineteInfo } from "./types";
import { cn } from "@/lib/utils";
import {
  generateSitesExcel,
  generateBatteriesExcel,
  generateACsExcel,
  generateGabinetesExcel,
  downloadDrillDownExcel,
} from "@/lib/generateDrillDownExcel";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  type: "sites" | "batteries" | "acs" | "gabinetes";
  sites?: SiteInfo[];
  batteries?: BatteryInfo[];
  acs?: ACInfo[];
  gabinetes?: GabineteInfo[];
  onSiteClick?: (siteId: string) => void;
}

const PAGE_SIZE = 10;

export function DrillDownModal({
  open,
  onClose,
  title,
  type,
  sites,
  batteries,
  acs,
  gabinetes,
  onSiteClick,
}: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  // Filter based on search
  const filteredSites = sites?.filter(
    (s) =>
      s.siteCode.toLowerCase().includes(search.toLowerCase()) ||
      s.technician.toLowerCase().includes(search.toLowerCase()) ||
      s.uf.toLowerCase().includes(search.toLowerCase())
  );

  const filteredBatteries = batteries?.filter(
    (b) =>
      b.siteCode.toLowerCase().includes(search.toLowerCase()) ||
      b.fabricante.toLowerCase().includes(search.toLowerCase()) ||
      b.uf.toLowerCase().includes(search.toLowerCase())
  );

  const filteredACs = acs?.filter(
    (a) =>
      a.siteCode.toLowerCase().includes(search.toLowerCase()) ||
      a.modelo.toLowerCase().includes(search.toLowerCase()) ||
      a.uf.toLowerCase().includes(search.toLowerCase())
  );

  const filteredGabinetes = gabinetes?.filter(
    (g) =>
      g.siteCode.toLowerCase().includes(search.toLowerCase()) ||
      g.uf.toLowerCase().includes(search.toLowerCase())
  );

  const totalItems =
    type === "sites"
      ? filteredSites?.length || 0
      : type === "batteries"
      ? filteredBatteries?.length || 0
      : type === "gabinetes"
      ? filteredGabinetes?.length || 0
      : filteredACs?.length || 0;

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const startIdx = page * PAGE_SIZE;
  const endIdx = startIdx + PAGE_SIZE;

  const paginatedSites = filteredSites?.slice(startIdx, endIdx);
  const paginatedBatteries = filteredBatteries?.slice(startIdx, endIdx);
  const paginatedACs = filteredACs?.slice(startIdx, endIdx);
  const paginatedGabinetes = filteredGabinetes?.slice(startIdx, endIdx);

  const getStatusBadge = (status: string) => {
    const lower = status.toLowerCase();
    if (lower === "ok") {
      return <Badge className="bg-success text-success-foreground">OK</Badge>;
    }
    if (lower === "nok" || lower.includes("estufada") || lower.includes("vazando") || lower.includes("trincada")) {
      return <Badge className="bg-destructive text-destructive-foreground">{status}</Badge>;
    }
    if (lower.includes("carga")) {
      return <Badge className="bg-warning text-warning-foreground">{status}</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  const getObsolescenceBadge = (obs: "ok" | "warning" | "critical") => {
    if (obs === "ok") return null;
    if (obs === "warning") {
      return <Badge className="bg-warning/20 text-warning border-warning">5-8 anos</Badge>;
    }
    return <Badge className="bg-destructive/20 text-destructive border-destructive">+8 anos</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">{title}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  let blob: Blob;
                  const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, "_");
                  const filename = `${sanitizedTitle}_${new Date().toISOString().split("T")[0]}.xlsx`;

                  if (type === "sites" && filteredSites) {
                    blob = generateSitesExcel(filteredSites, title);
                  } else if (type === "batteries" && filteredBatteries) {
                    blob = generateBatteriesExcel(filteredBatteries, title);
                  } else if (type === "acs" && filteredACs) {
                    blob = generateACsExcel(filteredACs, title);
                  } else if (type === "gabinetes" && filteredGabinetes) {
                    blob = generateGabinetesExcel(filteredGabinetes, title);
                  } else {
                    return;
                  }
                  downloadDrillDownExcel(blob, filename);
                }}
              >
                <Download className="w-4 h-4 mr-1" />
                Exportar Excel
              </Button>
            </div>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="pl-9"
            />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden mt-4 min-h-0">
          {type === "sites" && paginatedSites && (
            <ScrollArea className="h-[calc(85vh-280px)] w-full">
              <div className="min-w-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">Site</TableHead>
                      <TableHead className="min-w-[60px]">UF</TableHead>
                      <TableHead className="min-w-[150px]">Técnico</TableHead>
                      <TableHead className="min-w-[100px]">Data</TableHead>
                      <TableHead className="min-w-[100px]">Gabinetes</TableHead>
                      <TableHead className="min-w-[120px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSites.map((s) => (
                      <TableRow
                        key={s.id}
                        className={cn(onSiteClick && "cursor-pointer hover:bg-muted/50")}
                        onClick={() => onSiteClick?.(s.id)}
                      >
                        <TableCell className="font-medium">{s.siteCode}</TableCell>
                        <TableCell>{s.uf}</TableCell>
                        <TableCell>{s.technician}</TableCell>
                        <TableCell>{s.date}</TableCell>
                        <TableCell>{s.totalCabinets}</TableCell>
                        <TableCell>
                          {s.hasProblems ? (
                            <Badge className="bg-destructive text-destructive-foreground">
                              {s.batteryIssues + s.acIssues} problema(s)
                            </Badge>
                          ) : (
                            <Badge className="bg-success text-success-foreground">OK</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <ScrollBar orientation="vertical" />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}

          {type === "batteries" && paginatedBatteries && (
            <ScrollArea className="h-[calc(85vh-280px)] w-full">
              <div className="min-w-[900px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">Site</TableHead>
                      <TableHead className="min-w-[50px]">UF</TableHead>
                      <TableHead className="min-w-[50px]">Gab</TableHead>
                      <TableHead className="min-w-[100px]">Fabricante</TableHead>
                      <TableHead className="min-w-[80px]">Tipo</TableHead>
                      <TableHead className="min-w-[80px]">Capacidade</TableHead>
                      <TableHead className="min-w-[80px]">Fabricação</TableHead>
                      <TableHead className="min-w-[80px]">Idade</TableHead>
                      <TableHead className="min-w-[100px]">Estado</TableHead>
                      <TableHead className="min-w-[100px]">Autonomia</TableHead>
                      <TableHead className="min-w-[60px]">Troca</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedBatteries.map((b, idx) => (
                      <TableRow key={`${b.siteCode}-${b.gabinete}-${b.banco}-${idx}`}>
                        <TableCell className="font-medium">{b.siteCode}</TableCell>
                        <TableCell>{b.uf}</TableCell>
                        <TableCell>G{b.gabinete}</TableCell>
                        <TableCell>{b.fabricante}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {b.tipoClassificado === "chumbo" ? "Chumbo" : b.tipoClassificado === "litio" ? "Lítio" : "Outro"}
                          </Badge>
                        </TableCell>
                        <TableCell>{b.capacidade}Ah</TableCell>
                        <TableCell>{b.dataFabricacao}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 flex-nowrap">
                            {b.idade > 0 ? `${b.idade} anos` : "N/A"}
                            {getObsolescenceBadge(b.obsolescencia)}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(b.estado)}</TableCell>
                        <TableCell>
                          {b.autonomyRisk === "ok" && <Badge className="bg-success text-success-foreground">OK</Badge>}
                          {b.autonomyRisk === "medio" && <Badge className="bg-warning text-warning-foreground">Médio</Badge>}
                          {b.autonomyRisk === "alto" && <Badge className="bg-orange-500 text-white">Alto</Badge>}
                          {b.autonomyRisk === "critico" && <Badge className="bg-destructive text-destructive-foreground">Crítico</Badge>}
                        </TableCell>
                        <TableCell>
                          {b.needsReplacement ? (
                            <Badge className="bg-destructive text-destructive-foreground">Sim</Badge>
                          ) : (
                            <Badge variant="outline">Não</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <ScrollBar orientation="vertical" />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}

          {type === "acs" && paginatedACs && (
            <ScrollArea className="h-[calc(85vh-280px)] w-full">
              <div className="min-w-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">Site</TableHead>
                      <TableHead className="min-w-[60px]">UF</TableHead>
                      <TableHead className="min-w-[100px]">Gabinete</TableHead>
                      <TableHead className="min-w-[60px]">AC #</TableHead>
                      <TableHead className="min-w-[150px]">Modelo</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedACs.map((a, idx) => (
                      <TableRow key={`${a.siteCode}-${a.gabinete}-${a.acNum}-${idx}`}>
                        <TableCell className="font-medium">{a.siteCode}</TableCell>
                        <TableCell>{a.uf}</TableCell>
                        <TableCell>Gabinete {a.gabinete}</TableCell>
                        <TableCell>AC {a.acNum}</TableCell>
                        <TableCell>{a.modelo}</TableCell>
                        <TableCell>{getStatusBadge(a.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <ScrollBar orientation="vertical" />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}

          {type === "gabinetes" && paginatedGabinetes && (
            <ScrollArea className="h-[calc(85vh-280px)] w-full">
              <div className="min-w-[800px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">Site</TableHead>
                      <TableHead className="min-w-[60px]">UF</TableHead>
                      <TableHead className="min-w-[80px]">Gabinete</TableHead>
                      <TableHead className="min-w-[100px]">Autonomia</TableHead>
                      <TableHead className="min-w-[80px]">Horas</TableHead>
                      <TableHead className="min-w-[120px]">Obsolescência</TableHead>
                      <TableHead className="min-w-[80px]">GMG</TableHead>
                      <TableHead className="min-w-[100px]">Baterias</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedGabinetes.map((g, idx) => (
                      <TableRow key={`${g.siteCode}-${g.gabinete}-${idx}`}>
                        <TableCell className="font-medium">{g.siteCode}</TableCell>
                        <TableCell>{g.uf}</TableCell>
                        <TableCell>G{g.gabinete}</TableCell>
                        <TableCell>
                          {g.autonomyRisk === "ok" && <Badge className="bg-success text-success-foreground">OK</Badge>}
                          {g.autonomyRisk === "medio" && <Badge className="bg-warning text-warning-foreground">Médio</Badge>}
                          {g.autonomyRisk === "alto" && <Badge className="bg-orange-500 text-white">Alto</Badge>}
                          {g.autonomyRisk === "critico" && <Badge className="bg-destructive text-destructive-foreground">Crítico</Badge>}
                        </TableCell>
                        <TableCell>{g.autonomyHours.toFixed(1)}h</TableCell>
                        <TableCell>
                          {g.obsolescenciaRisk === "ok" && <Badge className="bg-success text-success-foreground">OK</Badge>}
                          {g.obsolescenciaRisk === "medio" && <Badge className="bg-warning text-warning-foreground">Médio</Badge>}
                          {g.obsolescenciaRisk === "alto" && <Badge className="bg-destructive text-destructive-foreground">Alto</Badge>}
                          {g.obsolescenciaRisk === "sem_banco" && <Badge variant="outline">Sem Banco</Badge>}
                        </TableCell>
                        <TableCell>
                          {g.hasGMG ? (
                            <Badge className="bg-success text-success-foreground">Sim</Badge>
                          ) : (
                            <Badge variant="outline">Não</Badge>
                          )}
                        </TableCell>
                        <TableCell>{g.totalBatteries}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <ScrollBar orientation="vertical" />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}

          {totalItems === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum registro encontrado
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t pt-4 mt-4 shrink-0">
            <p className="text-sm text-muted-foreground">
              Mostrando {startIdx + 1}-{Math.min(endIdx, totalItems)} de {totalItems}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
