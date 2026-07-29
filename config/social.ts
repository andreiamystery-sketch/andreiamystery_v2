import { companyConfig } from "./company";

export const socialConfig = {
  instagramUrl: companyConfig.instagramUrl,
  whatsappUrl: `https://wa.me/${companyConfig.whatsappNumber}`,
} as const;
