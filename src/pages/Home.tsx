import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardCheck, FileSearch, UserCircle, LayoutDashboard, Cable, Radar, ShieldAlert, Globe, Network, ChevronRight } from "lucide-react";
import { VivoLogo } from "@/components/ui/vivo-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ToolAction {
  label: string;
  path: string;
  managerOnly?: boolean;
}

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  hoverBorder: string;
  path: string;
  actions: ToolAction[];
}

const tools: Tool[] = [
  {
    id: "vistoria-site",
    title: "Vistoria Site",
    description: "Checklist de inspeção de sites e gabinetes de telecomunicações",
    icon: ClipboardCheck,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    hoverBorder: "hover:border-primary/50",
    path: "/checklist",
    actions: [
      { label: "Checklist", path: "/checklist" },
      { label: "Painel Gestor", path: "/dashboard", managerOnly: true },
    ],
  },
  {
    id: "check-vandalismo",
    title: "Check Vandalismo",
    description: "Vistoria de estações vandalizadas e registro de vulnerabilidades",
    icon: ShieldAlert,
    iconColor: "text-destructive",
    iconBg: "bg-destructive/10",
    hoverBorder: "hover:border-destructive/50",
    path: "/check-vandalismo",
    actions: [
      { label: "Checklist", path: "/check-vandalismo" },
      { label: "Painel Gestor", path: "/check-vandalismo/gestor", managerOnly: true },
      { label: "Mapa", path: "/check-vandalismo/mapa" },
    ],
  },
  {
    id: "auditoria-os",
    title: "Auditoria OS",
    description: "Auditoria de ordens de serviço",
    icon: FileSearch,
    iconColor: "text-primary",
    iconBg: "bg-accent/50",
    hoverBorder: "hover:border-primary/50",
    path: "/auditoria",
    actions: [
      { label: "Checklist", path: "/auditoria" },
      { label: "Painel Gestor", path: "/auditoria/dashboard", managerOnly: true },
    ],
  },
  {
    id: "auditoria-ta",
    title: "Auditoria TA",
    description: "Registro e auditoria de reparos de fibra óptica",
    icon: Cable,
    iconColor: "text-primary",
    iconBg: "bg-primary/15",
    hoverBorder: "hover:border-primary/50",
    path: "/auditoria-ta",
    actions: [
      { label: "Checklist", path: "/auditoria-ta/novo-registro" },
      { label: "Painel Gestor", path: "/auditoria-ta/admin", managerOnly: true },
],
  },
  {
    id: "painel-monitoramento",
    title: "Painel de Monitoramento",
    description: "Monitoramento da rede Norte — ERBs, backbone, riscos e indisponibilidades",
    icon: Radar,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100",
    hoverBorder: "hover:border-purple-500/50",
    path: "/monitoramento",
    actions: [
      { label: "Abrir Painel", path: "/monitoramento" },
    ],
  },
  {
    id: "backbone",
    title: "Backbone Norte",
    description: "Visualização e acompanhamento do backbone da rede Norte",
    icon: Network,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    hoverBorder: "hover:border-primary/50",
    path: "/backbone",
    actions: [
      { label: "Abrir Painel", path: "/backbone" },
    ],
  },
];

const sections: { title: string; subtitle: string; toolIds: string[] }[] = [
  {
    title: "Vistorias",
    subtitle: "Checklists de campo",
    toolIds: ["vistoria-site", "check-vandalismo"],
  },
  {
    title: "Auditorias",
    subtitle: "Ordens de serviço e reparos",
    toolIds: ["auditoria-os", "auditoria-ta"],
  },
  {
    title: "Painéis & Monitoramento",
    subtitle: "Acompanhamento da rede",
    toolIds: ["painel-monitoramento", "backbone"],
  },
];

export default function Home() {
  const { isGestor, isAdmin } = useAuth();
  const navigate = useNavigate();
  const isManager = isAdmin || isGestor;

  return (
    <>
      <Helmet>
        <title>Início | InfraSites Vivo</title>
        <meta name="description" content="Central de ferramentas: vistorias, auditorias e monitoramento da rede Norte." />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b bg-card px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <VivoLogo className="h-8 w-auto" />
          <div className="flex items-center gap-2">
            {isManager && (
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <LayoutDashboard className="h-5 w-5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => navigate("/perfil")}>
              <UserCircle className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6">
          <div className="w-full max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-1 pt-2">
              <h1 className="text-2xl font-bold text-foreground">O que deseja fazer?</h1>
              <p className="text-muted-foreground text-sm">Selecione uma ferramenta para iniciar</p>
            </div>

            {sections.map((section) => {
              const sectionTools = tools.filter((t) => section.toolIds.includes(t.id));
              return (
                <section key={section.title} className="space-y-3">
                  <div className="flex items-baseline justify-between px-1">
                    <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
                      {section.title}
                    </h2>
                    <span className="text-xs text-muted-foreground">{section.subtitle}</span>
                  </div>

                  <div className="grid gap-3">
                    {sectionTools.map((tool) => {
                      const Icon = tool.icon;
                      const visibleActions = tool.actions.filter(
                        (a) => !a.managerOnly || isManager
                      );
                      return (
                        <Card
                          key={tool.id}
                          className={cn(
                            "cursor-pointer border-2 border-transparent transition-all duration-200 active:scale-[0.98]",
                            tool.hoverBorder,
                            "hover:shadow-lg"
                          )}
                          onClick={() => navigate(tool.path)}
                        >
                          <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                            <div className={cn("flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center", tool.iconBg)}>
                              <Icon className={cn("h-6 w-6", tool.iconColor)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground">{tool.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {tool.description}
                              </p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {visibleActions.map((action) => (
                                  <Button
                                    key={action.path + action.label}
                                    variant={action.managerOnly ? "outline" : "secondary"}
                                    size="sm"
                                    className={cn(
                                      "h-7 text-xs font-bold",
                                      action.managerOnly && "border-primary/30 text-primary hover:bg-primary/5"
                                    )}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(action.path);
                                    }}
                                  >
                                    {action.label}
                                    <ChevronRight className="h-3 w-3 ml-1" />
                                  </Button>
                                ))}
                              </div>
                            </div>
                            <ChevronRight className="flex-shrink-0 h-5 w-5 text-muted-foreground/50 hidden sm:block" />
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </main>

        {/* Floating Forum Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            size="lg"
            className="rounded-full h-14 w-14 shadow-2xl animate-bounce hover:animate-none bg-primary hover:bg-primary/90"
            onClick={() => navigate("/forum")}
          >
            <Globe className="hidden" />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary-foreground">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </Button>
        </div>
      </div>
    </>
  );
}
