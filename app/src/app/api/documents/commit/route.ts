import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type LineItem = { sku: string; desc: string; qty: number; unit: string; total: string };

function validLineItem(item: LineItem): boolean {
  return Boolean(item?.sku?.trim()) && Number.isFinite(Number(item.qty)) && Number(item.qty) > 0;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as {
    transactionType?: "sale" | "purchase";
    date?: string;
    lineItems?: LineItem[];
  } | null;

  const transactionType = body?.transactionType ?? "sale";
  const date = body?.date;
  const lineItems = body?.lineItems ?? [];

  if (!/^d{4}-d{2}-d{2}$/.test(date ?? "")) {
    return NextResponse.json({ error: "Tanggal transaksi tidak valid" }, { status: 400 });
  }
  if (!["sale", "purchase"].includes(transactionType) || lineItems.length === 0 || !lineItems.every(validLineItem)) {
    return NextResponse.json({ error: "Data transaksi tidak lengkap" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const results: unknown[] = [];

  for (const item of lineItems) {
    const qty = Math.round(Number(item.qty));
    const numericUnit = Number(String(item.unit).replace(/[^d.-]/g, ""));
    const numericTotal = Number(String(item.total).replace(/[^d.-]/g, ""));
    const revenue = Number.isFinite(numericTotal) && numericTotal > 0
      ? numericTotal
      : Number.isFinite(numericUnit) && numericUnit > 0
        ? numericUnit * qty
        : 0;

    if (revenue <= 0) {
      return NextResponse.json({ error: `Nominal tidak valid untuk ${item.desc}` }, { status: 400 });
    }

    const { data, error } = await supabase.rpc("record_smesh_transaction", {
      p_product_id: item.sku,
      p_quantity: qty,
      p_revenue: revenue,
      p_transaction_date: date,
      p_transaction_type: transactionType,
    });

    if (error) {
      console.error("[/api/documents/commit] Supabase mutation failed:", error);
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    results.push(data);
  }

  return NextResponse.json({
    ok: true,
    transactionType,
    date,
    items: results.length,
    results,
  });
}
