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
  // RENDER
  // =========================================================

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-sky-950">Pelanggan</h1>
          <p className="text-sm text-sky-700/70">
            Kelola data pelanggan Fanara Laundry
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="btn border-none bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl gap-2 shadow-md shadow-sky-500/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
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
          <span className="flex-1 text-sm">{error}</span>
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
      <div className="bg-white border border-sky-100 rounded-2xl shadow-xs overflow-hidden">
        {/* HEADER TABLE & SEARCH INPUT */}
        <div className="p-4 bg-sky-50/50 border-b border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <svg
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sky-400"
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
              className="input input-sm w-full pl-9 bg-white border-sky-200 focus:border-sky-500 rounded-xl text-xs"
            />
          </div>

          <span className="text-xs bg-sky-100 text-sky-800 px-3 py-1 rounded-full font-medium w-fit">
            Total: {filteredCustomers.length} Customer
          </span>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="bg-sky-50 text-sky-900 text-xs uppercase tracking-wider border-b border-sky-100">
                <th className="py-3">ID</th>
                <th className="py-3">Nama</th>
                <th className="py-3">No Telp</th>
                <th className="py-3">Alamat</th>
                <th className="py-3 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-sky-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-10">
                    <span className="loading loading-spinner loading-md text-sky-500"></span>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-sky-700/60">
                    {customers.length === 0
                      ? "Belum ada data customer."
                      : "Customer tidak ditemukan."}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-sky-50/50 transition-colors">
                    <td className="font-mono text-xs font-bold text-sky-600">#{customer.id}</td>
                    <td className="font-semibold text-sky-950">{customer.name}</td>
                    <td className="text-sky-900">{customer.phone}</td>
                    <td className="text-sky-800/80">{customer.address || "-"}</td>
                    <td>
                      <div className="flex justify-center items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(customer)}
                          className="btn btn-ghost btn-xs text-amber-600 hover:bg-amber-50 rounded-lg"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(customer)}
                          className="btn btn-ghost btn-xs text-rose-600 hover:bg-rose-50 rounded-lg"
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
        <div className="modal modal-open backdrop-blur-xs">
          <div className="modal-box bg-white rounded-2xl shadow-2xl p-6 border border-sky-100 max-w-md">
            <div className="flex items-center justify-between pb-3 border-b border-sky-100 mb-4">
              <h2 className="text-lg font-bold text-sky-950">
                {editing ? "Edit Customer" : "Tambah Customer"}
              </h2>
              <button onClick={handleCloseModal} className="btn btn-sm btn-circle btn-ghost text-sky-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div role="alert" className="alert alert-error text-xs p-3 rounded-xl">
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-sky-900 mb-1">
                  Nama Pelanggan
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder="Nama pelanggan"
                  className="input input-sm w-full border-sky-200 focus:border-sky-500 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-sky-900 mb-1">
                  No Telp
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  maxLength={20}
                  placeholder="08xxxxxxxxxx"
                  className="input input-sm w-full border-sky-200 focus:border-sky-500 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-sky-900 mb-1">
                  Alamat
                </label>

                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Alamat pelanggan"
                  className="textarea textarea-sm w-full border-sky-200 focus:border-sky-500 rounded-xl"
                />
              </div>

              <div className="modal-action border-t border-sky-100 pt-3 mt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-sm btn-ghost text-sky-700"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-sm bg-sky-500 hover:bg-sky-600 border-none text-white px-5 rounded-xl"
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