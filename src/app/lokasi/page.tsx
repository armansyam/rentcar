import React from 'react';
import db from '@/lib/db';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';
import LocationSection from '@/components/home/LocationSection';

export const dynamic = 'force-dynamic';

export default function LokasiPage() {
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
        companyLogo={settings.company_logo}
      />

      <main className="flex-grow pb-16 md:pb-0">
        <div className="bg-brand-navy text-white py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 block">
              Kantor Operasional
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Lokasi & Kontak Layanan
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-2xl">
              Kunjungi kantor operasional kami atau hubungi tim customer care kami yang siap melayani 24/7.
            </p>
          </div>
        </div>

        <LocationSection
          officeName={settings.office_name}
          officeAddress={settings.office_address}
          companyPhone={settings.company_phone}
          companyEmail={settings.company_email}
          googleMapsUrl={settings.google_maps_url}
          googleMapsEmbed={settings.google_maps_embed}
          operationalHours={settings.operational_hours}
        />
      </main>

      <Footer
        companyName={settings.company_name}
        tagline={settings.company_tagline}
        companyLogo={settings.company_logo}
        phone={settings.company_phone}
        email={settings.company_email}
        address={settings.office_address}
        whatsapp={settings.admin_whatsapp}
        instagram={settings.social_instagram}
        tiktok={settings.social_tiktok}
        facebook={settings.social_facebook}
      />

      <BottomNav />
    </div>
  );
}
