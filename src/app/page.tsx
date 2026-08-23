import React from 'react';
import db from '@/lib/db';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import AboutSection from '@/components/home/AboutSection';
import VehicleGrid from '@/components/home/VehicleGrid';
import BookingForm from '@/components/home/BookingForm';
import HowItWorks from '@/components/home/HowItWorks';
import TermsSection from '@/components/home/TermsSection';
import LocationSection from '@/components/home/LocationSection';
import FAQSection from '@/components/home/FAQSection';
import { CarItem } from '@/components/vehicle/VehicleCard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function HomePage({
  searchParams,
}: {
  searchParams?: { car?: string };
}) {
  // 1. Fetch active cars from database
  const rawCars = db
    .prepare("SELECT * FROM cars WHERE status = 'active' ORDER BY sort_order ASC, created_at DESC")
    .all() as any[];

  const cars: CarItem[] = rawCars.map((car) => ({
    ...car,
    features: car.features ? JSON.parse(car.features) : [],
    gallery: car.gallery ? JSON.parse(car.gallery) : [],
  }));

  // 2. Fetch settings
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
  const settings: Record<string, string> = {};
  for (const r of rows) {
    settings[r.key] = r.value;
  }

  const selectedCarId = searchParams?.car;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Top Navbar */}
      <Navbar
        companyName={settings.company_name || 'RENTCAR'}
        tagline={settings.company_tagline || 'Sewa Mobil Terpercaya'}
        companyLogo={settings.company_logo}
      />

      {/* Main Content Sections */}
      <main className="flex-grow pb-16 md:pb-0">
        {/* 1. Hero Section */}
        <HeroSection
          title={settings.hero_title}
          subtitle={settings.hero_subtitle}
          badge={settings.hero_badge}
        />

        {/* 2. Daftar Mobil & Filter Kategori (Langsung Terlihat Setelah Hero) */}
        <VehicleGrid
          cars={cars}
          title="Mobil Tersedia"
          subtitle="Pilih mobil sesuai kebutuhan perjalanan Anda"
          showFilter={true}
          showViewAll={true}
        />

        {/* 3. Alur & Cara Sewa */}
        <HowItWorks />

        {/* 4. Form Ketersediaan & Booking Interaktif */}
        <BookingForm
          cars={cars}
          selectedCarId={selectedCarId}
          adminWhatsApp={settings.admin_whatsapp || '6281234567890'}
          companyName={settings.company_name || 'RentCar'}
        />

        {/* 5. Syarat & Ketentuan Sewa */}
        <TermsSection />

        {/* 6. Tanya Jawab (FAQ) */}
        <FAQSection />

        {/* 7. Profil & Keunggulan Perusahaan (Tentang Kami) */}
        <AboutSection
          title={settings.about_title}
          text={settings.about_text}
        />

        {/* 8. Lokasi Kantor & Kontak (Tepat di Atas Footer) */}
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

      {/* Footer */}
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

      {/* Mobile Sticky Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
