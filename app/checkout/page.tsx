import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/checkout-flow";

export const metadata: Metadata = {
  title: "Finalizar encomenda",
  description: "Revê o carrinho e prepara o teu pedido Andrea's Mystery.",
};

export default function CheckoutPage() {
  return (
    <main className="px-5 py-12 md:px-10 lg:py-20">
      <div className="mx-auto mb-10 max-w-5xl">
        <p className="eyebrow">Encomenda</p>
        <h1 className="mt-4 font-serif text-5xl leading-none md:text-7xl">Finalizar encomenda</h1>
      </div>
      <CheckoutFlow />
    </main>
  );
}
