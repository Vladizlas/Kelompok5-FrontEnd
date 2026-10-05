import { Link } from "react-router-dom";
import { ringkasan, statusPesanan, laporanPesanan } from "../data/dummyDashboard.js";

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

      {/* Bagian 1: Jumlah order hari ini */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title text-base">Jumlah Order Hari Ini</h2>
          <p className="text-5xl font-bold text-primary">{ringkasan.orderHariIni}</p>
        </div>
      </div>

      {/* Bagian 2: Status pesanan */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title text-base">Status Pesanan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {statusPesanan.map((s) => (
              <div key={s.label} className="border rounded-box p-4">
                <div className="text-sm text-gray-500">{s.label}</div>
                <div className={`text-3xl font-bold ${s.warna}`}>{s.jumlah}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bagian 3: Tabel laporan pesanan / invoice */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title text-base">Laporan Pesanan</h2>
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
                    <td className="font-medium">{o.invoice}</td>
                    <td>{o.tanggal}</td>
                    <td>{o.customer}</td>
                    <td>{o.layanan}</td>
                    <td>{rupiah(o.total)}</td>
                    <td>{o.pembayaran}</td>
                    <td>
                      <span className={`badge ${badgeStatus[o.status]}`}>{o.status}</span>
                    </td>
                    <td>
                      <button className="btn btn-xs btn-outline">Invoice</button>
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