import { useEffect, useState } from "react";

import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../services/customerApi";

const emptyForm = {
  name: "",
  phone: "",
  address: "",
};

function Customer() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
    setError(err.response?.data?.message || "Gagal mengambil data customer");
  };

  useEffect(() => {
    let ignore = false;

    getCustomers()
      .then((result) => {
        if (ignore) return;
        setCustomers(result.data || []);
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

  const fetchCustomers = async () => {
    try {
      const result = await getCustomers();
      setCustomers(result.data || []);
      setError("");
    } catch (err) {
      applyError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    fetchCustomers();
  };

  // =========================================================
  // MODAL
  // =========================================================

  const handleOpenCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setShowModal(true);
  };

  const handleOpenEdit = (customer) => {
    setEditing(customer);
    setForm({
      name: customer.name,
      phone: customer.phone,
      address: customer.address || "",
    });
    setFormError("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(emptyForm);
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

    if (!form.name.trim()) {
      setFormError("Nama wajib diisi");
      return;
    }

    if (!form.phone.trim()) {
      setFormError("No telp wajib diisi");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      };

      if (editing) {
        await updateCustomer(editing.id, payload);
      } else {
        await createCustomer(payload);
      }

      handleCloseModal();
      await fetchCustomers();
    } catch (err) {
      console.error(err);
      setFormError(
        err.response?.data?.message || "Gagal menyimpan customer"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (customer) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus customer "${customer.name}"?`
    );

    if (!confirmed) return;

    try {
      await deleteCustomer(customer.id);
      await fetchCustomers();
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message || "Gagal menghapus customer"
      );
    }
  };

  // =========================================================
  // FILTER
  // =========================================================

  const keyword = search.trim().toLowerCase();

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(keyword) ||
      c.phone.toLowerCase().includes(keyword)
  );

  // =========================================================
  // RENDER (LATAR BELAKANG PUTIH & HEADER SKYTBLUE)
  // =========================================================

  return (
    <div className="w-full min-h-screen bg-white p-6 lg:p-8 space-y-6 text-slate-800">
      {/* HEADER BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-sky-500 to-blue-600 p-6 rounded-2xl shadow-lg shadow-sky-500/15 text-white">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Pelanggan</h1>
          <p className="text-xs font-medium text-sky-100 mt-1">
            Kelola data pelanggan Fanara Laundry
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
          Tambah Customer
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div role="alert" className="alert alert-error shadow-sm rounded-xl">
          <svg className="w-6 h-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="flex-1 text-sm font-medium">{error}</span>
          <button
            type="button"
            onClick={handleRetry}
            className="btn btn-sm"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* CONTAINER TABLE & SEARCH */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
        {/* HEADER TABLE & SEARCH INPUT */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
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
              placeholder="Cari nama atau no telp..."
              className="w-full bg-slate-50/50 border border-slate-200/80 rounded-xl pl-9 pr-3.5 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
            />
          </div>

          <span className="bg-sky-50 text-sky-700 border border-sky-100 px-3 py-1.5 rounded-xl text-xs font-bold self-start sm:self-auto">
            Total: {filteredCustomers.length} Customer
          </span>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sky-50/50 border-b border-sky-100 text-sky-900 text-[11px] font-bold tracking-wider uppercase">
                <th className="py-3.5 px-4 w-16">ID</th>
                <th className="py-3.5 px-4">Nama</th>
                <th className="py-3.5 px-4">No Telp</th>
                <th className="py-3.5 px-4">Alamat</th>
                <th className="py-3.5 px-4 w-32 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-sky-600">
                    <span className="loading loading-spinner loading-md text-sky-500"></span>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-400 font-medium text-xs">
                    {customers.length === 0
                      ? "Belum ada data customer."
                      : "Customer tidak ditemukan."}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-sky-50/20 transition duration-150">
                    <td className="py-4 px-4 font-mono text-xs font-bold text-sky-600">#{customer.id}</td>
                    <td className="py-4 px-4 font-bold text-slate-800">{customer.name}</td>
                    <td className="py-4 px-4 text-xs font-medium text-slate-600 font-mono">{customer.phone}</td>
                    <td className="py-4 px-4 text-xs text-slate-600">{customer.address || "-"}</td>
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <div className="flex justify-center items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(customer)}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold px-2.5 py-1.5 rounded-lg transition"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(customer)}
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
                {editing ? "Edit Customer" : "Tambah Customer Baru"}
              </h2>
              <button onClick={handleCloseModal} className="text-white/80 hover:text-white font-bold text-xl leading-none">
                ✕
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
                  Nama Pelanggan
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder="Nama pelanggan"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  No Telp
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  maxLength={20}
                  placeholder="08xxxxxxxxxx"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Alamat
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Alamat pelanggan"
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

export default Customer;