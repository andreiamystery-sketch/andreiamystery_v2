import Link from "next/link";
import { AdminProductCreateForm } from "@/components/admin/admin-product-create-form";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function NewAdminProductPage() {
  await requireAdmin();
  return (
    <main className="min-h-screen bg-[#080808] px-4 py-8 text-white sm:px-7">
      <div className="mx-auto max-w-4xl">
        <Link href="/admin/produtos" className="text-sm text-[#e4c37d] hover:underline">← Voltar à gestão de produtos</Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-[.28em] text-[#c9a45c]">Andrea&apos;s Mystery</p>
        <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Adicionar produto</h1>
        <p className="mb-8 mt-3 max-w-2xl text-sm leading-relaxed text-white/55">Cria uma peça de Bijuteria ou uma gravação personalizada. A primeira fotografia escolhida será a imagem de capa.</p>
        <AdminProductCreateForm />
      </div>
    </main>
  );
}
