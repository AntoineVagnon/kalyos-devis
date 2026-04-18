import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Devis PDF gratuit — Kalyos Mini-App',
  description:
    'Générez des devis professionnels en PDF gratuitement. Sans inscription. Pour artisans et TPE/PME.',
  metadataBase: new URL('https://kalyos-devis.vercel.app'),
  openGraph: {
    title: 'Devis PDF gratuit — Kalyos Mini-App',
    description: 'Générez des devis professionnels en PDF gratuitement. Pour artisans et TPE/PME.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#fafaf9]">{children}</body>
    </html>
  );
}
