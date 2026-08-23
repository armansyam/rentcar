'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UsersIcon, CogIcon, FuelIcon, HeartIcon } from '@/components/ui/Icons';

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
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(car.price_per_day);

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 overflow-hidden card-shadow hover:card-shadow-hover hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      {/* Image Container with Badge */}
      <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
        <Link href={`/mobil/${car.slug}`} className="block w-full h-full relative">
          <Image
            src={car.image_url}
            alt={`${car.brand} ${car.model}`}
            fill
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none">
          <span className="bg-brand-navy/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            {car.category}
          </span>
          {car.plate_number && (
            <span className="bg-slate-900/90 text-amber-300 font-mono text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-white/20 shadow-xs tracking-wider">
              {car.plate_number}
            </span>
          )}
        </div>
      </div>

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
