export interface ExpenseItem {
  id: string;
  name: string;
  monthlyAmount: number;
}

export interface Category {
  id: string;
  name: string;
  items: ExpenseItem[];
}

export interface IncomeItem {
  id: string;
  name: string;
  monthlyAmount: number;
}

export interface Case {
  id: string;
  name: string;
  createdAt: string;
  income: IncomeItem[];
  categories: Category[];
}

export type HistorySection = 'ingreso' | 'gasto';

export interface HistoryLine {
  section: HistorySection;
  category: string;
  concept: string;
  amount: number;
}

export interface HistoryEntry {
  id: string;
  caseId: string;
  month: string; // YYYY-MM
  lines: HistoryLine[];
  notes: string;
}

export interface AppState {
  cases: Case[];
  activeCaseId: string | null;
  history: HistoryEntry[];
}
