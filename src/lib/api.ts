import { supabase } from './supabase';
import { Membro, Plano, Inscricao, HistoricoPagamento } from '@/types';

// =======================
// PLANOS
// =======================
export const getPlanos = async (): Promise<Plano[]> => {
  const { data, error } = await supabase.from('planos').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as Plano[];
};

export const createPlano = async (plano: Omit<Plano, 'id' | 'created_at'>): Promise<Plano> => {
  const payload: Record<string, unknown> = {
    nome: plano.nome,
    preco: plano.preco,
    frequencia: plano.frequencia,
  };
  if (plano.taxa_inscricao !== undefined && plano.taxa_inscricao > 0) {
    payload.taxa_inscricao = plano.taxa_inscricao;
  }
  if (plano.multa_atraso !== undefined && plano.multa_atraso > 0) {
    payload.multa_atraso = plano.multa_atraso;
  }
  const { data, error } = await supabase.from('planos').insert([payload]).select().single();
  if (error) throw error;
  return data as Plano;
};

export const updatePlano = async (id: string, plano: Partial<Plano>): Promise<Plano> => {
  const payload: Record<string, unknown> = {};
  if (plano.nome !== undefined) payload.nome = plano.nome;
  if (plano.preco !== undefined) payload.preco = plano.preco;
  if (plano.frequencia !== undefined) payload.frequencia = plano.frequencia;
  if (plano.taxa_inscricao !== undefined) payload.taxa_inscricao = plano.taxa_inscricao;
  if (plano.multa_atraso !== undefined) payload.multa_atraso = plano.multa_atraso;
  const { data, error } = await supabase.from('planos').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data as Plano;
};

export const deletePlano = async (id: string): Promise<void> => {
  const { error } = await supabase.from('planos').delete().eq('id', id);
  if (error) throw error;
};

// =======================
// MEMBROS
// =======================
export const getMembros = async (): Promise<Membro[]> => {
  const { data, error } = await supabase.from('membros').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as Membro[];
};

export const createMembro = async (membro: Omit<Membro, 'id' | 'created_at'>): Promise<Membro> => {
  const { data, error } = await supabase.from('membros').insert([membro]).select().single();
  if (error) throw error;
  return data as Membro;
};

export const updateMembro = async (id: string, membro: Partial<Membro>): Promise<Membro> => {
  const { data, error } = await supabase.from('membros').update(membro).eq('id', id).select().single();
  if (error) throw error;
  return data as Membro;
};

export const deleteMembro = async (id: string): Promise<void> => {
  const { error } = await supabase.from('membros').delete().eq('id', id);
  if (error) throw error;
};

// =======================
// INSCRICOES
// =======================
export const getInscricoes = async (): Promise<Inscricao[]> => {
  const { data, error } = await supabase.from('inscricoes').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as Inscricao[];
};

export const createInscricao = async (inscricao: Omit<Inscricao, 'id' | 'created_at'>): Promise<Inscricao> => {
  const payload: Record<string, unknown> = {
    membro_id: inscricao.membro_id,
    plano_id: inscricao.plano_id,
    status: inscricao.status,
    dia_vencimento: inscricao.dia_vencimento,
    proximo_pagamento: inscricao.proximo_pagamento,
  };
  if (inscricao.taxa_inscricao_paga !== undefined) {
    payload.taxa_inscricao_paga = inscricao.taxa_inscricao_paga;
  }
  const { data, error } = await supabase.from('inscricoes').insert([payload]).select().single();
  if (error) throw error;
  return data as Inscricao;
};

export const updateInscricao = async (id: string, inscricao: Partial<Inscricao>): Promise<Inscricao> => {
  const payload: Record<string, unknown> = {};
  if (inscricao.status !== undefined) payload.status = inscricao.status;
  if (inscricao.plano_id !== undefined) payload.plano_id = inscricao.plano_id;
  if (inscricao.taxa_inscricao_paga !== undefined) payload.taxa_inscricao_paga = inscricao.taxa_inscricao_paga;
  if (inscricao.dia_vencimento !== undefined) payload.dia_vencimento = inscricao.dia_vencimento;
  if (inscricao.proximo_pagamento !== undefined) payload.proximo_pagamento = inscricao.proximo_pagamento;
  const { data, error } = await supabase.from('inscricoes').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data as Inscricao;
};

export const deleteInscricao = async (id: string): Promise<void> => {
  const { error } = await supabase.from('inscricoes').delete().eq('id', id);
  if (error) throw error;
};

export const deleteInscricaoByMembroId = async (membroId: string): Promise<void> => {
  const { error } = await supabase.from('inscricoes').delete().eq('membro_id', membroId);
  if (error) throw error;
};

// =======================
// HISTORICO
// =======================
export const getHistorico = async (): Promise<HistoricoPagamento[]> => {
  const { data, error } = await supabase.from('historico_pagamentos').select('*').order('data_pagamento', { ascending: false });
  if (error) throw error;
  return data as HistoricoPagamento[];
};

export const createHistorico = async (historico: Omit<HistoricoPagamento, 'id'>): Promise<HistoricoPagamento> => {
  const payload: Record<string, unknown> = {
    membro_id: historico.membro_id,
    valor: historico.valor,
    data_pagamento: historico.data_pagamento,
  };
  if (historico.inscricao_id) payload.inscricao_id = historico.inscricao_id;
  if (historico.tipo) payload.tipo = historico.tipo;
  const { data, error } = await supabase.from('historico_pagamentos').insert([payload]).select().single();
  if (error) throw error;
  return data as HistoricoPagamento;
};
