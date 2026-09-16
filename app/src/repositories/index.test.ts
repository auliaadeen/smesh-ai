import { describe, it, expect, vi, beforeEach } from "vitest";

// Phase 4 acceptance TEST I — Supabase, when configured, must always win;
// the mock repository is a local/dev fallback only, never a silent second
// source of truth alongside a configured Supabase.
describe("getBusinessRepository", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doUnmock("@/lib/supabase/server");
  });

  it("returns the Supabase repository when Supabase is configured", async () => {
    vi.doMock("@/lib/supabase/server", () => ({
      isSupabaseConfigured: () => true,
      getSupabaseServerClient: vi.fn(),
    }));
    const { getBusinessRepository } = await import("@/repositories");
    const { supabaseBusinessRepository } = await import("@/repositories/supabase-business-repository");
    expect(getBusinessRepository()).toBe(supabaseBusinessRepository);
  });

  it("falls back to the mock repository only when Supabase is not configured", async () => {
    vi.doMock("@/lib/supabase/server", () => ({
      isSupabaseConfigured: () => false,
      getSupabaseServerClient: vi.fn(),
    }));
    const { getBusinessRepository } = await import("@/repositories");
    const { mockBusinessRepository } = await import("@/repositories/mock-business-repository");
    expect(getBusinessRepository()).toBe(mockBusinessRepository);
  });
});
