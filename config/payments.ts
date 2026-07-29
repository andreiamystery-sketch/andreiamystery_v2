export const paymentMethods = [
  {
    id: "MB Way",
    label: "MB Way",
    enabled: true,
    customerText: "O pagamento será solicitado ou confirmado após validação da encomenda.",
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
] as const;

export type PaymentMethodId = (typeof paymentMethods)[number]["id"];

export const paymentStatuses = [
  "pendente",
  "aguardando pagamento",
  "pago",
  "falhado",
  "reembolsado",
  "cancelado",
] as const;

export type PaymentStatus = (typeof paymentStatuses)[number];

export const paymentConfig = {
  mbWayPhone: "+351 916 303 632",
  defaultMethod: "MB Way" as PaymentMethodId,
  defaultStatus: "aguardando pagamento" as PaymentStatus,
  methods: paymentMethods,
  futureMethods: ["cartão", "Stripe", "PayPal", "IfthenPay", "Eupago"],
};

export function getEnabledPaymentMethods() {
  return paymentMethods.filter((method) => method.enabled);
}

export function isEnabledPaymentMethod(method: string): method is PaymentMethodId {
  return paymentMethods.some((item) => item.id === method && item.enabled);
}
