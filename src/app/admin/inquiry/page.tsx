'use client';

import React, { useState, useEffect } from 'react';
import {
  FileTextIcon,
  WhatsAppIcon,
  TrashIcon,
  CalendarIcon,
  MapPinIcon,
  XIcon,
  CheckIcon,
  CarIcon,
} from '@/components/ui/Icons';

type TabType = 'inquiry' | 'booking' | 'active' | 'history';

const PAYMENT_METHODS = [
  'Transfer BCA',
  'Transfer Mandiri',
  'Transfer BRI',
  'Transfer BNI',
  'QRIS',
  'Cash / Tunai',
  'E-Wallet (GoPay/OVO/Dana)',
];

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('inquiry');
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Modals
  const [confirmModalItem, setConfirmModalItem] = useState<any | null>(null);
  const [handoverModalItem, setHandoverModalItem] = useState<any | null>(null);
  const [returnModalItem, setReturnModalItem] = useState<any | null>(null);

  // Form states for Modal 1 (Confirm DP)
  const [dpAmount, setDpAmount] = useState<number>(200000);
  const [paymentMethodDp, setPaymentMethodDp] = useState<string>('Transfer BCA');
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<string>('DP_PAID');

  // Form states for Modal 2 (Handover & Pelunasan)
  const [finalPaymentAmount, setFinalPaymentAmount] = useState<number>(0);
  const [paymentMethodFinal, setPaymentMethodFinal] = useState<string>('Transfer BCA');
  const [odometerStart, setOdometerStart] = useState<number>(45000);

  // Form states for Modal 3 (Return & Overtime/Charges)
  const [odometerEnd, setOdometerEnd] = useState<number>(45350);
  const [overtimeHours, setOvertimeHours] = useState<number>(0);
  const [overtimeRatePerHour, setOvertimeRatePerHour] = useState<number>(50000);
  const [fuelCharge, setFuelCharge] = useState<number>(0);
  const [damageCharge, setDamageCharge] = useState<number>(0);
  const [adminNotes, setAdminNotes] = useState<string>('');

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inquiries');
      const data = await res.json();
      if (data.success) {
        setInquiries(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleUpdate = async (id: string, updates: Record<string, any>) => {
    try {
      await fetch(`/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      fetchInquiries();
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry({ ...selectedInquiry, ...updates });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteInquiry = async (id: string, invoiceNo: string) => {
    if (!confirm(`Hapus data ${invoiceNo}?`)) return;
    try {
      await fetch(`/api/inquiries/${id}`, { method: 'DELETE' });
      fetchInquiries();
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 1. Action: Convert Inquiry to Confirmed Booking (DP)
  const openConfirmModal = (item: any) => {
    setConfirmModalItem(item);
    setDpAmount(item.dp_amount || 200000);
    setPaymentMethodDp(item.payment_method_dp || 'Transfer BCA');
    setTotalPrice(item.total_price || item.duration_days * 350000);
    setPaymentStatus('DP_PAID');
    setAdminNotes(item.notes_admin || 'DP telah diterima, verifikasi e-KTP & SIM A berhasil.');
  };

  const submitConfirmBooking = async () => {
    if (!confirmModalItem) return;
    await handleUpdate(confirmModalItem.id, {
      status: 'CONFIRMED',
      dp_amount: Number(dpAmount),
      payment_method_dp: paymentMethodDp,
      total_price: Number(totalPrice),
      payment_status: paymentStatus,
      notes_admin: adminNotes,
    });
    setConfirmModalItem(null);
    setActiveTab('booking');
  };

  // 2. Action: Handover car (Mulai Sewa / Pelunasan Sisa)
  const openHandoverModal = (item: any) => {
    setHandoverModalItem(item);
    const remaining = Math.max(0, (item.total_price || item.duration_days * 350000) - (item.dp_amount || 0));
    setFinalPaymentAmount(remaining);
    setPaymentMethodFinal(item.payment_method_final || 'Transfer BCA');
    setOdometerStart(item.odometer_start || 45000);
    setAdminNotes(item.notes_admin || 'Kunci & STNK diserahkan. Sisa pembayaran sewa telah dilunasi.');
  };

  const submitHandover = async () => {
    if (!handoverModalItem) return;
    await handleUpdate(handoverModalItem.id, {
      status: 'ACTIVE_RENTAL',
      payment_method_final: paymentMethodFinal,
      payment_status: 'FULLY_PAID',
      odometer_start: Number(odometerStart),
      notes_admin: adminNotes,
    });
    setHandoverModalItem(null);
    setActiveTab('active');
  };

  // 3. Action: Return car (Pengembalian / Selesai)
  const openReturnModal = (item: any) => {
    setReturnModalItem(item);
    setOdometerEnd(item.odometer_end || (item.odometer_start ? item.odometer_start + 250 : 45250));
    
    // Auto-calculate suggested overtime hours if past due date
    const timeStatus = getRentalTimeStatus(item.end_date);
    const suggestedOvertime = timeStatus.status === 'OVERDUE' ? timeStatus.overdueHours : (item.overtime_hours || 0);
    setOvertimeHours(suggestedOvertime);
    setOvertimeRatePerHour(50000);
    setFuelCharge(item.fuel_charge || 0);
    setDamageCharge(item.damage_charge || 0);
    setAdminNotes(
      timeStatus.status === 'OVERDUE'
        ? `Mobil terlambat ${Math.abs(timeStatus.daysDiff)} hari dari jadwal sewa. Denda keterlambatan telah dicatat.`
        : 'Mobil kembali dalam kondisi baik dan tepat waktu.'
    );
  };

  const calculatedOvertimeFee = overtimeHours * overtimeRatePerHour;
  const totalExtraCharges = calculatedOvertimeFee + fuelCharge + damageCharge;

  const submitReturn = async () => {
    if (!returnModalItem) return;
    await handleUpdate(returnModalItem.id, {
      status: 'COMPLETED',
      odometer_end: Number(odometerEnd),
      overtime_hours: Number(overtimeHours),
      overtime_fee: Number(calculatedOvertimeFee),
      fuel_charge: Number(fuelCharge),
      damage_charge: Number(damageCharge),
      notes_admin: adminNotes,
      actual_return_date: new Date().toLocaleDateString('id-ID'),
    });
    setReturnModalItem(null);
    setActiveTab('history');
  };

  // Helper to copy structured WA receipt
  const copyInvoiceText = (item: any) => {
    const totalSewa = item.total_price || 0;
    const dpMasuk = item.dp_amount || 0;
    const sisaSewa = Math.max(0, totalSewa - dpMasuk);
    const totalDenda = (item.overtime_fee || 0) + (item.fuel_charge || 0) + (item.damage_charge || 0);

    let text = `*RINCIAN TRANSAKSI SEWA MOBIL — RENTCAR*
----------------------------------------
📄 *No. Invoice*   : ${item.invoice_no}
👤 *Nama Penyewa*  : ${item.customer_name}
🚗 *Unit Kendaraan* : ${item.car_name}
📅 *Jadwal Sewa*    : ${item.start_date} s/d ${item.end_date} (${item.duration_days} Hari)
📍 *Titik Ambil*    : ${item.pickup_location}

💰 *RINCIAN PEMBAYARAN:*
• Total Biaya Sewa : Rp ${totalSewa.toLocaleString('id-ID')}
• Pembayaran DP    : Rp ${dpMasuk.toLocaleString('id-ID')} (${item.payment_method_dp || 'Transfer'})
• Sisa Pelunasan   : Rp ${sisaSewa.toLocaleString('id-ID')} (${item.payment_status === 'FULLY_PAID' ? 'LUNAS' : 'Dibayar saat serah terima kunci'})
• Status Bayar     : ${item.payment_status === 'FULLY_PAID' ? '✅ LUNAS PENUH' : '⏳ DP DITERIMA'}`;

    if (totalDenda > 0) {
      text += `\n\n⚠️ *TAGIHAN BIAYA TAMBAHAN (DENDA/CHARGE):*
${item.overtime_fee > 0 ? `• Denda Overtime (${item.overtime_hours} Jam) : Rp ${item.overtime_fee.toLocaleString('id-ID')}\n` : ''}${item.fuel_charge > 0 ? `• Charge Kurang Bensin : Rp ${item.fuel_charge.toLocaleString('id-ID')}\n` : ''}${item.damage_charge > 0 ? `• Charge Klaim Kerusakan : Rp ${item.damage_charge.toLocaleString('id-ID')}\n` : ''}👉 *Total Tagihan Tambahan : Rp ${totalDenda.toLocaleString('id-ID')}*`;
    }

    text += `\n\nTerima kasih telah mempercayakan perjalanan Anda bersama RentCar!`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  // Helper to calculate countdown / overdue status for active rentals
  const getRentalTimeStatus = (endDateStr: string) => {
    if (!endDateStr) return { status: 'NORMAL', label: 'Jadwal Normal', daysDiff: 0, overdueHours: 0 };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Parse date (supports YYYY-MM-DD or DD/MM/YYYY)
    let end: Date;
    if (endDateStr.includes('/')) {
      const parts = endDateStr.split('/');
      end = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    } else {
      end = new Date(endDateStr);
    }
    end.setHours(0, 0, 0, 0);
    
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      const overdueDays = Math.abs(diffDays);
      return {
        status: 'OVERDUE',
        label: `🚨 Terlambat ${overdueDays} Hari`,
        daysDiff: diffDays,
        overdueHours: overdueDays * 24,
      };
    } else if (diffDays === 0) {
      return {
        status: 'TODAY',
        label: '⏳ Harus Kembali Hari Ini',
        daysDiff: 0,
        overdueHours: 0,
      };
    } else {
      return {
        status: 'ACTIVE',
        label: `🟢 Sisa ${diffDays} Hari`,
        daysDiff: diffDays,
        overdueHours: 0,
      };
    }
  };

  // Categorize inquiries per tab
  const inquiryList = inquiries.filter((inq) =>
    ['NEW', 'CHECKING', 'AVAILABLE', 'NOT_AVAILABLE'].includes(inq.status)
  );
  const bookingList = inquiries.filter((inq) => inq.status === 'CONFIRMED');
  const activeList = inquiries.filter((inq) => inq.status === 'ACTIVE_RENTAL');
  const historyList = inquiries.filter((inq) =>
    ['COMPLETED', 'CANCELLED'].includes(inq.status)
  );

  // List of overdue rentals in Tab 3
  const overdueActiveList = activeList.filter(
    (inq) => getRentalTimeStatus(inq.end_date).status === 'OVERDUE'
  );

  const getDisplayedList = () => {
    switch (activeTab) {
      case 'inquiry':
        return inquiryList;
      case 'booking':
        return bookingList;
      case 'active':
        return activeList;
      case 'history':
        return historyList;
      default:
        return inquiries;
    }
  };

  const displayedList = getDisplayedList();

  const statusBadge = (status: string, timeStatus?: any) => {
    if (status === 'ACTIVE_RENTAL' && timeStatus?.status === 'OVERDUE') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-600 text-white border border-rose-700 animate-pulse tracking-wide shadow-sm">
          🚨 {timeStatus.label}
        </span>
      );
    }
    if (status === 'ACTIVE_RENTAL' && timeStatus?.status === 'TODAY') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white border border-amber-600 tracking-wide">
          ⏳ Kembali Hari Ini
        </span>
      );
    }
    switch (status) {
      case 'NEW':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Inquiry Baru</span>;
      case 'CHECKING':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Cek Jadwal</span>;
      case 'AVAILABLE':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Mobil Tersedia</span>;
      case 'NOT_AVAILABLE':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">Penuh / Tidak Tersedia</span>;
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">Booking Dikonfirmasi (DP)</span>;
      case 'ACTIVE_RENTAL':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white border border-emerald-700 animate-pulse">Sedang Berjalan (On Trip)</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">Selesai & Lunas</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-500 border border-gray-200">Dibatalkan</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Manajemen Sewa & Inquiry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Input pembayaran DP, pelunasan, uang jaminan deposit, pantau notifikasi overtime, dan kirim rincian ke WhatsApp customer.
          </p>
        </div>
      </div>

      {/* OVERDUE ALERT BANNER */}
      {overdueActiveList.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg animate-pulse">
          <div className="flex items-start sm:items-center gap-3.5">
            <span className="text-3xl sm:text-4xl shrink-0">🚨</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-rose-900">
                  PERINGATAN OVERTIME: {overdueActiveList.length} Mobil Melewati Batas Waktu Pengembalian!
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-rose-700 mt-0.5">
                Unit belum dikembalikan sesuai jadwal sewa. Segera hubungi penyewa via WhatsApp atau cek posisi GPS mobil.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shrink-0 shadow-md transition-all active:scale-98 cursor-pointer"
          >
            Lihat Unit Overtime ({overdueActiveList.length})
          </button>
        </div>
      )}

      {copiedText && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckIcon size={16} className="text-emerald-600" />
          <span>Teks Rincian Tagihan berhasil disalin! Tinggal Paste di chat WhatsApp customer.</span>
        </div>
      )}

      {/* 4-Stage Main Navigation Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        {/* Tab 1: Inquiry */}
        <button
          type="button"
          onClick={() => setActiveTab('inquiry')}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
            activeTab === 'inquiry'
              ? 'bg-brand-navy text-white border-brand-navy shadow-md ring-2 ring-brand-navy/20'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Tahap 1</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                activeTab === 'inquiry' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
              }`}
            >
              {inquiryList.length}
            </span>
          </div>
          <div className="font-extrabold text-sm sm:text-base">Inquiry Masuk</div>
          <p className={`text-[11px] mt-0.5 truncate ${activeTab === 'inquiry' ? 'text-slate-300' : 'text-slate-500'}`}>
            Tanya jadwal & ketersediaan
          </p>
        </button>

        {/* Tab 2: Booking Terjadwal */}
        <button
          type="button"
          onClick={() => setActiveTab('booking')}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
            activeTab === 'booking'
              ? 'bg-purple-900 text-white border-purple-900 shadow-md ring-2 ring-purple-900/20'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Tahap 2</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                activeTab === 'booking' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'
              }`}
            >
              {bookingList.length}
            </span>
          </div>
          <div className="font-extrabold text-sm sm:text-base">Booking Terjadwal</div>
          <p className={`text-[11px] mt-0.5 truncate ${activeTab === 'booking' ? 'text-purple-200' : 'text-slate-500'}`}>
            DP Masuk & KTP terverifikasi
          </p>
        </button>

        {/* Tab 3: Sedang Disewa (Aktif) */}
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
            activeTab === 'active'
              ? overdueActiveList.length > 0
                ? 'bg-rose-900 text-white border-rose-900 shadow-md ring-2 ring-rose-500/40'
                : 'bg-emerald-800 text-white border-emerald-800 shadow-md ring-2 ring-emerald-800/20'
              : overdueActiveList.length > 0
              ? 'bg-rose-50 text-rose-900 border-rose-300 hover:bg-rose-100'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Tahap 3</span>
            <div className="flex items-center gap-1">
              {overdueActiveList.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                  🚨 {overdueActiveList.length} Overdue
                </span>
              )}
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                  activeTab === 'active' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {activeList.length}
              </span>
            </div>
          </div>
          <div className="font-extrabold text-sm sm:text-base flex items-center gap-1.5">
            <span>Sedang Disewa</span>
            {activeList.length > 0 && (
              <span className={`w-2 h-2 rounded-full ${overdueActiveList.length > 0 ? 'bg-rose-400' : 'bg-emerald-400'} animate-ping`} />
            )}
          </div>
          <p className={`text-[11px] mt-0.5 truncate ${activeTab === 'active' ? 'text-white/80' : 'text-slate-500'}`}>
            {overdueActiveList.length > 0 ? '⚠️ Ada mobil melewati batas!' : 'Mobil di jalan & pantau jam'}
          </p>
        </button>

        {/* Tab 4: Riwayat Selesai */}
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
            activeTab === 'history'
              ? 'bg-slate-800 text-white border-slate-800 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Arsip</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                activeTab === 'history' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {historyList.length}
            </span>
          </div>
          <div className="font-extrabold text-sm sm:text-base">Riwayat Selesai</div>
          <p className={`text-[11px] mt-0.5 truncate ${activeTab === 'history' ? 'text-slate-300' : 'text-slate-500'}`}>
            Lunas & arsip transaksi selesai
          </p>
        </button>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-2xl border border-slate-200 card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="px-5 py-3.5">Invoice & Penyewa</th>
                <th className="px-5 py-3.5">Unit Mobil</th>
                <th className="px-5 py-3.5">Jadwal Sewa</th>
                {activeTab === 'inquiry' && <th className="px-5 py-3.5">Estimasi Biaya</th>}
                {activeTab === 'booking' && <th className="px-5 py-3.5">DP & Metode Bayar</th>}
                {activeTab === 'active' && <th className="px-5 py-3.5">Pelunasan Sisa & KM</th>}
                {activeTab === 'history' && <th className="px-5 py-3.5">Total Sewa & Denda</th>}
                <th className="px-5 py-3.5">Status & Waktu</th>
                <th className="px-5 py-3.5 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    Tidak ada data pada tab ini.
                  </td>
                </tr>
              ) : (
                displayedList.map((item) => {
                  const timeStatus = activeTab === 'active' ? getRentalTimeStatus(item.end_date) : null;
                  const isOverdue = timeStatus?.status === 'OVERDUE';
                  const isToday = timeStatus?.status === 'TODAY';

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isOverdue
                          ? 'bg-rose-50/90 border-l-4 border-l-rose-500 hover:bg-rose-100/90'
                          : isToday
                          ? 'bg-amber-50/60 border-l-4 border-l-amber-500 hover:bg-amber-100/70'
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
                      {/* Invoice & Customer */}
                      <td className="px-5 py-4">
                        <div className="font-extrabold text-brand-navy font-mono text-xs">
                          {item.invoice_no}
                        </div>
                        <div className="font-bold text-slate-900 mt-0.5">{item.customer_name}</div>
                        <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                          <WhatsAppIcon size={13} className="text-brand-green-wa" />
                          <span>{item.customer_phone}</span>
                        </div>
                      </td>

                      {/* Car Name & Destination */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <CarIcon size={15} className="text-slate-500" />
                          <span>{item.car_name}</span>
                        </div>
                        <div className="text-slate-500 text-xs mt-0.5">
                          Tujuan: {item.destination || 'Dalam Kota'}
                        </div>
                      </td>

                      {/* Date Schedule */}
                      <td className="px-5 py-4 text-xs">
                        <div className="font-bold text-slate-800">
                          {item.start_date} &rarr; {item.end_date}
                        </div>
                        <div className="text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span>Durasi: <strong className="text-slate-700">{item.duration_days} Hari</strong></span>
                          {timeStatus && (
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              isOverdue
                                ? 'bg-rose-200 text-rose-800 animate-pulse'
                                : isToday
                                ? 'bg-amber-200 text-amber-900 font-bold'
                                : 'bg-emerald-100 text-emerald-800 font-semibold'
                            }`}>
                              {timeStatus.label}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Tab 1: Estimasi Biaya */}
                      {activeTab === 'inquiry' && (
                        <td className="px-5 py-4 text-xs">
                          <div className="font-bold text-slate-900">
                            Rp {(item.total_price || item.duration_days * 350000).toLocaleString('id-ID')}
                          </div>
                          <div className="text-slate-400 text-[11px]">Belum bayar DP</div>
                        </td>
                      )}

                      {/* Tab 2: DP Column */}
                      {activeTab === 'booking' && (
                        <td className="px-5 py-4 text-xs">
                          <div className="font-bold text-purple-700">
                            DP: Rp {(item.dp_amount || 200000).toLocaleString('id-ID')}
                          </div>
                          <span className="inline-block px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-semibold mt-0.5 border border-purple-200">
                            {item.payment_method_dp || 'Transfer BCA'}
                          </span>
                          <div className="text-slate-500 text-[11px] mt-0.5">
                            Total Sewa: Rp {(item.total_price || 0).toLocaleString('id-ID')}
                          </div>
                        </td>
                      )}

                      {/* Tab 3: Pelunasan & KM Column */}
                      {activeTab === 'active' && (
                        <td className="px-5 py-4 text-xs">
                          <div className="font-bold text-emerald-700">
                            Pelunasan: Rp {Math.max(0, (item.total_price || 0) - (item.dp_amount || 0)).toLocaleString('id-ID')}
                          </div>
                          <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold mt-0.5 border border-emerald-200">
                            {item.payment_method_final || item.payment_method_dp || 'Transfer'}
                          </span>
                          <div className="text-slate-500 text-[11px] mt-0.5">
                            KM Awal: {item.odometer_start ? item.odometer_start.toLocaleString('id-ID') : '-'} KM
                          </div>
                        </td>
                      )}

                      {/* Tab 4: History Denda Column */}
                      {activeTab === 'history' && (
                        <td className="px-5 py-4 text-xs">
                          <div className="font-semibold text-slate-700">
                            {item.actual_return_date ? `Kembali: ${item.actual_return_date}` : 'Selesai'}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Total Sewa: <span className="font-bold text-slate-900">Rp {(item.total_price || 0).toLocaleString('id-ID')}</span>
                          </div>
                          {(item.overtime_fee > 0 || item.fuel_charge > 0 || item.damage_charge > 0) && (
                            <div className="text-rose-600 font-bold text-[11px] mt-0.5">
                              Tagihan Denda: Rp {((item.overtime_fee || 0) + (item.fuel_charge || 0) + (item.damage_charge || 0)).toLocaleString('id-ID')}
                            </div>
                          )}
                        </td>
                      )}

                      {/* Status Badge */}
                      <td className="px-5 py-4">
                        {statusBadge(item.status, timeStatus)}
                      </td>

                    {/* Operational Action Buttons */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Copy WA Breakdown Text */}
                        <button
                          type="button"
                          onClick={() => copyInvoiceText(item)}
                          className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                          title="Salin Rincian Tagihan untuk WA"
                        >
                          <FileTextIcon size={16} />
                        </button>

                        {/* WhatsApp Direct Chat Link */}
                        <a
                          href={`https://wa.me/${item.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Halo Kak ${item.customer_name}, perihal pemesanan ${item.car_name} (${item.invoice_no}) di RentCar:`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                          title="Chat WhatsApp"
                        >
                          <WhatsAppIcon size={16} />
                        </a>

                        {/* Stage 1 Button: Upgrade to Booking */}
                        {activeTab === 'inquiry' && (
                          <button
                            type="button"
                            onClick={() => openConfirmModal(item)}
                            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
                          >
                            Input DP & Konfirmasi
                          </button>
                        )}

                        {/* Stage 2 Button: Handover Key & Pelunasan */}
                        {activeTab === 'booking' && (
                          <button
                            type="button"
                            onClick={() => openHandoverModal(item)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
                          >
                            Serah Terima & Pelunasan
                          </button>
                        )}

                        {/* Stage 3 Button: Process Return */}
                        {activeTab === 'active' && (
                          <button
                            type="button"
                            onClick={() => openReturnModal(item)}
                            className="px-3 py-1.5 rounded-xl bg-brand-navy hover:bg-brand-navy-light text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
                          >
                            Hitung Denda & Selesai
                          </button>
                        )}

                        {/* View Details */}
                        <button
                          type="button"
                          onClick={() => setSelectedInquiry(item)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                          title="Lihat Detail"
                        >
                          Detail
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDeleteInquiry(item.id, item.invoice_no)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Hapus"
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: Input DP & Konfirmasi Booking (Tahap 1 -> Tahap 2)               */}
      {/* ========================================================================= */}
      {confirmModalItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  Input DP & Konfirmasi Booking
                </h3>
                <p className="text-xs text-slate-500">
                  {confirmModalItem.invoice_no} — {confirmModalItem.customer_name} ({confirmModalItem.car_name})
                </p>
              </div>
              <button
                onClick={() => setConfirmModalItem(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <XIcon size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Biaya Sewa (Rp)</label>
                  <input
                    type="number"
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Pembayaran</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800"
                  >
                    <option value="DP_PAID">DP Diterima (Belum Lunas)</option>
                    <option value="FULLY_PAID">Lunas Penuh (Tanpa DP)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nominal DP Diterima (Rp)</label>
                  <input
                    type="number"
                    value={dpAmount}
                    onChange={(e) => setDpAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Metode Pembayaran DP</label>
                  <select
                    value={paymentMethodDp}
                    onChange={(e) => setPaymentMethodDp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Rekapitulasi Pembayaran Interaktif di Modal 1 */}
              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 space-y-1.5 text-xs text-purple-950">
                <div className="font-extrabold text-xs uppercase tracking-wider text-purple-900 mb-1">
                  💡 Ringkasan Perhitungan Pembayaran:
                </div>
                <div className="flex justify-between">
                  <span>Total Biaya Sewa:</span>
                  <span className="font-bold">Rp {totalPrice.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>DP Diterima ({paymentMethodDp}):</span>
                  <span className="font-bold text-purple-700">- Rp {dpAmount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-purple-200/70 font-black text-sm text-purple-900">
                  <span>👉 Sisa Pelunasan saat Ambil Kunci:</span>
                  <span className="text-purple-700">
                    Rp {Math.max(0, totalPrice - dpAmount).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Verifikasi KTP / Bukti Transfer</label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Contoh: Bukti transfer DP terverifikasi. KTP dan SIM A sudah dicek."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmModalItem(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={submitConfirmBooking}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm cursor-pointer"
              >
                Simpan & Jadikan Booking Terjadwal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Serah Terima Kunci & Pelunasan Sisa (Tahap 2 -> Tahap 3)          */}
      {/* ========================================================================= */}
      {handoverModalItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  Serah Terima Kunci & Pelunasan Sewa
                </h3>
                <p className="text-xs text-slate-500">
                  {handoverModalItem.invoice_no} — {handoverModalItem.car_name} ({handoverModalItem.customer_name})
                </p>
              </div>
              <button
                onClick={() => setHandoverModalItem(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <XIcon size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pelunasan Sisa Sewa (Rp)</label>
                  <input
                    type="number"
                    value={finalPaymentAmount}
                    onChange={(e) => setFinalPaymentAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Metode Pelunasan Sewa</label>
                  <select
                    value={paymentMethodFinal}
                    onChange={(e) => setPaymentMethodFinal(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kilometer (KM) Odometer Awal</label>
                <input
                  type="number"
                  value={odometerStart}
                  onChange={(e) => setOdometerStart(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan BAST Serah Terima Fisik</label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Contoh: Bensin posisi 4/4 bar, STNK asli diserahkan, kondisi fisik mulus."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <CheckIcon size={18} className="text-emerald-600 shrink-0" />
                <span>Pelunasan sisa sewa sebesar <strong>Rp {finalPaymentAmount.toLocaleString('id-ID')}</strong> akan menandai status sewa menjadi <strong>LUNAS PENUH</strong>.</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setHandoverModalItem(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={submitHandover}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer"
              >
                Serah Terima & Mulai Sewa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: Hitung Denda, Charge, & Selesai (Tahap 3 -> Tahap 4)             */}
      {/* ========================================================================= */}
      {returnModalItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  Pengembalian Mobil & Kalkulasi Denda
                </h3>
                <p className="text-xs text-slate-500">
                  {returnModalItem.invoice_no} — {returnModalItem.car_name} ({returnModalItem.customer_name})
                </p>
              </div>
              <button
                onClick={() => setReturnModalItem(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <XIcon size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">KM Akhir Odometer</label>
                  <input
                    type="number"
                    value={odometerEnd}
                    onChange={(e) => setOdometerEnd(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Keterlambatan (Jam)</label>
                  <input
                    type="number"
                    value={overtimeHours}
                    onChange={(e) => setOvertimeHours(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-[11px]">Tarif Overtime/Jam</label>
                  <input
                    type="number"
                    value={overtimeRatePerHour}
                    onChange={(e) => setOvertimeRatePerHour(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-[11px]">Charge Bensin (Rp)</label>
                  <input
                    type="number"
                    value={fuelCharge}
                    onChange={(e) => setFuelCharge(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-[11px]">Charge Klaim/Baret (Rp)</label>
                  <input
                    type="number"
                    value={damageCharge}
                    onChange={(e) => setDamageCharge(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs"
                  />
                </div>
              </div>

              {/* Kalkulasi Ringkasan Denda */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <div className="font-extrabold text-xs uppercase tracking-wider text-slate-700 mb-1">
                  Tagihan Biaya Tambahan:
                </div>
                {calculatedOvertimeFee > 0 && (
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>Denda Overtime ({overtimeHours} Jam):</span>
                    <span>+ Rp {calculatedOvertimeFee.toLocaleString('id-ID')}</span>
                  </div>
                )}
                {fuelCharge > 0 && (
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>Charge Bensin Kurang:</span>
                    <span>+ Rp {fuelCharge.toLocaleString('id-ID')}</span>
                  </div>
                )}
                {damageCharge > 0 && (
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>Charge Klaim Kerusakan / Baret:</span>
                    <span>+ Rp {damageCharge.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-1.5 flex justify-between font-black text-sm text-slate-900">
                  <span>Total Tagihan Tambahan:</span>
                  <span className={totalExtraCharges > 0 ? 'text-rose-600' : 'text-emerald-700'}>
                    {totalExtraCharges > 0 ? `Rp ${totalExtraCharges.toLocaleString('id-ID')}` : 'Rp 0 (Bebas Denda)'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Akhir Transaksi</label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReturnModalItem(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={submitReturn}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-navy hover:bg-brand-navy-light text-white shadow-sm cursor-pointer"
              >
                Selesaikan Transaksi (Status: Selesai)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DETAIL TRANSAKSI LENGKAP & KWITANSI                                 */}
      {/* ========================================================================= */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {selectedInquiry.invoice_no}
                </span>
                <h3 className="font-extrabold text-lg text-slate-900">
                  Detail Transaksi & Pembayaran
                </h3>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <XIcon size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-500 block text-xs">Penyewa</span>
                  <span className="font-bold text-slate-900">{selectedInquiry.customer_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">WhatsApp</span>
                  <span className="font-bold text-slate-900">{selectedInquiry.customer_phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Mobil</span>
                  <span className="font-bold text-slate-900">{selectedInquiry.car_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Durasi</span>
                  <span className="font-bold text-slate-900">{selectedInquiry.duration_days} Hari</span>
                </div>
              </div>

              {/* Rincian Biaya & Metode Bayar */}
              <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-1.5 text-xs">
                <div className="font-bold text-purple-900 text-sm mb-1">Rincian Pembayaran Sewa</div>
                <div className="flex justify-between text-slate-700">
                  <span>Total Biaya Sewa:</span>
                  <span className="font-bold">Rp {(selectedInquiry.total_price || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>DP Diterima ({selectedInquiry.payment_method_dp || 'Transfer'}):</span>
                  <span className="font-bold">Rp {(selectedInquiry.dp_amount || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Pelunasan Sisa ({selectedInquiry.payment_method_final || 'Transfer'}):</span>
                  <span className="font-bold">Rp {Math.max(0, (selectedInquiry.total_price || 0) - (selectedInquiry.dp_amount || 0)).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-purple-800 font-semibold pt-1 border-t border-purple-200/60">
                  <span>Status Pembayaran:</span>
                  <span className="uppercase">{selectedInquiry.payment_status || 'DP_PAID'}</span>
                </div>
              </div>

              {/* Rincian Denda jika ada */}
              {(selectedInquiry.overtime_fee > 0 || selectedInquiry.fuel_charge > 0 || selectedInquiry.damage_charge > 0) && (
                <div className="p-3.5 bg-rose-50/60 rounded-2xl border border-rose-100 space-y-1.5 text-xs">
                  <div className="font-bold text-rose-900 text-sm mb-1">Tagihan Biaya Tambahan</div>
                  {selectedInquiry.overtime_fee > 0 && (
                    <div className="flex justify-between text-rose-600 font-semibold">
                      <span>Denda Overtime ({selectedInquiry.overtime_hours} Jam):</span>
                      <span>Rp {selectedInquiry.overtime_fee.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  {selectedInquiry.fuel_charge > 0 && (
                    <div className="flex justify-between text-rose-600 font-semibold">
                      <span>Charge Bensin Kurang:</span>
                      <span>Rp {selectedInquiry.fuel_charge.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  {selectedInquiry.damage_charge > 0 && (
                    <div className="flex justify-between text-rose-600 font-semibold">
                      <span>Charge Baret / Klaim:</span>
                      <span>Rp {selectedInquiry.damage_charge.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-rose-800 font-black pt-1 border-t border-rose-200">
                    <span>Total Tagihan Tambahan:</span>
                    <span>Rp {((selectedInquiry.overtime_fee || 0) + (selectedInquiry.fuel_charge || 0) + (selectedInquiry.damage_charge || 0)).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              )}

              {selectedInquiry.notes && (
                <div>
                  <span className="text-slate-500 block text-xs">Catatan Customer:</span>
                  <p className="p-2.5 bg-slate-50 rounded-xl text-slate-700 italic text-xs">
                    &ldquo;{selectedInquiry.notes}&rdquo;
                  </p>
                </div>
              )}

              {selectedInquiry.notes_admin && (
                <div>
                  <span className="text-slate-500 block text-xs">Catatan Admin:</span>
                  <p className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-medium">
                    {selectedInquiry.notes_admin}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => copyInvoiceText(selectedInquiry)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <WhatsAppIcon size={14} />
                <span>Salin Rincian untuk WA</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
