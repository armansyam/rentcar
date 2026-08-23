import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Rental Mobil Bandung | Sewa Mobil Lepas Kunci - RentCar',
  description:
    'Sewa mobil lepas kunci di Bandung dengan armada terawat, harga transparan, dan proses pemesanan praktis via WhatsApp.',
  keywords: [
    'rental mobil bandung',
    'sewa mobil lepas kunci',
    'rental mobil murah',
    'sewa avanza bandung',
    'sewa innova reborn',
    'rentcar bandung',
  ],
  authors: [{ name: 'RentCar Team' }],
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
};

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
