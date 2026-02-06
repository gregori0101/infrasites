import React from "react";
import { Zap, Thermometer, Wind, CheckCircle2, ShieldCheck, Lock, AlertTriangle, Fuel, Factory, Gauge, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "../StatCard";
import { PanelStats, ACInfo } from "../types";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Badge } from "@/components/ui/badge";

interface Props {
  stats: PanelStats;
  acs: ACInfo[];
  onDrillDown: (type: "gmg" | "gmg-no" | "gmg-ok" | "gmg-nok" | "gmg-alarme" | "ac-all" | "ac-ok" | "ac-nok" | "transformador-ok" | "transformador-nok" | "gradil-ok" | "gradil-nok" | "cadeado-ok" | "cadeado-nok") => void;
}

const CHART_STYLE = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
};

export function EnergiaPanel({ stats, acs, onDrillDown }: Props) {
  const acPercentOk = stats.totalACs > 0 
    ? Math.round((stats.acsOk / stats.totalACs) * 100) 
    : 0;

  const totalTransformadores = stats.energiaTransformadorOk + stats.energiaTransformadorNok;
  const transformadorPercentOk = totalTransformadores > 0
    ? Math.round((stats.energiaTransformadorOk / totalTransformadores) * 100)
    : 0;

  const totalGradil = stats.energiaProtecaoGradilOk + stats.energiaProtecaoGradilNok;
  const gradilPercentOk = totalGradil > 0
    ? Math.round((stats.energiaProtecaoGradilOk / totalGradil) * 100)
    : 0;

  const totalCadeado = stats.energiaProtecaoCadeadoOk + stats.energiaProtecaoCadeadoNok;
  const cadeadoPercentOk = totalCadeado > 0
    ? Math.round((stats.energiaProtecaoCadeadoOk / totalCadeado) * 100)
    : 0;

  const gmgPercentOk = stats.sitesWithGMG > 0
    ? Math.round((stats.gmgStatusOk / stats.sitesWithGMG) * 100)
    : 0;

  const protecaoChart = [
    { name: "Com Gradil", value: stats.energiaProtecaoGradilOk, color: "#22c55e" },
    { name: "Sem Gradil", value: stats.energiaProtecaoGradilNok, color: "#ef4444" },
    { name: "Com Cadeado", value: stats.energiaProtecaoCadeadoOk, color: "#3b82f6" },
    { name: "Sem Cadeado", value: stats.energiaProtecaoCadeadoNok, color: "#f59e0b" },
  ].filter(d => d.value > 0);

  const transformadorChart = [
    { name: "OK", value: stats.energiaTransformadorOk, color: "#22c55e" },
    { name: "NOK", value: stats.energiaTransformadorNok, color: "#ef4444" },
  ].filter(d => d.value > 0);

  const gmgStatusChart = [
    { name: "OK", value: stats.gmgStatusOk, color: "#22c55e" },
    { name: "NOK", value: stats.gmgStatusNok, color: "#ef4444" },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* ===== SEÇÃO ENERGIA ===== */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-6 bg-accent rounded-full" />
          <h2 className="font-semibold text-lg">Painel de Energia</h2>
        </div>

        {/* Energy KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <StatCard
            title="Transformador OK"
            value={stats.energiaTransformadorOk}
            subtitle={`${transformadorPercentOk}% conformes`}
            icon={Zap}
            iconBg="bg-success/10 text-success"
            badge={{ text: `${transformadorPercentOk}%`, variant: "success" }}
            onClick={() => onDrillDown("transformador-ok")}
          />
          <StatCard
            title="Transformador NOK"
            value={stats.energiaTransformadorNok}
            subtitle="Requerem atenção"
            icon={Zap}
            iconBg="bg-destructive/10 text-destructive"
            badge={stats.energiaTransformadorNok > 0 ? { text: "Atenção", variant: "destructive" } : undefined}
            onClick={() => onDrillDown("transformador-nok")}
          />
          <StatCard
            title="Proteção Gradil"
            value={stats.energiaProtecaoGradilOk}
            subtitle={`${gradilPercentOk}% protegidos`}
            icon={ShieldCheck}
            iconBg="bg-primary/10 text-primary"
            badge={{ text: `${gradilPercentOk}%`, variant: gradilPercentOk >= 80 ? "success" : gradilPercentOk >= 50 ? "warning" : "destructive" }}
            onClick={() => onDrillDown("gradil-ok")}
          />
          <StatCard
            title="Proteção Cadeado"
            value={stats.energiaProtecaoCadeadoOk}
            subtitle={`${cadeadoPercentOk}% protegidos`}
            icon={Lock}
            iconBg="bg-primary/10 text-primary"
            badge={{ text: `${cadeadoPercentOk}%`, variant: cadeadoPercentOk >= 80 ? "success" : cadeadoPercentOk >= 50 ? "warning" : "destructive" }}
            onClick={() => onDrillDown("cadeado-ok")}
          />
          <StatCard
            title="Total de ACs"
            value={stats.totalACs}
            subtitle={`${stats.acsNok} com defeito`}
            icon={Wind}
            iconBg={stats.acsNok > 0 ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"}
            onClick={() => onDrillDown("ac-all")}
          />
        </div>

        {/* Energy Charts Row */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Transformador Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent" />
                Status Transformador
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transformadorChart.length > 0 ? (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={transformadorChart} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}>
                        {transformadorChart.map((entry, i) => (
                          <Cell key={`tf-${i}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={CHART_STYLE} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  <p>Nenhum dado disponível</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tensão de Entrada */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Gauge className="w-4 h-4 text-primary" />
                Tensão de Entrada
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.energiaTensaoDistribution.length > 0 ? (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.energiaTensaoDistribution} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={CHART_STYLE} />
                      <Bar dataKey="value" name="Sites" radius={[0, 4, 4, 0]}>
                        {stats.energiaTensaoDistribution.map((entry, i) => (
                          <Cell key={`t-${i}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  <p>Nenhum dado disponível</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Proteção */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Proteção do Quadro
              </CardTitle>
            </CardHeader>
            <CardContent>
              {protecaoChart.length > 0 ? (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={protecaoChart} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value"
                        label={({ value }) => `${value}`}>
                        {protecaoChart.map((entry, i) => (
                          <Cell key={`p-${i}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={CHART_STYLE} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  <p>Nenhum dado disponível</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Energy Details Row */}
        <div className="grid lg:grid-cols-2 gap-4 mt-4">
          {/* Fabricante Quadro */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Factory className="w-4 h-4 text-accent" />
                Fabricantes de Quadro
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.energiaFabricanteDistribution.length > 0 ? (
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.energiaFabricanteDistribution.slice(0, 8)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={CHART_STYLE} />
                      <Bar dataKey="value" name="Quantidade" radius={[0, 4, 4, 0]}>
                        {stats.energiaFabricanteDistribution.slice(0, 8).map((entry, i) => (
                          <Cell key={`fab-${i}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-52 flex items-center justify-center text-muted-foreground">
                  <p>Nenhum dado disponível</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tipo de Quadro */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Tipos de Quadro
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.energiaTipoQuadroDistribution.length > 0 ? (
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.energiaTipoQuadroDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={5} dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}>
                        {stats.energiaTipoQuadroDistribution.map((entry, i) => (
                          <Cell key={`tq-${i}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={CHART_STYLE} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-52 flex items-center justify-center text-muted-foreground">
                  <p>Nenhum dado disponível</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ===== SEÇÃO GMG ===== */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-6 bg-warning rounded-full" />
          <h2 className="font-semibold text-lg">Painel GMG (Gerador)</h2>
        </div>

        {/* GMG KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <StatCard
            title="Sites com GMG"
            value={stats.sitesWithGMG}
            subtitle={`${stats.sitesWithoutGMG} sem GMG`}
            icon={Zap}
            iconBg="bg-success/10 text-success"
            onClick={() => onDrillDown("gmg")}
          />
          <StatCard
            title="Sites sem GMG"
            value={stats.sitesWithoutGMG}
            subtitle="Sem backup energia"
            icon={Zap}
            iconBg="bg-warning/10 text-warning"
            onClick={() => onDrillDown("gmg-no")}
          />
          <StatCard
            title="GMG Operacional"
            value={stats.gmgStatusOk}
            subtitle={`${gmgPercentOk}% dos GMGs`}
            icon={CheckCircle2}
            iconBg="bg-success/10 text-success"
            badge={{ text: `${gmgPercentOk}%`, variant: "success" }}
            onClick={() => onDrillDown("gmg-ok")}
          />
          <StatCard
            title="GMG Inoperante"
            value={stats.gmgStatusNok}
            subtitle="Requerem manutenção"
            icon={XCircle}
            iconBg="bg-destructive/10 text-destructive"
            badge={stats.gmgStatusNok > 0 ? { text: "Atenção", variant: "destructive" } : undefined}
            onClick={() => onDrillDown("gmg-nok")}
          />
          <StatCard
            title="Alarme Ativo"
            value={stats.gmgAlarmeAtivo}
            subtitle="GMGs com alarme"
            icon={AlertTriangle}
            iconBg={stats.gmgAlarmeAtivo > 0 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}
            badge={stats.gmgAlarmeAtivo > 0 ? { text: "Ativo", variant: "destructive" } : undefined}
            onClick={() => onDrillDown("gmg-alarme")}
          />
        </div>

        {/* GMG Charts Row */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* GMG Distribution (Com/Sem) */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent" />
                Distribuição GMG
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.energiaStatus.length > 0 ? (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.energiaStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}>
                        {stats.energiaStatus.map((entry, i) => (
                          <Cell key={`gmg-dist-${i}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={CHART_STYLE} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  <p>Nenhum dado disponível</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* GMG Status (OK/NOK) */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                Status Operacional GMG
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gmgStatusChart.length > 0 ? (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={gmgStatusChart} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}>
                        {gmgStatusChart.map((entry, i) => (
                          <Cell key={`gmg-st-${i}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={CHART_STYLE} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  <p>Nenhum dado disponível</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* GMG Combustível */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Fuel className="w-4 h-4 text-warning" />
                Tipo de Combustível
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.gmgCombustivelDistribution.length > 0 ? (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.gmgCombustivelDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}>
                        {stats.gmgCombustivelDistribution.map((entry, i) => (
                          <Cell key={`comb-${i}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={CHART_STYLE} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  <p>Nenhum dado disponível</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* GMG Detail Tables Row */}
        <div className="grid lg:grid-cols-2 gap-4 mt-4">
          {/* GMG Fabricantes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Factory className="w-4 h-4 text-accent" />
                Fabricantes de GMG
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.gmgFabricanteDistribution.length > 0 ? (
                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {stats.gmgFabricanteDistribution.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                      <span className="text-sm font-medium truncate flex-1">{item.name}</span>
                      <Badge variant="secondary" className="ml-2">{item.value}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-muted-foreground">
                  <p>Nenhum dado disponível</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* GMG Potências */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Gauge className="w-4 h-4 text-primary" />
                Potências de GMG
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.gmgPotenciaDistribution.length > 0 ? (
                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {stats.gmgPotenciaDistribution.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                      <span className="text-sm font-medium truncate flex-1">{item.name} kVA</span>
                      <Badge variant="secondary" className="ml-2">{item.value}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-muted-foreground">
                  <p>Nenhum dado disponível</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ===== SEÇÃO ACs ===== */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-6 bg-primary rounded-full" />
          <h2 className="font-semibold text-lg">Ar Condicionado</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <StatCard
            title="ACs Funcionando"
            value={stats.acsOk}
            subtitle={`${acPercentOk}% operacional`}
            icon={CheckCircle2}
            iconBg="bg-success/10 text-success"
            badge={{ text: `${acPercentOk}%`, variant: "success" }}
            onClick={() => onDrillDown("ac-ok")}
          />
          <StatCard
            title="ACs com Defeito"
            value={stats.acsNok}
            subtitle="Requerem manutenção"
            icon={Thermometer}
            iconBg="bg-destructive/10 text-destructive"
            badge={stats.acsNok > 0 ? { text: "Atenção", variant: "destructive" } : undefined}
            onClick={() => onDrillDown("ac-nok")}
          />
          <StatCard
            title="Total de ACs"
            value={stats.totalACs}
            subtitle="Unidades instaladas"
            icon={Wind}
            iconBg="bg-primary/10 text-primary"
            onClick={() => onDrillDown("ac-all")}
          />
        </div>

        {/* Climatization Types Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wind className="w-4 h-4 text-primary" />
              Tipos de Climatização
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.climatizacaoStatus.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.climatizacaoStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}>
                      {stats.climatizacaoStatus.map((entry, i) => (
                        <Cell key={`clima-${i}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={CHART_STYLE} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                <p>Nenhum dado disponível</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
