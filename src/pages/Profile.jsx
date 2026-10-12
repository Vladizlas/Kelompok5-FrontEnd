import { useState } from "react";
import axios from "axios";
import { UserRound, Mail, ShieldCheck, Pencil, X } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.nama || user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const role = (user.role || "").toLowerCase();

  const displayRole = role
    ? role.charAt(0).toUpperCase() + role.slice(1)
    : "-";

  const displayName = user.nama || user.name || "-";

  const handleCancel = () => {
    setName(user.nama || user.name || "");
    setEmail(user.email || "");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setMessage("");
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password baru tidak cocok.");
      return;
    }

    if (newPassword && !currentPassword) {
      setError("Masukkan password saat ini.");
      return;
    }

    const payload = {
      nama: name.trim(),
      email: email.trim(),
    };

    if (newPassword) {
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.put(
        "http://localhost:3000/api/auth/profile",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedUser = response.data.data?.user;

      if (!updatedUser) {
        throw new Error("Respons data profil tidak ditemukan.");
      }

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setName(updatedUser.nama || updatedUser.name || "");
      setEmail(updatedUser.email || "");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsEditing(false);
      setMessage("Profil berhasil diperbarui.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Gagal memperbarui profil."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8 text-slate-800">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white">
          <h1 className="text-2xl font-black">Profil Saya</h1>
          <p className="text-sm text-sky-100 mt-1">
            Informasi akun Fanara Laundry.
          </p>
        </div>

        {/* Pesan berhasil */}
        {message && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
            {message}
          </div>
        )}

        {/* Pesan error */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}

        {!isEditing ? (
          /* MODE LIHAT PROFIL */
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

            <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                <UserRound size={40} strokeWidth={1.6} />
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-extrabold break-words">
                  {displayName}
                </h2>

                <p className="text-sm text-slate-500 mt-1 break-all">
                  {user.email || "-"}
                </p>

                <span className="inline-flex mt-3 px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold">
                  {displayRole}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setName(user.nama || user.name || "");
                  setEmail(user.email || "");
                  setError("");
                  setMessage("");
                  setIsEditing(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold transition"
              >
                <Pencil size={16} />
                Edit Profil
              </button>
            </div>

            <div className="border-t border-slate-100 p-6 sm:p-8 space-y-5">
              <h3 className="font-bold text-slate-800">
                Informasi Akun
              </h3>

              <div className="flex items-start gap-3">
                <UserRound size={20} className="text-sky-500 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Nama Lengkap</p>
                  <p className="text-sm font-semibold mt-1">
                    {displayName}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail size={20} className="text-sky-500 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm font-semibold mt-1 break-all">
                    {user.email || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck size={20} className="text-sky-500 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Role Akun</p>
                  <p className="text-sm font-semibold mt-1">
                    {displayRole}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* MODE EDIT PROFIL */
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold">
                  Edit Profil
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Ubah informasi akun kamu.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCancel}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="Batal mengedit"
              >
                <X size={20} />
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Masukkan nama lengkap"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Masukkan email"
              />
            </div>

            <div className="border-t border-slate-100 pt-5">
              <h3 className="font-bold">Ganti Password</h3>
              <p className="text-xs text-slate-500 mt-1">
                Kosongkan jika tidak ingin mengganti password.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Password Saat Ini
              </label>
              <input
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Password saat ini"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Password Baru
              </label>
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Minimal 8 karakter"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Konfirmasi Password Baru
              </label>
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Ulangi password baru"
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm disabled:opacity-50"
              >
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}