import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import AdminLayout from "./layouts/AdminLayout";

import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Layanan from "./pages/Layanan";
import Order from "./pages/Order";
import Customer from "./pages/Customer";
import Pengeluaran from "./pages/Pengeluaran";
import Home from "./pages/Home";
import PesanOnline from "./pages/PesanOnline";
import Report from "./pages/Report";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rute Publik */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* 1. DIAKSES SEMUA ROLE (Kasir, Admin, Owner) */}
        <Route element={<ProtectedRoute allowedRoles={["kasir", "admin", "owner"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/order" element={<Order />} />
            <Route path="/pesan-online" element={<PesanOnline />} />
            <Route path="/customer" element={<Customer />} />
            <Route path="/layanan" element={<Layanan />} /> {/* Kasir hanya melihat */}
          </Route>
        </Route>

        {/* 2. KHUSUS ADMIN & OWNER (Kasir tidak bisa akses) */}
        <Route element={<ProtectedRoute allowedRoles={["admin", "owner"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/pengeluaran" element={<Pengeluaran />} />
            <Route path="/laporan" element={<Report />} />
          </Route>
        </Route>

        {/* 3. KHUSUS OWNER */}
        <Route element={<ProtectedRoute allowedRoles={["owner"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/users" element={<Users />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;