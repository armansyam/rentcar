import React from 'react';
import Link from 'next/link';
import db from '@/lib/db';
import {
  CarIcon,
  FileTextIcon,
  WhatsAppIcon,
  ChevronRightIcon,
  PlusIcon,
  ShieldCheckIcon,
  ClockIcon,
} from '@/components/ui/Icons';

export const dynamic = 'force-dynamic';

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AdminOverviewPage() {
  const totalCars = (db.prepare('SELECT COUNT(*) as count FROM cars').get() as any).count || 0;
  const activeCars = (db.prepare("SELECT COUNT(*) as count FROM cars WHERE status = 'active'").get() as any).count || 0;
  const newInquiries = (db.prepare("SELECT COUNT(*) as count FROM inquiries WHERE status = 'NEW'").get() as any).count || 0;
  const confirmedBookings = (db.prepare("SELECT COUNT(*) as count FROM inquiries WHERE status = 'CONFIRMED'").get() as any).count || 0;
  const activeRentals = (db.prepare("SELECT COUNT(*) as count FROM inquiries WHERE status = 'ACTIVE_RENTAL'").get() as any).count || 0;

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

  // Financial estimations
  const totalActiveRevenue = activeRentalsList.reduce((acc, r) => acc + (r.total_price || 0), 0);
  const totalActiveDP = activeRentalsList.reduce((acc, r) => acc + (r.dp_amount || 0), 0);

  // Utilization calculation
  const utilizationRate = totalCars > 0 ? Math.round((activeRentals / totalCars) * 100) : 0;
  const readyUnits = Math.max(0, totalCars - activeRentals);

  // Weekly Trend Generation (Last 7 Days)
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateKey = d.toISOString().split('T')[0];
    const dayLabel = dayNames[d.getDay()];
    const dateFormatted = `${d.getDate()}/${d.getMonth() + 1}`;

    const count = (
      db.prepare("SELECT COUNT(*) as c FROM inquiries WHERE DATE(created_at) = ?").get(dateKey) as any
    )?.c || 0;

    return {
      dateKey,
      dayLabel,
      dateFormatted,
      count,
      isToday: i === 6,
    };
  });

  const maxWeeklyCount = Math.max(...last7DaysData.map((d) => d.count), 4);
  const totalWeeklyInquiries = last7DaysData.reduce((acc, d) => acc + d.count, 0);

  // Top popular cars
  const popularCars = db
    .prepare('SELECT car_name, COUNT(*) as rental_count FROM inquiries GROUP BY car_name ORDER BY rental_count DESC LIMIT 3')
    .all() as any[];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Welcome Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Utama
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ringkasan performa armada, monitoring booking, dan analisis sewa aktif.
          </p>
        </div>

        <Link
          href="/admin/mobil"
          className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-bold transition-all shadow-sm active:scale-98 shrink-0"
        >
          <PlusIcon size={15} />
          <span className="hidden sm:inline">Tambah Mobil Baru</span>
          <span className="sm:hidden">Tambah Mobil</span>
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

      {/* Stats KPI Cards - Sleek 2x2 Grid on Mobile, 4 Cols on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Total Armada */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 card-shadow transition-all hover:border-slate-300 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              Total Armada
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <CarIcon size={16} />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">{totalCars}</div>
            <span className="text-[10px] sm:text-xs font-semibold text-emerald-600 mt-0.5 block truncate">
              {readyUnits} Siap Sewa
            </span>
          </div>
        </div>

        {/* 2. Inquiry Masuk */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 card-shadow transition-all hover:border-slate-300 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              Inquiry Baru
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <FileTextIcon size={16} />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">{newInquiries}</div>
            <span className="text-[10px] sm:text-xs font-semibold text-amber-600 mt-0.5 block truncate">
              Tanya Sewa
            </span>
          </div>
        </div>

        {/* 3. Booking Terjadwal */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 card-shadow transition-all hover:border-slate-300 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              Booking
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <WhatsAppIcon size={16} />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">{confirmedBookings}</div>
            <span className="text-[10px] sm:text-xs font-semibold text-purple-600 mt-0.5 block truncate">
              Dikonfirmasi / DP
            </span>
          </div>
        </div>

        {/* 4. Sedang Disewa */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 card-shadow transition-all hover:border-slate-300 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              Sedang Disewa
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CarIcon size={16} />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">{activeRentals}</div>
            <span className="text-[10px] sm:text-xs font-semibold text-emerald-600 mt-0.5 block truncate">
              Mobil di Jalan
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2-COLUMN ANALYTICS & FLEET MONITOR WIDGET ROW                             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* WIDGET 1: Grafik Aktivitas & Tren Mingguan (7-col on Desktop) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 card-shadow flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>📈 Tren Aktivitas & Inquiry Mingguan</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Frekuensi pesan dan inquiry sewa yang masuk 7 hari terakhir
              </p>
            </div>
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                {totalWeeklyInquiries} Total Masuk
              </span>
            </div>
          </div>

          {/* Interactive CSS Bar Chart */}
          <div className="pt-2 pb-1">
            <div className="h-36 sm:h-40 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-slate-100">
              {last7DaysData.map((d) => {
                const heightPercent = maxWeeklyCount > 0 ? Math.max((d.count / maxWeeklyCount) * 100, 8) : 8;
                return (
                  <div key={d.dateKey} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    {/* Hover Floating Tooltip */}
                    <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-all pointer-events-none bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg whitespace-nowrap z-20">
                      {d.count} Pesan ({d.dateFormatted})
                    </div>

                    {/* Bar Pillar */}
                    <div className="w-full max-w-[36px] bg-slate-100 rounded-t-xl overflow-hidden flex flex-col justify-end h-full">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-xl transition-all duration-500 relative flex items-center justify-center ${
                          d.isToday
                            ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-sm'
                            : d.count > 0
                            ? 'bg-gradient-to-t from-brand-navy to-brand-navy-light'
                            : 'bg-slate-200/80'
                        }`}
                      >
                        {d.count > 0 && (
                          <span className="text-[10px] font-black text-white pb-0.5">
                            {d.count}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Day Label */}
                    <div className="mt-2 text-center">
                      <span className={`text-[10px] font-bold block ${
                        d.isToday ? 'text-emerald-700' : 'text-slate-600'
                      }`}>
                        {d.dayLabel}
                      </span>
                      <span className="text-[9px] text-slate-400 block font-mono">
                        {d.dateFormatted}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Metric Snapshot Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block">Estimasi Nilai Sewa Aktif</span>
              <span className="font-extrabold text-slate-900 text-xs sm:text-sm font-mono block">
                {formatRupiah(totalActiveRevenue)}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block">DP Masuk Terkumpul</span>
              <span className="font-extrabold text-emerald-700 text-xs sm:text-sm font-mono block">
                {formatRupiah(totalActiveDP)}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 block">Status Operasional</span>
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Armada Siap Booking</span>
              </span>
            </div>
          </div>
        </div>

        {/* WIDGET 2: Monitor Utilisasi & Kesiapan Armada (5-col on Desktop) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 card-shadow flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>🚘 Monitor Status Armada</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Kesiapan & posisi operasional mobil rental</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-brand-navy text-white text-[11px] font-black">
              {utilizationRate}% Terpakai
            </span>
          </div>

          {/* Segmented Progress Bar */}
          <div className="space-y-2">
            <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex p-0.5 gap-0.5">
              {/* Ready */}
              <div
                style={{ width: `${totalCars > 0 ? (readyUnits / totalCars) * 100 : 100}%` }}
                className="bg-emerald-500 rounded-full transition-all duration-500"
                title={`${readyUnits} Siap di Garasi`}
              />
              {/* Active */}
              <div
                style={{ width: `${totalCars > 0 ? (activeRentals / totalCars) * 100 : 0}%` }}
                className="bg-blue-600 rounded-full transition-all duration-500"
                title={`${activeRentals} Sedang Disewa`}
              />
              {/* Overdue */}
              {overdueRentals.length > 0 && (
                <div
                  style={{ width: `${totalCars > 0 ? (overdueRentals.length / totalCars) * 100 : 0}%` }}
                  className="bg-rose-500 rounded-full transition-all duration-500"
                  title={`${overdueRentals.length} Melewati Jadwal`}
                />
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-semibold">
              <span>0% Garasi Kosong</span>
              <span>100% Full Booked</span>
            </div>
          </div>

          {/* Status Breakdown List */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-bold text-emerald-950">Unit Siap Sewa (Garasi)</span>
              </div>
              <span className="font-black text-emerald-800 text-sm font-mono">{readyUnits} Unit</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/70 border border-blue-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span className="font-bold text-blue-950">Sedang Digunakan (Jalan)</span>
              </div>
              <span className="font-black text-blue-800 text-sm font-mono">{activeRentals} Unit</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/70 border border-purple-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                <span className="font-bold text-purple-950">Booking Terkonfirmasi</span>
              </div>
              <span className="font-black text-purple-800 text-sm font-mono">{confirmedBookings} Unit</span>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
            <Link
              href="/admin/mobil"
              className="flex-1 py-2 text-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
            >
              Kelola Armada Mobil
            </Link>
            <Link
              href="/admin/inquiry"
              className="flex-1 py-2 text-center rounded-xl bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-bold transition-all shadow-2xs"
            >
              Cek Semua Inquiry
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RECENT INQUIRIES TABLE                                                    */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 card-shadow overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
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
