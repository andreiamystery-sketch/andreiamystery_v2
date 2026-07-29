export const companyConfig = {
  brandName: "Andrea's Mystery",
  ownerName: "Andreia Soares",
  taxId: "233001263",
  addressLine1: "Rua dos Lameirinhos 149",
  postalCode: "4440-637",
  city: "Valongo",
  country: "Portugal",
  phone: "+351 916 303 632",
  phoneDisplay: "916 303 632",
  whatsappNumber: "351916303632",
  email: "andreiamystery@gmail.com",
  instagramUrl: "https://www.instagram.com/andrea_mystery_/",
} as const;

export const companyAddress = `${companyConfig.addressLine1}, ${companyConfig.postalCode} ${companyConfig.city}, ${companyConfig.country}`;
