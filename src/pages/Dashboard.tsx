import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  ArrowLeft,
  Battery,
  Thermometer,
  Zap,
  Radio,
  Trash2,
  MapPin,
  AlertTriangle,
  Building2,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VivoLogo } from "@/components/ui/vivo-logo";
import { fetchReportsForDashboard, ReportRow } from "@/lib/reportDatabase";

interface BatteryIssue {
  siteCode: string;
  uf: string;
  problem: string;
  status: string;
  fabricante: string;
}

interface DashboardStats {
  totalSites: number;
  sitesWithProblems: number;
  batteriesWithDefects: number;
  sitesWithGMG: number;
  sitesWithoutGMG: number;
  batteryIssues: BatteryIssue[];
  ufDistribution: { name: string; count: number }[];
  batteryStateChart: { name: string; value: number; color: string }[];
  climatizationIssues: number;
  fiberIssues: number;
}

const COLORS = {
  estufada: "#f59e0b",
  vazando: "#3b82f6",
  trincada: "#ef4444",
  primary: "hsl(206, 100%, 33%)",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [stats, setStats] = useState<DashboardStats>({
    totalSites: 0,
    sitesWithProblems: 0,
    batteriesWithDefects: 0,
    sitesWithGMG: 0,
    sitesWithoutGMG: 0,
    batteryIssues: [],
    ufDistribution: [],
    batteryStateChart: [],
    climatizationIssues: 0,
    fiberIssues: 0,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchReportsForDashboard({});
      setReports(data);
      setLastUpdate(new Date());
      processStats(data);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const processStats = (data: ReportRow[]) => {
    const batteryIssues: BatteryIssue[] = [];
    const ufCount: Record<string, number> = {};
    const batteryStates = { estufada: 0, vazando: 0, trincada: 0 };
    let sitesWithProblems = 0;
    let sitesWithGMG = 0;
    let climatizationIssues = 0;

    data.forEach((report) => {
      // Count UF distribution
      const uf = report.state_uf || "N/A";
      ufCount[uf] = (ufCount[uf] || 0) + 1;

      // Check GMG
      if (report.gmg_existe === "SIM") sitesWithGMG++;

      let hasProblems = false;

      // Check batteries for each cabinet
      for (let g = 1; g <= 7; g++) {
        for (let b = 1; b <= 6; b++) {
          const estadoKey = `gab${g}_bat${b}_estado` as keyof ReportRow;
          const fabricanteKey = `gab${g}_bat${b}_fabricante` as keyof ReportRow;
          const estado = report[estadoKey] as string | null;
          const fabricante = report[fabricanteKey] as string | null;

          if (estado && estado !== "OK" && estado !== "NA") {
            hasProblems = true;
            const estadoLower = estado.toLowerCase();

            if (estadoLower.includes("estufada")) batteryStates.estufada++;
            if (estadoLower.includes("vazando")) batteryStates.vazando++;
            if (estadoLower.includes("trincada")) batteryStates.trincada++;

            batteryIssues.push({
              siteCode: report.site_code,
              uf: uf,
              problem: `Bateria ${fabricante || "N/A"}`,
              status: estado,
              fabricante: fabricante || "N/A",
            });
          }
        }

        // Check AC status
        for (let a = 1; a <= 4; a++) {
          const acStatusKey = `gab${g}_ac${a}_status` as keyof ReportRow;
          const acStatus = report[acStatusKey] as string | null;
          if (acStatus === "NOK") {
            climatizationIssues++;
            hasProblems = true;
          }
        }
      }

      if (hasProblems) sitesWithProblems++;
    });

    const ufDistribution = Object.entries(ufCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const batteryStateChart = [
      { name: "Estufada", value: batteryStates.estufada, color: COLORS.estufada },
      { name: "Vazando", value: batteryStates.vazando, color: COLORS.vazando },
      { name: "Trincada", value: batteryStates.trincada, color: COLORS.trincada },
    ].filter((item) => item.value > 0);

    const totalBatteryDefects =
      batteryStates.estufada + batteryStates.vazando + batteryStates.trincada;

    setStats({
      totalSites: data.length,
      sitesWithProblems,
      batteriesWithDefects: totalBatteryDefects,
      sitesWithGMG,
      sitesWithoutGMG: data.length - sitesWithGMG,
      batteryIssues: batteryIssues.slice(0, 10), // Limit to 10 most recent
      ufDistribution,
      batteryStateChart,
      climatizationIssues,
      fiberIssues: 0,
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    iconBg,
    onClick,
  }: {
    title: string;
    value: number | string;
    subtitle: string;
    icon: React.ElementType;
    iconBg: string;
    onClick?: () => void;
  }) => (
    <Card
      className={`cursor-pointer hover:border-primary/50 transition-all ${
        onClick ? "hover:shadow-lg" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
            {onClick && (
              <p className="text-xs text-primary flex items-center gap-1 mt-1">
                Clique para ver detalhes <ChevronRight className="w-3 h-3" />
              </p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("vazando"))
      return (
        <Badge className="bg-blue-500 text-white hover:bg-blue-600">
          VAZANDO
        </Badge>
      );
    if (statusLower.includes("estufada"))
      return (
        <Badge className="bg-amber-500 text-white hover:bg-amber-600">
          ESTUFADA
        </Badge>
      );
    if (statusLower.includes("trincada"))
      return (
        <Badge className="bg-red-500 text-white hover:bg-red-600">
          TRINCADA
        </Badge>
      );
    return <Badge variant="secondary">{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-56 bg-card border-r border-border hidden lg:flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Radio className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">InfraSites</h1>
              <p className="text-xs text-muted-foreground">Dashboard Telecom</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3">
          <p className="text-xs text-muted-foreground mb-2 px-2">Menu Principal</p>
          <ul className="space-y-1">
            <li>
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                <MapPin className="w-4 h-4" />
                Visão Geral
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/historico")}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Battery className="w-4 h-4" />
                Relatórios
              </button>
            </li>
            <li>
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Thermometer className="w-4 h-4" />
                Climatização
              </button>
            </li>
            <li>
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Zap className="w-4 h-4" />
                Energia & GMG
              </button>
            </li>
            <li>
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Radio className="w-4 h-4" />
                DGOs & Fibra
              </button>
            </li>
            <li>
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Trash2 className="w-4 h-4" />
                Zeladoria
              </button>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground">Última atualização</p>
          <p className="text-sm font-medium">
            {format(lastUpdate, "dd/MM/yyyy HH:mm", { locale: ptBR })}
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-56">
        {/* Header Mobile */}
        <header className="lg:hidden sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border shadow-sm">
          <div className="px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <VivoLogo className="h-6" />
            <div className="flex-1">
              <h1 className="font-bold text-foreground">Dashboard</h1>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={loadData}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between px-6 py-4 border-b border-border bg-card">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Dashboard de Infraestrutura
            </h1>
            <p className="text-muted-foreground">
              Resumo executivo da infraestrutura de telecomunicações
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={loadData}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </header>

        <div className="p-4 lg:p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total de Sites"
                  value={stats.totalSites}
                  subtitle="Sites inspecionados"
                  icon={MapPin}
                  iconBg="bg-primary/10 text-primary"
                  onClick={() => navigate("/historico")}
                />
                <StatCard
                  title="Sites com Problemas"
                  value={stats.sitesWithProblems}
                  subtitle={`${
                    stats.totalSites > 0
                      ? Math.round(
                          (stats.sitesWithProblems / stats.totalSites) * 100
                        )
                      : 0
                  }% do total`}
                  icon={AlertTriangle}
                  iconBg="bg-warning/10 text-warning"
                  onClick={() => navigate("/historico")}
                />
                <StatCard
                  title="Baterias com Defeito"
                  value={stats.batteriesWithDefects}
                  subtitle="Requerem atenção"
                  icon={Battery}
                  iconBg="bg-destructive/10 text-destructive"
                />
                <StatCard
                  title="Sites com GMG"
                  value={stats.sitesWithGMG}
                  subtitle={`${stats.sitesWithoutGMG} sem GMG`}
                  icon={Zap}
                  iconBg="bg-success/10 text-success"
                />
              </div>

              {/* Charts Row */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Battery State Chart */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className="w-1 h-5 bg-primary rounded-full" />
                      Estado das Baterias
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats.batteryStateChart.length > 0 ? (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={stats.batteryStateChart}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={90}
                              paddingAngle={5}
                              dataKey="value"
                              label={({ name, value }) => `${name}: ${value}`}
                            >
                              {stats.batteryStateChart.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <Battery className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>Nenhum problema de bateria detectado</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Critical Alerts Table */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-warning" />
                      Alertas Críticos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats.batteryIssues.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b text-muted-foreground">
                              <th className="text-left py-2 font-medium">SITE</th>
                              <th className="text-left py-2 font-medium">UF</th>
                              <th className="text-left py-2 font-medium">
                                PROBLEMA
                              </th>
                              <th className="text-left py-2 font-medium">
                                STATUS
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats.batteryIssues.map((issue, idx) => (
                              <tr
                                key={idx}
                                className="border-b border-border/50 hover:bg-muted/30"
                              >
                                <td className="py-2 font-medium">
                                  {issue.siteCode}
                                </td>
                                <td className="py-2">{issue.uf}</td>
                                <td className="py-2">{issue.problem}</td>
                                <td className="py-2">
                                  {getStatusBadge(issue.status)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="h-40 flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>Nenhum alerta crítico</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* UF Distribution Chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Distribuição por UF
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.ufDistribution.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={stats.ufDistribution}
                          layout="vertical"
                          margin={{ left: 30 }}
                        >
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="name" width={40} />
                          <Tooltip />
                          <Bar
                            dataKey="count"
                            fill="hsl(206, 100%, 45%)"
                            radius={[0, 4, 4, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <p>Nenhum dado disponível</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
