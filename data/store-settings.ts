export const storeSettings = {
  storeName: "Andrea's Mystery",
  currency: "EUR" as const,
  locale: "pt-PT",
  supplierPriceMultiplier: 3,
  shippingPrice: null as number | null,
  shippingEstimate: "",
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
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
  orderEmail: "andreasmystery@gmail.com",
  contactPhone: "+351916300255",
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
  { icon: "package", title: "Envio em Portugal", description: "Entrega a confirmar no pedido" },
] as const;
