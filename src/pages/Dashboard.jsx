import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Alert from "../components/Alert";
import { getMe } from "../services/authService";
import { getReport } from "../services/reportService";
import { getOrders, updateOrder } from "../services/orderService";
import { hariIni, pesanError, rupiah, tanggalIndo } from "../utils/format";

const TABS = [
    { value: "proses", label: "Diproses" },
    { value: "selesai", label: "Selesai (siap diambil)" },
    { value: "diambil", label: "Sudah diambil" },
];

// Tombol aksi cepat: pindahkan ke status berikutnya
const LANJUT = {
    proses: { status: "selesai", label: "Tandai selesai" },
    selesai: { status: "diambil", label: "Tandai diambil" },
};

const BATAS_DIAMBIL = 10; // riwayat "diambil" dibatasi agar tabel tidak panjang

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [report, setReport] = useState(null);
    const [orders, setOrders] = useState([]);
    const [tab, setTab] = useState("proses");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const [me, rep, all] = await Promise.all([
                    getMe(),
                    getReport("daily", hariIni()),
                    getOrders(),
                ]);
                setUser(me.data);
                setReport(rep);
                setOrders(all);
            } catch (err) {
                setError("Gagal memuat dashboard.");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    async function handleLanjut(order) {
        try {
            setError("");
            const updated = await updateOrder(order.id, { status_cucian: LANJUT[order.status_cucian].status });
            setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, ...updated } : o)));
        } catch (err) {
            setError(pesanError(err, "Gagal mengubah status cucian."));
        }
    }

    if (loading) return <span className="loading loading-spinner" />;

    const r = report?.ringkasan;
    const jumlah = (s) => orders.filter((o) => o.status_cucian === s).length;
    let daftar = orders.filter((o) => o.status_cucian === tab);
    if (tab === "diambil") daftar = daftar.slice(0, BATAS_DIAMBIL);

    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">Halo, {user?.nama}</h1>
                    <p className="text-sm text-base-content/70">Ringkasan hari ini, {tanggalIndo(hariIni())}</p>
                </div>
                <Link to="/orders/new" className="btn btn-primary">Order baru</Link>
            </div>

            <Alert>{error}</Alert>

            {r && (
                <div className="stats stats-vertical w-full bg-base-100 shadow md:stats-horizontal">
                    <div className="stat">
                        <div className="stat-title">Order hari ini</div>
                        <div className="stat-value">{r.jumlah_order}</div>
                    </div>
                    <div className="stat">
                        <div className="stat-title">Uang masuk</div>
                        <div className="stat-value text-success">{rupiah(r.uang_masuk)}</div>
                    </div>
                    <div className="stat">
                        <div className="stat-title">Uang keluar</div>
                        <div className="stat-value text-error">{rupiah(r.uang_keluar)}</div>
                    </div>
                    <div className="stat">
                        <div className="stat-title">Laba bersih</div>
                        <div className="stat-value">{rupiah(r.laba_bersih)}</div>
                    </div>
                </div>
            )}

            <div className="stats stats-vertical w-full bg-base-100 shadow md:stats-horizontal">
                <div className="stat">
                    <div className="stat-title">Diproses</div>
                    <div className="stat-value">{jumlah("proses")}</div>
                </div>
                <div className="stat">
                    <div className="stat-title">Selesai, menunggu diambil</div>
                    <div className="stat-value text-warning">{jumlah("selesai")}</div>
                </div>
                <div className="stat">
                    <div className="stat-title">Sudah diambil</div>
                    <div className="stat-value text-success">{jumlah("diambil")}</div>
                </div>
            </div>

            <section className="card bg-base-100 shadow-sm">
                <div className="card-body">
                    <h2 className="card-title">Status cucian</h2>
                    <div role="tablist" className="tabs tabs-box w-fit flex-wrap">
                        {TABS.map((t) => (
                            <button
                                key={t.value}
                                type="button"
                                role="tab"
                                onClick={() => setTab(t.value)}
                                className={`tab ${tab === t.value ? "tab-active" : ""}`}
                            >
                                {t.label} ({jumlah(t.value)})
                            </button>
                        ))}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Invoice</th><th>Customer</th><th>Layanan</th><th>Tanggal</th><th>Bayar</th><th />
                                </tr>
                            </thead>
                            <tbody>
                                {daftar.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center">Tidak ada cucian pada status ini.</td></tr>
                                ) : (
                                    daftar.map((o) => (
                                        <tr key={o.id}>
                                            <td className="whitespace-nowrap">{o.invoice_no}</td>
                                            <td>
                                                {o.customer?.nama}
                                                <div className="text-xs text-base-content/70">{o.customer?.telepon}</div>
                                            </td>
                                            <td>{o.nama_layanan} ({Number(o.berat)} kg)</td>
                                            <td className="whitespace-nowrap">{tanggalIndo(o.tanggal)}</td>
                                            <td>
                                                <span className={`badge ${o.status_bayar === "lunas" ? "badge-success" : "badge-warning"}`}>
                                                    {o.status_bayar === "lunas" ? "Lunas" : "Belum"}
                                                </span>
                                            </td>
                                            <td className="flex gap-3 whitespace-nowrap">
                                                {LANJUT[o.status_cucian] && (
                                                    <button type="button" onClick={() => handleLanjut(o)} className="btn btn-xs btn-primary">
                                                        {LANJUT[o.status_cucian].label}
                                                    </button>
                                                )}
                                                <Link to={`/orders/${o.id}/invoice`} className="link link-primary">Invoice</Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {tab === "diambil" && jumlah("diambil") > BATAS_DIAMBIL && (
                        <p className="text-sm text-base-content/70">
                            Menampilkan {BATAS_DIAMBIL} terbaru. Riwayat lengkap ada di halaman <Link to="/orders" className="link">Order</Link>.
                        </p>
                    )}
                </div>
            </section>
        </>
    );
};

export default Dashboard;