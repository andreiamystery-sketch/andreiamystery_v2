export const shippingRegions = [
  {
    id: "PT",
    label: "Portugal",
    countryName: "Portugal",
    carrier: "DPD",
    estimatedDelivery: "2 dias úteis",
    price: 4,
  },
  {
    id: "EU",
    label: "Europa",
    countryName: "Europa",
    carrier: "DPD",
    estimatedDelivery: "7 dias úteis",
    price: 8,
  },
] as const;

export type ShippingRegionId = (typeof shippingRegions)[number]["id"];

export const shippingConfig = {
  defaultRegion: "PT" as ShippingRegionId,
  note: "Prazo estimado após confirmação do pagamento, salvo atrasos da transportadora.",
  regions: shippingRegions,
};

export function getShippingRegion(regionId: string | null | undefined) {
  return shippingRegions.find((region) => region.id === regionId) ?? shippingRegions[0];
}
