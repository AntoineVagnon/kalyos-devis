'use client';

import LZString from 'lz-string';
import type { Quote } from './types';

export function encodeQuoteForUrl(quote: Quote): string {
  const json = JSON.stringify(quote);
  return LZString.compressToEncodedURIComponent(json);
}

export function decodeQuoteFromUrl(encoded: string): Quote | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    return json ? (JSON.parse(json) as Quote) : null;
  } catch {
    return null;
  }
}

export function buildShareUrl(quote: Quote): string {
  const encoded = encodeQuoteForUrl(quote);
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  return `${base}/devis/${encoded}`;
}

export function isQuoteExpired(quote: Quote): boolean {
  return new Date() > new Date(quote.expires_at);
}
