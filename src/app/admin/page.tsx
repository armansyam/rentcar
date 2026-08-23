import React from 'react';
import Link from 'next/link';
import db from '@/lib/db';
import { CarIcon, FileTextIcon, WhatsAppIcon, ChevronRightIcon, PlusIcon } from '@/components/ui/Icons';

export const dynamic = 'force-dynamic';

export default function AdminOverviewPage() {
  const totalCars = (db.prepare('SELECT COUNT(*) as count FROM cars').get() as any).count;
  const activeCars = (db.prepare("SELECT COUNT(*) as count FROM cars WHERE status = 'active'").get() as any).count;
  const newInquiries = (db.prepare("SELECT COUNT(*) as count FROM inquiries WHERE status IN ('NEW', 'CHECKING', 'AVAILABLE')").get() as any).count;
  const confirmedBookings = (db.prepare("SELECT COUNT(*) as count FROM inquiries WHERE status = 'CONFIRMED'").get() as any).count;
  const activeRentals = (db.prepare("SELECT COUNT(*) as count FROM inquiries WHERE status = 'ACTIVE_RENTAL'").get() as any).count;

  const recentInquiries = db
    .prepare('SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 6')
    .all() as any[];

  const statusColors: Record<string, string> = {
    NEW: 'bg-blue-100 text-blue-700 border-blue-200',
    CHECKING: 'bg-amber-100 text-amber-700 border-amber-200',
    AVAILABLE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    NOT_AVAILABLE: 'bg-rose-100 text-rose-700 border-rose-200',
    CONFIRMED: 'bg-purple-100 text-purple-700 border-purple-200',
    ACTIVE_RENTAL: 'bg-emerald-600 text-white border-emerald-700',
    COMPLETED: 'bg-slate-100 text-slate-700 border-slate-200',
    CANCELLED: 'bg-gray-100 text-gray-500 border-gray-200',
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Utama
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ringkasan performa inquiry, booking terjadwal, dan pemantauan mobil yang sedang disewa.
          </p>
        </div>

        <Link
          href="/admin/mobil"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-bold transition-all shadow-sm active:scale-98"
        >
          <PlusIcon size={16} />
          <span>Tambah Mobil Baru</span>
        </Link>
      </div>

      {/* 4 Overview Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Armada */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 card-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Armada
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CarIcon size={18} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
            {totalCars}
          </p>
          <span className="text-[11px] font-medium text-emerald-600 mt-1 block">
            {activeCars} Unit Siap Disewa
          </span>
        </div>

        {/* Card 2: Tahap 1 Inquiry Masuk */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 card-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Inquiry Masuk
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileTextIcon size={18} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
            {newInquiries}
          </p>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">
            Tanya ketersediaan & negosiasi
          </span>
        </div>

        {/* Card 3: Tahap 2 Booking Terjadwal */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 card-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Booking Terjadwal
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <WhatsAppIcon size={18} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
            {confirmedBookings}
          </p>
          <span className="text-[11px] font-medium text-purple-600 mt-1 block font-semibold">
            Sudah DP & verifikasi KTP
          </span>
        </div>

        {/* Card 4: Tahap 3 Sedang Disewa (Aktif) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 card-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Sedang Disewa (Aktif)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-3">
            {activeRentals}
          </p>
          <span className="text-[11px] font-medium text-emerald-600 mt-1 block font-semibold">
            Mobil di jalan & pantau jam kembali
          </span>
        </div>
      </div>

      {/* Recent Inquiries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 card-shadow overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Inquiry Terbaru dari Website
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar calon pelanggan yang mengajukan ketersediaan sewa mobil.
            </p>
          </div>
          <Link
            href="/admin/inquiry"
            className="text-xs font-bold text-brand-navy hover:underline flex items-center gap-1"
          >
            <span>Semua Inquiry</span>
            <ChevronRightIcon size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="px-5 py-3.5">Invoice</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Armada</th>
                <th className="px-5 py-3.5">Tanggal Sewa</th>
                <th className="px-5 py-3.5">Lokasi</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentInquiries.length > 0 ? (
                recentInquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-brand-navy">
                      {inq.invoice_no}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{inq.customer_name}</div>
                      <div className="text-slate-500 text-xs">{inq.customer_phone}</div>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-800">
                      {inq.car_name}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <div>{inq.start_date} – {inq.end_date}</div>
                      <div className="text-[11px] text-slate-400">({inq.duration_days} hari)</div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 text-xs max-w-[180px] truncate">
                      {inq.pickup_location}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          statusColors[inq.status] || 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {inq.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <a
                        href={`https://wa.me/${inq.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Halo Kak ${inq.customer_name}, terima kasih telah menghubungi RentCar terkait ketersediaan mobil ${inq.car_name} tanggal ${inq.start_date}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold text-xs transition-colors"
                      >
                        <WhatsAppIcon size={14} className="text-brand-green-wa" />
                        <span>Chat WA</span>
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    Belum ada inquiry yang masuk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
