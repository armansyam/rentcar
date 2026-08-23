'use client';

import React, { useState, useEffect } from 'react';
import { CheckIcon } from '@/components/ui/Icons';

export default function AdminContentPage() {
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
    return <div className="p-8 text-center text-slate-500">Memuat data konten...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Manajemen Konten Website
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ubah headline hero, teks tentang kami, profil rental, dan pesan publik secara dinamis.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-800 font-bold flex items-center gap-2">
          <CheckIcon size={18} className="text-emerald-600" />
          <span>Konten berhasil disimpan dan otomatis ter-update di landing page!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Hero Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 card-shadow space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Section Hero (Header Utama)
          </h2>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Badge Teks Hero
            </label>
            <input
              type="text"
              value={settings.hero_badge || ''}
              onChange={(e) => handleChange('hero_badge', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Judul Utama Hero (H1)
            </label>
            <input
              type="text"
              value={settings.hero_title || ''}
              onChange={(e) => handleChange('hero_title', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Deskripsi Pendukung Hero
            </label>
            <textarea
              rows={2}
              value={settings.hero_subtitle || ''}
              onChange={(e) => handleChange('hero_subtitle', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800"
            />
          </div>
        </div>

        {/* Section 2: Tentang Kami */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 card-shadow space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Section Tentang Kami
          </h2>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Judul Section
            </label>
            <input
              type="text"
              value={settings.about_title || ''}
              onChange={(e) => handleChange('about_title', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Paragraf Profil Perusahaan
            </label>
            <textarea
              rows={3}
              value={settings.about_text || ''}
              onChange={(e) => handleChange('about_text', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-brand-navy hover:bg-brand-navy-light text-white font-bold text-sm shadow-md transition-all active:scale-98 disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan Semua Perubahan Konten'}
          </button>
        </div>
      </form>
    </div>
  );
}
