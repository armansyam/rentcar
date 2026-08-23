'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UsersIcon, CogIcon, FuelIcon, HeartIcon } from '@/components/ui/Icons';

export interface CarItem {
  id: string;
  brand: string;
  model: string;
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
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(car.price_per_day);

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 overflow-hidden card-shadow card-shadow-hover flex flex-col justify-between transition-all duration-300 relative">
      {/* Top Favorite Icon */}
      <button
        type="button"
        className="absolute top-3.5 right-3.5 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-white transition-colors shadow-sm"
        aria-label="Simpan Favorit"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <HeartIcon size={18} />
      </button>

      {/* Car Image Area */}
      <Link href={`/mobil/${car.slug}`} className="block relative pt-4 px-4 bg-slate-50/50 group-hover:bg-slate-100/60 transition-colors">
        <div className="relative w-full h-44 sm:h-48 flex items-center justify-center overflow-hidden">
          <Image
            src={car.image_url}
            alt={`${car.brand} ${car.model}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </Link>

      {/* Car Info & Specs */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/mobil/${car.slug}`} className="block group-hover:text-brand-navy-light transition-colors">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              {car.brand} {car.model}
            </h3>
          </Link>

          {/* Specs Row with Line Icons */}
          <div className="flex items-center gap-3.5 mt-2.5 text-xs font-medium text-slate-500">
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

        {/* Price and CTA Button */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-medium text-slate-400 block leading-tight">
              Mulai dari
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base sm:text-lg font-extrabold text-slate-900">
                {formattedPrice}
              </span>
              <span className="text-xs text-slate-500 font-normal">
                / hari
              </span>
            </div>
          </div>

          {showSelectButton && (
            <div>
              {onSelectCar ? (
                <button
                  type="button"
                  onClick={() => onSelectCar(car)}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navy-light active:scale-95 transition-all shadow-sm"
                >
                  Pilih
                </button>
              ) : (
                <Link
                  href={`/#booking?car=${car.id}`}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navy-light inline-block active:scale-95 transition-all shadow-sm text-center"
                >
                  Pilih
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
