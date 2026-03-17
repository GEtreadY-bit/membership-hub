import { useState, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInscricoes, getMembros, getPlanos, updateInscricao, createHistorico } from '@/lib/api';
import { StatsBar } from '@/components/StatsBar';
import { SearchFilter } from '@/components/SearchFilter';
import { MemberCard } from '@/components/MemberCard';
import { StatusPagamento } from '@/types';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { toast } from 'sonner';

const statusOrder: Record<StatusPagamento, number> = {
  'Em Atraso': 0,
  Pendente: 1,
  Ativo: 2,
};

export default function Dashboard() {
  const queryClient = useQueryClient();

  const { data: inscricoes = [], isLoading: isLoadingInscricoes } = useQuery({ queryKey: ['inscricoes'], queryFn: getInscricoes });
  const { data: membros = [], isLoading: isLoadingMembros } = useQuery({ queryKey: ['membros'], queryFn: getMembros });
  const { data: planos = [], isLoading: isLoadingPlanos } = useQuery({ queryKey: ['planos'], queryFn: getPlanos });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusPagamento | 'Todos'>('Todos');

  const filtered = useMemo(() => {
    return inscricoes
      .filter(i => {
        if (statusFilter !== 'Todos' && i.status !== statusFilter) return false;
        const membro = membros.find(m => m.id === i.membro_id);
        const plano = planos.find(p => p.id === i.plano_id);
        if (!membro || !plano) return false;
        const q = search.toLowerCase();
        return membro.nome.toLowerCase().includes(q) || plano.nome.toLowerCase().includes(q);
      })
      .sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  }, [inscricoes, membros, planos, search, statusFilter]);

  const planosChartData = useMemo(() => {
    return planos.map(plano => ({
      name: plano.nome,
      inscritos: inscricoes.filter(i => i.plano_id === plano.id).length,
    }));
  }, [planos, inscricoes]);

  const receitaChartData = useMemo(() => {
    const calcValor = (status: StatusPagamento) => {
      return inscricoes
        .filter(i => i.status === status)
        .reduce((acc, curr) => {
          const plano = planos.find(p => p.id === curr.plano_id);
          return acc + (plano?.preco || 0);
        }, 0);
    };

    return [
      { name: 'Faturado', valor: calcValor('Ativo'), fill: '#10b981' },
      { name: 'Pendente', valor: calcValor('Pendente'), fill: '#f59e0b' },
      { name: 'Em Atraso', valor: calcValor('Em Atraso'), fill: '#ef4444' },
    ];
  }, [inscricoes, planos]);

  const totalEsperado = useMemo(() => receitaChartData.reduce((acc, curr) => acc + curr.valor, 0), [receitaChartData]);

  const chartConfigPlanos = {
    inscritos: {
      label: "Inscritos",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  const chartConfigReceita = {
    valor: { label: "Valor (Kz)" },
    Faturado: { label: "Faturado", color: "#10b981" },
    Pendente: { label: "Pendente", color: "#f59e0b" },
    "Em Atraso": { label: "Em Atraso", color: "#ef4444" },
  } satisfies ChartConfig;

  const paymentMutation = useMutation({
    mutationFn: async ({ inscricaoId, valor, membroId }: { inscricaoId: string, valor: number, membroId: string }) => {
      await updateInscricao(inscricaoId, { status: 'Ativo' });
      await createHistorico({ membro_id: membroId, inscricao_id: inscricaoId, valor, data_pagamento: new Date().toISOString() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inscricoes'] });
      queryClient.invalidateQueries({ queryKey: ['historico'] });
      toast.success('Pagamento confirmado e registado no histórico!');
    },
    onError: () => toast.error('Erro ao processar o pagamento.'),
  });

  const handleConfirmarPagamento = (inscricaoId: string) => {
    const inscricao = inscricoes.find(i => i.id === inscricaoId);
    if (!inscricao) return;
    const plano = planos.find(p => p.id === inscricao.plano_id);
    if (!plano) return;

    paymentMutation.mutate({ inscricaoId, valor: plano.preco, membroId: inscricao.membro_id });
  };

  if (isLoadingInscricoes || isLoadingMembros || isLoadingPlanos) {
    return <div className="p-12 text-center text-muted-foreground">A carregar dashboard...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestão de fluxo, sem fricção.</p>
      </div>

      <StatsBar inscricoes={inscricoes} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gráfico de Planos (Bar) */}
        <div className="glass-surface-inner p-5 flex flex-col gap-4">
          <div>
            <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Distribuição por Plano</h2>
            <p className="text-xs text-muted-foreground mt-1">Número de membros por plano/serviço ativo</p>
          </div>
          <ChartContainer config={chartConfigPlanos} className="min-h-[250px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={planosChartData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickMargin={10} 
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="inscritos" fill="var(--color-inscritos)" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Gráfico de Receita */}
        <div className="glass-surface-inner p-5 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Previsão Mensal</h2>
              <p className="text-xs text-muted-foreground mt-1">Valores financeiros (Kz)</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Total Esperado</p>
              <p className="text-sm font-semibold text-foreground tabular-nums">
                {totalEsperado.toLocaleString('pt-AO')} Kz
              </p>
            </div>
          </div>
          <ChartContainer config={chartConfigReceita} className="min-h-[250px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={receitaChartData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickMargin={10} 
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value}
                />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="valor" radius={[4, 4, 0, 0]} barSize={40}>
                  {receitaChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>

      <SearchFilter
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((inscricao, index) => {
          const membro = membros.find(m => m.id === inscricao.membro_id)!;
          const plano = planos.find(p => p.id === inscricao.plano_id)!;
          return (
            <MemberCard
              key={inscricao.id}
              membro={membro}
              inscricao={inscricao}
              plano={plano}
              onConfirmarPagamento={handleConfirmarPagamento}
              index={index}
            />
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="glass-surface-inner p-12 text-center">
          <p className="text-muted-foreground">Nenhum membro encontrado.</p>
        </div>
      )}
    </div>
  );
}
