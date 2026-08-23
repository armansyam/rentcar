'use client';

import React, { useState, useEffect } from 'react';
import { CheckIcon } from '@/components/ui/Icons';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSettings(data.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Memuat pengaturan...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Pengaturan Bisnis, Kontak & SEO
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Kelola nomor WhatsApp admin untuk inquiry, alamat kantor, jam operasional, dan meta tag SEO.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-800 font-bold flex items-center gap-2">
          <CheckIcon size={18} className="text-emerald-600" />
          <span>Pengaturan berhasil diperbarui!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Kontak & WhatsApp */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 card-shadow space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Kontak & Integrasi WhatsApp
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Nomor WhatsApp Admin (Untuk Penerimaan Inquiry) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={settings.admin_whatsapp || ''}
                onChange={(e) => handleChange('admin_whatsapp', e.target.value)}
                placeholder="6281234567890"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-mono"
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Format: 628xxxxxxxxxx (Gunakan awalan 62)
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Nomor Telepon Display
              </label>
              <input
                type="text"
                value={settings.company_phone || ''}
                onChange={(e) => handleChange('company_phone', e.target.value)}
                placeholder="0812-3456-7890"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Email Perusahaan
            </label>
            <input
              type="email"
              value={settings.company_email || ''}
              onChange={(e) => handleChange('company_email', e.target.value)}
              placeholder="info@rentcar.id"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800"
            />
          </div>
        </div>

        {/* Lokasi Kantor */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 card-shadow space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Lokasi Kantor & Jam Operasional
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Jam Operasional
              </label>
              <input
                type="text"
                value={settings.operational_hours || ''}
                onChange={(e) => handleChange('operational_hours', e.target.value)}
                placeholder="Senin - Minggu: 07.00 - 22.00 WIB"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800"
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Link Tautan Google Maps
            </label>
            <input
              type="text"
              value={settings.google_maps_url || ''}
              onChange={(e) => handleChange('google_maps_url', e.target.value)}
              placeholder="https://maps.google.com/?q=..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-mono text-xs"
            />
          </div>
        </div>

        {/* Pengaturan SEO */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 card-shadow space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Search Engine Optimization (SEO Dasar)
          </h2>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Meta Title Homepage
            </label>
            <input
              type="text"
              value={settings.meta_title || ''}
              onChange={(e) => handleChange('meta_title', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800"
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-brand-navy hover:bg-brand-navy-light text-white font-bold text-sm shadow-md transition-all active:scale-98 disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan Semua Pengaturan'}
          </button>
        </div>
      </form>
    </div>
  );
}
