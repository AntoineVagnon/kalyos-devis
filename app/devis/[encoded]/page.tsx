'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { decodeQuoteFromUrl, isQuoteExpired } from '@/lib/share';
import { formatEur, lineTotal, quoteTotals } from '@/lib/calculations';
import { getLegalMentions, KALYOS_FOOTER } from '@/lib/legal-mentions';
import { getQuoteById, saveQuote } from '@/lib/storage';
import type { Quote } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export default function ShareViewPage() {
  const params = useParams();
  const encoded = params.encoded as string;
  const [quote, setQuote] = useState<Quote | null>(null);
  const [expired, setExpired] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (!encoded) return;
    let q = decodeQuoteFromUrl(encoded);

    // Fallback: try localStorage by id
    if (!q && encoded.length < 36) {
      q = getQuoteById(encoded);
    }

    if (!q) {
      setNotFound(true);
      return;
    }

    if (isQuoteExpired(q)) {
      setExpired(true);
      return;
    }

    if (q.accepted_at) {
      setAccepted(true);
    }

    setQuote(q);
  }, [encoded]);

  function handleAccept() {
    if (!quote) return;
    const updated: Quote = { ...quote, status: 'accepted', accepted_at: new Date().toISOString() };
    saveQuote(updated);
    setQuote(updated);
    setAccepted(true);
  }

  if (notFound) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <h1 className="text-2xl font-bold text-[#1c1917]">Devis introuvable</h1>
          <p className="text-[#78716c]">
            Ce lien de devis est invalide ou a été supprimé.
          </p>
        </div>
      </main>
    );
  }

  if (expired) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <h1 className="text-2xl font-bold text-[#1c1917]">Ce devis a expiré</h1>
          <p className="text-[#78716c]">
            Ce devis n&apos;est plus valide. Contactez votre prestataire pour en obtenir un nouveau.
          </p>
        </div>
      </main>
    );
  }

  if (!quote) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-[#78716c]">Chargement...</p>
      </main>
    );
  }

  const totals = quoteTotals(quote.line_items);
  const legal = getLegalMentions(quote.artisan_profile);

  return (
    <main className="min-h-screen bg-[#fafaf9] py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white border border-[#e7e5e4] rounded-lg p-8 space-y-6">
          {/* Artisan + Quote number */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              {quote.artisan_profile.logo_base64 && (
                <img
                  src={quote.artisan_profile.logo_base64}
                  alt="Logo"
                  className="h-12 w-auto object-contain mb-3"
                />
              )}
              <p className="font-bold text-lg text-[#1c1917]">{quote.artisan_profile.nom_societe}</p>
              <p className="text-sm text-[#78716c]">SIRET : {quote.artisan_profile.siret}</p>
              <p className="text-sm text-[#78716c]">{quote.artisan_profile.adresse}</p>
              {quote.artisan_profile.telephone && (
                <p className="text-sm text-[#78716c]">{quote.artisan_profile.telephone}</p>
              )}
              {quote.artisan_profile.email && (
                <p className="text-sm text-[#78716c]">{quote.artisan_profile.email}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-[#1c1917]">DEVIS</p>
              <p className="text-sm text-[#78716c]">{quote.numero}</p>
              <p className="text-sm text-[#78716c]">
                {new Date(quote.date_creation).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          <Separator />

          {/* Client */}
          <div>
            <p className="text-xs uppercase tracking-widest text-[#78716c] mb-2">Adressé à</p>
            <p className="font-semibold text-[#1c1917]">{quote.client_info.nom}</p>
            <p className="text-sm text-[#78716c]">{quote.client_info.adresse}</p>
            {quote.client_info.email && (
              <p className="text-sm text-[#78716c]">{quote.client_info.email}</p>
            )}
          </div>

          <Separator />

          {/* Line items */}
          <div>
            <div className="grid grid-cols-12 text-xs font-semibold text-[#78716c] uppercase tracking-wide pb-2 border-b border-[#e7e5e4]">
              <span className="col-span-5">Description</span>
              <span className="col-span-2 text-right">Qté</span>
              <span className="col-span-2 text-right">PU HT</span>
              <span className="col-span-1 text-right">TVA</span>
              <span className="col-span-2 text-right">Total HT</span>
            </div>
            {quote.line_items.map((item) => {
              const { ht } = lineTotal(item);
              return (
                <div
                  key={item.id}
                  className="grid grid-cols-12 text-sm py-2 border-b border-[#e7e5e4] last:border-0"
                >
                  <span className="col-span-5 text-[#1c1917]">{item.description}</span>
                  <span className="col-span-2 text-right text-[#78716c]">{item.quantite}</span>
                  <span className="col-span-2 text-right text-[#78716c]">
                    {formatEur(item.prix_unitaire_ht)}
                  </span>
                  <span className="col-span-1 text-right text-[#78716c]">{item.taux_tva}%</span>
                  <span className="col-span-2 text-right font-medium text-[#1c1917]">
                    {formatEur(ht)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Totals */}
          <div className="space-y-1 text-sm max-w-xs ml-auto">
            <div className="flex justify-between text-[#78716c]">
              <span>Total HT</span>
              <span>{formatEur(totals.total_ht)}</span>
            </div>
            {Object.entries(totals.tva_by_rate).map(([rate, amount]) =>
              amount > 0 ? (
                <div key={rate} className="flex justify-between text-[#78716c]">
                  <span>TVA {rate}%</span>
                  <span>{formatEur(amount)}</span>
                </div>
              ) : null
            )}
            <Separator />
            <div className="flex justify-between text-base font-bold text-[#1c1917]">
              <span>Total TTC</span>
              <span>{formatEur(totals.total_ttc)}</span>
            </div>
          </div>

          <Separator />

          {/* Legal */}
          <p className="text-xs text-[#78716c]">{legal}</p>

          {/* Kalyos footer */}
          <p className="text-xs text-center text-[#a8a29e]">{KALYOS_FOOTER}</p>
        </div>

        {/* Accept button */}
        {accepted ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center space-y-2">
            <p className="font-semibold text-green-800">Devis accepté</p>
            <p className="text-sm text-green-700">
              Accepté le{' '}
              {quote.accepted_at
                ? new Date(quote.accepted_at).toLocaleString('fr-FR')
                : 'maintenant'}
            </p>
          </div>
        ) : (
          <Button
            onClick={handleAccept}
            className="w-full py-6 text-base font-semibold bg-[#1c1917] hover:bg-[#292524] text-white"
          >
            Accepter ce devis
          </Button>
        )}
      </div>
    </main>
  );
}
