export const paymentMethods = [
  {
    id: "MB Way",
    label: "MB Way",
    enabled: true,
    customerText: "Pagamento por MB WAY através de Stripe Checkout. A encomenda só fica paga após confirmação segura do webhook.",
  },
  {
    id: "Transferência bancária",
    label: "Transferência bancária",
    enabled: true,
    customerText: "Os dados bancários serão enviados após confirmação da encomenda.",
  },
  {
    id: "Cartão de crédito",
    label: "Cartão de crédito",
    enabled: true,
    productionOnly: true,
    customerText: "Pagamento por cartão através de Stripe Checkout. A encomenda só fica paga após confirmação segura do webhook.",
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
    testOnly: true,
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
  if (method === "Cartão de crédito") return "card";
  if (method === "MB Way") return "mb_way";
  return null;
}

export function getEnabledPaymentMethods(options: PaymentOptions = {}) {
  return paymentMethods.filter((method) => {
    if ("testOnly" in method && method.testOnly) return Boolean(options.testMode);
    if ("productionOnly" in method && method.productionOnly) return !options.testMode && method.enabled;
    return method.enabled;
  });
}

export function isEnabledPaymentMethod(method: string, options: PaymentOptions = {}): method is PaymentMethodId {
  return getEnabledPaymentMethods(options).some((item) => item.id === method);
}
