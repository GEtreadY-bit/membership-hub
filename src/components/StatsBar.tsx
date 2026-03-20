import { Inscricao } from '@/types';
import { getRealStatus } from '@/lib/utils';

interface StatsBarProps {
  inscricoes: Inscricao[];
}

export function StatsBar({ inscricoes }: StatsBarProps) {
  const ativos = inscricoes.filter(i => getRealStatus(i) === 'Ativo').length;
  const aVencer = inscricoes.filter(i => getRealStatus(i) === 'A Vencer').length;
  const pendentes = inscricoes.filter(i => getRealStatus(i) === 'Pendente').length;
  const inadimplentes = inscricoes.filter(i => getRealStatus(i) === 'Em Atraso').length;

  const stats = [
    { label: 'Total', value: inscricoes.length, color: 'text-foreground' },
    { label: 'Ativos', value: ativos, color: 'text-success' },
    { label: 'A Vencer', value: aVencer, color: 'text-orange-500' },
    { label: 'Pendentes', value: pendentes, color: 'text-warning' },
    { label: 'Em atraso', value: inadimplentes, color: 'text-destructive' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {stats.map(stat => (
        <div key={stat.label} className="glass-surface-inner p-4">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">{stat.label}</p>
          <p className={`text-2xl font-semibold tabular-nums ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
