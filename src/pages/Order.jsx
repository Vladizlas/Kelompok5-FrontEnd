import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder,
} from "../services/orderApi";
import { getCustomers } from "../services/customerApi";
import { getCategories } from "../services/categoryServiceApi";
import { getServices } from "../services/serviceApi";

// ---------------------------------------------------------
// HELPER
// ---------------------------------------------------------

let itemKeySeed = 0;

const newItem = (data = {}) => ({
  key: ++itemKeySeed,
  categoryId: "",
  serviceId: "",
  servicePriceId: "",
  quantity: "",
  ...data,
});

const todayString = () => new Date().toISOString().split("T")[0];

const emptyForm = () => ({
  customerId: "",
  paymentMethod: "cash",
  orderDate: todayString(),
  items: [newItem()],
});

const rupiah = (value) =>
  `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

const invoiceNo = (id) => `INV-${String(id).padStart(4, "0")}`;

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

function Order() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);

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
      orderDate: order.orderDate
        ? new Date(order.orderDate).toISOString().split("T")[0]
        : todayString(),
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
    if (!form.orderDate) return setFormError("Tanggal order wajib diisi");

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
          `Item ${no}: ${info.unit === "pcs" ? "jumlah" : "berat"} harus lebih dari 0`
        );
      }

      if (info.unit === "pcs" && !Number.isInteger(info.qty)) {
        return setFormError(`Item ${no}: jumlah pcs harus bilangan bulat`);
      }
    }

    try {
      setSaving(true);
      setFormError("");

      const payload = {
        customerId: Number(form.customerId),
        paymentMethod: form.paymentMethod,
        orderDate: form.orderDate,
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
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-base-100 p-6 rounded-2xl border border-base-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Order</h1>
          <p className="text-sm text-base-content/70 mt-1">
            Kelola transaksi, riwayat pemesanan, dan rincian layanan pelanggan.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          disabled={loading || customers.length === 0 || services.length === 0}
          className="btn btn-primary gap-2 shadow-sm font-semibold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Order
        </button>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div role="alert" className="alert alert-error shadow-sm">
          <svg className="w-6 h-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="flex-1">{error}</span>
          <button type="button" onClick={handleRetry} className="btn btn-sm">
            Coba lagi
          </button>
        </div>
      )}

      {/* WARNING DATA MASTER */}
      {!loading && !error && (customers.length === 0 || services.length === 0) && (
        <div className="space-y-3">
          {customers.length === 0 && (
            <div role="alert" className="alert alert-warning shadow-sm text-sm">
              <svg className="w-5 h-5 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>
                Belum ada data customer. Silakan tambahkan dahulu di menu{" "}
                <Link to="/customer" className="underline font-semibold hover:opacity-80">
                  Customer
                </Link>
                .
              </span>
            </div>
          )}

          {services.length === 0 && (
            <div role="alert" className="alert alert-warning shadow-sm text-sm">
              <svg className="w-5 h-5 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>
                Belum ada data layanan. Silakan tambahkan dahulu di menu{" "}
                <Link to="/layanan" className="underline font-semibold hover:opacity-80">
                  Layanan
                </Link>
                .
              </span>
            </div>
          )}
        </div>
      )}

      {/* TABLE DATA */}
      <div className="bg-base-100 border border-base-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="bg-base-200/50 text-base-content/70 text-xs uppercase tracking-wider">
                <th>Invoice</th>
                <th>Tanggal</th>
                <th>Pelanggan</th>
                <th>Rincian Layanan</th>
                <th>Total Price</th>
                <th>Metode</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-base-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <span className="loading loading-spinner loading-md text-primary"></span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-base-content/60">
                    Belum ada order yang dicatat.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-base-200/30 transition-colors">
                    {/* INVOICE */}
                    <td className="font-mono text-sm font-semibold text-primary align-top">
                      {invoiceNo(order.id)}
                    </td>

                    {/* TANGGAL */}
                    <td className="text-xs text-base-content/80 align-top whitespace-nowrap">
                      {formatDate(order.orderDate || order.createdAt)}
                    </td>

                    {/* PELANGGAN */}
                    <td className="font-medium align-top">
                      {order.customer?.name || "-"}
                    </td>

                    {/* RINCIAN ITEM */}
                    <td className="align-top">
                      <div className="space-y-2">
                        {(order.items || []).map((item) => (
                          <div key={item.id} className="text-xs bg-base-200/40 p-2 rounded-lg border border-base-200">
                            <div className="font-semibold text-sm">
                              {item.service?.name || "-"}{" "}
                              <span className="font-normal text-xs text-base-content/60">
                                ({item.category?.name || "-"} / {item.servicePrice?.itemType || "-"})
                              </span>
                            </div>
                            <div className="text-base-content/70 mt-1">
                              {Number(item.quantity)} {item.unit} × {rupiah(item.pricePerUnit)} ={" "}
                              <span className="font-semibold text-base-content">
                                {rupiah(item.subtotal)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* TOTAL HARGA */}
                    <td className="font-bold align-top whitespace-nowrap text-sm">
                      {rupiah(order.totalPrice)}
                    </td>

                    {/* PEMBAYARAN */}
                    <td className="align-top">
                      <span
                        className={`badge badge-sm font-medium capitalize ${order.paymentMethod === "cash"
                            ? "badge-success text-success-content"
                            : "badge-info text-info-content"
                          }`}
                      >
                        {order.paymentMethod}
                      </span>
                    </td>

                    {/* AKSI */}
                    <td className="align-top">
                      <div className="flex justify-center items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(order)}
                          className="btn btn-ghost btn-xs text-warning hover:bg-warning/10"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(order)}
                          className="btn btn-ghost btn-xs text-error hover:bg-error/10"
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
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div className="modal modal-open backdrop-blur-sm">
          <div className="modal-box max-w-3xl rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-base-200 mb-4">
              <h2 className="text-lg font-bold">
                {editing ? `Edit Order #${invoiceNo(editing.id)}` : "Tambah Order Baru"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="btn btn-sm btn-circle btn-ghost"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {formError && (
                <div role="alert" className="alert alert-error text-sm p-3 rounded-xl">
                  <span>{formError}</span>
                </div>
              )}

              {/* DATA UTAMA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label text-xs font-semibold">Nama Pelanggan</label>
                  <select
                    name="customerId"
                    value={form.customerId}
                    onChange={handleFieldChange}
                    className="select select-bordered select-sm w-full focus:outline-none"
                  >
                    <option value="">Pilih pelanggan</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label text-xs font-semibold">Tanggal Order</label>
                  <input
                    type="date"
                    name="orderDate"
                    value={form.orderDate}
                    onChange={handleFieldChange}
                    className="input input-bordered input-sm w-full focus:outline-none"
                  />
                </div>
              </div>

              {/* ITEM LAYANAN */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/70">
                    Rincian Layanan
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="btn btn-xs btn-outline btn-primary gap-1"
                  >
                    + Tambah Item
                  </button>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {form.items.map((item, index) => {
                    const info = getItemInfo(item);

                    return (
                      <div
                        key={item.key}
                        className="bg-base-200/40 border border-base-200 rounded-xl p-4 space-y-3 relative"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-base-200/60">
                          <span className="text-xs font-bold text-primary">
                            Item #{index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.key)}
                            disabled={form.items.length === 1}
                            className="btn btn-xs btn-circle btn-ghost text-error disabled:opacity-30"
                            title="Hapus Item"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* KATEGORI */}
                          <div>
                            <label className="label text-[11px] font-medium py-1">Kategori</label>
                            <select
                              value={item.categoryId}
                              onChange={(e) => handleCategoryChange(item.key, e.target.value)}
                              className="select select-bordered select-xs w-full"
                            >
                              <option value="">Pilih kategori</option>
                              {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* LAYANAN */}
                          <div>
                            <label className="label text-[11px] font-medium py-1">Layanan</label>
                            <select
                              value={item.serviceId}
                              onChange={(e) => handleServiceChange(item.key, e.target.value)}
                              disabled={!item.categoryId}
                              className="select select-bordered select-xs w-full"
                            >
                              <option value="">
                                {!item.categoryId
                                  ? "Pilih kategori dulu"
                                  : info.filteredServices.length === 0
                                    ? "Kosong"
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
                            <label className="label text-[11px] font-medium py-1">Jenis Item</label>
                            <select
                              value={item.servicePriceId}
                              onChange={(e) => handlePriceChange(item.key, e.target.value)}
                              disabled={!item.serviceId}
                              className="select select-bordered select-xs w-full"
                            >
                              <option value="">
                                {!item.serviceId
                                  ? "Pilih layanan dulu"
                                  : info.priceOptions.length === 0
                                    ? "Tidak ada pilihan harga"
                                    : "Pilih jenis item"}
                              </option>
                              {info.priceOptions.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.itemType} ({rupiah(p.price)}/{p.unit})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* QUANTITY */}
                          <div>
                            <label className="label text-[11px] font-medium py-1">
                              {info.unit === "pcs"
                                ? "Jumlah (pcs)"
                                : info.unit === "kg"
                                  ? "Berat (kg)"
                                  : "Jumlah / Berat"}
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
                              placeholder={info.unit === "pcs" ? "Contoh: 3" : "Contoh: 2.5"}
                              className="input input-bordered input-xs w-full"
                            />
                          </div>
                        </div>

                        {/* SUBTOTAL ITEM */}
                        <div className="flex justify-end items-center gap-2 pt-1 text-xs">
                          <span className="text-base-content/60">Subtotal:</span>
                          <span className="font-bold text-base-content">
                            {info.subtotal > 0 ? rupiah(info.subtotal) : "Rp 0"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* METODE & TOTAL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
                <div>
                  <label className="label text-xs font-semibold py-1">Metode Pembayaran</label>
                  <select
                    name="paymentMethod"
                    value={form.paymentMethod}
                    onChange={handleFieldChange}
                    className="select select-bordered select-sm w-full"
                  >
                    <option value="cash">Cash (Tunai)</option>
                    <option value="transfer">Transfer Bank</option>
                  </select>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-xs font-semibold text-primary">Total Harga:</span>
                  <span className="text-lg font-black text-primary">{rupiah(grandTotal)}</span>
                </div>
              </div>

              {/* FOOTER MODAL */}
              <div className="modal-action border-t border-base-200 pt-4 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-sm btn-ghost"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-sm btn-primary min-w-[100px]"
                >
                  {saving ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : editing ? (
                    "Update Order"
                  ) : (
                    "Simpan Order"
                  )}
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