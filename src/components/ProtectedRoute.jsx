import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
    // Cek apakah token autentikasi ada di localStorage
    const token = localStorage.getItem("token");

    // Jika token tidak ada, arahkan (redirect) pengguna ke halaman login
    if (!token) {
        return <Navigate to="/" replace />;
    }

    // Jika token ada, tampilkan halaman/komponen anak (Outlet)
    return <Outlet />;
};

export default ProtectedRoute;