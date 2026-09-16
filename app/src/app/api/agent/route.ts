import { NextRequest, NextResponse } from "next/server";
import { runBusinessPartner, type ChatMessage } from "@/agents/business-partner";

type AgentRequest = { message: string; history?: ChatMessage[] };

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as AgentRequest | null;
  const message = body?.message;

  if (!message?.trim()) {
    return NextResponse.json({ error: "Pertanyaan kosong" }, { status: 400 });
  }

  try {
    const { answer, trace, agentsUsed, steps } = await runBusinessPartner(message, body?.history ?? []);
    return NextResponse.json({ answer, trace, agentsUsed, steps });
  } catch (err) {
    console.error("[/api/agent] Business Partner error:", err);
    return NextResponse.json({
      answer: "Smesh sedang mengalami kendala saat memproses pertanyaan. Coba lagi beberapa saat.",
      trace: [],
      agentsUsed: [],
      steps: [],
    });
  }
}
