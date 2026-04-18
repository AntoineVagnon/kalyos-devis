import type { ArtisanProfile, StatutJuridique } from './types';

const mentions: Record<StatutJuridique, (p: ArtisanProfile) => string> = {
  EI: (p) =>
    `${p.nom_societe} — Entrepreneur Individuel. SIRET : ${p.siret}. ` +
    `TVA non applicable, art. 293 B du CGI (si auto-entrepreneur). ` +
    `Dispensé d'immatriculation au RCS et au RM (si micro-entreprise).`,
  EURL: (p) =>
    `${p.nom_societe} — EURL au capital social variable. SIRET : ${p.siret}. ` +
    `RCS [ville] — [Numéro RCS]. TVA intracommunautaire : FR[XX]${p.siret.replace(/\s/g, '').slice(0, 9)}.`,
  SARL: (p) =>
    `${p.nom_societe} — SARL au capital de [X 000] EUR. SIRET : ${p.siret}. ` +
    `RCS [ville] — [Numéro RCS]. TVA intracommunautaire : FR[XX]${p.siret.replace(/\s/g, '').slice(0, 9)}.`,
  SAS: (p) =>
    `${p.nom_societe} — SAS au capital de [X 000] EUR. SIRET : ${p.siret}. ` +
    `RCS [ville] — [Numéro RCS]. TVA intracommunautaire : FR[XX]${p.siret.replace(/\s/g, '').slice(0, 9)}.`,
};

export function getLegalMentions(profile: ArtisanProfile): string {
  return mentions[profile.statut_juridique](profile);
}

export const KALYOS_FOOTER =
  'Devis généré avec Kalyos Mini-App — Version complète en 14 jours / 7 500 EUR HT';
