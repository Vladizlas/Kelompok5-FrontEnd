import Login from './pages/Login';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users'; // Tambahkan baris import ini

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path='/users' element={<Users/>}/>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/order" element={<h1 className="text-2xl font-bold">Order</h1>} />
          <Route path="/pesan-online" element={<h1 className="text-2xl font-bold">Pesan Online</h1>} />
          <Route path="/customer" element={<h1 className="text-2xl font-bold">Costumer</h1>} />
          <Route path="/layanan" element={<h1 className="text-2xl font-bold">Layanan</h1>} />
          <Route path="/pengeluaran" element={<h1 className="text-2xl font-bold">Pengeluaran</h1>} />
          <Route path="/laporan" element={<h1 className="text-2xl font-bold">Laporan</h1>} />
          <Route path="/pesan" element={<h1 className="text-2xl font-bold">Pesan</h1>} />
          <Route path="/users" element={<h1 className="text-2xl font-bold">User</h1>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;