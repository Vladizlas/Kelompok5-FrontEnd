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
  "Gaji Karyawan",
  "Sewa Tempat",
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
  // RENDER
  // =========================================================

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Pengeluaran</h1>
          <p className="text-sm opacity-70 mt-1">
            Catat pengeluaran operasional Fanara Laundry
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="btn btn-primary w-fit"
        >
          + Tambah Pengeluaran
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div role="alert" className="alert alert-error mb-4">
          <span>{error}</span>

          <button type="button" onClick={handleRetry} className="btn btn-sm">
            Coba lagi
          </button>
        </div>
      )}

      {/* FILTER + TOTAL */}
      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium mb-1">Bulan</label>

          <div className="flex gap-2">
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="input"
            />

            {month && (
              <button
                type="button"
                onClick={() => setMonth("")}
                className="btn"
              >
                Semua
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 max-w-sm">
          <label className="block text-xs font-medium mb-1">Cari</label>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kategori atau keterangan..."
            className="input w-full"
          />
        </div>

        <div className="md:ml-auto rounded-box bg-base-200 px-4 py-2">
          <div className="text-xs opacity-70">
            Total {month ? "bulan ini" : "keseluruhan"}
          </div>

          <div className="text-lg font-bold">{rupiah(totalAmount)}</div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-base-100 border border-base-300 rounded-box overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tanggal</th>
              <th>Kategori</th>
              <th>Keterangan</th>
              <th className="text-right">Jumlah</th>
              <th className="text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-10">
                  <span className="loading loading-spinner"></span>
                </td>
              </tr>
            ) : filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-10 opacity-70">
                  {expenses.length === 0
                    ? "Belum ada data pengeluaran."
                    : "Tidak ada pengeluaran yang cocok dengan filter."}
                </td>
              </tr>
            ) : (
              filteredExpenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.id}</td>
                  <td className="whitespace-nowrap">
                    {formatDate(expense.date)}
                  </td>
                  <td>
                    <span className="badge badge-outline">
                      {expense.category}
                    </span>
                  </td>
                  <td>{expense.description || "-"}</td>
                  <td className="text-right font-semibold whitespace-nowrap">
                    {rupiah(expense.amount)}
                  </td>
                  <td>
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(expense)}
                        className="btn btn-xs btn-warning btn-outline"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(expense)}
                        className="btn btn-xs btn-error btn-outline"
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

      {/* MODAL */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h2 className="text-lg font-bold mb-4">
              {editing ? "Edit Pengeluaran" : "Tambah Pengeluaran"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div role="alert" className="alert alert-error text-sm">
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Tanggal
                </label>

                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
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
                  className="input w-full"
                />

                <datalist id="expense-categories">
                  {CATEGORY_SUGGESTIONS.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Keterangan
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  maxLength={255}
                  rows={3}
                  placeholder="Contoh: Beli deterjen 5 liter"
                  className="textarea w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
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
                  className="input w-full"
                />
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? "Menyimpan..." : editing ? "Update" : "Simpan"}
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