const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) return currencyFormatter.format(0);
  return currencyFormatter.format(amount);
}

export function formatMonthLabel(month: string): string {
  const [year, monthNum] = month.split('-').map(Number);
  if (!year || !monthNum) return month;
  const date = new Date(year, monthNum - 1, 1);
  const label = new Intl.DateTimeFormat('es-ES', {
    month: 'long',
    year: 'numeric',
  }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/** Parses numbers that may come from Excel/Sheets in Spanish format ("1.234,56 €")
 * or plain format ("1234.56"), stripping currency symbols and spaces. */
export function parseFlexibleNumber(raw: string | number | null | undefined): number {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0;
  if (!raw) return 0;
  let s = String(raw).trim().replace(/[€\s]/g, '');
  if (!s) return 0;
  const hasComma = s.includes(',');
  const hasDot = s.includes('.');
  if (hasComma && hasDot) {
    // Assume dot = thousands separator, comma = decimal separator (es-ES)
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (hasComma) {
    s = s.replace(',', '.');
  }
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}
