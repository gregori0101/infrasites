import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { VivoLogo } from '@/components/ui/vivo-logo';
import { Loader2, LogIn, UserPlus, AlertCircle, CheckCircle, Building2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet';


type Operadora = 'VIVO' | 'TEL';

type ViewMode = 'login' | 'signup';

export default function Login() {
  const [viewMode, setViewMode] = useState<ViewMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [operadora, setOperadora] = useState<Operadora>('VIVO');
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { signIn, signUp, refreshRole } = useAuth();

  const isLogin = viewMode === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!isLogin && password !== confirmPassword) {
      setError('As senhas não coincidem');
      setIsLoading(false);
      return;
    }

    if (!isLogin && !lgpdConsent) {
      setError('Você precisa aceitar a Política de Privacidade para se cadastrar');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error, data } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('Email ou senha incorretos');
          } else {
            setError(error.message);
          }
        } else if (data?.user) {
          // Check if user is approved
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('approved')
            .eq('user_id', data.user.id)
            .single();
          
          // Refresh the auth context role
          await refreshRole();
          
          if (roleData?.approved) {
            // Approved user - go directly to checklist
            navigate('/');
          } else {
            // Not approved - go to pending approval page
            navigate('/pending-approval');
          }
        }
      } else {
        const { error, data: signUpData } = await signUp(email, password);
        if (error) {
          if (error.message.includes('User already registered')) {
            setError('Este email já está cadastrado');
          } else {
            setError(error.message);
          }
        } else if (signUpData?.user) {
          // Update user_roles with operadora and LGPD consent after signup
          await supabase
            .from('user_roles')
            .update({ 
              operadora,
              lgpd_consent: true,
              lgpd_consent_at: new Date().toISOString(),
            })
            .eq('user_id', signUpData.user.id);
          
          setSuccess('Cadastro realizado! Aguarde a aprovação de um gestor para acessar o sistema.');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          setOperadora('VIVO');
          setLgpdConsent(false);
        }
      }
    } catch (err) {
      setError('Erro ao processar sua solicitação');
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    return isLogin ? 'Entrar no Sistema' : 'Criar Conta';
  };

  const getDescription = () => {
    return isLogin
      ? 'Acesse o sistema de checklist de sites'
      : 'Cadastre-se para acessar o sistema (requer aprovação)';
  };

  return (
    <>
      <Helmet>
        <title>{isLogin ? 'Login' : 'Cadastro'} | InfraSites Vivo</title>
      </Helmet>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <VivoLogo className="h-12 w-auto" />
            </div>
            <CardTitle className="text-xl">{getTitle()}</CardTitle>
            <CardDescription>{getDescription()}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                )}

                {!isLogin && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Empresa <span className="text-destructive">*</span>
                    </Label>
                    <Select value={operadora} onValueChange={(value: Operadora) => setOperadora(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VIVO">VIVO</SelectItem>
                        <SelectItem value="TEL">TEL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {!isLogin && (
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="lgpd-consent"
                      checked={lgpdConsent}
                      onCheckedChange={(checked) => setLgpdConsent(checked === true)}
                    />
                    <Label htmlFor="lgpd-consent" className="text-sm leading-snug cursor-pointer">
                      Li e concordo com a{' '}
                      <Link to="/privacidade" target="_blank" className="text-primary underline underline-offset-2 hover:text-primary/80">
                        Política de Privacidade
                      </Link>{' '}
                      e o tratamento dos meus dados pessoais conforme a LGPD.
                    </Label>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-md">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : isLogin ? (
                    <LogIn className="w-4 h-4 mr-2" />
                  ) : (
                    <UserPlus className="w-4 h-4 mr-2" />
                  )}
                  {isLogin ? 'Entrar' : 'Cadastrar'}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
                    onClick={() => {
                      setViewMode(isLogin ? 'signup' : 'login');
                      setError('');
                      setSuccess('');
                    }}
                  >
                    {isLogin
                      ? 'Não tem conta? Cadastre-se'
                      : 'Já tem conta? Faça login'}
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
