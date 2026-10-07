import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Globe, 
  Users, 
  Shirt, 
  Receipt, 
  FileText, 
  MessageSquare, 
  UserCheck, 
  LogOut 
} from "lucide-react";

const menu = [
  { nama: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { nama: "Order", path: "/order", icon: ShoppingCart },
  { nama: "Pesan Online", path: "/pesan-online", icon: Globe },
  { nama: "Costumer", path: "/customer", icon: Users },
  { nama: "Layanan", path: "/layanan", icon: Shirt },
  { nama: "Pengeluaran", path: "/pengeluaran", icon: Receipt },
  { nama: "Laporan", path: "/laporan", icon: FileText },
  { nama: "Pesan", path: "/pesan", icon: MessageSquare },
  { nama: "User", path: "/users", icon: UserCheck },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <aside className="w-60 min-h-screen bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between">
      <div>
        {/* LOGO AREA */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 shrink-0">
            FL
          </div>
          <span className="font-bold text-base text-white tracking-wide leading-tight">
            Fanara <br /> Laundry
          </span>
        </div>

        {/* NAVIGATION MENU */}
        <nav className="p-3 space-y-1">
          {menu.map((m) => {
            const Icon = m.icon;
            return (
              <NavLink
                key={m.path}
                to={m.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{m.nama}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* LOGOUT BUTTON */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/60 transition"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}