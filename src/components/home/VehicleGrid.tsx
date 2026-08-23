'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [viewMode, setViewMode] = useState<'slider' | 'grid'>('slider');

  const categories = ['Semua', 'MPV', 'SUV', 'City Car', 'Luxury'];

  const filteredCars =
    selectedCategory === 'Semua'
      ? cars
      : cars.filter((car) => car.category.toLowerCase() === selectedCategory.toLowerCase());

  // Auto-slide effect (every 4 seconds) when in slider mode and not paused
  useEffect(() => {
    if (viewMode !== 'slider' || isPaused || filteredCars.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredCars.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [viewMode, isPaused, filteredCars.length]);

  // Reset index when category changes
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentIndex(0);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredCars.length) % filteredCars.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredCars.length);
  };

  return (
    <section id="armada" className="py-16 md:py-20 bg-slate-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Controls */}
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

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('slider')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'slider'
                    ? 'bg-brand-navy text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Auto-Slide ⚡
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-brand-navy text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Grid Semua
              </button>
            </div>

            {showViewAll && (
              <Link
                href="/mobil"
                className="text-xs font-bold text-brand-navy hover:text-brand-navy-light underline-offset-4 hover:underline transition-colors ml-1"
              >
                Semua Mobil &rarr;
              </Link>
            )}
          </div>
        </div>

        {/* Category Pills Filter */}
        {showFilter && (
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
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

        {/* ========================================================================= */}
        {/* CAROUSEL SLIDER VIEW (Auto-Slide with Navigation)                         */}
        {/* ========================================================================= */}
        {filteredCars.length > 0 ? (
          viewMode === 'slider' ? (
            <div
              className="relative"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Slider Track */}
              <div className="overflow-hidden rounded-2xl py-2">
                <div
                  className="flex transition-transform duration-700 ease-out"
                  style={{
                    transform: `translateX(-${currentIndex * 100}%)`,
                  }}
                >
                  {filteredCars.map((car, idx) => (
                    <div
                      key={car.id}
                      className="w-full sm:w-1/2 lg:w-1/3 shrink-0 px-3"
                    >
                      <VehicleCard
                        car={car}
                        onSelectCar={onSelectCar}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Left / Right Carousel Controls */}
              {filteredCars.length > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-50 flex items-center justify-center text-slate-700 font-bold transition-all active:scale-90 cursor-pointer"
                      title="Mobil Sebelumnya"
                    >
                      &larr;
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-50 flex items-center justify-center text-slate-700 font-bold transition-all active:scale-90 cursor-pointer"
                      title="Mobil Berikutnya"
                    >
                      &rarr;
                    </button>
                    <span className="text-xs text-slate-400 font-medium ml-2">
                      {isPaused ? '⏸️ Auto-slide dijeda' : '▶️ Auto-slide aktif'}
                    </span>
                  </div>

                  {/* Pagination Dots */}
                  <div className="flex items-center gap-1.5">
                    {filteredCars.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        type="button"
                        onClick={() => setCurrentIndex(dotIdx)}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          currentIndex === dotIdx
                            ? 'w-6 bg-brand-navy'
                            : 'w-2 bg-slate-300 hover:bg-slate-400'
                        }`}
                        title={`Pindah ke mobil #${dotIdx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Standard Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredCars.map((car) => (
                <VehicleCard
                  key={car.id}
                  car={car}
                  onSelectCar={onSelectCar}
                />
              ))}
            </div>
          )
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
