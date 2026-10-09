import { NavLink, useNavigate } from "react-router-dom";

const menu = [
  { nama: "Dashboard", path: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { nama: "Order", path: "/order", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
  { nama: "Pesan Online", path: "/pesan-online", icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" },
  { nama: "Customer", path: "/customer", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
  { nama: "Layanan", path: "/layanan", icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" },
  { nama: "Pengeluaran", path: "/pengeluaran", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" },
  { nama: "Laporan", path: "/laporan", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { nama: "User", path: "/users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Hapus token & user dari storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirect ke halaman login
    navigate("/login");
  };

  return (
    <aside className="w-64 h-screen sticky top-0 bg-gradient-to-r from-sky-500 to-blue-600 border-r border-sky-100 flex flex-col justify-between shrink-0">
      <div>
        {/* Logo & Brand Header */}
        <div className="p-6 border-b border-sky-400/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-md border border-white/20 shrink-0">
            {/* IKON MESIN CUCI (WASHING MACHINE) */}
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {/* Bodi Utama Mesin Cuci */}
              <rect x="4" y="3" width="16" height="18" rx="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              {/* Tabung Tengah (Pintu Kaca) */}
              <circle cx="12" cy="13" r="4" strokeWidth="2" />
              {/* Gelombang Air / Baju Didalam Tabung */}
              <path d="M10 13c1-1 3-1 4 0" strokeWidth="1.8" strokeLinecap="round" />
              {/* Tombol Kontrol Atas */}
              <circle cx="8" cy="6.5" r="1" fill="currentColor" />
              <circle cx="11" cy="6.5" r="1" fill="currentColor" />
              <line x1="14" y1="6.5" x2="16" y2="6.5" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h1 className="font-extrabold text-base text-white leading-tight">
              Fanara <span className="text-sky-200">Laundry</span>
            </h1>
            <span className="text-[10px] font-semibold tracking-wider text-sky-700 bg-white/90 px-2 py-0.5 rounded-full uppercase shadow-sm">
              Admin Panel
            </span>
          </div>
        </div>

        {/* Menu Navigasi */}
        <nav className="p-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold text-sky-100/70 uppercase tracking-wider">
            Menu Utama
          </div>
          {menu.map((m) => (
            <NavLink
              key={m.path}
              to={m.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                  ? "bg-white text-sky-600 shadow-md shadow-sky-900/10"
                  : "text-white/90 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <svg
                    className={`w-5 h-5 transition-colors ${isActive ? "text-sky-600" : "text-sky-100"
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d={m.icon}
                    />
                  </svg>
                  <span>{m.nama}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Tombol Logout */}
      <div className="p-4 border-t border-sky-400/30 bg-blue-700/20 backdrop-blur-sm">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-rose-600 bg-white hover:bg-rose-50 border border-rose-100 rounded-xl transition-all duration-200 shadow-sm"
        >
          <svg
            className="w-4 h-4 text-rose-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}