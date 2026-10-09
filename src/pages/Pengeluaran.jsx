import { useEffect, useState } from "react";

import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../services/expenseApi";

// saran kategori (tetap bisa mengetik kategori lain)
const CATEGORY_SUGGESTIONS = [
  "Listrik",
  "Air",
  "Deterjen & Pewangi",
  "Perawatan Mesin",
  "Transportasi",
  "Lainnya",
];

const pad = (n) => String(n).padStart(2, "0");

// tanggal hari ini (zona waktu lokal) format YYYY-MM-DD
const todayStr = () => {
  const d = new Date();

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// "2026-10-07" -> "7 Okt 2026" (tanpa new Date(string) supaya tidak geser hari)
const formatDate = (value) => {
  if (!value) return "-";

  const [y, m, d] = String(value).slice(0, 10).split("-").map(Number);

  return new Date(y, m - 1, d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const rupiah = (value) =>
  `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

const emptyForm = () => ({
  date: todayStr(),
  category: "",
  description: "",
  amount: "",
});

function Pengeluaran() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [month, setMonth] = useState(""); // filter YYYY-MM, kosong = semua
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // =========================================================
  // FETCH
  // =========================================================

  const applyError = (err) => {
    console.error(err);

    setError(err.response?.data?.message || "Gagal mengambil data pengeluaran");
  };

  useEffect(() => {
    let ignore = false;

    getExpenses()
      .then((result) => {
        if (ignore) return;

        setExpenses(result.data || []);
        setError("");
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

  // dipakai setelah simpan / hapus / coba lagi
  const fetchExpenses = async () => {
    try {
      const result = await getExpenses();

      setExpenses(result.data || []);
      setError("");
    } catch (err) {
      applyError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    fetchExpenses();
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

  const handleOpenEdit = (expense) => {
    setEditing(expense);

    setForm({
      date: String(expense.date).slice(0, 10),
      category: expense.category,
      description: expense.description || "",
      amount: String(expense.amount),
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.date) return setFormError("Tanggal wajib diisi");
    if (!form.category.trim()) return setFormError("Kategori wajib diisi");

    const amount = Number(form.amount);

    if (!Number.isInteger(amount) || amount <= 0) {
      return setFormError("Jumlah harus bilangan bulat lebih dari 0");
    }

    try {
      setSaving(true);
      setFormError("");

      const payload = {
        date: form.date,
        category: form.category.trim(),
        description: form.description.trim(),
        amount,
      };

      if (editing) {
        await updateExpense(editing.id, payload);
      } else {
        await createExpense(payload);
      }

      handleCloseModal();
      await fetchExpenses();
    } catch (err) {
      console.error(err);

      setFormError(
        err.response?.data?.message || "Gagal menyimpan pengeluaran"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (expense) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus pengeluaran "${expense.category}" sebesar ${rupiah(
        expense.amount
      )}?`
    );

    if (!confirmed) return;

    try {
      await deleteExpense(expense.id);
      await fetchExpenses();
    } catch (err) {
      console.error(err);

      alert(err.response?.data?.message || "Gagal menghapus pengeluaran");
    }
  };

  // =========================================================
  // FILTER
  // =========================================================

  const keyword = search.trim().toLowerCase();

  const filteredExpenses = expenses.filter((e) => {
    const matchMonth = !month || String(e.date).startsWith(month);

    const matchSearch =
      !keyword ||
      e.category.toLowerCase().includes(keyword) ||
      (e.description || "").toLowerCase().includes(keyword);

    return matchMonth && matchSearch;
  });

  const totalAmount = filteredExpenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  // =========================================================
  // RENDER (TAMPILAN LATAR BELAKANG PUTIH & BANNER SKY BLUE)
  // =========================================================

  return (
    <div className="w-full min-h-screen bg-white p-6 lg:p-8 space-y-6 text-slate-800">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-sky-500 to-blue-600 p-6 rounded-2xl shadow-lg shadow-sky-500/15 text-white">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Pengeluaran</h1>
          <p className="text-xs font-medium text-sky-100 mt-1">
            Catat pengeluaran operasional Fanara Laundry
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="bg-white text-sky-600 hover:bg-sky-50 font-bold px-4 py-2.5 rounded-xl shadow-sm transition duration-200 text-xs flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Pengeluaran
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div role="alert" className="alert alert-error shadow-sm rounded-xl">
          <svg className="w-6 h-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="flex-1 text-sm font-medium">{error}</span>
          <button type="button" onClick={handleRetry} className="btn btn-sm">
            Coba lagi
          </button>
        </div>
      )}

      {/* CONTAINER TABLE & FILTER */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
        {/* FILTER + TOTAL */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* BULAN */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Bulan
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                />

                {month && (
                  <button
                    type="button"
                    onClick={() => setMonth("")}
                    className="bg-slate-500 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition"
                  >
                    Semua
                  </button>
                )}
              </div>
            </div>

            {/* CARI */}
            <div className="flex-1 sm:w-72">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Cari
              </label>
              <div className="relative">
                <svg
                  className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Kategori atau keterangan..."
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* TOTAL */}
          <div className="bg-sky-50/50 border border-sky-100 px-4 py-2.5 rounded-xl self-start lg:self-auto text-left lg:text-right">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total {month ? "Bulan Ini" : "Keseluruhan"}
            </span>
            <span className="text-xl font-black text-slate-800 font-mono">
              {rupiah(totalAmount)}
            </span>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sky-50/50 border-b border-sky-100 text-sky-900 text-[11px] font-bold tracking-wider uppercase">
                <th className="py-3.5 px-4 w-16">ID</th>
                <th className="py-3.5 px-4 w-32">Tanggal</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Keterangan</th>
                <th className="py-3.5 px-4 text-right">Jumlah</th>
                <th className="py-3.5 px-4 w-32 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-sky-600">
                    <span className="loading loading-spinner loading-md text-sky-500"></span>
                  </td>
                </tr>
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400 font-medium text-xs">
                    {expenses.length === 0
                      ? "Belum ada data pengeluaran."
                      : "Tidak ada pengeluaran yang cocok dengan filter."}
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-sky-50/20 transition duration-150">
                    <td className="py-4 px-4 font-mono text-xs font-bold text-sky-600">#{expense.id}</td>
                    <td className="py-4 px-4 text-xs font-medium text-slate-600 whitespace-nowrap">
                      {formatDate(expense.date)}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-block bg-slate-100 border border-slate-200/80 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">
                        {expense.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs font-medium text-slate-800">
                      {expense.description || "-"}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-slate-800 font-mono text-xs whitespace-nowrap">
                      {rupiah(expense.amount)}
                    </td>
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <div className="flex justify-center items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(expense)}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold px-2.5 py-1.5 rounded-lg transition"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(expense)}
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

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden my-8">
            <div className="bg-sky-500 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-bold">
                {editing ? "Edit Pengeluaran" : "Tambah Pengeluaran"}
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-white/80 hover:text-white font-bold text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2.5 rounded-xl text-xs font-medium">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tanggal
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kategori
                </label>
                <input
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  list="expense-categories"
                  maxLength={50}
                  placeholder="Pilih atau ketik kategori"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                />

                <datalist id="expense-categories">
                  {CATEGORY_SUGGESTIONS.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Keterangan
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  maxLength={255}
                  rows={3}
                  placeholder="Contoh: Beli deterjen 5 liter"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Jumlah (Rp)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  placeholder="Contoh: 150000"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                />
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
                  {saving ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : editing ? (
                    "Update"
                  ) : (
                    "Simpan"
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

export default Pengeluaran;