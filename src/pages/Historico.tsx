import { motion } from 'framer-motion';
import { mockHistorico, mockMembros } from '@/data/mock';

export default function Historico() {
  const historico = [...mockHistorico].sort(
    (a, b) => new Date(b.data_pagamento).getTime() - new Date(a.data_pagamento).getTime()
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Histórico de Pagamentos</h1>
        <p className="text-sm text-muted-foreground mt-1">{historico.length} registos</p>
      </div>

      <div className="glass-surface overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-[11px] uppercase tracking-wider text-muted-foreground font-medium px-5 py-3">Membro</th>
              <th className="text-left text-[11px] uppercase tracking-wider text-muted-foreground font-medium px-5 py-3">Data</th>
              <th className="text-right text-[11px] uppercase tracking-wider text-muted-foreground font-medium px-5 py-3">Valor</th>
            </tr>
          </thead>
          <tbody>
            {historico.map((h, i) => {
              const membro = mockMembros.find(m => m.id === h.membro_id);
              return (
                <motion.tr
                  key={h.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border/50 last:border-0"
                >
                  <td className="px-5 py-3.5 text-sm text-foreground">{membro?.nome ?? '—'}</td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground tabular-nums">
                    {new Date(h.data_pagamento).toLocaleDateString('pt-PT')}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-foreground text-right tabular-nums font-medium">
                    {h.valor.toLocaleString('pt-AO')} Kz
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
