import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';
import db from '@/lib/db';
import '@/styles/globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const headerList = headers();
    const host = headerList.get('x-forwarded-host') || headerList.get('host') || '';
    const proto = headerList.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const autoDetectedUrl = host ? `${proto}://${host}` : 'http://localhost:3000';

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
    
    const canonical = s.canonical_url || autoDetectedUrl;
    const baseUrl = canonical.startsWith('http') ? canonical : `https://${canonical}`;

    const rawOgImage = s.og_image || '/images/cars/hero-luxury-black-suv.jpg';
    const absoluteOgImage = rawOgImage.startsWith('http')
      ? rawOgImage
      : `${baseUrl.replace(/\/$/, '')}${rawOgImage.startsWith('/') ? '' : '/'}${rawOgImage}`;

    const robots = s.robots_index || 'index, follow';
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
        images: [
          {
            url: absoluteOgImage,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        locale: 'id_ID',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [absoluteOgImage],
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
  const showWatermark = process.env.NEXT_PUBLIC_SHOW_WATERMARK !== 'false';

  return (
    <html lang="id" className={`scroll-smooth ${plusJakartaSans.className}`}>
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans selection:bg-brand-navy selection:text-white">
        {children}
        {/* Developer Watermark Script */}
        {showWatermark && <Script src="/js/watermark.js" strategy="lazyOnload" />}
      </body>
    </html>
  );
}

