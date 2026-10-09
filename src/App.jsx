import { BrowserRouter, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import AdminLayout from "./layouts/AdminLayout";

import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Layanan from "./pages/Layanan";
import Order from "./pages/Order";
import Customer from "./pages/Customer";
import Pengeluaran from "./pages/Pengeluaran";
import Home from "./pages/Home";
import Report from "./pages/Laporan";
import PesanOnline from "./pages/PesanOnline";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/"
          element={<Home />}
        />

        {/* ADMIN AREA */}
        <Route element={<AdminLayout />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/order"
            element={<Order />}
          />

          <Route
            path="/pesan-online"
            element={<PesanOnline />}
          />

          <Route
            path="/customer"
            element={<Customer />}
          />

          <Route
            path="/layanan"
            element={<Layanan />}
          />

          <Route
            path="/pengeluaran"
            element={<Pengeluaran />}
          />

          <Route
            path="/laporan"
            element={<Report/>
            }
          />

          <Route
            path="/pesan"
            element={
              <h1 className="text-2xl font-bold">
                Pesan
              </h1>
            }
          />

          <Route
            path="/users"
            element={<Users />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;