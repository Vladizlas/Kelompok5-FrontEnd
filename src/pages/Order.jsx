import React, { useState } from "react";
import { Plus, Trash2, ShoppingBag, User, Calculator, CheckCircle2 } from "lucide-react";

export default function Order() {
  // Master Data Dummy Customer (Nanti di-fetch dari API /api/customers)
  const masterCustomers = [
    { id: 1, nama: "Budi Santoso", no_telp: "081234567890", alamat: "Jl. Mawar No. 12" },
    { id: 2, nama: "Siti Aminah", no_telp: "085712345678", alamat: "Jl. Melati No. 5" },
    { id: 3, nama: "Ahmad Rizki", no_telp: "081987654321", alamat: "Jl. Anggrek No. 8" },
  ];

  // Master Data Dummy Kategori & Layanan
  const masterCategories = [
    { id: 1, nama: "Cuci Gosok" },
    { id: 2, nama: "Gosok" },
    { id: 3, nama: "Cuci" },
    { id: 4, nama: "Cuci Kiloan" },
  ];

  const masterServices = [
    { id: 101, categoryId: 1, nama: "Pakaian", harga: 6000, satuan: "kg" },
    { id: 102, categoryId: 1, nama: "Bed Cover", harga: 10000, satuan: "kg" },
    { id: 103, categoryId: 2, nama: "Pakaian", harga: 4000, satuan: "kg" },
    { id: 104, categoryId: 2, nama: "Bed Cover", harga: 7000, satuan: "kg" },
    { id: 105, categoryId: 3, nama: "Handuk", harga: 7000, satuan: "pcs" },
    { id: 106, categoryId: 4, nama: "Pakaian", harga: 4000, satuan: "kg" },
    { id: 107, categoryId: 4, nama: "Bed Cover", harga: 7000, satuan: "kg" },
  ];

  // State Customer & ID Terpilih
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customer, setCustomer] = useState({
    nama: "",
    no_telp: "",
    alamat: "",
  });

  // State Form Layanan
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [qty, setQty] = useState(1);
  const [cart, setCart] = useState([]);
  const [metodePembayaran, setMetodePembayaran] = useState("cash");

  // Handler saat pelanggan dipilih dari Dropdown
  const handleSelectCustomer = (e) => {
    const customerId = e.target.value;
    setSelectedCustomerId(customerId);

    if (customerId === "") {
      // Reset form jika pilih "Pelanggan Baru"
      setCustomer({ nama: "", no_telp: "", alamat: "" });
    } else {
      // Cari dan isi otomatis data customer ke state
      const selected = masterCustomers.find((c) => c.id === parseInt(customerId));
      if (selected) {
        setCustomer({
          nama: selected.nama,
          no_telp: selected.no_telp,
          alamat: selected.alamat,
        });
      }
    }
  };

  // Filter Layanan Berdasarkan Kategori
  const availableServices = masterServices.filter(
    (s) => s.categoryId === parseInt(selectedCategoryId)
  );

  // Cari Layanan Terpilih
  const currentService = masterServices.find(
    (s) => s.id === parseInt(selectedServiceId)
  );

  // Hitung Subtotal Otomatis
  const currentSubtotal = currentService ? currentService.harga * qty : 0;

  // Tambah Layanan ke Keranjang
  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!currentService || qty <= 0) return;

    const existingIndex = cart.findIndex((item) => item.id === currentService.id);

    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].qty += parseFloat(qty);
      updatedCart[existingIndex].subtotal = updatedCart[existingIndex].qty * updatedCart[existingIndex].harga;
      setCart(updatedCart);
    } else {
      setCart([
        ...cart,
        {
          ...currentService,
          categoryName: masterCategories.find((c) => c.id === parseInt(selectedCategoryId))?.nama,
          qty: parseFloat(qty),
          subtotal: currentSubtotal,
        },
      ]);
    }

    setSelectedServiceId("");
    setQty(1);
  };

  // Hapus Item
  const handleRemoveItem = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  // Grand Total Transaksi
  const grandTotal = cart.reduce((acc, item) => acc + item.subtotal, 0);

  // Submit Transaksi Ke Backend
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!customer.nama || !customer.no_telp) {
      alert("Harap isi nama dan nomor telepon pelanggan!");
      return;
    }
    if (cart.length === 0) {
      alert("Harap pilih minimal satu layanan!");
      return;
    }

    const payload = {
      customer,
      items: cart,
      grandTotal,
      metodePembayaran,
    };

    console.log("Data Order Dikirim:", payload);
    alert("Transaksi Order Berhasil Disimpan!");

    // Reset Form
    setSelectedCustomerId("");
    setCustomer({ nama: "", no_telp: "", alamat: "" });
    setCart([]);
    setSelectedCategoryId("");
  };

  return (
    <div className="p-6 bg-[#0f172a] text-slate-100 min-h-screen space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Buat Order Baru</h1>
        <p className="text-slate-400 text-sm">Kelola pendaftaran pelanggan dan transaksi laundry.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* KOLOM KIRI: CUSTOMER & PILIH LAYANAN */}
        <div className="lg:col-span-2 space-y-6">
          {/* DATA CUSTOMER */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Data Pelanggan (Customer)
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Dropdown Pilih Pelanggan Terdaftar */}
              <div className="md:col-span-2">
                <label className="text-xs text-slate-400 block mb-1">Cari / Pilih Pelanggan Terdaftar</label>
                <select
                  value={selectedCustomerId}
                  onChange={handleSelectCustomer}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Pelanggan Baru (Isi Manual) --</option>
                  {masterCustomers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nama} ({c.no_telp})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Nama Pelanggan *</label>
                <input
                  type="text"
                  placeholder="Nama Pelanggan"
                  value={customer.nama}
                  onChange={(e) => {
                    setSelectedCustomerId("");
                    setCustomer({ ...customer, nama: e.target.value });
                  }}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">No. Telepon / WA *</label>
                <input
                  type="text"
                  placeholder="0812xxxxxxxx"
                  value={customer.no_telp}
                  onChange={(e) => {
                    setSelectedCustomerId("");
                    setCustomer({ ...customer, no_telp: e.target.value });
                  }}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-slate-400 block mb-1">Alamat Pelanggan</label>
                <textarea
                  rows="2"
                  placeholder="Alamat lengkap pelanggan"
                  value={customer.alamat}
                  onChange={(e) => {
                    setSelectedCustomerId("");
                    setCustomer({ ...customer, alamat: e.target.value });
                  }}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>
            </div>
          </div>

          {/* FORM PILIH LAYANAN */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-400" />
              Pilih Kategori & Layanan
            </h2>

            <form onSubmit={handleAddToCart} className="grid md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-4">
                <label className="text-xs text-slate-400 block mb-1">Kategori Layanan</label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => {
                    setSelectedCategoryId(e.target.value);
                    setSelectedServiceId("");
                  }}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Pilih Kategori --</option>
                  {masterCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.nama}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-4">
                <label className="text-xs text-slate-400 block mb-1">Layanan</label>
                <select
                  disabled={!selectedCategoryId}
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
                >
                  <option value="">-- Pilih Layanan --</option>
                  {availableServices.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} (Rp {s.harga.toLocaleString("id-ID")}/{s.satuan})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-slate-400 block mb-1">
                  {currentService ? `Jumlah (${currentService.satuan})` : "Jumlah"}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={!selectedServiceId}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-medium text-sm rounded-xl transition flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Tambah
                </button>
              </div>
            </form>

            {currentService && (
              <div className="p-3 bg-slate-800/50 rounded-xl text-xs flex justify-between items-center text-slate-300 border border-slate-700/50">
                <span>Harga Satuan: <b>Rp {currentService.harga.toLocaleString("id-ID")} / {currentService.satuan}</b></span>
                <span>Subtotal Item: <b className="text-blue-400 text-sm">Rp {currentSubtotal.toLocaleString("id-ID")}</b></span>
              </div>
            )}
          </div>

          {/* TABEL RINCIAN ITEM ORDER */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h2 className="text-lg font-semibold">Rincian Item Order</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 rounded-l-xl">Kategori & Layanan</th>
                    <th className="px-4 py-3">Harga</th>
                    <th className="px-4 py-3">Jumlah</th>
                    <th className="px-4 py-3">Subtotal</th>
                    <th className="px-4 py-3 rounded-r-xl text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-slate-500">
                        Belum ada item layanan yang ditambahkan.
                      </td>
                    </tr>
                  ) : (
                    cart.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-white">[{item.categoryName}]</span> {item.nama}
                        </td>
                        <td className="px-4 py-3">Rp {item.harga.toLocaleString("id-ID")}</td>
                        <td className="px-4 py-3">{item.qty} {item.satuan}</td>
                        <td className="px-4 py-3 font-semibold text-white">
                          Rp {item.subtotal.toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: RINGKASAN & PEMBAYARAN */}
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6 sticky top-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-400" />
              Ringkasan Pembayaran
            </h2>

            <div className="space-y-3 border-b border-slate-800 pb-4 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Total Item:</span>
                <span className="text-white font-medium">{cart.length} Layanan</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-base font-bold text-white">Total Bayar:</span>
                <span className="text-2xl font-extrabold text-blue-400">
                  Rp {grandTotal.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* OPSI METODE PEMBAYARAN */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-slate-400 block">Metode Pembayaran</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMetodePembayaran("cash")}
                  className={`py-2.5 rounded-xl text-sm font-semibold border transition ${
                    metodePembayaran === "cash"
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  Cash (Tunai)
                </button>
                <button
                  type="button"
                  onClick={() => setMetodePembayaran("transfer")}
                  className={`py-2.5 rounded-xl text-sm font-semibold border transition ${
                    metodePembayaran === "transfer"
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  Transfer
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmitOrder}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" /> Simpan Transaksi Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
