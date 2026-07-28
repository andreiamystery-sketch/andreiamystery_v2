import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { ProductActions } from "@/components/product-actions";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { formatPrice } from "@/lib/format";
import { catalogProducts } from "@/data/products";
import { getPublishedProductBySlug, getPublishedProducts, toPublicProduct } from "@/lib/product-visibility";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return catalogProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const found = await getPublishedProductBySlug(slug);
  const product = found ? toPublicProduct(found) : undefined;

  if (!product) return {};

  return {
    title: product.nome,
    description: product.descricao,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const products = (await getPublishedProducts()).map(toPublicProduct);
  const product = products.find((item) => item.slug === slug);

  if (!product) notFound();

  const relatedProducts = products.filter((item) => item.categoria === product.categoria && item.id !== product.id).slice(0, 4);

  return (
    <main className="px-5 py-12 md:px-10 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Colecao", href: "/#colecao" }, { label: product.nome }]} />

        <section className="mt-8 grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <ProductGallery product={product} />

          <div className="self-center">
            <p className="eyebrow">{product.categoria}</p>
            <h1 className="mt-4 font-serif text-5xl leading-none md:text-7xl">{product.nome}</h1>
            <p className="mt-6 font-serif text-xl leading-relaxed text-smoke">{product.descricao}</p>
            <strong className="mt-7 block font-serif text-3xl text-velvet">{formatPrice(product.price)}</strong>

            <ProductActions product={product} />

            <div className="mt-10 border-y border-champagne/25 py-7">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-champagne">Detalhes</p>
              <ul className="mt-5 grid gap-3 font-serif text-lg text-smoke">
                {product.detalhes.map((detail) => (
                  <li key={detail}>• {detail}</li>
                ))}
              </ul>
            </div>

            <div className="mt-7 grid gap-3 text-sm uppercase tracking-[0.18em] text-smoke">
              <span>Envio nacional em Portugal</span>
              <span>Preparacao cuidada em embalagem premium</span>
              <span>Apoio por email e WhatsApp</span>
            </div>
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <p className="eyebrow">Tambem podes gostar</p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
