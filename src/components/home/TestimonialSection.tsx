import React from 'react';
import Image from 'next/image';
import { StarIcon } from '@/components/ui/Icons';

export default function TestimonialSection() {
  const testimonials = [
    {
      name: 'Dewi Lestari',
      role: 'Penyewa Liburan Keluarga',
      avatar: '/images/avatars/dewi.jpg',
      rating: 5,
      comment:
        'Pelayanan sangat ramah dan mobil bersih nyaman. Kondisi Innova Reborn yang kami sewa sangat prima untuk perjalanan luar kota. Proses booking juga mudah dan respon WhatsApp cepat!',
    },
    {
      name: 'Budi Santoso',
      role: 'Perjalanan Bisnis Eksekutif',
      avatar: '/images/avatars/dewi.jpg', // fallback avatar
      rating: 5,
      comment:
        'Sangat puas dengan sistem lepas kunci di sini. Syaratnya masuk akal dan jelas, tanpa biaya tersembunyi. Mobil tepat waktu diantar ke lokasi pengambilan. Sangat direkomendasikan!',
    },
    {
      name: 'Rian Pratama',
      role: 'Sewa Avanza Mingguan',
      avatar: '/images/avatars/dewi.jpg',
      rating: 5,
      comment:
        'Avanza yang disewa irit sekali dan terawat seperti mobil baru. AC dingin dan ban masih tebal. Pasti akan sewa kembali untuk agenda berikutnya.',
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
            Ulasan Kepuasan
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Apa Kata Pelanggan?
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            Pengalaman nyata pelanggan yang telah menikmati kenyamanan rental mobil lepas kunci bersama kami.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-50/70 rounded-2xl p-6 sm:p-7 border border-slate-200/70 card-shadow card-shadow-hover flex flex-col justify-between"
            >
              {/* Star Rating */}
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(item.rating)].map((_, i) => (
                    <StarIcon key={i} size={17} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic mb-6">
                  &ldquo;{item.comment}&rdquo;
                </p>
              </div>

              {/* Customer Avatar & Name */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60">
                <div className="w-10 h-10 rounded-full overflow-hidden relative border border-slate-200 shrink-0">
                  <Image
                    src={item.avatar}
                    alt={item.name}
                    fill
                    loading="lazy"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                    {item.name}
                  </h4>
                  <span className="text-[11px] text-slate-500">{item.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
