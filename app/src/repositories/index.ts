import type { BusinessRepository } from "@/repositories/business-repository";
import { mockBusinessRepository } from "@/repositories/mock-business-repository";
import { supabaseBusinessRepository } from "@/repositories/supabase-business-repository";
import { isSupabaseConfigured } from "@/lib/supabase/server";

// Single selection point (Batch 2 spec Phase 9): agents/tools/API routes
// depend on BusinessRepository only, never on which implementation backs it.
// Supabase when configured, mock as local/dev fallback — never both live at
// once, so tool output is never a silent mix of real and seeded data.
export function getBusinessRepository(): BusinessRepository {
  return isSupabaseConfigured() ? supabaseBusinessRepository : mockBusinessRepository;
}
