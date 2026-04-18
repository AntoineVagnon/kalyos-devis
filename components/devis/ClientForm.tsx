'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ClientInfo } from '@/lib/types';

interface Props {
  value: ClientInfo;
  onChange: (client: ClientInfo) => void;
}

export function ClientForm({ value, onChange }: Props) {
  function field<K extends keyof ClientInfo>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ...value, [key]: e.target.value });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="client_nom">Nom / Raison sociale *</Label>
        <Input
          id="client_nom"
          placeholder="Jean Martin ou SARL Martin"
          value={value.nom}
          onChange={field('nom')}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="client_adresse">Adresse *</Label>
        <Input
          id="client_adresse"
          placeholder="5 avenue des Lilas, 69000 Lyon"
          value={value.adresse}
          onChange={field('adresse')}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="client_email">Email (optionnel)</Label>
        <Input
          id="client_email"
          type="email"
          placeholder="client@exemple.fr"
          value={value.email}
          onChange={field('email')}
        />
      </div>
    </div>
  );
}
