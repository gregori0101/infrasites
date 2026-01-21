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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, UserPlus, Calendar, Search, Trash2, 
  Clock, CheckCircle, AlertCircle, Building2, ChevronsUpDown, Check
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  fetchAssignments, 
  createAssignment, 
  deleteAssignment, 
  getAllSites,
  fetchTechnicians,
  SiteAssignment,
  AssignmentStatus
} from "@/lib/assignmentDatabase";
import vivoLogo from "@/assets/vivo-logo.png";

interface Technician {
  id: string;
  email: string;
}

export default function AssignmentManagement() {
  const navigate = useNavigate();
  const { isGestor, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<string>("all");
  const [assignDialogOpen, setAssignDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = React.useState<SiteAssignment | null>(null);
  const [sitePopoverOpen, setSitePopoverOpen] = React.useState(false);
  
  // Assignment form state
  const [selectedSite, setSelectedSite] = React.useState("");
  const [selectedTechnician, setSelectedTechnician] = React.useState("");
  const [deadline, setDeadline] = React.useState("");

  // Redirect unauthorized users
  React.useEffect(() => {
    if (!isGestor && !isAdmin) {
      navigate('/');
    }
  }, [isGestor, isAdmin, navigate]);

  const { data: assignments = [], isLoading: loadingAssignments } = useQuery({
    queryKey: ['assignments'],
    queryFn: fetchAssignments,
  });

  const { data: allSites = [] } = useQuery({
    queryKey: ['all-sites'],
    queryFn: getAllSites,
  });

  const { data: technicians = [] } = useQuery({
    queryKey: ['technicians'],
    queryFn: fetchTechnicians,
  });

  const createMutation = useMutation({
    mutationFn: createAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['all-sites'] });
      toast.success('Vistoria atribuída com sucesso');
      setAssignDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Erro ao atribuir: ' + (error as Error).message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['all-sites'] });
      toast.success('Atribuição removida');
      setDeleteDialogOpen(false);
      setAssignmentToDelete(null);
    },
    onError: (error) => {
      toast.error('Erro ao remover: ' + (error as Error).message);
    }
  });

  const resetForm = () => {
    setSelectedSite("");
    setSelectedTechnician("");
    setDeadline("");
  };

  const handleAssign = () => {
    if (!selectedSite || !selectedTechnician || !deadline) {
      toast.error('Preencha todos os campos');
      return;
    }
    
    createMutation.mutate({
      site_id: selectedSite,
      technician_id: selectedTechnician,
      deadline: deadline
    });
  };

  const getStatusBadge = (status: AssignmentStatus, deadline: string) => {
    const statusStr = status as string;
    const isOverdue = new Date(deadline) < new Date() && statusStr !== 'concluido';
    
    if (isOverdue && statusStr !== 'concluido') {
      return <Badge variant="destructive">Atrasado</Badge>;
    }
    
    switch (statusStr) {
      case 'pendente':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'em_andamento':
        return <Badge className="bg-warning text-warning-foreground">Em Andamento</Badge>;
      case 'concluido':
        return <Badge className="bg-success text-success-foreground">Concluído</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    
    const diff = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff < 0) return `${Math.abs(diff)} dia(s) atrasado`;
    if (diff === 0) return 'Hoje';
    if (diff === 1) return 'Amanhã';
    return `${diff} dias`;
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      assignment.site?.site_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.site?.uf.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const stats = React.useMemo(() => {
    const pending = assignments.filter(a => a.status === 'pendente').length;
    const inProgress = assignments.filter(a => a.status === 'em_andamento').length;
    const completed = assignments.filter(a => (a.status as string) === 'concluido').length;
    const overdue = assignments.filter(a => 
      (a.status as string) !== 'concluido' && new Date(a.deadline) < new Date()
    ).length;
    return { pending, inProgress, completed, overdue };
  }, [assignments]);

  if (!isGestor && !isAdmin) return null;

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
            <h1 className="text-lg font-semibold">Atribuir Vistorias</h1>
          </div>
          <Button onClick={() => setAssignDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Nova Atribuição
          </Button>
        </div>
      </header>

      <main className="p-4 max-w-6xl mx-auto space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-card rounded-lg border p-4 text-center">
            <Clock className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </div>
          <div className="bg-card rounded-lg border p-4 text-center">
            <Building2 className="h-5 w-5 mx-auto mb-2 text-warning" />
            <p className="text-2xl font-bold">{stats.inProgress}</p>
            <p className="text-xs text-muted-foreground">Em Andamento</p>
          </div>
          <div className="bg-card rounded-lg border p-4 text-center">
            <CheckCircle className="h-5 w-5 mx-auto mb-2 text-success" />
            <p className="text-2xl font-bold">{stats.completed}</p>
            <p className="text-xs text-muted-foreground">Concluídos</p>
          </div>
          <div className="bg-card rounded-lg border p-4 text-center">
            <AlertCircle className="h-5 w-5 mx-auto mb-2 text-destructive" />
            <p className="text-2xl font-bold">{stats.overdue}</p>
            <p className="text-xs text-muted-foreground">Atrasados</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por site ou UF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pendente">Pendentes</SelectItem>
              <SelectItem value="em_andamento">Em Andamento</SelectItem>
              <SelectItem value="concluido">Concluídos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Assignments Table */}
        <div className="bg-card rounded-lg border">
          {loadingAssignments ? (
            <div className="p-8 text-center text-muted-foreground">
              Carregando atribuições...
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {assignments.length === 0 
                ? 'Nenhuma vistoria atribuída ainda.'
                : 'Nenhuma atribuição encontrada com os filtros.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>UF</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prazo</TableHead>
                    <TableHead>Tempo</TableHead>
                    <TableHead className="w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-mono font-semibold">
                        {assignment.site?.site_code}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{assignment.site?.uf}</Badge>
                      </TableCell>
                      <TableCell>{assignment.site?.tipo}</TableCell>
                      <TableCell>
                        {getStatusBadge(assignment.status, assignment.deadline)}
                      </TableCell>
                      <TableCell>
                        {new Date(assignment.deadline).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className={
                        new Date(assignment.deadline) < new Date() && assignment.status !== 'concluido'
                          ? 'text-destructive font-medium'
                          : 'text-muted-foreground'
                      }>
                        {assignment.status === 'concluido' 
                          ? 'Finalizado' 
                          : getDaysRemaining(assignment.deadline)}
                      </TableCell>
                      <TableCell>
                        {assignment.status !== 'concluido' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setAssignmentToDelete(assignment);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>

      {/* New Assignment Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Atribuição de Vistoria</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Site</Label>
              <Popover open={sitePopoverOpen} onOpenChange={setSitePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={sitePopoverOpen}
                    className="w-full justify-between font-normal"
                  >
                    {selectedSite
                      ? (() => {
                          const site = allSites.find((s) => s.id === selectedSite);
                          return site ? `${site.site_code} - ${site.uf} (${site.tipo})` : "Selecione o site";
                        })()
                      : "Selecione o site"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar por sigla do site..." />
                    <CommandList>
                      <CommandEmpty>Nenhum site encontrado.</CommandEmpty>
                      <CommandGroup>
                        {allSites.map((site) => (
                          <CommandItem
                            key={site.id}
                            value={`${site.site_code} ${site.uf} ${site.tipo}`}
                            onSelect={() => {
                              setSelectedSite(site.id);
                              setSitePopoverOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedSite === site.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {site.site_code} - {site.uf} ({site.tipo})
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Técnico Responsável</Label>
              <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o técnico" />
                </SelectTrigger>
                <SelectContent>
                  {technicians.length === 0 ? (
                    <SelectItem value="none" disabled>
                      Nenhum técnico disponível
                    </SelectItem>
                  ) : (
                    technicians.map((tech) => (
                      <SelectItem key={tech.id} value={tech.id}>
                        {tech.email}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prazo</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={createMutation.isPending || !selectedSite || !selectedTechnician || !deadline}
            >
              {createMutation.isPending ? 'Atribuindo...' : 'Atribuir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Atribuição?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover a atribuição do site{' '}
              <strong>{assignmentToDelete?.site?.site_code}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => assignmentToDelete && deleteMutation.mutate(assignmentToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
