import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default function Layanan() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    description: "",
    prices: [{ itemType: "", price: "", unit: "kg" }],
  });

  // Ambil Data User & Role dari localStorage
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const userRole = (user?.role || "kasir").toLowerCase();
  const isKasir = userRole === "kasir";

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  // Fetch Data Layanan & Kategori
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const [servicesRes, categoriesRes] = await Promise.all([
        axios.get(`${API_URL}/services`, { headers: getHeaders() }),
        axios.get(`${API_URL}/categories`, { headers: getHeaders() }),
      ]);

      const servicesData = Array.isArray(servicesRes.data)
        ? servicesRes.data
        : servicesRes.data.data || [];
      const categoriesData = Array.isArray(categoriesRes.data)
        ? categoriesRes.data
        : categoriesRes.data.data || [];

      setServices(servicesData);
      setCategories(categoriesData);
    } catch (err) {
      console.error(err);
      setErrorMsg("Gagal memuat data layanan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Form Modal
  const handleOpenModal = (item = null) => {
    if (item) {
      setEditData(item);
      setFormData({
        name: item.name || "",
        categoryId: item.categoryId || "",
        description: item.description || "",
        prices:
          item.prices && item.prices.length > 0
            ? item.prices.map((p) => ({
              itemType: p.itemType || "",
              price: p.price || "",
              unit: p.unit || "kg",
            }))
            : [{ itemType: "", price: "", unit: "kg" }],
      });
    } else {
      setEditData(null);
      setFormData({
        name: "",
        categoryId: categories[0]?.id || "",
        description: "",
        prices: [{ itemType: "", price: "", unit: "kg" }],
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditData(null);
  };

  const handlePriceChange = (index, field, value) => {
    const updatedPrices = [...formData.prices];
    updatedPrices[index][field] = value;
    setFormData({ ...formData, prices: updatedPrices });
  };

  const handleAddPriceRow = () => {
    setFormData({
      ...formData,
      prices: [...formData.prices, { itemType: "", price: "", unit: "kg" }],
    });
  };

  const handleRemovePriceRow = (index) => {
    if (formData.prices.length === 1) return;
    const updatedPrices = formData.prices.filter((_, i) => i !== index);
    setFormData({ ...formData, prices: updatedPrices });
  };

  // Submit Form (Tambah / Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editData) {
        await axios.put(
          `${API_URL}/services/${editData.id}`,
          formData,
          { headers: getHeaders() }
        );
      } else {
        await axios.post(`${API_URL}/services`, formData, {
          headers: getHeaders(),
        });
      }
      fetchData();
      handleCloseModal();
    } catch (err) {
      alert(
        err.response?.data?.message || "Gagal menyimpan data layanan."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Hapus
  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus layanan ini?")) return;
    try {
      await axios.delete(`${API_URL}/services/${id}`, {
        headers: getHeaders(),
      });
      fetchData();
    } catch (err) {
      alert(
        err.response?.data?.message || "Gagal menghapus layanan."
      );
    }
  };

  // Filter Layanan
  const filteredServices = services.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-white p-6 lg:p-8 space-y-6 text-slate-800">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-sky-500 to-blue-600 p-6 rounded-2xl shadow-lg shadow-sky-500/15 text-white">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Daftar Layanan</h1>
          <p className="text-xs font-medium text-sky-100 mt-1">
            Kelola jenis paket, kategori, dan tarif harga laundry
          </p>
        </div>

        {/* Tombol Tambah Layanan TERSEMBUNYI untuk Role Kasir */}
        {!isKasir && (
          <button
            onClick={() => handleOpenModal()}
            className="bg-white text-sky-600 hover:bg-sky-50 font-bold px-4 py-2.5 rounded-xl shadow-sm transition duration-200 text-xs flex items-center justify-center gap-2 w-fit"
          >
            <span>+ Tambah Layanan</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between">
          <span>{errorMsg}</span>
          <button
            onClick={() => setErrorMsg("")}
            className="text-rose-500 hover:text-rose-800 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Bar Pencarian */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama atau kategori layanan..."
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Tabel Container */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sky-50/50 border-b border-sky-100 text-sky-900 text-[11px] font-bold tracking-wider uppercase">
                <th className="py-3.5 px-4 font-semibold">Nama Layanan</th>
                <th className="py-3.5 px-4 font-semibold">Kategori</th>
                <th className="py-3.5 px-4 font-semibold">Rincian Harga</th>
                {!isKasir && (
                  <th className="py-3.5 px-4 font-semibold text-center w-32">
                    Aksi
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td
                    colSpan={isKasir ? 3 : 4}
                    className="py-12 text-center text-sky-600"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-medium text-slate-500">
                        Memuat data layanan...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td
                    colSpan={isKasir ? 3 : 4}
                    className="py-12 text-center text-slate-400 font-medium text-xs"
                  >
                    Tidak ada layanan yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredServices.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-sky-50/20 transition duration-150"
                  >
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-800">
                        {item.name}
                      </div>
                      {item.description && (
                        <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                          {item.description}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
                        {item.categoryName || "Umum"}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <ul className="space-y-1 text-xs font-medium text-slate-700">
                        {(item.prices || []).length === 0 ? (
                          <li className="text-slate-400 italic">Belum ada tarif</li>
                        ) : (
                          item.prices.map((p, idx) => (
                            <li key={p.id || idx}>
                              {p.itemType}{" "}
                              <span className="font-bold text-sky-600">
                                {rupiah(p.price)} / {p.unit}
                              </span>
                            </li>
                          ))
                        )}
                      </ul>
                    </td>

                    {/* Kolom Aksi HANYA BISA DIAKSES oleh Admin/Owner */}
                    {!isKasir && (
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <div className="flex justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-bold text-xs px-3 py-1.5 rounded-lg transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs px-3 py-1.5 rounded-lg transition"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Edit Layanan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-lg overflow-hidden my-8 text-slate-800">
            <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-6 text-white flex justify-between items-start">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">
                  {editData ? "Edit Layanan" : "Tambah Layanan"}
                </h2>
                <p className="text-xs text-sky-100 font-medium mt-1">
                  Atur detail informasi paket dan jenis harga
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg text-xs font-bold transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Layanan
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Contoh: Cuci Komplit Reguler"
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kategori
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Keterangan estimasi waktu atau catatan layanan"
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                />
              </div>

              {/* Rincian Harga Dynamic */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    Opsi Harga & Unit
                  </span>
                  <button
                    type="button"
                    onClick={handleAddPriceRow}
                    className="bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                  >
                    + Tambah Opsi
                  </button>
                </div>

                {formData.prices.map((p, index) => (
                  <div
                    key={index}
                    className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-500">
                        Opsi #{index + 1}
                      </span>
                      {formData.prices.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePriceRow(index)}
                          className="text-xs text-rose-600 font-bold hover:underline"
                        >
                          Hapus
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Jenis (ex: Pakaian)"
                        value={p.itemType}
                        onChange={(e) =>
                          handlePriceChange(index, "itemType", e.target.value)
                        }
                        className="bg-white border border-slate-200/80 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      <input
                        type="number"
                        required
                        placeholder="Harga (Rp)"
                        value={p.price}
                        onChange={(e) =>
                          handlePriceChange(index, "price", e.target.value)
                        }
                        className="bg-white border border-slate-200/80 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      <select
                        value={p.unit}
                        onChange={(e) =>
                          handlePriceChange(index, "unit", e.target.value)
                        }
                        className="bg-white border border-slate-200/80 rounded-lg px-2 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="kg">kg</option>
                        <option value="pcs">pcs</option>
                        <option value="m2">m²</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-sky-500/20 transition disabled:opacity-50"
                >
                  {submitting ? "Memproses..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}