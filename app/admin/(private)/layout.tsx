import type { ReactNode } from "react";
import Link from "next/link";

import { logoutAction } from "@/app/admin/logout/actions";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminSessionGuard } from "@/components/admin/admin-session-guard";

export default async function PrivateAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-obsidian text-white">
      <AdminSessionGuard />

      <header className="border-b border-gold/20 bg-obsidian px-5 py-5 md:px-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold">
              Área reservada
            </p>

            <p className="mt-1 text-sm text-stone-400">
              {admin.email}
            </p>
          </div>

          <nav className="flex items-center gap-2" aria-label="Administração">
            <Link className="min-h-11 border border-gold/20 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-champagne transition hover:border-gold" href="/admin/produtos">
              Produtos
            </Link>
            <Link className="min-h-11 border border-gold/20 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-champagne transition hover:border-gold" href="/admin/encomendas">
              Encomendas
            </Link>
          </nav>

          <form action={logoutAction}>
            <button
              type="submit"
              className="min-h-11 border border-gold/30 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-champagne transition hover:border-gold hover:bg-gold hover:text-black"
            >
              Terminar sessão
            </button>
          </form>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
