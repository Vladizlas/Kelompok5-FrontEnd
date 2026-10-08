import { useState } from "react";

// Nomor WhatsApp laundry: format internasional TANPA tanda + dan spasi
// (contoh: 6281234567890 untuk 0812-3456-7890). Ganti sesuai nomor outlet.
const WA_NUMBER = "6281234567890";

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

  // =========================================================
  // TURUNAN PER ITEM (sama dengan form Order di admin)
  // kategori -> layanan -> jenis item (harga) -> berat/pcs -> subtotal
  // =========================================================

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

  // =========================================================
  // HANDLER
  // =========================================================

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

    // kalau layanan hanya punya 1 harga, langsung dipilihkan
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

  // =========================================================
  // SUBMIT -> buka WhatsApp dengan pesan yang sudah terisi
  // =========================================================

  const handleSubmit = (e) => {
    e.preventDefault();

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
          `Item ${no}: ${
            info.unit === "pcs" ? "jumlah" : "berat"
          } harus lebih dari 0`
        );
      }

      if (info.unit === "pcs" && !Number.isInteger(info.qty)) {
        return setError(`Item ${no}: jumlah pcs harus bilangan bulat`);
      }

      orderLines.push(
        `${no}. ${info.category.name} - ${info.service.name} (${
          info.selectedPrice.itemType
        }): ${info.qty} ${info.unit} x ${rupiah(
          info.selectedPrice.price
        )} = ${rupiah(info.subtotal)}`
      );
    }

    const lines = [
      "Halo Fanara Laundry, saya ingin memesan:",
      "",
      `Nama: ${form.nama.trim()}`,
      `Pengambilan: ${
        form.pengambilan === "jemput" ? "Minta dijemput" : "Antar sendiri"
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

    window.open(url, "_blank", "noopener,noreferrer");
    onClose();
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h2 className="text-lg font-bold">Pesan via WhatsApp</h2>
        <p className="text-sm text-base-content/70 mt-1">
          Pilih layanan, lalu kami arahkan ke WhatsApp dengan pesan yang sudah
          terisi.
        </p>

        {loading ? (
          <div className="py-12 text-center">
            <span className="loading loading-spinner"></span>
          </div>
        ) : loadError ? (
          <div role="alert" className="alert alert-error text-sm mt-4">
            <span>{loadError}</span>
          </div>
        ) : services.length === 0 ? (
          <div role="alert" className="alert alert-warning text-sm mt-4">
            <span>Belum ada layanan yang tersedia.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {error && (
              <div role="alert" className="alert alert-error text-sm">
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Nama</label>

              <input
                type="text"
                name="nama"
                value={form.nama}
                onChange={handleChange}
                maxLength={100}
                placeholder="Nama Anda"
                className="input w-full"
              />
            </div>

            {/* ITEM LAYANAN */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Item Layanan</h3>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="btn btn-sm btn-outline btn-primary"
                >
                  + Tambah Item
                </button>
              </div>

              {form.items.map((item, index) => {
                const info = getItemInfo(item);

                return (
                  <div
                    key={item.key}
                    className="border border-base-300 rounded-box p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">
                        Item {index + 1}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.key)}
                        disabled={form.items.length === 1}
                        className="btn btn-xs btn-error btn-outline"
                      >
                        Hapus
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* KATEGORI */}
                      <div>
                        <label className="block text-xs font-medium mb-1">
                          Kategori Layanan
                        </label>

                        <select
                          value={item.categoryId}
                          onChange={(e) =>
                            handleCategoryChange(item.key, e.target.value)
                          }
                          className="select w-full"
                        >
                          <option value="">Pilih kategori</option>

                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* LAYANAN (mengikuti kategori) */}
                      <div>
                        <label className="block text-xs font-medium mb-1">
                          Layanan
                        </label>

                        <select
                          value={item.serviceId}
                          onChange={(e) =>
                            handleServiceChange(item.key, e.target.value)
                          }
                          disabled={!item.categoryId}
                          className="select w-full"
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

                      {/* JENIS ITEM / HARGA */}
                      <div>
                        <label className="block text-xs font-medium mb-1">
                          Jenis Item
                        </label>

                        <select
                          value={item.servicePriceId}
                          onChange={(e) =>
                            handlePriceChange(item.key, e.target.value)
                          }
                          disabled={!item.serviceId}
                          className="select w-full"
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

                      {/* BERAT / PCS */}
                      <div>
                        <label className="block text-xs font-medium mb-1">
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
                          className="input w-full"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-base-content/70">Subtotal</span>

                      <span className="font-semibold">
                        {info.subtotal > 0 ? rupiah(info.subtotal) : "-"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PERKIRAAN TOTAL */}
            <div className="rounded-box bg-base-200 px-4 py-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Perkiraan Total</span>

                <span className="text-lg font-bold">{rupiah(grandTotal)}</span>
              </div>

              <p className="text-xs text-base-content/60 mt-1">
                Harga final menyesuaikan hasil timbang di outlet.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Pengambilan
              </label>

              <select
                name="pengambilan"
                value={form.pengambilan}
                onChange={handleChange}
                className="select w-full"
              >
                <option value="antar">Saya antar ke outlet</option>
                <option value="jemput">Tolong dijemput</option>
              </select>
            </div>

            {form.pengambilan === "jemput" && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Alamat Penjemputan
                </label>

                <textarea
                  name="alamat"
                  value={form.alamat}
                  onChange={handleChange}
                  rows={2}
                  maxLength={255}
                  placeholder="Alamat lengkap"
                  className="textarea w-full"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                Catatan (opsional)
              </label>

              <textarea
                name="catatan"
                value={form.catatan}
                onChange={handleChange}
                rows={2}
                maxLength={255}
                placeholder="Contoh: pakaian putih dipisah"
                className="textarea w-full"
              />
            </div>

            <div className="modal-action">
              <button type="button" onClick={onClose} className="btn">
                Batal
              </button>

              <button type="submit" className="btn btn-primary">
                Lanjut ke WhatsApp
              </button>
            </div>
          </form>
        )}

        {(loading || loadError || services.length === 0) && (
          <div className="modal-action">
            <button type="button" onClick={onClose} className="btn">
              Tutup
            </button>
          </div>
        )}
      </div>

      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}

export default WhatsAppOrderModal;