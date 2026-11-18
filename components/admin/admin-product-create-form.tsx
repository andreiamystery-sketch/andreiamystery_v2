"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createManagedProduct } from "@/app/admin/(private)/produtos/create-action";
import type { ProductBusiness } from "@/types/product";

const fieldClass = "mt-2 min-h-12 w-full border border-white/15 bg-black px-4 py-3 text-white outline-none focus:border-[#c9a45c]";

export function AdminProductCreateForm() {
  const router = useRouter();
  const [business, setBusiness] = useState<ProductBusiness>("bijuteria");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const result = await createManagedProduct(formData);
      setMessage(result.message);
      setIsError(!result.ok);
      if (result.ok) {
        form.reset();
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-6 border border-[#c9a45c]/25 bg-[#0c0c0c] p-5 sm:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="text-sm text-white/75">Negócio
          <select name="business" value={business} onChange={(event) => setBusiness(event.target.value as ProductBusiness)} className={fieldClass}>
            <option value="bijuteria">Bijuteria</option>
            <option value="gravacoes">Gravações personalizadas</option>
          </select>
        </label>
        {business === "bijuteria" ? (
          <label className="text-sm text-white/75">Categoria
            <select name="category" className={fieldClass}>
              <option>Anéis</option><option>Brincos</option><option>Colares</option><option>Pulseiras</option>
            </select>
          </label>
        ) : (
          <label className="text-sm text-white/75">Formato/modelo
            <select name="format" className={fieldClass}>
              <option>Medalha em coração</option><option>Placa retangular</option><option>Medalha redonda</option><option>Árvore genealógica</option><option>Medalha para animal</option><option>Pendente com fotografia</option>
            </select>
          </label>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-[1fr_220px]">
        <label className="text-sm text-white/75">Nome do produto
          <input name="name" required maxLength={120} className={fieldClass} placeholder={business === "gravacoes" ? "Ex.: Medalha coração com fotografia" : "Ex.: Colar dourado"} />
        </label>
        <label className="text-sm text-white/75">Preço (€)
          <input name="price" type="number" required min="0" max="100000" step="0.01" className={fieldClass} placeholder="24,90" />
        </label>
      </div>

      <label className="text-sm text-white/75">Descrição
        <textarea name="description" required maxLength={2000} rows={4} className={fieldClass} placeholder="Apresenta a peça e os detalhes que a tornam especial." />
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="text-sm text-white/75">Detalhes (separados por vírgulas ou linhas)
          <textarea name="details" rows={3} className={fieldClass} placeholder="Aço inoxidável, acabamento prateado, gravação personalizada" />
        </label>
        <label className="text-sm text-white/75">Materiais (opcional)
          <textarea name="materials" rows={3} className={fieldClass} placeholder="Aço inoxidável, banho dourado" />
        </label>
      </div>

      <label className="text-sm text-white/75">Fotografias
        <input name="images" type="file" required multiple accept="image/jpeg,image/png,image/webp" className={`${fieldClass} file:mr-4 file:border-0 file:bg-[#c9a45c] file:px-4 file:py-2 file:font-bold file:text-black`} />
        <span className="mt-2 block text-xs text-white/45">JPG, PNG ou WebP · até 8 fotografias · total máximo 3,5 MB · a primeira será a capa.</span>
      </label>

      <fieldset className="flex flex-wrap gap-x-7 gap-y-3 border border-white/10 p-4 text-sm text-white/75">
        <legend className="px-2 text-xs uppercase tracking-[.16em] text-[#e4c37d]">Publicação</legend>
        <label className="flex items-center gap-2"><input name="visible" type="checkbox" defaultChecked className="h-4 w-4 accent-[#c9a45c]" />Visível na loja</label>
        <label className="flex items-center gap-2"><input name="bestSeller" type="checkbox" className="h-4 w-4 accent-[#c9a45c]" />Best Seller</label>
        <label className="flex items-center gap-2"><input name="newArrival" type="checkbox" defaultChecked className="h-4 w-4 accent-[#c9a45c]" />Novo</label>
      </fieldset>

      {message && <p role="status" className={isError ? "border border-red-300/30 p-3 text-sm text-red-200" : "border border-emerald-300/30 p-3 text-sm text-emerald-200"}>{message}</p>}
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={pending} className="min-h-12 bg-[#c9a45c] px-6 font-bold text-black disabled:opacity-50">{pending ? "A guardar…" : "Guardar produto"}</button>
        <button type="button" onClick={() => router.push("/admin/produtos")} className="min-h-12 border border-white/20 px-6 text-white/75">Cancelar</button>
      </div>
    </form>
  );
}
