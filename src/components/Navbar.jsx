import React from 'react';
import { LogOut } from 'lucide-react';

export default function Navbar() {
  const navItems = [
    { label: 'Dashboard', active: true },
    { label: 'Order', active: false },
    { label: 'Pesanan Online', active: false },
    { label: 'Customer', active: false },
    { label: 'Layanan', active: false },
    { label: 'Pengeluaran', active: false },
    { label: 'Laporan', active: false },
    { label: 'Pesan', active: false },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-8 py-3 flex justify-between items-center shadow-sm">
      <div className="text-xl font-semibold text-gray-800 tracking-wide">
        Fanara Laundry
      </div>

      <div className="flex items-center space-x-2">
        {navItems.map((item, index) => (
          <button
            key={index}
            className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${item.active
                ? 'bg-gray-200 text-gray-800'
                : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            {item.label}
          </button>
        ))}

        <button className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700 transition flex items-center gap-1.5 ml-2">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </nav>
  );
}