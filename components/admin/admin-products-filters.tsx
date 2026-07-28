"use client";

export type FilterValues = { query: string; supplier: string; category: string; visibility: string };

export function AdminProductsFilters({ value, suppliers, categories, onChange, onClear }: {
  value: FilterValues; suppliers: string[]; categories: string[];
  onChange: (value: FilterValues) => void; onClear: () => void;
}) {
  const field = (key: keyof FilterValues, next: string) => onChange({ ...value, [key]: next });
  return (
    <details open className="border border-white/10 bg-white/[.03] p-4">
      <summary className="cursor-pointer font-bold md:hidden">Pesquisa e filtros</summary>
      <div className="mt-4 grid gap-3 md:mt-0 md:grid-cols-5">
        <input aria-label="Pesquisar produtos" value={value.query} onChange={(e) => field("query", e.target.value)} placeholder="Nome, ID, SKU, supplierId…" className="min-h-11 border border-white/15 bg-black px-3 md:col-span-2" />
        <select aria-label="Fornecedor" value={value.supplier} onChange={(e) => field("supplier", e.target.value)} className="min-h-11 border border-white/15 bg-black px-3">
          <option value="">Todos os fornecedores</option>{suppliers.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select aria-label="Categoria" value={value.category} onChange={(e) => field("category", e.target.value)} className="min-h-11 border border-white/15 bg-black px-3">
          <option value="">Todas as categorias</option>{categories.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select aria-label="Visibilidade" value={value.visibility} onChange={(e) => field("visibility", e.target.value)} className="min-h-11 border border-white/15 bg-black px-3">
          <option value="all">Todos</option><option value="visible">Visíveis</option><option value="hidden">Ocultos</option>
        </select>
        <button type="button" onClick={onClear} className="min-h-11 border border-[#c9a45c]/50 px-4 text-[#e4c37d] md:col-start-5">Limpar filtros</button>
      </div>
    </details>
  );
}
