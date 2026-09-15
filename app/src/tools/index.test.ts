import { describe, it, expect } from "vitest";
import { executeTool } from "@/tools";
import { mockBusinessRepository } from "@/repositories/mock-business-repository";

describe("executeTool", () => {
  it("returns structured today sales", async () => {
    const result = await executeTool("get_today_sales", "{}", mockBusinessRepository);
    expect(result).toHaveProperty("revenue");
    expect(result).toHaveProperty("orders");
  });

  it("passes through validated args", async () => {
    const result = (await executeTool("get_best_sellers", JSON.stringify({ limit: 2 }), mockBusinessRepository)) as unknown[];
    expect(result.length).toBeLessThanOrEqual(2);
  });

  it("rejects unknown tool names", async () => {
    await expect(executeTool("delete_everything", "{}", mockBusinessRepository)).rejects.toThrow();
  });

  it("rejects malformed JSON arguments", async () => {
    await expect(executeTool("get_best_sellers", "{not json", mockBusinessRepository)).rejects.toThrow();
  });

  it("returns found:true with only the matched product for a specific lookup", async () => {
    const result = (await executeTool(
      "get_product_status",
      JSON.stringify({ query: "Kopi Arabica" }),
      mockBusinessRepository
    )) as { found: boolean; productId?: string };
    expect(result.found).toBe(true);
    expect(result.productId).toBe("kopi-arabica");
  });

  it("returns found:false for a fictional product instead of substituting another one", async () => {
    const result = (await executeTool(
      "get_product_status",
      JSON.stringify({ query: "SMESH-XYZ" }),
      mockBusinessRepository
    )) as { found: boolean; productId?: string };
    expect(result.found).toBe(false);
    expect(result.productId).toBeUndefined();
  });
});
