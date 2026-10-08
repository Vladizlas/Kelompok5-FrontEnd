import { useEffect, useState } from "react";
import { getOrders } from "../services/orderApi";
import { getCategories } from "../services/categoryServiceApi";
import { getServices } from "../services/serviceApi";

function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // FETCH ALL DATA
  // =========================================================
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [ordersRes, categoriesRes, servicesRes] = await Promise.all([
        getOrders(),
        getCategories(),
        getServices(),
      ]);

      setOrders(ordersRes.data || []);
      setCategories(categoriesRes.data || []);
      setServices(servicesRes.data || []);
    } catch (err) {
      console.error("Gagal mengambil data dashboard:", err);
      setError(
        err.response?.data?.message || "Gagal memuat data dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =========================================================
  // LOGIC PERHITUNGAN DATA STATISTIK
  // =========================================================

  const isToday = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    const date = new Date(dateString);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const todayOrders = orders.filter((o) =>
    isToday(o.createdAt || o.orderDate || o.created_at)
  );

  const diprosesCount = orders.filter(
    (o) => o.status === "diproses" || o.status === "diterima"
  ).length;

  const selesaiCount = orders.filter((o) => o.status === "selesai").length;

  const diambilCount = orders.filter((o) => o.status === "diambil").length;

  const totalRevenue = orders.reduce(
    (sum, order) => sum + (Number(order.totalPrice || order.total_price) || 0),
    0
  );
  const totalOrders = orders.length;

  const getServiceCountByCategory = (categoryId) => {
    return services.filter(
      (s) => String(s.categoryId) === String(categoryId)
    ).length;
  };

  const recentOrders = [...orders].reverse().slice(0, 5);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // RENDER LOADING & ERROR
  // =========================================================
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px] w-full">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-sky-200 border-t-sky-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 w-full">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center justify-between">
          <span className="text-sm font-medium">{error}</span>
          <button
            type="button"
            onClick={fetchData}
            className="text-xs bg-rose-100 hover:bg-rose-200 text-rose-800 font-semibold px-3 py-1.5 rounded-lg transition"
          >
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER UTAMA (FULL WIDTH)
  // =========================================================
  return (
    <div className="w-full min-h-screen space-y-6 bg-slate-50/50 p-6">
      {/* HEADER GREETING */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          Halo, Admin <span className="animate-bounce">👋</span>
        </h1>
        <p className="text-sky-500 text-xs font-semibold mt-0.5">
          Ringkasan operasional laundry hari ini
        </p>
      </div>

      {/* SECTION 1: STATISTIK OMZET & TOTAL TRANSAKSI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-400">
            Total Pendapatan
          </p>
          <p className="text-2xl font-black text-sky-600 mt-2">
            Rp {totalRevenue.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-400">
            Total Seluruh Transaksi
          </p>
          <p className="text-2xl font-black text-slate-800 mt-2">{totalOrders}</p>
        </div>
      </div>

      {/* SECTION 2: CARD UTAMA BIRU & STATUS PESANAN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-sky-500/20 relative overflow-hidden flex flex-col justify-between min-h-[160px]">
          <div>
            <p className="text-[11px] font-bold tracking-wider uppercase opacity-80">
              HARI INI
            </p>
            <h2 className="text-lg font-bold mt-0.5">Jumlah Order</h2>
          </div>

          <div className="flex items-end justify-between mt-4">
            <span className="text-5xl font-black leading-none">
              {todayOrders.length}
            </span>
            <span className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3.5 py-1.5 rounded-full border border-white/20">
              Pesanan
            </span>
          </div>
        </div>

        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
            <h3 className="text-sm font-extrabold text-slate-800">
              Status Pesanan
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-sky-50/40 border border-sky-100/60 rounded-xl p-4">
              <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                DIPROSES
              </p>
              <p className="text-2xl font-black text-sky-600 mt-2">
                {diprosesCount}
              </p>
            </div>

            <div className="bg-sky-50/40 border border-sky-100/60 rounded-xl p-4">
              <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                SELESAI (BELUM DIAMBIL)
              </p>
              <p className="text-2xl font-black text-sky-600 mt-2">
                {selesaiCount}
              </p>
            </div>

            <div className="bg-sky-50/40 border border-sky-100/60 rounded-xl p-4">
              <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                SUDAH DIAMBIL
              </p>
              <p className="text-2xl font-black text-sky-600 mt-2">
                {diambilCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: DAFTAR KATEGORI & LAYANAN */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
          <h3 className="text-sm font-extrabold text-slate-800">
            Daftar Kategori & Layanan
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 col-span-full text-center">
              Belum ada kategori layanan.
            </p>
          ) : (
            categories.map((cat) => {
              const count = getServiceCountByCategory(cat.id);
              return (
                <div
                  key={cat.id}
                  className="bg-sky-50/30 border border-sky-100/80 rounded-xl p-4 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-800">
                      {cat.name}
                    </span>
                    <span className="bg-sky-100/70 text-sky-600 text-[11px] font-bold px-3 py-1 rounded-full">
                      {count} Layanan
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* SECTION 4: TABEL PESANAN TERAKHIR */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
            <h3 className="text-sm font-extrabold text-slate-800">
              Pesanan Terakhir
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            5 Transaksi Terbaru
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Invoice</th>
                <th className="py-3 px-3">Tanggal</th>
                <th className="py-3 px-3">Pelanggan</th>
                <th className="py-3 px-3">Total Harga</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-6 text-xs text-slate-400"
                  >
                    Belum ada pesanan terbaru.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/60 transition"
                  >
                    <td className="py-3.5 px-3 font-mono text-sky-600 font-bold text-xs">
                      INV-{String(order.id).padStart(4, "0")}
                    </td>
                    <td className="py-3.5 px-3 text-xs text-slate-500 font-medium">
                      {formatDate(order.createdAt || order.orderDate || order.created_at)}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-700">
                      {order.customer?.name || order.customerName || "-"}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-800">
                      Rp{" "}
                      {Number(
                        order.totalPrice || order.total_price || 0
                      ).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="capitalize px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-600 border border-sky-100">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;