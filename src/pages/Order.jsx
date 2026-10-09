import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getOrders,
  createOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
} from "../services/orderApi";

import { getCustomers } from "../services/customerApi";
import { getCategories } from "../services/categoryServiceApi";
import { getServices } from "../services/serviceApi";

// ---------------------------------------------------------
// HELPER
// ---------------------------------------------------------

const STATUS_OPTIONS = [
  { value: "diterima", label: "Diterima" },
  { value: "diproses", label: "Diproses" },
  { value: "selesai", label: "Selesai" },
  { value: "diambil", label: "Diambil" },
];

const STATUS_CLASS = {
  diterima: "select-info",
  diproses: "select-warning",
  selesai: "select-success",
  diambil: "select-neutral",
};

let itemKeySeed = 0;

const newItem = (data = {}) => ({
  key: ++itemKeySeed,
  categoryId: "",
  serviceId: "",
  servicePriceId: "",
  quantity: "",
  ...data,
});

const emptyForm = () => ({
  customerId: "",
  paymentMethod: "cash",
  items: [newItem()],
});

const rupiah = (value) =>
  `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

const invoiceNo = (id) => `INV-${String(id).padStart(4, "0")}`;

function Order() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]); // sudah include prices

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // =========================================================
  // FETCH
  // =========================================================

  const fetchAll = async () => {
    const [ordersRes, customersRes, categoriesRes, servicesRes] =
      await Promise.all([
        getOrders(),
        getCustomers(),
        getCategories(),
        getServices(),
      ]);

    return {
      orders: ordersRes.data || [],
      customers: customersRes.data || [],
      categories: categoriesRes.data || [],
      services: servicesRes.data || [],
    };
  };

  const applyData = (data) => {
    setOrders(data.orders);
    setCustomers(data.customers);
    setCategories(data.categories);
    setServices(data.services);
    setError("");
  };

  const applyError = (err) => {
    console.error(err);

    setError(err.response?.data?.message || "Gagal mengambil data order");
  };

  useEffect(() => {
    let ignore = false;

    fetchAll()
      .then((data) => {
        if (!ignore) applyData(data);
      })
      .catch((err) => {
        if (!ignore) applyError(err);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleRetry = async () => {
    setLoading(true);

    try {
      applyData(await fetchAll());
    } catch (err) {
      applyError(err);
    } finally {
      setLoading(false);
    }
  };

  const refreshOrders = async () => {
    const result = await getOrders();
    setOrders(result.data || []);
  };

  // =========================================================
  // TURUNAN PER ITEM
  // kategori -> layanan -> jenis item (harga) -> berat/pcs -> subtotal
  // =========================================================

  const getItemInfo = (item) => {
    const filteredServices = services.filter(
      (s) => String(s.categoryId) === String(item.categoryId)
    );

    const selectedService = services.find(
      (s) => String(s.id) === String(item.serviceId)
    );

    const priceOptions = selectedService?.prices || [];

    const selectedPrice = priceOptions.find(
      (p) => String(p.id) === String(item.servicePriceId)
    );

    const qty = Number(item.quantity);

    return {
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
  // FORM HANDLER
  // =========================================================

  const handleFieldChange = (e) => {
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
  // MODAL
  // =========================================================

  const handleOpenCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormError("");
    setShowModal(true);
  };

  const handleOpenEdit = (order) => {
    setEditing(order);

    setForm({
      customerId: String(order.customerId),
      paymentMethod: order.paymentMethod,
      items: (order.items || []).map((item) =>
        newItem({
          categoryId: String(item.categoryId),
          serviceId: String(item.serviceId),
          servicePriceId: String(item.servicePriceId),
          quantity: String(Number(item.quantity)),
        })
      ),
    });

    setFormError("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(emptyForm());
    setFormError("");
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.customerId) return setFormError("Pelanggan wajib dipilih");

    for (let i = 0; i < form.items.length; i++) {
      const item = form.items[i];
      const info = getItemInfo(item);
      const no = i + 1;

      if (!item.categoryId)
        return setFormError(`Item ${no}: kategori layanan wajib dipilih`);
      if (!item.serviceId)
        return setFormError(`Item ${no}: layanan wajib dipilih`);
      if (!item.servicePriceId)
        return setFormError(`Item ${no}: jenis item wajib dipilih`);

      if (!(info.qty > 0)) {
        return setFormError(
          `Item ${no}: ${info.unit === "pcs" ? "jumlah" : "berat"
          } harus lebih dari 0`
        );
      }

      if (info.unit === "pcs" && !Number.isInteger(info.qty)) {
        return setFormError(`Item ${no}: jumlah pcs harus bilangan bulat`);
      }
    }

    try {
      setSaving(true);
      setFormError("");

      // subtotal & total tidak dikirim: dihitung ulang oleh server
      const payload = {
        customerId: Number(form.customerId),
        paymentMethod: form.paymentMethod,
        items: form.items.map((item) => ({
          servicePriceId: Number(item.servicePriceId),
          quantity: Number(item.quantity),
        })),
      };

      if (editing) {
        await updateOrder(editing.id, payload);
      } else {
        await createOrder(payload);
      }

      handleCloseModal();
      await refreshOrders();
    } catch (err) {
      console.error(err);

      setFormError(err.response?.data?.message || "Gagal menyimpan order");
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // UBAH STATUS
  // =========================================================

  const handleStatusChange = async (order, status) => {
    try {
      await updateOrderStatus(order.id, status);

      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status } : o))
      );
    } catch (err) {
      console.error(err);

      alert(err.response?.data?.message || "Gagal mengubah status");
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (order) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus invoice ${invoiceNo(order.id)}?`
    );

    if (!confirmed) return;

    try {
      await deleteOrder(order.id);
      await refreshOrders();
    } catch (err) {
      console.error(err);

      alert(err.response?.data?.message || "Gagal menghapus order");
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Order</h1>
          <p className="text-sm opacity-70 mt-1">
            Satu order = satu invoice, bisa berisi beberapa layanan
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          disabled={loading || customers.length === 0 || services.length === 0}
          className="btn btn-primary w-fit"
        >
          + Tambah Order
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div role="alert" className="alert alert-error mb-4">
          <span>{error}</span>

          <button type="button" onClick={handleRetry} className="btn btn-sm">
            Coba lagi
          </button>
        </div>
      )}

      {/* PERINGATAN DATA MASTER KOSONG */}
      {!loading && !error && customers.length === 0 && (
        <div role="alert" className="alert alert-warning mb-4">
          <span>
            Belum ada customer. Tambahkan dulu di menu{" "}
            <Link to="/customer" className="link font-semibold">
              Customer
            </Link>
            .
          </span>
        </div>
      )}

      {!loading && !error && services.length === 0 && (
        <div role="alert" className="alert alert-warning mb-4">
          <span>
            Belum ada layanan. Tambahkan dulu di menu{" "}
            <Link to="/layanan" className="link font-semibold">
              Layanan
            </Link>
            .
          </span>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-base-100 border border-base-300 rounded-box overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Pelanggan</th>
              <th>Rincian</th>
              <th>Total</th>
              <th>Pembayaran</th>
              <th>Status</th>
              <th className="text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-10">
                  <span className="loading loading-spinner"></span>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-10 opacity-70">
                  Belum ada order.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td className="font-mono text-sm align-top">
                    {invoiceNo(order.id)}
                    <div className="text-xs opacity-60">ID {order.id}</div>
                  </td>

                  <td className="font-semibold align-top">
                    {order.customer?.name || "-"}
                  </td>

                  <td className="align-top">
                    <ul className="space-y-1 text-sm">
                      {(order.items || []).map((item) => (
                        <li key={item.id}>
                          <span className="font-medium">
                            {item.service?.name || "-"}
                          </span>{" "}
                          <span className="opacity-70">
                            ({item.category?.name || "-"} /{" "}
                            {item.servicePrice?.itemType || "-"})
                          </span>
                          <div className="text-xs opacity-70">
                            {Number(item.quantity)} {item.unit} x{" "}
                            {rupiah(item.pricePerUnit)} ={" "}
                            <span className="font-semibold">
                              {rupiah(item.subtotal)}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </td>

                  <td className="font-semibold align-top whitespace-nowrap">
                    {rupiah(order.totalPrice)}
                  </td>

                  <td className="align-top">
                    <span
                      className={`badge ${order.paymentMethod === "cash"
                          ? "badge-success"
                          : "badge-info"
                        } capitalize`}
                    >
                      {order.paymentMethod}
                    </span>
                  </td>

                  <td className="align-top">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order, e.target.value)
                      }
                      className={`select select-xs w-28 ${STATUS_CLASS[order.status] || ""
                        }`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="align-top">
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(order)}
                        className="btn btn-xs btn-warning btn-outline"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(order)}
                        className="btn btn-xs btn-error btn-outline"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-3xl">
            <h2 className="text-lg font-bold mb-4">
              {editing
                ? `Edit Order ${invoiceNo(editing.id)}`
                : "Tambah Order"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div role="alert" className="alert alert-error text-sm">
                  <span>{formError}</span>
                </div>
              )}

              {/* PELANGGAN */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nama Pelanggan
                </label>

                <select
                  name="customerId"
                  value={form.customerId}
                  onChange={handleFieldChange}
                  className="select w-full"
                >
                  <option value="">Pilih pelanggan</option>

                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.phone}
                    </option>
                  ))}
                </select>
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
                                ? "Berat (kg)"
                                : "Berat / Pcs"}
                          </label>

                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(item.key, {
                                quantity: e.target.value,
                              })
                            }
                            disabled={!item.servicePriceId}
                            min={info.unit === "pcs" ? "1" : "0.1"}
                            step={info.unit === "pcs" ? "1" : "0.1"}
                            placeholder={
                              info.unit === "pcs"
                                ? "Contoh: 3"
                                : "Contoh: 2.5"
                            }
                            className="input w-full"
                          />
                        </div>
                      </div>

                      {/* SUBTOTAL OTOMATIS */}
                      <div className="flex justify-between text-sm">
                        <span className="opacity-70">Subtotal</span>

                        <span className="font-semibold">
                          {info.subtotal > 0
                            ? rupiah(info.subtotal)
                            : "-"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* TOTAL */}
              <div className="flex justify-between items-center rounded-box bg-base-200 px-4 py-3">
                <span className="font-semibold">Total Harga</span>

                <span className="text-lg font-bold">
                  {rupiah(grandTotal)}
                </span>
              </div>

              {/* METODE PEMBAYARAN */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Metode Pembayaran
                </label>

                <select
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={handleFieldChange}
                  className="select w-full"
                >
                  <option value="cash">Cash</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? "Menyimpan..." : editing ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Order;