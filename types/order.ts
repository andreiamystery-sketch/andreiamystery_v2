import { paymentStatuses, type PaymentStatus } from "@/config/payments";

export const orderStatuses = [
  "Pendente",
  "Confirmada",
  "Enviada",
  "Concluída",
  "Cancelada",
] as const;

export type OrderStatus = (typeof orderStatuses)[number];
export { paymentStatuses, type PaymentStatus };

export type OrderItem = {
  product_id: string;
  stable_id: string;
  sku: string | null;
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

export type OrderStatusHistoryEntry = {
  id: number;
  previous_status: OrderStatus | null;
  new_status: OrderStatus;
  created_at: string;
  changed_by: string | null;
};

export type StoreOrder = {
  id: number;
  order_number: string;
  customer_name: string;
  phone: string;
  email: string | null;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  email_sent_at: string | null;
  notification_error: string | null;
  subtotal: number | null;
  shipping_total: number;
  delivery_method: string | null;
  delivery_region: string | null;
  delivery_country: string | null;
  delivery_address: string | null;
  delivery_postal_code: string | null;
  delivery_city: string | null;
  delivery_notes: string | null;
  shipping_carrier: string | null;
  shipping_estimate: string | null;
  payment_method: string | null;
  payment_status: PaymentStatus | null;
  payment_reference: string | null;
  paid_at: string | null;
  payment_notes: string | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_payment_method: string | null;
  stripe_last_event_id: string | null;
  privacy_accepted: boolean;
  customer_locale: string | null;
  internal_notes: string | null;
  order_status_history?: OrderStatusHistoryEntry[] | null;
};



