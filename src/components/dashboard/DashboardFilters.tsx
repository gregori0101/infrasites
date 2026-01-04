import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { DashboardFilters as FiltersType } from "./types";

interface Props {
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
  uniqueUFs: string[];
  uniqueTechnicians: string[];
}

export function DashboardFiltersBar({ filters, onFiltersChange, uniqueUFs, uniqueTechnicians }: Props) {
  const hasActiveFilters = 
    filters.technician || 
    filters.stateUf !== "all" || 
    filters.status !== "all" ||
    filters.dateRange.from ||
    filters.dateRange.to;

  const clearFilters = () => {
    onFiltersChange({
      dateRange: { from: undefined, to: undefined },
      technician: "",
      stateUf: "all",
      status: "all",
    });
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-sm">Filtros Globais</span>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs">
            <X className="w-3 h-3 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Date Range */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Período</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-9 text-sm",
                  !filters.dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, "dd/MM", { locale: ptBR })} -{" "}
                      {format(filters.dateRange.to, "dd/MM", { locale: ptBR })}
                    </>
                  ) : (
                    format(filters.dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                  )
                ) : (
                  "Selecionar"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{
                  from: filters.dateRange.from,
                  to: filters.dateRange.to,
                }}
                onSelect={(range) =>
                  onFiltersChange({
                    ...filters,
                    dateRange: { from: range?.from, to: range?.to },
                  })
                }
                numberOfMonths={2}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Technician */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Técnico</Label>
          <Select
            value={filters.technician || "_all_"}
            onValueChange={(v) =>
              onFiltersChange({ ...filters, technician: v === "_all_" ? "" : v })
            }
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all_">Todos</SelectItem>
              {uniqueTechnicians.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* UF/Region */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">UF / Região</Label>
          <Select
            value={filters.stateUf}
            onValueChange={(v) => onFiltersChange({ ...filters, stateUf: v })}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {uniqueUFs.map((uf) => (
                <SelectItem key={uf} value={uf}>
                  {uf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select
            value={filters.status}
            onValueChange={(v) =>
              onFiltersChange({ ...filters, status: v as "all" | "ok" | "nok" })
            }
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ok">Sem Problemas</SelectItem>
              <SelectItem value="nok">Com Problemas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quick Stats */}
        <div className="flex items-end">
          <div className="text-xs text-muted-foreground">
            {hasActiveFilters && (
              <span className="text-primary font-medium">Filtros ativos</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
