import Login from "./pages/Login";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Layanan from "./pages/Layanan";
import { dummyAdmin } from "./pages/dummyUser";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route
            path="/order"
            element={
              <h1 className="text-2xl font-bold">
                Order
              </h1>
            }
          />

          <Route
  path="/layanan"
  element={<Layanan user={dummyAdmin} />}
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
                Costumer
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
