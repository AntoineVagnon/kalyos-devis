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
} from '@/lib/storage';
import { quoteTotals } from '@/lib/calculations';
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
  const [artisan, setArtisan] = useState<ArtisanProfile>(DEFAULT_ARTISAN);
  const [client, setClient] = useState<ClientInfo>(DEFAULT_CLIENT);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('artisan');
  const [generating, setGenerating] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const profile = getProfile();
    if (profile) setArtisan(profile);
  }, []);

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
      incrementCounter();
      setPdfGenerated(true);
    } catch (err) {
      setError('Erreur lors de la génération du PDF. Veuillez réessayer.');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'artisan', label: 'Votre société' },
    { id: 'client', label: 'Client' },
    { id: 'lignes', label: 'Prestations' },
  ];

  return (
    <>
      <UpgradeBanner />
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

        {/* Success message — appears after PDF generation */}
        {pdfGenerated && (
          <Card className="bg-[#f5f5f4] border-[#e7e5e4]">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-[#1c1917]">
                Devis généré avec succès ✓
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#78716c]">
                Votre PDF a été téléchargé. Vous pouvez générer un nouveau devis en modifiant le formulaire.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
