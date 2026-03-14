import { useState, useMemo } from 'react';
import { StatsBar } from '@/components/StatsBar';
import { SearchFilter } from '@/components/SearchFilter';
import { MemberCard } from '@/components/MemberCard';
import { mockMembros, mockInscricoes, mockPlanos } from '@/data/mock';
import { StatusPagamento, Inscricao } from '@/types';

const statusOrder: Record<StatusPagamento, number> = {
  Inadimplente: 0,
  Pendente: 1,
  Ativo: 2,
};

export default function Dashboard() {
  const [inscricoes, setInscricoes] = useState<Inscricao[]>(mockInscricoes);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusPagamento | 'Todos'>('Todos');

  const filtered = useMemo(() => {
    return inscricoes
      .filter(i => {
        if (statusFilter !== 'Todos' && i.status !== statusFilter) return false;
        const membro = mockMembros.find(m => m.id === i.membro_id);
        const plano = mockPlanos.find(p => p.id === i.plano_id);
        if (!membro || !plano) return false;
        const q = search.toLowerCase();
        return membro.nome.toLowerCase().includes(q) || plano.nome.toLowerCase().includes(q);
      })
      .sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  }, [inscricoes, search, statusFilter]);

  const handleConfirmarPagamento = (inscricaoId: string) => {
    setInscricoes(prev =>
      prev.map(i =>
        i.id === inscricaoId
          ? { ...i, status: 'Ativo' as StatusPagamento }
          : i
      )
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestão de fluxo, sem fricção.</p>
      </div>

      <StatsBar inscricoes={inscricoes} />

      <SearchFilter
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((inscricao, index) => {
          const membro = mockMembros.find(m => m.id === inscricao.membro_id)!;
          const plano = mockPlanos.find(p => p.id === inscricao.plano_id)!;
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
