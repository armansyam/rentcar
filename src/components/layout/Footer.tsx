'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CarIcon, PhoneIcon, MailIcon, MapPinIcon, WhatsAppIcon } from '@/components/ui/Icons';

interface FooterProps {
  companyName?: string;
  tagline?: string;
  companyLogo?: string;
  phone?: string;
  email?: string;
  address?: string;
  whatsapp?: string;
  instagram?: string;
  tiktok?: string;
  facebook?: string;
}

export default function Footer({
  companyName = 'RentCar',
  tagline = 'Sewa Mobil Terpercaya',
  companyLogo,
  phone = '0812-3456-7890',
  email = 'info@rentcar.id',
  address = 'Jl. Merdeka No.123, Sukajadi, Kec. Sukajadi, Kota Bandung, Jawa Barat 40161',
  whatsapp = '6281234567890',
  instagram,
  tiktok,
  facebook,
}: FooterProps) {
  const [imgError, setImgError] = React.useState(false);

  return (
    <footer className="bg-brand-navy text-white pt-16 pb-24 md:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {companyLogo && !imgError ? (
                <div className="relative h-12 max-w-[200px] flex items-center bg-white/5 p-1 rounded-xl">
                  <img
                    src={companyLogo}
                    alt={companyName}
                    className="max-h-10 max-w-[180px] object-contain object-left"
                    onError={() => setImgError(true)}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                    <CarIcon size={22} />
                  </div>
                  <div>
                    <span className="font-extrabold text-xl tracking-tight text-white block">
                      {companyName.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400 block font-normal">
                      {tagline}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
              Melayani kebutuhan transportasi Anda dengan armada terbaik, kondisi prima terawat, dan pelayanan lepas kunci yang profesional.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2 flex-wrap">
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-brand-green-wa hover:text-white flex items-center justify-center text-slate-300 transition-colors"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon size={18} />
              </a>
              {phone && (
                <a
                  href={`tel:${phone.replace(/\D/g, '')}`}
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 transition-colors"
                  aria-label="Telepon"
                >
                  <PhoneIcon size={18} />
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 transition-colors"
                  aria-label="Email"
                >
                  <MailIcon size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Navigasi Cepat */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4">
              Navigasi
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/mobil" className="hover:text-white transition-colors">
                  Daftar Mobil
                </Link>
              </li>
              <li>
                <Link href="/cara-sewa" className="hover:text-white transition-colors">
                  Cara & Syarat Sewa
                </Link>
              </li>
              <li>
                <Link href="/lokasi" className="hover:text-white transition-colors">
                  Lokasi Kantor
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-white transition-colors">
                  Tanya Jawab (FAQ)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Pilihan Armada */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4">
              Pilihan Armada
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link href="/mobil/toyota-avanza" className="hover:text-white transition-colors">
                  Toyota Avanza
                </Link>
              </li>
              <li>
                <Link href="/mobil/toyota-innova-reborn" className="hover:text-white transition-colors">
                  Toyota Innova Reborn
                </Link>
              </li>
              <li>
                <Link href="/mobil/honda-mobilio" className="hover:text-white transition-colors">
                  Honda Mobilio
                </Link>
              </li>
              <li>
                <Link href="/mobil/toyota-fortuner" className="hover:text-white transition-colors">
                  Toyota Fortuner
                </Link>
              </li>
              <li>
                <Link href="/mobil" className="text-emerald-400 hover:underline font-semibold block pt-1">
                  Lihat Semua Armada &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Informasi Kantor */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4">
              Kantor Operasional
            </h3>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPinIcon size={18} className="text-slate-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <PhoneIcon size={18} className="text-slate-400 shrink-0" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MailIcon size={18} className="text-slate-400 shrink-0" />
                <span>{email}</span>
              </div>
              <div className="pt-2">
                <Link
                  href="/admin"
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Portal Admin &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 {companyName}. All rights reserved.</p>
          <p className="flex items-center gap-1 text-slate-400">
            Sistem Penyewaan Mobil Lepas Kunci Profesional
          </p>
        </div>
      </div>
    </footer>
  );
}
