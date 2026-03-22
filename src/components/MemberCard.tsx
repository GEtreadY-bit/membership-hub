import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Calendar, ChevronDown, MoreVertical, Pencil, Trash2, ExternalLink } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from './StatusBadge';
import { Membro, Inscricao, Plano, StatusPagamento } from '@/types';
import { cn, getRealStatus } from '@/lib/utils';

interface MemberCardProps {
  membro: Membro;
  inscricao: Inscricao;
  plano: Plano;
  onConfirmarPagamento: (inscricaoId: string, meses: number, temMulta: boolean) => void;
  onConfirmarInscricao?: (inscricaoId: string) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewDetails?: () => void;
  index: number;
}

const glowMap: Record<StatusPagamento, string> = {
  'Em Atraso': 'glow-danger',
  'A Vencer': 'glow-a-vencer',
  Pendente: 'glow-warning',
  'Só Inscrição': 'glow-warning',
  Ativo: '',
};

const MESES_OPCOES = [1, 2, 3, 6, 12];

export function MemberCard({ membro, inscricao, plano, onConfirmarPagamento, onConfirmarInscricao, onEdit, onDelete, onViewDetails, index }: MemberCardProps) {
  const [confirming, setConfirming] = useState(false);
  const [confirmingInscricao, setConfirmingInscricao] = useState(false);
  const [mesesSelecionados, setMesesSelecionados] = useState(1);
  const [showMesesPicker, setShowMesesPicker] = useState(false);

  const handleConfirm = () => {
    setConfirming(true);
    setShowMesesPicker(false);
    setTimeout(() => {
      onConfirmarPagamento(inscricao.id, mesesSelecionados, isLate && multaAtraso > 0);
      setConfirming(false);
      setMesesSelecionados(1);
    }, 600);
  };

  const handleConfirmInscricao = () => {
    if (!onConfirmarInscricao) return;
    setConfirmingInscricao(true);
    setTimeout(() => {
      onConfirmarInscricao(inscricao.id);
      setConfirmingInscricao(false);
    }, 600);
  };

  const proximaData = new Date(inscricao.proximo_pagamento).toLocaleDateString('pt-PT', {
    month: 'short',
    year: 'numeric'
  });
  
  const proximaDataFormatada = proximaData.charAt(0).toUpperCase() + proximaData.slice(1).replace(' de ', '/');
  const mostrarBotaoInscricao = (plano.taxa_inscricao ?? 0) > 0 && !inscricao.taxa_inscricao_paga;

  const isLate = getRealStatus(inscricao) === 'Em Atraso';
  const multaAtraso = plano.multa_atraso ?? 0;
  const temMulta = isLate && multaAtraso > 0;

  const mostrarBotaoMensalidade = inscricao.status !== 'Ativo' || showMesesPicker;
  const totalMeses = (mesesSelecionados * plano.preco) + (temMulta ? multaAtraso : 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'glass-surface p-6 flex flex-col gap-4 transition-shadow duration-300',
        (confirming || confirmingInscricao) && 'glow-success',
        !(confirming || confirmingInscricao) && glowMap[getRealStatus(inscricao)]
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
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-foreground leading-tight">{membro.nome}</h3>
            <span className="text-[10px] text-muted-foreground uppercase font-mono mt-0.5">#{membro.id.substring(0, 5)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={confirming ? 'Ativo' : getRealStatus(inscricao)} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 -mr-2 hover:bg-muted/50 rounded-md transition-colors text-muted-foreground hover:text-foreground">
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 border-border/50 bg-background/95 backdrop-blur-md">
              <DropdownMenuItem onClick={onEdit} className="cursor-pointer gap-2">
                <Pencil className="w-4 h-4" /><span>Editar</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
                <Trash2 className="w-4 h-4" /><span>Eliminar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
            <p className="text-sm font-medium text-foreground capitalize">{proximaDataFormatada}</p>
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-1 flex-wrap">
        <span className="text-lg font-semibold text-foreground tabular-nums">
          {plano.preco.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz
        </span>
        <span className="text-xs text-muted-foreground">/{plano.frequencia}</span>
        {(plano.taxa_inscricao ?? 0) > 0 && (
          <span className="text-xs text-muted-foreground ml-1">
            {inscricao.taxa_inscricao_paga
              ? '· inscrição paga ✓'
              : `· + ${plano.taxa_inscricao.toLocaleString('pt-AO')} Kz inscrição`}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        {/* Botão inscrição */}
        {mostrarBotaoInscricao && (
          <button
            onClick={handleConfirmInscricao}
            disabled={confirmingInscricao}
            className="w-full py-2.5 rounded-xl text-sm font-medium bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 transition-colors disabled:opacity-50"
          >
            {confirmingInscricao
              ? 'A confirmar...'
              : `Confirmar Inscrição (${plano.taxa_inscricao!.toLocaleString('pt-AO')} Kz)`}
          </button>
        )}

        {/* Botão mensalidade + seletor de meses */}
        {inscricao.status !== 'Ativo' && (
          <div className="flex flex-col gap-1.5">
            {/* Seletor de meses */}
            <div className="flex items-center gap-1.5">
              {MESES_OPCOES.map(m => (
                <button
                  key={m}
                  onClick={() => setMesesSelecionados(m)}
                  className={cn(
                    'flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                    mesesSelecionados === m
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card/40 text-muted-foreground border-border hover:text-foreground'
                  )}
                >
                  {m === 1 ? '1 mês' : m === 12 ? '1 ano' : `${m}m`}
                </button>
              ))}
            </div>

            {/* Total */}
            {(mesesSelecionados > 1 || temMulta) && (
              <div className="text-xs text-muted-foreground text-center tabular-nums space-y-0.5 mt-1 mb-1">
                {temMulta && <p className="text-destructive/80 font-medium">+ Multa de Atraso: {multaAtraso.toLocaleString('pt-AO')} Kz</p>}
                <p>
                  Total: <span className="text-foreground font-medium">{totalMeses.toLocaleString('pt-AO')} Kz</span>
                </p>
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={confirming}
              className={cn(
                "w-full py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md disabled:opacity-50",
                temMulta ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-destructive/20" : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"
              )}
            >
              {confirming
                ? 'A confirmar...'
                : temMulta 
                  ? `Pagar + Multa (${totalMeses.toLocaleString('pt-AO')} Kz)`
                  : `Confirmar ${mesesSelecionados} M${mesesSelecionados > 1 ? 'eses' : 'ês'} (${totalMeses.toLocaleString('pt-AO')} Kz)`}
            </button>
          </div>
        )}

        {/* Membro Ativo - botão para pagar adiantado */}
        {inscricao.status === 'Ativo' && (
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => setShowMesesPicker(v => !v)}
              className="w-full py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground border border-border/50 hover:border-border bg-transparent flex items-center justify-center gap-1.5 transition-colors"
            >
              <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', showMesesPicker && 'rotate-180')} />
              Pagar meses adiantado
            </button>
            <AnimatePresence>
              {showMesesPicker && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden flex flex-col gap-1.5"
                >
                  <div className="flex items-center gap-1.5">
                    {MESES_OPCOES.map(m => (
                      <button
                        key={m}
                        onClick={() => setMesesSelecionados(m)}
                        className={cn(
                          'flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                          mesesSelecionados === m
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-card/40 text-muted-foreground border-border hover:text-foreground'
                        )}
                      >
                        {m === 1 ? '1 mês' : m === 12 ? '1 ano' : `${m}m`}
                      </button>
                    ))}
                  </div>
                  {mesesSelecionados > 1 && (
                    <p className="text-xs text-muted-foreground text-center tabular-nums">
                      Total: <span className="text-foreground font-medium">{totalMeses.toLocaleString('pt-AO')} Kz</span>
                    </p>
                  )}
                  <button
                    onClick={handleConfirm}
                    disabled={confirming}
                    className="w-full py-2.5 rounded-xl text-sm font-medium bg-foreground/5 hover:bg-foreground/10 border border-border transition-colors disabled:opacity-50"
                  >
                    {confirming
                      ? 'A confirmar...'
                      : mesesSelecionados === 1
                        ? 'Confirmar 1 Mês'
                        : `Confirmar ${mesesSelecionados} Meses (${totalMeses.toLocaleString('pt-AO')} Kz)`}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Ver detalhes */}
      <button
        onClick={onViewDetails}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 border border-transparent hover:border-border/50 transition-all mt-1"
      >
        <ExternalLink className="w-3 h-3" />
        Ver Ficha Completa
      </button>
    </motion.div>
  );
}
