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

const badgeStatusStyle = {
  Diproses: "bg-amber-100 text-amber-700 border-amber-200",
  Selesai: "bg-sky-100 text-sky-700 border-sky-200",
  Diambil: "bg-emerald-100 text-emerald-700 border-emerald-200",
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
        setCategories(response.data || []);
      } catch (error) {
        console.error("ERROR GET CATEGORIES:", error);
        setServiceError(
          error.response?.data?.message || "Gagal mengambil data layanan"
        );
      } finally {
        setLoadingServices(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="space-y-6 bg-slate-50 min-h-screen p-2 sm:p-4 text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-sky-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Halo, Admin 👋
          </h1>
          <p className="text-sm text-sky-600 font-medium mt-0.5">
            Ringkasan operasional laundry hari ini
          </p>
        </div>

        <Link
          to="/order"
          className="btn bg-sky-500 hover:bg-sky-600 text-white border-none shadow-md shadow-sky-200 px-6 font-semibold rounded-xl transition-all"
        >
          + Buat Order
        </Link>
      </div>

      {/* Ringkasan & Status Pesanan */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Jumlah order hari ini */}
        <div className="lg:col-span-1 bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-2xl p-6 shadow-md shadow-sky-100 flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold opacity-80">
              Hari Ini
            </span>
            <h2 className="text-lg font-bold mt-1">Jumlah Order</h2>
          </div>
          <div className="mt-6 flex items-baseline justify-between">
            <span className="text-5xl font-black tracking-tight">
              {ringkasan.orderHariIni}
            </span>
            <span className="text-xs bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white font-medium">
              Pesanan
            </span>
          </div>
        </div>

        {/* Status pesanan */}
        <div className="lg:col-span-3 bg-white border border-sky-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
            Status Pesanan
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {statusPesanan.map((s) => (
              <div
                key={s.label}
                className="bg-sky-50/50 border border-sky-100 rounded-xl p-4 transition-all hover:border-sky-300 hover:bg-sky-50"
              >
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {s.label}
                </div>
                <div className="text-3xl font-extrabold text-sky-600 mt-2">
                  {s.jumlah}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daftar Layanan */}
      <div className="bg-white border border-sky-100 rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sky-500"></span>
          Daftar Kategori & Layanan
        </h2>

        {/* Loading */}
        {loadingServices && (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-md text-sky-500"></span>
          </div>
        )}

        {/* Error */}
        {!loadingServices && serviceError && (
          <div className="alert alert-error bg-rose-50 text-rose-700 border-rose-200 text-sm rounded-xl">
            <span>{serviceError}</span>
          </div>
        )}

        {/* Data kosong */}
        {!loadingServices && !serviceError && categories.length === 0 && (
          <p className="text-slate-400 text-sm text-center py-6">
            Belum ada kategori layanan.
          </p>
        )}

        {/* Data layanan */}
        {!loadingServices && !serviceError && categories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-slate-50 border border-sky-100 rounded-xl p-5 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                  <h3 className="text-md font-bold text-sky-900">
                    {category.name}
                  </h3>
                  <span className="text-xs bg-sky-100 text-sky-700 px-2.5 py-0.5 rounded-full font-semibold">
                    {category.services?.length || 0} Layanan
                  </span>
                </div>

                <div className="space-y-3">
                  {category.services?.map((service) => (
                    <div
                      key={service.id}
                      className="bg-white border border-slate-100 rounded-lg p-3 shadow-2xs"
                    >
                      <h4 className="font-bold text-sm text-slate-800">
                        {service.name}
                      </h4>

                      {service.description && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {service.description}
                        </p>
                      )}

                      <div className="mt-2 space-y-1 pt-2 border-t border-slate-50">
                        {service.prices?.map((price) => (
                          <div
                            key={price.id}
                            className="flex justify-between items-center text-xs"
                          >
                            <span className="text-slate-600">
                              {price.itemType}
                            </span>
                            <span className="font-bold text-sky-600">
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

      {/* Laporan pesanan */}
      <div className="bg-white border border-sky-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-sky-100">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
            Laporan Pesanan Terakhir
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="table w-full text-slate-700">
            <thead>
              <tr className="bg-sky-50/50 text-slate-500 border-b border-sky-100 text-xs uppercase tracking-wider">
                <th className="py-3.5">Invoice</th>
                <th>Tanggal</th>
                <th>Customer</th>
                <th>Layanan</th>
                <th>Total</th>
                <th>Pembayaran</th>
                <th>Status</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm">
              {laporanPesanan.map((o) => (
                <tr key={o.invoice} className="hover:bg-sky-50/30 transition-colors">
                  <td className="font-mono font-bold text-sky-600">
                    {o.invoice}
                  </td>
                  <td className="text-slate-500">{o.tanggal}</td>
                  <td className="font-semibold text-slate-800">{o.customer}</td>
                  <td className="text-slate-600">{o.layanan}</td>
                  <td className="font-bold text-slate-800">{rupiah(o.total)}</td>
                  <td>
                    <span className="inline-block px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-md">
                      {o.pembayaran}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full border ${badgeStatusStyle[o.status] || "bg-slate-100 text-slate-600"
                        }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <button className="btn btn-xs bg-white hover:bg-sky-50 text-sky-600 border border-sky-200 font-semibold rounded-lg">
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
  );
}