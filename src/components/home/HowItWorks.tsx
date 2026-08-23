import React from 'react';
import { CarIcon, CalendarIcon, WhatsAppIcon, CheckIcon } from '@/components/ui/Icons';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Pilih Mobil',
      desc: 'Tentukan mobil yang sesuai dengan kapasitas dan kebutuhan perjalanan Anda.',
      icon: CarIcon,
    },
    {
      num: '02',
      title: 'Tentukan Tanggal',
      desc: 'Pilih tanggal mulai, tanggal selesai, serta durasi pemakaian yang direncanakan.',
      icon: CalendarIcon,
    },
    {
      num: '03',
      title: 'Cek Ketersediaan',
      desc: 'Kirim inquiry detail sewa melalui formulir terintegrasi WhatsApp kami.',
      icon: WhatsAppIcon,
    },
    {
      num: '04',
      title: 'Konfirmasi & Serah Terima',
      desc: 'Admin memeriksa ketersediaan armada, verifikasi syarat, dan mobil siap diambil.',
      icon: CheckIcon,
    },
  ];

  return (
    <section id="cara-sewa" className="py-16 md:py-20 bg-slate-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
            Alur Pemesanan
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Cara Mudah Sewa Mobil Lepas Kunci
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            Hanya 4 langkah cepat dari memilih armada hingga mobil siap Anda kendarai.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 card-shadow card-shadow-hover relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-slate-200">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-brand-navy">
                      <Icon size={20} />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
