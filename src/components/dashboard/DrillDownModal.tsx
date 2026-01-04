import React, { useState } from "react";
import { X, Download, Search, ChevronLeft, ChevronRight } from "lucide-react";
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
import { SiteInfo, BatteryInfo, ACInfo } from "./types";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  type: "sites" | "batteries" | "acs";
  sites?: SiteInfo[];
  batteries?: BatteryInfo[];
  acs?: ACInfo[];
  onExport?: () => void;
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
  onExport,
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

  const totalItems =
    type === "sites"
      ? filteredSites?.length || 0
      : type === "batteries"
      ? filteredBatteries?.length || 0
      : filteredACs?.length || 0;

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const startIdx = page * PAGE_SIZE;
  const endIdx = startIdx + PAGE_SIZE;

  const paginatedSites = filteredSites?.slice(startIdx, endIdx);
  const paginatedBatteries = filteredBatteries?.slice(startIdx, endIdx);
  const paginatedACs = filteredACs?.slice(startIdx, endIdx);

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
              {onExport && (
                <Button variant="outline" size="sm" onClick={onExport}>
                  <Download className="w-4 h-4 mr-1" />
                  Exportar
                </Button>
              )}
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

        <div className="flex-1 overflow-auto mt-4">
          {type === "sites" && paginatedSites && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site</TableHead>
                  <TableHead>UF</TableHead>
                  <TableHead>Técnico</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Gabinetes</TableHead>
                  <TableHead>Status</TableHead>
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
          )}

          {type === "batteries" && paginatedBatteries && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site</TableHead>
                  <TableHead>Gab</TableHead>
                  <TableHead>Fabricante</TableHead>
                  <TableHead>Capacidade</TableHead>
                  <TableHead>Fabricação</TableHead>
                  <TableHead>Idade</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBatteries.map((b, idx) => (
                  <TableRow key={`${b.siteCode}-${b.gabinete}-${b.banco}-${idx}`}>
                    <TableCell className="font-medium">{b.siteCode}</TableCell>
                    <TableCell>G{b.gabinete}</TableCell>
                    <TableCell>{b.fabricante}</TableCell>
                    <TableCell>{b.capacidade}Ah</TableCell>
                    <TableCell>{b.dataFabricacao}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {b.idade > 0 ? `${b.idade} anos` : "N/A"}
                        {getObsolescenceBadge(b.obsolescencia)}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(b.estado)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {type === "acs" && paginatedACs && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site</TableHead>
                  <TableHead>UF</TableHead>
                  <TableHead>Gabinete</TableHead>
                  <TableHead>AC #</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Status</TableHead>
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
