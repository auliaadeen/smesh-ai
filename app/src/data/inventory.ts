import type { Inventory } from "@/types/business";

// Intentionally seeded so 4 products sit at/below minimumStock — matches
// the spec's worked example ("4 produk mendekati minimum stock").
export const INVENTORY: Inventory[] = [
  { productId: "kopi-arabica", stock: 25, minimumStock: 30, targetStock: 100 }, // best seller, low
  { productId: "kopi-robusta", stock: 60, minimumStock: 20, targetStock: 80 },
  { productId: "gula-aren", stock: 15, minimumStock: 20, targetStock: 60 }, // low
  { productId: "susu-oat", stock: 50, minimumStock: 15, targetStock: 60 },
  { productId: "choco-powder", stock: 4, minimumStock: 10, targetStock: 40 }, // critical
  { productId: "teh-hijau", stock: 45, minimumStock: 15, targetStock: 50 },
  { productId: "madu-hutan", stock: 9, minimumStock: 10, targetStock: 30 }, // low
];
