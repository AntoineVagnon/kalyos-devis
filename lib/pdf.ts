'use client';

import type { Quote } from './types';
import { formatEur, lineTotal, quoteTotals } from './calculations';
import { getLegalMentions, KALYOS_FOOTER } from './legal-mentions';

export async function generateQuotePDF(quote: Quote): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageW = 210;
  const marginL = 20;
  const marginR = 20;
  const contentW = pageW - marginL - marginR;
  let y = 20;

  const col2 = marginL + contentW / 2 + 5;

  // Helper: draw text with wrap
  function text(
    str: string,
    x: number,
    yPos: number,
    opts?: { align?: 'left' | 'right' | 'center'; size?: number; color?: string; bold?: boolean }
  ) {
    const size = opts?.size ?? 10;
    doc.setFontSize(size);
    doc.setTextColor(opts?.color ?? '#1c1917');
    doc.setFont('helvetica', opts?.bold ? 'bold' : 'normal');
    doc.text(str, x, yPos, { align: opts?.align ?? 'left' });
  }

  // Logo
  if (quote.artisan_profile.logo_base64) {
    try {
      const ext = quote.artisan_profile.logo_base64.includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(quote.artisan_profile.logo_base64, ext, marginL, y, 30, 15);
    } catch {
      // logo load failed — fallback to company name only
    }
    y += 18;
  }

  // Artisan info block
  text(quote.artisan_profile.nom_societe, marginL, y, { size: 14, bold: true });
  y += 6;
  text(quote.artisan_profile.siret ? `SIRET : ${quote.artisan_profile.siret}` : '', marginL, y, { size: 9, color: '#78716c' });
  y += 5;
  text(quote.artisan_profile.adresse, marginL, y, { size: 9, color: '#78716c' });
  y += 5;
  if (quote.artisan_profile.telephone) {
    text(quote.artisan_profile.telephone, marginL, y, { size: 9, color: '#78716c' });
    y += 4;
  }
  if (quote.artisan_profile.email) {
    text(quote.artisan_profile.email, marginL, y, { size: 9, color: '#78716c' });
    y += 4;
  }

  // Quote number + date (right side)
  const numY = 20;
  text('DEVIS', pageW - marginR, numY, { align: 'right', size: 18, bold: true });
  text(quote.numero, pageW - marginR, numY + 7, { align: 'right', size: 9, color: '#78716c' });
  text(
    `Date : ${new Date(quote.date_creation).toLocaleDateString('fr-FR')}`,
    pageW - marginR,
    numY + 12,
    { align: 'right', size: 9, color: '#78716c' }
  );

  y = Math.max(y, numY + 18) + 8;

  // Separator line
  doc.setDrawColor('#e7e5e4');
  doc.line(marginL, y, pageW - marginR, y);
  y += 8;

  // Client info block
  text('Adressé à', marginL, y, { size: 9, color: '#78716c' });
  y += 5;
  text(quote.client_info.nom, marginL, y, { size: 11, bold: true });
  y += 5;
  text(quote.client_info.adresse, marginL, y, { size: 9, color: '#78716c' });
  y += 5;
  if (quote.client_info.email) {
    text(quote.client_info.email, marginL, y, { size: 9, color: '#78716c' });
    y += 5;
  }
  y += 6;

  // Line items table header
  doc.setFillColor('#f5f5f4');
  doc.rect(marginL, y - 4, contentW, 8, 'F');
  text('Description', marginL + 2, y, { size: 9, bold: true });
  text('Qté', marginL + 90, y, { align: 'right', size: 9, bold: true });
  text('PU HT', marginL + 115, y, { align: 'right', size: 9, bold: true });
  text('TVA', marginL + 135, y, { align: 'right', size: 9, bold: true });
  text('Total HT', pageW - marginR, y, { align: 'right', size: 9, bold: true });
  y += 6;

  // Line items
  for (const item of quote.line_items) {
    const { ht } = lineTotal(item);
    // wrap description if needed
    const descLines = doc.splitTextToSize(item.description || '(sans description)', 80);
    doc.setFontSize(9);
    doc.setTextColor('#1c1917');
    doc.setFont('helvetica', 'normal');
    doc.text(descLines, marginL + 2, y);
    text(String(item.quantite), marginL + 90, y, { align: 'right', size: 9 });
    text(formatEur(item.prix_unitaire_ht), marginL + 115, y, { align: 'right', size: 9 });
    text(`${item.taux_tva}%`, marginL + 135, y, { align: 'right', size: 9 });
    text(formatEur(ht), pageW - marginR, y, { align: 'right', size: 9 });
    y += Math.max(descLines.length * 5, 6);

    // light separator
    doc.setDrawColor('#e7e5e4');
    doc.line(marginL, y, pageW - marginR, y);
    y += 2;
  }

  y += 4;

  // Totals
  const totals = quoteTotals(quote.line_items);
  const totalsX = pageW - marginR - 60;

  function totalRow(label: string, amount: number, bold = false) {
    text(label, totalsX, y, { size: 9, bold, color: bold ? '#1c1917' : '#78716c' });
    text(formatEur(amount), pageW - marginR, y, { align: 'right', size: 9, bold });
    y += 5;
  }

  totalRow('Total HT', totals.total_ht);
  Object.entries(totals.tva_by_rate).forEach(([rate, amount]) => {
    if (amount > 0) totalRow(`TVA ${rate}%`, amount);
  });
  doc.setDrawColor('#1c1917');
  doc.line(totalsX, y - 1, pageW - marginR, y - 1);
  y += 1;
  totalRow('Total TTC', totals.total_ttc, true);

  y += 10;

  // Legal mentions
  const legal = getLegalMentions(quote.artisan_profile);
  const legalLines = doc.splitTextToSize(legal, contentW);
  doc.setFontSize(7);
  doc.setTextColor('#78716c');
  doc.setFont('helvetica', 'normal');
  doc.text(legalLines, marginL, y);
  y += legalLines.length * 4 + 4;

  // Kalyos footer — discreet, non-removable
  const footerY = 287;
  doc.setFontSize(8);
  doc.setTextColor('#78716c');
  doc.setFont('helvetica', 'normal');
  doc.text(KALYOS_FOOTER, pageW / 2, footerY, { align: 'center' });

  doc.save(`${quote.numero}.pdf`);
}
