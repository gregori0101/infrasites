import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock, AlertCircle } from 'lucide-react';
import { VivoLogo } from '@/components/ui/vivo-logo';

interface PasswordGateProps {
  onAuthenticated: () => void;
}

const CORRECT_PASSWORD = 'vivonorte';

export default function PasswordGate({ onAuthenticated }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === CORRECT_PASSWORD) {
      // Store authentication in sessionStorage (clears when browser closes)
      sessionStorage.setItem('checklist_authenticated', 'true');
      onAuthenticated();
    } else {
      setError(true);
      setAttempts(prev => prev + 1);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <VivoLogo className="h-12 w-auto" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <Lock className="h-5 w-5" />
            Acesso Restrito
          </CardTitle>
          <CardDescription>
            Informe a senha para acessar o sistema de checklist
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Digite a senha..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                className={error ? 'border-destructive' : ''}
                autoFocus
              />
              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Senha incorreta. {attempts >= 3 ? 'Verifique com o administrador.' : 'Tente novamente.'}</span>
                </div>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={!password.trim()}>
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
