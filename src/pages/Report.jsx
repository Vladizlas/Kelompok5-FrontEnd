import React, { useEffect, useState } from "react";
import { getOrders } from "../services/orderApi";
import { getExpenses } from "../services/expenseApi";
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    AlertCircle,
    Calendar,
    CreditCard,
    Banknote,
    RotateCcw,
} from "lucide-react";

// ---------------------------------------------------------
// HELPER FORMATTING & DATE CALCULATIONS
// ---------------------------------------------------------

const rupiah = (val) => `Rp ${Number(val || 0).toLocaleString("id-ID")}`;

const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

const todayString = () => new Date().toISOString().split("T")[0];
const currentMonthString = () => new Date().toISOString().slice(0, 7);
const currentYearString = () => String(new Date().getFullYear());

const getISOWeekNumber = (d) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
};

const currentWeekString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const week = String(getISOWeekNumber(d)).padStart(2, "0");
    return `${year}-W${week}`;
};

const getWeekRange = (weekStr) => {
    if (!weekStr) return { start: null, end: null };
    const [yearStr, weekNumStr] = weekStr.split("-W");
    const year = parseInt(yearStr, 10);
    const week = parseInt(weekNumStr, 10);

    const jan4 = new Date(year, 0, 4);
    const dayOfWeek = jan4.getDay() || 7;
    const mondayOfWeek1 = new Date(jan4);
    mondayOfWeek1.setDate(jan4.getDate() - dayOfWeek + 1);

    const start = new Date(mondayOfWeek1);
    start.setDate(mondayOfWeek1.getDate() + (week - 1) * 7);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
};

// Membaca nominal uang masuk dari total harga yang disesuaikan dengan DB
const getAmountPaid = (order) => {
    return Number(order.totalPrice || order.total_price || order.total || 0);
};

function Report() {
    const [orders, setOrders] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [filterMode, setFilterMode] = useState("weekly");
    const [selectedDate, setSelectedDate] = useState(todayString());
    const [selectedWeek, setSelectedWeek] = useState(currentWeekString());
    const [selectedMonth, setSelectedMonth] = useState(currentMonthString());
    const [selectedYear, setSelectedYear] = useState(currentYearString());

    const fetchData = async () => {
        setLoading(true);
        setError("");
        try {
            const [ordersRes, expensesRes] = await Promise.all([
                getOrders(),
                getExpenses ? getExpenses() : Promise.resolve({ data: [] }),
            ]);

            setOrders(ordersRes.data || []);
            setExpenses(expensesRes.data || []);
        } catch (err) {
            console.error(err);
            setError("Gagal memuat data laporan.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // ---------------------------------------------------------
    // FILTERING LOGIC
    // ---------------------------------------------------------

    const filterByRange = (itemDateStr) => {
        if (!itemDateStr) return false;
        const itemDate = new Date(itemDateStr);

        const year = itemDate.getFullYear();
        const month = String(itemDate.getMonth() + 1).padStart(2, "0");
        const day = String(itemDate.getDate()).padStart(2, "0");

        const itemYYYYMMDD = `${year}-${month}-${day}`;
        const itemYYYYMM = `${year}-${month}`;
        const itemYYYY = String(year);

        if (filterMode === "daily") {
            return itemYYYYMMDD === selectedDate;
        }

        if (filterMode === "weekly") {
            const { start, end } = getWeekRange(selectedWeek);
            if (!start || !end) return false;
            return itemDate >= start && itemDate <= end;
        }

        if (filterMode === "monthly") {
            return itemYYYYMM === selectedMonth;
        }

        if (filterMode === "yearly") {
            return itemYYYY === selectedYear;
        }

        return true;
    };

    const filteredOrders = orders.filter((o) =>
        filterByRange(o.orderDate || o.createdAt)
    );

    const filteredExpenses = expenses.filter((e) =>
        filterByRange(e.date || e.expenseDate || e.createdAt)
    );

    // ---------------------------------------------------------
    // FINANCIAL CALCULATIONS
    // ---------------------------------------------------------

    const totalIncome = filteredOrders.reduce(
        (sum, o) => sum + getAmountPaid(o),
        0
    );

    const totalExpense = filteredExpenses.reduce(
        (sum, e) => sum + Number(e.amount || e.total || e.jumlah || 0),
        0
    );

    const netProfit = totalIncome - totalExpense;

    const incomeByMethod = filteredOrders.reduce((acc, o) => {
        const method = (o.paymentMethod || o.payment_method || "cash").toLowerCase();
        const paidAmount = getAmountPaid(o);
        acc[method] = (acc[method] || 0) + paidAmount;
        return acc;
    }, {});

    const weekInfo = getWeekRange(selectedWeek);

    // ---------------------------------------------------------
    // RENDER
    // ---------------------------------------------------------

    return (
        <div className="p-6 md:p-8 space-y-6 bg-[#f4f8fb] min-h-screen text-slate-800 font-sans">
            {/* HEADER & FILTER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-sky-500 to-blue-600 p-6 rounded-2xl border border-sky-100 shadow-xs">
                <div>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight">
                        Laporan Keuangan
                    </h1>
                    <p className="text-sm text-white mt-1">
                        Ringkasan pemasukan, pengeluaran, dan laba bersih
                    </p>
                </div>

                {/* CONTROLLER FILTER */}
                <div className="flex flex-wrap items-center gap-2">
                    <select
                        value={filterMode}
                        onChange={(e) => setFilterMode(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-sky-200 bg-white text-slate-700 font-semibold text-sm focus:outline-none focus:border-sky-500 transition"
                    >
                        <option value="daily">Harian</option>
                        <option value="weekly">Mingguan</option>
                        <option value="monthly">Bulanan</option>
                        <option value="yearly">Tahunan</option>
                    </select>

                    {filterMode === "daily" && (
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-3 py-2 rounded-xl border border-sky-200 bg-white text-slate-700 text-sm focus:outline-none focus:border-sky-500 transition"
                        />
                    )}

                    {filterMode === "weekly" && (
                        <div className="flex items-center gap-2">
                            <input
                                type="week"
                                value={selectedWeek}
                                onChange={(e) => setSelectedWeek(e.target.value)}
                                className="px-3 py-2 rounded-xl border border-sky-200 bg-white text-slate-700 text-sm focus:outline-none focus:border-sky-500 transition"
                            />
                            {weekInfo.start && weekInfo.end && (
                                <span className="text-xs font-medium text-sky-700 bg-sky-50 px-2.5 py-2 rounded-xl border border-sky-100 whitespace-nowrap">
                                    ({formatDate(weekInfo.start)} - {formatDate(weekInfo.end)})
                                </span>
                            )}
                        </div>
                    )}

                    {filterMode === "monthly" && (
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="px-3 py-2 rounded-xl border border-sky-200 bg-white text-slate-700 text-sm focus:outline-none focus:border-sky-500 transition"
                        />
                    )}

                    {filterMode === "yearly" && (
                        <input
                            type="number"
                            min="2020"
                            max="2030"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="px-3 py-2 rounded-xl border border-sky-200 bg-white text-slate-700 text-sm focus:outline-none focus:border-sky-500 transition w-24"
                        />
                    )}
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                        <span>{error}</span>
                    </div>
                    <button
                        onClick={fetchData}
                        className="px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-semibold transition flex items-center gap-1.5 text-xs"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Coba lagi
                    </button>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin"></div>
                </div>
            ) : (
                <>
                    {/* CARDS RINGKASAN UTAMA */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* UANG MASUK */}
                        <div className="bg-white border border-sky-100 rounded-2xl p-5 shadow-xs space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                                    TOTAL UANG MASUK
                                </span>
                                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="text-2xl font-black text-slate-900">
                                {rupiah(totalIncome)}
                            </div>
                            <p className="text-xs text-slate-500">Dari total {filteredOrders.length} order</p>
                        </div>

                        {/* UANG KELUAR */}
                        <div className="bg-white border border-sky-100 rounded-2xl p-5 shadow-xs space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                                    TOTAL UANG KELUAR
                                </span>
                                <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                                    <TrendingDown className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="text-2xl font-black text-slate-900">
                                {rupiah(totalExpense)}
                            </div>
                            <p className="text-xs text-slate-500">Biaya operasional</p>
                        </div>

                        {/* LABA BERSIH */}
                        <div className="bg-white border border-sky-100 rounded-2xl p-5 shadow-xs space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                                    LABA BERSIH
                                </span>
                                <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
                                    <Wallet className="w-5 h-5" />
                                </div>
                            </div>
                            <div
                                className={`text-2xl font-black ${netProfit < 0 ? "text-rose-600" : "text-slate-900"
                                    }`}
                            >
                                {rupiah(netProfit)}
                            </div>
                            <p className="text-xs text-slate-500">
                                Uang Masuk - Uang Keluar
                            </p>
                        </div>
                    </div>

                    {/* UANG MASUK PER METODE PEMBAYARAN */}
                    <div className="bg-white border border-sky-100 rounded-2xl p-6 space-y-4 shadow-xs">
                        <h2 className="text-base font-bold text-slate-800">
                            Uang Masuk Per Metode Pembayaran
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* CASH */}
                            <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-100 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-white rounded-xl text-emerald-600 border border-emerald-100">
                                        <Banknote className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 font-medium">
                                            Cash / Tunai
                                        </div>
                                        <div className="text-xl font-bold text-slate-800 mt-0.5">
                                            {rupiah(incomeByMethod["cash"] || 0)}
                                        </div>
                                    </div>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                                    Cash
                                </span>
                            </div>

                            {/* TRANSFER */}
                            <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-100 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-white rounded-xl text-sky-600 border border-sky-100">
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 font-medium">
                                            Transfer / QRIS
                                        </div>
                                        <div className="text-xl font-bold text-slate-800 mt-0.5">
                                            {rupiah(incomeByMethod["transfer"] || 0)}
                                        </div>
                                    </div>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-bold">
                                    Transfer
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* TABEL RINCIAN UANG MASUK */}
                    <div className="bg-white border border-sky-100 rounded-2xl overflow-hidden shadow-xs">
                        <div className="p-5 border-b border-sky-100">
                            <h2 className="font-bold text-slate-800 text-base">
                                Rincian Uang Masuk dari Order
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-sky-100 bg-sky-50/40 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        <th className="py-3.5 px-6">Invoice</th>
                                        <th className="py-3.5 px-6">Tanggal</th>
                                        <th className="py-3.5 px-6">Pelanggan</th>
                                        <th className="py-3.5 px-6">Metode</th>
                                        <th className="py-3.5 px-6">Status Pengerjaan</th>
                                        <th className="py-3.5 px-6 text-right">Uang Masuk</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-sky-100 text-sm">
                                    {filteredOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-8 text-slate-400">
                                                Tidak ada transaksi pada periode ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredOrders.map((order) => {
                                            const amountPaid = getAmountPaid(order);

                                            return (
                                                <tr
                                                    key={order.id}
                                                    className="hover:bg-sky-50/30 transition-colors"
                                                >
                                                    <td className="py-3.5 px-6 font-mono text-xs font-bold text-sky-600">
                                                        INV-{String(order.id).padStart(4, "0")}
                                                    </td>
                                                    <td className="py-3.5 px-6 text-slate-600">
                                                        {formatDate(order.orderDate || order.createdAt)}
                                                    </td>
                                                    <td className="py-3.5 px-6 font-semibold text-slate-800">
                                                        {order.customer?.name || order.customerName || "-"}
                                                    </td>
                                                    <td className="py-3.5 px-6">
                                                        <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                            {order.paymentMethod || order.payment_method || "cash"}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-6">
                                                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-100 text-sky-700 capitalize">
                                                            {order.status || "-"}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-6 font-bold text-emerald-600 text-right">
                                                        {rupiah(amountPaid)}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Report;