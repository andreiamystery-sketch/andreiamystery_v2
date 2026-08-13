import type { LocaleCode } from "@/config/locales";

const livePaymentTexts: Record<LocaleCode, Record<string, string>> = {
  pt: {
    "MB Way": "Pagamento por MB WAY através de Stripe Checkout. A encomenda só fica paga após confirmação segura do webhook.",
    "Transferência bancária": "Pagamento por transferência bancária. Os dados são confirmados depois da encomenda.",
    "Cartão de crédito": "Pagamento por cartão através de Stripe Checkout. A encomenda só fica paga após confirmação segura do webhook.",
    "Stripe Checkout Test": "Pagamento de teste por cartão via Stripe Checkout. Não movimenta dinheiro real e só fica pago após confirmação do webhook.",
  },
  en: {
    "MB Way": "MB WAY payment through Stripe Checkout. The order is only marked as paid after secure webhook confirmation.",
    "Transferência bancária": "Payment by bank transfer. The details are confirmed after the order.",
    "Cartão de crédito": "Card payment through Stripe Checkout. The order is only marked as paid after secure webhook confirmation.",
    "Stripe Checkout Test": "Test card payment via Stripe Checkout. No real money moves and the order is only paid after webhook confirmation.",
  },
  es: {
    "MB Way": "Pago por MB WAY mediante Stripe Checkout. El pedido solo queda pagado tras la confirmación segura del webhook.",
    "Transferência bancária": "Pago por transferencia bancaria. Los datos se confirman después del pedido.",
    "Cartão de crédito": "Pago con tarjeta mediante Stripe Checkout. El pedido solo queda pagado tras la confirmación segura del webhook.",
    "Stripe Checkout Test": "Pago de prueba con tarjeta mediante Stripe Checkout. No mueve dinero real y solo queda pagado tras la confirmación del webhook.",
  },
  fr: {
    "MB Way": "Paiement par MB WAY via Stripe Checkout. La commande n'est marquée payée qu'après confirmation sécurisée du webhook.",
    "Transferência bancária": "Paiement par virement bancaire. Les détails sont confirmés après la commande.",
    "Cartão de crédito": "Paiement par carte via Stripe Checkout. La commande n'est marquée payée qu'après confirmation sécurisée du webhook.",
    "Stripe Checkout Test": "Paiement test par carte via Stripe Checkout. Aucun argent réel n'est débité et la commande n'est payée qu'après confirmation du webhook.",
  },
  de: {
    "MB Way": "MB WAY-Zahlung über Stripe Checkout. Die Bestellung gilt erst nach sicherer Webhook-Bestätigung als bezahlt.",
    "Transferência bancária": "Zahlung per Banküberweisung. Die Details werden nach der Bestellung bestätigt.",
    "Cartão de crédito": "Kartenzahlung über Stripe Checkout. Die Bestellung gilt erst nach sicherer Webhook-Bestätigung als bezahlt.",
    "Stripe Checkout Test": "Testzahlung per Karte über Stripe Checkout. Es wird kein echtes Geld bewegt und die Bestellung gilt erst nach Webhook-Bestätigung als bezahlt.",
  },
  zh: {
    "MB Way": "通过 Stripe Checkout 使用 MB WAY 付款。订单仅在安全 webhook 确认后标记为已付款。",
    "Transferência bancária": "通过银行转账付款。详情会在订单后确认。",
    "Cartão de crédito": "通过 Stripe Checkout 使用信用卡付款。订单仅在安全 webhook 确认后标记为已付款。",
    "Stripe Checkout Test": "通过 Stripe Checkout 进行测试卡支付。不会产生真实扣款，订单仅在 webhook 确认后标记为已付款。",
  },
};

const testPaymentTexts: Record<LocaleCode, Record<string, string>> = {
  pt: { ...livePaymentTexts.pt, "MB Way": "Pagamento de teste por MB WAY via Stripe Checkout. Não movimenta dinheiro real e só fica pago após confirmação do webhook." },
  en: { ...livePaymentTexts.en, "MB Way": "Test MB WAY payment via Stripe Checkout. No real money moves and the order is only paid after webhook confirmation." },
  es: { ...livePaymentTexts.es, "MB Way": "Pago de prueba por MB WAY mediante Stripe Checkout. No mueve dinero real y solo queda pagado tras la confirmación del webhook." },
  fr: { ...livePaymentTexts.fr, "MB Way": "Paiement test par MB WAY via Stripe Checkout. Aucun argent réel n'est débité et la commande n'est payée qu'après confirmation du webhook." },
  de: { ...livePaymentTexts.de, "MB Way": "Testzahlung per MB WAY über Stripe Checkout. Es wird kein echtes Geld bewegt und die Bestellung gilt erst nach Webhook-Bestätigung als bezahlt." },
  zh: { ...livePaymentTexts.zh, "MB Way": "通过 Stripe Checkout 进行 MB WAY 测试付款。不会产生真实扣款，订单仅在 webhook 确认后标记为已付款。" },
};

export function getPaymentText(methodId: string, locale: LocaleCode, fallback: string, options: { testMode?: boolean } = {}) {
  const paymentTexts = options.testMode ? testPaymentTexts : livePaymentTexts;
  return paymentTexts[locale]?.[methodId] ?? paymentTexts.pt[methodId] ?? fallback;
}
