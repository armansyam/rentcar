'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { CarItem } from '@/components/vehicle/VehicleCard';
import {
  CalendarIcon,
  MapPinIcon,
  WhatsAppIcon,
  LockIcon,
  FileTextIcon,
  PhoneIcon,
  CheckIcon,
} from '@/components/ui/Icons';
import { formatWhatsAppMessage, createWhatsAppLink } from '@/lib/whatsapp';

interface BookingFormProps {
  cars: CarItem[];
  selectedCarId?: string;
  adminWhatsApp?: string;
  companyName?: string;
}

export default function BookingForm({
  cars,
  selectedCarId,
  adminWhatsApp = '6281234567890',
  companyName = 'RentCar',
}: BookingFormProps) {
  // Form State
  const [carId, setCarId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [duration, setDuration] = useState<number>(1);
  const [pickupLocation, setPickupLocation] = useState<string>('Kantor RentCar, Bandung');
  const [destination, setDestination] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Set default car & listen to global car selection events
  useEffect(() => {
    if (selectedCarId && cars.some((c) => c.id === selectedCarId)) {
      setCarId(selectedCarId);
    } else if (cars.length > 0 && !carId) {
      setCarId(cars[0].id);
    }

    const handleCarSelected = (e: any) => {
      if (e.detail?.id) {
        setCarId(e.detail.id);
      }
    };

    window.addEventListener('rentcar:select-car', handleCarSelected);
    return () => window.removeEventListener('rentcar:select-car', handleCarSelected);
  }, [selectedCarId, cars, carId]);

  // Set default dates: tomorrow and 2 days after
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const end = new Date(tomorrow);
    end.setDate(tomorrow.getDate() + 2);

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    if (!startDate) setStartDate(formatDate(tomorrow));
    if (!endDate) setEndDate(formatDate(end));
  }, []);

  // Calculate duration automatically
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDuration(diffDays > 0 ? diffDays : 1);
    }
  }, [startDate, endDate]);

  const selectedCar = cars.find((c) => c.id === carId) || cars[0];

  // Helper formatted date for WhatsApp template
  const formatDateIndo = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const previewStartDate = formatDateIndo(startDate) || '{tanggal_mulai}';
  const previewEndDate = formatDateIndo(endDate) || '{tanggal_selesai}';
  const previewCarName = selectedCar ? `${selectedCar.brand} ${selectedCar.model}` : '{nama_mobil}';
  const previewDuration = duration > 0 ? `${duration}` : '{durasi}';
  const previewLocation = pickupLocation.trim() || '{lokasi_jemput}';
  const previewDestination = destination.trim() || '{tujuan}';
  const previewName = customerName.trim() || '{nama}';
  const previewPhone = customerPhone.trim() || '{no_hp}';

  const previewMessage = `Halo, saya ingin menanyakan ketersediaan mobil.

Berikut detail pemesanan saya:
• Tipe Mobil      : ${previewCarName}
• Tanggal Mulai   : ${previewStartDate}
• Tanggal Selesai : ${previewEndDate}
• Durasi          : ${previewDuration} hari
• Lokasi Ambil    : ${previewLocation}
• Tujuan (Jika Ada): ${previewDestination}
• Nama            : ${previewName}
• No. HP          : ${previewPhone}

Mohon informasinya, terima kasih.`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!carId) {
      setErrorMessage('Silakan pilih tipe mobil terlebih dahulu.');
      return;
    }
    if (!startDate || !endDate) {
      setErrorMessage('Silakan pilih tanggal mulai dan tanggal selesai sewa.');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setErrorMessage('Tanggal selesai sewa tidak boleh sebelum tanggal mulai.');
      return;
    }
    if (!customerName.trim()) {
      setErrorMessage('Silakan masukkan nama lengkap Anda.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 8) {
      setErrorMessage('Silakan masukkan nomor WhatsApp yang aktif dan valid.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Simpan ke database lokal melalui API
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          car_id: selectedCar?.id,
          car_name: `${selectedCar?.brand} ${selectedCar?.model}`,
          start_date: formatDateIndo(startDate),
          end_date: formatDateIndo(endDate),
          duration_days: duration,
          pickup_location: pickupLocation,
          destination,
          customer_name: customerName,
          customer_phone: customerPhone,
          notes,
        }),
      });

      const result = await res.json();

      // 2. Generate WhatsApp Link
      const waMessage = formatWhatsAppMessage(
        {
          carName: `${selectedCar?.brand} ${selectedCar?.model}`,
          startDate: formatDateIndo(startDate),
          endDate: formatDateIndo(endDate),
          durationDays: duration,
          pickupLocation,
          destination,
          customerName,
          customerPhone,
          notes,
        },
        companyName
      );

      const waUrl = createWhatsAppLink(adminWhatsApp, waMessage);

      // 3. Open WhatsApp
      window.open(waUrl, '_blank');

      setSuccessNotice(`Inquiry ${result.invoice_no || ''} berhasil dibuat! Mengalihkan ke WhatsApp admin...`);
    } catch (err: any) {
      console.error('Error submitting inquiry:', err);
      // Even if network fails, fallback to opening WhatsApp
      const waMessage = formatWhatsAppMessage(
        {
          carName: `${selectedCar?.brand} ${selectedCar?.model}`,
          startDate: formatDateIndo(startDate),
          endDate: formatDateIndo(endDate),
          durationDays: duration,
          pickupLocation,
          destination,
          customerName,
          customerPhone,
          notes,
        },
        companyName
      );
      window.open(createWhatsAppLink(adminWhatsApp, waMessage), '_blank');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="booking" className="py-16 md:py-24 bg-white border-b border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
            Formulir Sewa
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Cek Ketersediaan & Booking
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Kirimkan detail rencana sewa Anda untuk pengecekan armada langsung via WhatsApp.
          </p>
        </div>

        {/* Form Container Card matching Mockup */}
        <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-6 sm:p-8 md:p-10">
          {/* Top Banner Notice */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 mb-8 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-white border border-slate-200 text-brand-navy shrink-0 shadow-2xs">
              <FileTextIcon size={18} />
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium mt-0.5">
              Isi form berikut untuk menanyakan ketersediaan mobil yang Anda inginkan.
            </p>
          </div>

          {/* Form Alert Error / Success */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-700 font-medium">
              {errorMessage}
            </div>
          )}
          {successNotice && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-800 font-medium flex items-center gap-2">
              <CheckIcon size={18} className="text-emerald-600" />
              <span>{successNotice}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Pilih Mobil */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">
                Pilih Mobil <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={carId}
                  onChange={(e) => setCarId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:bg-white transition-all appearance-none cursor-pointer pr-12"
                  required
                >
                  {cars.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.brand} {c.model} ({c.capacity} Kursi · {c.transmission} · {c.fuel})
                    </option>
                  ))}
                </select>
                {selectedCar && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-10 h-7 relative hidden sm:block">
                    <Image
                      src={selectedCar.image_url}
                      alt={selectedCar.model}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 2. Tanggal Mulai & Tanggal Selesai */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">
                  Tanggal Mulai <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">
                  Tanggal Selesai <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 3. Durasi Sewa */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">
                Durasi Sewa
              </label>
              <div className="w-full bg-slate-100/70 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-700 flex items-center justify-between">
                <span>{duration} Hari</span>
                <span className="text-xs text-slate-500 font-normal">
                  (Dihitung otomatis dari tanggal sewa)
                </span>
              </div>
            </div>

            {/* 4. Lokasi Pengambilan & Tujuan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">
                  Lokasi Pengambilan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="Contoh: Kantor RentCar, Bandung"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:bg-white transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">
                  Tujuan / Kota Tujuan <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Contoh: Lembang, Puncak, Jakarta, dll"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* 5. Data Customer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Masukkan nama lengkap Anda"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:bg-white transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">
                  No. WhatsApp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            {/* 6. Dynamic Template WhatsApp Preview Box matching Mockup */}
            <div className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Template Pesan WhatsApp (Live Preview)
              </label>
              <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-xl p-4 sm:p-5 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed shadow-2xs">
                {previewMessage}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Pesan di atas akan otomatis tersusun dan dapat Anda sesuaikan kembali di aplikasi WhatsApp.
              </p>
            </div>

            {/* 7. WhatsApp Submit Button */}
            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-xl font-bold text-white bg-brand-green-wa hover:bg-emerald-600 active:scale-98 transition-all shadow-md flex items-center justify-center gap-3 text-base group disabled:opacity-75 cursor-pointer"
              >
                <WhatsAppIcon size={22} className="text-white" />
                <span>{isSubmitting ? 'Memproses...' : 'Kirim via WhatsApp'}</span>
              </button>

              {/* Data Security Note */}
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-1">
                <LockIcon size={14} className="text-slate-400" />
                <span>Data Anda aman. Hanya digunakan untuk proses konfirmasi pemesanan.</span>
              </div>
            </div>

            {/* 8. Catatan Terms & Conditions matching mockup */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                Catatan Penting:
              </h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>Mobil lepas kunci (tanpa sopir).</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>Bahan bakar menjadi tanggung jawab penyewa.</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>Pengembalian tepat waktu sesuai perjanjian sewa.</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>Denda keterlambatan berlaku sesuai ketentuan rental.</span>
                </li>
              </ul>

              {/* Secondary Hubungi Kami button */}
              <div className="mt-6">
                <a
                  href={`https://wa.me/${adminWhatsApp.replace(/\D/g, '')}?text=${encodeURIComponent(
                    'Halo Admin RentCar, saya ingin konsultasi mengenai sewa mobil lepas kunci.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <PhoneIcon size={16} />
                  <span>Hubungi Kami Langsung</span>
                </a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
