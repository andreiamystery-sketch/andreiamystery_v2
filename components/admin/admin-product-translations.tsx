"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { activeLocales, type AppLocale } from "@/config/locales";
import { saveProductTranslations } from "@/app/admin/(private)/produtos/actions";

export type AdminProductTranslationValue = {
  name: string;
  shortDescription: string;
  description: string;
  categoryName: string;
  materials: string;
  details: string;
  availability: string;
  seoTitle: string;
  seoDescription: string;
};

export type AdminProductTranslation = { id: string; name: string; translations: Record<AppLocale, AdminProductTranslationValue> };

const requiredFields: Array<keyof AdminProductTranslationValue> = ["name", "shortDescription", "description", "categoryName"];

function translationStatus(value: AdminProductTranslationValue, required: boolean) {
  const complete = requiredFields.every((field) => value[field].trim().length > 0);
  const empty = Object.values(value).every((field) => field.trim().length === 0);
  if (complete) return { label: "completa", className: "border-emerald-300/30 bg-emerald-300/10 text-emerald-200" };
  if (!required && empty) return { label: "fallback", className: "border-white/15 bg-white/5 text-white/50" };
  return { label: "incompleta", className: "border-amber-300/30 bg-amber-300/10 text-amber-100" };
}

function textareaLabel(field: keyof AdminProductTranslationValue) {
  return field === "materials" ? "Materiais (um por linha)" : "Detalhes (um por linha)";
}

export function AdminProductTranslations({ products }: { products: AdminProductTranslation[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(products[0]?.id ?? "");
  const selected = useMemo(() => products.find((product) => product.id === selectedId) ?? products[0], [products, selectedId]);
  const [locale, setLocale] = useState<AppLocale>("pt-PT");
  const [draft, setDraft] = useState(selected ?? null);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function choose(id: string) {
    const next = products.find((product) => product.id === id) ?? products[0];
    setSelectedId(id);
    setDraft(next ?? null);
    setMessage("");
  }

  function update(field: keyof AdminProductTranslationValue, value: string) {
    setDraft((current) => current ? { ...current, translations: { ...current.translations, [locale]: { ...current.translations[locale], [field]: value } } } : current);
  }

  if (!draft) return null;
  const current = draft.translations[locale];

  return (
    <section className="mt-8 border-t border-white/10 pt-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h2 className="font-serif text-2xl">Traduções de produtos</h2><p className="mt-2 max-w-2xl text-sm text-white/50">Edita todas as línguas ativas. Português é obrigatório e funciona como fallback; os outros idiomas podem ficar em fallback até serem revistos.</p></div>
        <label className="grid min-w-[280px] gap-2 text-sm text-white/60">Produto<select value={selectedId} onChange={(event) => choose(event.target.value)} className="min-h-11 border border-white/15 bg-[#111] px-4 text-white outline-none focus:border-[#c9a45c]">{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">{activeLocales.map((item) => { const status = translationStatus(draft.translations[item.locale], item.code === "pt"); return <button key={item.code} type="button" onClick={() => setLocale(item.locale)} className={`border px-3 py-2 text-sm ${locale === item.locale ? "border-[#c9a45c] text-[#e4c37d]" : "border-white/15 text-white/60"}`}>{item.nativeName}<span className={`ml-2 border px-2 py-0.5 text-[10px] uppercase ${status.className}`}>{status.label}</span></button>; })}</div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <label><span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-white/45">Nome ({locale})</span><input value={current.name} onChange={(event) => update("name", event.target.value)} className="min-h-11 w-full border border-white/15 bg-black px-3 text-white outline-none focus:border-[#c9a45c]" /></label>
        <label><span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-white/45">Categoria apresentada ({locale})</span><input value={current.categoryName} onChange={(event) => update("categoryName", event.target.value)} className="min-h-11 w-full border border-white/15 bg-black px-3 text-white outline-none focus:border-[#c9a45c]" /></label>
        <label className="lg:col-span-2"><span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-white/45">Descrição curta ({locale})</span><textarea rows={3} value={current.shortDescription} onChange={(event) => update("shortDescription", event.target.value)} className="w-full border border-white/15 bg-black p-3 text-white outline-none focus:border-[#c9a45c]" /></label>
        <label className="lg:col-span-2"><span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-white/45">Descrição completa ({locale})</span><textarea rows={5} value={current.description} onChange={(event) => update("description", event.target.value)} className="w-full border border-white/15 bg-black p-3 text-white outline-none focus:border-[#c9a45c]" /></label>
        {(["materials", "details"] as const).map((field) => <label key={field}><span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-white/45">{textareaLabel(field)}</span><textarea rows={5} value={current[field]} onChange={(event) => update(field, event.target.value)} className="w-full border border-white/15 bg-black p-3 text-white outline-none focus:border-[#c9a45c]" /></label>)}
        <label><span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-white/45">Disponibilidade ({locale})</span><input value={current.availability} onChange={(event) => update("availability", event.target.value)} className="min-h-11 w-full border border-white/15 bg-black px-3 text-white outline-none focus:border-[#c9a45c]" /></label>
        <label><span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-white/45">SEO title ({locale})</span><input value={current.seoTitle} onChange={(event) => update("seoTitle", event.target.value)} className="min-h-11 w-full border border-white/15 bg-black px-3 text-white outline-none focus:border-[#c9a45c]" /></label>
        <label className="lg:col-span-2"><span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-white/45">SEO description ({locale})</span><textarea rows={3} value={current.seoDescription} onChange={(event) => update("seoDescription", event.target.value)} className="w-full border border-white/15 bg-black p-3 text-white outline-none focus:border-[#c9a45c]" /></label>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3"><button type="button" disabled={pending} className="min-h-11 border border-[#c9a45c]/50 px-5 font-bold text-[#e4c37d] disabled:opacity-50" onClick={() => startTransition(async () => { const result = await saveProductTranslations(draft.id, draft.translations); setMessage(result.message); if (result.ok) router.refresh(); })}>Guardar traduções</button><p aria-live="polite" className="text-sm text-[#e4c37d]">{pending ? "A guardar..." : message}</p></div>
    </section>
  );
}
