"use client";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList,
  AreaChart, Area, PieChart, Pie, Cell, ComposedChart, Line, ReferenceDot,
} from "recharts";

type Ponto = { mes: string; faturamento: number; despesas: number; lucro: number; caixa: number };

const brl = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
const eixo = (v: number) => new Intl.NumberFormat("pt-BR").format(v);
const curto = (v: number) => (v ? new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(v) : "");
const tip = {
  contentStyle: { background: "#0E1A2E", border: "1px solid #1D2C47", borderRadius: 10, color: "#E6EDF7", fontSize: 13 },
  labelStyle: { color: "#8A9BB5" },
  formatter: (v: number, n: string) => [brl(v), n],
  cursor: { fill: "rgba(138,155,181,0.08)" },
};
const tick = { fill: "#8A9BB5", fontSize: 12 };

const DEFS = (
  <defs>
    <linearGradient id="gVerde" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#4ADE80" />
      <stop offset="100%" stopColor="#16A34A" />
    </linearGradient>
    <linearGradient id="gAzul" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#60A5FA" />
      <stop offset="100%" stopColor="#2563EB" />
    </linearGradient>
    <linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#22C55E" stopOpacity={0.35} />
      <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
    </linearGradient>
  </defs>
);

export function BarrasFatDesp({ dados }: { dados: Ponto[] }) {
  return (
    <ResponsiveContainer width="100%" height={230}>
      <BarChart data={dados} margin={{ top: 22, right: 4, left: -8, bottom: 0 }} barGap={4}>
        {DEFS}
        <CartesianGrid stroke="#1D2C47" vertical={false} />
        <XAxis dataKey="mes" tick={tick} axisLine={false} tickLine={false} />
        <YAxis tick={tick} axisLine={false} tickLine={false} tickFormatter={eixo} width={56} />
        <Tooltip {...tip} />
        <Bar isAnimationActive={false} dataKey="faturamento" name="Faturamento" fill="url(#gVerde)" radius={[4, 4, 0, 0]} maxBarSize={26}>
          <LabelList dataKey="faturamento" position="top" formatter={curto} fill="#E6EDF7" fontSize={11} />
        </Bar>
        <Bar isAnimationActive={false} dataKey="despesas" name="Despesas" fill="url(#gAzul)" radius={[4, 4, 0, 0]} maxBarSize={26}>
          <LabelList dataKey="despesas" position="top" formatter={curto} fill="#E6EDF7" fontSize={11} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LinhaCaixa({ dados }: { dados: Ponto[] }) {
  const ult = dados[dados.length - 1];
  return (
    <ResponsiveContainer width="100%" height={230}>
      <AreaChart data={dados} margin={{ top: 34, right: 48, left: -8, bottom: 0 }}>
        {DEFS}
        <CartesianGrid stroke="#1D2C47" />
        <XAxis dataKey="mes" tick={tick} axisLine={false} tickLine={false} />
        <YAxis tick={tick} axisLine={false} tickLine={false} tickFormatter={eixo} width={56} />
        <Tooltip {...tip} />
        <Area isAnimationActive={false} type="linear" dataKey="caixa" name="Saldo do mês" stroke="#22C55E" strokeWidth={2.5} fill="url(#gArea)"
          dot={{ r: 3.5, fill: "#22C55E", stroke: "#22C55E" }} />
        {ult && (
          <ReferenceDot x={ult.mes} y={ult.caixa} r={6} fill="#22C55E" stroke="#0E1A2E" strokeWidth={2}
            label={{ value: brl(ult.caixa), position: "top", fill: "#fff", fontSize: 12, fontWeight: 600, offset: 12 }} />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function Rosca({ dados, total, cores }: { dados: { nome: string; valor: number }[]; total: number; cores: string[] }) {
  return (
    <div className="relative h-[180px] w-[180px] shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie isAnimationActive={false} data={dados.length ? dados : [{ nome: "vazio", valor: 1 }]} dataKey="valor" nameKey="nome"
            innerRadius={58} outerRadius={86} stroke="#0E1A2E" strokeWidth={2} startAngle={90} endAngle={-270}>
            {(dados.length ? dados : [{ nome: "" }]).map((_, i) => (
              <Cell key={i} fill={dados.length ? cores[i % cores.length] : "#1D2C47"} />
            ))}
          </Pie>
          {dados.length > 0 && <Tooltip {...tip} />}
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-lg font-bold text-ink">{brl(total)}</span>
        <span className="text-[11px] text-mute">Total de despesas</span>
      </div>
    </div>
  );
}

export function Combinado({ dados }: { dados: Ponto[] }) {
  return (
    <ResponsiveContainer width="100%" height={130}>
      <ComposedChart data={dados} margin={{ top: 6, right: 4, left: -8, bottom: 0 }} barGap={2}>
        {DEFS}
        <CartesianGrid stroke="#1D2C47" vertical={false} />
        <XAxis dataKey="mes" tick={tick} axisLine={false} tickLine={false} />
        <YAxis tick={tick} axisLine={false} tickLine={false} tickFormatter={eixo} width={56} />
        <Tooltip {...tip} />
        <Bar isAnimationActive={false} dataKey="faturamento" name="Faturamento" fill="url(#gVerde)" maxBarSize={30} />
        <Bar isAnimationActive={false} dataKey="despesas" name="Despesas" fill="url(#gAzul)" maxBarSize={30} />
        <Line isAnimationActive={false} dataKey="lucro" name="Lucro" stroke="#FACC15" strokeWidth={2} dot={{ r: 3, fill: "#FACC15" }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
