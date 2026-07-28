import { catalogProducts } from "@/data/products";
import { requireAdmin } from "@/lib/admin-auth";
import { getProductStateOverrides, resolveProductState } from "@/lib/product-visibility";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminProductsTable, type AdminProduct } from "@/components/admin/admin-products-table";
import { AdminQuickActions } from "@/components/admin/admin-quick-actions";
import { logout } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const admin = await requireAdmin();
  const overrides = await getProductStateOverrides();
  const products: AdminProduct[] = catalogProducts.map((product) => {
    const state = resolveProductState(product, overrides);

    return {
      id: String(product.id), name: product.nome, slug: product.slug, image: product.capa,
      sku: product.sku, stableId: product.stableId, supplierId: product.supplierProductId,
      category: product.categoria, supplier: product.supplier, price: product.price,
      visible: state.isVisible, bestSeller: state.isBestSeller, newArrival: state.isNewArrival,
    };
  });
  const visible = products.filter((p) => p.visible).length;
  const bestSellers = products.filter((p) => p.bestSeller).length;
  const newArrivals = products.filter((p) => p.newArrival).length;
  const { data: audit } = await createAdminClient().from("admin_audit_log")
    .select("id,action,product_ids,metadata,created_at").order("created_at", { ascending: false }).limit(20);
  const categories = [...new Set(products.map((p) => p.category))].sort();

  return (
    <main className="admin-shell min-h-screen bg-[#080808] px-4 py-8 text-white sm:px-7">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-wrap items-start justify-between gap-5 border-b border-[#c9a45c]/25 pb-7">
          <div><p className="text-xs font-bold uppercase tracking-[.28em] text-[#c9a45c]">Andrea&apos;s Mystery</p><h1 className="mt-2 font-serif text-4xl sm:text-5xl">Gestão de produtos</h1><p className="mt-2 text-sm text-white/50">{admin.email}</p></div>
          <form action={logout}><button className="min-h-11 border border-[#c9a45c]/50 px-5 text-[#e4c37d]">Terminar sessão</button></form>
        </header>
        <section className="my-7 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="border border-white/10 p-4"><strong className="block text-2xl">{products.length}</strong><span className="text-sm text-white/50">Total</span></div>
          <div className="border border-emerald-300/20 p-4"><strong className="block text-2xl text-emerald-300">{visible}</strong><span className="text-sm text-white/50">Visíveis</span></div>
          <div className="border border-white/10 p-4"><strong className="block text-2xl">{products.length - visible}</strong><span className="text-sm text-white/50">Ocultos</span></div>
          <div className="border border-[#c9a45c]/30 p-4"><strong className="block text-2xl text-[#e4c37d]">{bestSellers}</strong><span className="text-sm text-white/50">Best Sellers</span></div>
          <div className="border border-sky-300/20 p-4"><strong className="block text-2xl text-sky-300">{newArrivals}</strong><span className="text-sm text-white/50">Novos</span></div>
        </section>
        <AdminProductsTable products={products} />
        <AdminQuickActions categories={categories} />
        <section className="mt-8 border-t border-white/10 pt-7">
          <h2 className="font-serif text-2xl">20 alterações mais recentes</h2>
          {!audit?.length ? <p className="mt-4 text-white/50">Ainda não existem alterações.</p> : <div className="mt-4 grid gap-2">
            {audit.map((entry) => <article key={entry.id} className="flex flex-wrap justify-between gap-2 border border-white/10 p-3 text-sm">
              <span><strong>{entry.action}</strong> · {entry.product_ids.length} produtos</span>
              <time className="text-white/50">{new Intl.DateTimeFormat("pt-PT", { dateStyle: "short", timeStyle: "short" }).format(new Date(entry.created_at))}</time>
            </article>)}
          </div>}
        </section>
      </div>
    </main>
  );
}
