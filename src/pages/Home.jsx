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
    // data-theme="dark" memakai tema gelap bawaan DaisyUI hanya untuk halaman ini
    <div data-theme="dark" className="min-h-screen bg-base-100 text-base-content">
      {/* NAV */}
      <header className="navbar px-4 lg:px-12">
        <div className="flex-1 font-semibold tracking-widest">
          FANARA LAUNDRY
        </div>

        <ul className="menu menu-horizontal items-center hidden sm:flex">
          <li>
            <a href="#layanan">Layanan</a>
          </li>
          <li>
            <a href="#faq">FAQ</a>
          </li>
        </ul>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setModal("track")}
            className="btn btn-ghost btn-sm"
          >
            🔍 Cek Order
          </button>

          <Link to="/login" className="btn btn-outline btn-sm">
            Masuk
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="px-4 lg:px-12 py-20 lg:py-32 max-w-6xl mx-auto">
        <div className="badge badge-primary badge-outline tracking-widest uppercase">
          Laundry Premium
        </div>

        <h1 className="mt-6 text-5xl lg:text-8xl font-black leading-[0.95]">
          Bersih.
          <br />
          Rapi.
          <br />
          <span className="text-primary">Tepat waktu.</span>
        </h1>

        <p className="mt-8 max-w-xl text-lg text-base-content/70">
          Perawatan pakaian dengan standar tinggi, dari cucian harian sampai
          pakaian spesial.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setModal("order")}
            className="btn btn-primary btn-lg"
          >
            Mulai Sekarang →
          </button>

          <button
            type="button"
            onClick={() => setModal("track")}
            className="btn btn-outline btn-lg"
          >
            Cek Status Order
          </button>
        </div>
      </section>

      {/* LAYANAN */}
      <section id="layanan" className="px-4 lg:px-12 py-16 max-w-6xl mx-auto">
        <div className="divider divider-start text-sm uppercase tracking-widest">
          Layanan
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <span className="loading loading-spinner"></span>
          </div>
        ) : loadError ? (
          <div role="alert" className="alert alert-error">
            <span>{loadError}</span>
          </div>
        ) : groups.length === 0 ? (
          <p className="py-12 text-center text-base-content/70">
            Belum ada layanan yang tersedia.
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.id} className="mb-10">
              <h3 className="badge badge-primary badge-outline tracking-widest uppercase mb-2">
                {group.name}
              </h3>

              <ul className="list">
                {group.services.map((service) => {
                  serviceNo += 1;

                  return (
                    <li
                      key={service.id}
                      className="list-row items-start py-6"
                    >
                      <div className="text-3xl font-thin opacity-30 tabular-nums">
                        {String(serviceNo).padStart(2, "0")}
                      </div>

                      <div>
                        <div className="text-2xl lg:text-4xl font-bold">
                          {service.name}
                        </div>

                        {service.description && (
                          <p className="text-sm text-base-content/70 mt-1">
                            {service.description}
                          </p>
                        )}
                      </div>

                      <ul className="text-sm text-base-content/70 space-y-1 text-right">
                        {(service.prices || []).length === 0 ? (
                          <li>Hubungi kami</li>
                        ) : (
                          service.prices.map((price) => (
                            <li key={price.id}>
                              {price.itemType}{" "}
                              <span className="font-semibold text-base-content">
                                {rupiah(price.price)} / {price.unit}
                              </span>
                            </li>
                          ))
                        )}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </section>

      {/* FAQ */}
      <section id="faq" className="px-4 lg:px-12 py-16 max-w-3xl mx-auto">
        <div className="divider divider-start text-sm uppercase tracking-widest">
          Pertanyaan Umum
        </div>

        <div className="space-y-3 mt-6">
          {faq.map((item, i) => (
            <div
              key={item.q}
              className="collapse collapse-arrow bg-base-200 border border-base-300"
            >
              <input type="radio" name="faq" defaultChecked={i === 0} />
              <div className="collapse-title font-semibold">{item.q}</div>
              <div className="collapse-content text-sm text-base-content/70">
                {item.a}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* KONTAK */}
      <footer
        id="kontak"
        className="footer sm:footer-horizontal border-t border-base-300 px-4 lg:px-12 py-16"
      >
        <aside className="max-w-md">
          <p className="text-3xl lg:text-5xl font-black">
            Ada cucian menumpuk?
          </p>
          <p className="text-base-content/70">
            Hubungi kami, kami yang jemput.
          </p>
        </aside>

        <nav>
          <h6 className="footer-title">Kontak</h6>
          <span>📍 Jl. Tui Kuranji RT02 RW03, Kuranji, Padang</span>
          <span>📞 0812-6880-8101</span>
          <span>🕖 Senin - Minggu, 07.00 - 21.00</span>
        </nav>
      </footer>

      {/* MODAL (dirender hanya saat dibuka, jadi formnya selalu mulai kosong) */}
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