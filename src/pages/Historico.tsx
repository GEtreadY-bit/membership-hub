import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getHistorico, getMembros, getPlanos } from '@/lib/api';
import { Search, ReceiptText, TrendingUp, Users } from 'lucide-react';
import { HistoricoPagamento } from '@/types';

export default function Historico() {
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState<'Todos' | 'Mensalidade' | 'Inscrição'>('Todos');

  const { data: historico = [], isLoading: loadingHistorico } = useQuery({
    queryKey: ['historico'],
    queryFn: getHistorico,
  });

  const { data: membros = [], isLoading: loadingMembros } = useQuery({
    queryKey: ['membros'],
    queryFn: getMembros,
  });

  const { data: planos = [] } = useQuery({
    queryKey: ['planos'],
    queryFn: getPlanos,
  });

  const filteredHistorico = useMemo(() => {
    return historico.filter(h => {
      const membro = membros.find(m => m.id === h.membro_id);
      const shortId = membro?.id.split('-')[0].toLowerCase() || '';
      const q = search.toLowerCase();

      const matchSearch =
        !q ||
        membro?.nome.toLowerCase().includes(q) ||
        h.tipo?.toLowerCase().includes(q) ||
        shortId.includes(q);

      const matchTipo =
        tipoFilter === 'Todos' ||
        (tipoFilter === 'Inscrição' && h.tipo === 'Inscrição') ||
        (tipoFilter === 'Mensalidade' && h.tipo !== 'Inscrição');

      return matchSearch && matchTipo;
    });
  }, [historico, membros, search, tipoFilter]);

  // Group by month
  const groupedByMonth = useMemo(() => {
    const groups: Record<string, { items: HistoricoPagamento[]; total: number }> = {};
    filteredHistorico.forEach(h => {
      const d = new Date(h.data_pagamento);
      const key = d.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = { items: [], total: 0 };
      groups[key].items.push(h);
      groups[key].total += h.valor;
    });
    return Object.entries(groups);
  }, [filteredHistorico]);

  // Stats
  const totalGeral = useMemo(() => filteredHistorico.reduce((acc, h) => acc + h.valor, 0), [filteredHistorico]);
  const membrosUnicos = useMemo(() => new Set(filteredHistorico.map(h => h.membro_id)).size, [filteredHistorico]);

  if (loadingHistorico || loadingMembros) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground">
        A carregar histórico...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Histórico de Pagamentos</h1>
          <p className="text-sm text-muted-foreground mt-1">{filteredHistorico.length} registos encontrados</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <ReceiptText className="w-5 h-5 text-primary" />
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-surface-inner p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Total Recebido</p>
            <p className="text-sm font-semibold text-foreground tabular-nums">{totalGeral.toLocaleString('pt-AO')} Kz</p>
          </div>
        </div>
        <div className="glass-surface-inner p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Membros</p>
            <p className="text-sm font-semibold text-foreground">{membrosUnicos}</p>
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar por membro, ID ou tipo..."
            className="w-full bg-card/40 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 backdrop-blur-lg transition-all"
          />
        </div>
        <div className="flex gap-1.5 shrink-0">
          {(['Todos', 'Mensalidade', 'Inscrição'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTipoFilter(t)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${tipoFilter === t ? 'bg-primary text-primary-foreground' : 'bg-card/40 text-muted-foreground hover:text-foreground border border-border'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {filteredHistorico.length === 0 ? (
        <div className="glass-surface p-12 flex flex-col items-center gap-4">
          <div className="w-48 h-48 opacity-40">
            <img src="/empty_history_illustration.png" alt="Sem histórico" className="w-full h-full object-contain" />
          </div>
          <p className="text-sm text-muted-foreground">Nenhum pagamento encontrado para esta pesquisa.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedByMonth.map(([mesAno, { items, total }], groupIdx) => (
            <motion.div
              key={mesAno}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIdx * 0.05, duration: 0.3 }}
            >
              {/* Month header */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground capitalize">
                  {mesAno}
                </h2>
                <span className="text-[11px] font-semibold text-primary tabular-nums">
                  {total.toLocaleString('pt-AO')} Kz
                </span>
              </div>

              {/* Table for this month */}
              <div className="glass-surface overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/20">
                        <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-5 py-3">Membro</th>
                        <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-5 py-3">Tipo</th>
                        <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-5 py-3">Data</th>
                        <th className="text-right text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-5 py-3">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {items.map((h, i) => {
                        const membro = membros.find(m => m.id === h.membro_id);
                        return (
                          <motion.tr
                            key={h.id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.01 + groupIdx * 0.03, duration: 0.2 }}
                            className="hover:bg-muted/20 transition-colors group"
                          >
                            <td className="px-5 py-3.5 min-w-[180px]">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors shrink-0">
                                  {membro?.nome?.charAt(0).toUpperCase() ?? '?'}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-foreground leading-tight">{membro?.nome ?? 'Membro Removido'}</span>
                                  {membro && (
                                    <span className="text-[10px] text-muted-foreground font-mono uppercase bg-muted/50 px-1.5 py-0.5 rounded-md w-fit mt-0.5">
                                      #{membro.id.substring(0, 5)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-widest ${
                                h.tipo === 'Inscrição'
                                  ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                                  : 'bg-primary/15 text-primary border-primary/30'
                              }`}>
                                {h.tipo ?? 'Mensalidade'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-sm text-muted-foreground tabular-nums whitespace-nowrap">
                              {new Date(h.data_pagamento).toLocaleDateString('pt-PT', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="px-5 py-3.5 text-sm text-foreground text-right tabular-nums font-semibold whitespace-nowrap">
                              {h.valor.toLocaleString('pt-AO')} Kz
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                    {/* Month subtotal */}
                    <tfoot>
                      <tr className="border-t border-border bg-muted/10">
                        <td colSpan={3} className="px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Subtotal — {items.length} pagamento{items.length !== 1 ? 's' : ''}
                        </td>
                        <td className="px-5 py-2.5 text-sm font-bold text-right text-primary tabular-nums">
                          {total.toLocaleString('pt-AO')} Kz
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
