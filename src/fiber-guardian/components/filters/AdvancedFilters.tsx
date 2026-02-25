import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Filter, X, Search, Mail, ArrowUpDown } from 'lucide-react';
import { CAUSAS, STATUS, CATEGORIAS, TIPOS_REDE } from '@/fiber-guardian/lib/constants';
import { FGProfile } from '@/fiber-guardian/types/database';
import { MultiSelectFilter } from './MultiSelectFilter';

export type EmailFilter = 'all' | 'pendente' | 'enviado';
export type RncFilter = 'all' | 'sem_rnc' | 'alerta_rnc' | 'rnc_aplicada';
export type SortBy = 'data_recente' | 'data_antiga' | 'tecnico_az' | 'ta_az';

export interface AdvancedFiltersState {
  searchTerm: string;
  trecho: string;
  causas: string[];
  statusList: string[];
  categorias: string[];
  tiposRede: string[];
  tecnicoIds: string[];
  emailStatus: EmailFilter;
  dateFrom: string;
  dateTo: string;
  conclusaoTa: string;
  caixaBomba: string;
  rncStatus: RncFilter;
  sortBy: SortBy;
}

interface AdvancedFiltersProps {
  filters: AdvancedFiltersState;
  onFiltersChange: (filters: AdvancedFiltersState) => void;
  technicians: FGProfile[];
  onClear: () => void;
}

export const defaultFilters: AdvancedFiltersState = {
  searchTerm: '',
  trecho: '',
  causas: [],
  statusList: [],
  categorias: [],
  tiposRede: [],
  tecnicoIds: [],
  emailStatus: 'all',
  dateFrom: '',
  dateTo: '',
  conclusaoTa: 'all',
  caixaBomba: 'all',
  rncStatus: 'all',
  sortBy: 'data_recente',
};

export function AdvancedFilters({ filters, onFiltersChange, technicians, onClear }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters =
    filters.searchTerm || filters.trecho || filters.causas.length > 0 ||
    filters.statusList.length > 0 || filters.categorias.length > 0 ||
    filters.tiposRede.length > 0 || filters.tecnicoIds.length > 0 ||
    filters.emailStatus !== 'all' || filters.dateFrom || filters.dateTo ||
    filters.conclusaoTa !== 'all' || filters.caixaBomba !== 'all' || filters.rncStatus !== 'all';

  const activeFiltersCount = [
    filters.searchTerm, filters.trecho, filters.causas.length > 0,
    filters.statusList.length > 0, filters.categorias.length > 0,
    filters.tiposRede.length > 0, filters.tecnicoIds.length > 0,
    filters.emailStatus !== 'all', filters.dateFrom, filters.dateTo,
    filters.conclusaoTa !== 'all', filters.caixaBomba !== 'all', filters.rncStatus !== 'all',
  ].filter(Boolean).length;

  const technicianOptions = technicians.map((tech) => ({
    value: tech.id,
    label: tech.nome,
  }));

  return (
    <Card className="transition-all duration-200">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros Avançados
                {activeFiltersCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </CardTitle>
              {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar por TA..." value={filters.searchTerm}
                  onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })} className="pl-10" />
              </div>
              <Input placeholder="Buscar por Trecho (ex: PACRE X PAOTM)" value={filters.trecho}
                onChange={(e) => onFiltersChange({ ...filters, trecho: e.target.value })} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Causa</Label>
                <MultiSelectFilter label="Causas" options={CAUSAS} selected={filters.causas}
                  onChange={(values) => onFiltersChange({ ...filters, causas: values })} placeholder="Todas as causas" />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <MultiSelectFilter label="Categorias" options={CATEGORIAS} selected={filters.categorias}
                  onChange={(values) => onFiltersChange({ ...filters, categorias: values })} placeholder="Todas as categorias" />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <MultiSelectFilter label="Status" options={STATUS} selected={filters.statusList}
                  onChange={(values) => onFiltersChange({ ...filters, statusList: values })} placeholder="Todos os status" />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Rede</Label>
                <MultiSelectFilter label="Tipos de Rede" options={TIPOS_REDE} selected={filters.tiposRede}
                  onChange={(values) => onFiltersChange({ ...filters, tiposRede: values })} placeholder="Todos os tipos" />
              </div>
              <div className="space-y-2">
                <Label>Técnico</Label>
                <MultiSelectFilter label="Técnicos" options={technicianOptions} selected={filters.tecnicoIds}
                  onChange={(values) => onFiltersChange({ ...filters, tecnicoIds: values })} placeholder="Todos os técnicos" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Mail className="w-4 h-4" />Status Email</Label>
                <Select value={filters.emailStatus} onValueChange={(value) => onFiltersChange({ ...filters, emailStatus: value as EmailFilter })}>
                  <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pendente">Email Pendente</SelectItem>
                    <SelectItem value="enviado">Email Enviado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Conclusão TA</Label>
                <Select value={filters.conclusaoTa} onValueChange={(value) => onFiltersChange({ ...filters, conclusaoTa: value })}>
                  <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="definitivo">Definitivo</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Caixa Bomba</Label>
                <Select value={filters.caixaBomba} onValueChange={(value) => onFiltersChange({ ...filters, caixaBomba: value })}>
                  <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status RNC</Label>
                <Select value={filters.rncStatus} onValueChange={(value) => onFiltersChange({ ...filters, rncStatus: value as RncFilter })}>
                  <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="sem_rnc">Sem RNC</SelectItem>
                    <SelectItem value="alerta_rnc">Alerta RNC</SelectItem>
                    <SelectItem value="rnc_aplicada">RNC Aplicada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data de</Label>
                <Input type="date" value={filters.dateFrom} onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Data até</Label>
                <Input type="date" value={filters.dateTo} onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })} />
              </div>
            </div>

            {hasActiveFilters && (
              <Button variant="outline" onClick={onClear} className="w-full">
                <X className="w-4 h-4 mr-2" />Limpar Filtros
              </Button>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      {!isOpen && (
        <CardContent className="pt-0">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar por TA..." value={filters.searchTerm}
                onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })} className="pl-10" />
            </div>
            <MultiSelectFilter label="Causas" options={CAUSAS} selected={filters.causas}
              onChange={(values) => onFiltersChange({ ...filters, causas: values })} placeholder="Causa" className="w-[150px]" />
            <MultiSelectFilter label="Status" options={STATUS} selected={filters.statusList}
              onChange={(values) => onFiltersChange({ ...filters, statusList: values })} placeholder="Status" className="w-[150px]" />
            <Select value={filters.sortBy} onValueChange={(value) => onFiltersChange({ ...filters, sortBy: value as SortBy })}>
              <SelectTrigger className="w-[180px]">
                <ArrowUpDown className="w-4 h-4 mr-1" /><SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="data_recente">Mais recente</SelectItem>
                <SelectItem value="data_antiga">Mais antigo</SelectItem>
                <SelectItem value="tecnico_az">Técnico A-Z</SelectItem>
                <SelectItem value="ta_az">TA A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
