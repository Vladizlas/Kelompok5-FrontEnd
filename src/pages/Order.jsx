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
// HELPER & CONFIG
// ---------------------------------------------------------

const STATUS_OPTIONS = [
  { value: "diterima", label: "Diterima" },
  { value: "diproses", label: "Diproses" },
  { value: "selesai", label: "Selesai" },
  { value: "diambil", label: "Diambil" },
];

const STATUS_CLASS = {
  diterima: "bg-sky-50 text-sky-700 border-sky-200",
  diproses: "bg-amber-50 text-amber-700 border-amber-200",
  selesai: "bg-emerald-50 text-emerald-700 border-emerald-200",
  diambil: "bg-slate-100 text-slate-700 border-slate-300",
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

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
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

  const [invoiceOrder, setInvoiceOrder] = useState(null);

  // =========================================================
  // FETCH DATA
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
  // CALCULATIONS
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
  // HANDLERS
  // =========================================================

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
    updateItem(key, { servicePriceId, quantity: "" });
  };

  // =========================================================
  // MODAL HANDLERS
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.customerId) return setFormError("Pelanggan wajib dipilih");

    for (let i = 0; i < form.items.length; i++) {
      const item = form.items[i];
      const info = getItemInfo(item);
      const no = i + 1;

      if (!item.categoryId)
        return setFormError(`Item ${no}: Kategori layanan wajib dipilih`);
      if (!item.serviceId)
        return setFormError(`Item ${no}: Layanan wajib dipilih`);
      if (!item.servicePriceId)
        return setFormError(`Item ${no}: Jenis item wajib dipilih`);

      if (!(info.qty > 0)) {
        return setFormError(
          `Item ${no}: ${info.unit === "pcs" ? "Jumlah" : "Berat"} harus lebih dari 0`
        );
      }

      if (info.unit === "pcs" && !Number.isInteger(info.qty)) {
        return setFormError(`Item ${no}: Jumlah pcs harus berupa angka bulat`);
      }
    }

    try {
      setSaving(true);
      setFormError("");

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

  const handleDelete = async (order) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus order ${invoiceNo(order.id)}?`
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

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="w-full min-h-screen bg-white p-6 lg:p-8 space-y-6 text-slate-800">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-sky-500 to-blue-600 p-6 rounded-2xl shadow-lg shadow-sky-500/15 text-white print:hidden">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Kelola Order</h1>
          <p className="text-sky-100 text-xs font-medium mt-1">
            Satu transaksi invoice dapat berisi beberapa layanan dan jenis item
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          disabled={loading || customers.length === 0 || services.length === 0}
          className="bg-white text-sky-600 hover:bg-sky-50 font-bold px-4 py-2.5 rounded-xl shadow-sm transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center justify-center gap-1.5"
        >
          <span className="text-base leading-none">+</span> Tambah Order
        </button>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm print:hidden">
          <span className="text-sm font-medium">{error}</span>
          <button
            type="button"
            onClick={handleRetry}
            className="text-xs bg-rose-100 hover:bg-rose-200 text-rose-800 font-semibold px-3 py-1.5 rounded-lg transition"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* WARNING MASTER DATA */}
      {!loading && !error && customers.length === 0 && (
        <div className="bg-sky-50 border border-sky-200 text-sky-800 px-4 py-3 rounded-xl text-xs print:hidden">
          Belum ada pelanggan. Tambahkan terlebih dahulu di menu{" "}
          <Link to="/customer" className="font-semibold underline text-sky-600 hover:text-sky-800">
            Customer
          </Link>
          .
        </div>
      )}

      {!loading && !error && services.length === 0 && (
        <div className="bg-sky-50 border border-sky-200 text-sky-800 px-4 py-3 rounded-xl text-xs print:hidden">
          Belum ada layanan. Tambahkan terlebih dahulu di menu{" "}
          <Link to="/layanan" className="font-semibold underline text-sky-600 hover:text-sky-800">
            Layanan
          </Link>
          .
        </div>
      )}

      {/* TABLE DATA */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden print:hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sky-50/50 border-b border-sky-100 text-sky-900 text-[11px] font-bold tracking-wider uppercase">
                <th className="py-3.5 px-4 w-28">Invoice</th>
                <th className="py-3.5 px-4 w-32">Tanggal</th>
                <th className="py-3.5 px-4 w-36">Pelanggan</th>
                <th className="py-3.5 px-4 min-w-[240px]">Rincian Layanan</th>
                <th className="py-3.5 px-4 w-32">Total</th>
                <th className="py-3.5 px-4 w-28">Pembayaran</th>
                <th className="py-3.5 px-4 w-32">Status</th>
                <th className="py-3.5 px-4 w-36 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-sky-600">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-sky-200 border-t-sky-600"></div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400 font-medium text-xs">
                    Belum ada order.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-sky-50/20 transition duration-150">
                    <td className="py-4 px-4 font-mono text-xs font-bold text-sky-600 whitespace-nowrap">
                      {invoiceNo(order.id)}
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap font-medium">
                      {formatDate(order.createdAt || order.orderDate || order.created_at)}
                    </td>

                    <td className="py-4 px-4 font-bold text-slate-800">
                      {order.customer?.name || "-"}
                    </td>

                    <td className="py-4 px-4">
                      <div className="space-y-2 text-xs">
                        {(order.items || []).map((item) => (
                          <div
                            key={item.id}
                            className="bg-slate-50/80 border border-slate-200/60 p-2.5 rounded-xl space-y-1"
                          >
                            <div className="font-bold text-sky-900 text-xs">
                              {item.service?.name || "-"}
                            </div>
                            <div className="text-slate-500 text-[10px] flex items-center gap-1.5 font-medium">
                              <span className="bg-sky-100/70 text-sky-700 px-1.5 py-0.5 rounded font-bold">
                                {item.category?.name || "-"}
                              </span>
                              <span>&bull;</span>
                              <span>{item.servicePrice?.itemType || "-"}</span>
                            </div>
                            <div className="font-mono text-slate-700 pt-1 border-t border-slate-200/50 text-[11px]">
                              {Number(item.quantity)} {item.unit} &times; {rupiah(item.pricePerUnit)} ={" "}
                              <span className="font-bold text-sky-700">
                                {rupiah(item.subtotal)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-4 font-bold text-slate-800 font-mono text-xs whitespace-nowrap">
                      {rupiah(order.totalPrice)}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                          order.paymentMethod === "cash"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-sky-50 text-sky-700 border-sky-200"
                        }`}
                      >
                        {order.paymentMethod}
                      </span>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order, e.target.value)
                        }
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-400 transition cursor-pointer capitalize ${
                          STATUS_CLASS[order.status] || "bg-slate-50 border-slate-300"
                        }`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setInvoiceOrder(order)}
                          className="bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold px-2.5 py-1.5 rounded-lg transition"
                          title="Cetak Invoice"
                        >
                          Invoice
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(order)}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold px-2.5 py-1.5 rounded-lg transition"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(order)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold px-2.5 py-1.5 rounded-lg transition"
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

      {/* MODAL EDIT / TAMBAH */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-3xl overflow-hidden my-8">
            <div className="bg-sky-500 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-bold">
                {editing
                  ? `Edit Order ${invoiceNo(editing.id)}`
                  : "Tambah Order Baru"}
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-white/80 hover:text-white font-bold text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2.5 rounded-xl text-xs font-medium">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Pelanggan
                </label>
                <select
                  name="customerId"
                  value={form.customerId}
                  onChange={handleFieldChange}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                >
                  <option value="">-- Pilih Pelanggan --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Rincian Layanan
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-200 text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                  >
                    <span>+</span> Tambah Item
                  </button>
                </div>

                {form.items.map((item, index) => {
                  const info = getItemInfo(item);

                  return (
                    <div
                      key={item.key}
                      className="bg-sky-50/30 border border-sky-100 rounded-xl p-4 space-y-3 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-sky-800">
                          Item #{index + 1}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.key)}
                          disabled={form.items.length === 1}
                          className="text-xs text-rose-600 hover:text-rose-800 font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Hapus Item
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Kategori
                          </label>
                          <select
                            value={item.categoryId}
                            onChange={(e) =>
                              handleCategoryChange(item.key, e.target.value)
                            }
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                          >
                            <option value="">Pilih Kategori</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Layanan
                          </label>
                          <select
                            value={item.serviceId}
                            onChange={(e) =>
                              handleServiceChange(item.key, e.target.value)
                            }
                            disabled={!item.categoryId}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-slate-100"
                          >
                            <option value="">
                              {!item.categoryId
                                ? "Pilih kategori dahulu"
                                : info.filteredServices.length === 0
                                  ? "Tidak ada layanan"
                                  : "Pilih Layanan"}
                            </option>
                            {info.filteredServices.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Jenis Item & Harga
                          </label>
                          <select
                            value={item.servicePriceId}
                            onChange={(e) =>
                              handlePriceChange(item.key, e.target.value)
                            }
                            disabled={!item.serviceId}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-slate-100"
                          >
                            <option value="">
                              {!item.serviceId
                                ? "Pilih layanan dahulu"
                                : info.priceOptions.length === 0
                                  ? "Belum ada harga"
                                  : "Pilih Jenis Item"}
                            </option>
                            {info.priceOptions.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.itemType} - {rupiah(p.price)} / {p.unit}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
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
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-slate-100"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs pt-2 border-t border-sky-100">
                        <span className="text-slate-500 font-medium">Subtotal Item</span>
                        <span className="font-bold text-sky-700">
                          {info.subtotal > 0 ? rupiah(info.subtotal) : "-"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center rounded-xl bg-sky-50 border border-sky-100 px-4 py-3">
                <span className="font-bold text-sky-900 text-xs uppercase tracking-wider">Grand Total</span>
                <span className="text-xl font-black text-sky-600 font-mono">
                  {rupiah(grandTotal)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Metode Pembayaran
                </label>
                <select
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={handleFieldChange}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                >
                  <option value="cash">Cash (Tunai)</option>
                  <option value="transfer">Transfer Bank</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl transition shadow-sm disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : editing ? "Update Order" : "Simpan Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INVOICE PRINTABLE */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-6 print:m-0 print:shadow-none print:w-full print:max-w-none print:border-none">
            {/* INVOICE HEADER BAR */}
            <div className="bg-sky-500 text-white p-4 flex items-center justify-between print:hidden">
              <span className="font-bold text-xs uppercase tracking-wider">Preview Invoice</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePrintInvoice}
                  className="bg-white text-sky-600 hover:bg-sky-50 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                >
                  🖨️ Cetak / PDF
                </button>
                <button
                  type="button"
                  onClick={() => setInvoiceOrder(null)}
                  className="text-white/80 hover:text-white font-bold text-xl leading-none px-2"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* INVOICE CONTENT */}
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-sky-600 tracking-tight">LAUNDRY SERVICE</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Nota Transaksi Pelanggan</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-lg font-black text-sky-700">
                    {invoiceNo(invoiceOrder.id)}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatDate(invoiceOrder.createdAt || invoiceOrder.orderDate || invoiceOrder.created_at)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-sky-50/40 p-4 rounded-xl border border-sky-100 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block mb-1">Pelanggan:</span>
                  <p className="font-bold text-slate-800 text-sm">
                    {invoiceOrder.customer?.name || "-"}
                  </p>
                  <p className="text-slate-500 mt-0.5">{invoiceOrder.customer?.phone || ""}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block mb-1">Pembayaran:</span>
                  <p className="font-bold text-slate-800 uppercase text-sm">
                    {invoiceOrder.paymentMethod}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-sky-100 text-sky-800">
                    Status: {invoiceOrder.status}
                  </span>
                </div>
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                    <th className="pb-2">Layanan</th>
                    <th className="pb-2 text-center">Qty / Berat</th>
                    <th className="pb-2 text-right">Harga Satuan</th>
                    <th className="pb-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(invoiceOrder.items || []).map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td className="py-3">
                        <div className="font-bold text-slate-800">
                          {item.service?.name || "-"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.category?.name || "-"} &bull; {item.servicePrice?.itemType || "-"}
                        </div>
                      </td>
                      <td className="py-3 text-center font-semibold text-slate-700">
                        {Number(item.quantity)} {item.unit}
                      </td>
                      <td className="py-3 text-right text-slate-600 font-mono">
                        {rupiah(item.pricePerUnit)}
                      </td>
                      <td className="py-3 text-right font-bold text-sky-700 font-mono">
                        {rupiah(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">Total Tagihan</span>
                <span className="text-xl font-black text-sky-600 font-mono">
                  {rupiah(invoiceOrder.totalPrice)}
                </span>
              </div>

              <div className="text-center text-[11px] text-slate-400 border-t border-slate-100 pt-4 space-y-1">
                <p>Terima kasih telah mempercayakan pakaian Anda kepada kami!</p>
                <p>Simpan nota ini sebagai bukti pengambilan barang.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Order;