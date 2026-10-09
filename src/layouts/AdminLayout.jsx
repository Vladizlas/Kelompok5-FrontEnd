import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function AdminLayout() {
  const savedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = savedUser
      ? JSON.parse(savedUser)
      : null;
  } catch (error) {
    console.error(
      "Gagal membaca data user:",
      error
    );

    user = null;
  }

  return (
    <div className="flex bg-white min-h-screen">
      <Sidebar user={user} />

      <main className="flex-1 bg-white p-6 overflow-y-auto">
        <Outlet context={{ user }} />
      </main>
    </div>
  );
}