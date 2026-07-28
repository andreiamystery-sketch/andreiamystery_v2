export const orderStatuses = [
  "Pendente",
  "Confirmada",
  "Enviada",
  "Concluída",
  "Cancelada",
] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export type OrderItem = {
  product_id: string;
  stable_id: string;
  sku: string | null;
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
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
};
