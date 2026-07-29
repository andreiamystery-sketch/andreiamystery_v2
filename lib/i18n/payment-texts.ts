import type { LocaleCode } from "@/config/locales";

const paymentTexts: Record<LocaleCode, Record<string, string>> = {
  pt: {
    "MB Way": "Pagamento por MB Way. A equipa confirma os dados após a encomenda.",
    "Transferência bancária": "Pagamento por transferência bancária. Os dados são confirmados depois da encomenda.",
  },
  en: {
    "MB Way": "Payment by MB Way. The team confirms the details after the order.",
    "Transferência bancária": "Payment by bank transfer. The details are confirmed after the order.",
  },
  es: {
    "MB Way": "Pago por MB Way. El equipo confirma los datos después del pedido.",
    "Transferência bancária": "Pago por transferencia bancaria. Los datos se confirman después del pedido.",
  },
  fr: {
    "MB Way": "Paiement par MB Way. L'équipe confirme les détails après la commande.",
    "Transferência bancária": "Paiement par virement bancaire. Les détails sont confirmés après la commande.",
  },
  de: {
    "MB Way": "Zahlung per MB Way. Das Team bestätigt die Details nach der Bestellung.",
    "Transferência bancária": "Zahlung per Banküberweisung. Die Details werden nach der Bestellung bestätigt.",
  },
  zh: {
    "MB Way": "通过 MB Way 付款。团队会在订单后确认详情。",
    "Transferência bancária": "通过银行转账付款。详情会在订单后确认。",
  },
};

export function getPaymentText(methodId: string, locale: LocaleCode, fallback: string) {
  return paymentTexts[locale]?.[methodId] ?? paymentTexts.pt[methodId] ?? fallback;
}
