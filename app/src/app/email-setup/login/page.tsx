"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, LogIn, Mail } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useEmailSetup } from "@/lib/EmailSetupContext";

export default function EmailSetupLoginPage() {
  const { login } = useEmailSetup();
  const [email, setEmail] = useState("demo@smesh.com");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState(false);
  const router = useRouter();

  function masuk() {
    if (login(email, password)) {
      router.push("/email-setup");
    } else {
      setError(true);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-white dark:bg-neutral-950 px-6 text-neutral-900 dark:text-neutral-100">
      <ThemeToggle className="absolute right-4 top-4 md:right-6 md:top-6" />
      <Link
        href="/"
        className="absolute left-4 top-4 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 md:left-6 md:top-6"
      >
        &larr; Kembali
      </Link>

      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <div className="flex items-center gap-2 rounded bg-blue-700 px-3 py-1.5">
            <Mail className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Email Setup</span>
          </div>
        </div>
        <h1 className="text-center text-2xl font-bold">Login super-user.</h1>

        <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Mode demo — bukan sistem autentikasi produksi. Field sudah keisi contoh, langsung klik{" "}
            <strong>Masuk</strong> — email &amp; password apa saja diterima, tidak ada validasi sungguhan.
          </p>
        </div>

        <Card className="mt-6">
          <label className="block text-xs font-medium text-neutral-500">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="deen@smesh.com"
            autoComplete="off"
            suppressHydrationWarning
            className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900"
          />
          <label className="mt-3 block text-xs font-medium text-neutral-500">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="off"
            suppressHydrationWarning
            className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900"
          />
          {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">Email & password wajib diisi.</p>}

          <button
            onClick={masuk}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-600"
          >
            <LogIn className="h-4 w-4" /> Masuk
          </button>
        </Card>
      </div>
    </main>
  );
}
