import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/lib/AuthContext";
import { NotificationProvider } from "@/lib/NotificationContext";
import { MiniSlackProvider } from "@/lib/MiniSlackContext";
import { MiniSlackPanel } from "@/components/MiniSlackPanel";
import { CommandPalette } from "@/components/CommandPalette";
import { PwaRegister } from "@/components/PwaRegister";
import { AppShell } from "@/components/AppShell";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <MiniSlackProvider>
                <AppShell>{children}</AppShell>
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
