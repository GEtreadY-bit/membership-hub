import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getHistorico, getMembros } from '@/lib/api';
import { Search, ReceiptText, ArrowUpDown } from 'lucide-react';

export default function Historico() {
  const [search, setSearch] = useState('');

  const { data: historico = [], isLoading: loadingHistorico } = useQuery({
    queryKey: ['historico'],
    queryFn: getHistorico,
  });

  const { data: membros = [], isLoading: loadingMembros } = useQuery({
    queryKey: ['membros'],
    queryFn: getMembros,
  });

  const filteredHistorico = useMemo(() => {
    if (!search) return historico;
    const q = search.toLowerCase();
    return historico.filter(h => {
      const membro = membros.find(m => m.id === h.membro_id);
      return (
        membro?.nome.toLowerCase().includes(q) ||
        h.tipo?.toLowerCase().includes(q)
      );
    });
  }, [historico, membros, search]);

  if (loadingHistorico || loadingMembros) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground">
        A carregar histórico...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Histórico de Pagamentos</h1>
          <p className="text-sm text-muted-foreground mt-1">{filteredHistorico.length} registos encontrados</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <ReceiptText className="w-5 h-5 text-primary" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar por membro ou tipo de pagamento..."
            className="w-full bg-card/40 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 backdrop-blur-lg transition-all"
          />
        </div>
        <div className="glass-surface-inner px-4 py-2.5 flex items-center gap-3 shrink-0">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">Total Visível</p>
          <p className="text-sm font-semibold text-primary tabular-nums whitespace-nowrap">
            {filteredHistorico.reduce((acc, curr) => acc + curr.valor, 0).toLocaleString('pt-AO')} Kz
          </p>
        </div>
      </div>

      <div className="glass-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-[11px] uppercase tracking-wider text-muted-foreground font-semibold px-6 py-4">
                  <div className="flex items-center gap-2">Membro <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="text-left text-[11px] uppercase tracking-wider text-muted-foreground font-semibold px-6 py-4">Tipo</th>
                <th className="text-left text-[11px] uppercase tracking-wider text-muted-foreground font-semibold px-6 py-4">Data</th>
                <th className="text-right text-[11px] uppercase tracking-wider text-muted-foreground font-semibold px-6 py-4">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredHistorico.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center flex flex-col items-center gap-4">
                    <div className="w-48 h-48 opacity-40">
                      <img src="/empty_history_illustration.png" alt="Sem histórico" className="w-full h-full object-contain" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Nenhum pagamento encontrado para esta pesquisa.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredHistorico.map((h, i) => {
                  const membro = membros.find(m => m.id === h.membro_id);
                  return (
                    <motion.tr
                      key={h.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.01, duration: 0.2 }}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="px-6 py-4 min-w-[200px]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                            {membro?.nome?.charAt(0).toUpperCase() ?? '?'}
                          </div>
                          <span className="text-sm font-medium text-foreground">{membro?.nome ?? 'Membro Removido'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-widest ${
                          h.tipo === 'Inscrição'
                            ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                            : 'bg-primary/15 text-primary border-primary/30'
                        }`}>
                          {h.tipo ?? 'Mensalidade'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground tabular-nums whitespace-nowrap">
                        {new Date(h.data_pagamento).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground text-right tabular-nums font-semibold whitespace-nowrap">
                        {h.valor.toLocaleString('pt-AO')} Kz
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
