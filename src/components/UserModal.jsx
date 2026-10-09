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

    try {
      const token = localStorage.getItem("token");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-md overflow-hidden my-8 text-slate-800">

        {/* Header Modal */}
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-6 text-white flex justify-between items-start">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">
              {editData ? "Edit Data User" : "Tambah User Baru"}
            </h2>
            <p className="text-xs text-sky-100 font-medium mt-1">
              {editData
                ? "Perbarui informasi akun pengguna"
                : "Isi formulir untuk menambahkan akun baru"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg text-xs font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between">
              <span>⚠️ {errorMsg}</span>
              <button
                type="button"
                onClick={() => setErrorMsg("")}
                className="text-rose-500 hover:text-rose-800 font-bold ml-2"
              >
                ✕
              </button>
            </div>
          )}

          {/* Nama Lengkap */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Masukkan nama lengkap"
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="contoh@fanaralaundry.com"
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password{" "}
              {editData && (
                <span className="text-[10px] text-slate-400 font-normal">
                  (biarkan kosong jika tidak diubah)
                </span>
              )}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!editData}
              placeholder={editData ? "•••••••• (opsional)" : "••••••••"}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
            />
          </div>

          {/* Role / Hak Akses */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Role / Hak Akses
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition cursor-pointer"
            >
              <option value="kasir">Kasir</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex justify-end items-center gap-2 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-sky-500/20 transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Menyimpan...</span>
                </>
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