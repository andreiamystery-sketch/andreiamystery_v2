import { companyConfig } from "@/config/company";
import { shippingConfig } from "@/config/shipping";

export const storeSettings = {
  storeName: companyConfig.brandName,
  ownerName: companyConfig.ownerName,
  taxId: companyConfig.taxId,
  currency: "EUR" as const,
  locale: "pt-PT",
  supplierPriceMultiplier: 3,
  shippingPrice: shippingConfig.regions[0].price,
  shippingEstimate: shippingConfig.regions[0].estimatedDelivery,
  freeShippingThreshold: null as number | null,
  activeDeliveryMethods: {
    shipping: true,
    locationPickup: true,
    eventPickup: true,
  },
  activeOrderMethods: {
    email: true,
    whatsapp: true,
  },
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? companyConfig.whatsappNumber,
  orderEmail: companyConfig.email,
  contactPhone: companyConfig.phoneDisplay,
  contactPhoneInternational: companyConfig.phone,
  instagramUrl: companyConfig.instagramUrl,
  topBar: {
    centerMessage: "Joias que contam histórias",
    serviceMessage: "Atendimento personalizado",
  },
};

export const storeBenefits = [
  { icon: "gem", title: "Bijuteria premium", description: "Detalhe e acabamento cuidado" },
  { icon: "sparkles", title: "Durabilidade", description: "Peças escolhidas para acompanhar-te" },
  { icon: "gift", title: "Embalagem exclusiva", description: "Preparada com atenção" },
  { icon: "hand", title: "Compra acompanhada", description: "Apoio em cada etapa" },
  { icon: "package", title: "Envio com DPD", description: "Prazos estimados por região" },
] as const;
