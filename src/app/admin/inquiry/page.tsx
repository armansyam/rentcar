'use client';

import React, { useState, useEffect } from 'react';
import {
  FileTextIcon,
  WhatsAppIcon,
  TrashIcon,
  CalendarIcon,
  MapPinIcon,
  XIcon,
} from '@/components/ui/Icons';

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);

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

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchInquiries();
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteInquiry = async (id: string, invoiceNo: string) => {
    if (!confirm(`Hapus inquiry ${invoiceNo}?`)) return;
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

  const statusList = ['Semua', 'NEW', 'CHECKING', 'AVAILABLE', 'NOT_AVAILABLE', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

  const filteredInquiries =
    filterStatus === 'Semua'
      ? inquiries
      : inquiries.filter((inq) => inq.status === filterStatus);

  const statusColors: Record<string, string> = {
    NEW: 'bg-blue-100 text-blue-700 border-blue-200',
    CHECKING: 'bg-amber-100 text-amber-700 border-amber-200',
    AVAILABLE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    NOT_AVAILABLE: 'bg-rose-100 text-rose-700 border-rose-200',
    CONFIRMED: 'bg-purple-100 text-purple-700 border-purple-200',
    COMPLETED: 'bg-slate-100 text-slate-700 border-slate-200',
    CANCELLED: 'bg-gray-100 text-gray-500 border-gray-200',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Log Inquiry Pelanggan
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Daftar formulir sewa yang diajukan pengunjung website dan status konfirmasi ketersediaan armada.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {statusList.map((st) => {
          const isActive = filterStatus === st;
          return (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-brand-navy text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="px-5 py-3.5">Invoice</th>
                <th className="px-5 py-3.5">Customer & Kontak</th>
                <th className="px-5 py-3.5">Armada Dicari</th>
                <th className="px-5 py-3.5">Jadwal Sewa</th>
                <th className="px-5 py-3.5">Status Inquiry</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInquiries.length > 0 ? (
                filteredInquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-brand-navy">
                      <button
                        onClick={() => setSelectedInquiry(inq)}
                        className="hover:underline text-left"
                      >
                        {inq.invoice_no}
                      </button>
                      <div className="text-[10px] text-slate-400 font-sans font-normal mt-0.5">
                        {new Date(inq.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{inq.customer_name}</div>
                      <div className="text-slate-500 text-xs font-mono">{inq.customer_phone}</div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {inq.car_name}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <div>{inq.start_date} – {inq.end_date}</div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        Durasi: {inq.duration_days} hari
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={inq.status}
                        onChange={(e) => handleUpdateStatus(inq.id, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                          statusColors[inq.status] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <option value="NEW">NEW</option>
                        <option value="CHECKING">CHECKING</option>
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="NOT_AVAILABLE">NOT_AVAILABLE</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`https://wa.me/${inq.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Halo ${inq.customer_name}, kami dari RentCar menindaklanjuti inquiry ${inq.invoice_no} untuk mobil ${inq.car_name} pada tanggal ${inq.start_date}.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold text-xs inline-flex items-center gap-1.5"
                        >
                          <WhatsAppIcon size={14} className="text-brand-green-wa" />
                          <span>WhatsApp</span>
                        </a>
                        <button
                          onClick={() => handleDeleteInquiry(inq.id, inq.invoice_no)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Hapus"
                        >
                          <TrashIcon size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400 text-sm">
                    Tidak ada inquiry yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 card-shadow space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Detail Inquiry</span>
                <h3 className="text-lg font-bold text-brand-navy">
                  {selectedInquiry.invoice_no}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <XIcon size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Nama Customer</span>
                <span className="font-bold text-slate-900">{selectedInquiry.customer_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Nomor WhatsApp</span>
                <span className="font-mono font-semibold text-slate-800">{selectedInquiry.customer_phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Mobil Dipilih</span>
                <span className="font-bold text-slate-900">{selectedInquiry.car_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Tanggal Sewa</span>
                <span className="font-medium text-slate-800">
                  {selectedInquiry.start_date} – {selectedInquiry.end_date} ({selectedInquiry.duration_days} hari)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Lokasi Pengambilan</span>
                <span className="font-medium text-slate-800">{selectedInquiry.pickup_location}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Tujuan</span>
                <span className="font-medium text-slate-800">{selectedInquiry.destination || '-'}</span>
              </div>
              <div className="py-1">
                <span className="text-slate-400 block mb-1">Catatan Tambahan:</span>
                <p className="p-3 bg-slate-50 rounded-xl text-slate-700 italic border border-slate-100">
                  {selectedInquiry.notes || 'Tidak ada catatan.'}
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
              >
                Tutup
              </button>
              <a
                href={`https://wa.me/${selectedInquiry.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Halo Kak ${selectedInquiry.customer_name}, armada ${selectedInquiry.car_name} untuk tanggal ${selectedInquiry.start_date} TERSEDIA. Silakan lengkapi data verifikasi berikut.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 rounded-xl bg-brand-green-wa hover:bg-emerald-600 text-white font-bold inline-flex items-center gap-2"
              >
                <WhatsAppIcon size={16} />
                <span>Balas ke WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
