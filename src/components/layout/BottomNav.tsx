'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, CarIcon, CalendarIcon, MapPinIcon, InfoIcon } from '@/components/ui/Icons';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Beranda', href: '/', icon: HomeIcon, exact: true },
    { name: 'Mobil', href: '/mobil', icon: CarIcon, exact: false },
    { name: 'Booking', href: '/#booking', icon: CalendarIcon, exact: false },
    { name: 'Lokasi', href: '/lokasi', icon: MapPinIcon, exact: false },
    { name: 'Tentang', href: '/#tentang', icon: InfoIcon, exact: false },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-2 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href) && item.href !== '/';

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-all ${
                isActive
                  ? 'text-brand-navy font-bold'
                  : 'text-slate-500 hover:text-brand-navy font-medium'
              }`}
            >
              <div className={`p-1 rounded-md transition-colors ${isActive ? 'text-brand-navy' : 'text-slate-500'}`}>
                <IconComponent size={20} />
              </div>
              <span className="text-[11px] tracking-tight mt-0.5">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
