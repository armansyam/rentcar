'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  CarIcon,
  FileTextIcon,
  HomeIcon,
  MenuIcon,
  XIcon,
  ExternalLinkIcon,
  SettingsIcon,
} from '@/components/ui/Icons';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<string>('/images/logo-icon.png');
  const [companyName, setCompanyName] = useState<string>('RentCar');
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          if (data.data.company_logo) setCompanyLogo(data.data.company_logo);
          if (data.data.company_name) setCompanyName(data.data.company_name);
        }
      })
      .catch(() => {});
  }, []);

  // If on login page, render children directly without sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon, exact: true },
    { name: 'Sewa & Inquiry', href: '/admin/inquiry', icon: FileTextIcon, exact: false },
    { name: 'Manajemen Mobil', href: '/admin/mobil', icon: CarIcon, exact: false },
    { name: 'Kelola Konten', href: '/admin/konten', icon: FileTextIcon, exact: false },
    { name: 'Pengaturan & SEO', href: '/admin/pengaturan', icon: SettingsIcon, exact: false },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <div className="md:hidden bg-brand-navy text-white px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/10 relative overflow-hidden shrink-0 flex items-center justify-center p-0.5">
            <img
              src={companyLogo}
              alt="Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/images/logo-icon.png';
              }}
            />
          </div>
          <span className="font-bold text-sm tracking-tight truncate max-w-[200px]">Admin {companyName}</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-slate-300 hover:text-white"
        >
          {sidebarOpen ? <XIcon size={22} /> : <MenuIcon size={22} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-brand-navy text-white flex flex-col justify-between p-5 z-50 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 relative overflow-hidden shrink-0 flex items-center justify-center p-1">
              <img
                src={companyLogo}
                alt={companyName}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/logo-icon.png';
                }}
              />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block truncate max-w-[150px]">
                {companyName.toUpperCase()}
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                Panel Admin Lepas Kunci
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <span>Lihat Website</span>
            <ExternalLinkIcon size={14} />
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            Keluar (Logout)
          </button>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
