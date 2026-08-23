'use client';

import React, { useState } from 'react';
import { ChevronDownIcon } from '@/components/ui/Icons';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Apakah tersedia sewa mobil lepas kunci tanpa driver?',
      a: 'Ya, seluruh armada kami siap untuk disewa secara lepas kunci (self-drive) sesuai dengan syarat dan ketentuan verifikasi dokumen yang berlaku.',
    },
    {
      q: 'Bagaimana cara mengetahui ketersediaan mobil?',
      a: 'Cukup pilih mobil dan tanggal yang Anda inginkan pada formulir di website, lalu klik "Kirim via WhatsApp". Admin kami akan segera mengecek dan mengonfirmasi ketersediaan armada dalam hitungan menit.',
    },
    {
      q: 'Apakah bisa digunakan untuk perjalanan luar kota?',
      a: 'Tentu bisa. Silakan cantumkan kota tujuan Anda pada formulir inquiry agar kami dapat mempersiapkan kendaraan yang paling sesuai untuk rute perjalanan Anda.',
    },
    {
      q: 'Apa saja dokumen yang perlu disiapkan?',
      a: 'Penyewa wajib melampirkan foto e-KTP asli, SIM A aktif, serta dokumen identitas pendukung (seperti KK/ID Karyawan/NPWP). Verifikasi dilakukan secara cepat dan aman melalui WhatsApp.',
    },
    {
      q: 'Bagaimana sistem perhitungan durasi sewa?',
      a: 'Perhitungan sewa harian adalah 24 jam terhitung sejak waktu serah terima kendaraan dilakukan.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 md:py-20 bg-slate-50 border-b border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
            Pertanyaan Umum
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions (FAQ)
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            Jawaban lengkap atas pertanyaan yang sering diajukan calon penyewa armada lepas kunci.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden card-shadow transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(idx)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-800 hover:text-brand-navy transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <div
                    className={`transform transition-transform duration-200 text-slate-400 shrink-0 ${
                      isOpen ? 'rotate-180 text-brand-navy' : ''
                    }`}
                  >
                    <ChevronDownIcon size={20} />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100/60 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
