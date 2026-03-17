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
  const { data, error } = await supabase.from('planos').insert([plano]).select().single();
  if (error) throw error;
  return data as Plano;
};

export const updatePlano = async (id: string, plano: Partial<Plano>): Promise<Plano> => {
  const { data, error } = await supabase.from('planos').update(plano).eq('id', id).select().single();
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
  const { data, error } = await supabase.from('inscricoes').insert([inscricao]).select().single();
  if (error) throw error;
  return data as Inscricao;
};

export const updateInscricao = async (id: string, inscricao: Partial<Inscricao>): Promise<Inscricao> => {
  const { data, error } = await supabase.from('inscricoes').update(inscricao).eq('id', id).select().single();
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
  const { data, error } = await supabase.from('historico_pagamentos').insert([historico]).select().single();
  if (error) throw error;
  return data as HistoricoPagamento;
};
