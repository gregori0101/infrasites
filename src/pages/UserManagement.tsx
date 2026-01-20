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
  RefreshCw 
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
  role: 'gestor' | 'tecnico';
  approved: boolean;
  created_at: string;
}

export default function UserManagement() {
  const navigate = useNavigate();
  const { user, isGestor } = useAuth();
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

      // Get emails from auth metadata - for now use a workaround
      // Since we can't query auth.users directly, we'll display user_id
      const usersWithRoles: UserWithRole[] = (roles || []).map((role) => ({
        id: role.id,
        user_id: role.user_id,
        email: role.user_id.slice(0, 8) + '...', // Placeholder
        role: role.role as 'gestor' | 'tecnico',
        approved: role.approved,
        created_at: role.created_at,
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
    if (!isGestor) {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [isGestor, navigate]);

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

  const handleRoleChange = async (userId: string, newRole: 'gestor' | 'tecnico') => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Perfil alterado',
        description: `Usuário agora é ${newRole === 'gestor' ? 'Gestor' : 'Técnico'}`,
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

  if (!isGestor) {
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
                      <div className="flex-1">
                        <p className="font-medium text-sm">{u.user_id}</p>
                        <p className="text-xs text-muted-foreground">
                          Cadastro: {new Date(u.created_at).toLocaleDateString('pt-BR')}
                        </p>
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
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {u.role === 'gestor' ? (
                            <Shield className="h-4 w-4 text-primary" />
                          ) : (
                            <Wrench className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{u.user_id}</p>
                          <Badge variant={u.role === 'gestor' ? 'default' : 'secondary'} className="text-xs">
                            {u.role === 'gestor' ? 'Gestor' : 'Técnico'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {u.user_id !== user?.id && (
                          <>
                            <Select
                              value={u.role}
                              onValueChange={(value) => handleRoleChange(u.user_id, value as 'gestor' | 'tecnico')}
                              disabled={actionLoading === u.user_id}
                            >
                              <SelectTrigger className="w-28 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="tecnico">Técnico</SelectItem>
                                <SelectItem value="gestor">Gestor</SelectItem>
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
                                email: u.user_id 
                              })}
                            >
                              {actionLoading === u.user_id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                            </Button>
                          </>
                        )}
                        {u.user_id === user?.id && (
                          <Badge variant="outline" className="text-xs">Você</Badge>
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
