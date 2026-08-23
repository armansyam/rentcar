'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CarIcon, LockIcon, EyeIcon, EyeOffIcon, ShieldCheckIcon } from '@/components/ui/Icons';

function LoginFormContent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<string>('/images/logo.png');
  const [companyName, setCompanyName] = useState<string>('RentCar');
  const [logoError, setLogoError] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/admin';

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          if (data.data.company_logo) setCompanyLogo(data.data.company_logo);
          if (data.data.company_name) setCompanyName(data.data.company_name);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success) {
        router.push(redirectUrl);
        router.refresh();
      } else {
        setError(data.error || 'Username atau password salah.');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan saat login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 card-shadow space-y-6">
        {/* Header with Dynamic Logo / Brand */}
        <div className="text-center space-y-2">
          {companyLogo && !logoError ? (
            <div className="h-14 max-w-[220px] mx-auto mb-3 flex items-center justify-center">
              <img
                src={companyLogo}
                alt={companyName}
                className="max-h-12 max-w-[200px] object-contain"
                onError={() => setLogoError(true)}
              />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-brand-navy text-white flex items-center justify-center mx-auto mb-3 shadow-md">
              <CarIcon size={28} />
            </div>
          )}

          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Masuk Panel Admin
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Kelola armada, pesanan sewa, dan pengaturan website {companyName}.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Username Admin
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-semibold focus:bg-white focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 focus:outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Password Admin
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-11 text-sm text-slate-900 font-mono focus:bg-white focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 focus:outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer transition-colors"
                title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-brand-navy hover:bg-brand-navy-light font-extrabold text-sm text-white flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer mt-5"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <>
                <LockIcon size={16} />
                <span>Masuk ke Dashboard</span>
              </>
            )}
          </button>
        </form>

        {/* Security Trust Badge */}
        <div className="pt-2 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <ShieldCheckIcon size={14} className="text-emerald-600" />
            <span>Sesi aman terenkripsi & dilindungi sistem</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-400">Memuat...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
