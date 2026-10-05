import React from 'react';
import StatCard from './StatCard';

export default function SummaryCards() {
    const topStats = [
        { label: 'Order hari ini', value: '0', colorClass: 'text-gray-900' },
        { label: 'Uang masuk', value: 'Rp 0', colorClass: 'text-green-600' },
        { label: 'Uang keluar', value: 'Rp 0', colorClass: 'text-red-600' },
        { label: 'Laba bersih', value: 'Rp 0', colorClass: 'text-gray-900' },
    ];

    const bottomStats = [
        { label: 'Diproses', value: '0', colorClass: 'text-gray-900' },
        { label: 'Selesai, menunggu diambil', value: '1', colorClass: 'text-amber-600' },
        { label: 'Sudah diambil', value: '0', colorClass: 'text-green-600' },
    ];

    return (
        <div className="space-y-4 mb-6">
            {/* Baris Atas: 4 Kartu Ringkasan Keuangan */}
            <div className="grid grid-cols-4 gap-4">
                {topStats.map((stat, idx) => (
                    <StatCard key={idx} label={stat.label} value={stat.value} colorClass={stat.colorClass} />
                ))}
            </div>

            {/* Baris Bawah: 3 Kartu Ringkasan Status Cucian */}
            <div className="grid grid-cols-3 gap-4">
                {bottomStats.map((stat, idx) => (
                    <StatCard key={idx} label={stat.label} value={stat.value} colorClass={stat.colorClass} />
                ))}
            </div>
        </div>
    );
}