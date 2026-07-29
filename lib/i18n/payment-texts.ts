import type { LocaleCode } from "@/config/locales";

const paymentTexts: Record<LocaleCode, Record<string, string>> = {
  pt: {
    "MB Way": "Pagamento de teste por MB Way via Stripe Checkout. Não movimenta dinheiro real e só fica pago após confirmação do webhook.",
    "Transferência bancária": "Pagamento por transferência bancária. Os dados são confirmados depois da encomenda.",
    "Stripe Checkout Test": "Pagamento de teste por cartão via Stripe Checkout. Não movimenta dinheiro real e só fica pago após confirmação do webhook.",
  },
  en: {
    "MB Way": "Test MB Way payment via Stripe Checkout. No real money moves and the order is only paid after webhook confirmation.",
    "Transferência bancária": "Payment by bank transfer. The details are confirmed after the order.",
    "Stripe Checkout Test": "Test card payment via Stripe Checkout. No real money moves and the order is only paid after webhook confirmation.",
  },
  es: {
    "MB Way": "Pago de prueba por MB Way mediante Stripe Checkout. No mueve dinero real y solo queda pagado tras la confirmación del webhook.",
    "Transferência bancária": "Pago por transferencia bancaria. Los datos se confirman después del pedido.",
    "Stripe Checkout Test": "Pago de prueba con tarjeta mediante Stripe Checkout. No mueve dinero real y solo queda pagado tras la confirmación del webhook.",
  },
  fr: {
    "MB Way": "Paiement test par MB Way via Stripe Checkout. Aucun argent réel n'est débité et la commande n'est payée qu'après confirmation du webhook.",
    "Transferência bancária": "Paiement par virement bancaire. Les détails sont confirmés après la commande.",
    "Stripe Checkout Test": "Paiement test par carte via Stripe Checkout. Aucun argent réel n'est débité et la commande n'est payée qu'après confirmation du webhook.",
  },
  de: {
    "MB Way": "Testzahlung per MB Way über Stripe Checkout. Es wird kein echtes Geld bewegt und die Bestellung gilt erst nach Webhook-Bestätigung als bezahlt.",
    "Transferência bancária": "Zahlung per Banküberweisung. Die Details werden nach der Bestellung bestätigt.",
    "Stripe Checkout Test": "Testzahlung per Karte über Stripe Checkout. Es wird kein echtes Geld bewegt und die Bestellung gilt erst nach Webhook-Bestätigung als bezahlt.",
  },
  zh: {
    "MB Way": "通过 Stripe Checkout 进行 MB Way 测试付款。不会产生真实扣款，订单仅在 webhook 确认后标记为已付款。",
    "Transferência bancária": "通过银行转账付款。详情会在订单后确认。",
    "Stripe Checkout Test": "通过 Stripe Checkout 进行测试卡支付。不会产生真实扣款，订单仅在 webhook 确认后标记为已付款。",
  },
};

export function getPaymentText(methodId: string, locale: LocaleCode, fallback: string) {
  return paymentTexts[locale]?.[methodId] ?? paymentTexts.pt[methodId] ?? fallback;
}
