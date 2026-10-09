import { useState } from "react";
import { trackOrder } from "../services/orderApi";

const STEPS = [
  { key: "diterima", label: "Diterima" },
  { key: "diproses", label: "Diproses" },
  { key: "selesai", label: "Selesai" },
  { key: "diambil", label: "Diambil" },
];

const STATUS_INFO = {
  diterima: "Cucian Anda sudah kami terima dan menunggu giliran diproses.",
  diproses: "Cucian Anda sedang kami cuci dan rapikan.",
  selesai: "Cucian Anda sudah selesai dan siap diambil atau diantar.",
  diambil: "Cucian sudah diambil. Terima kasih sudah mempercayakan pada kami!",
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

function TrackOrderModal({ onClose }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!code.trim()) {
      setResult(null);
      return setError("Masukkan nomor invoice dari kasir");
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await trackOrder(code.trim());
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Gagal mengecek status. Coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  const currentIndex = result
    ? STEPS.findIndex((s) => s.key === result.status)
    : -1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-lg overflow-hidden my-8 text-slate-800">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-6 text-white flex justify-between items-start">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">Cek Status Order</h2>
            <p className="text-xs text-sky-100 font-medium mt-1">
              Masukkan nomor invoice yang diberikan kasir, misalnya INV-0001.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg text-xs font-bold transition"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Form Pencarian Invoice */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Contoh: INV-0001"
              maxLength={20}
              className="flex-1 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
            />

            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-sky-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2 min-w-[70px]"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Cek"
              )}
            </button>
          </form>

          {/* Alert Error */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Hasil Status Tracking */}
          {result && (
            <div className="space-y-5 pt-2">
              <div className="flex items-start justify-between gap-4 bg-slate-50 border border-slate-200/80 p-4 rounded-xl">
                <div>
                  <div className="font-mono text-base font-black text-slate-800">
                    {result.invoice}
                  </div>
                  <div className="text-xs font-bold text-sky-600 mt-0.5">
                    {result.customerName}
                  </div>
                </div>

                <div className="text-right text-xs text-slate-400">
                  Tanggal Masuk
                  <div className="font-semibold text-slate-700">
                    {formatDate(result.createdAt)}
                  </div>
                </div>
              </div>

              {/* Progress Step Bar */}
              <div className="py-2">
                <div className="grid grid-cols-4 gap-1 relative">
                  {STEPS.map((step, i) => {
                    const isPassed = i <= currentIndex;
                    return (
                      <div key={step.key} className="flex flex-col items-center gap-1.5 z-10">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${isPassed
                              ? "bg-sky-500 text-white shadow-md shadow-sky-200"
                              : "bg-slate-100 text-slate-400 border border-slate-200"
                            }`}
                        >
                          {i + 1}
                        </div>
                        <span
                          className={`text-[11px] font-bold ${isPassed ? "text-sky-600" : "text-slate-400"
                            }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Info Status Deskripsi */}
              <div className="bg-sky-50 border border-sky-200 text-sky-800 p-3.5 rounded-xl text-xs font-medium flex items-start gap-2.5">
                <span className="text-sky-500 font-bold text-sm">ℹ</span>
                <p className="leading-relaxed">
                  {STATUS_INFO[result.status] || "Status tidak diketahui."}
                </p>
              </div>

              {/* Rincian Cucian */}
              <div className="bg-slate-50/60 border border-slate-200/80 rounded-xl p-4 space-y-2">
                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-200/60">
                  Rincian Cucian
                </div>

                <ul className="text-xs divide-y divide-slate-100 space-y-1 pt-1">
                  {result.items.map((item, i) => (
                    <li key={i} className="flex justify-between items-center py-1.5">
                      <span className="font-medium text-slate-700">
                        {item.service}{" "}
                        <span className="text-slate-400 font-normal">
                          ({item.itemType})
                        </span>
                      </span>

                      <span className="font-bold text-slate-800 font-mono bg-white border border-slate-200/60 px-2 py-0.5 rounded-md text-[11px]">
                        {item.quantity} {item.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Action Close Button */}
          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrackOrderModal;