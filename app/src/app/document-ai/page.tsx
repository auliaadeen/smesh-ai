import { getBusinessRepository } from "@/repositories";
import { DocumentAiClient } from "@/app/document-ai/DocumentAiClient";

// The transaction date must default to the app's business "today" (demo
// date or latest sales date), never the browser's real wall-clock date —
// otherwise an upload silently dates itself outside the demo dataset's
// window (spec Phase 3 §6).
export default async function DocumentAiPage() {
  const defaultDate = await getBusinessRepository().getBusinessDate();
  return <DocumentAiClient defaultDate={defaultDate} />;
}
