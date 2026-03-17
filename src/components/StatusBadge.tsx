import { StatusPagamento } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: StatusPagamento;
  className?: string;
}

const statusConfig: Record<StatusPagamento, { label: string; className: string }> = {
  Ativo: { label: 'ATIVO', className: 'status-ativo' },
  Pendente: { label: 'PENDENTE', className: 'status-pendente' },
  'Em Atraso': { label: 'EM ATRASO', className: 'status-inadimplente' },
  'Só Inscrição': { label: 'SÓ INSCRIÇÃO', className: 'status-so-inscricao' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-widest border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
