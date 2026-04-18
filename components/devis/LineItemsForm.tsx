'use client';

import { v4 as uuidv4 } from 'uuid';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { lineTotal, quoteTotals, formatEur } from '@/lib/calculations';
import type { LineItem, TauxTVA } from '@/lib/types';

interface Props {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
}

const TVA_RATES: TauxTVA[] = [0, 5.5, 10, 20];

export function LineItemsForm({ items, onChange }: Props) {
  function addItem() {
    onChange([
      ...items,
      {
        id: uuidv4(),
        description: '',
        quantite: 1,
        prix_unitaire_ht: 0,
        taux_tva: 20,
      },
    ]);
  }

  function removeItem(id: string) {
    onChange(items.filter((i) => i.id !== id));
  }

  function updateItem(id: string, patch: Partial<LineItem>) {
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  const totals = quoteTotals(items);

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <p className="text-sm text-[#78716c] text-center py-6">
          Aucune ligne. Cliquez sur &ldquo;Ajouter une ligne&rdquo; pour commencer.
        </p>
      )}

      {items.map((item, idx) => {
        const { ht } = lineTotal(item);
        return (
          <div key={item.id} className="border border-[#e7e5e4] rounded-md p-4 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#78716c] uppercase tracking-wide">
                Ligne {idx + 1}
              </span>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="text-xs text-[#78716c] hover:text-[#1c1917] underline"
              >
                Supprimer
              </button>
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                placeholder="Pose de robinetterie — 2h de main d'oeuvre"
                value={item.description}
                onChange={(e) => updateItem(item.id, { description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Qté</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={item.quantite}
                  onChange={(e) =>
                    updateItem(item.id, { quantite: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Prix unitaire HT (€)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.prix_unitaire_ht}
                  onChange={(e) =>
                    updateItem(item.id, { prix_unitaire_ht: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>TVA</Label>
                <Select
                  value={String(item.taux_tva)}
                  onValueChange={(v) =>
                    v !== null && updateItem(item.id, { taux_tva: parseFloat(v) as TauxTVA })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TVA_RATES.map((r) => (
                      <SelectItem key={r} value={String(r)}>
                        {r}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="text-xs text-right text-[#78716c]">
              Total HT : <span className="font-medium text-[#1c1917]">{formatEur(ht)}</span>
            </p>
          </div>
        );
      })}

      <Button type="button" variant="outline" onClick={addItem} className="w-full">
        + Ajouter une ligne
      </Button>

      {items.length > 0 && (
        <>
          <Separator />
          <div className="space-y-1 text-sm text-right">
            <div className="flex justify-between text-[#78716c]">
              <span>Total HT</span>
              <span className="font-medium text-[#1c1917]">{formatEur(totals.total_ht)}</span>
            </div>
            {Object.entries(totals.tva_by_rate).map(([rate, amount]) =>
              amount > 0 ? (
                <div key={rate} className="flex justify-between text-[#78716c]">
                  <span>TVA {rate}%</span>
                  <span>{formatEur(amount)}</span>
                </div>
              ) : null
            )}
            <Separator className="my-1" />
            <div className="flex justify-between text-base font-semibold text-[#1c1917]">
              <span>Total TTC</span>
              <span>{formatEur(totals.total_ttc)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
