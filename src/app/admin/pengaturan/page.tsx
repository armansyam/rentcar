'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  CheckIcon,
  MapPinIcon,
  ExternalLinkIcon,
  PhoneIcon,
  MailIcon,
  ClockIcon,
  GlobeIcon,
  SearchIcon,
  BuildingIcon,
  CreditCardIcon,
  InstagramIcon,
  FileTextIcon,
  LockIcon,
  KeyIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeOffIcon,
  DatabaseIcon,
  DownloadIcon,
  UploadIcon,
  TrashIcon,
  RefreshCwIcon,
} from '@/components/ui/Icons';

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

type SectionType = 'profile' | 'payment' | 'contact' | 'location' | 'social' | 'seo' | 'security' | null;

interface DatabaseInfo {
  dbPath: string;
  dbSize: string;
  lastModified: string;
  totalCars: number;
  totalInquiries: number;
  totalSettings: number;
  backups: Array<{
    filename: string;
    size: string;
    createdAt: string;
    createdFormatted: string;
  }>;
}

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

  // Upload state
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const qrisInputRef = useRef<HTMLInputElement>(null);
  const ogFileInputRef = useRef<HTMLInputElement>(null);

  // Security & Password state
  const [adminUsername, setAdminUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [savingSecurity, setSavingSecurity] = useState(false);

  // Database Backup & Restore state
  const [dbInfo, setDbInfo] = useState<DatabaseInfo | null>(null);
  const [loadingDb, setLoadingDb] = useState(false);
  const [dbActionLoading, setDbActionLoading] = useState<string | null>(null);
  const [dbMessage, setDbMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [restoreConfirmFile, setRestoreConfirmFile] = useState<string | null>(null);
  const dbFileInputRef = useRef<HTMLInputElement>(null);

  const fetchDbInfo = async () => {
    try {
      const res = await fetch('/api/admin/database?action=info');
      const data = await res.json();
      if (data.success) {
        setDbInfo(data.data);
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSettings(data.data);
          setOriginalSettings(data.data);
          setAdminUsername(data.data.admin_username || 'admin');
        }
      })
      .finally(() => setLoading(false));

    fetchDbInfo();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleCancel = () => {
    setSettings({ ...originalSettings });
    setEditingSection(null);
    setMapCheckMessage(null);
    setSecurityError(null);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSaveSection = async (section: SectionType, sectionName: string) => {
    if (!section) return;
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

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError(null);

    if (!currentPassword) {
      setSecurityError('Password saat ini wajib diisi untuk verifikasi keamanan.');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setSecurityError('Password baru minimal 6 karakter.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setSecurityError('Konfirmasi password baru tidak cocok.');
      return;
    }

    setSavingSecurity(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword: newPassword || undefined,
          newUsername: adminUsername || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessToast(data.message || 'Kredensial keamanan akun admin berhasil diperbarui!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setEditingSection(null);
        if (data.username) {
          setSettings((prev) => ({ ...prev, admin_username: data.username }));
          setAdminUsername(data.username);
        }
        setTimeout(() => setSuccessToast(null), 4000);
      } else {
        setSecurityError(data.error || 'Gagal memperbarui keamanan.');
      }
    } catch (err: any) {
      setSecurityError('Terjadi kesalahan jaringan saat memperbarui password.');
    } finally {
      setSavingSecurity(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingField(targetKey);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        handleChange(targetKey, data.url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingField(null);
    }
  };

  // Database actions
  const handleCreateSnapshot = async () => {
    setDbActionLoading('snapshot');
    setDbMessage(null);
    try {
      const res = await fetch('/api/admin/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_snapshot' }),
      });
      const data = await res.json();
      if (data.success) {
        setDbMessage({ type: 'success', text: data.message });
        fetchDbInfo();
      } else {
        setDbMessage({ type: 'error', text: data.error || 'Gagal membuat snapshot.' });
      }
    } catch (err: any) {
      setDbMessage({ type: 'error', text: err.message || 'Kesalahan jaringan saat membuat snapshot.' });
    } finally {
      setDbActionLoading(null);
    }
  };

  const handleRestoreSnapshot = async (filename: string) => {
    setDbActionLoading(`restore-${filename}`);
    setDbMessage(null);
    try {
      const res = await fetch('/api/admin/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore_snapshot', filename }),
      });
      const data = await res.json();
      if (data.success) {
        setDbMessage({ type: 'success', text: data.message });
        setRestoreConfirmFile(null);
        fetchDbInfo();
        // Refresh settings as well
        fetch('/api/settings').then((r) => r.json()).then((d) => {
          if (d.success) setSettings(d.data);
        });
      } else {
        setDbMessage({ type: 'error', text: data.error || 'Gagal merestore snapshot.' });
      }
    } catch (err: any) {
      setDbMessage({ type: 'error', text: err.message || 'Kesalahan jaringan saat restore.' });
    } finally {
      setDbActionLoading(null);
    }
  };

  const handleDeleteSnapshot = async (filename: string) => {
    if (!confirm(`Hapus file snapshot "${filename}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setDbActionLoading(`delete-${filename}`);
    setDbMessage(null);
    try {
      const res = await fetch('/api/admin/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_snapshot', filename }),
      });
      const data = await res.json();
      if (data.success) {
        setDbMessage({ type: 'success', text: data.message });
        fetchDbInfo();
      } else {
        setDbMessage({ type: 'error', text: data.error || 'Gagal menghapus snapshot.' });
      }
    } catch (err: any) {
      setDbMessage({ type: 'error', text: err.message || 'Kesalahan jaringan saat hapus.' });
    } finally {
      setDbActionLoading(null);
    }
  };

  const handleImportDatabaseFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm(`PERINGATAN: Apakah Anda yakin ingin me-restore database dari file "${file.name}"? Data mobil, pesanan, dan pengaturan saat ini akan digantikan.`)) {
      if (dbFileInputRef.current) dbFileInputRef.current.value = '';
      return;
    }

    setDbActionLoading('import');
    setDbMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/database', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setDbMessage({ type: 'success', text: data.message });
        fetchDbInfo();
        // Refresh active settings
        fetch('/api/settings').then((r) => r.json()).then((d) => {
          if (d.success) setSettings(d.data);
        });
      } else {
        setDbMessage({ type: 'error', text: data.error || 'Gagal mengimpor database.' });
      }
    } catch (err: any) {
      setDbMessage({ type: 'error', text: err.message || 'Kesalahan jaringan saat mengimpor database.' });
    } finally {
      setDbActionLoading(null);
      if (dbFileInputRef.current) dbFileInputRef.current.value = '';
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
          google_maps_url: data.resolvedUrl || prev.google_maps_url,
          google_maps_embed: data.embedUrl,
        }));
        setMapCheckMessage({
          type: 'success',
          text: `Lokasi berhasil dimuat: ${data.placeName || 'Peta siap digunakan'}`,
        });
      } else {
        setMapCheckMessage({
          type: 'error',
          text: data.error || 'Gagal memuat peta dari link tersebut.',
        });
      }
    } catch (err: any) {
      setMapCheckMessage({
        type: 'error',
        text: err.message || 'Terjadi kesalahan jaringan saat mengecek peta.',
      });
    } finally {
      setCheckingMap(false);
    }
  };

  const liveEmbedUrl =
    settings.google_maps_embed ||
    getGoogleMapsEmbedUrl(settings.google_maps_url, settings.office_address, settings.office_name);

  // SEO Helpers
  const metaTitle = settings.meta_title || 'Rental Mobil Bandung | Sewa Mobil Lepas Kunci - RentCar';
  const metaDesc =
    settings.meta_description ||
    'Sewa mobil lepas kunci di Bandung dengan armada terawat, harga transparan, dan proses pemesanan praktis via WhatsApp.';
  const canonicalUrl = settings.canonical_url || 'https://rentcar.id';
  const ogImageUrl = settings.og_image || '/images/cars/hero-luxury-black-suv.jpg';
  const keywordsList = settings.meta_keywords
    ? settings.meta_keywords.split(',').map((k) => k.trim()).filter(Boolean)
    : ['rental mobil bandung', 'sewa mobil lepas kunci', 'rentcar bandung', 'rental alphard', 'sewa innova reborn'];

  const presetOgImages = [
    { label: 'Hero SUV Hitam', url: '/images/cars/hero-luxury-black-suv.jpg' },
    { label: 'Toyota Alphard', url: '/images/cars/toyota-alphard.jpg' },
    { label: 'Toyota Fortuner', url: '/images/cars/toyota-fortuner.jpg' },
    { label: 'Toyota Innova Reborn', url: '/images/cars/toyota-innova-reborn.jpg' },
  ];

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400">
        Memuat data pengaturan...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl pb-24">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Pengaturan Bisnis, Keamanan & Database
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Kelola profil bisnis, rekening bank resmi, kontak WhatsApp, alamat kantor, SEO website, keamanan akun admin, dan cadangan database SQLite.
        </p>
      </div>

      {/* Floating Success Toast */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-800 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-fade-in border border-emerald-700">
          <CheckIcon size={16} className="text-emerald-300" />
          <span>{successToast}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: Profil & Branding Perusahaan                                   */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 card-shadow space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <BuildingIcon size={18} className="text-brand-navy" />
              <span>Profil & Branding Perusahaan</span>
            </h2>
            <p className="text-[11px] text-slate-400">Identitas nama rental, slogan/tagline, logo resmi, dan favicon tab browser</p>
          </div>

          {editingSection !== 'profile' ? (
            <button
              type="button"
              onClick={() => {
                setEditingSection('profile');
                setMapCheckMessage(null);
              }}
              className="text-xs font-bold text-brand-navy hover:text-brand-navy-light underline cursor-pointer px-2 py-1"
            >
              Edit
            </button>
          ) : (
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Mode Edit
            </span>
          )}
        </div>

        {/* View Mode */}
        {editingSection !== 'profile' ? (
          <div className="space-y-4 pt-1 text-xs sm:text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 overflow-hidden relative shrink-0 flex items-center justify-center p-1 shadow-2xs">
                {settings.company_logo ? (
                  <img
                    src={settings.company_logo}
                    alt="Logo Perusahaan"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/favicon.png';
                    }}
                  />
                ) : (
                  <span className="font-black text-brand-navy text-lg">RC</span>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-slate-900 text-base">{settings.company_name || 'RentCar'}</h3>
                  {settings.established_year && (
                    <span className="text-[10px] bg-brand-navy/10 text-brand-navy font-bold px-2 py-0.5 rounded-md">
                      Est. {settings.established_year}
                    </span>
                  )}
                </div>
                <p className="text-slate-600 text-xs font-medium">
                  {settings.company_tagline || 'Sewa Mobil Lepas Kunci Terpercaya'}
                </p>
                {settings.business_license && (
                  <span className="text-[11px] text-slate-500 block font-mono">
                    NIB / Izin Usaha: {settings.business_license}
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Edit Mode Form */
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Nama Bisnis / Brand Rental *
                </label>
                <input
                  type="text"
                  required
                  value={settings.company_name || ''}
                  onChange={(e) => handleChange('company_name', e.target.value)}
                  placeholder="RentCar Bandung"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-bold focus:bg-white focus:border-brand-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Tagline / Slogan Bisnis
                </label>
                <input
                  type="text"
                  value={settings.company_tagline || ''}
                  onChange={(e) => handleChange('company_tagline', e.target.value)}
                  placeholder="Sewa Mobil Lepas Kunci Nyaman & Terpercaya"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-brand-navy"
                />
              </div>
            </div>

            {/* Logo & Favicon Upload */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Logo Resmi (Navbar & Header)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl border border-slate-200 bg-slate-100 overflow-hidden relative shrink-0 flex items-center justify-center p-1">
                    {settings.company_logo ? (
                      <img
                        src={settings.company_logo}
                        alt="Logo Preview"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/logo.png';
                        }}
                      />
                    ) : (
                      <span className="text-xs font-bold text-slate-400">No Logo</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      ref={logoInputRef}
                      onChange={(e) => handleFileUpload(e, 'company_logo')}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploadingField === 'company_logo'}
                      onClick={() => logoInputRef.current?.click()}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer block"
                    >
                      {uploadingField === 'company_logo' ? 'Mengunggah...' : '📁 Unggah Logo'}
                    </button>
                    <input
                      type="text"
                      value={settings.company_logo || ''}
                      onChange={(e) => handleChange('company_logo', e.target.value)}
                      placeholder="/images/logo.png"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 text-xs text-slate-700 font-mono focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Favicon Browser (Tab Browser)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl border border-slate-200 bg-slate-100 overflow-hidden relative shrink-0 flex items-center justify-center p-2">
                    <img
                      src={settings.favicon_url || settings.company_logo || '/favicon.png'}
                      alt="Favicon Preview"
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/favicon.png';
                      }}
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      ref={faviconInputRef}
                      onChange={(e) => handleFileUpload(e, 'favicon_url')}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploadingField === 'favicon_url'}
                      onClick={() => faviconInputRef.current?.click()}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer block"
                    >
                      {uploadingField === 'favicon_url' ? 'Mengunggah...' : '📁 Unggah Favicon'}
                    </button>
                    <input
                      type="text"
                      value={settings.favicon_url || ''}
                      onChange={(e) => handleChange('favicon_url', e.target.value)}
                      placeholder="/favicon.png"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 text-xs text-slate-700 font-mono focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Tahun Berdiri (Est.)
                </label>
                <input
                  type="text"
                  value={settings.established_year || ''}
                  onChange={(e) => handleChange('established_year', e.target.value)}
                  placeholder="2018"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-brand-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Nomor Legalitas / NIB (Opsional)
                </label>
                <input
                  type="text"
                  value={settings.business_license || ''}
                  onChange={(e) => handleChange('business_license', e.target.value)}
                  placeholder="NIB: 9120001234567"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-mono focus:bg-white focus:border-brand-navy"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={savingSection === 'profile'}
                onClick={() => handleSaveSection('profile', 'Profil Perusahaan')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-navy hover:bg-brand-navy-light text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {savingSection === 'profile' ? 'Menyimpan...' : 'Simpan Profil'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: Rekening Bank Resmi & QRIS Pembayaran                          */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 card-shadow space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <CreditCardIcon size={18} className="text-brand-navy" />
              <span>Rekening Resmi & Pembayaran QRIS</span>
            </h2>
            <p className="text-[11px] text-slate-400">Rekening bank penampung transfer DP dan barcode QRIS bisnis</p>
          </div>

          {editingSection !== 'payment' ? (
            <button
              type="button"
              onClick={() => {
                setEditingSection('payment');
                setMapCheckMessage(null);
              }}
              className="text-xs font-bold text-brand-navy hover:text-brand-navy-light underline cursor-pointer px-2 py-1"
            >
              Edit
            </button>
          ) : (
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Mode Edit
            </span>
          )}
        </div>

        {/* View Mode */}
        {editingSection !== 'payment' ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs sm:text-sm">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 sm:col-span-2 space-y-2">
              <span className="text-slate-400 text-xs block">Rekening Bank Utama</span>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-extrabold text-xs">
                  {settings.bank_name || 'BCA'}
                </span>
                <span className="font-mono font-black text-slate-900 text-base">
                  {settings.bank_account_number || '1234-5678-90'}
                </span>
              </div>
              <div className="text-slate-700 text-xs font-semibold">
                Atas Nama: <strong className="text-slate-900">{settings.bank_account_name || settings.company_name || 'RentCar'}</strong>
              </div>
              {settings.payment_instructions && (
                <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 leading-relaxed">
                  {settings.payment_instructions}
                </p>
              )}
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
              <span className="text-slate-400 text-xs block mb-1.5">Barcode QRIS Bisnis</span>
              {settings.qris_image ? (
                <div className="w-24 h-24 rounded-xl border border-slate-200 bg-white p-1 overflow-hidden">
                  <img
                    src={settings.qris_image}
                    alt="QRIS Barcode"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">QRIS belum diunggah</span>
              )}
            </div>
          </div>
        ) : (
          /* Edit Mode Form */
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Nama Bank *
                </label>
                <input
                  type="text"
                  required
                  value={settings.bank_name || ''}
                  onChange={(e) => handleChange('bank_name', e.target.value)}
                  placeholder="BCA / Mandiri / BRI / BNI"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-bold focus:bg-white focus:border-brand-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Nomor Rekening *
                </label>
                <input
                  type="text"
                  required
                  value={settings.bank_account_number || ''}
                  onChange={(e) => handleChange('bank_account_number', e.target.value)}
                  placeholder="1234-5678-90"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-mono font-bold focus:bg-white focus:border-brand-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Atas Nama (A/N) *
                </label>
                <input
                  type="text"
                  required
                  value={settings.bank_account_name || ''}
                  onChange={(e) => handleChange('bank_account_name', e.target.value)}
                  placeholder="PT RentCar Indonesia"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-semibold focus:bg-white focus:border-brand-navy"
                />
              </div>
            </div>

            {/* QRIS Upload */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Gambar / Barcode QRIS Pembayaran (Opsional)
              </label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl border border-slate-200 bg-slate-100 overflow-hidden relative shrink-0 flex items-center justify-center p-1">
                  {settings.qris_image ? (
                    <img
                      src={settings.qris_image}
                      alt="QRIS Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400">No QRIS</span>
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <input
                    type="file"
                    ref={qrisInputRef}
                    onChange={(e) => handleFileUpload(e, 'qris_image')}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploadingField === 'qris_image'}
                    onClick={() => qrisInputRef.current?.click()}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    {uploadingField === 'qris_image' ? 'Mengunggah...' : '📁 Unggah Barcode QRIS'}
                  </button>
                  <input
                    type="text"
                    value={settings.qris_image || ''}
                    onChange={(e) => handleChange('qris_image', e.target.value)}
                    placeholder="URL gambar QRIS"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-mono focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Petunjuk Transfer / Catatan Pembayaran
              </label>
              <textarea
                rows={2}
                value={settings.payment_instructions || ''}
                onChange={(e) => handleChange('payment_instructions', e.target.value)}
                placeholder="Mohon cantumkan nomor invoice saat transfer dan kirimkan bukti resi ke WhatsApp admin."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-brand-navy"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={savingSection === 'payment'}
                onClick={() => handleSaveSection('payment', 'Rekening & Pembayaran')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-navy hover:bg-brand-navy-light text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {savingSection === 'payment' ? 'Menyimpan...' : 'Simpan Rekening'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: Kontak & WhatsApp Admin                                       */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 card-shadow space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <PhoneIcon size={18} className="text-brand-navy" />
              <span>Kontak & WhatsApp Admin</span>
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
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Mode Edit
            </span>
          )}
        </div>

        {/* View Mode */}
        {editingSection !== 'contact' ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs sm:text-sm">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 text-xs block mb-1">WhatsApp Admin (Penerima Booking)</span>
              <span className="font-extrabold text-slate-900 font-mono text-sm block">
                {settings.admin_whatsapp ? `+${settings.admin_whatsapp}` : '-'}
              </span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 text-xs block mb-1">Telepon Display</span>
              <span className="font-bold text-slate-900 block">{settings.company_phone || '-'}</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 text-xs block mb-1">Email Perusahaan</span>
              <span className="font-bold text-slate-900 block">{settings.company_email || '-'}</span>
            </div>
          </div>
        ) : (
          /* Edit Mode Form */
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Nomor WhatsApp Admin (Format 62xxx) *
                </label>
                <input
                  type="text"
                  required
                  value={settings.admin_whatsapp || ''}
                  onChange={(e) => handleChange('admin_whatsapp', e.target.value.replace(/\D/g, ''))}
                  placeholder="6281234567890"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-mono focus:bg-white focus:border-brand-navy"
                />
                <p className="text-[11px] text-slate-400 mt-1">Gunakan kode negara tanpa tanda plus (+). Contoh: 6281234567890</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Nomor Telepon Tampilan
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
                Email Perusahaan
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
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={savingSection === 'contact'}
                onClick={() => handleSaveSection('contact', 'Kontak')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-navy hover:bg-brand-navy-light text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {savingSection === 'contact' ? 'Menyimpan...' : 'Simpan Kontak'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: Lokasi Kantor & Google Maps                                   */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 card-shadow space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <MapPinIcon size={18} className="text-brand-navy" />
              <span>Lokasi Kantor & Google Maps</span>
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
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Mode Edit
            </span>
          )}
        </div>

        {/* View Mode */}
        {editingSection !== 'location' ? (
          <div className="space-y-4 pt-1 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 text-xs block mb-1">Nama Kantor / Outlet</span>
                <span className="font-bold text-slate-900">{settings.office_name || '-'}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 text-xs block mb-1">Jam Operasional</span>
                <span className="font-bold text-slate-900">{settings.operational_hours || '-'}</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 text-xs block mb-1">Alamat Lengkap</span>
              <span className="font-semibold text-slate-800 leading-relaxed block">
                {settings.office_address || '-'}
              </span>
            </div>

            {/* Interactive Live Map Preview */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
              <div className="p-3 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-700 font-bold">
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
                    <ExternalLinkIcon size={12} />
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
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={savingSection === 'location'}
                onClick={() => handleSaveSection('location', 'Lokasi & Peta')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-navy hover:bg-brand-navy-light text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {savingSection === 'location' ? 'Menyimpan...' : 'Simpan Lokasi'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 5: Media Sosial & Ulasan Google Maps                             */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 card-shadow space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <InstagramIcon size={18} className="text-brand-navy" />
              <span>Media Sosial & Ulasan Pelanggan</span>
            </h2>
            <p className="text-[11px] text-slate-400">Tautan akun Instagram, TikTok, Facebook, dan link Google Review</p>
          </div>

          {editingSection !== 'social' ? (
            <button
              type="button"
              onClick={() => {
                setEditingSection('social');
                setMapCheckMessage(null);
              }}
              className="text-xs font-bold text-brand-navy hover:text-brand-navy-light underline cursor-pointer px-2 py-1"
            >
              Edit
            </button>
          ) : (
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Mode Edit
            </span>
          )}
        </div>

        {/* View Mode */}
        {editingSection !== 'social' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 text-xs sm:text-sm">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 text-xs block mb-1">Instagram</span>
              <span className="font-bold text-slate-900 block truncate">
                {settings.social_instagram || '-'}
              </span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 text-xs block mb-1">TikTok</span>
              <span className="font-bold text-slate-900 block truncate">
                {settings.social_tiktok || '-'}
              </span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 text-xs block mb-1">Facebook Page</span>
              <span className="font-bold text-slate-900 block truncate">
                {settings.social_facebook || '-'}
              </span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 text-xs block mb-1">Link Ulasan Google Maps</span>
              <span className="font-bold text-slate-900 block truncate font-mono text-xs">
                {settings.google_review_url ? 'Sudah Terpasang' : '-'}
              </span>
            </div>
          </div>
        ) : (
          /* Edit Mode Form */
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Akun Instagram
                </label>
                <input
                  type="text"
                  value={settings.social_instagram || ''}
                  onChange={(e) => handleChange('social_instagram', e.target.value)}
                  placeholder="@rentcar.id atau https://instagram.com/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-brand-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Akun TikTok
                </label>
                <input
                  type="text"
                  value={settings.social_tiktok || ''}
                  onChange={(e) => handleChange('social_tiktok', e.target.value)}
                  placeholder="@rentcar_official"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-brand-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Halaman Facebook
                </label>
                <input
                  type="text"
                  value={settings.social_facebook || ''}
                  onChange={(e) => handleChange('social_facebook', e.target.value)}
                  placeholder="https://facebook.com/rentcar"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-brand-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Link Google Maps Review / Ulasan
                </label>
                <input
                  type="url"
                  value={settings.google_review_url || ''}
                  onChange={(e) => handleChange('google_review_url', e.target.value)}
                  placeholder="https://g.page/r/xxx/review"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-mono text-xs focus:bg-white focus:border-brand-navy"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={savingSection === 'social'}
                onClick={() => handleSaveSection('social', 'Media Sosial')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-navy hover:bg-brand-navy-light text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {savingSection === 'social' ? 'Menyimpan...' : 'Simpan Media Sosial'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 6: SEO, Social Share & Webmaster Tracking                         */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 card-shadow space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <GlobeIcon size={18} className="text-brand-navy" />
              <span>Search Engine Optimization (SEO) & Social Share</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Meta tag Google Search, target kata kunci, gambar Open Graph (WhatsApp/FB), dan kode pelacakan webmaster.
            </p>
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
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Mode Edit
            </span>
          )}
        </div>

        {/* View Mode */}
        {editingSection !== 'seo' ? (
          <div className="space-y-5 text-xs sm:text-sm">
            {/* 1. Interactive Google Search Preview Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <SearchIcon size={12} className="text-blue-500" />
                  <span>Pratinjau Hasil Pencarian Google (SERP Preview)</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {settings.robots_index || 'index, follow'}
                </span>
              </div>

              {/* Google Result Box */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1 font-sans shadow-2xs">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-brand-navy text-white text-[10px] font-bold flex items-center justify-center">
                    RC
                  </div>
                  <div className="truncate">
                    <span className="font-semibold text-slate-800">{settings.company_name || 'RentCar'}</span>
                    <span className="text-slate-400 font-mono text-[11px] ml-1.5">{canonicalUrl}</span>
                  </div>
                </div>
                <div className="text-blue-700 hover:underline font-medium text-base sm:text-lg leading-snug cursor-pointer pt-0.5">
                  {metaTitle}
                </div>
                <p className="text-slate-600 text-xs sm:text-xs leading-relaxed line-clamp-2 pt-0.5">
                  {metaDesc}
                </p>
              </div>
            </div>

            {/* 2. Grid Meta Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 text-xs block mb-1">Target Kata Kunci (Keywords)</span>
                <div className="flex items-center gap-1.5 flex-wrap mt-1">
                  {keywordsList.map((k) => (
                    <span key={k} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-medium">
                      {k}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 text-xs block mb-1">Domain / Canonical URL</span>
                <span className="font-mono font-bold text-slate-900 text-xs block truncate">
                  {canonicalUrl}
                </span>
              </div>
            </div>

            {/* 3. Open Graph & Social Share Preview */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Pratinjau Thumbnail Share WhatsApp & Sosial Media (Open Graph)
              </span>
              <div className="max-w-md bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="w-full h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                  <img
                    src={ogImageUrl}
                    alt="Open Graph Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/cars/hero-luxury-black-suv.jpg';
                    }}
                  />
                </div>
                <div className="p-3.5 space-y-1 bg-slate-50/50">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                    {canonicalUrl.replace(/^https?:\/\//, '')}
                  </span>
                  <div className="font-bold text-slate-900 text-xs line-clamp-1">
                    {metaTitle}
                  </div>
                  <p className="text-slate-500 text-[11px] line-clamp-2 leading-relaxed">
                    {metaDesc}
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Tracking IDs in View Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 text-xs block mb-0.5">Google Search Console Verification</span>
                <span className="font-mono text-xs text-slate-700 truncate block">
                  {settings.google_site_verification || 'Belum terpasang'}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 text-xs block mb-0.5">Google Analytics (GA4) / GTM ID</span>
                <span className="font-mono font-bold text-slate-900 text-xs block">
                  {settings.google_analytics_id || 'Belum terpasang'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Edit Mode Form */
          <div className="space-y-6 pt-2 text-xs sm:text-sm">
            <div className="space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-brand-navy block border-b border-slate-100 pb-1.5">
                1. Meta Tag & Deskripsi Mesin Pencari
              </span>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Meta Title (Judul Tab & Google Search) *</label>
                  <span className={`text-[11px] font-bold ${
                    (settings.meta_title || '').length > 65 ? 'text-amber-600' : 'text-emerald-700'
                  }`}>
                    {(settings.meta_title || '').length} / 60 karakter disarankan
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={settings.meta_title || ''}
                  onChange={(e) => handleChange('meta_title', e.target.value)}
                  placeholder="Rental Mobil Bandung | Sewa Mobil Lepas Kunci - RentCar"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-semibold focus:bg-white focus:border-brand-navy"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Meta Description (Ringkasan Deskripsi Google) *</label>
                  <span className={`text-[11px] font-bold ${
                    (settings.meta_description || '').length > 165 ? 'text-amber-600' : 'text-emerald-700'
                  }`}>
                    {(settings.meta_description || '').length} / 160 karakter disarankan
                  </span>
                </div>
                <textarea
                  rows={3}
                  required
                  value={settings.meta_description || ''}
                  onChange={(e) => handleChange('meta_description', e.target.value)}
                  placeholder="Sewa mobil lepas kunci di Bandung dengan armada terawat, harga transparan, dan proses pemesanan praktis via WhatsApp."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 leading-relaxed focus:bg-white focus:border-brand-navy"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Target Kata Kunci (Keywords) — Pisahkan dengan koma
                </label>
                <input
                  type="text"
                  value={settings.meta_keywords || ''}
                  onChange={(e) => handleChange('meta_keywords', e.target.value)}
                  placeholder="rental mobil bandung, sewa mobil lepas kunci, rentcar harian, sewa alphard bandung"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-brand-navy"
                />
              </div>
            </div>

            {/* GRUP B: DOMAIN & OPEN GRAPH */}
            <div className="space-y-4 pt-2">
              <span className="text-xs font-black uppercase tracking-wider text-brand-navy block border-b border-slate-100 pb-1.5">
                2. Domain & Pratinjau Link Sosial Media (Open Graph)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Canonical / Domain Utama Website
                  </label>
                  <input
                    type="url"
                    value={settings.canonical_url || ''}
                    onChange={(e) => handleChange('canonical_url', e.target.value)}
                    placeholder="https://rentcar.id"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-mono focus:bg-white focus:border-brand-navy"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Situs di Media Sosial (Site Name)
                  </label>
                  <input
                    type="text"
                    value={settings.og_site_name || ''}
                    onChange={(e) => handleChange('og_site_name', e.target.value)}
                    placeholder="RentCar Indonesia"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-brand-navy"
                  />
                </div>
              </div>

              {/* OG Image Upload & Picker */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Gambar Pratinjau Sosial Media / WhatsApp (OG Image — 1200x630 px)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-16 rounded-xl border border-slate-200 bg-slate-100 overflow-hidden relative shrink-0 flex items-center justify-center">
                    <img
                      src={settings.og_image || '/images/cars/hero-luxury-black-suv.jpg'}
                      alt="OG Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/cars/hero-luxury-black-suv.jpg';
                      }}
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      ref={ogFileInputRef}
                      onChange={(e) => handleFileUpload(e, 'og_image')}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploadingField === 'og_image'}
                      onClick={() => ogFileInputRef.current?.click()}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      {uploadingField === 'og_image' ? 'Mengunggah...' : '📁 Unggah Gambar Banner dari Komputer'}
                    </button>
                    <input
                      type="text"
                      value={settings.og_image || ''}
                      onChange={(e) => handleChange('og_image', e.target.value)}
                      placeholder="/images/cars/hero-luxury-black-suv.jpg atau link URL gambar"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-mono focus:bg-white"
                    />
                  </div>
                </div>

                {/* Preset Choices */}
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400">Pilihan Cepat:</span>
                  {presetOgImages.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handleChange('og_image', p.url)}
                      className={`text-[10px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                        (settings.og_image || '') === p.url
                          ? 'bg-brand-navy text-white border-brand-navy font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* GRUP C: GOOGLE SEARCH CONSOLE & ANALYTICS */}
            <div className="space-y-4 pt-2">
              <span className="text-xs font-black uppercase tracking-wider text-brand-navy block border-b border-slate-100 pb-1.5">
                3. Integrasi Webmaster & Google Analytics
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Google Search Console Verification Code
                  </label>
                  <input
                    type="text"
                    value={settings.google_site_verification || ''}
                    onChange={(e) => handleChange('google_site_verification', e.target.value)}
                    placeholder="google-site-verification=xxxxxx atau kode verifikasi"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-800 focus:bg-white focus:border-brand-navy"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Google Analytics 4 (GA4) / GTM ID
                  </label>
                  <input
                    type="text"
                    value={settings.google_analytics_id || ''}
                    onChange={(e) => handleChange('google_analytics_id', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-800 focus:bg-white focus:border-brand-navy"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pengaturan Robot Mesin Pencari (Robots Indexing)
                </label>
                <select
                  value={settings.robots_index || 'index, follow'}
                  onChange={(e) => handleChange('robots_index', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-brand-navy"
                >
                  <option value="index, follow">🟢 index, follow — Izinkan Google mengindeks website ke halaman pencarian (Direkomendasikan)</option>
                  <option value="noindex, nofollow">🔴 noindex, nofollow — Sembunyikan website dari Google (Mode Maintenance / Privat)</option>
                </select>
              </div>
            </div>

            {/* LIVE SERP PREVIEW BOX IN EDIT MODE */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                Pratinjau Langsung Hasil Pencarian Google (Live SERP Preview):
              </span>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="w-4 h-4 rounded-full bg-brand-navy text-white text-[9px] font-bold flex items-center justify-center">RC</span>
                  <span className="font-semibold text-slate-800">{settings.company_name || 'RentCar'}</span>
                  <span className="text-slate-400 font-mono text-[10px]">{canonicalUrl}</span>
                </div>
                <div className="text-blue-700 font-medium text-base leading-snug">
                  {settings.meta_title || 'Judul Halaman Website'}
                </div>
                <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                  {settings.meta_description || 'Deskripsi ringkasan website akan tampil di sini saat dicari di Google...'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={savingSection === 'seo'}
                onClick={() => handleSaveSection('seo', 'SEO & Social Share')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-navy hover:bg-brand-navy-light text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {savingSection === 'seo' ? 'Menyimpan...' : 'Simpan Pengaturan SEO'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 7: Keamanan Akun & Ganti Password Admin                           */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 card-shadow space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheckIcon size={18} className="text-brand-navy" />
              <span>Keamanan Akun & Ganti Password Admin</span>
            </h2>
            <p className="text-[11px] text-slate-400">Kelola kredensial login dashboard, ganti username dan password admin</p>
          </div>

          {editingSection !== 'security' ? (
            <button
              type="button"
              onClick={() => {
                setEditingSection('security');
                setSecurityError(null);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }}
              className="text-xs font-bold text-brand-navy hover:text-brand-navy-light underline cursor-pointer px-2 py-1"
            >
              Ganti Password / Username
            </button>
          ) : (
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Mode Edit Keamanan
            </span>
          )}
        </div>

        {/* View Mode */}
        {editingSection !== 'security' ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs sm:text-sm">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 text-xs block mb-1">Username Admin Aktif</span>
              <span className="font-extrabold text-slate-900 font-mono text-sm block">
                {settings.admin_username || 'admin'}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 text-xs block mb-1">Enkripsi Password</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1.5 text-xs mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>SHA-256 Kriptografi Salt</span>
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 text-xs block mb-1">Proteksi Sesi</span>
              <span className="font-bold text-slate-800 text-xs mt-0.5 block">
                HttpOnly Signed Cookie (7 Hari)
              </span>
            </div>
          </div>
        ) : (
          /* Edit Mode Form */
          <form onSubmit={handleSaveSecurity} className="space-y-4 pt-2">
            {securityError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                <span>⚠️</span>
                <span>{securityError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Username Admin Baru / Tetap
                </label>
                <input
                  type="text"
                  required
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-bold focus:bg-white focus:border-brand-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Password Saat Ini (Wajib Verifikasi) *
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan password lama"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-900 font-mono focus:bg-white focus:border-brand-navy"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                  >
                    {showCurrentPass ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Password Baru (Min. 6 Karakter)
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Kosongkan jika hanya ingin ganti username"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-900 font-mono focus:bg-white focus:border-brand-navy"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                  >
                    {showNewPass ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi ketik password baru"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-900 font-mono focus:bg-white focus:border-brand-navy"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                  >
                    {showConfirmPass ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                  </button>
                </div>
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1">Konfirmasi password belum cocok.</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={savingSecurity}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {savingSecurity ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <KeyIcon size={14} />
                    <span>Simpan Perubahan Keamanan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 8: Manajemen Database, Cadangan & Restore                        */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 card-shadow space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <DatabaseIcon size={18} className="text-brand-navy" />
              <span>Manajemen Database SQLite, Backup & Restore</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Unduh salinan cadangan database, buat snapshot server di direktori <code>data/backups/</code>, atau pulihkan database dari file cadangan.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchDbInfo}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
            title="Segarkan info database"
          >
            <RefreshCwIcon size={13} />
            <span>Segarkan</span>
          </button>
        </div>

        {/* Action feedback message */}
        {dbMessage && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 ${
              dbMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <span>{dbMessage.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{dbMessage.text}</span>
          </div>
        )}

        {/* Database Status Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-slate-400 text-[11px] block mb-0.5">Lokasi File Database</span>
            <span className="font-mono font-bold text-slate-900 block truncate">
              {dbInfo?.dbPath || 'data/rentcar.db'}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-slate-400 text-[11px] block mb-0.5">Ukuran Database</span>
            <span className="font-bold text-brand-navy text-sm block">
              {dbInfo?.dbSize || '0 KB'}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-slate-400 text-[11px] block mb-0.5">Total Armada & Pesanan</span>
            <span className="font-bold text-slate-800 block">
              {dbInfo?.totalCars ?? 0} Mobil · {dbInfo?.totalInquiries ?? 0} Pesanan
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-slate-400 text-[11px] block mb-0.5">Terakhir Diperbarui</span>
            <span className="font-semibold text-slate-700 block truncate text-[11px]">
              {dbInfo?.lastModified || '-'}
            </span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h3 className="font-extrabold text-slate-900 text-sm">Operasi Backup & Restore</h3>
            <p className="text-xs text-slate-500">
              Simpan salinan database ke komputer lokal Anda atau unggah file <code>.db</code> untuk memulihkan seluruh data.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
            {/* 1. Direct Download Button */}
            <a
              href="/api/admin/database?action=download"
              download
              className="px-4 py-2.5 rounded-xl bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-98 cursor-pointer"
            >
              <DownloadIcon size={14} />
              <span>Unduh File Database (.db)</span>
            </a>

            {/* 2. Create Server Snapshot */}
            <button
              type="button"
              disabled={dbActionLoading === 'snapshot'}
              onClick={handleCreateSnapshot}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {dbActionLoading === 'snapshot' ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Membuat...</span>
                </>
              ) : (
                <>
                  <DatabaseIcon size={14} />
                  <span>Simpan Snapshot ke Server</span>
                </>
              )}
            </button>

            {/* 3. Upload & Import DB File */}
            <input
              type="file"
              ref={dbFileInputRef}
              onChange={handleImportDatabaseFile}
              accept=".db,.sqlite,.sqlite3"
              className="hidden"
            />
            <button
              type="button"
              disabled={dbActionLoading === 'import'}
              onClick={() => dbFileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {dbActionLoading === 'import' ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Mengimpor...</span>
                </>
              ) : (
                <>
                  <UploadIcon size={14} />
                  <span>Unggah & Restore .db</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Server Snapshots List Table */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span>Daftar Snapshot Cadangan di Server (<code>data/backups/</code>)</span>
            </span>
            <span className="text-[11px] text-slate-400 font-semibold">
              {dbInfo?.backups.length || 0} file snapshot tersimpan
            </span>
          </div>

          {(!dbInfo?.backups || dbInfo.backups.length === 0) ? (
            <div className="p-6 text-center rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 text-xs">
              Belum ada snapshot cadangan di direktori <code>data/backups/</code>. Klik tombol <strong>&ldquo;Simpan Snapshot ke Server&rdquo;</strong> di atas untuk membuat snapshot baru.
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Nama File Snapshot</th>
                      <th className="py-3 px-4">Ukuran</th>
                      <th className="py-3 px-4">Waktu Dibuat</th>
                      <th className="py-3 px-4 text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dbInfo.backups.map((bak) => (
                      <tr key={bak.filename} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 flex items-center gap-2">
                          <DatabaseIcon size={14} className="text-slate-400" />
                          <span>{bak.filename}</span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700">{bak.size}</td>
                        <td className="py-3 px-4 text-slate-500">{bak.createdFormatted}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Download snapshot */}
                            <a
                              href={`/api/admin/database?action=download_snapshot&file=${encodeURIComponent(bak.filename)}`}
                              download={bak.filename}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-brand-navy hover:bg-slate-100 cursor-pointer"
                              title="Unduh file snapshot ini"
                            >
                              <DownloadIcon size={14} />
                            </a>

                            {/* Restore snapshot */}
                            {restoreConfirmFile === bak.filename ? (
                              <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-lg border border-rose-200 animate-fade-in">
                                <span className="text-[10px] font-bold text-rose-700 px-1">Yakin Restore?</span>
                                <button
                                  type="button"
                                  disabled={dbActionLoading === `restore-${bak.filename}`}
                                  onClick={() => handleRestoreSnapshot(bak.filename)}
                                  className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px] hover:bg-rose-700 cursor-pointer"
                                >
                                  Ya, Pulihkan
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRestoreConfirmFile(null)}
                                  className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-bold text-[10px] hover:bg-slate-300 cursor-pointer"
                                >
                                  Batal
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setRestoreConfirmFile(bak.filename)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors border border-emerald-200"
                                title="Pulihkan database dari snapshot ini"
                              >
                                <RefreshCwIcon size={12} />
                                <span>Restore</span>
                              </button>
                            )}

                            {/* Delete snapshot */}
                            <button
                              type="button"
                              disabled={dbActionLoading === `delete-${bak.filename}`}
                              onClick={() => handleDeleteSnapshot(bak.filename)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                              title="Hapus snapshot ini"
                            >
                              <TrashIcon size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
