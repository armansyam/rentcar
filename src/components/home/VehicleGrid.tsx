'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import VehicleCard, { CarItem } from '@/components/vehicle/VehicleCard';

interface VehicleGridProps {
  cars: CarItem[];
  onSelectCar?: (car: CarItem) => void;
  title?: string;
  subtitle?: string;
  showFilter?: boolean;
  showViewAll?: boolean;
}

export default function VehicleGrid({
  cars,
  onSelectCar,
  title = 'Mobil Tersedia',
  subtitle = 'Pilih mobil sesuai kebutuhan perjalanan Anda',
  showFilter = true,
  showViewAll = true,
}: VehicleGridProps) {
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const categories = ['Semua', 'MPV', 'SUV', 'City Car', 'Luxury'];

  const filteredCars =
    selectedCategory === 'Semua'
      ? cars
      : cars.filter((car) => car.category.toLowerCase() === selectedCategory.toLowerCase());

  // Duplicate items for a truly seamless infinite looping showcase
  let displayCars = [...filteredCars];
  while (displayCars.length < 8 && displayCars.length > 0) {
    displayCars = [...displayCars, ...filteredCars];
  }
  // Double it for the 50% translation loop
  const loopingItems = [...displayCars, ...displayCars];

  return (
    <section id="armada" className="py-16 md:py-20 bg-slate-50 border-b border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        {/* Header without navigation controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
              Katalog Armada
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {title}
            </h2>
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          </div>

          {showViewAll && (
            <Link
              href="/mobil"
              className="text-xs font-bold text-brand-navy hover:text-brand-navy-light underline-offset-4 hover:underline transition-colors shrink-0"
            >
              Semua Mobil &rarr;
            </Link>
          )}
        </div>

        {/* Category Filter Tabs */}
        {showFilter && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mt-6 no-scrollbar">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-brand-navy text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SEAMLESS INFINITE LOOPING SHOWCASE (NO NAVIGATION, NEVER ENDS)            */}
      {/* ========================================================================= */}
      {filteredCars.length > 0 ? (
        <div className="relative w-full overflow-hidden py-3">
          {/* Subtle gradient edges for modern showcase look */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-slate-50 to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-slate-50 to-transparent z-10" />

          <div className="animate-infinite-scroll">
            {loopingItems.map((car, idx) => (
              <div
                key={`${car.id}-${idx}`}
                className="w-[280px] sm:w-[320px] lg:w-[350px] shrink-0 px-3"
              >
                <VehicleCard
                  car={car}
                  onSelectCar={onSelectCar}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <p className="text-sm text-slate-500 font-medium">
            Tidak ada mobil yang ditemukan pada kategori ini.
          </p>
        </div>
      )}
    </section>
  );
}
