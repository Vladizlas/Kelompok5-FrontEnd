import { useState } from "react";

const WA_NUMBER = "6281268808101";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const rupiah = (value) =>
  `Rp${Number(value || 0).toLocaleString("id-ID")}`;

let itemKeySeed = 0;

const newItem = () => ({
  key: ++itemKeySeed,
  categoryId: "",
  serviceId: "",
  servicePriceId: "",
  quantity: "",
});

const emptyForm = () => ({
  nama: "",
  pengambilan: "antar",
  alamat: "",
  catatan: "",
  items: [newItem()],
});

function WhatsAppOrderModal({ categories, services, loading, loadError, onClose }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const getItemInfo = (item) => {
    const category = categories.find(
      (c) => String(c.id) === String(item.categoryId)
    );

    const filteredServices = services.filter(
      (s) => String(s.categoryId) === String(item.categoryId)
    );

    const service = services.find(
      (s) => String(s.id) === String(item.serviceId)
    );

    const priceOptions = service?.prices || [];

    const selectedPrice = priceOptions.find(
      (p) => String(p.id) === String(item.servicePriceId)
    );

    const qty = Number(item.quantity);

    return {
      category,
      service,
      filteredServices,
      priceOptions,
      selectedPrice,
      unit: selectedPrice?.unit,
      qty,
      subtotal:
        selectedPrice && qty > 0
          ? Math.round(selectedPrice.price * qty)
          : 0,
    };
  };

  const grandTotal = form.items.reduce(
    (sum, item) => sum + getItemInfo(item).subtotal,
    0
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateItem = (key, patch) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.key === key ? { ...item, ...patch } : item
      ),
    }));
  };

  const handleAddItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, newItem()],
    }));
  };

  const handleRemoveItem = (key) => {
    setForm((prev) => ({
      ...prev,
      items:
        prev.items.length === 1
          ? prev.items
          : prev.items.filter((item) => item.key !== key),
    }));
  };

  const handleCategoryChange = (key, categoryId) => {
    updateItem(key, {
      categoryId,
      serviceId: "",
      servicePriceId: "",
      quantity: "",
    });
  };

  const handleServiceChange = (key, serviceId) => {
    const service = services.find(
      (s) => String(s.id) === String(serviceId)
    );

    const onlyPrice =
      service?.prices?.length === 1 ? String(service.prices[0].id) : "";

    updateItem(key, {
      serviceId,
      servicePriceId: onlyPrice,
      quantity: "",
    });
  };

  const handlePriceChange = (key, servicePriceId) => {
    updateItem(key, {
      servicePriceId,
      quantity: "",
    });
  };

  const savePesananOnline = async () => {
    const res = await fetch(`${API_URL}/pesan-online`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nama: form.nama.trim(),
        pengambilan: form.pengambilan,
        alamat: form.pengambilan === "jemput" ? form.alamat.trim() : "",
        catatan: form.catatan.trim(),
        items: form.items.map((item) => ({
          servicePriceId: Number(item.servicePriceId),
          quantity: Number(item.quantity),
        })),
      }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.message || `Server menjawab ${res.status}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    setError("");

    if (!form.nama.trim()) return setError("Nama wajib diisi");

    if (form.pengambilan === "jemput" && !form.alamat.trim()) {
      return setError("Alamat penjemputan wajib diisi");
    }

    const orderLines = [];

    for (let i = 0; i < form.items.length; i++) {
      const item = form.items[i];
      const info = getItemInfo(item);
      const no = i + 1;

      if (!item.categoryId)
        return setError(`Item ${no}: kategori layanan wajib dipilih`);
      if (!item.serviceId)
        return setError(`Item ${no}: layanan wajib dipilih`);
      if (!item.servicePriceId)
        return setError(`Item ${no}: jenis item wajib dipilih`);

      if (!(info.qty > 0)) {
        return setError(
          `Item ${no}: ${info.unit === "pcs" ? "jumlah" : "berat"
          } harus lebih dari 0`
        );
      }

      if (info.unit === "pcs" && !Number.isInteger(info.qty)) {
        return setError(`Item ${no}: jumlah pcs harus bilangan bulat`);
      }

      orderLines.push(
        `${no}. ${info.category.name} - ${info.service.name} (${info.selectedPrice.itemType
        }): ${info.qty} ${info.unit} x ${rupiah(
          info.selectedPrice.price
        )} = ${rupiah(info.subtotal)}`
      );
    }

    const lines = [
      "Halo Fanara Laundry, saya ingin memesan:",
      "",
      `Nama: ${form.nama.trim()}`,
      `Pengambilan: ${form.pengambilan === "jemput" ? "Minta dijemput" : "Antar sendiri"
      }`,
    ];

    if (form.pengambilan === "jemput") {
      lines.push(`Alamat jemput: ${form.alamat.trim()}`);
    }

    lines.push("", "Pesanan:", ...orderLines, "");
    lines.push(`Perkiraan total: ${rupiah(grandTotal)}`);
    lines.push("(harga final menyesuaikan hasil timbang)");

    if (form.catatan.trim()) {
      lines.push("", `Catatan: ${form.catatan.trim()}`);
    }

    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
      lines.join("\n")
    )}`;

    const waWindow = window.open("", "_blank");

    setSubmitting(true);

    try {
      await savePesananOnline();
    } catch (err) {
      console.error("Gagal menyimpan pesanan online:", err);
    }

    setSubmitting(false);

    if (waWindow) {
      waWindow.location.href = url;
    } else {
      window.location.href = url;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-2xl overflow-hidden my-8 text-slate-800">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-6 text-white flex justify-between items-start">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">Pesan via WhatsApp</h2>
            <p className="text-xs text-sky-100 font-medium mt-1">
              Pilih layanan, lalu kami arahkan ke WhatsApp dengan pesan yang otomatis terisi.
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

        <div className="p-6">
          {loading ? (
            <div className="py-12 text-center text-sky-600">
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-medium text-slate-500">Memuat layanan...</span>
              </div>
            </div>
          ) : loadError ? (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs font-semibold">
              {loadError}
            </div>
          ) : services.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-xl text-xs font-semibold">
              Belum ada layanan yang tersedia.
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Nama Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="nama"
                  value={form.nama}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder="Masukkan nama Anda"
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                />
              </div>

              {/* Items Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    Item Layanan
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1"
                  >
                    <span>+</span> Tambah Item
                  </button>
                </div>

                {form.items.map((item, index) => {
                  const info = getItemInfo(item);

                  return (
                    <div
                      key={item.key}
                      className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-sky-600 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-md">
                          Item #{index + 1}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.key)}
                          disabled={form.items.length === 1}
                          className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md transition disabled:opacity-40"
                        >
                          Hapus
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Kategori */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Kategori Layanan
                          </label>
                          <select
                            value={item.categoryId}
                            onChange={(e) =>
                              handleCategoryChange(item.key, e.target.value)
                            }
                            className="w-full bg-white border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                          >
                            <option value="">Pilih kategori</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Layanan */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Layanan
                          </label>
                          <select
                            value={item.serviceId}
                            onChange={(e) =>
                              handleServiceChange(item.key, e.target.value)
                            }
                            disabled={!item.categoryId}
                            className="w-full bg-white border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition disabled:bg-slate-100"
                          >
                            <option value="">
                              {!item.categoryId
                                ? "Pilih kategori dulu"
                                : info.filteredServices.length === 0
                                  ? "Belum ada layanan di kategori ini"
                                  : "Pilih layanan"}
                            </option>
                            {info.filteredServices.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Jenis Item */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Jenis Item / Harga
                          </label>
                          <select
                            value={item.servicePriceId}
                            onChange={(e) =>
                              handlePriceChange(item.key, e.target.value)
                            }
                            disabled={!item.serviceId}
                            className="w-full bg-white border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition disabled:bg-slate-100"
                          >
                            <option value="">
                              {!item.serviceId
                                ? "Pilih layanan dulu"
                                : info.priceOptions.length === 0
                                  ? "Layanan ini belum punya harga"
                                  : "Pilih jenis item"}
                            </option>
                            {info.priceOptions.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.itemType} - {rupiah(p.price)} / {p.unit}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            {info.unit === "pcs"
                              ? "Jumlah (pcs)"
                              : info.unit === "kg"
                                ? "Perkiraan Berat (kg)"
                                : "Berat / Pcs"}
                          </label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(item.key, { quantity: e.target.value })
                            }
                            disabled={!item.servicePriceId}
                            min={info.unit === "pcs" ? "1" : "0.1"}
                            step={info.unit === "pcs" ? "1" : "0.1"}
                            placeholder={
                              info.unit === "pcs" ? "Contoh: 3" : "Contoh: 2.5"
                            }
                            className="w-full bg-white border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition disabled:bg-slate-100"
                          />
                        </div>
                      </div>

                      {/* Subtotal Item */}
                      <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200/60 font-semibold">
                        <span className="text-slate-500">Subtotal</span>
                        <span className="text-slate-800 font-bold">
                          {info.subtotal > 0 ? rupiah(info.subtotal) : "-"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ringkasan Total */}
              <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-4 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-sky-900">Perkiraan Total</span>
                  <span className="text-lg font-black text-sky-600">
                    {rupiah(grandTotal)}
                  </span>
                </div>
                <p className="text-[11px] text-sky-700/80 mt-0.5">
                  *Harga final menyesuaikan hasil penimbangan/penghitungan di outlet.
                </p>
              </div>

              {/* Pengambilan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Metode Pengambilan
                </label>
                <select
                  name="pengambilan"
                  value={form.pengambilan}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                >
                  <option value="antar">Saya antar sendiri ke outlet</option>
                  <option value="jemput">Tolong dijemput ke lokasi</option>
                </select>
              </div>

              {/* Alamat (Jika Jemput) */}
              {form.pengambilan === "jemput" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alamat Penjemputan
                  </label>
                  <textarea
                    name="alamat"
                    value={form.alamat}
                    onChange={handleChange}
                    rows={2}
                    maxLength={255}
                    placeholder="Tuliskan alamat lengkap penjemputan"
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                  />
                </div>
              )}

              {/* Catatan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Tambahan (Opsional)
                </label>
                <textarea
                  name="catatan"
                  value={form.catatan}
                  onChange={handleChange}
                  rows={2}
                  maxLength={255}
                  placeholder="Contoh: Pakaian putih dipisah, jemput sore jam 4"
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                />
              </div>

              {/* Alert Error */}
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-sky-500/20 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Memproses...</span>
                    </>
                  ) : (
                    "Lanjut ke WhatsApp"
                  )}
                </button>
              </div>
            </form>
          )}

          {(loading || loadError || services.length === 0) && (
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
              >
                Tutup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WhatsAppOrderModal;