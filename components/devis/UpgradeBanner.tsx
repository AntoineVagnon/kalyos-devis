'use client';

export function UpgradeBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#1c1917] text-[#fafaf9] px-4 py-2.5 flex items-center justify-between gap-4 text-sm">
      <span className="text-[#a8a29e] text-xs">
        Devis illimités gratuits. Pour ajouter CRM, relances auto, signature électronique :{' '}
        <span className="text-white">version complète adaptée à votre métier en 14 jours / 7 500 EUR HT</span>
      </span>
      <a
        href="https://kalyos.co/contact"
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 bg-white text-[#1c1917] font-medium text-xs px-3 py-1.5 rounded hover:bg-[#f5f5f4] transition-colors"
      >
        Nous contacter
      </a>
    </div>
  );
}
