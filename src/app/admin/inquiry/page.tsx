'use client';

import React, { useState, useEffect } from 'react';
import RupiahInput from '@/components/ui/RupiahInput';
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
  const [carsList, setCarsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('inquiry');
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Modals
  const [confirmModalItem, setConfirmModalItem] = useState<any | null>(null);
  const [handoverModalItem, setHandoverModalItem] = useState<any | null>(null);
  const [returnModalItem, setReturnModalItem] = useState<any | null>(null);
  const [extendModalItem, setExtendModalItem] = useState<any | null>(null);
  const [rescheduleModalItem, setRescheduleModalItem] = useState<any | null>(null);

  // Form states for Modal 1 (Confirm DP & Diskon)
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [dpAmount, setDpAmount] = useState<number>(200000);
  const [paymentMethodDp, setPaymentMethodDp] = useState<string>('Transfer BCA');
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<string>('DP_PAID');

  // Form states for Modal 2 (Handover & Penugasan Unit Fisik)
  const [handoverCarId, setHandoverCarId] = useState<string>('');
  const [handoverPaymentOption, setHandoverPaymentOption] = useState<'PAY_ON_RETURN' | 'PAY_NOW'>('PAY_ON_RETURN');
  const [finalPaymentAmount, setFinalPaymentAmount] = useState<number>(0);
  const [paymentMethodFinal, setPaymentMethodFinal] = useState<string>('Transfer BCA');
  const [odometerStart, setOdometerStart] = useState<number>(45000);

  // Form states for Modal 3 (Return & Overtime/Charges)
  const [odometerEnd, setOdometerEnd] = useState<number>(45350);
  const [overtimeHours, setOvertimeHours] = useState<number>(0);
  const [overtimeRatePerHour, setOvertimeRatePerHour] = useState<number>(50000);
  const [fuelCharge, setFuelCharge] = useState<number>(0);
  const [damageCharge, setDamageCharge] = useState<number>(0);
  const [paymentMethodReturn, setPaymentMethodReturn] = useState<string>('Cash / Tunai');
  const [adminNotes, setAdminNotes] = useState<string>('');

  // Form states for Extend / Reschedule Modal
  const [extendDays, setExtendDays] = useState<number>(1);
  const [rescheduleStartDate, setRescheduleStartDate] = useState<string>('');
  const [rescheduleEndDate, setRescheduleEndDate] = useState<string>('');
  const [rescheduleDuration, setRescheduleDuration] = useState<number>(1);
  const [rescheduleDestination, setRescheduleDestination] = useState<string>('');
  const [rescheduleTotalPrice, setRescheduleTotalPrice] = useState<number>(0);
  const [rescheduleNotes, setRescheduleNotes] = useState<string>('');

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

  const fetchCars = async () => {
    try {
      const res = await fetch('/api/cars');
      const data = await res.json();
      if (data.success) {
        setCarsList(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInquiries();
    fetchCars();
  }, []);

  const handleUpdate = async (id: string, updates: Record<string, any>) => {
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        await fetchInquiries();
        if (selectedInquiry && selectedInquiry.id === id) {
          setSelectedInquiry((prev: any) => (prev ? { ...prev, ...updates } : null));
        }
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

  // 1. Action: Convert Inquiry to Confirmed Booking (DP & Diskon)
  const openConfirmModal = (item: any) => {
    setConfirmModalItem(item);
    const matchedCar =
      carsList.find((c) => c.id === item.car_id) ||
      carsList.find((c) => item.car_name && item.car_name.toLowerCase().includes(c.model.toLowerCase()));
    const dailyRate = matchedCar ? matchedCar.price_per_day : Math.round((item.total_price || 350000) / (item.duration_days || 1)) || 350000;
    const basePrice = (item.duration_days || 1) * dailyRate;
    const initDiscount = item.discount_amount || 0;
    const computedTotal = Math.max(0, basePrice - initDiscount);

    setDiscountAmount(initDiscount);
    setTotalPrice(computedTotal);
    setDpAmount(item.dp_amount || 200000);
    setPaymentMethodDp(item.payment_method_dp || 'Transfer BCA');
    setPaymentStatus('DP_PAID');
    setAdminNotes(item.notes_admin || 'DP telah diterima, verifikasi e-KTP & SIM A berhasil.');
  };

  const submitConfirmBooking = async () => {
    if (!confirmModalItem) return;
    await handleUpdate(confirmModalItem.id, {
      status: 'CONFIRMED',
      discount_amount: Number(discountAmount) || 0,
      dp_amount: Number(dpAmount),
      payment_method_dp: paymentMethodDp,
      total_price: Number(totalPrice),
      payment_status: paymentStatus,
      notes_admin: adminNotes,
    });
    setConfirmModalItem(null);
    setActiveTab('booking');
  };

  // 2. Action: Handover car (Penyerahan Kunci & Penugasan Unit Mobil)
  const openHandoverModal = (item: any) => {
    setHandoverModalItem(item);
    // Find matching car in carsList or fallback to first
    const matchedCar =
      carsList.find((c) => c.id === item.car_id) ||
      carsList.find((c) => item.car_name && item.car_name.toLowerCase().includes(c.model.toLowerCase())) ||
      carsList[0];

    const carIdToSet = matchedCar ? matchedCar.id : item.car_id || '';
    setHandoverCarId(carIdToSet);

    const pricePerDay = matchedCar ? matchedCar.price_per_day : 350000;
    const calculatedTotal = item.total_price || item.duration_days * pricePerDay;
    const remaining = Math.max(0, calculatedTotal - (item.dp_amount || 0));

    setFinalPaymentAmount(remaining);
    setHandoverPaymentOption('PAY_ON_RETURN');
    setPaymentMethodFinal(item.payment_method_final || 'Transfer BCA');
    setOdometerStart(item.odometer_start || 45000);
    setAdminNotes(item.notes_admin || 'Kunci & STNK diserahkan. Unit mobil fisik siap jalan.');
  };

  const submitHandover = async () => {
    if (!handoverModalItem) return;

    const selectedCarObj = carsList.find((c) => c.id === handoverCarId);
    const updatedCarName = selectedCarObj
      ? `${selectedCarObj.brand} ${selectedCarObj.model} (${selectedCarObj.plate_number || 'Tersedia'})`
      : handoverModalItem.car_name;
    const updatedTotalPrice = selectedCarObj
      ? handoverModalItem.duration_days * selectedCarObj.price_per_day
      : handoverModalItem.total_price;

    const updates: Record<string, any> = {
      status: 'ACTIVE_RENTAL',
      car_id: handoverCarId,
      car_name: updatedCarName,
      total_price: updatedTotalPrice,
      odometer_start: Number(odometerStart),
      notes_admin: adminNotes,
    };

    if (handoverPaymentOption === 'PAY_NOW') {
      updates.payment_status = 'FULLY_PAID';
      updates.payment_method_final = paymentMethodFinal;
    } else {
      updates.payment_status = 'DP_PAID';
    }

    await handleUpdate(handoverModalItem.id, updates);
    setHandoverModalItem(null);
    setActiveTab('active');
  };

  // 3. Action: Return car (Pengembalian / Pelunasan Akhir)
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
    setPaymentMethodReturn('Cash / Tunai');
    setAdminNotes(
      timeStatus.status === 'OVERDUE'
        ? `Mobil terlambat ${Math.abs(timeStatus.daysDiff)} hari dari jadwal sewa. Denda keterlambatan telah dicatat.`
        : 'Mobil kembali dalam kondisi baik dan tepat waktu.'
    );
  };

  const calculatedOvertimeFee = overtimeHours * overtimeRatePerHour;
  const totalExtraCharges = calculatedOvertimeFee + fuelCharge + damageCharge;
  const remainingUnpaidRent =
    returnModalItem && returnModalItem.payment_status !== 'FULLY_PAID'
      ? Math.max(0, (returnModalItem.total_price || 0) - (returnModalItem.dp_amount || 0))
      : 0;
  const grandTotalDue = remainingUnpaidRent + totalExtraCharges;

  const submitReturn = async () => {
    if (!returnModalItem) return;
    await handleUpdate(returnModalItem.id, {
      status: 'COMPLETED',
      payment_status: 'FULLY_PAID',
      payment_method_final: paymentMethodReturn,
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

  // Helper to add days to formatted Indonesian date string or ISO date string
  function addDaysToDate(dateStr: string, daysToAdd: number): string {
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    let baseDate = new Date();

    if (dateStr && dateStr.includes(' ')) {
      const parts = dateStr.split(' ');
      const day = parseInt(parts[0], 10);
      const mIdx = monthNames.findIndex((m) => parts[1]?.toLowerCase().startsWith(m.toLowerCase().slice(0, 3)));
      const year = parseInt(parts[2], 10) || new Date().getFullYear();
      if (!isNaN(day) && mIdx !== -1) {
        baseDate = new Date(year, mIdx, day);
      }
    } else if (dateStr) {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        baseDate = parsed;
      }
    }

    // If baseDate is before today (overdue), start extending from TODAY
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const effectiveBase = baseDate.getTime() < today.getTime() ? today : baseDate;

    const targetDate = new Date(effectiveBase);
    targetDate.setDate(targetDate.getDate() + daysToAdd);

    const d = targetDate.getDate();
    const m = monthNames[targetDate.getMonth()];
    const y = targetDate.getFullYear();
    return `${d} ${m} ${y}`;
  }

  // 4. Action: Extend Rental
  const openExtendModal = (item: any) => {
    setExtendModalItem(item);
    setExtendDays(1);
  };

  const submitExtendRental = async () => {
    if (!extendModalItem) return;
    const addedDays = Number(extendDays) || 1;
    const currentDuration = Number(extendModalItem.duration_days) || 1;
    const newDuration = currentDuration + addedDays;

    // Get real daily rate from master car data
    const matchedCar =
      carsList.find((c) => c.id === extendModalItem.car_id) ||
      carsList.find((c) => extendModalItem.car_name && extendModalItem.car_name.toLowerCase().includes(c.model.toLowerCase()));
    const dailyRate = matchedCar ? matchedCar.price_per_day : (Math.round((extendModalItem.total_price || 350000) / currentDuration) || 350000);
    const addedCost = addedDays * dailyRate;
    const newTotalPrice = (Number(extendModalItem.total_price) || 0) + addedCost;
    const newEndDate = addDaysToDate(extendModalItem.end_date, addedDays);

    await handleUpdate(extendModalItem.id, {
      duration_days: newDuration,
      end_date: newEndDate,
      total_price: newTotalPrice,
      overtime_hours: 0,
      overtime_fee: 0,
      notes_admin: `${extendModalItem.notes_admin ? extendModalItem.notes_admin + ' | ' : ''}Perpanjang sewa +${addedDays} hari s/d ${newEndDate} pada ${new Date().toLocaleDateString('id-ID')}`.trim(),
    });
    setExtendModalItem(null);
  };

  // 5. Action: Edit / Reschedule Booking Schedule
  const openRescheduleModal = (item: any) => {
    setRescheduleModalItem(item);
    setRescheduleStartDate(item.start_date || '');
    setRescheduleEndDate(item.end_date || '');
    setRescheduleDuration(item.duration_days || 1);
    setRescheduleDestination(item.destination || '');
    setRescheduleTotalPrice(item.total_price || item.duration_days * 350000);
    setRescheduleNotes(item.notes_admin || '');
  };

  const submitReschedule = async () => {
    if (!rescheduleModalItem) return;
    await handleUpdate(rescheduleModalItem.id, {
      start_date: rescheduleStartDate,
      end_date: rescheduleEndDate,
      duration_days: Number(rescheduleDuration),
      destination: rescheduleDestination,
      total_price: Number(rescheduleTotalPrice),
      notes_admin: `${rescheduleNotes ? rescheduleNotes + ' | ' : ''}Reschedule jadwal: ${rescheduleStartDate} s/d ${rescheduleEndDate} (${rescheduleDuration} Hari) pada ${new Date().toLocaleDateString('id-ID')}`.trim(),
    });
    setRescheduleModalItem(null);
  };

  // Helper to copy structured WA receipt
  const copyInvoiceText = (item: any) => {
    const totalSewa = item.total_price || 0;
    const dpMasuk = item.dp_amount || 0;
    const sisaSewa = Math.max(0, totalSewa - dpMasuk);
    const totalDenda = (item.overtime_fee || 0) + (item.fuel_charge || 0) + (item.damage_charge || 0);

    let text = `*RINCIAN TRANSAKSI SEWA MOBIL — RENTCAR*
----------------------------------------
No. Invoice : *${item.invoice_no}*
Nama        : ${item.customer_name}
No. HP      : ${item.customer_phone}
Armada      : *${item.car_name}*
Jadwal      : ${item.start_date} s/d ${item.end_date} (${item.duration_days} Hari)
Tujuan      : ${item.destination || 'Dalam Kota'}
----------------------------------------
*1. RINCIAN BIAYA SEWA:*
• Total Biaya Sewa  : Rp ${totalSewa.toLocaleString('id-ID')}${item.discount_amount > 0 ? ` (Sudah Diskon Rp ${item.discount_amount.toLocaleString('id-ID')})` : ''}
• DP Masuk          : Rp ${dpMasuk.toLocaleString('id-ID')} (${item.payment_method_dp || 'Transfer'})
• Sisa Pembayaran   : Rp ${sisaSewa.toLocaleString('id-ID')} (${item.payment_status === 'FULLY_PAID' ? 'LUNAS' : 'Belum Lunas'})
`;

    if (item.odometer_start || item.odometer_end) {
      text += `\n*2. ODOMETER & KONDISI:*
• KM Berangkat : ${item.odometer_start ? item.odometer_start.toLocaleString('id-ID') + ' KM' : '-'}
• KM Kembali   : ${item.odometer_end ? item.odometer_end.toLocaleString('id-ID') + ' KM' : '-'}\n`;
    }

    if (totalDenda > 0) {
      text += `\n*3. DENDA & BIAYA TAMBAHAN:*
• Overtime (${item.overtime_hours || 0} Jam) : Rp ${(item.overtime_fee || 0).toLocaleString('id-ID')}
• Charge BBM Kurang : Rp ${(item.fuel_charge || 0).toLocaleString('id-ID')}
• Charge Klaim/Baret : Rp ${(item.damage_charge || 0).toLocaleString('id-ID')}
• *Total Denda/Charge* : *Rp ${totalDenda.toLocaleString('id-ID')}*\n`;
    }

    text += `----------------------------------------
Status Transaksi : *${item.status}*
_Terima kasih telah mempercayakan perjalanan Anda kepada kami!_`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 3000);
  };

  // Helper date status parser
  function getRentalTimeStatus(endDateStr: string): { status: 'NORMAL' | 'TODAY' | 'OVERDUE'; label: string; daysDiff: number; overdueHours: number } {
    if (!endDateStr) return { status: 'NORMAL', label: '', daysDiff: 0, overdueHours: 0 };
    try {
      let targetDate: Date | null = null;
      if (endDateStr.includes(' ')) {
        const parts = endDateStr.split(' ');
        const day = parseInt(parts[0], 10);
        const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const monthIndex = monthNames.findIndex((m) => parts[1]?.toLowerCase().startsWith(m.toLowerCase().slice(0, 3)));
        const year = parseInt(parts[2], 10) || new Date().getFullYear();
        if (!isNaN(day) && monthIndex !== -1) {
          targetDate = new Date(year, monthIndex, day, 23, 59, 59);
        }
      } else if (endDateStr.includes('-')) {
        const parts = endDateStr.split('-');
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        targetDate = new Date(y, m, d, 23, 59, 59);
      } else {
        targetDate = new Date(endDateStr);
        targetDate.setHours(23, 59, 59, 999);
      }

      if (!targetDate || isNaN(targetDate.getTime())) {
        return { status: 'NORMAL', label: '', daysDiff: 0, overdueHours: 0 };
      }

      const now = new Date();
      // Compare calendar days
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      const diffMs = targetDate.getTime() - todayEnd.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        const overdueDays = Math.abs(diffDays);
        const overdueHours = Math.abs(Math.round((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60)));
        return { status: 'OVERDUE', label: `⚠️ Overdue ${overdueDays} Hari`, daysDiff: diffDays, overdueHours };
      } else if (diffDays === 0) {
        return { status: 'TODAY', label: '⏳ Kembali Hari Ini', daysDiff: 0, overdueHours: 0 };
      } else {
        return { status: 'NORMAL', label: `Sisa ${diffDays} Hari`, daysDiff: diffDays, overdueHours: 0 };
      }
    } catch {
      return { status: 'NORMAL', label: '', daysDiff: 0, overdueHours: 0 };
    }
  }

  // Filter inquiries per tab
  const getFilteredInquiries = () => {
    switch (activeTab) {
      case 'inquiry':
        return inquiries.filter((i) => i.status === 'NEW');
      case 'booking':
        return inquiries.filter((i) => i.status === 'CONFIRMED');
      case 'active':
        return inquiries.filter((i) => i.status === 'ACTIVE_RENTAL');
      case 'history':
        return inquiries.filter((i) => ['COMPLETED', 'CANCELLED'].includes(i.status));
      default:
        return inquiries;
    }
  };

  const filteredInquiries = getFilteredInquiries();

  const tabCounts = {
    inquiry: inquiries.filter((i) => i.status === 'NEW').length,
    booking: inquiries.filter((i) => i.status === 'CONFIRMED').length,
    active: inquiries.filter((i) => i.status === 'ACTIVE_RENTAL').length,
    history: inquiries.filter((i) => ['COMPLETED', 'CANCELLED'].includes(i.status)).length,
  };

  const overdueInquiries = inquiries.filter((i) => {
    if (i.status !== 'ACTIVE_RENTAL') return false;
    const timeStatus = getRentalTimeStatus(i.end_date);
    return timeStatus.status === 'OVERDUE';
  });

  const statusBadge = (status: string, timeStatus?: any) => {
    if (status === 'ACTIVE_RENTAL' && timeStatus && timeStatus.status === 'OVERDUE') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white animate-pulse inline-flex items-center gap-1 shadow-sm">
          <span>⚠️</span>
          <span>OVERDUE ({Math.abs(timeStatus.daysDiff)} Hari)</span>
        </span>
      );
    }

    switch (status) {
      case 'NEW':
        return <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800">Inquiry Baru</span>;
      case 'CONFIRMED':
        return <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-100 text-purple-800">Booking Dikonfirmasi</span>;
      case 'ACTIVE_RENTAL':
        return <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">Mobil Digunakan</span>;
      case 'COMPLETED':
        return <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-800">Selesai & Arsip</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800">Dibatalkan</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Manajemen Sewa & Inquiry
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Alur kerja sewa: 1. Konfirmasi DP $\rightarrow$ 2. Serah Terima & Penugasan Unit Mobil $\rightarrow$ 3. Penggunaan & Pengembalian $\rightarrow$ 4. Arsip Selesai.
        </p>
      </div>

      {/* Copy Alert Toast */}
      {copiedText && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-fade-in border border-slate-700">
          <CheckIcon size={14} className="text-emerald-400" />
          <span>Format WA Rincian Transaksi Berhasil Disalin!</span>
        </div>
      )}

      {/* Overdue Warning Alert Banner */}
      {overdueInquiries.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3.5">
            <span className="text-2xl sm:text-3xl">🚨</span>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-rose-900">
                PERINGATAN OVERTIME: {overdueInquiries.length} Mobil Melewati Batas Waktu Pengembalian!
              </h3>
              <p className="text-xs text-rose-700 mt-0.5">
                Unit belum dikembalikan sesuai jadwal sewa. Segera hubungi penyewa via WhatsApp atau cek posisi GPS mobil.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('active')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-sm transition-all shrink-0 cursor-pointer"
          >
            Lihat Unit Overtime ({overdueInquiries.length})
          </button>
        </div>
      )}

      {/* 4 STAGE TABS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Tab 1: Inquiry */}
        <button
          onClick={() => setActiveTab('inquiry')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'inquiry'
              ? 'bg-blue-900 text-white border-blue-900 shadow-md scale-[1.02]'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Tahap 1</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
              activeTab === 'inquiry' ? 'bg-white text-blue-900' : 'bg-blue-100 text-blue-800'
            }`}>
              {tabCounts.inquiry}
            </span>
          </div>
          <div className="font-extrabold text-sm sm:text-base mt-1">Inquiry Masuk</div>
          <p className="text-[11px] opacity-75 mt-0.5 truncate">Tanya jadwal & ketersediaan</p>
        </button>

        {/* Tab 2: Booking Confirmed */}
        <button
          onClick={() => setActiveTab('booking')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'booking'
              ? 'bg-purple-900 text-white border-purple-900 shadow-md scale-[1.02]'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Tahap 2</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
              activeTab === 'booking' ? 'bg-white text-purple-900' : 'bg-purple-100 text-purple-800'
            }`}>
              {tabCounts.booking}
            </span>
          </div>
          <div className="font-extrabold text-sm sm:text-base mt-1">Booking (DP Masuk)</div>
          <p className="text-[11px] opacity-75 mt-0.5 truncate">Persiapan serah terima fisik</p>
        </button>

        {/* Tab 3: Active Rental */}
        <button
          onClick={() => setActiveTab('active')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
            activeTab === 'active'
              ? 'bg-emerald-900 text-white border-emerald-900 shadow-md scale-[1.02]'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Tahap 3</span>
            <div className="flex items-center gap-1">
              {overdueInquiries.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                  ⚠️ {overdueInquiries.length} Overdue
                </span>
              )}
              <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                activeTab === 'active' ? 'bg-white text-emerald-900' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {tabCounts.active}
              </span>
            </div>
          </div>
          <div className="font-extrabold text-sm sm:text-base mt-1">Mobil Digunakan</div>
          <p className="text-[11px] opacity-75 mt-0.5 truncate">Pantau jadwal sewa & jam batas</p>
        </button>

        {/* Tab 4: History / Completed */}
        <button
          onClick={() => setActiveTab('history')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Arsip</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
              activeTab === 'history' ? 'bg-white text-slate-900' : 'bg-slate-100 text-slate-700'
            }`}>
              {tabCounts.history}
            </span>
          </div>
          <div className="font-extrabold text-sm sm:text-base mt-1">Riwayat Selesai</div>
          <p className="text-[11px] opacity-75 mt-0.5 truncate">Lunas & arsip transaksi selesai</p>
        </button>
      </div>

      {/* TABLE DATA */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden card-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider font-extrabold text-slate-500">
              <tr>
                <th className="px-5 py-4">Penyewa</th>
                <th className="px-5 py-4">Unit Mobil Fisik</th>
                <th className="px-5 py-4">Jadwal & Durasi</th>
                {activeTab === 'inquiry' && <th className="px-5 py-4">Estimasi Total</th>}
                {activeTab === 'booking' && <th className="px-5 py-4">Status DP</th>}
                {activeTab === 'active' && <th className="px-5 py-4">Pelunasan & Odometer</th>}
                {activeTab === 'history' && <th className="px-5 py-4">Total & Denda</th>}
                <th className="px-5 py-4">Status & Waktu</th>
                <th className="px-5 py-4 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Memuat data transaksi...
                  </td>
                </tr>
              ) : filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Tidak ada transaksi pada tahap ini.
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((item) => {
                  const timeStatus = getRentalTimeStatus(item.end_date);
                  const isOverdue = timeStatus.status === 'OVERDUE' && item.status === 'ACTIVE_RENTAL';
                  const isToday = timeStatus.status === 'TODAY' && item.status === 'ACTIVE_RENTAL';

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isOverdue ? 'bg-rose-50/50' : isToday ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      {/* Customer Name & Phone */}
                      <td className="px-5 py-4">
                        <div className="font-extrabold text-slate-900 text-sm tracking-tight">{item.customer_name}</div>
                        <div className="text-slate-500 text-xs flex items-center gap-1 mt-1 font-medium">
                          <WhatsAppIcon size={13} className="text-brand-green-wa shrink-0" />
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
                          {timeStatus && item.status === 'ACTIVE_RENTAL' && (
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
                        {item.status !== 'ACTIVE_RENTAL' && item.status !== 'COMPLETED' && item.status !== 'CANCELLED' && (
                          <button
                            type="button"
                            onClick={() => openRescheduleModal(item)}
                            className="text-[11px] font-bold text-brand-navy hover:underline inline-flex items-center gap-1 mt-1 cursor-pointer"
                          >
                            <span>📅 Ubah Jadwal</span>
                          </button>
                        )}
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
                          {item.payment_status === 'FULLY_PAID' ? (
                            <div className="font-bold text-emerald-700 flex items-center gap-1">
                              <span>✅ Lunas Penuh</span>
                            </div>
                          ) : (
                            <div>
                              <div className="font-bold text-amber-700">
                                Sisa: Rp {Math.max(0, (item.total_price || 0) - (item.dp_amount || 0)).toLocaleString('id-ID')}
                              </div>
                              <span className="inline-block px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-semibold mt-0.5 border border-amber-200">
                                Bayar Saat Kembali
                              </span>
                            </div>
                          )}
                          <div className="text-slate-500 text-[11px] mt-1">
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

                          {/* Stage 2 Button: Handover Key & Assignment */}
                          {activeTab === 'booking' && (
                            <button
                              type="button"
                              onClick={() => openHandoverModal(item)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
                            >
                              Serah Terima Kunci
                            </button>
                          )}

                          {/* Stage 3 Buttons: Extend & Process Return */}
                          {activeTab === 'active' && (
                            <>
                              <button
                                type="button"
                                onClick={() => openExtendModal(item)}
                                className="px-2.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs transition-all cursor-pointer"
                                title="Perpanjang Sewa"
                              >
                                Extend
                              </button>
                              <button
                                type="button"
                                onClick={() => openReturnModal(item)}
                                className="px-3 py-1.5 rounded-xl bg-brand-navy hover:bg-brand-navy-light text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
                              >
                                Pengembalian Mobil
                              </button>
                            </>
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
                  Konfirmasi Booking & Penerimaan DP
                </h3>
                <p className="text-xs text-slate-500">
                  {confirmModalItem.invoice_no} — {confirmModalItem.car_name} ({confirmModalItem.customer_name})
                </p>
              </div>
              <button
                onClick={() => setConfirmModalItem(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <XIcon size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              {/* Read-only Automatic Calculation Summary with Optional Discount */}
              {(() => {
                const matchedCar =
                  carsList.find((c) => c.id === confirmModalItem.car_id) ||
                  carsList.find((c) => confirmModalItem.car_name && confirmModalItem.car_name.toLowerCase().includes(c.model.toLowerCase()));
                const dailyRate = matchedCar
                  ? matchedCar.price_per_day
                  : Math.round((confirmModalItem.total_price || 350000) / (confirmModalItem.duration_days || 1)) || 350000;
                const basePrice = (confirmModalItem.duration_days || 1) * dailyRate;
                const netPrice = Math.max(0, basePrice - (discountAmount || 0));

                return (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Unit Mobil & Jadwal:</span>
                      <span className="font-bold text-slate-800">{confirmModalItem.car_name}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Durasi Sewa:</span>
                      <span className="font-bold text-slate-800">
                        {confirmModalItem.duration_days} Hari ({confirmModalItem.start_date} &rarr; {confirmModalItem.end_date})
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Tarif Normal ({matchedCar ? `${matchedCar.brand} ${matchedCar.model}` : 'Unit'}):</span>
                      <span className="font-semibold text-slate-700">
                        Rp {dailyRate.toLocaleString('id-ID')} / hari &times; {confirmModalItem.duration_days} Hari = <strong>Rp {basePrice.toLocaleString('id-ID')}</strong>
                      </span>
                    </div>

                    {/* Discount row if applied */}
                    {discountAmount > 0 && (
                      <div className="flex items-center justify-between text-rose-700 font-bold border-t border-slate-200/80 pt-1.5">
                        <span>Potongan Diskon:</span>
                        <span>- Rp {discountAmount.toLocaleString('id-ID')}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-slate-800">
                      <span className="font-extrabold">Total Biaya Sewa Bersih:</span>
                      <span className="font-black text-base text-brand-navy">
                        Rp {netPrice.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Form Input Potongan Diskon (Opsional) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 text-xs">
                    🏷️ Potongan Diskon (Rp) <span className="text-slate-400 font-normal">(Opsional / Khusus Sewa Lama & Promo)</span>
                  </label>
                  {discountAmount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setDiscountAmount(0);
                        const matchedCar =
                          carsList.find((c) => c.id === confirmModalItem.car_id) ||
                          carsList.find((c) => confirmModalItem.car_name && confirmModalItem.car_name.toLowerCase().includes(c.model.toLowerCase()));
                        const dailyRate = matchedCar ? matchedCar.price_per_day : 350000;
                        const basePrice = (confirmModalItem.duration_days || 1) * dailyRate;
                        setTotalPrice(basePrice);
                      }}
                      className="text-[10px] text-rose-600 hover:underline font-bold cursor-pointer"
                    >
                      Hapus Diskon
                    </button>
                  )}
                </div>

                <RupiahInput
                  value={discountAmount}
                  onChange={(val) => {
                    setDiscountAmount(val);
                    const matchedCar =
                      carsList.find((c) => c.id === confirmModalItem.car_id) ||
                      carsList.find((c) => confirmModalItem.car_name && confirmModalItem.car_name.toLowerCase().includes(c.model.toLowerCase()));
                    const dailyRate = matchedCar ? matchedCar.price_per_day : 350000;
                    const basePrice = (confirmModalItem.duration_days || 1) * dailyRate;
                    setTotalPrice(Math.max(0, basePrice - val));
                  }}
                  placeholder="0 (Tanpa Diskon)"
                />

                {/* Quick Preset Buttons */}
                <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400">Pilihan Cepat:</span>
                  {[50000, 100000, 200000, 500000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setDiscountAmount(amt);
                        const matchedCar =
                          carsList.find((c) => c.id === confirmModalItem.car_id) ||
                          carsList.find((c) => confirmModalItem.car_name && confirmModalItem.car_name.toLowerCase().includes(c.model.toLowerCase()));
                        const dailyRate = matchedCar ? matchedCar.price_per_day : 350000;
                        const basePrice = (confirmModalItem.duration_days || 1) * dailyRate;
                        setTotalPrice(Math.max(0, basePrice - amt));
                      }}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                        discountAmount === amt
                          ? 'bg-rose-50 text-rose-700 border-rose-300 font-bold shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      -Rp {(amt / 1000).toLocaleString('id-ID')}rb
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jumlah DP Diterima (Rp) *</label>
                  <RupiahInput
                    value={dpAmount}
                    onChange={setDpAmount}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sisa Pelunasan Nanti</label>
                  <div className="w-full bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5 text-amber-900 font-extrabold text-xs sm:text-sm flex items-center">
                    Rp {Math.max(0, Number(totalPrice) - Number(dpAmount)).toLocaleString('id-ID')}
                  </div>
                </div>
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

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Admin / Verifikasi Berkas</label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Contoh: DP 200rb masuk BCA. KTP & SIM A penyewa valid."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-center gap-2">
                <CheckIcon size={18} className="text-purple-600 shrink-0" />
                <span>Setelah dikonfirmasi, transaksi akan masuk ke <strong>Tahap 2 (Booking Dikonfirmasi)</strong> untuk persiapan unit fisik.</span>
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
                Simpan & Konfirmasi Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Serah Terima Kunci & Penugasan Unit Mobil Fisik (Tahap 2 -> 3)   */}
      {/* ========================================================================= */}
      {handoverModalItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  Serah Terima Kunci & Penugasan Unit Mobil
                </h3>
                <p className="text-xs text-slate-500">
                  {handoverModalItem.invoice_no} — Penyewa: <strong>{handoverModalItem.customer_name}</strong>
                </p>
              </div>
              <button
                onClick={() => setHandoverModalItem(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <XIcon size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              {/* 1. Pilih / Ganti Unit Mobil & Plat Nomor */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Pilih Unit Mobil Fisik & Nomor Plat <span className="text-rose-500">*</span>
                </label>
                <select
                  value={handoverCarId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setHandoverCarId(newId);
                    const found = carsList.find((c) => c.id === newId);
                    if (found && handoverModalItem) {
                      const newTotal = handoverModalItem.duration_days * found.price_per_day;
                      const newRemaining = Math.max(0, newTotal - (handoverModalItem.dp_amount || 0));
                      setFinalPaymentAmount(newRemaining);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:bg-white"
                >
                  {carsList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.brand} {c.model} — Plat: {c.plate_number || 'Tersedia'} (Rp {c.price_per_day.toLocaleString('id-ID')}/hari)
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  💡 Admin dapat menugaskan unit mobil fisik spesifik atau mengganti jenis mobil jika ada request dari penyewa.
                </span>
              </div>

              {/* 2. Kilometer (KM) Odometer Awal */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">Kilometer (KM) Odometer Awal Serah Terima</label>
                <input
                  type="number"
                  value={odometerStart}
                  onChange={(e) => setOdometerStart(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold"
                />
              </div>

              {/* 3. Opsi Pembayaran Pelunasan Fleksibel */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="block font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Opsi Waktu Pelunasan Sisa Sewa:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label
                    className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      handoverPaymentOption === 'PAY_ON_RETURN'
                        ? 'bg-brand-navy text-white border-brand-navy shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentOption"
                      checked={handoverPaymentOption === 'PAY_ON_RETURN'}
                      onChange={() => setHandoverPaymentOption('PAY_ON_RETURN')}
                      className="hidden"
                    />
                    <span className="text-xs font-bold">💳 Bayar Saat Mobil Kembali (Default)</span>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      handoverPaymentOption === 'PAY_NOW'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentOption"
                      checked={handoverPaymentOption === 'PAY_NOW'}
                      onChange={() => setHandoverPaymentOption('PAY_NOW')}
                      className="hidden"
                    />
                    <span className="text-xs font-bold">✅ Lunasi Sekarang di Muka</span>
                  </label>
                </div>

                {handoverPaymentOption === 'PAY_NOW' ? (
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-700 text-xs mb-1">Nominal Pelunasan</label>
                        <RupiahInput value={finalPaymentAmount} onChange={setFinalPaymentAmount} size="sm" />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 text-xs mb-1">Metode Pembayaran</label>
                        <select
                          value={paymentMethodFinal}
                          onChange={(e) => setPaymentMethodFinal(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                        >
                          {PAYMENT_METHODS.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <p className="text-[11px] text-emerald-700 font-semibold">
                      Pelunasan sisa sewa sebesar <strong>Rp {finalPaymentAmount.toLocaleString('id-ID')}</strong> akan menandai status sewa menjadi <strong>LUNAS PENUH</strong>.
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                    Sisa sewa sebesar <strong>Rp {finalPaymentAmount.toLocaleString('id-ID')}</strong> akan otomatis ditagihkan di <strong>Tahap 3 (Saat Pengembalian Mobil)</strong> bersamaan dengan perhitungan denda/overtime (jika ada).
                  </p>
                )}
              </div>

              {/* 4. Catatan BAST Serah Terima Fisik */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">Catatan BAST Serah Terima Fisik</label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Contoh: Bensin 4/4 bar, STNK asli diserahkan, fisik mobil dicek bersama tanpa lecet baru."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800"
                />
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
                Serah Terima Kunci & Mulai Sewa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: Pengembalian Mobil & Pelunasan Akhir (Tahap 3 -> Tahap 4)        */}
      {/* ========================================================================= */}
      {returnModalItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  Pemeriksaan Pengembalian & Pelunasan Akhir
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
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    KM Awal: {returnModalItem.odometer_start ? returnModalItem.odometer_start.toLocaleString('id-ID') : '-'}
                  </span>
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
                  <RupiahInput
                    value={overtimeRatePerHour}
                    onChange={setOvertimeRatePerHour}
                    size="sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-[11px]">Charge Bensin</label>
                  <RupiahInput
                    value={fuelCharge}
                    onChange={setFuelCharge}
                    size="sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-[11px]">Charge Klaim/Baret</label>
                  <RupiahInput
                    value={damageCharge}
                    onChange={setDamageCharge}
                    size="sm"
                  />
                </div>
              </div>

              {/* Kalkulasi Ringkasan Tagihan Akhir Lengkap */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="font-extrabold text-xs uppercase tracking-wider text-slate-800 mb-1 border-b border-slate-200 pb-1">
                  Rincian Tagihan Pelunasan Akhir:
                </div>

                {/* Sisa Sewa Pokok jika belum lunas */}
                {remainingUnpaidRent > 0 ? (
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Sisa Biaya Sewa Pokok (Belum Lunas):</span>
                    <span>Rp {remainingUnpaidRent.toLocaleString('id-ID')}</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Biaya Sewa Pokok:</span>
                    <span>✅ Lunas di Muka (Rp {(returnModalItem.total_price || 0).toLocaleString('id-ID')})</span>
                  </div>
                )}

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

                <div className="border-t border-slate-300 pt-2 flex justify-between font-black text-sm text-slate-900">
                  <span>TOTAL AKHIR YANG HARUS DIBAYAR:</span>
                  <span className="text-base text-emerald-700">
                    Rp {grandTotalDue.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs">Metode Pembayaran Akhir</label>
                  <select
                    value={paymentMethodReturn}
                    onChange={(e) => setPaymentMethodReturn(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs">Catatan Akhir Transaksi</label>
                  <input
                    type="text"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Contoh: Unit dikembalikan dalam kondisi prima."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>
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
                Pelunasan & Selesaikan Sewa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: Perpanjang Sewa (Extend)                                         */}
      {/* ========================================================================= */}
      {extendModalItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  Perpanjang Sewa (Extend)
                </h3>
                <p className="text-xs text-slate-500">
                  {extendModalItem.invoice_no} — {extendModalItem.car_name}
                </p>
              </div>
              <button
                onClick={() => setExtendModalItem(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <XIcon size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tambah Durasi Sewa</label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 7].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setExtendDays(d)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        extendDays === d
                          ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      +{d} Hari
                    </button>
                  ))}
                </div>
              </div>

              {(() => {
                const matchedCar =
                  carsList.find((c) => c.id === extendModalItem.car_id) ||
                  carsList.find((c) => extendModalItem.car_name && extendModalItem.car_name.toLowerCase().includes(c.model.toLowerCase()));
                const dailyRate = matchedCar
                  ? matchedCar.price_per_day
                  : Math.round((extendModalItem.total_price || 350000) / (extendModalItem.duration_days || 1)) || 350000;
                const addedCost = (extendDays || 1) * dailyRate;
                const newTotalPrice = (Number(extendModalItem.total_price) || 0) + addedCost;
                const newEndDate = addDaysToDate(extendModalItem.end_date, extendDays || 1);

                return (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2 text-xs text-amber-950">
                    <div className="flex justify-between">
                      <span className="text-amber-800">Durasi Saat Ini:</span>
                      <span className="font-bold">{extendModalItem.duration_days} Hari</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-amber-950">
                      <span>Durasi Baru:</span>
                      <span>{Number(extendModalItem.duration_days) + Number(extendDays)} Hari (+{extendDays} Hari)</span>
                    </div>
                    <div className="flex justify-between font-bold text-blue-900 bg-blue-50/80 p-2 rounded-xl border border-blue-200">
                      <span>🗓️ Tanggal Selesai Baru:</span>
                      <span className="font-extrabold">{newEndDate}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Tarif Harian Unit ({matchedCar ? `${matchedCar.brand} ${matchedCar.model}` : 'Armada'}):</span>
                      <span className="font-bold">Rp {dailyRate.toLocaleString('id-ID')} / hari</span>
                    </div>
                    <div className="flex justify-between border-t border-amber-200 pt-1.5 font-bold text-amber-900">
                      <span>Tambahan Biaya Sewa (+{extendDays} Hari):</span>
                      <span className="font-extrabold text-emerald-800">+ Rp {addedCost.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between border-t border-amber-300 pt-1.5 font-black text-sm text-slate-900">
                      <span>Total Biaya Sewa Baru:</span>
                      <span>Rp {newTotalPrice.toLocaleString('id-ID')}</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 font-bold mt-1">
                      ✅ Tanggal batas sewa akan dimajukan ke {newEndDate} dan otomatis menonaktifkan status Denda/Overdue.
                    </p>
                  </div>
                );
              })()}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setExtendModalItem(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={submitExtendRental}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm cursor-pointer"
              >
                Simpan Perpanjangan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: Ubah Jadwal Sewa (Reschedule)                                    */}
      {/* ========================================================================= */}
      {rescheduleModalItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  Ubah Jadwal Sewa (Reschedule)
                </h3>
                <p className="text-xs text-slate-500">
                  {rescheduleModalItem.invoice_no} — {rescheduleModalItem.car_name} ({rescheduleModalItem.customer_name})
                </p>
              </div>
              <button
                onClick={() => setRescheduleModalItem(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <XIcon size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Mulai Sewa *</label>
                  <input
                    type="text"
                    value={rescheduleStartDate}
                    onChange={(e) => setRescheduleStartDate(e.target.value)}
                    placeholder="Contoh: 26 Agustus 2026 atau 2026-08-26"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Selesai Sewa *</label>
                  <input
                    type="text"
                    value={rescheduleEndDate}
                    onChange={(e) => setRescheduleEndDate(e.target.value)}
                    placeholder="Contoh: 28 Agustus 2026 atau 2026-08-28"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Durasi (Hari) *</label>
                  <input
                    type="number"
                    min={1}
                    value={rescheduleDuration}
                    onChange={(e) => {
                      const newDur = Math.max(1, Number(e.target.value) || 1);
                      setRescheduleDuration(newDur);
                      const matchedCar =
                        carsList.find((c) => c.id === rescheduleModalItem.car_id) ||
                        carsList.find((c) => rescheduleModalItem.car_name && rescheduleModalItem.car_name.toLowerCase().includes(c.model.toLowerCase()));
                      const unitPrice = matchedCar
                        ? matchedCar.price_per_day
                        : Math.round((rescheduleModalItem.total_price || 350000) / (rescheduleModalItem.duration_days || 1)) || 350000;
                      setRescheduleTotalPrice(newDur * unitPrice);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Biaya Sewa Baru (Otomatis)</label>
                  <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-black text-xs sm:text-sm flex items-center">
                    Rp {rescheduleTotalPrice.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tujuan Perjalanan</label>
                <input
                  type="text"
                  value={rescheduleDestination}
                  onChange={(e) => setRescheduleDestination(e.target.value)}
                  placeholder="Contoh: Dalam Kota Bandung / Luar Kota (Jakarta/Pangandaran)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan / Alasan Perubahan Jadwal</label>
                <textarea
                  rows={2}
                  value={rescheduleNotes}
                  onChange={(e) => setRescheduleNotes(e.target.value)}
                  placeholder="Contoh: Penyewa minta memundurkan tanggal sewa karena agenda pekerjaan."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                <span>💡</span>
                <span>Perubahan jadwal akan langsung memperbarui kalkulasi estimasi waktu, notifikasi overtime, dan total biaya sewa.</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRescheduleModalItem(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={submitReschedule}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-navy hover:bg-brand-navy-light text-white shadow-sm cursor-pointer"
              >
                Simpan Perubahan Jadwal
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
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Detail & Kwitansi Digital
                </span>
                <h3 className="font-black text-xl text-slate-900">
                  {selectedInquiry.invoice_no}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <XIcon size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              {/* Customer Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 text-xs block mb-0.5">Nama Penyewa</span>
                  <span className="font-bold text-slate-900">{selectedInquiry.customer_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block mb-0.5">Nomor WhatsApp</span>
                  <span className="font-mono font-bold text-slate-900">{selectedInquiry.customer_phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block mb-0.5">Unit Mobil</span>
                  <span className="font-bold text-brand-navy">{selectedInquiry.car_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block mb-0.5">Tujuan Perjalanan</span>
                  <span className="font-bold text-slate-900">{selectedInquiry.destination || 'Dalam Kota'}</span>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Rincian Keuangan:
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Biaya Sewa ({selectedInquiry.duration_days} Hari):</span>
                  <span className="font-extrabold text-slate-900">
                    Rp {(selectedInquiry.total_price || 0).toLocaleString('id-ID')}
                  </span>
                </div>
                {selectedInquiry.discount_amount > 0 && (
                  <div className="flex justify-between text-rose-700">
                    <span>Potongan Diskon Sewa:</span>
                    <span className="font-bold">- Rp {selectedInquiry.discount_amount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between text-purple-700">
                  <span>DP Terbayar ({selectedInquiry.payment_method_dp || 'Transfer'}):</span>
                  <span className="font-bold">
                    - Rp {(selectedInquiry.dp_amount || 0).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between font-bold border-t border-slate-200 pt-1.5">
                  <span className="text-slate-700">Sisa Tagihan yang Wajib Dilunasi:</span>
                  <span className={
                    (selectedInquiry.total_price || 0) <= (selectedInquiry.dp_amount || 0)
                      ? 'text-emerald-700'
                      : 'text-amber-700 font-extrabold'
                  }>
                    {(selectedInquiry.total_price || 0) <= (selectedInquiry.dp_amount || 0)
                      ? '✅ LUNAS'
                      : `Rp ${Math.max(0, (selectedInquiry.total_price || 0) - (selectedInquiry.dp_amount || 0)).toLocaleString('id-ID')}`}
                  </span>
                </div>

                {(selectedInquiry.overtime_fee > 0 || selectedInquiry.fuel_charge > 0 || selectedInquiry.damage_charge > 0) && (
                  <div className="border-t border-slate-200 pt-2 space-y-1 text-rose-700">
                    <span className="font-bold block text-[11px] uppercase">Denda & Charge Tambahan:</span>
                    {selectedInquiry.overtime_fee > 0 && (
                      <div className="flex justify-between">
                        <span>Overtime ({selectedInquiry.overtime_hours} Jam):</span>
                        <span>+ Rp {selectedInquiry.overtime_fee.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    {selectedInquiry.fuel_charge > 0 && (
                      <div className="flex justify-between">
                        <span>Charge BBM:</span>
                        <span>+ Rp {selectedInquiry.fuel_charge.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    {selectedInquiry.damage_charge > 0 && (
                      <div className="flex justify-between">
                        <span>Charge Kerusakan:</span>
                        <span>+ Rp {selectedInquiry.damage_charge.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Odometer Info */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-slate-400 block mb-0.5">KM Berangkat</span>
                  <span className="font-extrabold text-slate-800">
                    {selectedInquiry.odometer_start ? `${selectedInquiry.odometer_start.toLocaleString('id-ID')} KM` : '-'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-slate-400 block mb-0.5">KM Kembali</span>
                  <span className="font-extrabold text-slate-800">
                    {selectedInquiry.odometer_end ? `${selectedInquiry.odometer_end.toLocaleString('id-ID')} KM` : '-'}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {selectedInquiry.notes_admin && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  <span className="text-slate-400 block mb-1 font-bold">Catatan Admin:</span>
                  <p className="text-slate-700 italic">{selectedInquiry.notes_admin}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100 gap-2">
              <button
                type="button"
                onClick={() => copyInvoiceText(selectedInquiry)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <FileTextIcon size={14} />
                <span>Salin Format WA</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-navy text-white hover:bg-brand-navy-light cursor-pointer"
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
