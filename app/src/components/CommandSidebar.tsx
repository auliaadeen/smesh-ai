"use client";

import Link from "next/link";
import { TrendingUp, Package, LayoutGrid, Sparkles, LayoutDashboard, Warehouse, FileText, MessageSquare, Mail, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950";

export const sidebarModules: { href: string; title: string; icon: LucideIcon }[] = [
  { href: "/sales", title: "Sales", icon: TrendingUp },
  { href: "/inventory", title: "Inventory", icon: Package },
  { href: "/products", title: "Products", icon: LayoutGrid },
  { href: "/warehouse", title: "Warehouse", icon: Warehouse },
  { href: "/document-ai", title: "Document AI", icon: FileText },
  { href: "/chat", title: "Workspace", icon: MessageSquare },
  { href: "/email-setup", title: "Business Email", icon: Mail },
  { href: "/assistant", title: "AI Business Partner", icon: Sparkles },
];

function NavItem({ href, title, icon: Icon, onNavigate }: { href: string; title: string; icon: LucideIcon; onNavigate?: () => void }) {
  return <Link href={href} onClick={onNavigate} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-600 transition-colors hover:bg-white/60 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-white", focusRing)}>
    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /><span className="truncate">{title}</span>
  </Link>;
}

export function CommandSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return <>
    {open && <div aria-hidden="true" onClick={onClose} className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden" />}
    <aside className={cn("fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-white/60 bg-white/70 backdrop-blur-xl transition-transform duration-200 dark:border-white/10 dark:bg-neutral-900/70 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/60 px-4 dark:border-white/10">
        <Link href="/" onClick={onClose} className={cn("flex items-center gap-2 rounded-lg", focusRing)}>
          <span className="inline-flex items-center gap-2 rounded bg-emerald-700 px-2.5 py-1"><span className="text-xs font-bold text-white">S</span></span><span className="text-sm font-semibold">Smesh AI</span>
        </Link>
        <button type="button" aria-label="Tutup navigasi" onClick={onClose} className={cn("rounded-lg p-1.5 text-neutral-500 hover:bg-white/60 hover:text-neutral-900 dark:hover:bg-neutral-800/60 dark:hover:text-white lg:hidden", focusRing)}><X className="h-4 w-4" /></button>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        <div className="space-y-0.5"><NavItem href="/" title="Overview" icon={LayoutDashboard} onNavigate={onClose} /></div>
        <div><p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Modul</p><div className="mt-1 space-y-0.5">{sidebarModules.map((m) => <NavItem key={m.href} {...m} onNavigate={onClose} />)}</div></div>
      </nav>
    </aside>
  </>;
}
