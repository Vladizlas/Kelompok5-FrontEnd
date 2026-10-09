import { useState, useEffect } from "react";
import axios from "axios";
import UserModal from "../components/UserModal";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // 1. Ambil token dari localStorage
      const token = localStorage.getItem("token");

      // 2. Kirim request dengan Authorization Header
      const response = await axios.get("http://localhost:3000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const dataArray = Array.isArray(response.data)
        ? response.data
        : response.data.data;
      setUsers(dataArray || []);
    } catch (error) {
      console.error("Gagal mengambil data user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAddModal = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus user ini?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:3000/api/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchUsers();
      } catch (error) {
        alert(
          "Gagal menghapus user: " +
          (error.response?.data?.message || error.message)
        );
      }
    }
  };

  // Helper warna badge role
  const getRoleBadge = (role) => {
    const r = (role || "kasir").toLowerCase();

    if (r === "owner") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold capitalize tracking-wide bg-purple-50 text-purple-700 border border-purple-200">
          {role}
        </span>
      );
    }

    if (r === "admin") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold capitalize tracking-wide bg-sky-50 text-sky-700 border border-sky-200">
          {role}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold capitalize tracking-wide bg-slate-100 text-slate-700 border border-slate-200">
        {role || "kasir"}
      </span>
    );
  };

  return (
    <div className="w-full min-h-screen bg-white p-6 lg:p-8 space-y-6 text-slate-800">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-sky-500 to-blue-600 p-6 rounded-2xl shadow-lg shadow-sky-500/15 text-white">
        <div>
          <h1 className="text-2xl font-black tracking-tight">
            Manajemen User
          </h1>
          <p className="text-xs font-medium text-sky-100 mt-1">
            Kelola akun admin dan kasir Fanara Laundry
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-white text-sky-600 hover:bg-sky-50 font-bold px-4 py-2.5 rounded-xl shadow-sm transition duration-200 text-xs flex items-center justify-center gap-2 w-fit"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Tambah User</span>
        </button>
      </div>

      {/* Container Tabel */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sky-50/50 border-b border-sky-100 text-sky-900 text-[11px] font-bold tracking-wider uppercase">
                <th className="py-3.5 px-4 font-semibold">NAMA</th>
                <th className="py-3.5 px-4 font-semibold">EMAIL</th>
                <th className="py-3.5 px-4 font-semibold">ROLE</th>
                <th className="py-3.5 px-4 font-semibold text-center w-32">
                  AKSI
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-sky-600">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-medium text-slate-500">
                        Memuat data user...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="py-12 text-center text-slate-400 font-medium text-xs"
                  >
                    Belum ada data user.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-sky-50/20 transition duration-150"
                  >
                    <td className="py-4 px-4 font-bold text-slate-800">
                      {user.name}
                    </td>
                    <td className="py-4 px-4 text-xs font-medium text-slate-600 font-mono">
                      {user.email}
                    </td>
                    <td className="py-4 px-4">{getRoleBadge(user.role)}</td>
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold px-2.5 py-1.5 rounded-lg transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold px-2.5 py-1.5 rounded-lg transition"
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
      </div>

      {/* Modal Popup */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={fetchUsers}
        editData={selectedUser}
      />
    </div>
  );
};

export default Users;