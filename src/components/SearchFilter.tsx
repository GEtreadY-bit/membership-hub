import { Search } from 'lucide-react';
import { StatusPagamento } from '@/types';

interface SearchFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusPagamento | 'Todos';
  onStatusFilterChange: (value: StatusPagamento | 'Todos') => void;
}

const statuses: (StatusPagamento | 'Todos')[] = ['Todos', 'Em Atraso', 'Pendente', 'Ativo'];

const statusLabels: Record<string, string> = {
  Todos: 'Todos',
  'Em Atraso': 'Em atraso',
  Pendente: 'Pendente',
  Ativo: 'Ativo',
};

export function SearchFilter({ search, onSearchChange, statusFilter, onStatusFilterChange }: SearchFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Pesquisar membro ou plano..."
          className="w-full bg-card/40 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 backdrop-blur-lg"
        />
      </div>
      <div className="flex gap-1.5">
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => onStatusFilterChange(s)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === s
                ? 'bg-primary text-primary-foreground'
                : 'bg-card/40 text-muted-foreground hover:text-foreground border border-border'
            }`}
          >
            {statusLabels[s]}
          </button>
        ))}
      </div>
    </div>
  );
}
