"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Search, Menu } from "lucide-react";
import { CommandSidebar } from "@/components/CommandSidebar";
import { AccountBadge } from "@/components/AccountBadge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

// Standalone auth-gate screens render full-screen with no persistent chrome.
const STANDALONE_ROUTES = new Set(["/login", "/email-setup/login"]);

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const standalone = STANDALONE_ROUTES.has(pathname);

  // `children` must stay at the same position in the tree across the
  // standalone/shell branches — if its parent chain changes shape, React
  // unmounts (and resets) any client state below it, e.g. EmailSetupProvider
  // in app/email-setup/layout.tsx, on navigation between the two branches.
  return (
    <div
      className={cn(
        "flex min-h-screen",
        !standalone && "bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100"
      )}
    >
      {!standalone && <CommandSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

      <div className="flex min-w-0 flex-1 flex-col">
        {!standalone && (
          <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-neutral-200/70 bg-white/80 px-6 backdrop-blur-xl dark:border-neutral-800/70 dark:bg-neutral-950/80 md:px-10">
            <button
              type="button"
              aria-label="Buka navigasi"
              onClick={() => setSidebarOpen(true)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-white lg:hidden",
                focusRing
              )}
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="flex-1" />
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("smesh:open-command-palette"))}
                className={cn(
                  "flex h-9 items-center gap-1.5 rounded-lg border border-neutral-200 px-3 text-xs font-medium text-neutral-600 transition-colors hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-white",
                  focusRing
                )}
              >
                <Search className="h-3.5 w-3.5" /> Cari <span className="text-neutral-400">Ctrl+K</span>
              </button>
              <AccountBadge />
              <ThemeToggle />
            </div>
          </header>
        )}

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
