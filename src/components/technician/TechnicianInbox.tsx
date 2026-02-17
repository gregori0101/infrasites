import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useChecklist } from "@/contexts/ChecklistContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, CheckCircle, AlertCircle, Play, Eye, Calendar, History, Loader2, Trophy
} from "lucide-react";
import { 
  fetchTechnicianAssignments, 
  updateAssignmentStatus,
  SiteAssignment 
} from "@/lib/assignmentDatabase";
import { fetchLatestReportBySiteCode, fetchTechnicianStats } from "@/lib/reportDatabase";
import { reportToChecklistWithoutPhotos } from "@/lib/reportToChecklist";
import { PrefillDialog } from "@/components/ui/prefill-dialog";
import { toast } from "sonner";
import { ChecklistData } from "@/types/checklist";
import { TechnicianRankCard } from "./TechnicianRankCard";

interface TechnicianInboxProps {
  onStartChecklist: (assignment: SiteAssignment, prefillData?: ChecklistData) => void;
}

export function TechnicianInbox({ onStartChecklist }: TechnicianInboxProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [checkingPrefill, setCheckingPrefill] = React.useState<string | null>(null);
  const [pendingAssignment, setPendingAssignment] = React.useState<SiteAssignment | null>(null);
  const [prefillData, setPrefillData] = React.useState<ChecklistData | null>(null);
  const [lastInspectionDate, setLastInspectionDate] = React.useState<string | null>(null);
  const [showPrefillDialog, setShowPrefillDialog] = React.useState(false);
  
  const { data: assignments = [], isLoading, refetch } = useQuery({
    queryKey: ['technician-assignments', user?.id],
    queryFn: () => user ? fetchTechnicianAssignments(user.id) : Promise.resolve([]),
    enabled: !!user,
  });

  const { data: techStats } = useQuery({
    queryKey: ['technician-stats', user?.id],
    queryFn: () => user ? fetchTechnicianStats(user.id) : Promise.resolve(null),
    enabled: !!user,
  });

  const getStatusColor = (status: string, deadline: string) => {
    const isOverdue = new Date(deadline) < new Date() && status !== 'concluido';
    
    if (isOverdue) return 'border-destructive bg-destructive/5';
    
    switch (status) {
      case 'pendente': return 'border-muted-foreground/30';
      case 'em_andamento': return 'border-warning bg-warning/5';
      case 'concluido': return 'border-success bg-success/5';
      default: return 'border-border';
    }
  };

  const getStatusBadge = (status: string, deadline: string) => {
    const isOverdue = new Date(deadline) < new Date() && status !== 'concluido';
    
    if (isOverdue) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <AlertCircle className="h-3 w-3" /> Atrasado
      </Badge>;
    }
    
    switch (status) {
      case 'pendente':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" /> Pendente
        </Badge>;
      case 'em_andamento':
        return <Badge className="bg-warning text-warning-foreground flex items-center gap-1">
          <Play className="h-3 w-3" /> Em Andamento
        </Badge>;
      case 'concluido':
        return <Badge className="bg-success text-success-foreground flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> Concluído
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDaysInfo = (deadline: string, status: string) => {
    if (status === 'concluido') return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    
    const diff = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff < 0) {
      return <span className="text-destructive font-medium">{Math.abs(diff)} dia(s) atrasado</span>;
    }
    if (diff === 0) return <span className="text-warning font-medium">Vence hoje</span>;
    if (diff === 1) return <span className="text-warning">Vence amanhã</span>;
    if (diff <= 3) return <span className="text-muted-foreground">{diff} dias restantes</span>;
    return <span className="text-muted-foreground">{diff} dias restantes</span>;
  };

  const handleStartChecklist = async (assignment: SiteAssignment) => {
    if (!assignment.site?.site_code) {
      toast.error('Site inválido');
      return;
    }

    setCheckingPrefill(assignment.id);
    
    try {
      // Check for previous report
      const previousReport = await fetchLatestReportBySiteCode(assignment.site.site_code);
      
      if (previousReport) {
        // Found previous report - show dialog
        const checklistData = reportToChecklistWithoutPhotos(previousReport);
        setPrefillData(checklistData);
        setLastInspectionDate(previousReport.created_at || null);
        setPendingAssignment(assignment);
        setShowPrefillDialog(true);
      } else {
        // No previous report - start directly
        await startChecklist(assignment);
      }
    } catch (error) {
      console.error('Error checking for previous report:', error);
      // On error, just start without prefill
      await startChecklist(assignment);
    } finally {
      setCheckingPrefill(null);
    }
  };

  const startChecklist = async (assignment: SiteAssignment, withPrefillData?: ChecklistData) => {
    try {
      // Store assignment ID for linking after completion
      sessionStorage.setItem('currentAssignmentId', assignment.id);
      
      if (assignment.status === 'pendente') {
        await updateAssignmentStatus(assignment.id, 'em_andamento');
        refetch();
      }
      onStartChecklist(assignment, withPrefillData);
    } catch (error) {
      toast.error('Erro ao iniciar checklist');
    }
  };

  const handleUsePreviousData = async () => {
    if (pendingAssignment && prefillData) {
      await startChecklist(pendingAssignment, prefillData);
      toast.success('Dados da vistoria anterior carregados!', {
        description: 'As fotos e assinatura precisam ser capturadas novamente.',
      });
    }
    setShowPrefillDialog(false);
    setPendingAssignment(null);
    setPrefillData(null);
  };

  const handleStartFresh = async () => {
    if (pendingAssignment) {
      await startChecklist(pendingAssignment);
    }
    setShowPrefillDialog(false);
    setPendingAssignment(null);
    setPrefillData(null);
  };

  // Separate assignments by status
  const pendingAssignments = assignments.filter(a => 
    a.status === 'pendente' || a.status === 'em_andamento'
  );
  const completedAssignments = assignments.filter(a => 
    (a.status as string) === 'concluido'
  );

  if (isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Carregando suas vistorias...
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="p-6 text-center">
        <Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-muted-foreground">
          Nenhuma vistoria atribuída a você ainda.
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Aguarde seu gestor atribuir sites para vistoria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Gamification Card */}
      {techStats && <TechnicianRankCard stats={techStats} />}
      
      {/* Link to full ranking page */}
      <Button
        variant="outline"
        className="w-full flex items-center gap-2"
        onClick={() => navigate('/ranking')}
      >
        <Trophy className="h-4 w-4" />
        Ver Ranking Completo
      </Button>

      {/* Pending/In Progress Section */}
      {pendingAssignments.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Vistorias Pendentes ({pendingAssignments.length})
          </h3>
          
          {pendingAssignments.map((assignment) => (
            <div
              key={assignment.id}
              className={`rounded-lg border-2 p-4 transition-all ${getStatusColor(assignment.status, assignment.deadline)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-lg">
                      {assignment.site?.site_code}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {assignment.site?.uf}
                    </Badge>
                    {getStatusBadge(assignment.status, assignment.deadline)}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-1">
                    {assignment.site?.tipo}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Prazo: {new Date(assignment.deadline).toLocaleDateString('pt-BR')}</span>
                    <span className="mx-1">•</span>
                    {getDaysInfo(assignment.deadline, assignment.status)}
                  </div>
                </div>
                
                <Button
                  size="sm"
                  onClick={() => handleStartChecklist(assignment)}
                  disabled={checkingPrefill === assignment.id}
                >
                  {checkingPrefill === assignment.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Play className="h-4 w-4 mr-1" />
                  )}
                  {assignment.status === 'em_andamento' ? 'Continuar' : 'Iniciar'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completed Section */}
      {completedAssignments.length > 0 && (
        <div className="space-y-3 mt-6">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Vistorias Concluídas ({completedAssignments.length})
          </h3>
          
          {completedAssignments.slice(0, 5).map((assignment) => (
            <div
              key={assignment.id}
              className={`rounded-lg border p-3 ${getStatusColor(assignment.status, assignment.deadline)}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="font-mono font-semibold">
                    {assignment.site?.site_code}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {assignment.site?.uf}
                  </Badge>
                </div>
                
                <span className="text-xs text-muted-foreground">
                  {assignment.completed_at 
                    ? new Date(assignment.completed_at).toLocaleDateString('pt-BR')
                    : 'Concluído'}
                </span>
              </div>
            </div>
          ))}
          
          {completedAssignments.length > 5 && (
            <p className="text-sm text-muted-foreground text-center">
              E mais {completedAssignments.length - 5} vistorias concluídas
            </p>
          )}
        </div>
      )}

      {/* Prefill Dialog */}
      <PrefillDialog
        open={showPrefillDialog}
        onOpenChange={setShowPrefillDialog}
        siteCode={pendingAssignment?.site?.site_code || ''}
        lastInspectionDate={lastInspectionDate}
        onUsePreviousData={handleUsePreviousData}
        onStartFresh={handleStartFresh}
      />
    </div>
  );
}
