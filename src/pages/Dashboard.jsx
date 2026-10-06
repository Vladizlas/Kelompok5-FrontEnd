import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  ringkasan,
  statusPesanan,
  laporanPesanan,
} from "../data/dummyDashboard";

import { getCategories } from "../services/categoryServiceApi";

const rupiah = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const badgeStatus = {
  Diproses: "badge-warning",
  Selesai: "badge-info",
  Diambil: "badge-success",
};

export default function Dashboard() {
  const [categories, setCategories] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [serviceError, setServiceError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingServices(true);
        setServiceError("");

        const response = await getCategories();

        console.log("DATA CATEGORIES:", response);

        setCategories(response.data);
      } catch (error) {
        console.error("ERROR GET CATEGORIES:", error);
        console.error("RESPONSE:", error.response);
        console.error("REQUEST:", error.request);
        console.error("MESSAGE:", error.message);

        setServiceError(
          error.response?.data?.message ||
            "Gagal mengambil data layanan"
        );
      } finally {
        setLoadingServices(false);
      }
    };

    fetchCategories();
  }, []);

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

      {/* Jumlah order hari ini */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title text-base">
            Jumlah Order Hari Ini
          </h2>

          <p className="text-5xl font-bold text-primary">
            {ringkasan.orderHariIni}
          </p>
        </div>
      </div>

      {/* Status pesanan */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title text-base">
            Status Pesanan
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {statusPesanan.map((s) => (
              <div
                key={s.label}
                className="border rounded-box p-4"
              >
                <div className="text-sm text-gray-500">
                  {s.label}
                </div>

                <div
                  className={`text-3xl font-bold ${s.warna}`}
                >
                  {s.jumlah}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daftar Layanan */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title text-base">
            Daftar Layanan
          </h2>

          {/* Loading */}
          {loadingServices && (
            <div className="flex justify-center py-6">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          )}

          {/* Error */}
          {!loadingServices && serviceError && (
            <div className="alert alert-error">
              <span>{serviceError}</span>
            </div>
          )}

          {/* Data kosong */}
          {!loadingServices &&
            !serviceError &&
            categories.length === 0 && (
              <p className="text-gray-500">
                Belum ada kategori layanan.
              </p>
            )}

          {/* Data layanan */}
          {!loadingServices &&
            !serviceError &&
            categories.length > 0 && (
              <div className="space-y-5">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="border rounded-box p-4"
                  >
                    <h3 className="text-lg font-bold">
                      {category.name}
                    </h3>

                    <div className="mt-3 space-y-3">
                      {category.services?.map((service) => (
                        <div
                          key={service.id}
                          className="bg-base-200 rounded-box p-4"
                        >
                          <h4 className="font-semibold">
                            {service.name}
                          </h4>

                          {service.description && (
                            <p className="text-sm text-gray-500 mt-1">
                              {service.description}
                            </p>
                          )}

                          <div className="mt-3 space-y-2">
                            {service.prices?.map((price) => (
                              <div
                                key={price.id}
                                className="flex justify-between items-center"
                              >
                                <span>
                                  {price.itemType}
                                </span>

                                <span className="font-semibold">
                                  {rupiah(price.price)} /{" "}
                                  {price.unit}
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
          <h2 className="card-title text-base">
            Laporan Pesanan
          </h2>

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
                {laporanPesanan.map((o) => (
                  <tr key={o.invoice}>
                    <td className="font-medium">
                      {o.invoice}
                    </td>

                    <td>{o.tanggal}</td>
                    <td>{o.customer}</td>
                    <td>{o.layanan}</td>
                    <td>{rupiah(o.total)}</td>
                    <td>{o.pembayaran}</td>

                    <td>
                      <span
                        className={`badge ${badgeStatus[o.status]}`}
                      >
                        {o.status}
                      </span>
                    </td>

                    <td>
                      <button className="btn btn-xs btn-outline">
                        Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
