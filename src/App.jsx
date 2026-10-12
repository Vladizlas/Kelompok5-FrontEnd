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
import Profile from "./pages/Profile";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Halaman publik */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Owner, Admin, dan Kasir */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={["owner", "admin", "kasir"]}
            />
          }
        >

          
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/order" element={<Order />} />
            <Route path="/pesan-online" element={<PesanOnline />} />
            <Route path="/customer" element={<Customer />} />
            <Route path="/layanan" element={<Layanan />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Owner dan Admin */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["owner", "admin"]} />
          }
        >
          <Route element={<AdminLayout />}>
            <Route path="/pengeluaran" element={<Pengeluaran />} />
            <Route path="/users" element={<Users />} />
          </Route>
        </Route>

        {/* Khusus Owner */}
        <Route
          element={<ProtectedRoute allowedRoles={["owner"]} />}
        >
          <Route element={<AdminLayout />}>
            <Route path="/laporan" element={<Report />} />
          </Route>
        </Route>

        {/* Halaman tidak ditemukan */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;