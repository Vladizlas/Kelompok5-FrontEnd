import { NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Smartphone,
  Users,
  FlaskConical,
  Wallet,
  FileBarChart,
  UserRound,
  LogOut,
  WashingMachine,
  House,
} from "lucide-react";

const menu = [
  {
    nama: "Dashboard",
    path: "/dashboard",
    icon: House,
  },
  {
    nama: "Order",
    path: "/order",
    icon: ShoppingBag,
  },
  {
    nama: "Pesan Online",
    path: "/pesan-online",
    icon: Smartphone,
  },
  {
    nama: "Customer",
    path: "/customer",
    icon: Users,
  },
  {
    nama: "Layanan",
    path: "/layanan",
    icon: FlaskConical,
  },
  {
    nama: "Pengeluaran",
    path: "/pengeluaran",
    icon: Wallet,
  },
  {
    nama: "Laporan",
    path: "/laporan",
    icon: FileBarChart,
  },
  {
    nama: "User",
    path: "/users",
    icon: UserRound,
  },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="w-64 h-screen sticky top-0 bg-gradient-to-r from-sky-500 to-blue-600 border-r border-sky-100 flex flex-col justify-between shrink-0">
      <div>
        {/* Logo & Brand Header */}
        <div className="p-6 border-b border-sky-400/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-md border border-white/20 shrink-0">
            <WashingMachine
              size={24}
              strokeWidth={1.8}
            />
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

          {menu.map((m) => {
            const Icon = m.icon;

            return (
              <NavLink
                key={m.path}
                to={m.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-white text-sky-600 shadow-md shadow-sky-900/10"
                      : "text-white/90 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={20}
                      strokeWidth={1.8}
                      className={`shrink-0 transition-colors ${
                        isActive ? "text-sky-600" : "text-sky-100"
                      }`}
                    />

                    <span>{m.nama}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Tombol Logout */}
      <div className="p-4 border-t border-sky-400/30 bg-blue-700/20 backdrop-blur-sm">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-rose-600 bg-white hover:bg-rose-50 border border-rose-100 rounded-xl transition-all duration-200 shadow-sm"
        >
          <LogOut
            size={16}
            strokeWidth={2}
            className="text-rose-500"
          />

          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}