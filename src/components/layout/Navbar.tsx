'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CarIcon, MenuIcon, XIcon } from '@/components/ui/Icons';

interface NavbarProps {
  companyName?: string;
  tagline?: string;
}

export default function Navbar({
  companyName = 'RENTCAR',
  tagline = 'Sewa Mobil Terpercaya',
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Beranda', href: '/' },
    { name: 'Mobil', href: '/mobil' },
    { name: 'Cara Sewa', href: '/cara-sewa' },
    { name: 'Tentang Kami', href: '/#tentang' },
    { name: 'Lokasi', href: '/lokasi' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100' : 'bg-white border-b border-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-12 w-44 sm:w-52">
              <Image
                src="/images/logo.png"
                alt="RentCar - Sewa Mobil Terpercaya"
                fill
                priority
                className="object-contain object-left"
              />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-semibold transition-colors ${
                    isActive
                      ? 'text-brand-navy font-bold'
                      : 'text-slate-600 hover:text-brand-navy'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/#booking"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-brand-navy hover:bg-brand-navy-light transition-all shadow-sm active:scale-98"
            >
              Cek Ketersediaan
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-700 hover:text-brand-navy hover:bg-slate-100 transition-colors"
              aria-label="Menu"
            >
              {isOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-700 hover:text-brand-navy hover:bg-slate-50 transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100">
            <Link
              href="/#booking"
              onClick={() => setIsOpen(false)}
              className="w-full inline-flex items-center justify-center px-4 py-3 rounded-lg text-sm font-semibold text-white bg-brand-navy hover:bg-brand-navy-light text-center transition-all shadow-sm"
            >
              Cek Ketersediaan & Booking
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
