import * as XLSX from 'xlsx';
import { HistoricoPagamento, Membro, Inscricao, Plano } from '@/types';
import { getRealStatus } from '@/lib/utils';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Sanitizes a value for export to CSV/XLSX to prevent Formula Injection (CSV Injection).
 * If a string starts with =, +, -, @, \t, or \r, it prepends a single quote.
 */
export function sanitizeForExport(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  if (value.length === 0) return value;

  const triggerChars = ['=', '+', '-', '@', '\t', '\r'];
  if (triggerChars.some(char => value.startsWith(char))) {
    return `'${value}`;
  }

  return value;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function toCSVString(rows: unknown[][]): string {
  return rows
    .map(row =>
      row.map(cell => {
        const sanitized = sanitizeForExport(cell);
        const str = String(sanitized ?? '');
        // Wrap in quotes if contains comma, quote, or newline
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    )
    .join('\n');
}

// ─────────────────────────────────────────────
// HISTORICO — CSV
// ─────────────────────────────────────────────

export function exportHistoricoCSV(
  historico: HistoricoPagamento[],
  membros: Membro[]
) {
  const header = ['ID', 'Membro', 'Tipo', 'Valor (Kz)', 'Data Pagamento'];

  const rows = historico.map(h => {
    const membro = membros.find(m => m.id === h.membro_id);
    return [
      h.id,
      membro?.nome ?? 'Membro Removido',
      h.tipo ?? 'Mensalidade',
      String(h.valor),
      formatDate(h.data_pagamento),
    ];
  });

  const csv = toCSVString([header, ...rows]);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const date = new Date().toISOString().split('T')[0];
  downloadBlob(blob, `historico_pagamentos_${date}.csv`);
}

// ─────────────────────────────────────────────
// HISTORICO — EXCEL (XLSX)
// ─────────────────────────────────────────────

export function exportHistoricoXLSX(
  historico: HistoricoPagamento[],
  membros: Membro[]
) {
  const header = ['ID', 'Membro', 'Tipo', 'Valor (Kz)', 'Data Pagamento'].map(sanitizeForExport);

  const rows = historico.map(h => {
    const membro = membros.find(m => m.id === h.membro_id);
    return [
      h.id,
      membro?.nome ?? 'Membro Removido',
      h.tipo ?? 'Mensalidade',
      h.valor,
      formatDate(h.data_pagamento),
    ].map(sanitizeForExport);
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);

  // Column widths
  ws['!cols'] = [
    { wch: 38 }, // ID
    { wch: 28 }, // Membro
    { wch: 20 }, // Tipo
    { wch: 14 }, // Valor
    { wch: 16 }, // Data
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Histórico');

  const date = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `historico_pagamentos_${date}.xlsx`);
}

// ─────────────────────────────────────────────
// MEMBROS — CSV
// ─────────────────────────────────────────────

export function exportMembrosCSV(
  membros: Membro[],
  inscricoes: Inscricao[],
  planos: Plano[]
) {
  const header = ['ID', 'Nome', 'Email', 'Telefone', 'Plano', 'Status', 'Próximo Pagamento', 'Data Registo'];

  const rows = membros.map(m => {
    const inscricao = inscricoes.find(i => i.membro_id === m.id);
    const plano = inscricao ? planos.find(p => p.id === inscricao.plano_id) : null;
    const status = inscricao ? getRealStatus(inscricao) : 'Sem plano';
    const proximoPagamento = inscricao ? formatDate(inscricao.proximo_pagamento) : '';

    return [
      m.id,
      m.nome,
      m.email ?? '',
      m.telefone ?? '',
      plano?.nome ?? 'Sem plano',
      status,
      proximoPagamento,
      formatDate(m.created_at),
    ];
  });

  const csv = toCSVString([header, ...rows]);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const date = new Date().toISOString().split('T')[0];
  downloadBlob(blob, `membros_${date}.csv`);
}

// ─────────────────────────────────────────────
// MEMBROS — EXCEL (XLSX)
// ─────────────────────────────────────────────

export function exportMembrosXLSX(
  membros: Membro[],
  inscricoes: Inscricao[],
  planos: Plano[]
) {
  const header = ['ID', 'Nome', 'Email', 'Telefone', 'Plano', 'Status', 'Próximo Pagamento', 'Data Registo'].map(sanitizeForExport);

  const rows = membros.map(m => {
    const inscricao = inscricoes.find(i => i.membro_id === m.id);
    const plano = inscricao ? planos.find(p => p.id === inscricao.plano_id) : null;
    const status = inscricao ? getRealStatus(inscricao) : 'Sem plano';
    const proximoPagamento = inscricao ? formatDate(inscricao.proximo_pagamento) : '';

    return [
      m.id,
      m.nome,
      m.email ?? '',
      m.telefone ?? '',
      plano?.nome ?? 'Sem plano',
      status,
      proximoPagamento,
      formatDate(m.created_at),
    ].map(sanitizeForExport);
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);

  // Column widths
  ws['!cols'] = [
    { wch: 38 }, // ID
    { wch: 28 }, // Nome
    { wch: 30 }, // Email
    { wch: 18 }, // Telefone
    { wch: 20 }, // Plano
    { wch: 14 }, // Status
    { wch: 18 }, // Próximo Pagamento
    { wch: 16 }, // Data Registo
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Membros');

  const date = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `membros_${date}.xlsx`);
}
