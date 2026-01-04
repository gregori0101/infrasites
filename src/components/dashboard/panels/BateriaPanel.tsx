import React from "react";
import { Battery, AlertTriangle, Clock, Gauge } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "../StatCard";
import { PanelStats, BatteryInfo } from "../types";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

interface Props {
  stats: PanelStats;
  batteries: BatteryInfo[];
  onDrillDown: (type: "all" | "ok" | "nok" | "obsolete-warning" | "obsolete-critical") => void;
}

export function BateriaPanel({ stats, batteries, onDrillDown }: Props) {
  const percentOk = stats.totalBatteries > 0 
    ? Math.round((stats.batteriesOk / stats.totalBatteries) * 100) 
    : 0;

  const percentOver5 = stats.totalBatteries > 0 
    ? Math.round((stats.batteriesOver5Years / stats.totalBatteries) * 100) 
    : 0;

  const percentOver8 = stats.totalBatteries > 0 
    ? Math.round((stats.batteriesOver8Years / stats.totalBatteries) * 100) 
    : 0;

  // Gauge visualization for obsolescence
  const GaugeCard = ({ 
    title, 
    value, 
    percent, 
    color, 
    onClick 
  }: { 
    title: string; 
    value: number; 
    percent: number; 
    color: string;
    onClick: () => void;
  }) => (
    <Card 
      className="cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">{title}</span>
          <Gauge className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="relative w-full h-4 bg-muted rounded-full overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full rounded-full transition-all"
            style={{ 
              width: `${Math.min(percent, 100)}%`,
              backgroundColor: color,
            }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-2xl font-bold">{value}</span>
          <span className="text-lg font-medium" style={{ color }}>{percent}%</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-6 bg-warning rounded-full" />
        <h2 className="font-semibold text-lg">Painel Baterias - Obsolescência</h2>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Baterias"
          value={stats.totalBatteries}
          subtitle="Unidades cadastradas"
          icon={Battery}
          iconBg="bg-primary/10 text-primary"
          onClick={() => onDrillDown("all")}
        />
        <StatCard
          title="Baterias OK"
          value={stats.batteriesOk}
          subtitle={`${percentOk}% operacional`}
          icon={Battery}
          iconBg="bg-success/10 text-success"
          badge={{ text: `${percentOk}%`, variant: "success" }}
          onClick={() => onDrillDown("ok")}
        />
        <StatCard
          title="Baterias com Defeito"
          value={stats.batteriesNok}
          subtitle="Requerem substituição"
          icon={AlertTriangle}
          iconBg="bg-destructive/10 text-destructive"
          badge={stats.batteriesNok > 0 ? { text: "Atenção", variant: "destructive" } : undefined}
          onClick={() => onDrillDown("nok")}
        />
        <StatCard
          title="Próximo Vencimento"
          value={stats.batteriesOver5Years - stats.batteriesOver8Years}
          subtitle="Entre 5-8 anos"
          icon={Clock}
          iconBg="bg-warning/10 text-warning"
          onClick={() => onDrillDown("obsolete-warning")}
        />
      </div>

      {/* Obsolescence Gauges */}
      <div className="grid lg:grid-cols-2 gap-4">
        <GaugeCard 
          title="Baterias 5-8 anos (Atenção)"
          value={stats.batteriesOver5Years - stats.batteriesOver8Years}
          percent={percentOver5 - percentOver8}
          color="#f59e0b"
          onClick={() => onDrillDown("obsolete-warning")}
        />
        <GaugeCard 
          title="Baterias +8 anos (CRÍTICO)"
          value={stats.batteriesOver8Years}
          percent={percentOver8}
          color="#ef4444"
          onClick={() => onDrillDown("obsolete-critical")}
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Battery State Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Battery className="w-4 h-4 text-primary" />
              Estado das Baterias
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.batteryStateChart.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.batteryStateChart}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${value}`}
                    >
                      {stats.batteryStateChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Battery className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>Nenhum problema detectado</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Battery Age Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-warning" />
              Idade das Baterias
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.batteryAgeChart.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.batteryAgeChart}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {stats.batteryAgeChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>Nenhum dado de idade disponível</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
