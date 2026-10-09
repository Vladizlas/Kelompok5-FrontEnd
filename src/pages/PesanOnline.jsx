import { useCallback, useEffect, useMemo, useState } from "react";

// Sesuaikan dengan alamat backend Anda
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Jika endpoint admin memakai token login, sesuaikan nama key-nya di sini
const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

// Badge warna status versi light-theme modern
const getStatusBadge = (status) => {
  const s = status || "";
  if (s === "Menunggu") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
        Menunggu
      </span>
    );
  }
  if (s === "Dijemput") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
        Dijemput
      </span>
    );
  }
  if (s === "Diproses") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
        Diproses
      </span>
    );
  }
  if (s === "Selesai") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        Selesai
      </span>
    );
  }
  if (s === "Dibatalkan") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
        Dibatalkan
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
      {status}
    </span>
  );
};

// Status berikutnya saat tombol aksi ditekan
const berikutnya = {
  Menunggu: "Dijemput",
  Dijemput: "Diproses",
  Diproses: "Selesai",
};

const labelAksi = {
  Menunggu: "Konfirmasi",
  Dijemput: "Mulai proses",
  Diproses: "Tandai selesai",
};

const filterStatus = [
  "Semua",
  "Menunggu",
  "Dijemput",
  "Diproses",
  "Selesai",
  "Dibatalkan",
];

export default function PesanOnline() {
  const [pesanan, setPesanan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cari, setCari] = useState("");
  const [filter, setFilter] = useState("Semua");
  const [prosesId, setProsesId] = useState(null);

  // =========================================================
  // AMBIL DATA DARI BACKEND
  // GET /api/pesan-online
  // =========================================================
  const muatData = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const res = await fetch(`${API_URL}/pesan-online`, {
        headers: getHeaders(),
      });

      if (!res.ok) throw new Error(`Server menjawab ${res.status}`);

      const json = await res.json();
      setPesanan(Array.isArray(json) ? json : json.data ?? []);
    } catch (err) {
      setError(`Gagal memuat pesanan. ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    muatData();
  }, [muatData]);

  // =========================================================
  // UBAH STATUS
  // PATCH /api/pesan-online/:id/status   body: { status }
  // =========================================================
  const ubahStatus = async (id, status) => {
    try {
      setProsesId(id);
      setError("");

      const res = await fetch(`${API_URL}/pesan-online/${id}/status`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error(`Server menjawab ${res.status}`);

      setPesanan((lama) =>
        lama.map((p) => (p.id === id ? { ...p, status } : p))
      );
    } catch (err) {
      setError(`Gagal mengubah status. ${err.message}`);
    } finally {
      setProsesId(null);
    }
  };

  // =========================================================
  // FILTER + PENCARIAN
  // =========================================================
  const tampil = useMemo(() => {
    const kata = cari.trim().toLowerCase();

    return pesanan.filter((p) => {
      const cocokStatus = filter === "Semua" || p.status === filter;
      const cocokCari =
        !kata ||
        String(p.nama || "").toLowerCase().includes(kata) ||
        String(p.kode || p.id).toLowerCase().includes(kata) ||
        String(p.alamatAntar || "").toLowerCase().includes(kata);

      return cocokStatus && cocokCari;
    });
  }, [pesanan, cari, filter]);

  const jumlah = (s) => pesanan.filter((p) => p.status === s).length;

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="w-full min-h-screen bg-white p-6 lg:p-8 space-y-6 text-slate-800">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-sky-500 to-blue-600 p-6 rounded-2xl shadow-lg shadow-sky-500/15 text-white">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Pesan Online</h1>
          <p className="text-xs font-medium text-sky-100 mt-1">
            Pesanan yang masuk dari pelanggan lewat website.
          </p>
        </div>

        <button
          onClick={muatData}
          disabled={loading}
          className="bg-white text-sky-600 hover:bg-sky-50 font-bold px-4 py-2.5 rounded-xl shadow-sm transition duration-200 text-xs flex items-center justify-center gap-2 w-fit disabled:opacity-50"
        >
          <svg
            className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Muat ulang</span>
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            className="text-rose-500 hover:text-rose-800 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Ringkasan Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Menunggu", color: "text-amber-500" },
          { label: "Dijemput", color: "text-sky-500" },
          { label: "Diproses", color: "text-indigo-500" },
          { label: "Selesai", color: "text-emerald-500" },
        ].map(({ label, color }) => (
          <div
            key={label}
            className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-1"
          >
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {label}
            </p>
            <p className={`text-3xl font-black ${color}`}>{jumlah(label)}</p>
          </div>
        ))}
      </div>

      {/* Pencarian dan Filter Tabs */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari nama atau kode pesanan"
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
          {filterStatus.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition duration-150 ${filter === s
                  ? "bg-sky-500 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sky-50/50 border-b border-sky-100 text-sky-900 text-[11px] font-bold tracking-wider uppercase">
                <th className="py-3.5 px-4 font-semibold">Kode</th>
                <th className="py-3.5 px-4 font-semibold">Pelanggan</th>
                <th className="py-3.5 px-4 font-semibold">Pesanan</th>
                <th className="py-3.5 px-4 font-semibold">Perkiraan total</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-center w-36">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm">
              {loading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sky-600">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-medium text-slate-500">
                        Memuat data pesanan online...
                      </span>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && tampil.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-slate-400 font-medium text-xs"
                  >
                    Tidak ada pesanan yang cocok.
                  </td>
                </tr>
              )}

              {!loading &&
                tampil.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-sky-50/20 transition duration-150"
                  >
                    <td className="py-4 px-4 font-bold text-slate-800 font-mono text-xs">
                      {p.kode || `PO-${p.id}`}
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-800">{p.nama}</p>
                      <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                        {p.pengambilan === "jemput"
                          ? `Jemput: ${p.alamat || "-"}`
                          : "Antar sendiri ke outlet"}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium leading-tight">
                        {p.pengembalian === "antar"
                          ? `Antar kembali ke: ${p.alamatAntar || "-"}`
                          : "Diambil di outlet"}
                      </p>
                      {p.pengembalian === "antar" && (
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 mt-1">
                          Perlu diantar
                        </span>
                      )}
                      {p.catatan && (
                        <p className="text-[11px] text-slate-400 italic mt-0.5">
                          Catatan: {p.catatan}
                        </p>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <ul className="space-y-1 text-xs font-medium text-slate-700">
                        {(p.items || []).map((it, i) => (
                          <li key={it.id ?? i}>
                            {it.serviceName}
                            {it.itemType ? ` (${it.itemType})` : ""} ·{" "}
                            {it.quantity} {it.unit}
                          </li>
                        ))}
                      </ul>
                    </td>

                    <td className="py-4 px-4 font-bold text-slate-800 text-xs">
                      {rupiah(p.total)}
                    </td>

                    <td className="py-4 px-4">{getStatusBadge(p.status)}</td>

                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <div className="flex justify-center gap-1.5">
                        {berikutnya[p.status] && (
                          <button
                            onClick={() =>
                              ubahStatus(p.id, berikutnya[p.status])
                            }
                            disabled={prosesId === p.id}
                            className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition shadow-sm disabled:opacity-50"
                          >
                            {prosesId === p.id
                              ? "Memproses..."
                              : labelAksi[p.status]}
                          </button>
                        )}

                        {p.status === "Menunggu" && (
                          <button
                            onClick={() => ubahStatus(p.id, "Dibatalkan")}
                            disabled={prosesId === p.id}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                          >
                            Tolak
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}