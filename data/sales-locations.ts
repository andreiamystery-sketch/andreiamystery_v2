export type SalesLocation = {
  id: string;
  name: string;
  type: "store" | "partner" | "market" | "other";
  address: string;
  locality: string;
  postalCode?: string;
  district?: string;
  schedule?: string;
  phone?: string;
  mapUrl?: string;
  mapEmbedUrl?: string;
  notes?: string;
  allowsPickup?: boolean;
  isPublished: boolean;
};

export const salesLocations: SalesLocation[] = [
  {
    id: "karina",
    name: "Karina Oliveira cabeleireira e estética",
    type: "partner",
    address: "Rua Doutor R. Manuel de Arriaga 303",
    locality: "Campo, Valongo",
    postalCode: "4440-004",
    district: "Porto",
    schedule: "Segunda a sábado · 10h00–19h00",
    allowsPickup: true,
    isPublished: true,

    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=Rua+Doutor+R.+Manuel+de+Arriaga+303,+4440-004+Campo,+Valongo",

    mapEmbedUrl:
      "https://www.google.com/maps?q=Rua+Doutor+R.+Manuel+de+Arriaga+303,+4440-004+Campo,+Valongo&output=embed",
  },
];

export const publishedSalesLocations = salesLocations.filter(
  (location) => location.isPublished
);

export const pickupSalesLocations = publishedSalesLocations.filter(
  (location) => location.allowsPickup
);