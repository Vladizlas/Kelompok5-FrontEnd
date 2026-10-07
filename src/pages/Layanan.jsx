import { useEffect, useState } from "react";

const API_URL = "http://localhost:3000";

function Layanan({ user }) {
  // =========================================================
  // ROLE / ACCESS CONTROL
  // =========================================================

  // Role yang diperbolehkan mengakses halaman Layanan
  const allowedRoles = ["admin", "owner"];

  // Dibuat lowercase supaya bisa menerima:
  // admin / ADMIN / Admin
  // owner / OWNER / Owner
  const userRole = user?.role?.toLowerCase();

  const hasAccess =
    Boolean(userRole) &&
    allowedRoles.includes(userRole);

  // =========================================================
  // STATE
  // =========================================================

  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // CATEGORY MODAL
  // =========================

  const [showCategoryModal, setShowCategoryModal] =
    useState(false);

  const [categoryName, setCategoryName] = useState("");

  // =========================
  // SERVICE MODAL
  // =========================

  const [showServiceModal, setShowServiceModal] =
    useState(false);

  const [editingService, setEditingService] =
    useState(null);

  const [serviceForm, setServiceForm] = useState({
    categoryId: "",
    name: "",
    description: "",
  });

  // =========================
  // PRICE MODAL
  // =========================

  const [showPriceModal, setShowPriceModal] =
    useState(false);

  const [editingPrice, setEditingPrice] =
    useState(null);

  const [priceForm, setPriceForm] = useState({
    serviceId: "",
    itemType: "",
    price: "",
    unit: "kg",
  });

  // =========================================================
  // FETCH CATEGORIES
  // =========================================================

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/categories`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Gagal mengambil data kategori"
        );
      }

      setCategories(result.data || []);
    } catch (error) {
      console.error(
        "Error fetch categories:",
        error
      );

      throw error;
    }
  };

  // =========================================================
  // FETCH SERVICES
  // =========================================================

  const fetchServices = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/services`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Gagal mengambil data layanan"
        );
      }

      setServices(result.data || []);
    } catch (error) {
      console.error(
        "Error fetch services:",
        error
      );

      throw error;
    }
  };

  // =========================================================
  // LOAD ALL DATA
  // =========================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        fetchCategories(),
        fetchServices(),
      ]);
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Gagal mengambil data"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    /*
     * Jika user belum memiliki role atau role tidak
     * termasuk admin/owner, jangan request data API.
     */
    if (!hasAccess) {
      setLoading(false);
      return;
    }

    loadData();
  }, [hasAccess]);

  // =========================================================
  // CATEGORY
  // =========================================================

  const handleOpenCategoryModal = () => {
    setCategoryName("");
    setShowCategoryModal(true);
  };

  const handleCloseCategoryModal = () => {
    setCategoryName("");
    setShowCategoryModal(false);
  };

  // =========================================================
  // CREATE CATEGORY
  // =========================================================

  const handleCreateCategory = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      alert("Nama kategori wajib diisi");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/categories`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: categoryName.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Gagal menambahkan kategori"
        );
      }

      alert("Kategori berhasil ditambahkan");

      handleCloseCategoryModal();

      await fetchCategories();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // =========================================================
  // DELETE CATEGORY
  // =========================================================

  const handleDeleteCategory = async (
    category
  ) => {
    if (category.services.length > 0) {
      alert(
        "Kategori tidak dapat dihapus karena masih memiliki layanan. Hapus semua layanan dalam kategori terlebih dahulu."
      );

      return;
    }

    const confirmed = window.confirm(
      `Yakin ingin menghapus kategori "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/api/categories/${category.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Gagal menghapus kategori"
        );
      }

      alert("Kategori berhasil dihapus");

      await fetchCategories();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // =========================================================
  // SERVICE
  // =========================================================

  const handleOpenCreateService = () => {
    setEditingService(null);

    setServiceForm({
      categoryId: "",
      name: "",
      description: "",
    });

    setShowServiceModal(true);
  };

  const handleOpenCreateServiceForCategory = (
    categoryId
  ) => {
    setEditingService(null);

    setServiceForm({
      categoryId: categoryId,
      name: "",
      description: "",
    });

    setShowServiceModal(true);
  };

  // =========================================================
  // EDIT SERVICE
  // =========================================================

  const handleOpenEditService = (service) => {
    setEditingService(service);

    setServiceForm({
      categoryId: service.categoryId,
      name: service.name,
      description: service.description || "",
    });

    setShowServiceModal(true);
  };

  // =========================================================
  // CLOSE SERVICE MODAL
  // =========================================================

  const handleCloseServiceModal = () => {
    setEditingService(null);

    setServiceForm({
      categoryId: "",
      name: "",
      description: "",
    });

    setShowServiceModal(false);
  };

  // =========================================================
  // SERVICE FORM CHANGE
  // =========================================================

  const handleServiceFormChange = (e) => {
    const { name, value } = e.target;

    setServiceForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // CREATE / UPDATE SERVICE
  // =========================================================

  const handleSubmitService = async (e) => {
    e.preventDefault();

    if (!serviceForm.categoryId) {
      alert("Kategori wajib dipilih");
      return;
    }

    if (!serviceForm.name.trim()) {
      alert("Nama layanan wajib diisi");
      return;
    }

    try {
      const isEdit = Boolean(editingService);

      const url = isEdit
        ? `${API_URL}/api/services/${editingService.id}`
        : `${API_URL}/api/services`;

      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryId: Number(
            serviceForm.categoryId
          ),
          name: serviceForm.name.trim(),
          description:
            serviceForm.description.trim() ||
            null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Gagal menyimpan layanan"
        );
      }

      alert(
        isEdit
          ? "Layanan berhasil diupdate"
          : "Layanan berhasil ditambahkan"
      );

      handleCloseServiceModal();

      await fetchServices();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // =========================================================
  // DELETE SERVICE
  // =========================================================

  const handleDeleteService = async (
    service
  ) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus layanan "${service.name}"?\n\nSemua harga yang terkait dengan layanan ini juga akan dihapus.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/api/services/${service.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Gagal menghapus layanan"
        );
      }

      alert("Layanan berhasil dihapus");

      await fetchServices();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // =========================================================
  // PRICE
  // =========================================================

  const handleOpenCreatePrice = (
    serviceId
  ) => {
    setEditingPrice(null);

    setPriceForm({
      serviceId: serviceId,
      itemType: "",
      price: "",
      unit: "kg",
    });

    setShowPriceModal(true);
  };

  // =========================================================
  // EDIT PRICE
  // =========================================================

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

  // =========================================================
  // CLOSE PRICE MODAL
  // =========================================================

  const handleClosePriceModal = () => {
    setEditingPrice(null);

    setPriceForm({
      serviceId: "",
      itemType: "",
      price: "",
      unit: "kg",
    });

    setShowPriceModal(false);
  };

  // =========================================================
  // PRICE FORM CHANGE
  // =========================================================

  const handlePriceFormChange = (e) => {
    const { name, value } = e.target;

    setPriceForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // CREATE / UPDATE PRICE
  // =========================================================

  const handleSubmitPrice = async (e) => {
    e.preventDefault();

    if (!priceForm.serviceId) {
      alert("Service wajib dipilih");
      return;
    }

    if (!priceForm.itemType.trim()) {
      alert("Jenis item wajib diisi");
      return;
    }

    if (
      priceForm.price === "" ||
      Number(priceForm.price) < 0
    ) {
      alert("Harga tidak valid");
      return;
    }

    if (
      !["kg", "pcs"].includes(
        priceForm.unit
      )
    ) {
      alert("Unit harus kg atau pcs");
      return;
    }

    try {
      const isEdit = Boolean(editingPrice);

      const url = isEdit
        ? `${API_URL}/api/service-prices/${editingPrice.id}`
        : `${API_URL}/api/service-prices`;

      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: Number(
            priceForm.serviceId
          ),
          itemType:
            priceForm.itemType.trim(),
          price: Number(priceForm.price),
          unit: priceForm.unit,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Gagal menyimpan harga"
        );
      }

      alert(
        isEdit
          ? "Harga berhasil diupdate"
          : "Harga berhasil ditambahkan"
      );

      handleClosePriceModal();

      await fetchServices();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // =========================================================
  // DELETE PRICE
  // =========================================================

  const handleDeletePrice = async (
    price
  ) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus harga "${price.itemType}"?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/api/service-prices/${price.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Gagal menghapus harga"
        );
      }

      alert("Harga berhasil dihapus");

      await fetchServices();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // =========================================================
  // GROUP SERVICES BY CATEGORY
  // =========================================================

  const groupedServices =
    categories.map((category) => ({
      ...category,

      services: services.filter(
        (service) =>
          Number(service.categoryId) ===
          Number(category.id)
      ),
    }));

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">

          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>

          <p className="text-gray-500">
            Memuat data layanan...
          </p>

        </div>
      </div>
    );
  }

  // =========================================================
  // ACCESS DENIED
  // =========================================================

  if (!hasAccess) {
    return (
      <div className="p-6">

        <div className="bg-white border border-red-200 rounded-xl p-10 text-center">

          <div className="text-5xl mb-4">
            🔒
          </div>

          <h2 className="text-xl font-bold text-gray-800">
            Akses Ditolak
          </h2>

          <p className="text-gray-500 mt-2">
            Anda tidak memiliki izin untuk
            mengakses halaman layanan.
          </p>

          {user?.role && (
            <p className="text-sm text-gray-400 mt-3">
              Role Anda: {user.role}
            </p>
          )}

        </div>

      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="p-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">

        <div>

          <h1 className="text-2xl font-bold text-white">
            Layanan
          </h1>

          <p className="text-white mt-1">
            Kelola kategori, layanan, dan harga laundry
          </p>

        </div>

        <div className="flex flex-wrap gap-3">

          {/* TAMBAH KATEGORI */}

          <button
            type="button"
            onClick={
              handleOpenCategoryModal
            }
            className="px-4 py-2.5 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            + Kategori
          </button>

          {/* TAMBAH LAYANAN */}

          <button
            type="button"
            onClick={
              handleOpenCreateService
            }
            disabled={
              categories.length === 0
            }
            className={`px-4 py-2.5 rounded-lg text-white transition ${
              categories.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            + Layanan
          </button>

        </div>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">

          <div className="flex justify-between items-center gap-4">

            <span>{error}</span>

            <button
              type="button"
              onClick={loadData}
              className="text-sm font-medium underline"
            >
              Coba lagi
            </button>

          </div>

        </div>
      )}

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">

        <div className="bg-white border rounded-xl p-5">

          <p className="text-sm text-gray-500">
            Total Kategori
          </p>

          <p className="text-2xl font-bold text-gray-800 mt-1">
            {categories.length}
          </p>

        </div>

        <div className="bg-white border rounded-xl p-5">

          <p className="text-sm text-gray-500">
            Total Layanan
          </p>

          <p className="text-2xl font-bold text-gray-800 mt-1">
            {services.length}
          </p>

        </div>

      </div>

      {/* =====================================================
          EMPTY CATEGORY
      ===================================================== */}

      {categories.length === 0 ? (

        <div className="bg-white border rounded-xl p-10 text-center">

          <div className="text-4xl mb-4">
            🧺
          </div>

          <h2 className="text-lg font-semibold text-gray-800">
            Belum ada kategori
          </h2>

          <p className="text-gray-500 mt-1 mb-5">
            Tambahkan kategori layanan laundry terlebih dahulu.
          </p>

          <button
            type="button"
            onClick={
              handleOpenCategoryModal
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Tambah Kategori
          </button>

        </div>

      ) : (

        /* =====================================================
           CATEGORY LIST
        ===================================================== */

        <div className="space-y-8">

          {groupedServices.map(
            (category) => (

              <section
                key={category.id}
              >

                {/* CATEGORY HEADER */}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">

                  <div>

                    <h2 className="text-xl font-bold text-white">
                      {category.name}
                    </h2>

                    <p className="text-sm text-white mt-1">
                      {category.services.length}{" "}
                      layanan
                    </p>

                  </div>

                  <div className="flex items-center gap-2">

                    {/* TAMBAH SERVICE */}

                    <button
                      type="button"
                      onClick={() =>
                        handleOpenCreateServiceForCategory(
                          category.id
                        )
                      }
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                    >
                      + Layanan
                    </button>

                    {/* HAPUS CATEGORY */}

                    <button
                      type="button"
                      disabled={
                        category.services.length >
                        0
                      }
                      onClick={() =>
                        handleDeleteCategory(
                          category
                        )
                      }
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                        category.services
                          .length > 0
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-red-50 text-red-600 hover:bg-red-100"
                      }`}
                    >
                      {category.services
                        .length > 0
                        ? "Hapus Layanan Dahulu"
                        : "Hapus Kategori"}
                    </button>

                  </div>

                </div>

                {/* NO SERVICE */}

                {category.services
                  .length === 0 ? (

                  <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6">

                    <div className="text-center">

                      <p className="text-gray-500 text-sm">
                        Belum ada layanan pada kategori ini.
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          handleOpenCreateServiceForCategory(
                            category.id
                          )
                        }
                        className="text-sm text-blue-600 font-medium hover:text-blue-700 mt-2"
                      >
                        + Tambah layanan
                      </button>

                    </div>

                  </div>

                ) : (

                  /* SERVICE GRID */

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

                    {category.services.map(
                      (service) => (

                        <div
                          key={service.id}
                          className="bg-white border rounded-xl p-5 hover:shadow-sm transition"
                        >

                          {/* SERVICE HEADER */}

                          <div className="flex items-start justify-between gap-4">

                            <div className="min-w-0">

                              <h3 className="text-lg font-semibold text-gray-800">
                                {service.name}
                              </h3>

                              {service.description && (
                                <p className="text-sm text-gray-500 mt-1">
                                  {
                                    service.description
                                  }
                                </p>
                              )}

                            </div>

                            {/* SERVICE ACTION */}

                            <div className="flex gap-2 shrink-0">

                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenEditService(
                                    service
                                  )
                                }
                                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteService(
                                    service
                                  )
                                }
                                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                              >
                                Hapus
                              </button>

                            </div>

                          </div>

                          {/* PRICE */}

                          <div className="border-t mt-5 pt-4">

                            <div className="flex items-center justify-between mb-3">

                              <h4 className="text-sm font-semibold text-gray-700">
                                Daftar Harga
                              </h4>

                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenCreatePrice(
                                    service.id
                                  )
                                }
                                className="text-sm font-medium text-blue-600 hover:text-blue-700"
                              >
                                + Tambah Harga
                              </button>

                            </div>

                            {/* PRICE LIST */}

                            {service.prices &&
                            service.prices.length >
                              0 ? (

                              <div className="space-y-2">

                                {service.prices.map(
                                  (price) => (

                                    <div
                                      key={
                                        price.id
                                      }
                                      className="flex items-center justify-between gap-3 bg-gray-50 rounded-lg px-3 py-2.5"
                                    >

                                      <div className="min-w-0">

                                        <p className="text-sm font-medium text-gray-700">
                                          {
                                            price.itemType
                                          }
                                        </p>

                                        <p className="text-sm font-semibold text-gray-900">
                                          Rp{" "}
                                          {Number(
                                            price.price
                                          ).toLocaleString(
                                            "id-ID"
                                          )}{" "}
                                          /{" "}
                                          {
                                            price.unit
                                          }
                                        </p>

                                      </div>

                                      <div className="flex gap-2 shrink-0">

                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleOpenEditPrice(
                                              price
                                            )
                                          }
                                          className="px-2.5 py-1 text-xs rounded-md bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                                        >
                                          Edit
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleDeletePrice(
                                              price
                                            )
                                          }
                                          className="px-2.5 py-1 text-xs rounded-md bg-red-50 text-red-600 hover:bg-red-100"
                                        >
                                          Hapus
                                        </button>

                                      </div>

                                    </div>

                                  )
                                )}

                              </div>

                            ) : (

                              <div className="py-4 text-center bg-gray-50 rounded-lg">

                                <p className="text-sm text-gray-400">
                                  Belum ada harga.
                                </p>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpenCreatePrice(
                                      service.id
                                    )
                                  }
                                  className="text-sm text-blue-600 mt-1 hover:underline"
                                >
                                  Tambahkan harga
                                </button>

                              </div>

                            )}

                          </div>

                        </div>

                      )
                    )}

                  </div>

                )}

              </section>

            )
          )}

        </div>

      )}

      {/* =====================================================
          MODAL CATEGORY
      ===================================================== */}

      {showCategoryModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md bg-white rounded-xl shadow-xl">

            <div className="flex items-center justify-between px-6 py-4 border-b">

              <h2 className="text-lg font-bold text-gray-800">
                Tambah Kategori
              </h2>

              <button
                type="button"
                onClick={
                  handleCloseCategoryModal
                }
                className="text-black hover:text-gray-600 text-xl"
              >
                ×
              </button>

            </div>

            <form
              onSubmit={
                handleCreateCategory
              }
            >

              <div className="p-6">

                <label className="block text-sm font-medium text-black mb-2">
                  Nama Kategori
                </label>

                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) =>
                    setCategoryName(
                      e.target.value
                    )
                  }
                  placeholder="Contoh: Cuci Kering"
                  maxLength={100}
                  autoFocus
                  className="w-full text-black border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl">

                <button
                  type="button"
                  onClick={
                    handleCloseCategoryModal
                  }
                  className="px-4 py-2 border border-gray-300 bg-white rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Simpan
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
          MODAL SERVICE
      ===================================================== */}

      {showServiceModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md bg-white rounded-xl shadow-xl">

            <div className="flex items-center justify-between px-6 py-4 border-b">

              <h2 className="text-lg font-bold text-gray-800">
                {editingService
                  ? "Edit Layanan"
                  : "Tambah Layanan"}
              </h2>

              <button
                type="button"
                onClick={
                  handleCloseServiceModal
                }
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>

            </div>

            <form
              onSubmit={
                handleSubmitService
              }
            >

              <div className="p-6 space-y-4">

                {/* CATEGORY */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori
                  </label>

                  <select
                    name="categoryId"
                    value={
                      serviceForm.categoryId
                    }
                    onChange={
                      handleServiceFormChange
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  >

                    <option value="">
                      Pilih kategori
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={
                            category.id
                          }
                          value={
                            category.id
                          }
                        >
                          {
                            category.name
                          }
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* NAME */}

                <div>

                  <label className="block text-sm font-medium text-black mb-2">
                    Nama Layanan
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={
                      serviceForm.name
                    }
                    onChange={
                      handleServiceFormChange
                    }
                    placeholder="Contoh: Cuci Kiloan"
                    maxLength={100}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />

                </div>

                {/* DESCRIPTION */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi
                  </label>

                  <textarea
                    name="description"
                    value={
                      serviceForm.description
                    }
                    onChange={
                      handleServiceFormChange
                    }
                    placeholder="Contoh: Layanan cuci pakaian berdasarkan berat"
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-black resize-none"
                  />

                </div>

              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl">

                <button
                  type="button"
                  onClick={
                    handleCloseServiceModal
                  }
                  className="px-4 py-2 border border-gray-300 bg-white rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingService
                    ? "Update"
                    : "Simpan"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
          MODAL PRICE
      ===================================================== */}

      {showPriceModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md bg-white rounded-xl shadow-xl">

            <div className="flex items-center justify-between px-6 py-4 border-b">

              <h2 className="text-lg font-bold text-gray-800">
                {editingPrice
                  ? "Edit Harga"
                  : "Tambah Harga"}
              </h2>

              <button
                type="button"
                onClick={
                  handleClosePriceModal
                }
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>

            </div>

            <form
              onSubmit={
                handleSubmitPrice
              }
            >

              <div className="p-6 space-y-4">

                {/* SERVICE */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Layanan
                  </label>

                  <select
                    name="serviceId"
                    value={
                      priceForm.serviceId
                    }
                    onChange={
                      handlePriceFormChange
                    }
                    disabled={
                      Boolean(editingPrice)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-black"
                  >

                    <option value="">
                      Pilih layanan
                    </option>

                    {services.map(
                      (service) => (
                        <option
                          key={
                            service.id
                          }
                          value={
                            service.id
                          }
                        >
                          {
                            service.name
                          }
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* ITEM TYPE */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Item
                  </label>

                  <input
                    type="text"
                    name="itemType"
                    value={
                      priceForm.itemType
                    }
                    onChange={
                      handlePriceFormChange
                    }
                    placeholder="Contoh: Pakaian"
                    maxLength={100}
                    className="text-black w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  />

                </div>

                {/* PRICE */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga
                  </label>

                  <div className="relative">

                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                      Rp
                    </span>

                    <input
                      type="number"
                      name="price"
                      value={
                        priceForm.price
                      }
                      onChange={
                        handlePriceFormChange
                      }
                      placeholder="7000"
                      min="0"
                      step="1"
                      className="text-black w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                    />

                  </div>

                </div>

                {/* UNIT */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Satuan
                  </label>

                  <select
                    name="unit"
                    value={
                      priceForm.unit
                    }
                    onChange={
                      handlePriceFormChange
                    }
                    className="text-black w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  >

                    <option value="kg">
                      Kilogram (kg)
                    </option>

                    <option value="pcs">
                      Pieces (pcs)
                    </option>

                  </select>

                </div>

              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl">

                <button
                  type="button"
                  onClick={
                    handleClosePriceModal
                  }
                  className="px-4 py-2 border border-gray-300 bg-white rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingPrice
                    ? "Update"
                    : "Simpan"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Layanan;
