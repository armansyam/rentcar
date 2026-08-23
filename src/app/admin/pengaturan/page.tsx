'use client';

import React, { useState, useEffect } from 'react';
import { CheckIcon, MapPinIcon, ExternalLinkIcon } from '@/components/ui/Icons';

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

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [originalSettings, setOriginalSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSettings(data.data);
          setOriginalSettings(data.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges || saving) return;

    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setOriginalSettings({ ...settings });
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-bold">Memuat pengaturan...</div>;
  }

  const liveEmbedUrl = getGoogleMapsEmbedUrl(settings.google_maps_url, settings.office_address, settings.office_name);

  return (
    <div className="space-y-6 max-w-4xl pb-24">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pengaturan Bisnis, Kontak & SEO
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola nomor WhatsApp admin, alamat kantor, Google Maps, jam operasional, dan SEO website.
          </p>
        </div>

        {hasChanges && (
          <span className="px-3 py-1.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Ada Perubahan Belum Disimpan
          </span>
        )}
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-xs sm:text-sm text-emerald-900 font-bold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <CheckIcon size={16} />
            </div>
            <div>
              <p className="font-extrabold">Pengaturan Berhasil Disimpan!</p>
              <p className="text-xs text-emerald-700 font-normal">Data langsung terupdate secara real-time di halaman utama website.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSavedSuccess(false)}
            className="text-xs text-emerald-700 hover:text-emerald-900 underline font-semibold"
          >
            Tutup
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Kontak & WhatsApp */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 card-shadow space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>Kontak & Integrasi WhatsApp</span>
            <span className="text-[11px] text-slate-400 font-normal">Penting untuk notifikasi pemesanan</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Nomor WhatsApp Admin (Penerima Booking) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={settings.admin_whatsapp || ''}
                onChange={(e) => handleChange('admin_whatsapp', e.target.value)}
                placeholder="6281234567890"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-mono font-bold focus:bg-white focus:border-brand-navy"
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Format: 628xxxxxxxxxx (Gunakan awalan 62)
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Nomor Telepon Display (Tampilan Website)
              </label>
              <input
                type="text"
                value={settings.company_phone || ''}
                onChange={(e) => handleChange('company_phone', e.target.value)}
                placeholder="0812-3456-7890"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-brand-navy"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Email Perusahaan / CS
            </label>
            <input
              type="email"
              value={settings.company_email || ''}
              onChange={(e) => handleChange('company_email', e.target.value)}
              placeholder="info@rentcar.id"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-brand-navy"
            />
          </div>
        </div>

        {/* Lokasi Kantor & Google Maps */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 card-shadow space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>Lokasi Kantor & Google Maps</span>
            <span className="text-[11px] text-slate-400 font-normal">Sinkron ke bagian bawah homepage & halaman /lokasi</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Nama Kantor / Outlet
              </label>
              <input
                type="text"
                value={settings.office_name || ''}
                onChange={(e) => handleChange('office_name', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-brand-navy"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Jam Operasional Layanan
              </label>
              <input
                type="text"
                value={settings.operational_hours || ''}
                onChange={(e) => handleChange('operational_hours', e.target.value)}
                placeholder="Senin - Minggu: 07.00 - 22.00 WIB"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-brand-navy"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Alamat Lengkap Kantor
            </label>
            <textarea
              rows={2}
              value={settings.office_address || ''}
              onChange={(e) => handleChange('office_address', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-brand-navy"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Link Tautan Google Maps / Kode Embed Iframe
            </label>
            <input
              type="text"
              value={settings.google_maps_url || ''}
              onChange={(e) => handleChange('google_maps_url', e.target.value)}
              placeholder="Contoh: https://maps.app.goo.gl/xxx atau https://maps.google.com/?q=... atau <iframe>...</iframe>"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-mono text-xs focus:bg-white focus:border-brand-navy"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              💡 <em>Tips:</em> Anda bisa tempel link share dari Google Maps atau kode embed HTML iframe.
            </span>
          </div>

          {/* Live Preview of Google Maps */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPinIcon size={14} className="text-rose-500" />
                <span>Pratinjau Peta Interaktif (Live Preview):</span>
              </span>
              <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Otomatis Mengikuti Alamat/Link
              </span>
            </div>
            <div className="h-48 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              <iframe
                src={liveEmbedUrl}
                title="Google Maps Preview"
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Pengaturan SEO */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 card-shadow space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>Search Engine Optimization (SEO Dasar)</span>
            <span className="text-[11px] text-slate-400 font-normal">Untuk Google Search & Social Media Sharing</span>
          </h2>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Meta Title Homepage
            </label>
            <input
              type="text"
              value={settings.meta_title || ''}
              onChange={(e) => handleChange('meta_title', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-brand-navy"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Meta Description Homepage
            </label>
            <textarea
              rows={2}
              value={settings.meta_description || ''}
              onChange={(e) => handleChange('meta_description', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-brand-navy"
            />
          </div>
        </div>

        {/* Floating / Sticky Save Action Bar */}
        <div className="sticky bottom-6 z-40 bg-white/95 backdrop-blur-md border border-slate-200/90 p-4 rounded-2xl shadow-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {hasChanges ? (
              <span className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <span>Ada perubahan belum disimpan!</span>
              </span>
            ) : (
              <span className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                <CheckIcon size={14} className="text-emerald-600" />
                <span>Semua pengaturan tersimpan sinkron.</span>
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={!hasChanges || saving}
            className={`px-6 py-3 rounded-xl font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer ${
              hasChanges && !saving
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-4 ring-emerald-500/20 scale-100 active:scale-95'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Menyimpan ke Database...</span>
              </>
            ) : hasChanges ? (
              <>
                <span>💾 Simpan Perubahan Pengaturan</span>
              </>
            ) : (
              <>
                <CheckIcon size={16} className="text-slate-400" />
                <span>Pengaturan Sudah Tersimpan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
