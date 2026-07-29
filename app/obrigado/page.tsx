import { redirect } from "next/navigation";

export default async function ThankYouPage({ searchParams }: { searchParams: Promise<{ pedido?: string }> }) {
  const { pedido } = await searchParams;
  redirect(`/pt/obrigado${pedido ? `?pedido=${encodeURIComponent(pedido)}` : ""}`);
}
