import type { LineItem } from './types';

export function lineTotal(item: LineItem): { ht: number; tva: number; ttc: number } {
  const ht = item.quantite * item.prix_unitaire_ht;
  const tva = ht * (item.taux_tva / 100);
  return { ht, tva, ttc: ht + tva };
}

export function quoteTotals(items: LineItem[]): {
  total_ht: number;
  total_tva: number;
  total_ttc: number;
  tva_by_rate: Record<number, number>;
} {
  let total_ht = 0;
  let total_tva = 0;
  const tva_by_rate: Record<number, number> = {};

  for (const item of items) {
    const { ht, tva } = lineTotal(item);
    total_ht += ht;
    total_tva += tva;
    tva_by_rate[item.taux_tva] = (tva_by_rate[item.taux_tva] ?? 0) + tva;
  }

  return { total_ht, total_tva, total_ttc: total_ht + total_tva, tva_by_rate };
}

export function formatEur(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(amount);
}
