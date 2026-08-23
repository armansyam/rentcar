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
  subtitle = 'Pilih mobil sesuai kebutuhan Anda',
  showFilter = true,
  showViewAll = true,
}: VehicleGridProps) {
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const categories = ['Semua', 'MPV', 'SUV', 'City Car', 'Luxury'];

  const filteredCars =
    selectedCategory === 'Semua'
      ? cars
      : cars.filter((car) => car.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <section id="armada" className="py-16 md:py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & View All */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
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
              Lihat Semua Mobil &rarr;
            </Link>
          )}
        </div>

        {/* Category Pills Filter matching mockup */}
        {showFilter && (
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
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

        {/* Grid of Vehicles */}
        {filteredCars.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredCars.map((car) => (
              <VehicleCard
                key={car.id}
                car={car}
                onSelectCar={onSelectCar}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
            <p className="text-sm text-slate-500 font-medium">
              Tidak ada mobil yang ditemukan pada kategori ini.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
