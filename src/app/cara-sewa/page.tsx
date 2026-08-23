import React from 'react';
import db from '@/lib/db';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';
import HowItWorks from '@/components/home/HowItWorks';
import TermsSection from '@/components/home/TermsSection';
import FAQSection from '@/components/home/FAQSection';

export const dynamic = 'force-dynamic';

export default function CaraSewaPage() {
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
  const settings: Record<string, string> = {};
  for (const r of rows) {
    settings[r.key] = r.value;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar
        companyName={settings.company_name}
        tagline={settings.company_tagline}
      />

      <main className="flex-grow pb-16 md:pb-0">
        <div className="bg-brand-navy text-white py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 block">
              Panduan Penyewa
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Cara & Syarat Sewa Mobil
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-2xl">
              Prosedur praktis, persyaratan dokumen jelas, dan layanan cepat lepas kunci untuk kenyamanan perjalanan Anda.
            </p>
          </div>
        </div>

        <HowItWorks />
        <TermsSection />
        <FAQSection />
      </main>

      <Footer
        companyName={settings.company_name}
        tagline={settings.company_tagline}
        phone={settings.company_phone}
        email={settings.company_email}
        address={settings.office_address}
        whatsapp={settings.admin_whatsapp}
      />

      <BottomNav />
    </div>
  );
}
