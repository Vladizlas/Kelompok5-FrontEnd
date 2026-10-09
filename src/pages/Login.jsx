import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      // Menghubungkan ke API Backend
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        // Simpan data user dan token ke localStorage
        if (data.data?.token) {
          localStorage.setItem('token', data.data.token);
        }
        if (data.data?.user) {
          localStorage.setItem('user', JSON.stringify(data.data.user));
        }

        // Navigasi ke halaman dashboard
        navigate('/dashboard');
      } else {
        // Tampilkan pesan error jika email/password salah
        setErrorMsg(data.message || 'Login gagal. Periksa email dan password.');
      }
    } catch (error) {
      console.error('Error Login:', error);
      setErrorMsg('Gagal terhubung ke server backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-8 space-y-6">

        {/* Logo & Header Judul */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/25 mb-3 border border-white/20">
            {/* IKON MESIN CUCI (WASHING MACHINE) */}
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {/* Bodi Utama Mesin Cuci */}
              <rect x="4" y="3" width="16" height="18" rx="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              {/* Tabung Tengah (Pintu Kaca) */}
              <circle cx="12" cy="13" r="4" strokeWidth="2" />
              {/* Gelombang Air / Baju Didalam Tabung */}
              <path d="M10 13c1-1 3-1 4 0" strokeWidth="1.8" strokeLinecap="round" />
              {/* Tombol Kontrol Atas */}
              <circle cx="8" cy="6.5" r="1" fill="currentColor" />
              <circle cx="11" cy="6.5" r="1" fill="currentColor" />
              <line x1="14" y1="6.5" x2="16" y2="6.5" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Fanara <span className="text-sky-500">Laundry</span>
          </h1>
          <p className="text-xs font-medium text-slate-500">
            Masuk untuk mengelola order dan laporan admin
          </p>
        </div>

        {/* Alert Pesan Error */}
        {errorMsg && (
          <div className="p-3.5 text-xs font-semibold text-rose-700 bg-rose-50 rounded-xl border border-rose-200 flex items-center justify-between">
            <span>{errorMsg}</span>
            <button
              type="button"
              onClick={() => setErrorMsg('')}
              className="text-rose-500 hover:text-rose-800 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@laundry.com"
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
            />
          </div>

          {/* Input Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
            />
          </div>

          {/* Tombol Login */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition duration-200 shadow-md shadow-sky-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Memproses...</span>
              </>
            ) : (
              'Login ke Panel'
            )}
          </button>
        </form>

      </div>
    </div>
  );
}