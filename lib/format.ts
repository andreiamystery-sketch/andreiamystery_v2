export function formatPrice(price: number) {
  return price.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
}
