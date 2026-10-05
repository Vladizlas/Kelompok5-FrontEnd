import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function AdminLayout() {
  return (
    <div className="flex bg-base-200 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}