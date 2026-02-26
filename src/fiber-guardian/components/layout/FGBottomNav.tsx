import { useNavigate, useLocation } from 'react-router-dom';
import { useFGAuth } from '@/fiber-guardian/hooks/useFGAuth';
import { useSidebarCounts } from '@/fiber-guardian/hooks/useSidebarCounts';
import { Home, Plus, FileText, BarChart3, Map, Trophy, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: number;
  adminOnly?: boolean;
  techOnly?: boolean;
}

export function FGBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useFGAuth();
  const counts = useSidebarCounts();

  const items: NavItem[] = [
    {
      label: 'Início',
      icon: Home,
      path: isAdmin ? '/auditoria-ta/admin' : '/auditoria-ta/tecnico',
    },
    {
      label: 'Novo',
      icon: Plus,
      path: '/auditoria-ta/novo-registro',
      techOnly: true,
    },
    {
      label: 'Reparos',
      icon: FileText,
      path: '/auditoria-ta/meus-reparos',
      techOnly: true,
      badge: counts.revisaoTecnico > 0 ? counts.revisaoTecnico : undefined,
    },
    {
      label: 'Mapa',
      icon: Map,
      path: '/auditoria-ta/mapa',
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      path: '/auditoria-ta/analytics',
    },
    {
      label: 'Ranking',
      icon: Trophy,
      path: '/auditoria-ta/ranking',
    },
    {
      label: 'Exportar',
      icon: Download,
      path: '/auditoria-ta/exportar',
      adminOnly: true,
    },
  ];

  const visibleItems = items.filter(item => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.techOnly && isAdmin) return false;
    return true;
  });

  // Show max 5 items on mobile
  const displayItems = visibleItems.slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t safe-area-bottom">
      <div className="flex items-center justify-around px-1 py-1">
        {displayItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path.includes('/admin') && location.pathname.startsWith('/auditoria-ta/admin')) ||
            (item.path.includes('/tecnico') && location.pathname.startsWith('/auditoria-ta/tecnico'));
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-lg transition-colors min-w-0 flex-1 relative',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 bg-destructive text-destructive-foreground text-[10px] rounded-full h-4 min-w-[16px] flex items-center justify-center px-1 font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium truncate w-full text-center">
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
