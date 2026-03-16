export type StatusPagamento = 'Ativo' | 'Pendente' | 'Em Atraso';

export interface Membro {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  foto_url?: string;
  created_at: string;
}

export interface Plano {
  id: string;
  nome: string;
  preco: number;
  frequencia: string;
}

export interface Inscricao {
  id: string;
  membro_id: string;
  plano_id: string;
  status: StatusPagamento;
  dia_vencimento: number;
  proximo_pagamento: string;
  // joined
  membro?: Membro;
  plano?: Plano;
}

export interface HistoricoPagamento {
  id: string;
  membro_id: string;
  valor: number;
  data_pagamento: string;
}

export interface MembroComInscricao extends Membro {
  inscricoes: (Inscricao & { plano: Plano })[];
}
