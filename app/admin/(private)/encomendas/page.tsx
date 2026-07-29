import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { StoreOrder } from "@/types/order";
import { AdminOrders } from "@/components/admin/admin-orders";

export const dynamic = "force-dynamic";

const orderSelect = "id,order_number,customer_name,phone,email,items,total,status,created_at,updated_at,email_sent_at,notification_error,internal_note,subtotal,shipping_total,delivery_method,delivery_region,delivery_country,delivery_address,delivery_postal_code,delivery_city,delivery_notes,shipping_carrier,shipping_estimate,payment_method,payment_status,payment_reference,paid_at,payment_notes,privacy_accepted,customer_locale,order_status_history(id,previous_status,new_status,created_at,changed_by)";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const { data, error } = await createAdminClient().from("orders").select(orderSelect).order("created_at", { ascending: false });

  return (
    <section className="px-4 py-10 sm:px-7">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[.28em] text-[#c9a45c]">Andrea&apos;s Mystery</p>
        <h1 className="mt-3 font-serif text-4xl sm:text-5xl">Encomendas</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55">
          Consulte pedidos, contacte clientes e acompanhe cada encomenda até à conclusão.
        </p>
        {error ? (
          <p role="alert" className="mt-8 border border-red-300/30 p-5 text-red-200">
            Não foi possível carregar as encomendas. Confirme se as migrations em `supabase/` foram executadas.
          </p>
        ) : (
          <AdminOrders orders={(data ?? []) as StoreOrder[]} />
        )}
      </div>
    </section>
  );
}
