import { describe, it, expect } from "vitest";
import DocumentAiPage from "@/app/document-ai/page";
import { mockBusinessRepository } from "@/repositories/mock-business-repository";

// Phase 4 acceptance TEST C — the transaction date must default to the
// app's business date, never the browser's real wall-clock date (Phase 3
// §6 fix; regressing this would silently date uploads outside the demo
// dataset's window again).
describe("DocumentAiPage", () => {
  it("passes the repository's business date as the client's default transaction date", async () => {
    const element = await DocumentAiPage();
    const businessDate = await mockBusinessRepository.getBusinessDate();
    expect(element.props.defaultDate).toBe(businessDate);
  });
});
