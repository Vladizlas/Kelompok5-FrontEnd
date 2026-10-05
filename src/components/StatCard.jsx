import React from 'react';

export default function StatCard({ label, value, colorClass = "text-gray-900" }) {
    return (
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between">
            <span className="text-xs text-gray-500 font-medium mb-3">{label}</span>
            <span className={`text-2xl font-bold ${colorClass}`}>{value}</span>
        </div>
    );
}