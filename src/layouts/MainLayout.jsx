import Sidebar from "../components/Sidebar";

function DashboardLayout({ children }) {
    return (
        <div className="flex min-h-screen bg-[#f4f8fb]">
            {/* Sidebar Kiri */}
            <Sidebar />

            {/* Konten Halaman Utama (Dashboard, Order, Customer, dll) */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto space-y-6">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default DashboardLayout;