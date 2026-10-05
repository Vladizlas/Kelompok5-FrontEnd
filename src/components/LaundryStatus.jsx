import React, { useState } from 'react';

export default function LaundryStatus() {
    const [activeTab, setActiveTab] = useState('diproses');

    const tabs = [
        { id: 'diproses', label: 'Diproses (0)' },
        { id: 'selesai', label: 'Selesai (siap diambil) (1)' },
        { id: 'diambil', label: 'Sudah diambil (0)' },
    ];

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Status cucian</h3>

            {/* Tab Filter */}
            <div className="flex border-b border-gray-200 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tabel Data */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 text-gray-600">
                            <th className="pb-3 font-semibold w-1/5">Invoice</th>
                            <th className="pb-3 font-semibold w-1/5">Customer</th>
                            <th className="pb-3 font-semibold w-1/5">Layanan</th>
                            <th className="pb-3 font-semibold w-1/5">Tanggal</th>
                            <th className="pb-3 font-semibold w-1/5">Bayar</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan="5" className="text-center py-12 text-gray-400 font-normal">
                                Tidak ada cucian pada status ini.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}