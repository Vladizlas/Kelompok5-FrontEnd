import { BrowserRouter, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import AdminLayout from "./layouts/AdminLayout";

import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Layanan from "./pages/Layanan";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* ADMIN AREA */}
        <Route element={<AdminLayout />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/order"
            element={
              <h1 className="text-2xl font-bold">
                Order
              </h1>
            }
          />

          <Route
            path="/pesan-online"
            element={
              <h1 className="text-2xl font-bold">
                Pesan Online
              </h1>
            }
          />

          <Route
            path="/customer"
            element={
              <h1 className="text-2xl font-bold">
                Customer
              </h1>
            }
          />

          <Route
            path="/layanan"
            element={<Layanan />}
          />

          <Route
            path="/pengeluaran"
            element={
              <h1 className="text-2xl font-bold">
                Pengeluaran
              </h1>
            }
          />

          <Route
            path="/laporan"
            element={
              <h1 className="text-2xl font-bold">
                Laporan
              </h1>
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
