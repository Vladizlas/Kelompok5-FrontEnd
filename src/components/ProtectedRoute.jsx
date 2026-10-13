import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles = [] }) => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");

    // Jika belum login
    if (!token) {
        return <Navigate to="/" replace />;
    }

    // Periksa data user
    let user;

    try {
        user = userString ? JSON.parse(userString) : null;
    } catch {
        user = null;
    }

    // Jika data user tidak tersedia
    if (!user) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        return <Navigate to="/" replace />;
    }

    // Jika role tidak diizinkan
    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    // Jika diizinkan
    return <Outlet />;
};

export default ProtectedRoute;