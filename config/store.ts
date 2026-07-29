import { companyConfig } from "./company";
import { featureConfig } from "./features";
import { paymentConfig } from "./payments";
import { seoConfig } from "./seo";
import { shippingConfig } from "./shipping";

export const storeConfig = {
  company: companyConfig,
  features: featureConfig,
  payments: paymentConfig,
  seo: seoConfig,
  shipping: shippingConfig,
} as const;
