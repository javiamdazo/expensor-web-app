import { createId } from './id';
import type { Case, Category, ExpenseItem, IncomeItem } from '../types';

function item(name: string, monthlyAmount: number): ExpenseItem {
  return { id: createId(), name, monthlyAmount };
}

function income(name: string, monthlyAmount: number): IncomeItem {
  return { id: createId(), name, monthlyAmount };
}

function sharedCategories(): Category[] {
  return [
    {
      id: createId(),
      name: 'Vehículos',
      items: [
        item('Permiso circulación coche', 4.2),
        item('Seguro coche', 24.48),
        item('Gasolina', 50),
      ],
    },
    {
      id: createId(),
      name: 'Día a día',
      items: [
        item('Comida', 200),
        item('Restaurante', 100),
        item('Bar / Merienda', 50),
      ],
    },
    {
      id: createId(),
      name: 'Otros',
      items: [item('Gimnasio', 40), item('Peluquería', 15), item('Otros', 150)],
    },
    {
      id: createId(),
      name: 'Suscripciones',
      items: [
        item('Spotify', 3),
        item('Apple almacenamiento', 2.99),
        item('YouTube', 10.99),
      ],
    },
    {
      id: createId(),
      name: 'Casa',
      items: [
        item('Hipoteca', 428),
        item('Comunidad', 42),
        item('Tasa residuos', 12.5),
        item('IBI', 27),
        item('Basuras', 6.5),
      ],
    },
    {
      id: createId(),
      name: 'Galicia',
      items: [
        item('Alquiler', 950),
        item('Viajes', 0),
        item('Agua', 15),
        item('Luz', 60),
        item('Internet', 0),
      ],
    },
  ];
}

export function createSeedCases(): Case[] {
  const now = new Date().toISOString();
  const ahora: Case = {
    id: createId(),
    name: 'Ahora',
    createdAt: now,
    income: [income('Nómina', 1292.34)],
    categories: sharedCategories(),
  };
  const conHipoteca: Case = {
    id: createId(),
    name: 'Con hipoteca',
    createdAt: now,
    income: [
      income('Nómina', 1208.34),
      income('Variable', 833.33),
      income('Alquiler recibido', 850),
      income('Pagas extra (prorrateadas)', 616.67),
    ],
    categories: sharedCategories(),
  };
  return [ahora, conHipoteca];
}
