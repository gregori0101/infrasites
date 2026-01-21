import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VivoLogo } from '@/components/ui/vivo-logo';
import { 
  ArrowLeft, 
  Check, 
  X, 
  Users, 
  Clock, 
  UserCheck, 
  Shield, 
  Wrench,
  Loader2,
  RefreshCw,
  Mail,
  Calendar,
  UserCog
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface UserWithRole {
  id: string;
  user_id: string;
  email: string;
  role: 'administrador' | 'gestor' | 'tecnico';
  approved: boolean;
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
}

export default function UserManagement() {
  const navigate = useNavigate();
  const { user, isAdmin, userRole } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    userId: string;
    action: 'approve' | 'reject';
    email: string;
  } | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Get all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (rolesError) throw rolesError;

      // Get user IDs to fetch emails
      const userIds = (roles || []).map(r => r.user_id);
      
      // Fetch emails from edge function
      let emailMap: Record<string, string> = {};
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-user-emails`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${sessionData.session?.access_token}`,
              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
            body: JSON.stringify({ userIds }),
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          emailMap = data.emails || {};
        }
      } catch (emailError) {
        console.error('Error fetching emails:', emailError);
      }

      const usersWithRoles: UserWithRole[] = (roles || []).map((role) => ({
        id: role.id,
        user_id: role.user_id,
        email: emailMap[role.user_id] || role.user_id.slice(0, 8) + '...',
        role: role.role as 'administrador' | 'gestor' | 'tecnico',
        approved: role.approved,
        created_at: role.created_at,
        approved_at: role.approved_at,
        approved_by: role.approved_by,
      }));

      setUsers(usersWithRoles);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a lista de usuários',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [isAdmin, navigate]);

  const handleApprove = async (userId: string) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({
          approved: true,
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Usuário aprovado',
        description: 'O usuário agora pode acessar o sistema',
      });
      
      fetchUsers();
    } catch (err) {
      console.error('Error approving user:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível aprovar o usuário',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
      setConfirmDialog(null);
    }
  };

  const handleReject = async (userId: string) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({
          approved: false,
          approved_by: null,
          approved_at: null,
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Acesso revogado',
        description: 'O usuário não pode mais acessar o sistema',
      });
      
      fetchUsers();
    } catch (err) {
      console.error('Error rejecting user:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível revogar o acesso',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
      setConfirmDialog(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'administrador' | 'gestor' | 'tecnico') => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      const roleLabels = {
        administrador: 'Administrador',
        gestor: 'Gestor',
        tecnico: 'Técnico'
      };

      toast({
        title: 'Perfil alterado',
        description: `Usuário agora é ${roleLabels[newRole]}`,
      });
      
      fetchUsers();
    } catch (err) {
      console.error('Error changing role:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o perfil',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const pendingUsers = users.filter(u => !u.approved);
  const approvedUsers = users.filter(u => u.approved);

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Gerenciar Usuários | InfraSites Vivo</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <VivoLogo className="h-8 w-auto" />
            </div>
            <Button variant="outline" size="sm" onClick={fetchUsers} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto p-4 space-y-6">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Gerenciar Usuários</h1>
          </div>

          {/* Pending Approvals */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-lg">Aguardando Aprovação</CardTitle>
              </div>
              <CardDescription>
                {pendingUsers.length} usuário(s) pendente(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : pendingUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum usuário aguardando aprovação
                </p>
              ) : (
                <div className="space-y-3">
                  {pendingUsers.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <p className="font-medium text-sm truncate">{u.email}</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Cadastro: {new Date(u.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          disabled={actionLoading === u.user_id}
                          onClick={() => setConfirmDialog({ 
                            open: true, 
                            userId: u.user_id, 
                            action: 'approve',
                            email: u.user_id 
                          })}
                        >
                          {actionLoading === u.user_id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Approved Users */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-green-500" />
                <CardTitle className="text-lg">Usuários Aprovados</CardTitle>
              </div>
              <CardDescription>
                {approvedUsers.length} usuário(s) ativo(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : approvedUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum usuário aprovado ainda
                </p>
              ) : (
                <div className="space-y-3">
                  {approvedUsers.map((u) => (
                    <div
                      key={u.id}
                      className="p-4 bg-muted/50 rounded-lg space-y-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            {u.role === 'administrador' ? (
                              <UserCog className="h-5 w-5 text-primary" />
                            ) : u.role === 'gestor' ? (
                              <Shield className="h-5 w-5 text-primary" />
                            ) : (
                              <Wrench className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <p className="font-medium text-sm truncate">{u.email}</p>
                              <Badge 
                                variant={u.role === 'administrador' ? 'default' : u.role === 'gestor' ? 'default' : 'secondary'} 
                                className={`text-xs shrink-0 ${u.role === 'administrador' ? 'bg-primary' : ''}`}
                              >
                                {u.role === 'administrador' ? 'Administrador' : u.role === 'gestor' ? 'Gestor' : 'Técnico'}
                              </Badge>
                              {u.user_id === user?.id && (
                                <Badge variant="outline" className="text-xs shrink-0">Você</Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Cadastro: {new Date(u.created_at).toLocaleDateString('pt-BR')} às {new Date(u.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {u.approved_at && (
                                <span className="flex items-center gap-1">
                                  <Check className="h-3 w-3 text-green-500" />
                                  Aprovado: {new Date(u.approved_at).toLocaleDateString('pt-BR')} às {new Date(u.approved_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {u.user_id !== user?.id && (
                          <div className="flex items-center gap-2 shrink-0">
                            <Select
                              value={u.role}
                              onValueChange={(value) => handleRoleChange(u.user_id, value as 'administrador' | 'gestor' | 'tecnico')}
                              disabled={actionLoading === u.user_id}
                            >
                              <SelectTrigger className="w-32 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="tecnico">Técnico</SelectItem>
                                <SelectItem value="gestor">Gestor</SelectItem>
                                <SelectItem value="administrador">Administrador</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={actionLoading === u.user_id}
                              onClick={() => setConfirmDialog({ 
                                open: true, 
                                userId: u.user_id, 
                                action: 'reject',
                                email: u.email 
                              })}
                            >
                              {actionLoading === u.user_id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      <AlertDialog open={confirmDialog?.open} onOpenChange={() => setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog?.action === 'approve' ? 'Aprovar Usuário' : 'Revogar Acesso'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog?.action === 'approve'
                ? 'Este usuário poderá acessar o sistema de checklist. Deseja continuar?'
                : 'Este usuário não poderá mais acessar o sistema. Deseja continuar?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDialog?.action === 'approve') {
                  handleApprove(confirmDialog.userId);
                } else if (confirmDialog) {
                  handleReject(confirmDialog.userId);
                }
              }}
              className={confirmDialog?.action === 'reject' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {confirmDialog?.action === 'approve' ? 'Aprovar' : 'Revogar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
