import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* rute publik: homepage, login, dll. taruh di sini */}

        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* menu lain menyusul, sementara bisa pakai placeholder */}
          <Route path="/order" element={<h1 className="text-2xl font-bold">Order</h1>} />
          <Route path="/pesan-online" element={<h1 className="text-2xl font-bold">Pesan Online</h1>} />
          <Route path="/customer" element={<h1 className="text-2xl font-bold">Costumer</h1>} />
          <Route path="/layanan" element={<h1 className="text-2xl font-bold">Layanan</h1>} />
          <Route path="/pengeluaran" element={<h1 className="text-2xl font-bold">Pengeluaran</h1>} />
          <Route path="/laporan" element={<h1 className="text-2xl font-bold">Laporan</h1>} />
          <Route path="/pesan" element={<h1 className="text-2xl font-bold">Pesan</h1>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;