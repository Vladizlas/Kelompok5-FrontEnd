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
        // Simpan data user ke localStorage (opsional)
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-md rounded-xl border border-gray-200 shadow-sm p-8">
        {/* Header Judul & Subjudul */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Fanara Laundry
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Masuk untuk mengelola order dan laporan.
          </p>
        </div>

        {/* Alert Pesan Error */}
        {errorMsg && (
          <div className="mb-4 p-3 text-xs text-red-700 bg-red-100 rounded-lg border border-red-200">
            {errorMsg}
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Email */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@laundry.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-black"
            />
          </div>

          {/* Input Password */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-black"
            />
          </div>

          {/* Tombol Login */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4338ca] hover:bg-[#3730a3] disabled:bg-indigo-300 text-white font-medium py-2.5 px-4 rounded-md text-sm transition duration-150 ease-in-out shadow-sm mt-2 cursor-pointer"
          >
            {loading ? 'Memproses...' : 'Login'}
          </button>
        </form>

        {/* Footer Link Pelanggan */}
        <div className="mt-8 text-center text-sm text-gray-800">
          Pelanggan?{' '}
          <a
            href="#"
            className="underline text-gray-900 font-medium hover:text-indigo-600 transition"
          >
            Pesan laundry online
          </a>{' '}
          ·{' '}
          <a
            href="#"
            className="underline text-gray-900 font-medium hover:text-indigo-600 transition"
          >
            Hubungi kami
          </a>
        </div>
      </div>
    </div>
  );
}