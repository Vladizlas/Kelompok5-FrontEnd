import React, { useState } from "react";
import { UserPlus, User, Phone, MapPin, Save, ArrowLeft } from "lucide-react";

export default function AddCustomer({ onBack, onSuccess }) {
  const [formData, setFormData] = useState({
    nama: "",
    no_telp: "",
    alamat: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nama || !formData.no_telp) {
      alert("Nama dan Nomor Telepon wajib diisi!");
      return;
    }

    setLoading(true);

    try {
      // Hubungkan ke endpoint Express Backend kamu
      const response = await fetch("http://localhost:3000/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Mappping nama ke nama_customer sesuai kebutuhan backend
        body: JSON.stringify({
          nama_customer: formData.nama,
          no_telp: formData.no_telp,
          alamat: formData.alamat,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menyimpan data customer");
      }

      alert("Pelanggan baru berhasil disimpan ke database!");
      setFormData({ nama: "", no_telp: "", alamat: "" });

      if (onSuccess) onSuccess();
      if (onBack) onBack();
    } catch (error) {
      console.error("Error submit customer:", error);
      alert(error.message || "Terjadi kesalahan saat menyimpan data pelanggan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-[#0f172a] text-slate-100 min-h-screen space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
              title="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <UserPlus className="w-7 h-7 text-blue-400" />
              Tambah Pelanggan Baru
            </h1>
            <p className="text-slate-400 text-sm">
              Isi formulir di bawah ini untuk mendaftarkan pelanggan baru.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center justify-between">
            <span>ID Pelanggan:</span>
            <span className="font-mono font-semibold text-blue-400">
              [Auto Increment MySQL]
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              placeholder="Masukkan nama lengkap pelanggan"
              required
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-400" />
              No. Telepon / WhatsApp <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              name="no_telp"
              value={formData.no_telp}
              onChange={handleChange}
              placeholder="Contoh: 081234567890"
              required
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              Alamat Lengkap
            </label>
            <textarea
              name="alamat"
              rows="3"
              value={formData.alamat}
              onChange={handleChange}
              placeholder="Masukkan alamat rumah / domisili pelanggan"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition resize-none"
            ></textarea>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white text-sm font-semibold rounded-xl shadow-lg transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? "Menyimpan..." : "Simpan Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}