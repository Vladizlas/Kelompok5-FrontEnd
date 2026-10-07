import React, { useState } from 'react';
import { 
  Sparkles, 
  Shirt, 
  Flame, 
  Waves, 
  Search, 
  Clock, 
  ShieldCheck, 
  Truck, 
  LogIn,
  ArrowRight 
} from 'lucide-react';

export default function Home() {
  const [invoice, setInvoice] = useState('');

  const services = [
    {
      title: 'Cuci Gosok',
      desc: 'Layanan lengkap cuci bersih, wangi, dan setrika rapi siap pakai.',
      icon: <Shirt className="w-8 h-8 text-blue-400" />,
      badge: 'Populer'
    },
    {
      title: 'Gosok / Setrika',
      desc: 'Khusus pakaian yang sudah dicuci, disetrika dengan uap rapi masif.',
      icon: <Flame className="w-8 h-8 text-indigo-400" />,
      badge: 'Hemat'
    },
    {
      title: 'Cuci Lipat',
      desc: 'Pakaian dicuci bersih, dikeringkan, dan dilipat dengan rapi.',
      icon: <Waves className="w-8 h-8 text-cyan-400" />,
      badge: 'Cepat'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans">
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/20">
            FL
          </div>
          <span className="text-xl font-bold tracking-wide bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Fanara Laundry
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#layanan" className="hover:text-white transition">Layanan</a>
          <a href="#tracking" className="hover:text-white transition">Cek Status</a>
          <a href="#keunggulan" className="hover:text-white transition">Keunggulan</a>
        </div>

        {/* TOMBOL PENGARAH KE HALAMAN LOGIN */}
        <div className="flex items-center gap-3">
          <a 
            href="/login" 
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Masuk
          </a>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="px-8 py-20 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Layanan Laundry Profesional & Terpercaya
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Pakaian Bersih, Wangi & Rapi Tanpa Repot
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Fanara Laundry siap merawat pakaian Anda dengan standar kebersihan tinggi, wangi tahan lama, dan pengerjaan tepat waktu.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a 
              href="#tracking" 
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition shadow-lg shadow-blue-600/25"
            >
              Cek Status Cucian
            </a>
            <a 
              href="/login" 
              className="px-6 py-3 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 font-medium text-sm transition flex items-center gap-2"
            >
              Masuk Akun
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* HERO CARD */}
        <div className="relative">
          <div className="absolute -inset-1 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 opacity-30 blur-xl"></div>
          <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800 p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="text-sm font-semibold text-slate-400">Status Operasional Hari Ini</span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                Buka (08:00 - 20:00)
              </span>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800 flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-400">Total Selesai Hari Ini</p>
                  <p className="text-2xl font-bold text-white mt-1">45+ Pesanan</p>
                </div>
                <Shirt className="w-8 h-8 text-blue-500/80" />
              </div>
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800 flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-400">Estimasi Pengerjaan Reguler</p>
                  <p className="text-2xl font-bold text-white mt-1">1 - 2 Hari</p>
                </div>
                <Clock className="w-8 h-8 text-indigo-500/80" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRACKING SECTION */}
      <section id="tracking" className="px-8 py-12 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-2xl font-bold">Cek Status Pesanan Anda</h2>
          <p className="text-slate-400 text-sm">Masukkan nomor invoice untuk melihat progres cuci pakaian Anda secara langsung.</p>
          
          <div className="flex gap-3 max-w-lg mx-auto">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Masukkan Nomor Invoice (cth: INV-20261001)"
                value={invoice}
                onChange={(e) => setInvoice(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <button className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition shrink-0">
              Cek Status
            </button>
          </div>
        </div>
      </section>

      {/* LAYANAN SECTION */}
      <section id="layanan" className="px-8 py-20 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold">Pilihan Layanan Laundry</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Kami menyediakan berbagai pilihan paket cuci yang disesuaikan dengan kebutuhan Anda.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {services.map((item, index) => (
            <div 
              key={index} 
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition-all group space-y-4 relative"
            >
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-xl bg-slate-800 border border-slate-700/60 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                  {item.badge}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-8 py-8 border-t border-slate-800 text-center text-slate-500 text-sm">
        <p>&copy; 2026 Fanara Laundry. All rights reserved.</p>
      </footer>
    </div>
  );
}