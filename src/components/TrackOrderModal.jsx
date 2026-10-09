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
    <div className="modal modal-open">
      <div className="modal-box">
        <h2 className="text-lg font-bold">Cek Status Order</h2>
        <p className="text-sm text-base-content/70 mt-1">
          Masukkan nomor invoice yang diberikan kasir, misalnya INV-0001.
        </p>

        <form onSubmit={handleSubmit} className="join w-full mt-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="INV-0001"
            maxLength={20}
            className="input join-item w-full"
          />

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary join-item"
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Cek"
            )}
          </button>
        </form>

        {error && (
          <div role="alert" className="alert alert-error text-sm mt-4">
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-mono text-lg font-bold">
                  {result.invoice}
                </div>
                <div className="text-sm text-base-content/70">
                  {result.customerName}
                </div>
              </div>

              <div className="text-right text-sm text-base-content/70">
                Masuk
                <div className="font-medium text-base-content">
                  {formatDate(result.createdAt)}
                </div>
              </div>
            </div>

            <ul className="steps w-full">
              {STEPS.map((step, i) => (
                <li
                  key={step.key}
                  className={`step ${i <= currentIndex ? "step-primary" : ""}`}
                >
                  {step.label}
                </li>
              ))}
            </ul>

            <div role="alert" className="alert alert-info alert-soft text-sm">
              <span>{STATUS_INFO[result.status]}</span>
            </div>

            <div>
              <div className="text-sm font-semibold mb-1">Rincian Cucian</div>

              <ul className="text-sm space-y-1">
                {result.items.map((item, i) => (
                  <li key={i} className="flex justify-between gap-4">
                    <span>
                      {item.service}
                      <span className="text-base-content/60">
                        {" "}
                        ({item.itemType})
                      </span>
                    </span>

                    <span className="whitespace-nowrap">
                      {item.quantity} {item.unit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="modal-action">
          <button type="button" onClick={onClose} className="btn">
            Tutup
          </button>
        </div>
      </div>

      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}

export default TrackOrderModal;