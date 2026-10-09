import { useEffect, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Helper Ambil Header Token JWT
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

function Layanan() {
  const { user } = useOutletContext();

  // =========================================================
  // ROLE / ACCESS CONTROL
  // =========================================================
  const userRole = user?.role?.toLowerCase() || "kasir";

  // Kasir, Admin, dan Owner semuanya BERHAK melihat layanan
  const allowedRoles = ["kasir", "admin", "owner"];
  const hasAccess = allowedRoles.includes(userRole);

  // Fitur Modifikasi (CRUD) HANYA untuk Admin & Owner
  const canModify = ["admin", "owner"].includes(userRole);

  // =========================================================
  // STATE
  // =========================================================
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // CATEGORY MODAL STATE
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");

  // SERVICE MODAL STATE
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    categoryId: "",
    name: "",
    description: "",
  });

  // PRICE MODAL STATE
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  const [priceForm, setPriceForm] = useState({
    serviceId: "",
    itemType: "",
    price: "",
    unit: "kg",
  });

  // =========================================================
  // FETCH CATEGORIES (DENGAN BEARER TOKEN)
  // =========================================================
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/categories`, {
        headers: getAuthHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal mengambil data kategori"
        );
      }

      setCategories(Array.isArray(result) ? result : result.data || []);
    } catch (error) {
      console.error("Error fetch categories:", error);
      throw error;
    }
  };

  // =========================================================
  // FETCH SERVICES (DENGAN BEARER TOKEN)
  // =========================================================
  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_URL}/api/services`, {
        headers: getAuthHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal mengambil data layanan"
        );
      }

      setServices(Array.isArray(result) ? result : result.data || []);
    } catch (error) {
      console.error("Error fetch services:", error);
      throw error;
    }
  };

  // =========================================================
  // LOAD ALL DATA
  // =========================================================
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([fetchCategories(), fetchServices()]);
    } catch (error) {
      console.error(error);
      setError(error.message || "Gagal mengambil data layanan");
    } finally {
      setLoading(false);
    }
  }, []);

  // INITIAL LOAD
  useEffect(() => {
    if (!hasAccess) {
      setLoading(false);
      return;
    }
    loadData();
  }, [hasAccess, loadData]);

  // =========================================================
  // CATEGORY HANDLERS
  // =========================================================
  const handleOpenCategoryModal = () => {
    setCategoryName("");
    setShowCategoryModal(true);
  };

  const handleCloseCategoryModal = () => {
    setCategoryName("");
    setShowCategoryModal(false);
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      alert("Nama kategori wajib diisi");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/categories`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: categoryName.trim() }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menambahkan kategori");
      }

      alert("Kategori berhasil ditambahkan");
      handleCloseCategoryModal();
      await fetchCategories();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleDeleteCategory = async (category) => {
    if (category.services && category.services.length > 0) {
      alert("Hapus semua layanan dalam kategori ini terlebih dahulu.");
      return;
    }

    if (!window.confirm(`Yakin ingin menghapus kategori "${category.name}"?`)) return;

    try {
      const response = await fetch(`${API_URL}/api/categories/${category.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menghapus kategori");
      }

      alert("Kategori berhasil dihapus");
      await fetchCategories();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // =========================================================
  // SERVICE HANDLERS
  // =========================================================
  const handleOpenCreateService = () => {
    setEditingService(null);
    setServiceForm({ categoryId: categories[0]?.id || "", name: "", description: "" });
    setShowServiceModal(true);
  };

  const handleOpenCreateServiceForCategory = (categoryId) => {
    setEditingService(null);
    setServiceForm({ categoryId, name: "", description: "" });
    setShowServiceModal(true);
  };

  const handleOpenEditService = (service) => {
    setEditingService(service);
    setServiceForm({
      categoryId: service.categoryId,
      name: service.name,
      description: service.description || "",
    });
    setShowServiceModal(true);
  };

  const handleCloseServiceModal = () => {
    setEditingService(null);
    setServiceForm({ categoryId: "", name: "", description: "" });
    setShowServiceModal(false);
  };

  const handleSubmitService = async (e) => {
    e.preventDefault();

    if (!serviceForm.categoryId) return alert("Kategori wajib dipilih");
    if (!serviceForm.name.trim()) return alert("Nama layanan wajib diisi");

    try {
      const isEdit = Boolean(editingService);
      const url = isEdit
        ? `${API_URL}/api/services/${editingService.id}`
        : `${API_URL}/api/services`;

      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          categoryId: Number(serviceForm.categoryId),
          name: serviceForm.name.trim(),
          description: serviceForm.description.trim() || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || "Gagal menyimpan layanan");

      alert(isEdit ? "Layanan berhasil diupdate" : "Layanan berhasil ditambahkan");
      handleCloseServiceModal();
      await fetchServices();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleDeleteService = async (service) => {
    if (!window.confirm(`Yakin ingin menghapus layanan "${service.name}"?`)) return;

    try {
      const response = await fetch(`${API_URL}/api/services/${service.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || "Gagal menghapus layanan");

      alert("Layanan berhasil dihapus");
      await fetchServices();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // =========================================================
  // PRICE HANDLERS
  // =========================================================
  const handleOpenCreatePrice = (serviceId) => {
    setEditingPrice(null);
    setPriceForm({ serviceId, itemType: "", price: "", unit: "kg" });
    setShowPriceModal(true);
  };

  const handleOpenEditPrice = (price) => {
    setEditingPrice(price);
    setPriceForm({
      serviceId: price.serviceId,
      itemType: price.itemType,
      price: price.price,
      unit: price.unit,
    });
    setShowPriceModal(true);
  };

  const handleClosePriceModal = () => {
    setEditingPrice(null);
    setPriceForm({ serviceId: "", itemType: "", price: "", unit: "kg" });
    setShowPriceModal(false);
  };

  const handleSubmitPrice = async (e) => {
    e.preventDefault();

    if (!priceForm.itemType.trim()) return alert("Jenis item wajib diisi");
    if (priceForm.price === "" || Number(priceForm.price) < 0) return alert("Harga tidak valid");

    try {
      const isEdit = Boolean(editingPrice);
      const url = isEdit
        ? `${API_URL}/api/service-prices/${editingPrice.id}`
        : `${API_URL}/api/service-prices`;

      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          serviceId: Number(priceForm.serviceId),
          itemType: priceForm.itemType.trim(),
          price: Number(priceForm.price),
          unit: priceForm.unit,
        }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || "Gagal menyimpan harga");

      alert(isEdit ? "Harga berhasil diupdate" : "Harga berhasil ditambahkan");
      handleClosePriceModal();
      await fetchServices();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleDeletePrice = async (price) => {
    if (!window.confirm(`Yakin ingin menghapus harga "${price.itemType}"?`)) return;

    try {
      const response = await fetch(`${API_URL}/api/service-prices/${price.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || "Gagal menghapus harga");

      alert("Harga berhasil dihapus");
      await fetchServices();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // Grouping
  const groupedServices = categories.map((category) => ({
    ...category,
    services: services.filter(
      (service) => Number(service.categoryId) === Number(category.id)
    ),
  }));

  // =========================================================
  // RENDER CONDITIONAL (LOADING / DENIED)
  // =========================================================
  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 text-xs font-medium">Memuat data layanan...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="p-6 bg-white min-h-screen">
        <div className="bg-white border border-rose-200 rounded-2xl p-10 text-center shadow-sm">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-slate-800">Akses Ditolak</h2>
          <p className="text-slate-500 mt-2 text-xs">
            Anda tidak memiliki izin untuk mengakses halaman layanan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white p-6 lg:p-8 space-y-6 text-slate-800">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-sky-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Daftar Layanan</h1>
          <p className="text-sky-100 text-xs font-medium mt-1">
            Kelola kategori, paket layanan, dan daftar harga laundry
          </p>
        </div>

        {/* Tombol Aksi HANYA MUNCUL untuk Admin & Owner */}
        {canModify && (
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={handleOpenCategoryModal}
              className="bg-white text-sky-600 hover:bg-sky-50 font-bold px-4 py-2.5 rounded-xl shadow-sm text-xs"
            >
              + Kategori
            </button>
            <button
              type="button"
              onClick={handleOpenCreateService}
              disabled={categories.length === 0}
              className={`px-4 py-2.5 font-bold rounded-xl text-xs shadow-sm ${categories.length === 0
                  ? "bg-sky-300 text-white cursor-not-allowed"
                  : "bg-white hover:bg-sky-50 text-sky-600"
                }`}
            >
              + Layanan
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex justify-between items-center text-xs font-medium">
          <span>{error}</span>
          <button onClick={loadData} className="bg-rose-100 px-3 py-1.5 rounded-lg font-bold">
            Coba lagi
          </button>
        </div>
      )}

      {/* RINGKASAN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <p className="text-[11px] font-bold uppercase text-slate-400">Total Kategori</p>
          <p className="text-3xl font-black text-slate-800 mt-2">{categories.length}</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <p className="text-[11px] font-bold uppercase text-slate-400">Total Layanan</p>
          <p className="text-3xl font-black text-sky-600 mt-2">{services.length}</p>
        </div>
      </div>

      {/* DAFTAR LAYANAN DENGAN KATEGORI */}
      <div className="space-y-8">
        {groupedServices.map((category) => (
          <section key={category.id} className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-800">{category.name}</h2>
                <p className="text-xs font-semibold text-sky-600 mt-0.5">
                  {category.services.length} layanan
                </p>
              </div>

              {canModify && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenCreateServiceForCategory(category.id)}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-sky-50 text-sky-700 border border-sky-200"
                  >
                    + Layanan
                  </button>
                  <button
                    type="button"
                    disabled={category.services.length > 0}
                    onClick={() => handleDeleteCategory(category)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border ${category.services.length > 0
                        ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                        : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                      }`}
                  >
                    Hapus Kategori
                  </button>
                </div>
              )}
            </div>

            {category.services.length === 0 ? (
              <div className="bg-sky-50/30 border border-dashed border-sky-200 rounded-2xl p-6 text-center text-xs text-slate-400">
                Belum ada layanan pada kategori ini.
              </div>
            ) : (
              <div className="space-y-4">
                {category.services.map((service) => (
                  <div
                    key={service.id}
                    className="w-full bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm"
                  >
                    <div className="p-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-800">{service.name}</h3>
                        {service.description && (
                          <p className="text-xs text-slate-500 mt-1">{service.description}</p>
                        )}
                      </div>

                      {canModify && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleOpenEditService(service)}
                            className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-2.5 py-1.5 rounded-lg"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteService(service)}
                            className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-2.5 py-1.5 rounded-lg"
                          >
                            Hapus
                          </button>
                        </div>
                      )}
                    </div>

                    {/* HARGA */}
                    <div className="border-t border-slate-100 bg-sky-50/20 p-6">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-xs font-bold text-slate-700 uppercase">Daftar Harga</h4>
                        {canModify && (
                          <button
                            type="button"
                            onClick={() => handleOpenCreatePrice(service.id)}
                            className="text-xs font-bold text-sky-600 hover:underline"
                          >
                            + Tambah Harga
                          </button>
                        )}
                      </div>

                      {service.prices && service.prices.length > 0 ? (
                        <div className="space-y-2">
                          {service.prices.map((price) => (
                            <div
                              key={price.id}
                              className="flex justify-between items-center bg-white border border-slate-200/60 rounded-xl px-4 py-3 text-xs"
                            >
                              <span className="font-bold text-slate-800">{price.itemType}</span>
                              <span className="font-mono font-bold text-sky-600">
                                Rp {Number(price.price).toLocaleString("id-ID")} / {price.unit}
                              </span>
                              {canModify && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleOpenEditPrice(price)}
                                    className="text-amber-600 font-bold px-2"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeletePrice(price)}
                                    className="text-rose-600 font-bold px-2"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Belum ada rincian harga.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      {/* MODAL KATEGORI */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Tambah Kategori</h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <input
                type="text"
                placeholder="Nama Kategori"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full border p-2.5 rounded-xl text-xs"
                required
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={handleCloseCategoryModal} className="px-4 py-2 border rounded-xl text-xs font-bold">Batal</button>
                <button type="submit" className="bg-sky-600 text-white px-4 py-2 rounded-xl text-xs font-bold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL LAYANAN */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4">{editingService ? "Edit Layanan" : "Tambah Layanan"}</h3>
            <form onSubmit={handleSubmitService} className="space-y-4">
              <select
                value={serviceForm.categoryId}
                onChange={(e) => setServiceForm({ ...serviceForm, categoryId: e.target.value })}
                className="w-full border p-2.5 rounded-xl text-xs"
                required
              >
                <option value="">Pilih Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Nama Layanan"
                value={serviceForm.name}
                onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                className="w-full border p-2.5 rounded-xl text-xs"
                required
              />
              <textarea
                placeholder="Deskripsi (Opsional)"
                value={serviceForm.description}
                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                className="w-full border p-2.5 rounded-xl text-xs"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={handleCloseServiceModal} className="px-4 py-2 border rounded-xl text-xs font-bold">Batal</button>
                <button type="submit" className="bg-sky-600 text-white px-4 py-2 rounded-xl text-xs font-bold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL HARGA */}
      {showPriceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4">{editingPrice ? "Edit Harga" : "Tambah Harga"}</h3>
            <form onSubmit={handleSubmitPrice} className="space-y-4">
              <input
                type="text"
                placeholder="Jenis Item (cth: Pakaian / Selimut)"
                value={priceForm.itemType}
                onChange={(e) => setPriceForm({ ...priceForm, itemType: e.target.value })}
                className="w-full border p-2.5 rounded-xl text-xs"
                required
              />
              <input
                type="number"
                placeholder="Harga (Rp)"
                value={priceForm.price}
                onChange={(e) => setPriceForm({ ...priceForm, price: e.target.value })}
                className="w-full border p-2.5 rounded-xl text-xs"
                required
              />
              <select
                value={priceForm.unit}
                onChange={(e) => setPriceForm({ ...priceForm, unit: e.target.value })}
                className="w-full border p-2.5 rounded-xl text-xs"
              >
                <option value="kg">kg</option>
                <option value="pcs">pcs</option>
              </select>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={handleClosePriceModal} className="px-4 py-2 border rounded-xl text-xs font-bold">Batal</button>
                <button type="submit" className="bg-sky-600 text-white px-4 py-2 rounded-xl text-xs font-bold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Layanan;