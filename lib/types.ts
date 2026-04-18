export type StatutJuridique = 'EI' | 'EURL' | 'SARL' | 'SAS';
export type TauxTVA = 0 | 5.5 | 10 | 20;
export type QuoteStatus = 'draft' | 'shared' | 'accepted';

export interface ArtisanProfile {
  nom_societe: string;
  siret: string;
  adresse: string;
  telephone: string;
  email: string;
  statut_juridique: StatutJuridique;
  logo_base64: string | null;
}

export interface ClientInfo {
  nom: string;
  adresse: string;
  email: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantite: number;
  prix_unitaire_ht: number;
  taux_tva: TauxTVA;
}

export interface Quote {
  id: string;
  numero: string;
  date_creation: string;
  artisan_profile: ArtisanProfile;
  client_info: ClientInfo;
  line_items: LineItem[];
  total_ht: number;
  total_tva: number;
  total_ttc: number;
  status: QuoteStatus;
  accepted_at: string | null;
  expires_at: string;
}

export interface QuoteFormState {
  artisan: ArtisanProfile;
  client: ClientInfo;
  line_items: LineItem[];
}
