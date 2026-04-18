'use client';

import { MAX_FREE_QUOTES } from '@/lib/storage';

interface Props {
  count: number;
}

export function UpgradeBanner({ count }: Props) {
  const remaining = MAX_FREE_QUOTES - count;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#1c1917] text-[#fafaf9] px-4 py-2.5 flex items-center justify-between gap-4 text-sm">
      <span className="text-[#a8a29e]">
        {count}/{MAX_FREE_QUOTES} devis générés.{' '}
        {remaining > 0 ? (
          <>
            Il vous reste{' '}
            <span className="text-white font-medium">{remaining} devis gratuit{remaining > 1 ? 's' : ''}</span>.
          </>
        ) : (
          <span className="text-[#fca5a5] font-medium">Limite atteinte.</span>
        )}
      </span>
      <a
        href="https://kalyos.co/contact"
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 bg-white text-[#1c1917] font-medium text-xs px-3 py-1.5 rounded hover:bg-[#f5f5f4] transition-colors"
      >
        Version complète — 7 500 EUR HT
      </a>
    </div>
  );
}
