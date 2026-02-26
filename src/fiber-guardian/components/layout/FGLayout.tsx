import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FGBottomNav } from './FGBottomNav';
import { ConnectionStatus } from '@/fiber-guardian/components/ui/connection-status';
import { VivoLogo } from '@/components/ui/vivo-logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface FGLayoutProps {
  children: ReactNode;
  title: string;
  pageTitle?: string;
  subtitle?: string;
  showBack?: boolean;
  backTo?: string | number;
  headerRight?: ReactNode;
}

export function FGLayout({
  children,
  title,
  pageTitle,
  subtitle,
  showBack = true,
  backTo,
  headerRight,
}: FGLayoutProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (typeof backTo === 'number') {
      navigate(backTo as number);
    } else if (typeof backTo === 'string') {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle || title} | Auditoria TA</title>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col pb-16">
        <header className="border-b bg-card px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3 min-w-0">
            {showBack && (
              <Button variant="ghost" size="icon" onClick={handleBack} className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-foreground truncate">{title}</h1>
              {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {headerRight}
            <ConnectionStatus />
            <VivoLogo className="h-7 w-auto" />
          </div>
        </header>

        <main className="flex-1 p-4 space-y-4">
          {children}
        </main>

        <FGBottomNav />
      </div>
    </>
  );
}
