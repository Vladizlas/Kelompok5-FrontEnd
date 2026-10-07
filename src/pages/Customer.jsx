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

  // dipakai setelah simpan / hapus / coba lagi
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
    <div className="p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Customer</h1>
          <p className="text-sm opacity-70 mt-1">
            Kelola data pelanggan Fanara Laundry
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="btn btn-primary w-fit"
        >
          + Tambah Customer
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div role="alert" className="alert alert-error mb-4">
          <span>{error}</span>

          <button
            type="button"
            onClick={handleRetry}
            className="btn btn-sm"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* SEARCH */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari nama atau no telp..."
        className="input w-full max-w-sm mb-4"
      />

      {/* TABLE */}
      <div className="bg-base-100 border border-base-300 rounded-box overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama</th>
              <th>No Telp</th>
              <th>Alamat</th>
              <th className="text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-10">
                  <span className="loading loading-spinner"></span>
                </td>
              </tr>
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-10 opacity-70">
                  {customers.length === 0
                    ? "Belum ada data customer."
                    : "Customer tidak ditemukan."}
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.id}</td>
                  <td className="font-semibold">{customer.name}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.address || "-"}</td>
                  <td>
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(customer)}
                        className="btn btn-xs btn-warning btn-outline"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(customer)}
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
              {editing ? "Edit Customer" : "Tambah Customer"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div role="alert" className="alert alert-error text-sm">
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Nama
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder="Nama pelanggan"
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  No Telp
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  maxLength={20}
                  placeholder="08xxxxxxxxxx"
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Alamat
                </label>

                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Alamat pelanggan"
                  className="textarea w-full"
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

export default Customer;
