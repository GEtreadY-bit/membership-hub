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

  const hoje = new Date();
  const proximo = new Date(inscricao.proximo_pagamento);
  
  const anoHoje = hoje.getFullYear();
  const mesHoje = hoje.getMonth();
  
  const anoProximo = proximo.getFullYear();
  const mesProximo = proximo.getMonth();
  
  // Lógica Mensal: O membro só fica "Em Atraso" se o mês civil atual for estritamente MAIOR que o mês do próximo pagamento (considerando o ano)
  // Ou seja: Se tiver que pagar em Março, tem todo o mês de Março. Se virarmos para o mês de Abril e não pagou o de Março (e a data limite continuou em março), aí sim estará em atraso.
  if (anoHoje > anoProximo || (anoHoje === anoProximo && mesHoje > mesProximo)) {
    return 'Em Atraso';
  }

  return inscricao.status;
}
