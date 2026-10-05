export const ringkasan = {
  orderHariIni: 12,
};

export const statusPesanan = [
  { label: "Diproses", jumlah: 5, warna: "text-warning" },
  { label: "Selesai (Belum Diambil)", jumlah: 4, warna: "text-info" },
  { label: "Sudah Diambil", jumlah: 3, warna: "text-success" },
];

export const laporanPesanan = [
  { invoice: "INV-0101", tanggal: "2026-10-05", customer: "Budi Santoso", layanan: "Cuci Lipat", total: 35000, pembayaran: "Cash", status: "Diambil" },
  { invoice: "INV-0102", tanggal: "2026-10-05", customer: "Siti Aminah", layanan: "Cuci Gosok", total: 36000, pembayaran: "Transfer", status: "Selesai" },
  { invoice: "INV-0103", tanggal: "2026-10-05", customer: "Andi Wijaya", layanan: "Gosok", total: 24000, pembayaran: "QR", status: "Diproses" },
  { invoice: "INV-0104", tanggal: "2026-10-04", customer: "Dewi Lestari", layanan: "Cuci Lipat", total: 42000, pembayaran: "Cash", status: "Diambil" },
  { invoice: "INV-0105", tanggal: "2026-10-04", customer: "Rudi Hartono", layanan: "Cuci Gosok", total: 24000, pembayaran: "Transfer", status: "Selesai" },
  { invoice: "INV-0106", tanggal: "2026-10-03", customer: "Rina Marlina", layanan: "Cuci Lipat", total: 28000, pembayaran: "QR", status: "Diambil" },
];