import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Inscricao, StatusPagamento } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRealStatus(inscricao: Inscricao): StatusPagamento {
  // Se está explicitamente em atraso no DB, preserva
  if (inscricao.status === 'Em Atraso') return 'Em Atraso';
  
  // Se ainda não pagou a inscrição
  if (!inscricao.taxa_inscricao_paga && inscricao.status === 'Pendente') return 'Pendente';

  const gracePeriodDays = parseInt(localStorage.getItem('nexus_grace_period_days') || '0', 10);
  const warningDays = parseInt(localStorage.getItem('nexus_warning_days') || '3', 10);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const proximo = new Date(inscricao.proximo_pagamento);
  proximo.setHours(0, 0, 0, 0);

  // Verifica se passou do limite da carência
  const limiteAtraso = new Date(proximo);
  limiteAtraso.setDate(limiteAtraso.getDate() + gracePeriodDays);
  
  if (hoje > limiteAtraso) {
    return 'Em Atraso';
  }

  // Verifica se está no período de aviso
  const limiteAviso = new Date(proximo);
  limiteAviso.setDate(limiteAviso.getDate() - warningDays);

  if (hoje >= limiteAviso && hoje <= proximo) {
    return 'A Vencer';
  }

  // Se já passou a data mas está dentro da tolerância, também mostramos 'A Vencer' em vez de logo atraso
  if (hoje > proximo && hoje <= limiteAtraso) {
     return 'A Vencer';
  }

  return inscricao.status;
}
