import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VivoLogo } from "@/components/ui/vivo-logo";
import {
  ArrowLeft, Activity, AlertTriangle, MapPin, Radio, Zap, Signal,
  Cloud, Hammer, Flame, Car, ShieldAlert, Wifi, Network, Server,
  Smartphone, Calendar, Mail, Eye, Clock, ChevronRight, Crown,
  Search, TrendingUp, Layers, Radar,
} from "lucide-react";

// ---------- MOCK DATA (Norte: AM, PA, RR, AP, AC, RO, TO) ----------
const TOP_KPIS = [
  { label: "Sites Fora por Infra", value: "14 sites", icon: Zap, tone: "warning" },
  { label: "Municípios Isolados", value: "6", icon: MapPin, tone: "warning" },
  { label: "TTMC Ativos", value: "0", icon: Radio, tone: "success" },
  { label: "Total ERBs Indisponíveis", value: "390", icon: Activity, tone: "danger" },
  { label: "HL3 em Risco/Atenção", value: "7 eventos", icon: AlertTriangle, tone: "warning" },
];

const CATEGORIES = [
  "Início", "DOM", "Acesso Fixo", "Acesso Móvel", "Backbone Nacional",
  "Banda Larga", "Rede IP", "Transmissão e Metro", "Core e Plataformas",
  "Mesa de Controle", "Sistemas e Automações",
];

const RADAR_PLATFORMS = [
  { name: "Vivo", value: 18, status: "active" },
  { name: "YouTube", value: 17, status: "active" },
  { name: "Instagram", value: 8, status: "active" },
  { name: "TikTok", value: 4, status: "active" },
  { name: "Caixa", value: 4, status: "active" },
  { name: "Cloudflare", value: 2, status: "active" },
  { name: "Bradesco", value: 2, status: "active" },
  { name: "Santander", value: 1, status: "active" },
  { name: "Netflix", value: 1, status: "active" },
  { name: "Itaú", value: 0, status: "idle" },
  { name: "WhatsApp", value: 0, status: "idle" },
  { name: "Pix", value: 0, status: "idle" },
];

const TTMC_EVENTS = [
  { id: "242/2026", uf: "AM", title: "Indisponibilidade de Banda Larga - Manaus", inicio: "29/06/2026, 11:42" },
  { id: "241/2026", uf: "PA", title: "Indisponibilidade de serviços - Belém", inicio: "29/06/2026, 01:35" },
  { id: "240/2026", uf: "RO", title: "Indisponibilidade de ERBs - Porto Velho", inicio: "28/06/2026, 09:11" },
  { id: "239/2026", uf: "TO", title: "Queda de enlace - Palmas", inicio: "28/06/2026, 06:50" },
];

const JOIAS = [
  { label: "Crítico", value: 0, color: "bg-purple-500", text: "text-purple-600" },
  { label: "Atenção", value: 3, color: "bg-red-500", text: "text-red-600" },
  { label: "Média criticidade", value: 38, color: "bg-orange-500", text: "text-orange-600" },
  { label: "Baixa criticidade", value: 0, color: "bg-yellow-400", text: "text-yellow-600" },
  { label: "Sem TA", value: 1, color: "bg-green-500", text: "text-green-600" },
];

const NORTE_UFS = ["AM", "PA", "RR", "AP", "AC", "RO", "TO"];

const GAUGES = [
  {
    title: "Backbone Nacional (Spans DWDM)",
    icon: Wifi,
    headerClass: "from-cyan-500 to-blue-500",
    value: 40, max: 90, label: "Total eventos",
    chips: [{ k: "AM", v: 11 }, { k: "PA", v: 8 }, { k: "RR", v: 5 }, { k: "AP", v: 4 }, { k: "RO", v: 6 }],
    bars: [{ label: "Até 8 horas", value: 20, pct: 50, tone: "success" }, { label: "Mais de 24 horas", value: 9, pct: 22, tone: "danger" }],
    fonte: "Mesa de Controle - DWDM Linha",
  },
  {
    title: "BBN Trânsito (Backbone Crítico)",
    icon: Network,
    headerClass: "from-blue-600 to-indigo-600",
    value: 23, max: 70, label: "Total de falhas",
    chips: [{ k: "AM", v: 7 }, { k: "PA", v: 7 }, { k: "RO", v: 5 }, { k: "TO", v: 4 }],
    causes: [
      { icon: Flame, label: "Incêndio", v: 8 },
      { icon: Cloud, label: "Intempérie", v: 114 },
      { icon: ShieldAlert, label: "Vandalismo", v: 39 },
      { icon: Hammer, label: "Obras", v: 49 },
      { icon: Car, label: "Acidente", v: 2 },
      { icon: Zap, label: "Carga Alta", v: 5 },
    ],
    fonte: "BBN - Trânsito",
  },
  {
    title: "Camada de distribuição - HL2 e HL3 Fusion",
    icon: Layers,
    headerClass: "from-purple-500 to-fuchsia-500",
    value: 63, max: 140, label: "Total de falhas",
    chips: [{ k: "AM", v: 26 }, { k: "PA", v: 20 }, { k: "RO", v: 10 }, { k: "TO", v: 4 }, { k: "RR", v: 2 }, { k: "AP", v: 1 }],
    bars: [{ label: "Até 24 horas", value: 61, pct: 96, tone: "success" }, { label: "Mais de 24 horas", value: 2, pct: 4, tone: "warning" }],
    fonte: "Painel Links Fusion",
  },
  {
    title: "Camada Agregação - HL4 Fusion",
    icon: Server,
    headerClass: "from-violet-500 to-purple-600",
    value: 81, max: 220, label: "Total eventos",
    chips: [{ k: "AM", v: 23 }, { k: "PA", v: 22 }, { k: "RR", v: 14 }, { k: "RO", v: 7 }, { k: "TO", v: 7 }, { k: "AP", v: 4 }, { k: "AC", v: 4 }],
    bars: [{ label: "Até 24 horas", value: 66, pct: 81, tone: "success" }, { label: "Mais de 24 horas", value: 15, pct: 19, tone: "danger" }],
    fonte: "Painel Links HL4",
  },
];

const BOTTOM_CARDS = [
  {
    title: "Gestão de Riscos HL2 e HL3",
    icon: AlertTriangle,
    headerClass: "from-purple-500 to-fuchsia-500",
    status: { label: "ATENÇÃO", tone: "warning" as const },
    subtitle: "7 risco(s) ativo(s)",
    items: [
      { local: "Manaus/AM", tempo: "0:14h:39m" },
      { local: "Belém/PA", tempo: "0:09h:33m" },
      { local: "Porto Velho/RO", tempo: "0:09h:31m" },
      { local: "Palmas/TO", tempo: "0:08h:12m" },
    ],
    tags: ["AM: 2", "PA: 2", "RO: 2", "TO: 1"],
    fonte: "BBN - Gestão de Riscos HL3",
  },
  {
    title: "Acesso Fixo - GeoOper OLT",
    icon: Network,
    headerClass: "from-emerald-400 to-teal-500",
    status: { label: "OK", tone: "success" as const },
    subtitle: "0 olt(s) isoladas",
    total: { label: "Total monitoradas", value: "3.115" },
    grid: [
      { v: 0, l: "100% Indisp.", color: "bg-red-500" },
      { v: 15, l: "50-99.99%", color: "bg-orange-500" },
      { v: 6, l: "10-49.99%", color: "bg-yellow-400" },
      { v: 3094, l: "0-9.99%", color: "bg-green-500" },
    ],
    fonte: "Mesa de Controle - GeoOper",
  },
  {
    title: "Backhaul - GeoOper HL5",
    icon: Server,
    headerClass: "from-blue-600 to-indigo-700",
    status: { label: "ATENÇÃO", tone: "warning" as const },
    subtitle: "99 isolado(s)",
    total: { label: "Total monitorados", value: "21.259" },
    grid: [
      { v: 99, l: "Isolado", color: "bg-red-500" },
      { v: 471, l: "50-99.99%", color: "bg-orange-500" },
      { v: 155, l: "10-49.99%", color: "bg-yellow-400" },
      { v: 20534, l: "0-9.99%", color: "bg-green-500" },
    ],
    note: "Isolados: 99 OBS: Módulo em Homologação.",
    fonte: "Mesa de Controle - GeoOper HL5",
  },
  {
    title: "Indisponibilidade Móvel",
    icon: Smartphone,
    headerClass: "from-teal-400 to-cyan-500",
    techs: [{ k: "2G", v: 86 }, { k: "3G", v: 115 }, { k: "4G", v: 130 }, { k: "5G", v: 59 }],
    summary: [
      { v: 390, l: "Total ERBs" },
      { v: 6, l: "Mun. Isol." },
      { v: 14, l: "Fora Infra" },
      { v: 0, l: "TTMC" },
    ],
    topUFs: [
      { uf: "AM", v: 66 }, { uf: "PA", v: 58 }, { uf: "RO", v: 54 }, { uf: "TO", v: 50 },
    ],
    fonte: "Mesa de Controle - Calamidade",
  },
];

// ---------- Components ----------
function Gauge({ value, max }: { value: number; max: number }) {
  const pct = Math.min(value / max, 1);
  const angle = -90 + pct * 180;
  const r = 50;
  const cx = 60, cy = 60;
  const startA = Math.PI; // 180deg
  const endA = 0;
  const arc = (a1: number, a2: number) => {
    const x1 = cx + r * Math.cos(a1), y1 = cy - r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy - r * Math.sin(a2);
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
  };
  return (
    <svg viewBox="0 0 120 80" className="w-28 h-20">
      <path d={arc(startA, (2 * Math.PI) / 3)} stroke="#22c55e" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d={arc((2 * Math.PI) / 3, Math.PI / 3)} stroke="#eab308" strokeWidth="10" fill="none" />
      <path d={arc(Math.PI / 3, endA)} stroke="#ef4444" strokeWidth="10" fill="none" strokeLinecap="round" />
      <line
        x1={cx} y1={cy}
        x2={cx + (r - 8) * Math.cos((angle * Math.PI) / 180 + Math.PI)}
        y2={cy + (r - 8) * Math.sin((angle * Math.PI) / 180 + Math.PI)}
        stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r="4" fill="#1e293b" />
      <text x="6" y="76" fontSize="9" fill="#64748b">0</text>
      <text x="100" y="76" fontSize="9" fill="#64748b">{max}</text>
    </svg>
  );
}

function MiniSpark({ tone = "success" }: { tone?: "success" | "warning" | "danger" | "idle" }) {
  const colors: Record<string, string> = {
    success: "#22c55e", warning: "#eab308", danger: "#ef4444", idle: "#94a3b8",
  };
  const pts = Array.from({ length: 12 }, (_, i) =>
    `${i * 8},${20 - Math.round(Math.sin(i + (tone === "danger" ? 2 : 0)) * 6 + 10)}`
  ).join(" ");
  return (
    <svg viewBox="0 0 96 24" className="w-full h-6">
      <polyline points={pts} fill="none" stroke={colors[tone]} strokeWidth="1.5" />
    </svg>
  );
}

export default function PainelMonitoramento() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Painel de Monitoramento Norte | InfraSites Vivo</title>
        <meta name="description" content="Painel de monitoramento da rede região Norte: ERBs, backbone, camadas de distribuição e agregação." />
      </Helmet>

      <div className="min-h-screen bg-slate-50">
        {/* Top purple header */}
        <header className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 text-white shadow-lg">
          <div className="px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => navigate("/")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="hidden md:flex items-center gap-2 text-sm">
                <span className="text-yellow-300">☀</span>
                <span>Manaus/AM</span>
                <span className="font-semibold">31°C</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-white/15 flex items-center justify-center">
                <Radar className="h-5 w-5" />
              </div>
              <div className="text-center">
                <h1 className="font-extrabold text-lg md:text-xl tracking-wide">PAINEL MONITORAMENTO NORTE</h1>
                <p className="text-[11px] text-white/70 -mt-0.5">Centro de Gerência de Redes e Serviços</p>
              </div>
            </div>
            <div className="hidden md:flex items-center bg-white/95 text-slate-600 rounded-full px-3 py-1.5 w-64">
              <Search className="h-4 w-4 mr-2" />
              <input
                placeholder="Buscar notícias..."
                className="bg-transparent text-sm outline-none flex-1 placeholder:text-slate-400"
              />
            </div>
            <VivoLogo className="h-7 w-auto hidden md:block" />
          </div>

          {/* KPI ticker */}
          <div className="bg-purple-900/40 border-t border-white/10 overflow-x-auto">
            <div className="flex items-center gap-6 px-4 py-2 text-sm whitespace-nowrap">
              <span className="flex items-center gap-1.5 text-red-300 font-semibold">
                <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" /> AO VIVO
              </span>
              {TOP_KPIS.map((k) => (
                <div key={k.label} className="flex items-center gap-2">
                  <k.icon className="h-4 w-4 text-yellow-300" />
                  <span className="text-white/80">{k.label}:</span>
                  <span className="font-bold text-white">{k.value}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 ml-auto">
                <Zap className="h-4 w-4 text-yellow-300" />
                <span className="text-white/80">Sites Fora por Infra:</span>
                <span className="font-bold">14 sites</span>
              </div>
            </div>
          </div>
        </header>

        {/* Category nav */}
        <nav className="bg-white border-b sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto">
            {CATEGORIES.map((c, i) => (
              <button
                key={c}
                className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors flex items-center gap-1.5
                  ${i === 0 ? "bg-purple-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${i === 0 ? "bg-white" : "bg-emerald-500"}`} />
                {c}
              </button>
            ))}
          </div>
        </nav>

        <main className="px-4 py-6 space-y-6 max-w-[1600px] mx-auto">
          {/* Radar de Instabilidade */}
          <Card className="overflow-hidden border-purple-200">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radar className="h-4 w-4" />
                <h2 className="font-bold text-sm">Radar de Instabilidade</h2>
                <Badge className="bg-white/20 text-white border-0 text-[10px]">Online</Badge>
              </div>
              <div className="text-xs text-white/80 flex items-center gap-2">
                Fonte: Downdetector • Última hora
                <button className="hover:underline">Detalhes ›</button>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm">
                  <span className="text-2xl font-bold text-slate-800">57</span>
                  <span className="text-slate-500 ml-2">reclamações (1h)</span>
                  <Badge className="ml-3 bg-emerald-100 text-emerald-700 border-0">● estável</Badge>
                  <span className="ml-3 text-slate-500"><Activity className="inline h-3 w-3" /> 9 ativos</span>
                </div>
                <span className="text-xs text-slate-400">Situação estável na última hora.</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
                {RADAR_PLATFORMS.map((p) => (
                  <div key={p.name} className="border rounded-lg p-2 bg-slate-50/50 relative">
                    <span className={`absolute top-1.5 right-1.5 h-2 w-2 rounded-full ${p.status === "active" ? "bg-emerald-500" : "bg-slate-300"}`} />
                    <div className="text-[11px] font-semibold text-slate-700 truncate">{p.name}</div>
                    <div className="text-base font-bold text-slate-900">{p.value}</div>
                    <MiniSpark tone={p.value > 10 ? "warning" : p.value > 0 ? "success" : "idle"} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Middle row: TTMC events / Hero / Newsletter */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* TTMC */}
            <Card className="lg:col-span-3 border-purple-200">
              <div className="bg-purple-100 text-purple-900 px-3 py-2 flex items-center gap-2 rounded-t-lg">
                <AlertTriangle className="h-4 w-4" />
                <h3 className="font-bold text-sm">Eventos TTMC</h3>
              </div>
              <CardContent className="p-3 space-y-2">
                <div className="text-xs bg-purple-50 border border-purple-100 rounded p-2 flex items-center gap-1.5 text-purple-700">
                  <Clock className="h-3.5 w-3.5" /> Tempo sem eventos: 07h 08m
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-purple-50 rounded p-2 text-center">
                    <div className="text-[10px] text-purple-700 font-semibold">● Ativos</div>
                    <div className="text-xl font-bold text-purple-900">0</div>
                  </div>
                  <div className="bg-purple-100 rounded p-2 text-center">
                    <div className="text-[10px] text-purple-700 font-semibold">Últimos 7d</div>
                    <div className="text-xl font-bold text-purple-900">13</div>
                  </div>
                </div>
                <div className="space-y-1.5 pt-1">
                  {TTMC_EVENTS.map((e) => (
                    <div key={e.id} className="border rounded p-2 text-xs hover:bg-slate-50 cursor-pointer">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <span className="text-blue-600">●</span> {e.id} • {e.uf}
                      </div>
                      <div className="text-slate-600 truncate">{e.title}</div>
                      <div className="text-[10px] text-slate-400">Início: {e.inicio}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Hero */}
            <Card className="lg:col-span-6 overflow-hidden border-0 bg-gradient-to-br from-purple-900 via-purple-800 to-fuchsia-700 text-white relative min-h-[340px]">
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_70%_50%,rgba(255,0,255,0.5),transparent_60%)]" />
              <CardContent className="relative p-6 flex flex-col justify-end h-full">
                <div className="flex gap-2 mb-3">
                  <Badge className="bg-white/15 border-0">⭐ Destaque</Badge>
                  <Badge className="bg-white/15 border-0">Mesa de Controle</Badge>
                </div>
                <h2 className="text-2xl font-bold mb-2">HL4 e OLT — Panorama da Rede Fixa Norte</h2>
                <p className="text-sm text-white/80 mb-3 max-w-2xl">
                  Atualização do panorama operacional dos equipamentos HL4 e OLT da região Norte entre 00h e 17h.
                  Total HL4 monitorados: 1.188 • Total OLTs: 3.115 • Histórico por região.
                </p>
                <div className="flex items-center gap-4 text-xs text-white/70">
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> 3</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 29 jun às 18:21</span>
                </div>
              </CardContent>
            </Card>

            {/* Side cards */}
            <div className="lg:col-span-3 space-y-4">
              <Card className="bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white border-0">
                <CardContent className="p-4">
                  <Mail className="h-6 w-6 mb-2" />
                  <h3 className="font-bold text-lg">Newsletter</h3>
                  <p className="text-xs text-white/80 mb-3">Receba as últimas novidades no seu e-mail</p>
                  <Button size="sm" variant="secondary" className="w-full text-purple-700 font-semibold">
                    Assinar agora →
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Próximo Evento</div>
                  <div className="font-bold text-slate-800 text-sm">Reunião Operacional Norte</div>
                  <div className="text-xs text-slate-500 mt-0.5">30 jun - 30 jun</div>
                  <button className="mt-2 text-xs text-purple-600 font-semibold flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Ver Calendário
                  </button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Joias da Coroa */}
          <Card className="border-amber-200 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white">
                    <Crown className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-extrabold text-amber-700 tracking-wide">JOIAS DA COROA</div>
                    <div className="text-xs text-slate-500">42 sites monitorados (Norte)</div>
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {JOIAS.map((j) => (
                    <div key={j.label} className="bg-white rounded-lg border p-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                        <span className={`h-2 w-2 rounded-full ${j.color}`} /> {j.label}
                      </div>
                      <div className={`text-2xl font-extrabold mt-1 ${j.text}`}>{j.value}</div>
                      <div className="text-[10px] text-slate-400">sites</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mapa + Gauges */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Mapa */}
            <Card className="overflow-hidden border-purple-200">
              <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <h3 className="font-bold text-sm">Mapa de Risco Fusion — HL2 e HL3 (Norte)</h3>
                </div>
                <div className="text-xs text-white/80">Nodes: 87 • Links: 142 • 20:24</div>
              </div>
              <CardContent className="p-0 relative bg-gradient-to-br from-blue-50 to-emerald-50 min-h-[420px]">
                <svg viewBox="0 0 400 420" className="w-full h-full">
                  {/* Stylized Norte region outline */}
                  <path
                    d="M 60 80 L 320 70 L 360 130 L 350 220 L 300 310 L 220 360 L 130 350 L 70 280 L 50 180 Z"
                    fill="#e0f2fe" stroke="#94a3b8" strokeWidth="1.5"
                  />
                  {/* Links */}
                  {[
                    [120, 140, 200, 180], [200, 180, 280, 150], [200, 180, 250, 250],
                    [250, 250, 180, 290], [120, 140, 90, 220], [280, 150, 320, 220],
                    [180, 290, 220, 340], [320, 220, 280, 290],
                  ].map((l, i) => (
                    <line key={i} x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="3 3" />
                  ))}
                  {/* Nodes */}
                  {[
                    { x: 120, y: 140, c: "#22c55e", l: "RR" },
                    { x: 200, y: 180, c: "#22c55e", l: "AM" },
                    { x: 280, y: 150, c: "#eab308", l: "AP" },
                    { x: 320, y: 220, c: "#22c55e", l: "PA" },
                    { x: 90, y: 220, c: "#22c55e", l: "AC" },
                    { x: 180, y: 290, c: "#22c55e", l: "RO" },
                    { x: 250, y: 250, c: "#eab308", l: "TO" },
                    { x: 280, y: 290, c: "#22c55e" },
                    { x: 220, y: 340, c: "#ef4444" },
                    { x: 150, y: 200, c: "#22c55e" }, { x: 230, y: 130, c: "#22c55e" },
                  ].map((n, i) => (
                    <g key={i}>
                      <circle cx={n.x} cy={n.y} r="10" fill={n.c} stroke="white" strokeWidth="2" />
                      {n.l && <text x={n.x} y={n.y + 22} fontSize="9" fill="#475569" textAnchor="middle" fontWeight="600">{n.l}</text>}
                    </g>
                  ))}
                </svg>
                <div className="absolute bottom-2 left-2 right-2 bg-white/95 rounded p-2 flex flex-wrap items-center gap-3 text-xs">
                  <span className="text-slate-500 font-semibold">Fonte: RSNAC / Gestão de Riscos HL3</span>
                  <div className="flex items-center gap-3 ml-auto">
                    <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Normal</span>
                    <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-yellow-500" /> Atenção</span>
                    <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Risco</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gauges stacked */}
            <div className="space-y-4">
              {GAUGES.map((g) => (
                <Card key={g.title} className="overflow-hidden">
                  <div className={`bg-gradient-to-r ${g.headerClass} text-white px-3 py-2 flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <g.icon className="h-4 w-4" />
                      <h4 className="font-bold text-xs">{g.title}</h4>
                    </div>
                    <Badge className="bg-white/20 text-white border-0 text-[10px]">● Online</Badge>
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-4">
                      <Gauge value={g.value} max={g.max} />
                      <div>
                        <div className="text-3xl font-bold text-slate-800">{g.value}</div>
                        <div className="text-[10px] text-slate-500 uppercase">{g.label}</div>
                      </div>
                      <div className="flex-1 flex flex-wrap gap-1 justify-end">
                        {g.chips.map((c) => (
                          <Badge key={c.k} variant="outline" className="text-[10px] font-bold">
                            {c.k} <span className="ml-1 text-blue-600">{c.v}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {g.bars && (
                      <div className="mt-3 space-y-1.5">
                        {g.bars.map((b) => (
                          <div key={b.label}>
                            <div className="flex justify-between text-[11px] mb-0.5">
                              <span className={b.tone === "success" ? "text-emerald-600" : b.tone === "danger" ? "text-red-600" : "text-amber-600"}>
                                {b.label}: {b.value}
                              </span>
                              <span className="text-slate-500">{b.pct}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${b.tone === "success" ? "bg-emerald-500" : b.tone === "danger" ? "bg-red-500" : "bg-amber-500"}`}
                                style={{ width: `${b.pct}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {g.causes && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {g.causes.map((c) => (
                          <span key={c.label} className="text-[11px] flex items-center gap-1 text-slate-600">
                            <c.icon className="h-3 w-3 text-purple-500" /> {c.label} <b>{c.v}</b>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="text-[10px] text-slate-400 text-right mt-2">Fonte: {g.fonte}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Bottom cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {BOTTOM_CARDS.map((c) => (
              <Card key={c.title} className="overflow-hidden">
                <div className={`bg-gradient-to-r ${c.headerClass} text-white px-3 py-3`}>
                  <div className="flex items-center gap-2">
                    <c.icon className="h-5 w-5" />
                    <h4 className="font-bold text-sm">{c.title}</h4>
                  </div>
                </div>
                <CardContent className="p-3 space-y-3">
                  {c.status && (
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`border-0 ${
                          c.status.tone === "warning"
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        ● Status: {c.status.label}
                      </Badge>
                      <span className="text-xs text-slate-600">{c.subtitle}</span>
                    </div>
                  )}
                  {c.total && (
                    <div className="text-xs text-slate-500">
                      {c.total.label}: <b className="text-slate-800">{c.total.value}</b>
                    </div>
                  )}
                  {c.items && (
                    <div className="space-y-1.5">
                      {c.items.map((it) => (
                        <div key={it.local} className="bg-red-50 rounded px-2 py-1.5 flex justify-between text-xs">
                          <span className="flex items-center gap-1 text-red-700">
                            <MapPin className="h-3 w-3" /> {it.local}
                          </span>
                          <span className="font-semibold text-red-600">{it.tempo}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {c.tags && (
                    <div className="flex flex-wrap gap-1">
                      {c.tags.map((t) => (
                        <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                      ))}
                    </div>
                  )}
                  {c.grid && (
                    <div className="grid grid-cols-2 gap-2">
                      {c.grid.map((g) => (
                        <div key={g.l} className="border rounded p-2 flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${g.color}`} />
                          <div>
                            <div className="text-base font-bold text-slate-800 leading-none">{g.v.toLocaleString("pt-BR")}</div>
                            <div className="text-[10px] text-slate-500">{g.l}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {c.techs && (
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {c.techs.map((t) => (
                        <div key={t.k} className="border rounded py-1.5">
                          <div className="text-lg font-bold text-slate-800">{t.v}</div>
                          <div className="text-[10px] text-slate-500">{t.k}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {c.summary && (
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {c.summary.map((s) => (
                        <div key={s.l} className="bg-slate-50 rounded py-1.5">
                          <div className="text-base font-bold text-slate-800">{s.v}</div>
                          <div className="text-[10px] text-slate-500">{s.l}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {c.topUFs && (
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-slate-500 mb-1">Top UFs Norte</div>
                      <div className="space-y-1">
                        {c.topUFs.map((u) => (
                          <div key={u.uf} className="flex items-center gap-2 text-xs">
                            <span className="w-6 font-semibold text-slate-600">{u.uf}</span>
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500" style={{ width: `${(u.v / 70) * 100}%` }} />
                            </div>
                            <span className="w-8 text-right font-semibold text-slate-700">{u.v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {c.note && <div className="text-[10px] text-slate-500 italic">{c.note}</div>}
                  <div className="flex items-center justify-between pt-1 border-t">
                    <button className="text-xs font-semibold text-purple-600 flex items-center gap-1">
                      Detalhes <ChevronRight className="h-3 w-3" />
                    </button>
                    <span className="text-[10px] text-slate-400">29 jun • 20:25</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Fonte: {c.fonte}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center text-xs text-slate-400 py-4">
            Painel de Monitoramento Norte • Dados de demonstração — integração externa pendente •
            UFs: {NORTE_UFS.join(", ")}
          </div>
        </main>
      </div>
    </>
  );
}
