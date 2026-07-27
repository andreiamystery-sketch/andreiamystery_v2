import type { CategoryFilter, Product } from "@/types/product";
import { roundCurrency } from "@/lib/money";
import { grupoBelleProducts } from "./grupo-belle-products";
import {
  bestSellerExistingProductIds,
  bestSellerSupplierProductIds,
  featuredProductSkus,
  newExistingProductIds,
  newSupplierProductIds,
  publishedProductSkus,
} from "./product-visibility";

export const categories: CategoryFilter[] = [
  { id: "Todos", label: "Todos", description: "Selecao completa Andrea's Mystery." },
  { id: "Anéis", label: "Aneis", description: "Aliancas delicadas, cristais e linhas minimalistas.", imagem: "/images/categorias/aneis.jpg" },
  { id: "Brincos", label: "Brincos", description: "Luz junto ao rosto, com zirconias e perolas.", imagem: "/images/categorias/brincos.jpg" },
  { id: "Colares", label: "Colares", description: "Pontos de brilho para decotes limpos.", imagem: "/images/categorias/colares.jpg" },
  { id: "Pulseiras", label: "Pulseiras", description: "Detalhes dourados para gestos elegantes.", imagem: "/images/categorias/pulseiras.jpg" },
];

const existingProducts: Product[] = [
  {
    id: 1,
    stableId: "andreas-1",
    slug: "anel-delicate-duas-aliancas",
    nome: "Anel Delicate",
    categoria: "Anéis",
    preco: 19.9,
    priceMultiplier: 1,
    price: 19.9,
    currency: "EUR",
    descricao: "Duas aliancas finas com brilho subtil, criadas para usar em conjunto ou separadas.",
    capa: "/images/produtos/anel-delicate-duas-aliancas/capa.jpg",
    imagens: [
      "/images/produtos/anel-delicate-duas-aliancas/foto1.jpg",
      "/images/produtos/anel-delicate-duas-aliancas/foto2.jpg",
      "/images/produtos/anel-delicate-duas-aliancas/foto3.jpg",
    ],
    detalhes: ["Aco inoxidavel", "Acabamento dourado", "Design ajustavel"],
    materiais: ["Aco inoxidavel"],
    isPublished: true,
    isFeatured: true,
    supplier: "Andrea's Mystery",
    supplierUrl: "https://andreasmystery.pt/produto/anel-delicate-duas-aliancas",
    importedAt: "2026-07-27T00:00:00.000Z",
    updatedAt: "2026-07-27T00:00:00.000Z",
    featured: true,
    novidade: true,
  },
  {
    id: 2,
    stableId: "andreas-2",
    slug: "anel-glamour",
    nome: "Anel Glamour",
    categoria: "Anéis",
    preco: 22.9,
    priceMultiplier: 1,
    price: 22.9,
    currency: "EUR",
    descricao: "Anel com presenca elegante e cristal luminoso, perfeito para ocasiões especiais.",
    capa: "/images/produtos/anel-glamour/capa.jpg",
    imagens: [
      "/images/produtos/anel-glamour/foto1.jpg",
      "/images/produtos/anel-glamour/foto2.jpg",
      "/images/produtos/anel-glamour/foto3.jpg",
    ],
    detalhes: ["Cristal lapidado", "Banho premium", "Brilho polido"],
    materiais: ["Cristal"],
    isPublished: true,
    isFeatured: true,
    supplier: "Andrea's Mystery",
    supplierUrl: "https://andreasmystery.pt/produto/anel-glamour",
    importedAt: "2026-07-27T00:00:00.000Z",
    updatedAt: "2026-07-27T00:00:00.000Z",
    featured: true,
  },
  {
    id: 3,
    stableId: "andreas-3",
    slug: "brincos-princesa",
    nome: "Brincos Princesa",
    categoria: "Brincos",
    preco: 24.9,
    priceMultiplier: 1,
    price: 24.9,
    currency: "EUR",
    descricao: "Brincos com zirconias brilhantes e silhueta refinada para iluminar o rosto.",
    capa: "/images/produtos/brincos-princesa/capa.jpg",
    imagens: [
      "/images/produtos/brincos-princesa/foto1.jpg",
      "/images/produtos/brincos-princesa/foto2.jpg",
      "/images/produtos/brincos-princesa/foto3.jpg",
    ],
    detalhes: ["Zirconias cravejadas", "Fecho leve", "Aco resistente"],
    materiais: ["Zirconias", "Aco"],
    isPublished: true,
    isFeatured: true,
    supplier: "Andrea's Mystery",
    supplierUrl: "https://andreasmystery.pt/produto/brincos-princesa",
    importedAt: "2026-07-27T00:00:00.000Z",
    updatedAt: "2026-07-27T00:00:00.000Z",
    featured: true,
    novidade: true,
  },
  {
    id: 4,
    stableId: "andreas-4",
    slug: "colar-celeste-perola",
    nome: "Colar Celeste Perola",
    categoria: "Colares",
    preco: 26.9,
    priceMultiplier: 1,
    price: 26.9,
    currency: "EUR",
    descricao: "Perola luminosa em corrente dourada, elegante sem esforco e delicada no decote.",
    capa: "/images/produtos/colar-celeste-perola/capa.jpg",
    imagens: [
      "/images/produtos/colar-celeste-perola/foto1.jpg",
      "/images/produtos/colar-celeste-perola/foto2.jpg",
      "/images/produtos/colar-celeste-perola/foto3.jpg",
    ],
    detalhes: ["Perola sintetica premium", "Corrente ajustavel", "Banho dourado"],
    materiais: ["Perola sintetica"],
    isPublished: true,
    isFeatured: false,
    supplier: "Andrea's Mystery",
    supplierUrl: "https://andreasmystery.pt/produto/colar-celeste-perola",
    importedAt: "2026-07-27T00:00:00.000Z",
    updatedAt: "2026-07-27T00:00:00.000Z",
    novidade: true,
  },
  {
    id: 5,
    stableId: "andreas-5",
    slug: "pulseira-lumiere",
    nome: "Pulseira Lumiere",
    categoria: "Pulseiras",
    preco: 17.9,
    priceMultiplier: 1,
    price: 17.9,
    currency: "EUR",
    descricao: "Malha fina com reflexos champagne para usar sozinha ou em composicao.",
    capa: "/images/produtos/pulseira-lumiere/capa.jpg",
    imagens: [
      "/images/produtos/pulseira-lumiere/foto1.jpg",
      "/images/produtos/pulseira-lumiere/foto2.jpg",
      "/images/produtos/pulseira-lumiere/foto3.jpg",
    ],
    detalhes: ["Ajustavel", "Acabamento polido", "Resistente ao uso diario"],
    materiais: [],
    isPublished: true,
    isFeatured: false,
    supplier: "Andrea's Mystery",
    supplierUrl: "https://andreasmystery.pt/produto/pulseira-lumiere",
    importedAt: "2026-07-27T00:00:00.000Z",
    updatedAt: "2026-07-27T00:00:00.000Z",
  },
  {
    id: 6,
    stableId: "andreas-6",
    slug: "argolas-prestige",
    nome: "Argolas Prestige",
    categoria: "Brincos",
    preco: 18.5,
    priceMultiplier: 1,
    price: 18.5,
    currency: "EUR",
    descricao: "Argolas elegantes com brilho subtil, acabamento sofisticado e perfil leve.",
    capa: "/images/produtos/argolas-prestige/capa.jpg",
    imagens: [
      "/images/produtos/argolas-prestige/foto1.jpg",
      "/images/produtos/argolas-prestige/foto2.jpg",
      "/images/produtos/argolas-prestige/foto3.jpg",
    ],
    detalhes: ["Aco premium", "Hipoalergenico", "Perfil leve"],
    materiais: ["Aco"],
    isPublished: true,
    isFeatured: true,
    supplier: "Andrea's Mystery",
    supplierUrl: "https://andreasmystery.pt/produto/argolas-prestige",
    importedAt: "2026-07-27T00:00:00.000Z",
    updatedAt: "2026-07-27T00:00:00.000Z",
    featured: true,
  },
];

const importedProducts: Product[] = grupoBelleProducts.map((product) => ({
  ...product,
  preco: roundCurrency(product.price),
  price: roundCurrency(product.price),
  isPublished: Boolean(
    product.sku &&
      publishedProductSkus.includes(product.sku) &&
      product.supplierPrice &&
      product.supplierPrice > 0 &&
      product.price > 0,
  ),
  isFeatured: Boolean(product.sku && publishedProductSkus.includes(product.sku) && featuredProductSkus.includes(product.sku)),
}));

export const catalogProducts: Product[] = [
  ...existingProducts,
  ...importedProducts,
];

export const products: Product[] = catalogProducts.filter((product) => product.isPublished);

export const newProducts: Product[] = products.filter((product) =>
  product.supplier === "Grupo Belle"
    ? Boolean(product.supplierProductId && newSupplierProductIds.includes(product.supplierProductId))
    : newExistingProductIds.includes(product.id),
);

export const bestSellerProducts: Product[] = products.filter((product) =>
  product.supplier === "Grupo Belle"
    ? Boolean(product.supplierProductId && bestSellerSupplierProductIds.includes(product.supplierProductId))
    : bestSellerExistingProductIds.includes(product.id),
);
