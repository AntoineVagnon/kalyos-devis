import type { ArtisanProfile, Quote } from './types';

const KEYS = {
  profile: 'kalyos_devis_profile',
  quotes: 'kalyos_devis_quotes',
  counter: 'kalyos_devis_counter',
} as const;

export const MAX_FREE_QUOTES = 5;

function safeGet<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded — ignore for MVP
  }
}

export function getProfile(): ArtisanProfile | null {
  return safeGet<ArtisanProfile>(KEYS.profile);
}

export function saveProfile(profile: ArtisanProfile): void {
  safeSet(KEYS.profile, profile);
}

export function getQuotes(): Quote[] {
  return safeGet<Quote[]>(KEYS.quotes) ?? [];
}

export function saveQuote(quote: Quote): void {
  const quotes = getQuotes();
  const idx = quotes.findIndex((q) => q.id === quote.id);
  if (idx >= 0) {
    quotes[idx] = quote;
  } else {
    quotes.push(quote);
  }
  safeSet(KEYS.quotes, quotes);
}

export function getQuoteById(id: string): Quote | null {
  return getQuotes().find((q) => q.id === id) ?? null;
}

export function getCounter(): number {
  return safeGet<number>(KEYS.counter) ?? 0;
}

export function incrementCounter(): number {
  const next = getCounter() + 1;
  safeSet(KEYS.counter, next);
  return next;
}

export function generateQuoteNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const quotes = getQuotes();
  const todayPrefix = `DEVIS-${dateStr}-`;
  const todayQuotes = quotes.filter((q) => q.numero.startsWith(todayPrefix));
  const seq = String(todayQuotes.length + 1).padStart(3, '0');
  return `${todayPrefix}${seq}`;
}

export function getExpiresAt(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString();
}
