import React from 'react';
import { CheckIcon, FileTextIcon } from '@/components/ui/Icons';

export default function TermsSection() {
  const terms = [
    {
      title: 'KTP & SIM A Asli',
      desc: 'Wajib memiliki e-KTP dan SIM A yang masih berlaku atas nama penyewa.',
    },
    {
      title: 'Dokumen Pendukung',
      desc: 'Kartu Keluarga (KK), ID Pegawai / BPJS / Akun Media Sosial aktif untuk verifikasi identitas.',
    },
    {
      title: 'Deposit / Jaminan',
      desc: 'Deposit keamanan (refundable) atau jaminan kendaraan bermotor roda dua (sesuai kebijakan).',
    },
    {
      title: 'Bahan Bakar & Kebersihan',
      desc: 'Bahan bakar dikembalikan sesuai posisi awal serah terima. Dilarang merokok di dalam kabin mobil.',
    },
    {
      title: 'Durasi & Keterlambatan',
      desc: 'Hitungan sewa harian per 24 jam. Keterlambatan pengembalian dikenakan biaya overtime wajar.',
    },
    {
      title: 'Wilayah Pemakaian',
      desc: 'Penggunaan armada wajib diinformasikan (dalam kota / luar kota) saat pengajuan inquiry.',
    },
  ];

  return (
    <section id="syarat" className="py-16 md:py-20 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
            Ketentuan Rental
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Syarat & Ketentuan Lepas Kunci
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            Persyaratan transparan dan praktis untuk kenyamanan dan keamanan kedua belah pihak.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {terms.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-50/70 rounded-2xl p-6 border border-slate-100/80 flex items-start gap-4"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-brand-green flex items-center justify-center shrink-0 mt-0.5">
                <CheckIcon size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
