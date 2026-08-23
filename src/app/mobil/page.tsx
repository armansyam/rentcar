import React from 'react';
import db from '@/lib/db';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';
import VehicleGrid from '@/components/home/VehicleGrid';
import { CarItem } from '@/components/vehicle/VehicleCard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function MobilCatalogPage() {
  const rawCars = db
    .prepare("SELECT * FROM cars WHERE status = 'active' ORDER BY sort_order ASC, created_at DESC")
    .all() as any[];

  const cars: CarItem[] = rawCars.map((car) => ({
    ...car,
    features: car.features ? JSON.parse(car.features) : [],
    gallery: car.gallery ? JSON.parse(car.gallery) : [],
  }));

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

      <main className="flex-grow pb-16 md:pb-12">
        {/* Page Banner Header */}
        <div className="bg-brand-navy text-white py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 block">
              Pilihan Kendaraan
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Daftar Armada Lepas Kunci
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-2xl">
              Temukan berbagai tipe mobil keluarga, SUV, city car, hingga luxury MPV dengan kondisi prima dan siap pakai.
            </p>
          </div>
        </div>

        {/* Vehicle Catalog with Category Filter */}
        <VehicleGrid
          cars={cars}
          title="Semua Pilihan Armada"
          subtitle="Pilih armada favorit Anda untuk mengecek ketersediaan tanggal sewa."
          showFilter={true}
          showViewAll={false}
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
