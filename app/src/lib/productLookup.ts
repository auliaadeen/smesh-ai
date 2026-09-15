import type { Product, Inventory, ProductStatus } from "@/types/business";
import { isLowStock } from "@/lib/analytics";

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

/**
 * Deterministic exact-first product lookup shared by both repository
 * implementations. Never fuzzy/typo-matches an unrelated product: an
 * unknown or ambiguous query returns null so the caller must say "not
 * found" instead of guessing (Batch 2.1 Q7 — SMESH-XYZ must never resolve
 * to Kopi Arabica or any other real product).
 */
export function findProduct(query: string, products: Product[]): Product | null {
  const q = normalize(query);
  if (!q) return null;

  const exact = products.filter((p) => normalize(p.id) === q || normalize(p.name) === q);
  if (exact.length === 1) return exact[0];
  if (exact.length > 1) return null;

  const qAsId = q.replace(/\s+/g, "-");
  const partial = products.filter(
    (p) => normalize(p.name).includes(q) || normalize(p.id).includes(qAsId)
  );
  return partial.length === 1 ? partial[0] : null;
}

export function buildProductStatus(product: Product, inventory: Inventory[]): ProductStatus {
  const inv = inventory.find((i) => i.productId === product.id);
  const currentStock = inv?.stock ?? 0;
  const minimumStock = inv?.minimumStock ?? 0;
  const targetStock = inv?.targetStock ?? 0;

  return {
    productId: product.id,
    productName: product.name,
    category: product.category,
    price: product.price,
    active: product.active,
    currentStock,
    minimumStock,
    targetStock,
    isLowStock: inv ? isLowStock(inv) : false,
  };
}
