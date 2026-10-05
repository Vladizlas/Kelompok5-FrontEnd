import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate untuk navigasi halaman

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Langsung arahkan ke halaman dashboard tanpa validasi
    navigate('/dashboard');
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

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Email (Validasi required dihapus) */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@laundry.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>

          {/* Input Password (Validasi required dihapus) */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>

          {/* Tombol Login */}
          <button
            type="submit"
            className="w-full bg-[#4338ca] hover:bg-[#3730a3] text-white font-medium py-2.5 px-4 rounded-md text-sm transition duration-150 ease-in-out shadow-sm mt-2 cursor-pointer"
          >
            Login
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