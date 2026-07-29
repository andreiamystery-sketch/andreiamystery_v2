"use client";

import { useI18n } from "@/components/i18n/i18n-provider";
import { storeSettings } from "@/data/store-settings";
import { formatPrice } from "@/lib/format";

const freeShippingText = {
  pt: "Portes grátis em compras acima de",
  en: "Free shipping on orders over",
  es: "Envío gratis en pedidos superiores a",
  fr: "Livraison offerte dès",
  de: "Kostenloser Versand ab",
  zh: "订单满即可免配送费",
} as const;

export function TopBar() {
  const { locale } = useI18n();
  const shippingMessage = storeSettings.freeShippingThreshold
    ? `${freeShippingText[locale]} ${formatPrice(storeSettings.freeShippingThreshold, locale)}`
    : null;
  const centerMessage = storeSettings.topBar.centerMessage;
  const serviceMessage = storeSettings.topBar.serviceMessage;

  if (!shippingMessage && !centerMessage && !serviceMessage) return null;

  return (
    <div className="border-b border-gold/15 bg-black-warm px-4 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-warm-gray">
      <div className="mx-auto flex min-h-8 max-w-[90rem] items-center justify-center lg:grid lg:grid-cols-3">
        <span className="hidden lg:block">{shippingMessage}</span>
        {centerMessage && <span className="text-center text-gold-light">{centerMessage}</span>}
        {serviceMessage && (
          <span className="hidden text-right lg:block">
            {serviceMessage}
            {storeSettings.contactPhone ? ` · ${storeSettings.contactPhone}` : ""}
          </span>
        )}
      </div>
    </div>
  );
}
