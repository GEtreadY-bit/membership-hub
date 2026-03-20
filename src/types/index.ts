export type StatusPagamento = 'Ativo' | 'Pendente' | 'Em Atraso' | 'Só Inscrição' | 'A Vencer';

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
  taxa_inscricao?: number;
  multa_atraso?: number;
}

export interface Inscricao {
  id: string;
  membro_id: string;
  plano_id: string;
  status: StatusPagamento;
  dia_vencimento: number;
  proximo_pagamento: string;
  taxa_inscricao_paga?: boolean;
  // joined
  membro?: Membro;
  plano?: Plano;
}

export interface HistoricoPagamento {
  id: string;
  membro_id: string;
  inscricao_id?: string;
  valor: number;
  tipo?: string; 
  data_pagamento: string;
}

export interface MembroComInscricao extends Membro {
  inscricoes: (Inscricao & { plano: Plano })[];
}
