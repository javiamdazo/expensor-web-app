import Papa from 'papaparse';
import { createId } from './id';
import { parseFlexibleNumber } from './format';
import type { AppState, Case, HistoryEntry, HistorySection } from '../types';

const HEADERS = [
  'tipo',
  'caso_id',
  'caso_nombre',
  'seccion',
  'categoria',
  'concepto',
  'importe_mensual',
  'mes',
  'importe_real',
  'notas',
] as const;

type RowType = 'CASO' | 'INGRESO' | 'GASTO' | 'HISTORICO';

interface Row {
  tipo: RowType;
  caso_id: string;
  caso_nombre: string;
  seccion: string;
  categoria: string;
  concepto: string;
  importe_mensual: string;
  mes: string;
  importe_real: string;
  notas: string;
}

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toRow(partial: Partial<Row>): string {
  const full: Row = {
    tipo: partial.tipo ?? ('' as RowType),
    caso_id: partial.caso_id ?? '',
    caso_nombre: partial.caso_nombre ?? '',
    seccion: partial.seccion ?? '',
    categoria: partial.categoria ?? '',
    concepto: partial.concepto ?? '',
    importe_mensual: partial.importe_mensual ?? '',
    mes: partial.mes ?? '',
    importe_real: partial.importe_real ?? '',
    notas: partial.notas ?? '',
  };
  return HEADERS.map((h) => escapeCsvField(String(full[h]))).join(',');
}

/**
 * Serializes the whole app state (cases, budget items, history) into a single
 * flat CSV so it can act as a portable "database" without any server.
 */
export function exportStateToCsv(state: AppState): string {
  const lines: string[] = [HEADERS.join(',')];

  for (const c of state.cases) {
    lines.push(toRow({ tipo: 'CASO', caso_id: c.id, caso_nombre: c.name }));

    for (const inc of c.income) {
      lines.push(
        toRow({
          tipo: 'INGRESO',
          caso_id: c.id,
          seccion: 'ingreso',
          categoria: 'Ingresos',
          concepto: inc.name,
          importe_mensual: inc.monthlyAmount.toString(),
        }),
      );
    }

    for (const cat of c.categories) {
      for (const it of cat.items) {
        lines.push(
          toRow({
            tipo: 'GASTO',
            caso_id: c.id,
            seccion: 'gasto',
            categoria: cat.name,
            concepto: it.name,
            importe_mensual: it.monthlyAmount.toString(),
          }),
        );
      }
    }
  }

  for (const h of state.history) {
    for (const line of h.lines) {
      lines.push(
        toRow({
          tipo: 'HISTORICO',
          caso_id: h.caseId,
          seccion: line.section,
          categoria: line.category,
          concepto: line.concept,
          mes: h.month,
          importe_real: line.amount.toString(),
          notas: h.notes,
        }),
      );
    }
  }

  return lines.join('\n');
}

export function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface CsvParseResult {
  state: AppState;
  errors: string[];
}

/** Parses a CSV previously produced by exportStateToCsv back into full app state. */
export function parseCsvToState(csvText: string): CsvParseResult {
  const errors: string[] = [];
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  if (parsed.errors.length > 0) {
    for (const e of parsed.errors) errors.push(`Fila ${e.row}: ${e.message}`);
  }

  const casesById = new Map<string, Case>();
  const caseOrder: string[] = [];
  const historyByKey = new Map<string, HistoryEntry>();
  const historyOrder: string[] = [];

  function ensureCase(id: string, name?: string): Case {
    let c = casesById.get(id);
    if (!c) {
      c = { id, name: name ?? id, createdAt: new Date().toISOString(), income: [], categories: [] };
      casesById.set(id, c);
      caseOrder.push(id);
    } else if (name) {
      c.name = name;
    }
    return c;
  }

  for (const row of parsed.data) {
    const tipo = (row.tipo ?? '').trim().toUpperCase();
    const casoId = (row.caso_id ?? '').trim();
    if (!tipo || !casoId) continue;

    if (tipo === 'CASO') {
      ensureCase(casoId, (row.caso_nombre ?? '').trim() || casoId);
    } else if (tipo === 'INGRESO') {
      const c = ensureCase(casoId);
      c.income.push({
        id: createId(),
        name: (row.concepto ?? '').trim() || 'Ingreso',
        monthlyAmount: parseFlexibleNumber(row.importe_mensual),
      });
    } else if (tipo === 'GASTO') {
      const c = ensureCase(casoId);
      const catName = (row.categoria ?? '').trim() || 'Sin categoría';
      let cat = c.categories.find((cc) => cc.name === catName);
      if (!cat) {
        cat = { id: createId(), name: catName, items: [] };
        c.categories.push(cat);
      }
      cat.items.push({
        id: createId(),
        name: (row.concepto ?? '').trim() || 'Gasto',
        monthlyAmount: parseFlexibleNumber(row.importe_mensual),
      });
    } else if (tipo === 'HISTORICO') {
      const month = (row.mes ?? '').trim();
      if (!month) {
        errors.push(`Fila histórica sin mes para caso ${casoId}, se omite.`);
        continue;
      }
      ensureCase(casoId);
      const key = `${casoId}__${month}`;
      let entry = historyByKey.get(key);
      if (!entry) {
        entry = { id: createId(), caseId: casoId, month, lines: [], notes: '' };
        historyByKey.set(key, entry);
        historyOrder.push(key);
      }
      const section: HistorySection = (row.seccion ?? '').trim() === 'ingreso' ? 'ingreso' : 'gasto';
      entry.lines.push({
        section,
        category: (row.categoria ?? '').trim() || 'Sin categoría',
        concept: (row.concepto ?? '').trim() || 'Concepto',
        amount: parseFlexibleNumber(row.importe_real),
      });
      if (!entry.notes && row.notas) entry.notes = row.notas.trim();
    } else {
      errors.push(`Tipo de fila desconocido: "${row.tipo}"`);
    }
  }

  const cases = caseOrder.map((id) => casesById.get(id)!);
  const history = historyOrder.map((k) => historyByKey.get(k)!);

  if (cases.length === 0) {
    errors.push('No se encontró ningún caso válido en el CSV.');
  }

  return {
    state: {
      cases,
      activeCaseId: cases[0]?.id ?? null,
      history,
    },
    errors,
  };
}
