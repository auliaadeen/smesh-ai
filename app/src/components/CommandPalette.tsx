"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search } from "lucide-react";

const AKSI_CEPAT = [
  { label: "Tanya Smesh", href: "/assistant" },
  { label: "Lihat Sales", href: "/sales" },
  { label: "Cek Inventory", href: "/inventory" },
  { label: "Lihat Products", href: "/products" },
];

const HALAMAN = [
  { label: "Overview", href: "/" },
  { label: "Sales", href: "/sales" },
  { label: "Inventory", href: "/inventory" },
  { label: "Products", href: "/products" },
  { label: "AI Business Partner", href: "/assistant" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    function onOpenRequest() {
      setOpen(true);
    }
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("smesh:open-command-palette", onOpenRequest);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("smesh:open-command-palette", onOpenRequest);
    };
  }, []);

  function go(href: string) {
    router.push(href);
    setOpen(false);
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command Palette"
      overlayClassName="fixed inset-0 z-50 bg-black/30"
      contentClassName="fixed left-1/2 top-24 z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 px-3">
        <Search className="h-4 w-4 shrink-0 text-neutral-400" />
        <Command.Input
          placeholder="Cari halaman..."
          className="w-full bg-transparent px-1 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-white"
        />
      </div>
      <Command.List className="max-h-80 overflow-y-auto p-2">
        <Command.Empty className="px-3 py-6 text-center text-sm text-neutral-500">
          Tidak ada hasil.
        </Command.Empty>

        <Command.Group heading="Aksi Cepat" className="px-2 py-1.5 text-xs font-medium text-neutral-500">
          {AKSI_CEPAT.map((a) => (
            <Command.Item
              key={a.href}
              value={a.label}
              onSelect={() => go(a.href)}
              className="cursor-pointer rounded-lg px-2 py-2 text-sm text-neutral-700 data-[selected=true]:bg-neutral-100 dark:text-neutral-300 dark:data-[selected=true]:bg-neutral-800"
            >
              {a.label}
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group heading="Modul & Halaman" className="px-2 py-1.5 text-xs font-medium text-neutral-500">
          {HALAMAN.map((h) => (
            <Command.Item
              key={h.href}
              value={h.label}
              onSelect={() => go(h.href)}
              className="cursor-pointer rounded-lg px-2 py-2 text-sm text-neutral-700 data-[selected=true]:bg-neutral-100 dark:text-neutral-300 dark:data-[selected=true]:bg-neutral-800"
            >
              {h.label}
            </Command.Item>
          ))}
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
