export const mockExtraction = {
  documentType: "Sales Receipt",
  confidence: 0.97,
  fields: [
    { label: "Document No.", value: "SALE-2026-08-31-001" },
    { label: "Transaction Date", value: "31 Agustus 2026" },
    { label: "Customer", value: "Pelanggan Toko Sejahtera" },
    { label: "Currency", value: "IDR" },
    { label: "Total Amount", value: "Rp135.000" },
  ],
  lineItems: [
    { sku: "kopi-arabica", desc: "Kopi Arabica 250g", qty: 2, unit: "Rp45.000", total: "Rp90.000" },
    { sku: "gula-aren", desc: "Gula Aren 500g", qty: 1, unit: "Rp28.000", total: "Rp28.000" },
    { sku: "teh-hijau", desc: "Teh Hijau 100g", qty: 1, unit: "Rp25.000", total: "Rp25.000" },
  ],
};

export const mockWarehouseStock = [
  { gudang: "Cikarang - Gudang A", inbound: 1240, outbound: 980, stok: 8420 },
  { gudang: "Cikarang - Gudang B (BMW)", inbound: 610, outbound: 540, stok: 3110 },
  { gudang: "Surabaya - Gudang C", inbound: 890, outbound: 760, stok: 5280 },
];

// Per-gudang breakdown so the dashboard bar chart can cross-filter by
// warehouse. Summed across gudang per hari, these roughly reproduce the
// combined weekly trend previously hardcoded here.
export const mockWeeklyTrend = [
  { hari: "Sen", gudang: "Cikarang - Gudang A", masuk: 95, keluar: 80 },
  { hari: "Sen", gudang: "Cikarang - Gudang B (BMW)", masuk: 47, keluar: 40 },
  { hari: "Sen", gudang: "Surabaya - Gudang C", masuk: 68, keluar: 60 },

  { hari: "Sel", gudang: "Cikarang - Gudang A", masuk: 118, keluar: 82 },
  { hari: "Sel", gudang: "Cikarang - Gudang B (BMW)", masuk: 58, keluar: 45 },
  { hari: "Sel", gudang: "Surabaya - Gudang C", masuk: 84, keluar: 63 },

  { hari: "Rab", gudang: "Cikarang - Gudang A", masuk: 86, keluar: 96 },
  { hari: "Rab", gudang: "Cikarang - Gudang B (BMW)", masuk: 42, keluar: 52 },
  { hari: "Rab", gudang: "Surabaya - Gudang C", masuk: 62, keluar: 72 },

  { hari: "Kam", gudang: "Cikarang - Gudang A", masuk: 136, keluar: 108 },
  { hari: "Kam", gudang: "Cikarang - Gudang B (BMW)", masuk: 67, keluar: 59 },
  { hari: "Kam", gudang: "Surabaya - Gudang C", masuk: 97, keluar: 83 },

  { hari: "Jum", gudang: "Cikarang - Gudang A", masuk: 109, keluar: 91 },
  { hari: "Jum", gudang: "Cikarang - Gudang B (BMW)", masuk: 53, keluar: 50 },
  { hari: "Jum", gudang: "Surabaya - Gudang C", masuk: 78, keluar: 69 },

  { hari: "Sab", gudang: "Cikarang - Gudang A", masuk: 54, keluar: 43 },
  { hari: "Sab", gudang: "Cikarang - Gudang B (BMW)", masuk: 27, keluar: 24 },
  { hari: "Sab", gudang: "Surabaya - Gudang C", masuk: 39, keluar: 33 },

  { hari: "Min", gudang: "Cikarang - Gudang A", masuk: 27, keluar: 22 },
  { hari: "Min", gudang: "Cikarang - Gudang B (BMW)", masuk: 13, keluar: 12 },
  { hari: "Min", gudang: "Surabaya - Gudang C", masuk: 20, keluar: 16 },
];
