import React from 'react';
import { MapPinIcon, PhoneIcon, MailIcon, ClockIcon, ExternalLinkIcon } from '@/components/ui/Icons';

interface LocationSectionProps {
  officeName?: string;
  officeAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  googleMapsUrl?: string;
  operationalHours?: string;
}

export default function LocationSection({
  officeName = 'RentCar Office',
  officeAddress = 'Jl. Merdeka No.123, Sukajadi, Kec. Sukajadi, Kota Bandung, Jawa Barat 40161',
  companyPhone = '0812-3456-7890',
  companyEmail = 'info@rentcar.id',
  googleMapsUrl = 'https://maps.google.com/?q=Bandung',
  operationalHours = 'Senin - Minggu: 07.00 - 22.00 WIB',
}: LocationSectionProps) {
  return (
    <section id="lokasi" className="py-16 md:py-20 bg-slate-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
            Kantor Kami
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Lokasi Kantor & Layanan
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            Kunjungi kantor kami untuk serah terima armada atau konsultasi rencana perjalanan Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Simulated Interactive Map Container */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 overflow-hidden card-shadow min-h-[320px] relative flex items-center justify-center p-6 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]">
            {/* Map Graphic Illustration */}
            <div className="w-full h-full min-h-[280px] bg-slate-100/90 rounded-xl border border-slate-200/80 relative flex flex-col items-center justify-center p-6 text-center overflow-hidden">
              {/* Map road lines decoration */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="w-full h-8 bg-slate-400 rotate-12 absolute top-1/4 -left-10" />
                <div className="w-8 h-full bg-slate-400 -rotate-12 absolute -top-10 left-1/3" />
                <div className="w-full h-6 bg-slate-400 -rotate-6 absolute bottom-1/4 -right-10" />
              </div>

              {/* Pin Marker */}
              <div className="relative z-10 animate-bounce">
                <div className="w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg border-2 border-white">
                  <MapPinIcon size={24} />
                </div>
              </div>

              <div className="relative z-10 mt-3 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                <p className="text-xs font-bold text-slate-800">{officeName}</p>
                <p className="text-[11px] text-slate-500">Kota Bandung, Jawa Barat</p>
              </div>

              <div className="absolute bottom-4 right-4 z-10">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white shadow-sm border border-slate-200 text-xs font-semibold text-brand-navy hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <span>Lihat di Peta Besar</span>
                  <ExternalLinkIcon size={13} />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Office Info Details Card matching Mockup */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 card-shadow flex flex-col justify-between space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
                {officeName}
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Pusat operasional armada dan serah terima kendaraan lepas kunci.
              </p>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPinIcon size={16} />
                  </div>
                  <div className="text-slate-700 leading-relaxed font-medium">
                    {officeAddress}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <PhoneIcon size={16} />
                  </div>
                  <div className="text-slate-700 font-semibold">{companyPhone}</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <MailIcon size={16} />
                  </div>
                  <div className="text-slate-700 font-medium">{companyEmail}</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <ClockIcon size={16} />
                  </div>
                  <div className="text-slate-700 font-medium">{operationalHours}</div>
                </div>
              </div>
            </div>

            {/* Google Maps Button */}
            <div className="pt-4 border-t border-slate-100">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 hover:border-slate-400 font-bold text-slate-800 text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-98 shadow-2xs"
              >
                <MapPinIcon size={16} />
                <span>Buka di Google Maps</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
