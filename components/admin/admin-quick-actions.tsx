"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setFilteredProductsVisibility } from "@/app/admin/(private)/produtos/actions";

export function AdminQuickActions({ categories }: { categories: string[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const actions = [
    { label: "Grupo Belle", filters: { supplier: "Grupo Belle" } },
    ...categories.filter((category) => ["Brincos", "Colares"].includes(category)).map((category) => ({ label: category.toLowerCase(), filters: { category } })),
  ];
  function run(label: string, filters: { supplier?: string; category?: string }, visible: boolean) {
    if (!confirm(`Pretendes ${visible ? "publicar" : "ocultar"} todos os produtos de ${label}?`)) return;
    startTransition(async () => {
      const result = await setFilteredProductsVisibility({ ...filters, visibility: "all" }, visible);
      setMessage(result.message);
      if (result.ok) router.refresh();
    });
  }
  return (
    <section className="mt-8 border border-[#c9a45c]/25 p-5">
      <h2 className="font-serif text-2xl">Ações rápidas</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {actions.flatMap(({ label, filters }) => [
          <button key={`${label}-show`} disabled={pending} onClick={() => run(label, filters, true)} className="min-h-11 border border-emerald-300/30 px-4 text-emerald-200">Publicar todos os {label}</button>,
          <button key={`${label}-hide`} disabled={pending} onClick={() => run(label, filters, false)} className="min-h-11 border border-red-300/30 px-4 text-red-200">Ocultar todos os {label}</button>,
        ])}
      </div>
      <p aria-live="polite" className="mt-3 min-h-5 text-sm text-white/60">{pending ? "Alteração em curso…" : message}</p>
    </section>
  );
}
