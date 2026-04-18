'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { UpgradeBanner } from '@/components/devis/UpgradeBanner';
import { ArtisanForm } from '@/components/devis/ArtisanForm';
import { ClientForm } from '@/components/devis/ClientForm';
import { LineItemsForm } from '@/components/devis/LineItemsForm';
import {
  getProfile,
  saveProfile,
  getCounter,
  incrementCounter,
  generateQuoteNumber,
  getExpiresAt,
  saveQuote,
  MAX_FREE_QUOTES,
} from '@/lib/storage';
import { quoteTotals } from '@/lib/calculations';
import { buildShareUrl } from '@/lib/share';
import { generateQuotePDF } from '@/lib/pdf';
import type { ArtisanProfile, ClientInfo, LineItem, Quote } from '@/lib/types';

const DEFAULT_ARTISAN: ArtisanProfile = {
  nom_societe: '',
  siret: '',
  adresse: '',
  telephone: '',
  email: '',
  statut_juridique: 'EI',
  logo_base64: null,
};

const DEFAULT_CLIENT: ClientInfo = { nom: '', adresse: '', email: '' };

type Tab = 'artisan' | 'client' | 'lignes';

export default function HomePage() {
  const [counter, setCounter] = useState(0);
  const [artisan, setArtisan] = useState<ArtisanProfile>(DEFAULT_ARTISAN);
  const [client, setClient] = useState<ClientInfo>(DEFAULT_CLIENT);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('artisan');
  const [generating, setGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const profile = getProfile();
    if (profile) setArtisan(profile);
    setCounter(getCounter());
  }, []);

  const limitReached = counter >= MAX_FREE_QUOTES;

  function handleArtisanChange(profile: ArtisanProfile) {
    setArtisan(profile);
    saveProfile(profile);
  }

  function validate(): string | null {
    if (!artisan.nom_societe.trim()) return 'Veuillez renseigner le nom de votre société.';
    const siretClean = artisan.siret.replace(/\s/g, '');
    if (!siretClean) return 'Veuillez renseigner votre SIRET.';
    if (!/^\d{14}$/.test(siretClean)) return 'SIRET invalide — 14 chiffres requis.';
    if (!artisan.adresse.trim()) return "Veuillez renseigner l'adresse de votre société.";
    if (!client.nom.trim()) return 'Veuillez renseigner le nom du client.';
    if (!client.adresse.trim()) return "Veuillez renseigner l'adresse du client.";
    if (lineItems.length === 0) return 'Ajoutez au moins une ligne de prestation.';
    if (lineItems.some((i) => i.quantite <= 0)) return 'Les quantités doivent être supérieures à 0.';
    return null;
  }

  async function handleGenerate() {
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setGenerating(true);
    try {
      const totals = quoteTotals(lineItems);
      const quote: Quote = {
        id: uuidv4(),
        numero: generateQuoteNumber(),
        date_creation: new Date().toISOString(),
        artisan_profile: artisan,
        client_info: client,
        line_items: lineItems,
        total_ht: totals.total_ht,
        total_tva: totals.total_tva,
        total_ttc: totals.total_ttc,
        status: 'draft',
        accepted_at: null,
        expires_at: getExpiresAt(),
      };

      await generateQuotePDF(quote);
      saveQuote(quote);
      const newCount = incrementCounter();
      setCounter(newCount);

      const url = buildShareUrl(quote);
      setShareUrl(url);
    } catch (err) {
      setError('Erreur lors de la génération du PDF. Veuillez réessayer.');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopyLink() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'artisan', label: 'Votre société' },
    { id: 'client', label: 'Client' },
    { id: 'lignes', label: 'Prestations' },
  ];

  if (limitReached) {
    return (
      <>
        <UpgradeBanner count={counter} />
        <main className="min-h-screen flex items-center justify-center pt-12 px-4">
          <div className="max-w-md text-center space-y-6">
            <p className="text-xs font-medium tracking-widest uppercase text-[#78716c]">
              Limite atteinte
            </p>
            <h1 className="text-3xl font-bold text-[#1c1917] leading-tight">
              Vous avez généré vos 5 devis gratuits.
            </h1>
            <p className="text-[#78716c]">
              Passez à la version complète pour des devis illimités, le suivi client, les relances
              automatiques et bien plus.
            </p>
            <a
              href="https://kalyos.co/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-[#1c1917] text-[#fafaf9] font-semibold py-4 px-6 rounded hover:bg-[#292524] transition-colors text-center"
            >
              Passer à la version complète — 7 500 EUR HT / 14 jours
            </a>
            <p className="text-xs text-[#78716c]">
              Un expert Kalyos vous contacte sous 24h pour démarrer votre projet.
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <UpgradeBanner count={counter} />
      <main className="pt-16 pb-16 px-4 max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="pt-8 space-y-2">
          <p className="text-xs font-medium tracking-widest uppercase text-[#78716c]">
            Kalyos Mini-App
          </p>
          <h1 className="text-3xl font-bold text-[#1c1917]">Générer un devis PDF</h1>
          <p className="text-[#78716c]">
            Remplissez le formulaire ci-dessous. Le PDF est généré directement dans votre navigateur
            — aucune donnée n&apos;est envoyée à nos serveurs.
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-[#e7e5e4]">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === t.id
                  ? 'border-[#1c1917] text-[#1c1917]'
                  : 'border-transparent text-[#78716c] hover:text-[#1c1917]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <Card className="bg-white border-[#e7e5e4]">
          <CardContent className="pt-6">
            {activeTab === 'artisan' && (
              <ArtisanForm value={artisan} onChange={handleArtisanChange} />
            )}
            {activeTab === 'client' && <ClientForm value={client} onChange={setClient} />}
            {activeTab === 'lignes' && (
              <LineItemsForm items={lineItems} onChange={setLineItems} />
            )}
          </CardContent>
        </Card>

        {/* Navigation hints */}
        <div className="flex justify-between text-sm text-[#78716c]">
          {activeTab !== 'artisan' ? (
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'lignes' ? 'client' : 'artisan')}
              className="underline hover:text-[#1c1917]"
            >
              &larr; Étape précédente
            </button>
          ) : (
            <span />
          )}
          {activeTab !== 'lignes' ? (
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'artisan' ? 'client' : 'lignes')}
              className="underline hover:text-[#1c1917]"
            >
              Étape suivante &rarr;
            </button>
          ) : (
            <span />
          )}
        </div>

        <Separator />

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-4 py-3">
            {error}
          </p>
        )}

        {/* Generate button */}
        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full py-6 text-base font-semibold bg-[#1c1917] hover:bg-[#292524] text-white"
        >
          {generating ? 'Génération en cours...' : 'Générer le devis PDF'}
        </Button>

        {/* Share section — appears after generation */}
        {shareUrl && (
          <Card className="bg-[#f5f5f4] border-[#e7e5e4]">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-[#1c1917]">
                Devis généré avec succès
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-[#78716c]">
                Partagez ce lien avec votre client. Il pourra consulter et accepter le devis en
                ligne.
              </p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={shareUrl}
                  className="flex-1 text-xs bg-white border border-[#e7e5e4] rounded px-3 py-2 font-mono overflow-hidden text-ellipsis"
                />
                <Button type="button" variant="outline" onClick={handleCopyLink} className="shrink-0">
                  {copied ? 'Copié !' : 'Copier'}
                </Button>
              </div>
              <p className="text-xs text-[#a8a29e]">
                Le lien est valable 30 jours. Il fonctionne dans le même navigateur — le partage
                cross-appareil sera disponible dans la version complète.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
