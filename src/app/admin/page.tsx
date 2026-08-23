import React from 'react';
import Link from 'next/link';
import db from '@/lib/db';
import { CarIcon, FileTextIcon, WhatsAppIcon, ChevronRightIcon, PlusIcon } from '@/components/ui/Icons';

export const dynamic = 'force-dynamic';

export default function AdminOverviewPage() {
  const totalCars = (db.prepare('SELECT COUNT(*) as count FROM cars').get() as any).count;
  const activeCars = (db.prepare("SELECT COUNT(*) as count FROM cars WHERE status = 'active'").get() as any).count;
  const newInquiries = (db.prepare("SELECT COUNT(*) as count FROM inquiries WHERE status = 'NEW'").get() as any).count;
  const confirmedBookings = (db.prepare("SELECT COUNT(*) as count FROM inquiries WHERE status = 'CONFIRMED'").get() as any).count;
  const activeRentals = (db.prepare("SELECT COUNT(*) as count FROM inquiries WHERE status = 'ACTIVE_RENTAL'").get() as any).count;

  const recentInquiries = db
    .prepare('SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 6')
    .all() as any[];

  const statusColors: Record<string, string> = {
    NEW: 'bg-blue-100 text-blue-700 border-blue-200',
    CONFIRMED: 'bg-purple-100 text-purple-700 border-purple-200',
    ACTIVE_RENTAL: 'bg-emerald-600 text-white border-emerald-700',
    COMPLETED: 'bg-slate-100 text-slate-700 border-slate-200',
    CANCELLED: 'bg-rose-100 text-rose-600 border-rose-200',
  };

  const statusLabels: Record<string, string> = {
    NEW: 'Inquiry Baru',
    CONFIRMED: 'Booking Dikonfirmasi',
    ACTIVE_RENTAL: 'Mobil Digunakan',
    COMPLETED: 'Selesai & Arsip',
    CANCELLED: 'Dibatalkan',
  };

  const activeRentalsList = db.prepare("SELECT * FROM inquiries WHERE status = 'ACTIVE_RENTAL'").all() as any[];
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueRentals = activeRentalsList.filter((r) => r.end_date && r.end_date < todayStr);

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

      {/* OVERDUE ALERT BANNER ON DASHBOARD */}
      {overdueRentals.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg animate-pulse">
          <div className="flex items-start sm:items-center gap-3.5">
            <span className="text-3xl sm:text-4xl shrink-0">🚨</span>
            <div>
              <h3 className="font-black text-sm sm:text-base text-rose-900 flex items-center gap-2">
                <span>PERINGATAN: {overdueRentals.length} Mobil Melewati Batas Pengembalian!</span>
              </h3>
              <p className="text-xs text-rose-700 mt-0.5">
                Penyewa belum mengembalikan unit sesuai jadwal. Segera hubungi via WhatsApp atau tindak lanjuti.
              </p>
            </div>
          </div>
          <Link
            href="/admin/inquiry"
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all text-center shrink-0"
          >
            Lihat Unit Overtime ({overdueRentals.length})
          </Link>
        </div>
      )}

      {/* Stats KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 card-shadow flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Total Armada
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalCars}</div>
            <span className="text-[11px] font-semibold text-emerald-600 mt-1 block">
              {activeCars} Unit Siap Disewa
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CarIcon size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 card-shadow flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Inquiry Masuk
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{newInquiries}</div>
            <span className="text-[11px] font-semibold text-amber-600 mt-1 block">
              Tanya ketersediaan & negosiasi
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FileTextIcon size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 card-shadow flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Booking Terjadwal
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{confirmedBookings}</div>
            <span className="text-[11px] font-semibold text-purple-600 mt-1 block">
              Sudah DP & verifikasi KTP
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <WhatsAppIcon size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 card-shadow flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Sedang Disewa (Aktif)
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{activeRentals}</div>
            <span className="text-[11px] font-semibold text-emerald-600 mt-1 block">
              Mobil di jalan & pantau jam kembali
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CarIcon size={24} />
          </div>
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
                <th className="px-5 py-3.5">Penyewa</th>
                <th className="px-5 py-3.5">Armada</th>
                <th className="px-5 py-3.5">Tanggal Sewa</th>
                <th className="px-5 py-3.5">Lokasi / Rute</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentInquiries.length > 0 ? (
                recentInquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{inq.customer_name}</div>
                      <a
                        href={`https://wa.me/${inq.customer_phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 text-xs hover:text-emerald-700 flex items-center gap-1 font-mono transition-colors"
                      >
                        <WhatsAppIcon size={12} className="text-brand-green-wa" />
                        <span>{inq.customer_phone}</span>
                      </a>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {inq.car_name}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <div>{inq.start_date} – {inq.end_date}</div>
                      <div className="text-[11px] text-slate-400 font-medium">({inq.duration_days} hari)</div>
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
                        {statusLabels[inq.status] || inq.status}
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
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
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
