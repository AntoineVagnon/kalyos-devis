'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ArtisanProfile, StatutJuridique } from '@/lib/types';

interface Props {
  value: ArtisanProfile;
  onChange: (profile: ArtisanProfile) => void;
}

const STATUTS: { value: StatutJuridique; label: string }[] = [
  { value: 'EI', label: 'EI / Auto-entrepreneur' },
  { value: 'EURL', label: 'EURL' },
  { value: 'SARL', label: 'SARL' },
  { value: 'SAS', label: 'SAS / SASU' },
];

export function ArtisanForm({ value, onChange }: Props) {
  function field<K extends keyof ArtisanProfile>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ...value, [key]: e.target.value });
  }

  function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange({ ...value, logo_base64: reader.result as string });
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="nom_societe">Nom de la société *</Label>
          <Input
            id="nom_societe"
            placeholder="Plomberie Dupont"
            value={value.nom_societe}
            onChange={field('nom_societe')}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="siret">SIRET *</Label>
          <Input
            id="siret"
            placeholder="123 456 789 00012"
            value={value.siret}
            onChange={field('siret')}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="adresse">Adresse *</Label>
        <Input
          id="adresse"
          placeholder="12 rue de la Paix, 75001 Paris"
          value={value.adresse}
          onChange={field('adresse')}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="telephone">Téléphone</Label>
          <Input
            id="telephone"
            placeholder="06 12 34 56 78"
            value={value.telephone}
            onChange={field('telephone')}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email_artisan">Email</Label>
          <Input
            id="email_artisan"
            type="email"
            placeholder="contact@entreprise.fr"
            value={value.email}
            onChange={field('email')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="statut">Statut juridique *</Label>
          <Select
            value={value.statut_juridique}
            onValueChange={(v) => v !== null && onChange({ ...value, statut_juridique: v as StatutJuridique })}
          >
            <SelectTrigger id="statut">
              <SelectValue placeholder="Choisir..." />
            </SelectTrigger>
            <SelectContent>
              {STATUTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="logo">Logo (PNG/JPG)</Label>
          <Input id="logo" type="file" accept="image/png,image/jpeg" onChange={handleLogo} />
          {value.logo_base64 && (
            <p className="text-xs text-[#78716c]">Logo enregistré</p>
          )}
        </div>
      </div>
    </div>
  );
}
