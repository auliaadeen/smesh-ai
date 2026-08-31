import type { Product } from "@/types/business";

// Demo UMKM: Toko Sejahtera — toko bahan kopi & minuman rumahan.
export const PRODUCTS: Product[] = [
  { id: "kopi-arabica", name: "Kopi Arabica 250g", category: "Kopi", price: 45000, cost: 28000, active: true },
  { id: "kopi-robusta", name: "Kopi Robusta 250g", category: "Kopi", price: 32000, cost: 20000, active: true },
  { id: "gula-aren", name: "Gula Aren 500g", category: "Pemanis", price: 28000, cost: 18000, active: true },
  { id: "susu-oat", name: "Susu Oat 1L", category: "Minuman", price: 38000, cost: 25000, active: true },
  { id: "choco-powder", name: "Chocolate Powder 250g", category: "Bahan", price: 42000, cost: 27000, active: true },
  { id: "teh-hijau", name: "Teh Hijau 100g", category: "Teh", price: 25000, cost: 15000, active: true },
  { id: "madu-hutan", name: "Madu Hutan 250ml", category: "Pemanis", price: 55000, cost: 35000, active: true },
];
