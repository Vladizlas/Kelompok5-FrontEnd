import React, { useState, useEffect } from "react";
import axios from "axios";

const UserModal = ({ isOpen, onClose, onRefresh, editData }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "kasir",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || "",
        email: editData.email || "",
        password: "",
        role: editData.role || "kasir",
      });
    } else {
      setFormData({ name: "", email: "", password: "", role: "kasir" });
    }
    setErrorMsg("");
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    // 1. Ambil token dari localStorage
    const token = localStorage.getItem("token");

    // 2. Jika token tidak ditemukan
    if (!token) {
      setErrorMsg("Token tidak tersedia. Silakan login kembali!");
      setLoading(false);
      return;
    }

    try {
      // 3. Tambahkan Authorization header
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (editData) {
        await axios.put(
          `http://localhost:3000/api/users/${editData.id}`,
          formData,
          config
        );
      } else {
        await axios.post("http://localhost:3000/api/users", formData, config);
      }

      onRefresh();
      onClose();
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Terjadi kesalahan pada server"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Header Modal */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {editData ? "Edit Data User" : "Tambah User Baru"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {editData
                ? "Perbarui informasi akun pengguna"
                : "Isi formulir untuk menambahkan akun baru"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-center gap-2">
              <span className="font-bold">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Nama Lengkap
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Masukkan nama lengkap"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 text-slate-800 text-sm rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="contoh@fanaralaundry.com"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 text-slate-800 text-sm rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Password{" "}
              {editData && (
                <span className="text-[10px] text-slate-400 lowercase font-normal">
                  (opsional)
                </span>
              )}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!editData}
              placeholder={
                editData
                  ? "•••••••• (Biarkan kosong jika tidak diubah)"
                  : "••••••••"
              }
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 text-slate-800 text-sm rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Role / Hak Akses
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 text-slate-800 text-sm rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all cursor-pointer"
            >
              <option value="kasir">Kasir</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                  Menyimpan...
                </span>
              ) : (
                "Simpan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;