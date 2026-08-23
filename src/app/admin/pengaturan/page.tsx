'use client';

import React, { useState, useEffect } from 'react';
import { CheckIcon, MapPinIcon, ExternalLinkIcon, PhoneIcon, MailIcon, ClockIcon } from '@/components/ui/Icons';

function getGoogleMapsEmbedUrl(inputUrl?: string, address?: string, officeName?: string): string {
  if (inputUrl) {
    const iframeMatch = inputUrl.match(/src=["']([^"']+)["']/i);
    if (iframeMatch && iframeMatch[1]) {
      return iframeMatch[1];
    }
    if (inputUrl.includes('google.com/maps/embed') || inputUrl.includes('output=embed')) {
      return inputUrl;
    }
  }
  const query = encodeURIComponent(address || officeName || 'Bandung, Jawa Barat');
  return `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}

type SectionType = 'contact' | 'location' | 'seo' | null;

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [originalSettings, setOriginalSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<SectionType>(null);
  const [savingSection, setSavingSection] = useState<SectionType>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Maps check state
  const [checkingMap, setCheckingMap] = useState(false);
  const [mapCheckMessage, setMapCheckMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const handleCancel = () => {
    setSettings({ ...originalSettings });
    setEditingSection(null);
    setMapCheckMessage(null);
  };

  const handleSaveSection = async (section: 'contact' | 'location' | 'seo', sectionName: string) => {
    setSavingSection(section);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setOriginalSettings({ ...settings });
        setEditingSection(null);
        setMapCheckMessage(null);
        setSuccessToast(`Pengaturan ${sectionName} berhasil disimpan!`);
        setTimeout(() => setSuccessToast(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSection(null);
    }
  };

  const handleCheckMapUrl = async () => {
    const mapUrl = settings.google_maps_url?.trim();
    if (!mapUrl) {
      setMapCheckMessage({
        type: 'error',
        text: 'Masukkan link Google Maps terlebih dahulu.',
      });
      return;
    }

    setCheckingMap(true);
    setMapCheckMessage(null);

    try {
      const res = await fetch('/api/public/resolve-maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: mapUrl }),
      });
      const data = await res.json();
      if (data.success && data.embedUrl) {
        setSettings((prev) => ({
          ...prev,
          google_maps_embed: data.embedUrl,
        }));
        setMapCheckMessage({
          type: 'success',
          text: `Lokasi Berhasil Terdeteksi: ${data.query || 'Peta siap'}`,
        });
      } else {
        setMapCheckMessage({
          type: 'error',
          text: data.error || 'Gagal mendeteksi link peta.',
        });
      }
    } catch (err: any) {
      setMapCheckMessage({
        type: 'error',
        text: `Koneksi gagal: ${err.message}`,
      });
    } finally {
      setCheckingMap(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-bold">Memuat pengaturan...</div>;
  }

  const liveEmbedUrl = settings.google_maps_embed || getGoogleMapsEmbedUrl(settings.google_maps_url, settings.office_address, settings.office_name);

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Pengaturan Bisnis, Kontak & SEO
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Kelola nomor WhatsApp admin, alamat kantor, Google Maps, jam operasional, dan SEO website secara mandiri per bagian.
        </p>
      </div>

      {/* Success Notification Banner */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-900 font-bold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <CheckIcon size={14} />
            </div>
            <span>{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-xs text-emerald-700 hover:text-emerald-900 underline font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: Kontak & WhatsApp                                             */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 card-shadow space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Kontak & WhatsApp
            </h2>
            <p className="text-[11px] text-slate-400">Nomor penerima pesanan dan kontak layanan pelanggan</p>
          </div>

          {editingSection !== 'contact' ? (
            <button
              type="button"
              onClick={() => {
                setEditingSection('contact');
                setMapCheckMessage(null);
              }}
              className="text-xs font-bold text-brand-navy hover:text-brand-navy-light underline cursor-pointer px-2 py-1"
            >
              Edit
            </button>
          ) : (
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
              Mode Edit
            </span>
          )}
        </div>

        {/* View Mode */}
        {editingSection !== 'contact' ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm pt-1">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-xs block mb-1">WhatsApp Admin (Penerima Booking)</span>
              <span className="font-mono font-extrabold text-slate-900">
                {settings.admin_whatsapp ? `+${settings.admin_whatsapp}` : '-'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-xs block mb-1">Telepon Display</span>
              <span className="font-bold text-slate-900">
                {settings.company_phone || '-'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-xs block mb-1">Email Perusahaan</span>
              <span className="font-bold text-slate-900">
                {settings.company_email || '-'}
              </span>
            </div>
          </div>
        ) : (
          /* Edit Mode Form */
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Nomor WhatsApp Admin <span className="text-rose-500">*</span>
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
                  Format: 628xxxxxxxxxx (Awalan 62)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Nomor Telepon Display Website
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
                Email Perusahaan / Customer Service
              </label>
              <input
                type="email"
                value={settings.company_email || ''}
                onChange={(e) => handleChange('company_email', e.target.value)}
                placeholder="info@rentcar.id"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-brand-navy"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={savingSection === 'contact'}
                onClick={() => handleSaveSection('contact', 'Kontak')}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-navy hover:bg-brand-navy-light text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {savingSection === 'contact' ? 'Menyimpan...' : 'Simpan Kontak'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: Lokasi Kantor & Google Maps                                   */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 card-shadow space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Lokasi Kantor & Google Maps
            </h2>
            <p className="text-[11px] text-slate-400">Sinkron ke tampilan peta di website utama</p>
          </div>

          {editingSection !== 'location' ? (
            <button
              type="button"
              onClick={() => {
                setEditingSection('location');
                setMapCheckMessage(null);
              }}
              className="text-xs font-bold text-brand-navy hover:text-brand-navy-light underline cursor-pointer px-2 py-1"
            >
              Edit
            </button>
          ) : (
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
              Mode Edit
            </span>
          )}
        </div>

        {/* View Mode */}
        {editingSection !== 'location' ? (
          <div className="space-y-4 pt-1 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-xs block mb-1">Nama Kantor / Outlet</span>
                <span className="font-bold text-slate-900">{settings.office_name || '-'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-xs block mb-1">Jam Operasional</span>
                <span className="font-bold text-slate-900">{settings.operational_hours || '-'}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-xs block mb-1">Alamat Lengkap</span>
              <span className="font-semibold text-slate-800 leading-relaxed block">
                {settings.office_address || '-'}
              </span>
            </div>

            {/* Interactive Live Map Preview in View Mode */}
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              <div className="p-2.5 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-slate-700 font-bold">
                  <MapPinIcon size={14} className="text-rose-500" />
                  <span>Peta Lokasi Terpasang</span>
                </div>
                {settings.google_maps_url && (
                  <a
                    href={settings.google_maps_url.startsWith('http') ? settings.google_maps_url : `https://maps.google.com/?q=${encodeURIComponent(settings.office_address || '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-brand-navy font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Buka Google Maps</span>
                    <ExternalLinkIcon size={11} />
                  </a>
                )}
              </div>
              <div className="h-56">
                <iframe
                  src={liveEmbedUrl}
                  title="Google Maps"
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        ) : (
          /* Edit Mode Form */
          <div className="space-y-4 pt-2">
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
                Link Google Maps / Kode Embed Iframe
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={settings.google_maps_url || ''}
                  onChange={(e) => {
                    handleChange('google_maps_url', e.target.value);
                    setMapCheckMessage(null);
                  }}
                  placeholder="Contoh: https://maps.app.goo.gl/xxx atau https://maps.google.com/?q=..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-mono text-xs focus:bg-white focus:border-brand-navy"
                />

                <button
                  type="button"
                  onClick={handleCheckMapUrl}
                  disabled={checkingMap}
                  className="px-4 py-2.5 rounded-xl bg-brand-navy hover:bg-brand-navy-light text-white font-bold text-xs shrink-0 flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {checkingMap ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Mengecek...</span>
                    </>
                  ) : (
                    <>
                      <MapPinIcon size={14} />
                      <span>🔍 Cek & Muat Peta</span>
                    </>
                  )}
                </button>
              </div>

              {mapCheckMessage && (
                <div
                  className={`mt-2 p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    mapCheckMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  <span>{mapCheckMessage.type === 'success' ? '✅' : '⚠️'}</span>
                  <span>{mapCheckMessage.text}</span>
                </div>
              )}
            </div>

            {/* Live Preview Map during edit */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 block mb-1.5">
                Pratinjau Peta Interaktif:
              </span>
              <div className="h-48 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <iframe
                  src={liveEmbedUrl}
                  title="Google Maps Preview"
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={savingSection === 'location'}
                onClick={() => handleSaveSection('location', 'Lokasi & Peta')}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-navy hover:bg-brand-navy-light text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {savingSection === 'location' ? 'Menyimpan...' : 'Simpan Lokasi'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: SEO & Meta Tag Website                                         */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 card-shadow space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Search Engine Optimization (SEO)
            </h2>
            <p className="text-[11px] text-slate-400">Meta tag untuk Google Search dan pratinjau link sosial media</p>
          </div>

          {editingSection !== 'seo' ? (
            <button
              type="button"
              onClick={() => {
                setEditingSection('seo');
                setMapCheckMessage(null);
              }}
              className="text-xs font-bold text-brand-navy hover:text-brand-navy-light underline cursor-pointer px-2 py-1"
            >
              Edit
            </button>
          ) : (
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
              Mode Edit
            </span>
          )}
        </div>

        {/* View Mode */}
        {editingSection !== 'seo' ? (
          <div className="space-y-3 pt-1 text-xs sm:text-sm">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-xs block mb-1">Meta Title Homepage</span>
              <span className="font-bold text-slate-900 block">
                {settings.meta_title || '-'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-xs block mb-1">Meta Description Homepage</span>
              <span className="text-slate-700 leading-relaxed block">
                {settings.meta_description || '-'}
              </span>
            </div>
          </div>
        ) : (
          /* Edit Mode Form */
          <div className="space-y-4 pt-2">
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

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={savingSection === 'seo'}
                onClick={() => handleSaveSection('seo', 'SEO')}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-navy hover:bg-brand-navy-light text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {savingSection === 'seo' ? 'Menyimpan...' : 'Simpan SEO'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
