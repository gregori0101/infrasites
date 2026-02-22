import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaginationControls, usePagination } from "@/components/ui/pagination-controls";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, ScrollText, RefreshCw, Loader2 } from "lucide-react";

const ACTION_LABELS: Record<string, string> = {
  user_approved: "Usuário aprovado",
  user_rejected: "Usuário rejeitado",
  user_role_changed: "Cargo alterado",
  user_operadora_changed: "Empresa alterada",
  user_area_changed: "Área alterada",
  user_access_revoked: "Acesso revogado",
  report_deleted: "Relatório excluído",
  assignment_created: "Atribuição criada",
  assignment_deleted: "Atribuição excluída",
  password_reset_admin: "Senha resetada (admin)",
};

const ACTION_COLORS: Record<string, string> = {
  user_approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  user_rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  user_access_revoked: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  report_deleted: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  assignment_created: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  assignment_deleted: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  password_reset_admin: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  details: Record<string, any>;
  created_at: string;
}

export default function ActivityLogs() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [actionFilter, setActionFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Fetch user emails for display
  const { data: emailMap = {} } = useQuery({
    queryKey: ["logs-user-emails"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return {};
      const { data } = await supabase.functions.invoke("get-user-emails", {
        body: { userIds: [] },
      });
      return (data as any)?.emails || {};
    },
    staleTime: 60_000,
  });

  const {
    data: logs = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["activity-logs", actionFilter, dateFrom, dateTo],
    queryFn: async () => {
      let query = supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      if (actionFilter !== "all") {
        query = query.eq("action", actionFilter);
      }
      if (dateFrom) {
        query = query.gte("created_at", new Date(dateFrom).toISOString());
      }
      if (dateTo) {
        query = query.lte("created_at", new Date(dateTo + "T23:59:59").toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as ActivityLog[];
    },
    enabled: isAdmin,
    staleTime: 30_000,
  });

  const { totalPages, getPageItems, totalItems } = usePagination(logs, ITEMS_PER_PAGE);
  const paginatedLogs = getPageItems(currentPage);

  if (!isAdmin) {
    navigate("/");
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Logs de Atividade | InfraSites</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-card border-b shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <ScrollText className="h-5 w-5 text-primary" />
              <h1 className="font-bold text-lg">Logs de Atividade</h1>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto p-4 space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Ação</Label>
                  <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setCurrentPage(1); }}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {Object.entries(ACTION_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">De</Label>
                  <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }} className="h-9" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Até</Label>
                  <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }} className="h-9" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ScrollText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>Nenhum log encontrado</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data/Hora</TableHead>
                          <TableHead>Usuário</TableHead>
                          <TableHead>Ação</TableHead>
                          <TableHead>Alvo</TableHead>
                          <TableHead>Detalhes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="whitespace-nowrap text-sm">
                              {format(parseISO(log.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                            </TableCell>
                            <TableCell className="text-sm">
                              <span className="truncate max-w-[150px] block" title={emailMap[log.user_id] || log.user_id}>
                                {emailMap[log.user_id]?.split("@")[0] || log.user_id.slice(0, 8)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                ACTION_COLORS[log.action] || "bg-muted text-muted-foreground"
                              }`}>
                                {ACTION_LABELS[log.action] || log.action}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {log.target_type}
                              {log.target_id && (
                                <span className="font-mono text-xs ml-1">
                                  ({log.target_id.slice(0, 8)})
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                              {log.details && Object.keys(log.details).length > 0
                                ? Object.entries(log.details)
                                    .map(([k, v]) => `${k}: ${v}`)
                                    .join(", ")
                                : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={totalItems}
                    itemsPerPage={ITEMS_PER_PAGE}
                    showingLabel="logs"
                  />
                </>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}
