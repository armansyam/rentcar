'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CarIcon, LockIcon } from '@/components/ui/Icons';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
        router.push('/admin');
      } else {
        setError(data.error || 'Username atau password salah.');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-8 card-shadow text-white">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-brand-navy-light text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <CarIcon size={26} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Admin Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Masuk untuk mengelola armada, inquiry, dan konten website.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-sm text-white flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer mt-6"
          >
            <LockIcon size={16} />
            <span>{loading ? 'Memverifikasi...' : 'Masuk Dashboard'}</span>
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-700/60 text-center text-xs text-slate-400">
          <p>Kredensial Default:</p>
          <p className="font-mono text-slate-300 mt-1">Username: admin | Password: admin123</p>
        </div>
      </div>
    </div>
  );
}
