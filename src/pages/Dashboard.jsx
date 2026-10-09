import { useEffect, useState } from "react";
import { getOrders } from "../services/orderApi";
import { getCategories } from "../services/categoryServiceApi";
import { getServices } from "../services/serviceApi";

// Config Badge Warna Status
const STATUS_CLASS = {
  diterima: "bg-sky-50 text-sky-700 border-sky-200",
  diproses: "bg-amber-50 text-amber-700 border-amber-200",
  selesai: "bg-emerald-50 text-emerald-700 border-emerald-200",
  diambil: "bg-slate-100 text-slate-700 border-slate-300",
};

function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // STATE UNTUK MODAL INVOICE (DITAMBAHKAN)
  // =========================================================
  const [invoiceOrder, setInvoiceOrder] = useState(null);

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
  // HANDLER POPUP / PRINT INVOICE
  // =========================================================
  const handlePrint = () => {
    window.print();
  };

  // =========================================================
  // RENDER LOADING & ERROR
  // =========================================================
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px] w-full bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-sky-200 border-t-sky-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 w-full bg-white min-h-screen">
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
  // RENDER UTAMA (LATAR BELAKANG PUTIH)
  // =========================================================
  return (
    <div className="w-full min-h-screen space-y-6 bg-white p-6 lg:p-8 text-slate-800">
      {/* HEADER GREETING */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-sky-500 to-blue-600 p-6 rounded-2xl shadow-lg shadow-sky-500/15 text-white">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          Dashboard
        </h1>
        <p className="text-white text-xs font-semibold mt-0.5">
          Ringkasan operasional laundry hari ini
        </p>
      </div>
      </div>

      {/* SECTION 1: STATISTIK OMZET & TOTAL TRANSAKSI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Pendapatan
          </p>
          <p className="text-3xl font-black text-sky-600 mt-2">
            Rp {totalRevenue.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Seluruh Transaksi
          </p>
          <p className="text-3xl font-black text-slate-800 mt-2">{totalOrders}</p>
        </div>
      </div>

      {/* SECTION 2: CARD UTAMA BIRU & STATUS PESANAN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* CARD BIRU HARI INI */}
        <div className="lg:col-span-4 bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-sky-500/15 relative overflow-hidden flex flex-col justify-between min-h-[160px]">
          <div>
            <p className="text-[11px] font-bold tracking-wider uppercase opacity-80">
              HARI INI
            </p>
            <h2 className="text-lg font-bold mt-0.5">Jumlah Order</h2>
          </div>

          <div className="flex items-end justify-between mt-6">
            <span className="text-5xl font-black leading-none">
              {todayOrders.length}
            </span>
            <span className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3.5 py-1.5 rounded-full border border-white/20">
              Pesanan
            </span>
          </div>
        </div>

        {/* STATUS PESANAN */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
            <h3 className="text-sm font-extrabold text-slate-800">
              Status Pesanan
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-sky-50/40 border border-sky-100 rounded-xl p-4">
              <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                DIPROSES
              </p>
              <p className="text-2xl font-black text-sky-600 mt-1.5">
                {diprosesCount}
              </p>
            </div>

            <div className="bg-sky-50/40 border border-sky-100 rounded-xl p-4">
              <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                SELESAI (BELUM DIAMBIL)
              </p>
              <p className="text-2xl font-black text-sky-600 mt-1.5">
                {selesaiCount}
              </p>
            </div>

            <div className="bg-sky-50/40 border border-sky-100 rounded-xl p-4">
              <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                SUDAH DIAMBIL
              </p>
              <p className="text-2xl font-black text-sky-600 mt-1.5">
                {diambilCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: DAFTAR KATEGORI & LAYANAN */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
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
                  className="bg-sky-50/30 border border-sky-100 rounded-xl p-4 flex items-center justify-between"
                >
                  <span className="text-sm font-bold text-slate-800">
                    {cat.name}
                  </span>
                  <span className="bg-sky-100/80 text-sky-700 text-[11px] font-bold px-3 py-1 rounded-full border border-sky-200/60">
                    {count} Layanan
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* SECTION 4: TABEL PESANAN TERAKHIR */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-4">
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
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Invoice</th>
                <th className="py-3 px-3">Tanggal</th>
                <th className="py-3 px-3">Pelanggan</th>
                <th className="py-3 px-3">Total Harga</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-6 text-xs text-slate-400"
                  >
                    Belum ada pesanan terbaru.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-sky-50/30 transition duration-150"
                  >
                    {/* NOMOR INVOICE BISA DIKLIK */}
                    <td className="py-3.5 px-3 font-mono text-sky-600 font-bold text-xs">
                      <button
                        type="button"
                        onClick={() => setInvoiceOrder(order)}
                        className="hover:underline focus:outline-none cursor-pointer"
                      >
                        INV-{String(order.id).padStart(4, "0")}
                      </button>
                    </td>
                    <td className="py-3.5 px-3 text-xs text-slate-500 font-medium whitespace-nowrap">
                      {formatDate(
                        order.createdAt || order.orderDate || order.created_at
                      )}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800">
                      {order.customer?.name || order.customerName || "-"}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-800 font-mono text-xs">
                      Rp{" "}
                      {Number(
                        order.totalPrice || order.total_price || 0
                      ).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`capitalize px-2.5 py-1 rounded-full text-[11px] font-bold border ${STATUS_CLASS[order.status] ||
                          "bg-sky-50 text-sky-600 border-sky-100"
                          }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    {/* TOMBOL INVOICE BISA DIKLIK */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => setInvoiceOrder(order)}
                        className="bg-sky-50 hover:bg-sky-100 active:scale-95 text-sky-700 border border-sky-200 text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                        title="Cetak Invoice"
                      >
                        Invoice
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL INVOICE POPUP (DITAMBAHKAN)                         */}
      {/* ========================================================= */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-slate-800 my-8">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-5 text-white flex justify-between items-center print:hidden">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base">Struk Invoice</span>
              </div>
              <button
                type="button"
                onClick={() => setInvoiceOrder(null)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg text-xs font-bold transition"
              >
                ✕
              </button>
            </div>

            {/* Isi Struk Cetak */}
            <div className="p-6 space-y-4 text-xs font-mono">
              <div className="text-center border-b border-slate-200 pb-3">
                <h2 className="text-base font-black font-sans text-sky-600 tracking-wide uppercase">
                  Fanara Laundry
                </h2>
                <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                  Layanan Cuci & Setrika Bersih Wangi
                </p>
              </div>

              <div className="space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>No. Invoice:</span>
                  <span className="font-bold text-slate-800">
                    INV-{String(invoiceOrder.id).padStart(4, "0")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal:</span>
                  <span>
                    {formatDate(
                      invoiceOrder.createdAt ||
                      invoiceOrder.orderDate ||
                      invoiceOrder.created_at
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Pelanggan:</span>
                  <span className="font-bold text-slate-800">
                    {invoiceOrder.customer?.name ||
                      invoiceOrder.customerName ||
                      "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="capitalize font-bold text-sky-600">
                    {invoiceOrder.status}
                  </span>
                </div>
              </div>

              {/* Rincian Item Pesanan */}
              <div className="border-t border-b border-slate-200 py-3 space-y-2">
                <p className="font-bold text-slate-700 font-sans text-[11px]">
                  Rincian Item:
                </p>
                {invoiceOrder.items && invoiceOrder.items.length > 0 ? (
                  invoiceOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[11px]">
                      <span>
                        {item.serviceName || item.service?.name || "Layanan"}{" "}
                        x{item.qty || item.quantity || 1}
                      </span>
                      <span>
                        Rp{" "}
                        {Number(
                          item.price || item.subtotal || 0
                        ).toLocaleString("id-ID")}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-between text-[11px]">
                    <span>Paket Laundry</span>
                    <span>
                      Rp{" "}
                      {Number(
                        invoiceOrder.totalPrice || invoiceOrder.total_price || 0
                      ).toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
              </div>

              {/* Total Harga */}
              <div className="flex justify-between items-center text-sm font-bold font-sans pt-1">
                <span>TOTAL BAYAR</span>
                <span className="text-sky-600">
                  Rp{" "}
                  {Number(
                    invoiceOrder.totalPrice || invoiceOrder.total_price || 0
                  ).toLocaleString("id-ID")}
                </span>
              </div>

              <div className="text-center text-[10px] text-slate-400 font-sans pt-3 border-t border-slate-100">
                Terima kasih atas kepercayaan Anda!
              </div>
            </div>

            {/* Opsi Action Modal */}
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end gap-2 print:hidden">
              <button
                type="button"
                onClick={() => setInvoiceOrder(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition"
              >
                Cetak Struk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;