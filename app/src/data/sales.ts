import type { Sale } from "@/types/business";
import { PRODUCTS } from "@/data/products";

// Deterministic demo sales history — Agustus 2026 (31 hari), Toko Sejahtera.
// No Math.random(): every number below is a pure function of the day index
// and per-product config, so re-running the app always yields identical
// business metrics.

export const SALES_YEAR = 2026;
export const SALES_MONTH = 8; // Agustus
export const SALES_DAYS = 31;
export const TODAY = "2026-08-31";

type ProductSalesConfig = {
  baseUnitsPerDay: number;
  /** fractional change from day 1 to day 31, e.g. 0.35 = +35% by month end */
  trendOverMonth: number;
};

// Kopi Arabica trending up (drives overall growth / best seller). Susu Oat
// trending down (declining product, used by the "kenapa turun" scenario).
const SALES_CONFIG: Record<string, ProductSalesConfig> = {
  "kopi-arabica": { baseUnitsPerDay: 18, trendOverMonth: 0.35 },
  "kopi-robusta": { baseUnitsPerDay: 14, trendOverMonth: 0.0 },
  "gula-aren": { baseUnitsPerDay: 10, trendOverMonth: 0.05 },
  "susu-oat": { baseUnitsPerDay: 8, trendOverMonth: -0.3 },
  "choco-powder": { baseUnitsPerDay: 6, trendOverMonth: 0.0 },
  "teh-hijau": { baseUnitsPerDay: 9, trendOverMonth: 0.15 },
  "madu-hutan": { baseUnitsPerDay: 4, trendOverMonth: -0.05 },
};

// Indexed by Date#getUTCDay(): 0=Min ... 6=Sab.
const WEEKDAY_MULTIPLIER = [0.9, 1.0, 1.05, 0.95, 1.1, 1.2, 1.3];

const BASKET_PATTERN = [1, 2, 1, 3, 2, 1, 2, 1, 2, 3];

function splitIntoOrderSizes(quantity: number, seed: number): number[] {
  const sizes: number[] = [];
  let remaining = quantity;
  let i = seed;
  while (remaining > 0) {
    const size = Math.min(BASKET_PATTERN[i % BASKET_PATTERN.length], remaining);
    sizes.push(size);
    remaining -= size;
    i++;
  }
  return sizes;
}

function dateStringForDay(day: number): string {
  return `${SALES_YEAR}-${String(SALES_MONTH).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function generateSales(): Sale[] {
  const sales: Sale[] = [];

  PRODUCTS.forEach((product, productIndex) => {
    const config = SALES_CONFIG[product.id];
    if (!config) return;

    for (let day = 1; day <= SALES_DAYS; day++) {
      const dow = new Date(Date.UTC(SALES_YEAR, SALES_MONTH - 1, day)).getUTCDay();
      const trendFactor = 1 + config.trendOverMonth * ((day - 1) / (SALES_DAYS - 1));
      const rawQty = config.baseUnitsPerDay * WEEKDAY_MULTIPLIER[dow] * trendFactor;
      const qty = Math.max(0, Math.round(rawQty));
      if (qty === 0) continue;

      const soldAt = dateStringForDay(day);
      const orderSizes = splitIntoOrderSizes(qty, productIndex + day);

      orderSizes.forEach((size, orderIndex) => {
        sales.push({
          id: `${product.id}-${soldAt}-${orderIndex}`,
          productId: product.id,
          quantity: size,
          revenue: size * product.price,
          soldAt,
        });
      });
    }
  });

  return sales;
}

export const SALES: Sale[] = generateSales();
