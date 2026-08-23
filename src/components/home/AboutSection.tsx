import React from 'react';
import { ShieldCheckIcon, ThumbsUpIcon, KeyIcon, HeadphonesIcon } from '@/components/ui/Icons';

interface AboutSectionProps {
  title?: string;
  text?: string;
}

export default function AboutSection({
  title = 'Tentang Kami',
  text = 'Kami menyediakan layanan penyewaan mobil lepas kunci dengan kondisi prima dan harga kompetitif. Nikmati kebebasan berkendara kapanpun dan kemanapun Anda mau dengan rasa aman dan nyaman.',
}: AboutSectionProps) {
  const benefits = [
    {
      title: 'Aman & Terpercaya',
      desc: 'Armada rutin diservis, bersih, dan siap pakai kapan saja.',
      icon: ShieldCheckIcon,
    },
    {
      title: 'Harga Transparan',
      desc: 'Kualitas terbaik dengan harga jelas tanpa biaya tersembunyi.',
      icon: ThumbsUpIcon,
    },
    {
      title: 'Lepas Kunci (Bebas)',
      desc: 'Privasi terjaga, nikmati kebebasan perjalanan tanpa sopir.',
      icon: KeyIcon,
    },
    {
      title: 'Bantuan 24/7',
      desc: 'Tim customer care siap melayani inquiry dan kebutuhan Anda.',
      icon: HeadphonesIcon,
    },
  ];

  return (
    <section id="tentang" className="py-16 md:py-20 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Intro text */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
            Profil Perusahaan
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
            {text}
          </p>
        </div>

        {/* 4 Benefits Cards matching mockup */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50/70 hover:bg-white rounded-2xl p-6 border border-slate-100/80 card-shadow card-shadow-hover flex flex-col items-center text-center transition-all"
              >
                {/* Clean circle vector icon */}
                <div className="w-14 h-14 rounded-full bg-white border border-slate-200/60 shadow-sm flex items-center justify-center text-brand-navy mb-4 group-hover:scale-110 transition-transform">
                  <Icon size={24} className="text-brand-navy" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
