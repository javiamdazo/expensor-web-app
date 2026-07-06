import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createId } from '../lib/id';
import { createSeedCases } from '../lib/seed';
import type { AppState, Case, HistoryEntry, HistoryLine } from '../types';

interface AppActions {
  addCase: (name: string, duplicateFromId?: string) => string;
  renameCase: (caseId: string, name: string) => void;
  deleteCase: (caseId: string) => void;
  setActiveCase: (caseId: string) => void;

  addIncomeItem: (caseId: string, name: string, monthlyAmount: number) => void;
  updateIncomeItem: (
    caseId: string,
    itemId: string,
    patch: Partial<{ name: string; monthlyAmount: number }>,
  ) => void;
  deleteIncomeItem: (caseId: string, itemId: string) => void;

  addCategory: (caseId: string, name: string) => void;
  renameCategory: (caseId: string, categoryId: string, name: string) => void;
  deleteCategory: (caseId: string, categoryId: string) => void;

  addExpenseItem: (
    caseId: string,
    categoryId: string,
    name: string,
    monthlyAmount: number,
  ) => void;
  updateExpenseItem: (
    caseId: string,
    categoryId: string,
    itemId: string,
    patch: Partial<{ name: string; monthlyAmount: number }>,
  ) => void;
  deleteExpenseItem: (caseId: string, categoryId: string, itemId: string) => void;

  addHistoryEntry: (caseId: string, month: string) => string;
  updateHistoryLine: (
    entryId: string,
    index: number,
    patch: Partial<HistoryLine>,
  ) => void;
  updateHistoryNotes: (entryId: string, notes: string) => void;
  deleteHistoryEntry: (entryId: string) => void;

  replaceState: (state: AppState) => void;
  resetToSeed: () => void;
}

export type AppStore = AppState & AppActions;

function buildHistoryLines(c: Case): HistoryLine[] {
  const lines: HistoryLine[] = [];
  for (const inc of c.income) {
    lines.push({
      section: 'ingreso',
      category: 'Ingresos',
      concept: inc.name,
      amount: inc.monthlyAmount,
    });
  }
  for (const cat of c.categories) {
    for (const it of cat.items) {
      lines.push({
        section: 'gasto',
        category: cat.name,
        concept: it.name,
        amount: it.monthlyAmount,
      });
    }
  }
  return lines;
}

function cloneCase(source: Case, name: string): Case {
  return {
    id: createId(),
    name,
    createdAt: new Date().toISOString(),
    income: source.income.map((i) => ({ ...i, id: createId() })),
    categories: source.categories.map((cat) => ({
      id: createId(),
      name: cat.name,
      items: cat.items.map((it) => ({ ...it, id: createId() })),
    })),
  };
}

function emptyCase(name: string): Case {
  return {
    id: createId(),
    name,
    createdAt: new Date().toISOString(),
    income: [],
    categories: [],
  };
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      cases: [],
      activeCaseId: null,
      history: [],

      addCase: (name, duplicateFromId) => {
        const source = duplicateFromId
          ? get().cases.find((c) => c.id === duplicateFromId)
          : undefined;
        const newCase = source ? cloneCase(source, name) : emptyCase(name);
        set((s) => ({ cases: [...s.cases, newCase], activeCaseId: newCase.id }));
        return newCase.id;
      },

      renameCase: (caseId, name) =>
        set((s) => ({
          cases: s.cases.map((c) => (c.id === caseId ? { ...c, name } : c)),
        })),

      deleteCase: (caseId) =>
        set((s) => {
          const cases = s.cases.filter((c) => c.id !== caseId);
          const history = s.history.filter((h) => h.caseId !== caseId);
          const activeCaseId =
            s.activeCaseId === caseId ? (cases[0]?.id ?? null) : s.activeCaseId;
          return { cases, history, activeCaseId };
        }),

      setActiveCase: (caseId) => set({ activeCaseId: caseId }),

      addIncomeItem: (caseId, name, monthlyAmount) =>
        set((s) => ({
          cases: s.cases.map((c) =>
            c.id === caseId
              ? {
                  ...c,
                  income: [...c.income, { id: createId(), name, monthlyAmount }],
                }
              : c,
          ),
        })),

      updateIncomeItem: (caseId, itemId, patch) =>
        set((s) => ({
          cases: s.cases.map((c) =>
            c.id === caseId
              ? {
                  ...c,
                  income: c.income.map((i) =>
                    i.id === itemId ? { ...i, ...patch } : i,
                  ),
                }
              : c,
          ),
        })),

      deleteIncomeItem: (caseId, itemId) =>
        set((s) => ({
          cases: s.cases.map((c) =>
            c.id === caseId
              ? { ...c, income: c.income.filter((i) => i.id !== itemId) }
              : c,
          ),
        })),

      addCategory: (caseId, name) =>
        set((s) => ({
          cases: s.cases.map((c) =>
            c.id === caseId
              ? {
                  ...c,
                  categories: [
                    ...c.categories,
                    { id: createId(), name, items: [] },
                  ],
                }
              : c,
          ),
        })),

      renameCategory: (caseId, categoryId, name) =>
        set((s) => ({
          cases: s.cases.map((c) =>
            c.id === caseId
              ? {
                  ...c,
                  categories: c.categories.map((cat) =>
                    cat.id === categoryId ? { ...cat, name } : cat,
                  ),
                }
              : c,
          ),
        })),

      deleteCategory: (caseId, categoryId) =>
        set((s) => ({
          cases: s.cases.map((c) =>
            c.id === caseId
              ? {
                  ...c,
                  categories: c.categories.filter((cat) => cat.id !== categoryId),
                }
              : c,
          ),
        })),

      addExpenseItem: (caseId, categoryId, name, monthlyAmount) =>
        set((s) => ({
          cases: s.cases.map((c) =>
            c.id === caseId
              ? {
                  ...c,
                  categories: c.categories.map((cat) =>
                    cat.id === categoryId
                      ? {
                          ...cat,
                          items: [
                            ...cat.items,
                            { id: createId(), name, monthlyAmount },
                          ],
                        }
                      : cat,
                  ),
                }
              : c,
          ),
        })),

      updateExpenseItem: (caseId, categoryId, itemId, patch) =>
        set((s) => ({
          cases: s.cases.map((c) =>
            c.id === caseId
              ? {
                  ...c,
                  categories: c.categories.map((cat) =>
                    cat.id === categoryId
                      ? {
                          ...cat,
                          items: cat.items.map((it) =>
                            it.id === itemId ? { ...it, ...patch } : it,
                          ),
                        }
                      : cat,
                  ),
                }
              : c,
          ),
        })),

      deleteExpenseItem: (caseId, categoryId, itemId) =>
        set((s) => ({
          cases: s.cases.map((c) =>
            c.id === caseId
              ? {
                  ...c,
                  categories: c.categories.map((cat) =>
                    cat.id === categoryId
                      ? { ...cat, items: cat.items.filter((it) => it.id !== itemId) }
                      : cat,
                  ),
                }
              : c,
          ),
        })),

      addHistoryEntry: (caseId, month) => {
        const c = get().cases.find((cc) => cc.id === caseId);
        const entry: HistoryEntry = {
          id: createId(),
          caseId,
          month,
          lines: c ? buildHistoryLines(c) : [],
          notes: '',
        };
        set((s) => ({ history: [...s.history, entry] }));
        return entry.id;
      },

      updateHistoryLine: (entryId, index, patch) =>
        set((s) => ({
          history: s.history.map((h) =>
            h.id === entryId
              ? {
                  ...h,
                  lines: h.lines.map((line, i) =>
                    i === index ? { ...line, ...patch } : line,
                  ),
                }
              : h,
          ),
        })),

      updateHistoryNotes: (entryId, notes) =>
        set((s) => ({
          history: s.history.map((h) => (h.id === entryId ? { ...h, notes } : h)),
        })),

      deleteHistoryEntry: (entryId) =>
        set((s) => ({ history: s.history.filter((h) => h.id !== entryId) })),

      replaceState: (state) =>
        set({
          cases: state.cases,
          activeCaseId: state.activeCaseId,
          history: state.history,
        }),

      resetToSeed: () => {
        const cases = createSeedCases();
        set({ cases, activeCaseId: cases[0]?.id ?? null, history: [] });
      },
    }),
    {
      name: 'expensor-state',
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state && state.cases.length === 0) {
          state.resetToSeed();
        }
      },
    },
  ),
);

/** Derived income+expense category totals for a case, memo-free (cheap to recompute). */
export function caseTotals(c: Case) {
  const monthlyIncome = c.income.reduce((sum, i) => sum + i.monthlyAmount, 0);
  const categoryTotals = c.categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    monthly: cat.items.reduce((sum, it) => sum + it.monthlyAmount, 0),
  }));
  const monthlyExpense = categoryTotals.reduce((sum, cat) => sum + cat.monthly, 0);
  return {
    monthlyIncome,
    annualIncome: monthlyIncome * 12,
    monthlyExpense,
    annualExpense: monthlyExpense * 12,
    monthlySavings: monthlyIncome - monthlyExpense,
    annualSavings: (monthlyIncome - monthlyExpense) * 12,
    categoryTotals,
  };
}
