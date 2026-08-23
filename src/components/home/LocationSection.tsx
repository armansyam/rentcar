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

function getGoogleMapsEmbedUrl(inputUrl?: string, address?: string, officeName?: string): string {
  if (inputUrl) {
    const iframeMatch = inputUrl.match(/src=["']([^"']+)["']/);
    if (iframeMatch && iframeMatch[1]) {
      return iframeMatch[1];
    }
    if (inputUrl.includes('google.com/maps/embed')) {
      return inputUrl;
    }
  }
  const query = encodeURIComponent(address || officeName || 'Bandung, Jawa Barat');
  return `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}

function getDirectMapsUrl(inputUrl?: string, address?: string, officeName?: string): string {
  if (inputUrl) {
    const iframeMatch = inputUrl.match(/src=["']([^"']+)["']/);
    if (iframeMatch) {
      return `https://maps.google.com/?q=${encodeURIComponent(address || officeName || 'Bandung')}`;
    }
    if (inputUrl.startsWith('http')) {
      return inputUrl;
    }
  }
  return `https://maps.google.com/?q=${encodeURIComponent(address || officeName || 'Bandung')}`;
}

export default function LocationSection({
  officeName = 'RentCar Office',
  officeAddress = 'Jl. Merdeka No.123, Sukajadi, Kec. Sukajadi, Kota Bandung, Jawa Barat 40161',
  companyPhone = '0812-3456-7890',
  companyEmail = 'info@rentcar.id',
  googleMapsUrl = 'https://maps.google.com/?q=Bandung',
  operationalHours = 'Senin - Minggu: 07.00 - 22.00 WIB',
}: LocationSectionProps) {
  const embedUrl = getGoogleMapsEmbedUrl(googleMapsUrl, officeAddress, officeName);
  const directMapsUrl = getDirectMapsUrl(googleMapsUrl, officeAddress, officeName);

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
          {/* Left Column: Live Interactive Google Maps Container */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 overflow-hidden card-shadow min-h-[340px] relative flex flex-col p-2">
            <iframe
              src={embedUrl}
              title={`Lokasi ${officeName}`}
              className="w-full h-full min-h-[320px] rounded-xl border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="p-3 bg-white flex items-center justify-between border-t border-slate-100 text-xs">
              <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                <MapPinIcon size={14} className="text-rose-500" />
                <span>{officeName}</span>
              </div>
              <a
                href={directMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-brand-navy font-bold flex items-center gap-1 text-[11px] transition-colors"
              >
                <span>Buka di Google Maps</span>
                <ExternalLinkIcon size={12} />
              </a>
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
