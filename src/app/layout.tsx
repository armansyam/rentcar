import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import db from '@/lib/db';
import '@/styles/globals.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
    const s: Record<string, string> = {};
    rows.forEach((r) => {
      s[r.key] = r.value;
    });

    const title = s.meta_title || 'Rental Mobil Bandung | Sewa Mobil Lepas Kunci - RentCar';
    const description =
      s.meta_description ||
      'Sewa mobil lepas kunci di Bandung dengan armada terawat, harga transparan, dan proses pemesanan praktis via WhatsApp.';
    const keywords = s.meta_keywords
      ? s.meta_keywords.split(',').map((k) => k.trim()).filter(Boolean)
      : ['rental mobil bandung', 'sewa mobil lepas kunci', 'rentcar bandung'];
    const canonical = s.canonical_url || 'http://localhost:3000';
    const ogImage = s.og_image || '/images/cars/hero-luxury-black-suv.jpg';
    const robots = s.robots_index || 'index, follow';

    const baseUrl = canonical.startsWith('http') ? canonical : `https://${canonical}`;

    const faviconUrl = s.favicon_url || s.company_logo || '/favicon.png';

    return {
      metadataBase: new URL(baseUrl),
      title,
      description,
      keywords,
      authors: [{ name: s.company_name || 'RentCar' }],
      icons: {
        icon: faviconUrl,
        shortcut: faviconUrl,
        apple: faviconUrl,
      },
      openGraph: {
        title,
        description,
        url: baseUrl,
        siteName: s.og_site_name || s.company_name || 'RentCar',
        images: [{ url: ogImage, width: 1200, height: 630 }],
        locale: 'id_ID',
        type: 'website',
      },
      verification: s.google_site_verification
        ? {
            google: s.google_site_verification,
          }
        : undefined,
      robots: {
        index: !robots.includes('noindex'),
        follow: !robots.includes('nofollow'),
      },
    };
  } catch {
    return {
      title: 'Rental Mobil Bandung | Sewa Mobil Lepas Kunci - RentCar',
      description: 'Sewa mobil lepas kunci di Bandung dengan armada terawat.',
    };
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans selection:bg-brand-navy selection:text-white">
        {children}
        {/* Developer Watermark Script */}
        <Script src="/js/watermark.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
