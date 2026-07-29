export const paymentMethods = [
  {
    id: "MB Way",
    label: "MB Way",
    enabled: true,
    customerText: "Pagamento de teste por MB Way através de Stripe Checkout. Não movimenta dinheiro real.",
  },
  {
    id: "Transferência bancária",
    label: "Transferência bancária",
    enabled: true,
    customerText: "Os dados bancários serão enviados após confirmação da encomenda.",
  },
  {
    id: "Referência Multibanco",
    label: "Referência Multibanco",
    enabled: false,
    customerText: "Método preparado para ativação futura.",
  },
  {
    id: "Stripe Checkout Test",
    label: "Cartão - Stripe Test Mode",
    enabled: false,
    customerText: "Pagamento de teste por cartão através de Stripe Checkout. Não movimenta dinheiro real.",
  },
] as const;

export type PaymentMethodId = (typeof paymentMethods)[number]["id"];

export const stripeTestPaymentMethodId = "Stripe Checkout Test" satisfies PaymentMethodId;
export type StripeCheckoutPaymentMethod = "card" | "mb_way";

export const paymentStatuses = [
  "pendente",
  "aguardando pagamento",
  "pago",
  "falhado",
  "reembolsado",
  "cancelado",
] as const;

export type PaymentStatus = (typeof paymentStatuses)[number];

type PaymentOptions = { testMode?: boolean };

export const paymentConfig = {
  mbWayPhone: "+351 916 303 632",
  defaultMethod: "MB Way" as PaymentMethodId,
  defaultStatus: "aguardando pagamento" as PaymentStatus,
  methods: paymentMethods,
  futureMethods: ["cartão", "Stripe", "PayPal", "IfthenPay", "Eupago"],
};

export function getStripeCheckoutPaymentMethod(method: PaymentMethodId): StripeCheckoutPaymentMethod | null {
  if (method === stripeTestPaymentMethodId) return "card";
  if (method === "MB Way") return "mb_way";
  return null;
}

export function getEnabledPaymentMethods(options: PaymentOptions = {}) {
  return paymentMethods.filter((method) => method.enabled || (options.testMode && method.id === stripeTestPaymentMethodId));
}

export function isEnabledPaymentMethod(method: string, options: PaymentOptions = {}): method is PaymentMethodId {
  return paymentMethods.some((item) => item.id === method && (item.enabled || (options.testMode && item.id === stripeTestPaymentMethodId)));
}
