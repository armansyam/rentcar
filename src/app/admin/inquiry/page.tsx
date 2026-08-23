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

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('inquiry');
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);

  // Modals
  const [confirmModalItem, setConfirmModalItem] = useState<any | null>(null);
  const [handoverModalItem, setHandoverModalItem] = useState<any | null>(null);
  const [returnModalItem, setReturnModalItem] = useState<any | null>(null);

  // Form states for modals
  const [dpAmount, setDpAmount] = useState<number>(200000);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [depositAmount, setDepositAmount] = useState<number>(500000);
  const [odometerStart, setOdometerStart] = useState<number>(45000);
  const [odometerEnd, setOdometerEnd] = useState<number>(45350);
  const [overtimeHours, setOvertimeHours] = useState<number>(0);
  const [overtimeRatePerHour, setOvertimeRatePerHour] = useState<number>(50000);
  const [deductions, setDeductions] = useState<number>(0);
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

  // 1. Action: Convert Inquiry to Confirmed Booking
  const openConfirmModal = (item: any) => {
    setConfirmModalItem(item);
    setDpAmount(item.dp_amount || 200000);
    setTotalPrice(item.total_price || item.duration_days * 350000);
    setAdminNotes(item.notes_admin || 'DP telah diterima, verifikasi e-KTP & SIM A berhasil.');
  };

  const submitConfirmBooking = async () => {
    if (!confirmModalItem) return;
    await handleUpdate(confirmModalItem.id, {
      status: 'CONFIRMED',
      dp_amount: Number(dpAmount),
      total_price: Number(totalPrice),
      notes_admin: adminNotes,
    });
    setConfirmModalItem(null);
    setActiveTab('booking');
  };

  // 2. Action: Handover car (Mulai Sewa / Active Rental)
  const openHandoverModal = (item: any) => {
    setHandoverModalItem(item);
    setDepositAmount(item.deposit_amount || 500000);
    setOdometerStart(item.odometer_start || 45000);
    setAdminNotes(item.notes_admin || 'Kunci & STNK diserahkan. Uang jaminan ditahan.');
  };

  const submitHandover = async () => {
    if (!handoverModalItem) return;
    await handleUpdate(handoverModalItem.id, {
      status: 'ACTIVE_RENTAL',
      deposit_amount: Number(depositAmount),
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
    setOvertimeHours(item.overtime_hours || 0);
    setOvertimeRatePerHour(50000);
    setDeductions(0);
    setAdminNotes('Mobil kembali dalam kondisi baik. Sisa uang jaminan telah ditransfer balik.');
  };

  const calculatedOvertimeFee = overtimeHours * overtimeRatePerHour;
  const initialDeposit = returnModalItem?.deposit_amount || 500000;
  const refundDepositAmount = Math.max(0, initialDeposit - calculatedOvertimeFee - deductions);

  const submitReturn = async () => {
    if (!returnModalItem) return;
    await handleUpdate(returnModalItem.id, {
      status: 'COMPLETED',
      odometer_end: Number(odometerEnd),
      overtime_hours: Number(overtimeHours),
      overtime_fee: Number(calculatedOvertimeFee),
      notes_admin: adminNotes,
      actual_return_date: new Date().toLocaleDateString('id-ID'),
    });
    setReturnModalItem(null);
    setActiveTab('history');
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

  const statusBadge = (status: string) => {
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Manajemen Sewa & Inquiry
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Pantau seluruh alur transaksi: mulai dari calon penyewa yang bertanya, booking terkonfirmasi, mobil yang sedang jalan, hingga pengembalian unit.
        </p>
      </div>

      {/* 4-Stage Main Navigation Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        {/* Tab 1: Inquiry */}
        <button
          type="button"
          onClick={() => setActiveTab('inquiry')}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all relative ${
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
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all relative ${
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
            Sudah DP & verifikasi KTP
          </p>
        </button>

        {/* Tab 3: Sedang Disewa (Aktif) */}
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all relative ${
            activeTab === 'active'
              ? 'bg-emerald-800 text-white border-emerald-800 shadow-md ring-2 ring-emerald-800/20'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Tahap 3</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                activeTab === 'active' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {activeList.length}
            </span>
          </div>
          <div className="font-extrabold text-sm sm:text-base flex items-center gap-1.5">
            <span>Sedang Disewa</span>
            {activeList.length > 0 && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
          </div>
          <p className={`text-[11px] mt-0.5 truncate ${activeTab === 'active' ? 'text-emerald-200' : 'text-slate-500'}`}>
            Mobil di jalan & pantau jam kembali
          </p>
        </button>

        {/* Tab 4: Riwayat Selesai */}
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all relative ${
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
            Lunas, kembali, & batal
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
                {activeTab === 'booking' && <th className="px-5 py-3.5">DP Masuk</th>}
                {activeTab === 'active' && <th className="px-5 py-3.5">Deposit & KM Awal</th>}
                {activeTab === 'history' && <th className="px-5 py-3.5">Denda & Kembali</th>}
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi Operasional</th>
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
                displayedList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
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
                      <div className="text-slate-500 mt-0.5">
                        Durasi: <span className="font-semibold text-slate-700">{item.duration_days} Hari</span>
                      </div>
                    </td>

                    {/* Tab 2: DP Column */}
                    {activeTab === 'booking' && (
                      <td className="px-5 py-4 text-xs">
                        <div className="font-bold text-purple-700">
                          DP: Rp {item.dp_amount ? item.dp_amount.toLocaleString('id-ID') : '200.000'}
                        </div>
                        <div className="text-slate-500">
                          Total: Rp {item.total_price ? item.total_price.toLocaleString('id-ID') : '-'}
                        </div>
                      </td>
                    )}

                    {/* Tab 3: Deposit & KM Column */}
                    {activeTab === 'active' && (
                      <td className="px-5 py-4 text-xs">
                        <div className="font-bold text-emerald-700">
                          Jaminan: Rp {item.deposit_amount ? item.deposit_amount.toLocaleString('id-ID') : '500.000'}
                        </div>
                        <div className="text-slate-500">
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
                        {item.overtime_fee > 0 && (
                          <div className="text-rose-600 font-bold">
                            Denda Overtime: Rp {item.overtime_fee.toLocaleString('id-ID')}
                          </div>
                        )}
                      </td>
                    )}

                    {/* Status Badge */}
                    <td className="px-5 py-4">
                      {statusBadge(item.status)}
                    </td>

                    {/* Operational Action Buttons */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* WhatsApp Quick Link */}
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
                            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-sm"
                          >
                            Konfirmasi Booking (DP)
                          </button>
                        )}

                        {/* Stage 2 Button: Handover Key */}
                        {activeTab === 'booking' && (
                          <button
                            type="button"
                            onClick={() => openHandoverModal(item)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm"
                          >
                            Serah Terima Kunci
                          </button>
                        )}

                        {/* Stage 3 Button: Process Return */}
                        {activeTab === 'active' && (
                          <button
                            type="button"
                            onClick={() => openReturnModal(item)}
                            className="px-3 py-1.5 rounded-xl bg-brand-navy hover:bg-brand-navy-light text-white font-bold text-xs transition-all shadow-sm"
                          >
                            Mobil Kembali (Selesai)
                          </button>
                        )}

                        {/* View Details */}
                        <button
                          type="button"
                          onClick={() => setSelectedInquiry(item)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="Lihat Detail"
                        >
                          <FileTextIcon size={16} />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDeleteInquiry(item.id, item.invoice_no)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-colors"
                          title="Hapus"
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: Konfirmasi Jadi Booking (Tahap 1 -> Tahap 2)                      */}
      {/* ========================================================================= */}
      {confirmModalItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  Konfirmasi Booking & Terima DP
                </h3>
                <p className="text-xs text-slate-500">
                  {confirmModalItem.invoice_no} — {confirmModalItem.customer_name} ({confirmModalItem.car_name})
                </p>
              </div>
              <button
                onClick={() => setConfirmModalItem(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <XIcon size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
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
                <label className="block font-bold text-slate-700 mb-1">Total Biaya Sewa (Rp)</label>
                <input
                  type="number"
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Admin / Status Verifikasi KTP</label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Contoh: Foto e-KTP dan SIM A sudah diverifikasi. DP masuk via BCA."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmModalItem(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={submitConfirmBooking}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
              >
                Simpan Sebagai Booking Terjadwal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Serah Terima Kunci (Tahap 2 -> Tahap 3)                          */}
      {/* ========================================================================= */}
      {handoverModalItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  Serah Terima Kunci & Mulai Sewa
                </h3>
                <p className="text-xs text-slate-500">
                  {handoverModalItem.invoice_no} — {handoverModalItem.car_name} ({handoverModalItem.customer_name})
                </p>
              </div>
              <button
                onClick={() => setHandoverModalItem(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <XIcon size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Uang Jaminan / Security Deposit Ditahan (Rp)
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold"
                />
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Uang jaminan ini akan ditahan sampai mobil dikembalikan dalam kondisi aman.
                </p>
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
                  placeholder="Contoh: Bensin posisi 4/4 bar, baret halus di bumper depan kiri, STNK asli diserahkan."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setHandoverModalItem(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={submitHandover}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                Mulai Sewa (Status: Sedang Disewa)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: Proses Pengembalian & Denda Overtime (Tahap 3 -> Tahap 4)         */}
      {/* ========================================================================= */}
      {returnModalItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  Proses Pengembalian Mobil
                </h3>
                <p className="text-xs text-slate-500">
                  {returnModalItem.invoice_no} — {returnModalItem.car_name} ({returnModalItem.customer_name})
                </p>
              </div>
              <button
                onClick={() => setReturnModalItem(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <XIcon size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">KM Akhir</label>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tarif Denda / Jam (Rp)</label>
                  <input
                    type="number"
                    value={overtimeRatePerHour}
                    onChange={(e) => setOvertimeRatePerHour(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Potongan Lain (Bensin/Baret)</label>
                  <input
                    type="number"
                    value={deductions}
                    onChange={(e) => setDeductions(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900"
                  />
                </div>
              </div>

              {/* Kalkulasi Ringkasan Deposit */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Deposit Awal Ditahan:</span>
                  <span className="font-bold">Rp {initialDeposit.toLocaleString('id-ID')}</span>
                </div>
                {calculatedOvertimeFee > 0 && (
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>Denda Overtime ({overtimeHours} Jam):</span>
                    <span>- Rp {calculatedOvertimeFee.toLocaleString('id-ID')}</span>
                  </div>
                )}
                {deductions > 0 && (
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>Potongan Lainnya:</span>
                    <span>- Rp {deductions.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-1.5 flex justify-between font-extrabold text-emerald-800 text-sm">
                  <span>Sisa Deposit yang Ditransfer Balik:</span>
                  <span>Rp {refundDepositAmount.toLocaleString('id-ID')}</span>
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
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={submitReturn}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-navy hover:bg-brand-navy-light text-white shadow-sm"
              >
                Selesaikan Transaksi (Status: Selesai)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DETAIL LENGKAP                                                      */}
      {/* ========================================================================= */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {selectedInquiry.invoice_no}
                </span>
                <h3 className="font-extrabold text-lg text-slate-900">
                  Detail Transaksi Sewa
                </h3>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <XIcon size={20} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl">
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

              <div>
                <span className="text-slate-500 block text-xs">Lokasi Pengambilan:</span>
                <span className="font-medium text-slate-800">{selectedInquiry.pickup_location}</span>
              </div>

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

            <div className="pt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white"
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
