import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { validateCommitRequest, resolveLineItemRevenue, type LineItem } from "@/lib/documentTransaction";

export type CommitResult = {
  sale_id: string | null;
  product_id: string;
  quantity: number;
  revenue: number;
  transaction_type: "sale" | "purchase";
  date: string;
  new_stock: number;
};

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    transactionType?: "sale" | "purchase";
    date?: string;
    lineItems?: LineItem[];
  } | null;

  const validated = validateCommitRequest(body);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }
  const { transactionType, date, lineItems } = validated.payload;

  const supabase = getSupabaseServerClient();
  const results: CommitResult[] = [];

  for (const item of lineItems) {
    const qty = Math.round(Number(item.qty));
    const revenue = resolveLineItemRevenue(item, qty);

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
    results.push(data as CommitResult);
  }

  return NextResponse.json({
    ok: true,
    transactionType,
    date,
    items: results.length,
    results,
  });
}
