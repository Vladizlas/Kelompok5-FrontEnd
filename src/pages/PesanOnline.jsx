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

const badge = {
  Menunggu: "badge-warning",
  Dijemput: "badge-info",
  Diproses: "badge-primary",
  Selesai: "badge-success",
  Dibatalkan: "badge-error",
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
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pesan Online</h1>
          <p className="text-sm opacity-70">
            Pesanan yang masuk dari pelanggan lewat website.
          </p>
        </div>

        <button onClick={muatData} className="btn btn-sm btn-outline">
          Muat ulang
        </button>
      </div>

      {error && (
        <div role="alert" className="alert alert-error text-sm">
          <span>{error}</span>
        </div>
      )}

      {/* Ringkasan */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {["Menunggu", "Dijemput", "Diproses", "Selesai"].map((s) => (
          <div
            key={s}
            className="rounded-lg border border-white/10 bg-base-200 p-4"
          >
            <p className="text-sm opacity-70">{s}</p>
            <p className="text-3xl font-bold">{jumlah(s)}</p>
          </div>
        ))}
      </div>

      {/* Pencarian dan filter */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          type="text"
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          placeholder="Cari nama atau kode pesanan"
          className="input input-bordered w-full md:max-w-xs"
        />

        <div className="flex flex-wrap gap-2">
          {filterStatus.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`btn btn-sm ${
                filter === s ? "btn-primary" : "btn-outline"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto rounded-lg border border-white/10 bg-base-200">
        <table className="table">
          <thead>
            <tr>
              <th>Kode</th>
              <th>Pelanggan</th>
              <th>Pesanan</th>
              <th>Perkiraan total</th>
              <th>Status</th>
              <th className="text-right">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="py-10 text-center">
                  <span className="loading loading-spinner"></span>
                </td>
              </tr>
            )}

            {!loading && tampil.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center opacity-70">
                  Tidak ada pesanan yang cocok.
                </td>
              </tr>
            )}

            {!loading &&
              tampil.map((p) => (
                <tr key={p.id}>
                  <td className="font-semibold">{p.kode || `PO-${p.id}`}</td>

                                    <td>
                    <p className="font-medium">{p.nama}</p>
                    <p className="text-xs opacity-70">
                      {p.pengambilan === "jemput"
                        ? `Jemput: ${p.alamat || "-"}`
                        : "Antar sendiri ke outlet"}
                    </p>
                    <p className="text-xs opacity-70">
                      {p.pengembalian === "antar"
                        ? `Antar kembali ke: ${p.alamatAntar || "-"}`
                        : "Diambil di outlet"}
                    </p>
                    {p.pengembalian === "antar" && (
                      <span className="badge badge-outline badge-sm mt-1">
                        Perlu diantar
                      </span>
                    )}
                    {p.catatan && (
                      <p className="text-xs opacity-70">Catatan: {p.catatan}</p>
                    )}
                  </td>

                  <td>
                    <ul className="space-y-1 text-sm">
                      {(p.items || []).map((it, i) => (
                        <li key={it.id ?? i}>
                          {it.serviceName}
                          {it.itemType ? ` (${it.itemType})` : ""} ·{" "}
                          {it.quantity} {it.unit}
                        </li>
                      ))}
                    </ul>
                  </td>

                  <td className="font-semibold">{rupiah(p.total)}</td>

                  <td>
                    <span className={`badge ${badge[p.status] || ""}`}>
                      {p.status}
                    </span>
                  </td>

                  <td>
                    <div className="flex justify-end gap-2">
                      {berikutnya[p.status] && (
                        <button
                          onClick={() => ubahStatus(p.id, berikutnya[p.status])}
                          disabled={prosesId === p.id}
                          className="btn btn-xs btn-primary"
                        >
                          {labelAksi[p.status]}
                        </button>
                      )}

                      {p.status === "Menunggu" && (
                        <button
                          onClick={() => ubahStatus(p.id, "Dibatalkan")}
                          disabled={prosesId === p.id}
                          className="btn btn-xs btn-outline btn-error"
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
  );
}