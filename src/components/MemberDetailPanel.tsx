import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, Calendar, CreditCard, ReceiptText, Clock, Hash } from 'lucide-react';
import { Membro, Inscricao, Plano, HistoricoPagamento } from '@/types';
import { StatusBadge } from './StatusBadge';
import { getRealStatus } from '@/lib/utils';

interface MemberDetailPanelProps {
  open: boolean;
  onClose: () => void;
  membro: Membro | null;
  inscricao: Inscricao | null;
  plano: Plano | null;
  historico: HistoricoPagamento[];
}

export function MemberDetailPanel({
  open,
  onClose,
  membro,
  inscricao,
  plano,
  historico,
}: MemberDetailPanelProps) {
  // Historico deste membro, agrupado por ano/mês
  const membroHistorico = useMemo(() => {
    if (!membro) return [];
    return historico
      .filter(h => h.membro_id === membro.id)
      .sort((a, b) => new Date(b.data_pagamento).getTime() - new Date(a.data_pagamento).getTime());
  }, [historico, membro]);

  const totalPago = useMemo(
    () => membroHistorico.reduce((acc, h) => acc + h.valor, 0),
    [membroHistorico]
  );

  // Agrupar por "Mês Ano"
  const groupedHistorico = useMemo(() => {
    const groups: Record<string, HistoricoPagamento[]> = {};
    membroHistorico.forEach(h => {
      const d = new Date(h.data_pagamento);
      const key = d.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(h);
    });
    return Object.entries(groups);
  }, [membroHistorico]);

  if (!membro) return null;

  const proximaData = inscricao
    ? new Date(inscricao.proximo_pagamento).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const dataCriacao = new Date(membro.created_at).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            key="panel"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col"
            style={{
              background: 'hsl(var(--background))',
              borderLeft: '1px solid hsl(var(--border))',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  {membro.foto_url ? (
                    <img
                      src={membro.foto_url}
                      alt={membro.nome}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground leading-tight">{membro.nome}</h2>
                  <span className="text-[10px] text-muted-foreground font-mono uppercase">
                    #{membro.id.substring(0, 8)}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Status + Plano */}
              {inscricao && plano && (
                <section>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                    Subscrição Atual
                  </p>
                  <div className="rounded-2xl border border-border bg-card/40 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{plano.nome}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {plano.preco.toLocaleString('pt-AO')} Kz/{plano.frequencia}
                        </p>
                      </div>
                      <StatusBadge status={getRealStatus(inscricao)} />
                    </div>
                    {proximaData && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>Próximo pagamento: <span className="text-foreground font-medium">{proximaData}</span></span>
                      </div>
                    )}
                    {(plano.taxa_inscricao ?? 0) > 0 && (
                      <div className="flex items-center gap-2 text-xs">
                        <CreditCard className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                        <span className="text-muted-foreground">Taxa de inscrição:</span>
                        <span className={`font-medium ${inscricao.taxa_inscricao_paga ? 'text-green-400' : 'text-orange-400'}`}>
                          {inscricao.taxa_inscricao_paga ? '✓ Paga' : `Pendente (${plano.taxa_inscricao!.toLocaleString('pt-AO')} Kz)`}
                        </span>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {!inscricao && (
                <section>
                  <div className="rounded-2xl border border-dashed border-border bg-card/20 p-4 text-center text-sm text-muted-foreground">
                    Sem plano de subscrição ativo
                  </div>
                </section>
              )}

              {/* Info do membro */}
              <section>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Informações de Contacto
                </p>
                <div className="rounded-2xl border border-border bg-card/40 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Hash className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground">ID:</span>
                    <span className="text-xs font-mono text-foreground">{membro.id.substring(0, 8)}…</span>
                  </div>
                  {membro.email ? (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm text-foreground">{membro.email}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 opacity-40">
                      <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm text-muted-foreground italic">Sem email</span>
                    </div>
                  )}
                  {membro.telefone ? (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm text-foreground">{membro.telefone}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 opacity-40">
                      <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm text-muted-foreground italic">Sem telefone</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                    <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground">Membro desde <span className="text-foreground font-medium">{dataCriacao}</span></span>
                  </div>
                </div>
              </section>

              {/* Histórico */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <ReceiptText className="w-3.5 h-3.5" />
                    Histórico de Pagamentos
                  </p>
                  {membroHistorico.length > 0 && (
                    <span className="text-xs font-semibold text-primary tabular-nums">
                      {totalPago.toLocaleString('pt-AO')} Kz total
                    </span>
                  )}
                </div>

                {membroHistorico.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-card/20 p-6 text-center text-sm text-muted-foreground">
                    Ainda sem pagamentos registados
                  </div>
                ) : (
                  <div className="space-y-4">
                    {groupedHistorico.map(([mesAno, items]) => (
                      <div key={mesAno}>
                        {/* Month label */}
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2 px-1 capitalize">
                          {mesAno}
                        </p>
                        <div className="rounded-2xl border border-border bg-card/40 overflow-hidden divide-y divide-border/40">
                          {items.map((h, idx) => (
                            <motion.div
                              key={h.id}
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.04, duration: 0.25 }}
                              className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors group"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full shrink-0 ${
                                  h.tipo === 'Inscrição' ? 'bg-purple-400' : 'bg-primary'
                                }`} />
                                <div className="flex flex-col">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-widest w-fit ${
                                    h.tipo === 'Inscrição'
                                      ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                                      : 'bg-primary/15 text-primary border-primary/30'
                                  }`}>
                                    {h.tipo ?? 'Mensalidade'}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground mt-1">
                                    {new Date(h.data_pagamento).toLocaleDateString('pt-PT', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                    })}
                                  </span>
                                </div>
                              </div>
                              <span className="text-sm font-semibold text-foreground tabular-nums">
                                {h.valor.toLocaleString('pt-AO')} Kz
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
