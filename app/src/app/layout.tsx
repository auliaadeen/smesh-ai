import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/lib/AuthContext";
import { NotificationProvider } from "@/lib/NotificationContext";
import { MiniSlackProvider } from "@/lib/MiniSlackContext";
import { MiniSlackPanel } from "@/components/MiniSlackPanel";
import { CommandPalette } from "@/components/CommandPalette";
import { PwaRegister } from "@/components/PwaRegister";
import { AppShell } from "@/components/AppShell";
import { getBusinessRepository } from "@/repositories";
import { isDemoBusinessDate } from "@/lib/businessDate";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smesh AI — Multi-Agent Workforce for Indonesian UMKM",
  description: "AI business workforce untuk pemilik UMKM Indonesia — pahami bisnismu, putuskan langkah berikutnya.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Smesh AI",
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Fetched once here (not per-page) so every route shares one honest signal
  // for whether the business data on screen is a frozen demo snapshot or the
  // real, live-updating day (spec Phase 3 §3). Never let this block the
  // whole shell from rendering — a Supabase outage is handled per-page by
  // error.tsx, not by taking down navigation chrome too.
  let businessDate: string | null = null;
  try {
    businessDate = await getBusinessRepository().getBusinessDate();
  } catch {
    businessDate = null;
  }
  const isDemoMode = businessDate !== null && isDemoBusinessDate(businessDate);

  return (
    <html lang="id" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <MiniSlackProvider>
                <AppShell businessDate={businessDate} isDemoMode={isDemoMode}>{children}</AppShell>
                <MiniSlackPanel />
                <CommandPalette />
              </MiniSlackProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
