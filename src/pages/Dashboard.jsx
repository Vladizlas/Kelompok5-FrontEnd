import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getDashboard } from "../services/dashboardApi";
import { getCategories } from "../services/categoryServiceApi";
import { getServices } from "../services/serviceApi";

const rupiah = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const formatDate = (value) =>
  new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const invoiceLabel = (id) => `INV-${String(id).padStart(4, "0")}`;

// kartu status pesanan (urut sesuai alur cucian)
const statusCards = [
  { key: "diterima", label: "Diterima", warna: "text-base-content" },
  { key: "diproses", label: "Diproses", warna: "text-warning" },
  { key: "selesai", label: "Selesai (Belum Diambil)", warna: "text-info" },
  { key: "diambil", label: "Sudah Diambil", warna: "text-success" },
];

const statusBadge = {
  diterima: { label: "Diterima", className: "badge-ghost" },
  diproses: { label: "Diproses", className: "badge-warning" },
  selesai: { label: "Selesai", className: "badge-info" },
  diambil: { label: "Diambil", className: "badge-success" },
};

const emptyStatus = { diterima: 0, diproses: 0, selesai: 0, diambil: 0 };

export default function Dashboard() {
  const [summary, setSummary] = useState({
    ordersToday: 0,
    statusToday: emptyStatus,
    recentOrders: [],
  });
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // FETCH
  // =========================================================

  const fetchAll = async () => {
    const [dashboardRes, categoriesRes, servicesRes] = await Promise.all([
      getDashboard(),
      getCategories(),
      getServices(),
    ]);

    return {
      summary: dashboardRes.data,
      categories: categoriesRes.data || [],
      services: servicesRes.data || [],
    };
  };

  const applyData = (data) => {
    setSummary(data.summary);
    setCategories(data.categories);
    setServices(data.services);
    setError("");
  };

  const applyError = (err) => {
    console.error(err);

    setError(
      err.response?.data?.message || "Gagal mengambil data dashboard"
    );
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

  // layanan dikelompokkan per kategori, urut sesuai input
  const serviceGroups = [...categories]
    .sort((a, b) => a.id - b.id)
    .map((category) => ({
      ...category,
      services: services
        .filter((s) => s.categoryId === category.id)
        .sort((a, b) => a.id - b.id),
    }));

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Halo, Admin</h1>
          <p className="text-gray-500">Ringkasan hari ini</p>
        </div>

        <Link to="/order" className="btn btn-primary">
          Order
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div role="alert" className="alert alert-error">
          <span>{error}</span>

          <button
            type="button"
            onClick={handleRetry}
            className="btn btn-sm"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Jumlah order hari ini */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title text-base">Jumlah Order Hari Ini</h2>

          {loading ? (
            <span className="loading loading-spinner loading-md"></span>
          ) : (
            <p className="text-5xl font-bold text-primary">
              {summary.ordersToday}
            </p>
          )}
        </div>
      </div>

      {/* Status pesanan (order hari ini) */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title text-base">Status Pesanan Hari Ini</h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statusCards.map((s) => (
              <div key={s.key} className="border rounded-box p-4">
                <div className="text-sm text-gray-500">{s.label}</div>

                <div className={`text-3xl font-bold ${s.warna}`}>
                  {loading ? "-" : summary.statusToday[s.key] ?? 0}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daftar Layanan */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title text-base">Daftar Layanan</h2>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-6">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          )}

          {/* Data kosong */}
          {!loading && !error && categories.length === 0 && (
            <p className="text-gray-500">Belum ada kategori layanan.</p>
          )}

          {/* Data layanan */}
          {!loading && !error && categories.length > 0 && (
            <div className="space-y-5">
              {serviceGroups.map((category) => (
                <div key={category.id} className="border rounded-box p-4">
                  <h3 className="text-lg font-bold">{category.name}</h3>

                  <div className="mt-3 space-y-3">
                    {category.services.length === 0 && (
                      <p className="text-sm text-gray-500">
                        Belum ada layanan di kategori ini.
                      </p>
                    )}

                    {category.services.map((service) => (
                      <div
                        key={service.id}
                        className="bg-base-200 rounded-box p-4"
                      >
                        <h4 className="font-semibold">{service.name}</h4>

                        {service.description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {service.description}
                          </p>
                        )}

                        <div className="mt-3 space-y-2">
                          {service.prices?.length === 0 && (
                            <p className="text-sm text-gray-500">
                              Belum ada harga.
                            </p>
                          )}

                          {service.prices?.map((price) => (
                            <div
                              key={price.id}
                              className="flex justify-between items-center"
                            >
                              <span>{price.itemType}</span>

                              <span className="font-semibold">
                                {rupiah(price.price)} / {price.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Laporan pesanan */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title text-base">Laporan Pesanan Terbaru</h2>

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Tanggal</th>
                  <th>Customer</th>
                  <th>Layanan</th>
                  <th>Total</th>
                  <th>Pembayaran</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8">
                      <span className="loading loading-spinner"></span>
                    </td>
                  </tr>
                ) : summary.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-gray-500">
                      Belum ada order.
                    </td>
                  </tr>
                ) : (
                  summary.recentOrders.map((o) => {
                    const badge = statusBadge[o.status];

                    return (
                      <tr key={o.id}>
                        <td className="font-medium">{o.invoice}</td>

                        <td className="whitespace-nowrap">
                          {formatDate(o.createdAt)}
                        </td>

                        <td>{o.customerName}</td>

                        <td>{o.services.join(", ") || "-"}</td>

                        <td className="whitespace-nowrap">
                          {rupiah(o.totalPrice)}
                        </td>

                        <td className="capitalize">{o.paymentMethod}</td>

                        <td>
                          <span className={`badge ${badge?.className || ""}`}>
                            {badge?.label || o.status}
                          </span>
                        </td>

                        <td>
                          <Link
                            to="/order"
                            className="btn btn-xs btn-outline"
                            title={invoiceLabel(o.id)}
                          >
                            Lihat
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}