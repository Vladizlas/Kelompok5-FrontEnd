import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import WhatsAppOrderModal from "../components/WhatsAppOrderModal";
import TrackOrderModal from "../components/TrackOrderModal";
import { getCategories } from "../services/categoryServiceApi";
import { getServices } from "../services/serviceApi";

const rupiah = (value) =>
  `Rp${Number(value || 0).toLocaleString("id-ID")}`;

const faq = [
  { q: "Berapa lama cucian selesai?", a: "Layanan reguler 2-3 hari, express 1 hari. Waktu bisa berbeda untuk item khusus seperti bedcover." },
  { q: "Apakah ada antar-jemput?", a: "Ada. Gratis untuk radius tertentu dari outlet. Hubungi kami untuk detailnya." },
  { q: "Bagaimana cara cek status cucian?", a: "Klik Cek Order di bagian atas, lalu masukkan nomor invoice yang diberikan kasir." },
  { q: "Metode pembayaran apa saja?", a: "Cash dan transfer bank." },
];

function Home() {
  // null | "order" | "track"
  const [modal, setModal] = useState(null);

  // data layanan asli dari database (kategori -> layanan -> harga)
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const closeModal = () => setModal(null);

  useEffect(() => {
    let ignore = false;

    Promise.all([getCategories(), getServices()])
      .then(([categoriesRes, servicesRes]) => {
        if (ignore) return;

        setCategories(categoriesRes.data || []);
        setServices(servicesRes.data || []);
      })
      .catch((err) => {
        if (ignore) return;

        console.error(err);

        setLoadError("Daftar layanan belum bisa dimuat. Coba lagi nanti.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  // kelompokkan layanan per kategori, urut sesuai input
  const groups = [...categories]
    .sort((a, b) => a.id - b.id)
    .map((category) => ({
      ...category,
      services: services
        .filter((s) => s.categoryId === category.id)
        .sort((a, b) => a.id - b.id),
    }))
    .filter((group) => group.services.length > 0);

  let serviceNo = 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* NAVBAR */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-sky-100 px-4 lg:px-12 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white shadow-md shadow-sky-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <span className="font-extrabold text-base tracking-wider text-slate-800">
            FANARA <span className="text-sky-500">LAUNDRY</span>
          </span>
        </div>

        <ul className="hidden sm:flex items-center gap-6 text-xs font-bold text-slate-600">
          <li>
            <a href="#layanan" className="hover:text-sky-500 transition">
              Layanan
            </a>
          </li>
          <li>
            <a href="#faq" className="hover:text-sky-500 transition">
              FAQ
            </a>
          </li>

        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setModal("track")}
            className="bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <span>🔍</span> Cek Order
          </button>

        </div>
      </header>

      {/* HERO SECTION */}
      <section className="px-4 lg:px-12 py-16 lg:py-24 max-w-6xl mx-auto text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="max-w-2xl">
          <span className="inline-block text-xs font-bold tracking-wider text-sky-600 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full uppercase mb-6">
            ✨ Laundry Premium & Terpercaya
          </span>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight">
            Bersih. Rapi. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600">
              Tepat waktu.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-xl">
            Perawatan pakaian dengan standar tinggi, dari cucian harian sampai pakaian spesial. Kami jemput dan antar kembali ke rumah Anda.
          </p>

          <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-3">
            <button
              type="button"
              onClick={() => setModal("order")}
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-sky-500/25 transition duration-200 text-sm flex items-center gap-2"
            >
              <span>Mulai Sekarang</span>
              <span>→</span>
            </button>

            <button
              type="button"
              onClick={() => setModal("track")}
              className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 font-bold px-6 py-3.5 rounded-xl shadow-sm transition duration-200 text-sm"
            >
              Cek Status Order
            </button>
          </div>
        </div>

        {/* Hero Visual Card Decorative */}
        <div className="w-full lg:w-96 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xl shadow-slate-200/50 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Layanan Antar-Jemput</p>
              <p className="text-[11px] text-slate-500">Praktis tanpa perlu keluar rumah</p>
            </div>
          </div>
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              ⚡
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Pengerjaan Express</p>
              <p className="text-[11px] text-slate-500">Selesai kilat dalam 1 hari</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              ★
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Deterjen & Pewangi Premium</p>
              <p className="text-[11px] text-slate-500">Pakaian wangi tahan lama & awet</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION LAYANAN */}
      <section id="layanan" className="px-4 lg:px-12 py-16 max-w-6xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <div className="h-4 w-1 bg-sky-500 rounded-full"></div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-sky-600">
            DAFTAR LAYANAN & HARGA
          </h2>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sky-600">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-medium text-slate-500">Memuat layanan...</span>
            </div>
          </div>
        ) : loadError ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-semibold">
            {loadError}
          </div>
        ) : groups.length === 0 ? (
          <p className="py-12 text-center text-slate-400 font-medium text-xs">
            Belum ada layanan yang tersedia.
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.id} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200">
                {group.name}
              </div>

              <div className="divide-y divide-slate-100">
                {group.services.map((service) => {
                  serviceNo += 1;

                  return (
                    <div
                      key={service.id}
                      className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 px-2 rounded-xl transition duration-150"
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-2xl font-black text-slate-300 font-mono">
                          {String(serviceNo).padStart(2, "0")}
                        </span>
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-slate-800">
                            {service.name}
                          </h3>
                          {service.description && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              {service.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl border border-slate-100 sm:border-0">
                        <ul className="text-xs space-y-1">
                          {(service.prices || []).length === 0 ? (
                            <li className="font-semibold text-slate-400">Hubungi kami</li>
                          ) : (
                            service.prices.map((price) => (
                              <li key={price.id} className="text-slate-500 font-medium">
                                {price.itemType}{" "}
                                <span className="font-bold text-sky-600">
                                  {rupiah(price.price)} / {price.unit}
                                </span>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </section>

      {/* SECTION FAQ */}
      <section id="faq" className="px-4 lg:px-12 py-16 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-4 w-1 bg-sky-500 rounded-full"></div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-sky-600">
            PERTANYAAN UMUM (FAQ)
          </h2>
        </div>

        <div className="space-y-3">
          {faq.map((item, i) => (
            <details
              key={item.q}
              className="group bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm [&_summary::-webkit-details-marker]:none"
              open={i === 0}
            >
              <summary className="flex items-center justify-between font-bold text-sm text-slate-800 cursor-pointer">
                <span>{item.q}</span>
                <span className="text-sky-500 transition group-open:-rotate-180">
                  ▼
                </span>
              </summary>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* FOOTER & KONTAK */}
      <footer
        id="kontak"
        className="bg-white border-t border-slate-200/80 px-4 lg:px-12 py-16 text-slate-800 mt-12"
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div className="max-w-md space-y-3">
            <h3 className="text-2xl lg:text-3xl font-black text-slate-900 leading-tight">
              Ada cucian menumpuk?
            </h3>
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              Hubungi kami sekarang, tim kami yang akan jemput ke lokasi Anda.
            </p>
            <button
              type="button"
              onClick={() => setModal("order")}
              className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition inline-block mt-2"
            >
              Pesan Pesanan Sekarang
            </button>
          </div>

          <div className="space-y-2 text-xs font-medium text-slate-600 bg-slate-50 p-5 rounded-2xl border border-slate-200/60 max-w-sm">
            <h4 className="font-bold text-slate-800 text-sm mb-3 uppercase tracking-wider">
              Kontak & Outlet
            </h4>
            <p className="flex items-start gap-2">
              <span>📍</span> <span>Jl. Tui Kuranji RT02 RW03, Kuranji, Padang</span>
            </p>
            <p className="flex items-center gap-2">
              <span>📞</span> <span>0812-6880-8101</span>
            </p>
            <p className="flex items-center gap-2">
              <span>🕖</span> <span>Senin - Minggu, 07.00 - 21.00 WIB</span>
            </p>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {modal === "order" && (
        <WhatsAppOrderModal
          categories={categories}
          services={services}
          loading={loading}
          loadError={loadError}
          onClose={closeModal}
        />
      )}

      {modal === "track" && <TrackOrderModal onClose={closeModal} />}
    </div>
  );
}

export default Home;