import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CarIcon } from '@/components/ui/Icons';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  badge?: string;
}

export default function HeroSection({
  title = 'Sewa Mobil Nyaman, Bebas Atur Perjalanan',
  subtitle = 'Solusi penyewaan mobil untuk kebutuhan pribadi, liburan, bisnis, atau perjalanan keluarga Anda. Lepas kunci, lepas khawatir.',
  badge = 'Rental Mobil Lepas Kunci',
}: HeroSectionProps) {
  return (
    <section className="relative bg-brand-navy text-white overflow-hidden">
      {/* Background subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(30,58,92,0.6),rgba(11,31,51,0))] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-slate-200 backdrop-blur-sm shadow-sm">
              <CarIcon size={16} className="text-emerald-400" />
              <span>{badge}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight lg:leading-[1.15]">
              {title}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {subtitle}
            </p>

            {/* Dual Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href="/mobil"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600 transition-all text-center active:scale-98 shadow-sm"
              >
                Lihat Mobil
              </Link>
              <Link
                href="/#booking"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm font-bold text-brand-navy bg-white hover:bg-slate-100 transition-all text-center active:scale-98 shadow-md"
              >
                Cek Ketersediaan
              </Link>
            </div>
          </div>

          {/* Right Showcase Image Column */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            <div className="relative w-full max-w-lg lg:max-w-none h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900/40">
              <Image
                src="/images/hero/hero-suv.jpg"
                alt="Rental Mobil Lepas Kunci"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
