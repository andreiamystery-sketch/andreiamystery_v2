"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/types/product";

export function ProductGallery({ product }: { product: Product }) {
  const [activeImage, setActiveImage] = useState(product.imagens[0] ?? product.capa);

  return (
    <div className="grid gap-4">
      <div className="relative aspect-[0.92] overflow-hidden bg-porcelain shadow-premium">
        <Image
          src={activeImage}
          alt={product.nome}
          fill
          priority
          sizes="(min-width: 1024px) 48vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {product.imagens.map((image) => (
          <button
            key={image}
            type="button"
            onClick={() => setActiveImage(image)}
            className={`relative aspect-square overflow-hidden bg-porcelain ${activeImage === image ? "ring-2 ring-champagne" : ""}`}
            aria-label={`Ver imagem ${product.nome}`}
          >
            <Image src={image} alt="" fill sizes="160px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
