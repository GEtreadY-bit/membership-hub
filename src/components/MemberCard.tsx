import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Calendar } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { Membro, Inscricao, Plano, StatusPagamento } from '@/types';
import { cn } from '@/lib/utils';

interface MemberCardProps {
  membro: Membro;
  inscricao: Inscricao;
  plano: Plano;
  onConfirmarPagamento: (inscricaoId: string) => void;
  index: number;
}

const glowMap: Record<StatusPagamento, string> = {
  Inadimplente: 'glow-danger',
  Pendente: 'glow-warning',
  Ativo: '',
};

export function MemberCard({ membro, inscricao, plano, onConfirmarPagamento, index }: MemberCardProps) {
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = () => {
    setConfirming(true);
    setTimeout(() => {
      onConfirmarPagamento(inscricao.id);
      setConfirming(false);
    }, 600);
  };

  const proximaData = new Date(inscricao.proximo_pagamento).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'short',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'glass-surface p-6 flex flex-col gap-4 transition-shadow duration-300',
        confirming && 'glow-success',
        !confirming && glowMap[inscricao.status]
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            {membro.foto_url ? (
              <img src={membro.foto_url} alt={membro.nome} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <h3 className="text-sm font-semibold text-foreground">{membro.nome}</h3>
        </div>
        <StatusBadge status={confirming ? 'Ativo' : inscricao.status} />
      </div>

      {/* Body */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-0.5">Plano</p>
          <p className="text-sm text-foreground">{plano.nome}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-0.5">Próximo</p>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-sm text-foreground tabular-nums">{proximaData}</p>
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-semibold text-foreground tabular-nums">{plano.preco.toFixed(2)}€</span>
        <span className="text-xs text-muted-foreground">/{plano.frequencia}</span>
      </div>

      {/* Action */}
      {inscricao.status !== 'Ativo' && (
        <button
          onClick={handleConfirm}
          disabled={confirming}
          className="w-full py-2.5 rounded-xl text-sm font-medium bg-foreground/5 hover:bg-foreground/10 border border-border transition-colors disabled:opacity-50"
        >
          {confirming ? 'A confirmar...' : 'Confirmar Recebimento'}
        </button>
      )}
    </motion.div>
  );
}
