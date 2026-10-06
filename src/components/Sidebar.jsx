import { NavLink, useNavigate } from "react-router-dom";

const menu = [
  { nama: "Dashboard", path: "/dashboard" },
  { nama: "Order", path: "/order" },
  { nama: "Pesan Online", path: "/pesan-online" },
  { nama: "Costumer", path: "/customer" },
  { nama: "Layanan", path: "/layanan" },
  { nama: "Pengeluaran", path: "/pengeluaran" },
  { nama: "Laporan", path: "/laporan" },
  { nama: "Pesan", path: "/pesan" },
  { nama: "User", path: "/users" },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // sesuaikan dengan key token di project kamu
    navigate("/login");
  };

  return (
    <aside className="w-60 min-h-screen bg-base-100 border-r flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b flex flex-col gap-2">
        <div className="w-14 h-14 border-2 rounded flex items-center justify-center text-xs text-gray-400">
          Logo
        </div>
        <span className="font-bold text-lg leading-tight">
          Fanara <br /> Laundry
        </span>
      </div>

      {/* Menu */}
      <ul className="menu p-3 flex-1 gap-1">
        {menu.map((m) => (
          <li key={m.path}>
            <NavLink
              to={m.path}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {m.nama}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Log out */}
      <div className="p-4">
        <button onClick={handleLogout} className="btn btn-outline btn-error w-full">
          Log out
        </button>
      </div>
    </aside>
  );
}