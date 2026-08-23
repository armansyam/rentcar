'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UsersIcon, CogIcon, FuelIcon } from '@/components/ui/Icons';

export interface CarItem {
  id: string;
  brand: string;
  model: string;
  plate_number?: string;
  slug: string;
  year: number;
  capacity: number;
  transmission: string;
  fuel: string;
  price_per_day: number;
  category: string;
  description?: string;
  features?: string[];
  image_url: string;
  gallery?: string[];
  status?: string;
  sort_order?: number;
}

interface VehicleCardProps {
  car: CarItem;
  onSelectCar?: (car: CarItem) => void;
  showSelectButton?: boolean;
}

export default function VehicleCard({
  car,
  onSelectCar,
  showSelectButton = true,
}: VehicleCardProps) {
  const handleSelectCar = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSelectCar) {
      onSelectCar(car);
    }
    window.dispatchEvent(new CustomEvent('rentcar:select-car', { detail: car }));
    const formEl = document.getElementById('booking') || document.getElementById('sewa');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden card-shadow hover:card-shadow-hover hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full">
      {/* Image Container with Category Badge */}
      <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-3">
        <Link href={`/mobil/${car.slug}`} className="block w-full h-full relative">
          <Image
            src={car.image_url}
            alt={`${car.brand} ${car.model}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain p-2 group-hover:scale-108 transition-transform duration-500"
          />
        </Link>
        <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none z-10">
          <span className="bg-brand-navy/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
            {car.category}
          </span>
        </div>
      </div>

      {/* Car Info & Specs */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/mobil/${car.slug}`} className="block group-hover:text-brand-navy transition-colors">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              {car.brand} {car.model}
            </h3>
          </Link>

          {/* Specs Row with Line Icons */}
          <div className="flex items-center gap-3 mt-2.5 text-xs font-medium text-slate-500 flex-wrap">
            <div className="flex items-center gap-1.5">
              <UsersIcon size={15} className="text-slate-400" />
              <span>{car.capacity} Kursi</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
            <div className="flex items-center gap-1.5">
              <CogIcon size={15} className="text-slate-400" />
              <span>{car.transmission}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
            <div className="flex items-center gap-1.5">
              <FuelIcon size={15} className="text-slate-400" />
              <span>{car.fuel}</span>
            </div>
          </div>
        </div>

        {/* CTA Button without Price, Plate, or Availability status */}
        {showSelectButton && (
          <div className="mt-5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSelectCar}
              className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-brand-navy hover:bg-brand-navy-light active:scale-98 transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Pilih Mobil Ini</span>
              <span className="text-emerald-400 font-black">&darr;</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
