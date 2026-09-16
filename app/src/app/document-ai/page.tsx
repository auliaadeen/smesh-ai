import { getBusinessRepository } from "@/repositories";
import { DocumentAiClient } from "@/app/document-ai/DocumentAiClient";

// The transaction date must default to the app's business "today" (demo
// date or latest sales date), never the browser's real wall-clock date —
// otherwise an upload silently dates itself outside the demo dataset's
// window (spec Phase 3 §6). That default would itself go stale if this
// page were statically prerendered, so force per-request rendering (Phase 4
// root-cause fix — see src/app/page.tsx for the full writeup).
export const dynamic = "force-dynamic";

export default async function DocumentAiPage() {
  const defaultDate = await getBusinessRepository().getBusinessDate();
  return <DocumentAiClient defaultDate={defaultDate} />;
}
