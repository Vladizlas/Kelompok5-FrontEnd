import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

const API_URL = "http://localhost:3000";

function Layanan() {
  const { user } = useOutletContext();

  console.log("USER DI LAYANAN:", user);

  // =========================================================
  // ROLE / ACCESS CONTROL
  // =========================================================

  const allowedRoles = ["admin", "owner"];

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

  // =========================================================
  // CATEGORY MODAL
  // =========================================================

  const [showCategoryModal, setShowCategoryModal] =
    useState(false);

  const [categoryName, setCategoryName] = useState("");

  // =========================================================
  // SERVICE MODAL
  // =========================================================

  const [showServiceModal, setShowServiceModal] =
    useState(false);

  const [editingService, setEditingService] =
    useState(null);

  const [serviceForm, setServiceForm] = useState({
    categoryId: "",
    name: "",
    description: "",
  });

  // =========================================================
  // PRICE MODAL
  // =========================================================

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
      <div className="min-h-[400px] flex items-center justify-center bg-white">
        <div className="text-center">

          <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mx-auto mb-4"></div>

          <p className="text-slate-500 text-xs font-medium">
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
      <div className="p-6 bg-white min-h-screen">

        <div className="bg-white border border-rose-200 rounded-2xl p-10 text-center shadow-sm">

          <div className="text-5xl mb-4">
            🔒
          </div>

          <h2 className="text-xl font-bold text-slate-800">
            Akses Ditolak
          </h2>

          <p className="text-slate-500 mt-2 text-xs">
            Anda tidak memiliki izin untuk
            mengakses halaman layanan.
          </p>

          {user?.role && (
            <p className="text-xs text-slate-400 mt-3 font-mono">
              Role Anda: {user.role}
            </p>
          )}

        </div>

      </div>
    );
  }

  // =========================================================
  // RENDER (DENGAN TAMPILAN WHITE BACKGROUND & SKY BLUE HEADER)
  // =========================================================

  return (
    <div className="w-full min-h-screen bg-white p-6 lg:p-8 space-y-6 text-slate-800">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-sky-500 to-blue-600 p-6 rounded-2xl shadow-lg shadow-sky-500/15 text-white">

        <div>

          <h1 className="text-2xl font-black tracking-tight">
            Layanan
          </h1>

          <p className="text-sky-100 text-xs font-medium mt-1">
            Kelola kategori, layanan, dan harga laundry
          </p>

        </div>

        <div className="flex flex-wrap gap-2.5">

          {/* TAMBAH KATEGORI */}

          <button
            type="button"
            onClick={
              handleOpenCategoryModal
            }
            className="bg-white text-sky-600 hover:bg-sky-50 font-bold px-4 py-2.5 rounded-xl shadow-sm transition duration-200 text-xs flex items-center justify-center gap-1.5"
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
            className={`px-4 py-2.5 font-bold rounded-xl text-xs transition shadow-sm ${categories.length === 0
                ? "bg-sky-300 text-white/80 cursor-not-allowed"
                : "bg-sky-700 hover:bg-sky-800 text-white"
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
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex justify-between items-center gap-4 text-xs font-medium shadow-sm">

          <span>{error}</span>

          <button
            type="button"
            onClick={loadData}
            className="text-xs bg-rose-100 hover:bg-rose-200 text-rose-800 font-semibold px-3 py-1.5 rounded-lg transition"
          >
            Coba lagi
          </button>

        </div>
      )}

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">

          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Kategori
          </p>

          <p className="text-3xl font-black text-slate-800 mt-2">
            {categories.length}
          </p>

        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">

          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Layanan
          </p>

          <p className="text-3xl font-black text-sky-600 mt-2">
            {services.length}
          </p>

        </div>

      </div>

      {/* =====================================================
          EMPTY CATEGORY
      ===================================================== */}

      {categories.length === 0 ? (

        <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center shadow-sm">

          <div className="text-4xl mb-4">
            🧺
          </div>

          <h2 className="text-base font-bold text-slate-800">
            Belum ada kategori
          </h2>

          <p className="text-slate-400 text-xs mt-1 mb-5">
            Tambahkan kategori layanan laundry terlebih dahulu.
          </p>

          <button
            type="button"
            onClick={
              handleOpenCategoryModal
            }
            className="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl transition shadow-sm"
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
                className="space-y-4"
              >

                {/* CATEGORY HEADER */}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                  <div>

                    <h2 className="text-xl font-black text-slate-800">
                      {category.name}
                    </h2>

                    <p className="text-xs font-semibold text-sky-600 mt-0.5">
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
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition"
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
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition ${category.services
                          .length > 0
                          ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                          : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                        }`}
                    >
                      {category.services
                        .length > 0
                        ? "Hapus Layanan Dahulu"
                        : "Hapus Kategori"}
                    </button>

                  </div>

                </div>

                {/* =====================================================
                    NO SERVICE
                ===================================================== */}

                {category.services.length === 0 ? (

                  <div className="bg-sky-50/30 border border-dashed border-sky-200 rounded-2xl p-6">

                    <div className="text-center">

                      <p className="text-slate-400 text-xs">
                        Belum ada layanan pada kategori ini.
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          handleOpenCreateServiceForCategory(
                            category.id
                          )
                        }
                        className="text-xs text-sky-600 font-bold hover:text-sky-800 mt-2 inline-block"
                      >
                        + Tambah layanan
                      </button>

                    </div>

                  </div>

                ) : (

                  /* =====================================================
                      SERVICE LIST FULL WIDTH
                  ===================================================== */

                  <div className="space-y-4">

                    {category.services.map(
                      (service) => (

                        <div
                          key={service.id}
                          className="w-full bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:border-sky-200 transition"
                        >

                          {/* =================================================
                              SERVICE HEADER
                          ================================================= */}

                          <div className="p-6">

                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

                              <div className="min-w-0 flex-1">

                                <h3 className="text-base font-extrabold text-slate-800">
                                  {service.name}
                                </h3>

                                {service.description && (
                                  <p className="text-xs text-slate-500 mt-1">
                                    {
                                      service.description
                                    }
                                  </p>
                                )}

                              </div>

                              {/* SERVICE ACTION */}

                              <div className="flex gap-1.5 shrink-0">

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpenEditService(
                                      service
                                    )
                                  }
                                  className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold px-2.5 py-1.5 rounded-lg transition"
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
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold px-2.5 py-1.5 rounded-lg transition"
                                >
                                  Hapus
                                </button>

                              </div>

                            </div>

                          </div>

                          {/* =================================================
                              PRICE SECTION
                          ================================================= */}

                          <div className="border-t border-slate-100 bg-sky-50/20 p-6">

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">

                              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Daftar Harga
                              </h4>

                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenCreatePrice(
                                    service.id
                                  )
                                }
                                className="text-xs font-bold text-sky-600 hover:text-sky-800"
                              >
                                + Tambah Harga
                              </button>

                            </div>

                            {/* =================================================
                                PRICE LIST
                            ================================================= */}

                            {service.prices &&
                              service.prices.length >
                              0 ? (

                              <div className="w-full overflow-x-auto">

                                <div className="min-w-[500px]">

                                  {/* PRICE HEADER */}

                                  <div className="grid grid-cols-[1fr_1fr_120px] gap-4 px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">

                                    <div>
                                      Jenis Item
                                    </div>

                                    <div>
                                      Harga
                                    </div>

                                    <div className="text-center">
                                      Aksi
                                    </div>

                                  </div>

                                  {/* PRICE ROW */}

                                  <div className="space-y-2">

                                    {service.prices.map(
                                      (price) => (

                                        <div
                                          key={
                                            price.id
                                          }
                                          className="grid grid-cols-[1fr_1fr_120px] gap-4 items-center bg-white border border-slate-200/60 rounded-xl px-4 py-3"
                                        >

                                          {/* ITEM */}

                                          <div className="min-w-0">

                                            <p className="text-xs font-bold text-slate-800 truncate">
                                              {
                                                price.itemType
                                              }
                                            </p>

                                          </div>

                                          {/* PRICE */}

                                          <div>

                                            <p className="text-xs font-bold text-slate-800 font-mono">
                                              Rp{" "}
                                              {Number(
                                                price.price
                                              ).toLocaleString(
                                                "id-ID"
                                              )}
                                              {" / "}
                                              {
                                                price.unit
                                              }
                                            </p>

                                          </div>

                                          {/* ACTION */}

                                          <div className="flex justify-center items-center gap-1.5">

                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleOpenEditPrice(
                                                  price
                                                )
                                              }
                                              className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold px-2 py-1 rounded-lg transition"
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
                                              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold px-2 py-1 rounded-lg transition"
                                            >
                                              Hapus
                                            </button>

                                          </div>

                                        </div>

                                      )
                                    )}

                                  </div>

                                </div>

                              </div>

                            ) : (

                              <div className="py-6 text-center bg-white border border-dashed border-slate-200 rounded-xl">

                                <p className="text-xs text-slate-400">
                                  Belum ada harga.
                                </p>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpenCreatePrice(
                                      service.id
                                    )
                                  }
                                  className="text-xs text-sky-600 font-bold mt-1 hover:underline"
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
          MODAL KATEGORI
      ===================================================== */}

      {showCategoryModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden my-8">

            <div className="bg-sky-500 text-white px-6 py-4 flex items-center justify-between">

              <h2 className="text-base font-bold">
                Tambah Kategori Baru
              </h2>

              <button
                type="button"
                onClick={
                  handleCloseCategoryModal
                }
                className="text-white/80 hover:text-white font-bold text-xl leading-none"
              >
                &times;
              </button>

            </div>

            <form
              onSubmit={
                handleCreateCategory
              }
              className="p-6 space-y-4"
            >

              <div>

                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
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
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                />

              </div>

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={
                    handleCloseCategoryModal
                  }
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl transition shadow-sm"
                >
                  Simpan Kategori
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
          MODAL LAYANAN
      ===================================================== */}

      {showServiceModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden my-8">

            <div className="bg-sky-500 text-white px-6 py-4 flex items-center justify-between">

              <h2 className="text-base font-bold">
                {editingService
                  ? "Edit Layanan"
                  : "Tambah Layanan Baru"}
              </h2>

              <button
                type="button"
                onClick={
                  handleCloseServiceModal
                }
                className="text-white/80 hover:text-white font-bold text-xl leading-none"
              >
                &times;
              </button>

            </div>

            <form
              onSubmit={
                handleSubmitService
              }
              className="p-6 space-y-4"
            >

              {/* CATEGORY */}

              <div>

                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
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
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                >

                  <option value="">
                    -- Pilih Kategori --
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

                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
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
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Deskripsi (Opsional)
                </label>

                <textarea
                  name="description"
                  value={
                    serviceForm.description
                  }
                  onChange={
                    handleServiceFormChange
                  }
                  placeholder="Deskripsi singkat mengenai layanan..."
                  rows={3}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition resize-none"
                />

              </div>

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={
                    handleCloseServiceModal
                  }
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl transition shadow-sm"
                >
                  {editingService
                    ? "Update Layanan"
                    : "Simpan Layanan"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
          MODAL HARGA
      ===================================================== */}

      {showPriceModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden my-8">

            <div className="bg-sky-500 text-white px-6 py-4 flex items-center justify-between">

              <h2 className="text-base font-bold">
                {editingPrice
                  ? "Edit Harga"
                  : "Tambah Harga Baru"}
              </h2>

              <button
                type="button"
                onClick={
                  handleClosePriceModal
                }
                className="text-white/80 hover:text-white font-bold text-xl leading-none"
              >
                &times;
              </button>

            </div>

            <form
              onSubmit={
                handleSubmitPrice
              }
              className="p-6 space-y-4"
            >

              {/* SERVICE */}

              <div>

                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
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
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition disabled:bg-slate-100 disabled:text-slate-500"
                >

                  <option value="">
                    -- Pilih Layanan --
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

                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
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
                  placeholder="Contoh: Pakaian, Bed Cover, Selimut"
                  maxLength={100}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                />

              </div>

              {/* PRICE & UNIT */}

              <div className="grid grid-cols-2 gap-3">

                <div>

                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Harga (Rp)
                  </label>

                  <div className="relative">

                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
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
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                    />

                  </div>

                </div>

                <div>

                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Satuan Unit
                  </label>

                  <select
                    name="unit"
                    value={
                      priceForm.unit
                    }
                    onChange={
                      handlePriceFormChange
                    }
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                  >

                    <option value="kg">
                      kg (Kilogram)
                    </option>

                    <option value="pcs">
                      pcs (Satuan)
                    </option>

                  </select>

                </div>

              </div>

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={
                    handleClosePriceModal
                  }
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl transition shadow-sm"
                >
                  {editingPrice
                    ? "Update Harga"
                    : "Simpan Harga"}
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