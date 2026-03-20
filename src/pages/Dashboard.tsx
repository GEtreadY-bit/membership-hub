import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell, ResponsiveContainer } from "recharts";
import { useQuery } from '@tanstack/react-query';
import { getInscricoes, getMembros, getPlanos, getHistorico } from '@/lib/api';
import { StatsBar } from '@/components/StatsBar';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Link } from 'react-router-dom';
import { Clock, Plus } from 'lucide-react';
import { getRealStatus } from '@/lib/utils';

export default function Dashboard() {
  const { data: inscricoes = [], isLoading: loadingInscricoes } = useQuery({ queryKey: ['inscricoes'], queryFn: getInscricoes });
  const { data: membros = [], isLoading: loadingMembros } = useQuery({ queryKey: ['membros'], queryFn: getMembros });
  const { data: planos = [], isLoading: loadingPlanos } = useQuery({ queryKey: ['planos'], queryFn: getPlanos });
  const { data: historico = [], isLoading: loadingHistorico } = useQuery({ queryKey: ['historico'], queryFn: getHistorico });

  const ultimasAtividades = useMemo(() => historico.slice(0, 5), [historico]);

  const planosChartData = useMemo(() => {
    return planos.map(plano => ({
      name: plano.nome,
      inscritos: inscricoes.filter(i => i.plano_id === plano.id).length,
    }));
  }, [planos, inscricoes]);

  const receitaChartData = useMemo(() => {
    const calcValor = (status: string) => {
      return inscricoes
        .filter(i => getRealStatus(i) === status)
        .reduce((acc, curr) => {
          const plano = planos.find(p => p.id === curr.plano_id);
          return acc + (plano?.preco || 0);
        }, 0);
    };
    return [
      { name: 'Faturado', valor: calcValor('Ativo'), fill: '#10b981' },
      { name: 'Pendente', valor: calcValor('Pendente'), fill: '#f59e0b' },
      { name: 'A Vencer', valor: calcValor('A Vencer'), fill: '#f97316' },
      { name: 'Em Atraso', valor: calcValor('Em Atraso'), fill: '#ef4444' },
    ];
  }, [inscricoes, planos]);

  const totalEsperado = useMemo(() => receitaChartData.reduce((acc, curr) => acc + curr.valor, 0), [receitaChartData]);

  const chartConfigPlanos = {
    inscritos: { label: "Inscritos", color: "hsl(var(--primary))" },
  } satisfies ChartConfig;

  const chartConfigReceita = {
    valor: { label: "Valor (Kz)" },
    Faturado: { label: "Faturado", color: "#10b981" },
    Pendente: { label: "Pendente", color: "#f59e0b" },
    "A Vencer": { label: "A Vencer", color: "#f97316" },
    "Em Atraso": { label: "Em Atraso", color: "#ef4444" },
  } satisfies ChartConfig;

  if (loadingInscricoes || loadingMembros || loadingPlanos) {
    return <div className="p-12 text-center text-muted-foreground">A carregar dashboard...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral do negócio.</p>
      </div>

      <StatsBar inscricoes={inscricoes} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Distribuição por Plano */}
        <div className="glass-surface-inner p-5 flex flex-col gap-4">
          <div>
            <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Distribuição por Plano</h2>
            <p className="text-xs text-muted-foreground mt-1">Número de membros por plano</p>
          </div>
          {planosChartData.length === 0 || planosChartData.every(d => d.inscritos === 0) ? (
            <div className="min-h-[250px] flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Nenhum dado disponível</p>
            </div>
          ) : (
            <ChartContainer config={chartConfigPlanos} className="min-h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={planosChartData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false}
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickMargin={10} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="inscritos" fill="var(--color-inscritos)" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>

        {/* Previsão de Receita */}
        <div className="glass-surface-inner p-5 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Previsão Mensal</h2>
              <p className="text-xs text-muted-foreground mt-1">Valores por estado de pagamento</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Total Esperado</p>
              <p className="text-sm font-semibold text-foreground tabular-nums">
                {totalEsperado.toLocaleString('pt-AO')} Kz
              </p>
            </div>
          </div>
          {totalEsperado === 0 ? (
            <div className="min-h-[250px] flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Nenhum dado disponível</p>
            </div>
          ) : (
            <ChartContainer config={chartConfigReceita} className="min-h-[250px] w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={receitaChartData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false}
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickMargin={10} />
                  <YAxis tickLine={false} axisLine={false}
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value} />
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="valor" radius={[4, 4, 0, 0]} barSize={40}>
                    {receitaChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>
      </div>

      {/* Resumo rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPIs */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="glass-surface-inner p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Total Membros</p>
            <p className="text-2xl font-semibold tabular-nums">{membros.length}</p>
          </div>
          <div className="glass-surface-inner p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Planos Ativos</p>
            <p className="text-2xl font-semibold tabular-nums">{planos.length}</p>
          </div>
          <div className="glass-surface-inner p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Receita Confirmada</p>
            <p className="text-2xl font-semibold tabular-nums text-success">
              {receitaChartData.find(d => d.name === 'Faturado')?.valor.toLocaleString('pt-AO') ?? 0} Kz
            </p>
          </div>

          <div className="sm:col-span-3 glass-surface-inner p-5 flex flex-col gap-4">
             <div className="flex justify-between items-center">
               <div className="flex items-center gap-2">
                 <Clock className="w-4 h-4 text-primary" />
                 <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Últimas Atividades</h2>
               </div>
               <Link to="/historico" className="text-[11px] font-medium text-primary hover:underline">Ver tudo</Link>
             </div>
             <div className="space-y-3">
               {ultimasAtividades.length === 0 ? (
                 <p className="text-sm text-muted-foreground text-center py-4">Sem atividade recente.</p>
               ) : (
                 ultimasAtividades.map((h, i) => {
                   const membro = membros.find(m => m.id === h.membro_id);
                   return (
                     <div key={h.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                       <div className="min-w-0">
                         <p className="text-sm font-medium text-foreground truncate">{membro?.nome ?? 'Membro'}</p>
                         <p className="text-[10px] text-muted-foreground">{h.tipo || 'Mensalidade'} · {new Date(h.data_pagamento).toLocaleDateString()}</p>
                       </div>
                       <p className="text-sm font-semibold text-foreground tabular-nums whitespace-nowrap">
                         +{h.valor.toLocaleString('pt-AO')} Kz
                       </p>
                     </div>
                   );
                 })
               )}
             </div>
          </div>
        </div>

        {/* Tip: Upgrade logic or Quick Stats here if needed */}
        <div className="glass-surface-inner p-6 flex flex-col items-center justify-center text-center gap-4 bg-primary/5">
           <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Plus className="w-6 h-6 text-primary" />
           </div>
           <div>
             <h3 className="text-sm font-bold text-foreground">Novo Registo</h3>
             <p className="text-xs text-muted-foreground mt-1 px-4">Adicione rapidamente um novo membro à plataforma.</p>
           </div>
           <Link to="/membros" className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all">
             Ir para Membros
           </Link>
        </div>
      </div>
    </div>
  );
}
