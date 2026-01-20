import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { VivoLogo } from '@/components/ui/vivo-logo';
import { Clock, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useState } from 'react';

export default function PendingApproval() {
  const { user, signOut, refreshRole, isApproved } = useAuth();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshRole();
    setIsRefreshing(false);
    
    // If now approved, redirect to home
    if (isApproved) {
      navigate('/');
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <>
      <Helmet>
        <title>Aguardando Aprovação | InfraSites Vivo</title>
      </Helmet>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <VivoLogo className="h-12 w-auto" />
            </div>
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
            </div>
            <CardTitle className="text-xl">Aguardando Aprovação</CardTitle>
            <CardDescription className="text-base">
              Seu cadastro foi recebido com sucesso! Um gestor precisa aprovar seu acesso ao sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
              <p><strong>Email:</strong> {user?.email}</p>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Verificar Status
              </Button>
              
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
