import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import db from '@/lib/db';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';
import {
  UsersIcon,
  CogIcon,
  FuelIcon,
  CheckIcon,
  CalendarIcon,
  WhatsAppIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
} from '@/components/ui/Icons';
import { CarItem } from '@/components/vehicle/VehicleCard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function CarDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const rawCar = db.prepare('SELECT * FROM cars WHERE slug = ?').get(params.slug) as any;

  if (!rawCar) {
    notFound();
  }

  const car: CarItem = {
    ...rawCar,
    features: rawCar.features ? JSON.parse(rawCar.features) : [],
    gallery: rawCar.gallery ? JSON.parse(rawCar.gallery) : [],
  };

  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
  const settings: Record<string, string> = {};
  for (const r of rows) {
    settings[r.key] = r.value;
  }

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(car.price_per_day);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar
        companyName={settings.company_name}
        tagline={settings.company_tagline}
      />

      <main className="flex-grow pb-24 md:pb-16">
        {/* Breadcrumb Navigation */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
            <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium overflow-x-auto">
              <Link href="/" className="hover:text-brand-navy transition-colors">
                Beranda
              </Link>
              <ChevronRightIcon size={14} className="text-slate-400 shrink-0" />
              <Link href="/mobil" className="hover:text-brand-navy transition-colors">
                Mobil
              </Link>
              <ChevronRightIcon size={14} className="text-slate-400 shrink-0" />
              <span className="text-brand-navy font-bold truncate">
                {car.brand} {car.model}
              </span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Big Image & Gallery */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 card-shadow flex items-center justify-center relative min-h-[300px] sm:min-h-[380px]">
                <div className="relative w-full h-64 sm:h-80">
                  <Image
                    src={car.image_url}
                    alt={`${car.brand} ${car.model}`}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Gallery Thumbnails */}
              {car.gallery && car.gallery.length > 0 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {car.gallery.map((imgUrl, i) => (
                    <div
                      key={i}
                      className="w-24 h-16 rounded-xl border-2 border-brand-navy bg-white p-1 shrink-0 overflow-hidden relative"
                    >
                      <Image
                        src={imgUrl}
                        alt={`Galeri ${i + 1}`}
                        fill
                        loading="lazy"
                        className="object-contain"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Car Highlights Badges */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-white rounded-xl p-3.5 border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-400 block mb-0.5">Kapasitas</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center justify-center gap-1">
                    <UsersIcon size={16} className="text-brand-navy" />
                    {car.capacity} Kursi
                  </span>
                </div>
                <div className="bg-white rounded-xl p-3.5 border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-400 block mb-0.5">Transmisi</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center justify-center gap-1">
                    <CogIcon size={16} className="text-brand-navy" />
                    {car.transmission}
                  </span>
                </div>
                <div className="bg-white rounded-xl p-3.5 border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-400 block mb-0.5">Bahan Bakar</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center justify-center gap-1">
                    <FuelIcon size={16} className="text-brand-navy" />
                    {car.fuel}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Car Details & Actions */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 card-shadow space-y-6">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-2.5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[11px] font-bold text-slate-700">
                      <span>{car.category}</span>
                      <span>•</span>
                      <span>Tahun {car.year}</span>
                    </div>
                    {car.plate_number && (
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-900 text-amber-300 font-mono text-xs font-extrabold border border-slate-700 tracking-wider shadow-xs">
                        {car.plate_number}
                      </div>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {car.brand} {car.model}
                  </h1>

                  {/* Price Box */}
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block">
                        Harga Sewa Mulai Dari
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-2xl font-black text-brand-navy">
                          {formattedPrice}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">/ 24 Jam</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <ShieldCheckIcon size={14} />
                      <span>Lepas Kunci</span>
                    </div>
                  </div>
                </div>

                {/* Deskripsi */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Deskripsi Kendaraan
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {car.description || 'Kendaraan nyaman dan terawat prima untuk kebutuhan perjalanan Anda.'}
                  </p>
                </div>

                {/* Fasilitas & Fitur */}
                {car.features && car.features.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Fasilitas & Kelengkapan
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {car.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                          <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <CheckIcon size={11} />
                          </div>
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Booking Trigger Buttons */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <Link
                    href={`/#booking?car=${car.id}`}
                    className="w-full py-3.5 px-5 rounded-xl font-bold text-white bg-brand-navy hover:bg-brand-navy-light flex items-center justify-center gap-2 text-sm shadow-md transition-all active:scale-98"
                  >
                    <CalendarIcon size={18} />
                    <span>Cek Ketersediaan Mobil Ini</span>
                  </Link>

                  <a
                    href={`https://wa.me/${(settings.admin_whatsapp || '6281234567890').replace(
                      /\D/g,
                      ''
                    )}?text=${encodeURIComponent(
                      `Halo Admin RentCar, saya tertarik untuk menyewa mobil ${car.brand} ${car.model} lepas kunci. Mohon informasi ketersediaannya.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-5 rounded-xl font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center justify-center gap-2 text-sm transition-all active:scale-98"
                  >
                    <WhatsAppIcon size={18} className="text-brand-green-wa" />
                    <span>Tanya via WhatsApp Langsung</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
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
