import { Membro, Plano, Inscricao, HistoricoPagamento } from '@/types';

export const mockPlanos: Plano[] = [
  { id: '1', nome: 'Mensalidade Jiu-Jitsu', preco: 60, frequencia: 'mensal' },
  { id: '2', nome: 'Muay Thai', preco: 55, frequencia: 'mensal' },
  { id: '3', nome: 'Curso de Inglês', preco: 80, frequencia: 'mensal' },
  { id: '4', nome: 'Musculação', preco: 45, frequencia: 'mensal' },
];

export const mockMembros: Membro[] = [
  { id: '1', nome: 'Carlos Silva', email: 'carlos@email.com', telefone: '912345678', created_at: '2024-01-15' },
  { id: '2', nome: 'Ana Rodrigues', email: 'ana@email.com', telefone: '923456789', created_at: '2024-02-20' },
  { id: '3', nome: 'Pedro Santos', email: 'pedro@email.com', telefone: '934567890', created_at: '2024-03-10' },
  { id: '4', nome: 'Maria Costa', email: 'maria@email.com', telefone: '945678901', created_at: '2024-01-05' },
  { id: '5', nome: 'João Ferreira', email: 'joao@email.com', telefone: '956789012', created_at: '2024-04-01' },
  { id: '6', nome: 'Sofia Almeida', email: 'sofia@email.com', telefone: '967890123', created_at: '2024-03-22' },
];

export const mockInscricoes: Inscricao[] = [
  { id: '1', membro_id: '1', plano_id: '1', status: 'Inadimplente', dia_vencimento: 5, proximo_pagamento: '2026-03-05' },
  { id: '2', membro_id: '2', plano_id: '3', status: 'Ativo', dia_vencimento: 10, proximo_pagamento: '2026-04-10' },
  { id: '3', membro_id: '3', plano_id: '1', status: 'Pendente', dia_vencimento: 15, proximo_pagamento: '2026-03-15' },
  { id: '4', membro_id: '4', plano_id: '2', status: 'Inadimplente', dia_vencimento: 1, proximo_pagamento: '2026-03-01' },
  { id: '5', membro_id: '5', plano_id: '4', status: 'Ativo', dia_vencimento: 20, proximo_pagamento: '2026-04-20' },
  { id: '6', membro_id: '6', plano_id: '1', status: 'Inadimplente', dia_vencimento: 8, proximo_pagamento: '2026-03-08' },
];

export const mockHistorico: HistoricoPagamento[] = [
  { id: '1', membro_id: '2', valor: 80, data_pagamento: '2026-03-10' },
  { id: '2', membro_id: '2', valor: 80, data_pagamento: '2026-02-10' },
  { id: '3', membro_id: '5', valor: 45, data_pagamento: '2026-03-20' },
  { id: '4', membro_id: '5', valor: 45, data_pagamento: '2026-02-20' },
];
