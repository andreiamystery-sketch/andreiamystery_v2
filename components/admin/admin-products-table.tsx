"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AdminProductsFilters,
  type FilterValues,
} from "./admin-products-filters";
import { AdminProductsActions } from "./admin-products-actions";
import {
  setFilteredProductsBestSeller,
  setFilteredProductsNewArrival,
  setFilteredProductsVisibility,
  setProductsBestSeller,
  setProductsNewArrival,
  setProductsVisibility,
} from "@/app/admin/(private)/produtos/actions";

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  image: string;
  sku?: string;
  stableId: string;
  supplierId?: string;
  category: string;
  supplier: string;
  price: number;
  visible: boolean;
  bestSeller: boolean;
  newArrival: boolean;
};

type SortOrder =
  | "default"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc";

const PAGE_SIZE = 50;

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();

const money = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR",
});

const validSortOrders: SortOrder[] = [
  "default",
  "price-asc",
  "price-desc",
  "name-asc",
  "name-desc",
];

function getInitialSort(value: string | null): SortOrder {
  if (value && validSortOrders.includes(value as SortOrder)) {
    return value as SortOrder;
  }

  return "default";
}

export function AdminProductsTable({
  products,
}: {
  products: AdminProduct[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  const initial: FilterValues = {
    query: params.get("query") ?? "",
    supplier: params.get("supplier") ?? "",
    category: params.get("category") ?? "",
    visibility: params.get("visibility") ?? "all",
  };

  const [filters, setFilters] = useState<FilterValues>(initial);
  const [sortOrder, setSortOrder] = useState<SortOrder>(
    getInitialSort(params.get("sort"))
  );
  const [page, setPage] = useState(
    Math.max(1, Number(params.get("page")) || 1)
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectAllFiltered, setSelectAllFiltered] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const query = normalize(filters.query);
    const selectedSupplier = normalize(filters.supplier);
    const selectedCategory = normalize(filters.category);

    const result = products.filter((product) => {
      const haystack = normalize(
        [
          product.name,
          product.id,
          product.sku,
          product.supplierId,
          product.stableId,
          product.category,
          product.supplier,
        ]
          .filter(Boolean)
          .join(" ")
      );

      const matchesQuery = !query || haystack.includes(query);

      const matchesSupplier =
        !selectedSupplier ||
        normalize(product.supplier) === selectedSupplier;

      const matchesCategory =
        !selectedCategory ||
        normalize(product.category) === selectedCategory;

      const matchesVisibility =
        filters.visibility === "all" ||
        (filters.visibility === "visible"
          ? product.visible
          : !product.visible);

      return (
        matchesQuery &&
        matchesSupplier &&
        matchesCategory &&
        matchesVisibility
      );
    });

    return [...result].sort((a, b) => {
      switch (sortOrder) {
        case "price-asc":
          return Number(a.price) - Number(b.price);

        case "price-desc":
          return Number(b.price) - Number(a.price);

        case "name-asc":
          return a.name.localeCompare(b.name, "pt-PT", {
            sensitivity: "base",
          });

        case "name-desc":
          return b.name.localeCompare(a.name, "pt-PT", {
            sensitivity: "base",
          });

        default:
          return 0;
      }
    });
  }, [filters, products, sortOrder]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);

  const pageProducts = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const selectedCount = selectAllFiltered
    ? filtered.length
    : selected.size;

  function buildUrl(
    nextFilters: FilterValues,
    nextSort: SortOrder,
    nextPage?: number
  ) {
    const query = new URLSearchParams();

    if (nextFilters.query.trim()) {
      query.set("query", nextFilters.query.trim());
    }

    if (nextFilters.supplier) {
      query.set("supplier", nextFilters.supplier);
    }

    if (nextFilters.category) {
      query.set("category", nextFilters.category);
    }

    if (nextFilters.visibility !== "all") {
      query.set("visibility", nextFilters.visibility);
    }

    if (nextSort !== "default") {
      query.set("sort", nextSort);
    }

    if (nextPage && nextPage > 1) {
      query.set("page", String(nextPage));
    }

    const queryString = query.toString();

    return queryString
      ? `/admin/produtos?${queryString}`
      : "/admin/produtos";
  }

  function updateFilters(next: FilterValues) {
    setFilters(next);
    setPage(1);
    setSelected(new Set());
    setSelectAllFiltered(false);
    setMessage("");

    router.replace(buildUrl(next, sortOrder));
  }

  function clearFilters() {
    const cleared: FilterValues = {
      query: "",
      supplier: "",
      category: "",
      visibility: "all",
    };

    updateFilters(cleared);
  }

  function updateSort(nextSort: SortOrder) {
    setSortOrder(nextSort);
    setPage(1);
    setSelected(new Set());
    setSelectAllFiltered(false);
    setMessage("");

    router.replace(buildUrl(filters, nextSort));
  }

  function changePage(next: number) {
    const nextPage = Math.max(1, Math.min(next, pages));

    setPage(nextPage);
    setSelected(new Set());
    setSelectAllFiltered(false);

    router.replace(buildUrl(filters, sortOrder, nextPage));
  }

  function toggle(id: string) {
    setSelectAllFiltered(false);

    setSelected((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  function togglePage() {
    const allSelected =
      pageProducts.length > 0 &&
      pageProducts.every((product) => selected.has(product.id));

    setSelectAllFiltered(false);

    setSelected((current) => {
      const next = new Set(current);

      pageProducts.forEach((product) => {
        if (allSelected) {
          next.delete(product.id);
        } else {
          next.add(product.id);
        }
      });

      return next;
    });
  }

  function selectAllResults() {
    setSelectAllFiltered(true);
    setSelected(new Set());
    setMessage("");
  }

  function clearSelection() {
    setSelected(new Set());
    setSelectAllFiltered(false);
    setMessage("");
  }

  function run(
    kind: "visibility" | "bestSeller" | "newArrival",
    value: boolean
  ) {
    if (!selectedCount) {
      setMessage("Seleciona pelo menos um produto.");
      return;
    }

    const labels = {
      visibility: value ? "tornar visíveis" : "ocultar",
      bestSeller: value ? "marcar como Best Seller" : "remover de Best Seller",
      newArrival: value ? "marcar como Novo" : "remover de Novo",
    };
    const action = labels[kind];

    if (
      !window.confirm(
        `Pretendes ${action} ${selectedCount} produtos?`
      )
    ) {
      return;
    }

    setMessage("");

    startTransition(async () => {
      const selectedIds = [...selected];
      const result = selectAllFiltered
        ? kind === "visibility"
          ? await setFilteredProductsVisibility(filters, value)
          : kind === "bestSeller"
            ? await setFilteredProductsBestSeller(filters, value)
            : await setFilteredProductsNewArrival(filters, value)
        : kind === "visibility"
          ? await setProductsVisibility(selectedIds, value)
          : kind === "bestSeller"
            ? await setProductsBestSeller(selectedIds, value)
            : await setProductsNewArrival(selectedIds, value);

      setMessage(result.message);

      if (result.ok) {
        setSelected(new Set());
        setSelectAllFiltered(false);
        router.refresh();
      }
    });
  }

  const suppliers = [
    ...new Set(
      products
        .map((product) => product.supplier)
        .filter(Boolean)
    ),
  ].sort((a, b) =>
    a.localeCompare(b, "pt-PT", { sensitivity: "base" })
  );

  const categories = [
    ...new Set(
      products
        .map((product) => product.category)
        .filter(Boolean)
    ),
  ].sort((a, b) =>
    a.localeCompare(b, "pt-PT", { sensitivity: "base" })
  );

  const allPageSelected =
    pageProducts.length > 0 &&
    pageProducts.every((product) => selected.has(product.id));

  return (
    <>
      <AdminProductsFilters
        value={filters}
        suppliers={suppliers}
        categories={categories}
        onChange={updateFilters}
        onClear={clearFilters}
      />

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <strong>{filtered.length} produtos encontrados</strong>

        <label className="flex min-w-[240px] items-center gap-3 sm:ml-auto">
          <span className="shrink-0 text-sm text-white/60">
            Ordenar por
          </span>

          <select
            value={sortOrder}
            onChange={(event) =>
              updateSort(event.target.value as SortOrder)
            }
            className="min-h-11 w-full border border-white/15 bg-[#111] px-4 text-white outline-none focus:border-[#c9a45c]"
          >
            <option value="default">Ordenação original</option>
            <option value="price-asc">
              Preço: mais baixo primeiro
            </option>
            <option value="price-desc">
              Preço: mais alto primeiro
            </option>
            <option value="name-asc">Nome: A–Z</option>
            <option value="name-desc">Nome: Z–A</option>
          </select>
        </label>

        <button
          type="button"
          onClick={togglePage}
          disabled={pageProducts.length === 0}
          className="min-h-11 border border-white/15 px-4 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {allPageSelected
            ? "Desmarcar página"
            : "Selecionar página"}
        </button>

        <button
          type="button"
          onClick={selectAllResults}
          disabled={filtered.length === 0}
          className="min-h-11 border border-[#c9a45c]/40 px-4 text-[#e4c37d] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Selecionar todos os resultados
        </button>
      </div>

      {selectedCount > 0 && (
        <p className="mt-3 text-sm text-[#e4c37d]">
          {selectedCount} produto
          {selectedCount === 1 ? "" : "s"} selecionado
          {selectedCount === 1 ? "" : "s"}.
        </p>
      )}

      <p
        aria-live="polite"
        className={`mt-3 min-h-6 text-sm ${
          message.toLowerCase().includes("sucesso")
            ? "text-emerald-300"
            : "text-amber-200"
        }`}
      >
        {pending ? "Alteração em curso…" : message}
      </p>

      {pageProducts.length === 0 ? (
        <div className="mt-8 border border-white/10 p-10 text-center text-white/60">
          Sem resultados.
        </div>
      ) : (
        <>
          <div className="mt-4 hidden overflow-hidden border border-white/10 md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[.05] text-xs uppercase tracking-wider text-white/60">
                <tr>
                  <th className="p-3">
                    <input
                      className="h-5 w-5"
                      type="checkbox"
                      aria-label="Selecionar página"
                      checked={allPageSelected}
                      onChange={togglePage}
                    />
                  </th>

                  <th className="p-3">Produto</th>
                  <th className="p-3">Referência</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Fornecedor</th>
                  <th className="p-3">Preço</th>
                  <th className="p-3">Estado</th>
                </tr>
              </thead>

              <tbody>
                {pageProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-t border-white/10"
                  >
                    <td className="p-3">
                      <input
                        className="h-5 w-5"
                        type="checkbox"
                        aria-label={`Selecionar ${product.name}`}
                        checked={
                          selectAllFiltered ||
                          selected.has(product.id)
                        }
                        onChange={() => toggle(product.id)}
                      />
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="h-12 w-12 object-cover"
                        />

                        <div>
                          <strong className="block">
                            {product.name}
                          </strong>

                          <small className="text-white/45">
                            ID {product.id}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      {product.sku ?? product.stableId}

                      {product.supplierId && (
                        <small className="block text-white/45">
                          supplierId {product.supplierId}
                        </small>
                      )}
                    </td>

                    <td className="p-3">{product.category}</td>
                    <td className="p-3">{product.supplier}</td>
                    <td className="p-3">
                      {money.format(product.price)}
                    </td>

                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        <ProductStateBadge active={product.visible} activeLabel="Visível" inactiveLabel="Oculto" tone="visible" />
                        <ProductStateBadge active={product.bestSeller} activeLabel="Best Seller" />
                        <ProductStateBadge active={product.newArrival} activeLabel="Novo" tone="new" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid gap-3 md:hidden">
            {pageProducts.map((product) => (
              <article
                key={product.id}
                className="grid grid-cols-[28px_64px_1fr] gap-3 border border-white/10 p-3"
              >
                <input
                  className="mt-5 h-6 w-6"
                  type="checkbox"
                  aria-label={`Selecionar ${product.name}`}
                  checked={
                    selectAllFiltered ||
                    selected.has(product.id)
                  }
                  onChange={() => toggle(product.id)}
                />

                <Image
                  src={product.image}
                  alt={product.name}
                  width={64}
                  height={64}
                  className="h-16 w-16 object-cover"
                />

                <div className="min-w-0">
                  <strong className="block truncate">
                    {product.name}
                  </strong>

                  <p className="text-xs text-white/50">
                    {product.sku ?? product.stableId} ·{" "}
                    {product.supplier}
                  </p>

                  <p className="mt-1 text-sm">
                    {money.format(product.price)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <ProductStateBadge active={product.visible} activeLabel="Visível" inactiveLabel="Oculto" tone="visible" />
                    <ProductStateBadge active={product.bestSeller} activeLabel="Best Seller" />
                    <ProductStateBadge active={product.newArrival} activeLabel="Novo" tone="new" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      <nav className="mt-6 flex items-center justify-center gap-3 pb-28">
        <button
          type="button"
          disabled={safePage <= 1}
          onClick={() => changePage(safePage - 1)}
          className="min-h-11 border border-white/15 px-4 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Anterior
        </button>

        <span>
          Página {safePage} de {pages}
        </span>

        <button
          type="button"
          disabled={safePage >= pages}
          onClick={() => changePage(safePage + 1)}
          className="min-h-11 border border-white/15 px-4 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Seguinte
        </button>
      </nav>

      <AdminProductsActions
        count={selectedCount}
        pending={pending}
        onPublish={() => run("visibility", true)}
        onHide={() => run("visibility", false)}
        onAddBestSeller={() => run("bestSeller", true)}
        onRemoveBestSeller={() => run("bestSeller", false)}
        onAddNewArrival={() => run("newArrival", true)}
        onRemoveNewArrival={() => run("newArrival", false)}
        onClear={clearSelection}
      />
    </>
  );
}

function ProductStateBadge({
  active,
  activeLabel,
  inactiveLabel,
  tone = "best",
}: {
  active: boolean;
  activeLabel: string;
  inactiveLabel?: string;
  tone?: "visible" | "best" | "new";
}) {
  if (!active && !inactiveLabel) return null;

  const activeClass = {
    visible: "border-emerald-300/30 bg-emerald-300/10 text-emerald-300",
    best: "border-[#c9a45c]/40 bg-[#c9a45c]/10 text-[#e4c37d]",
    new: "border-sky-300/30 bg-sky-300/10 text-sky-300",
  }[tone];

  return (
    <span className={`whitespace-nowrap border px-2 py-1 text-xs ${active ? activeClass : "border-white/10 text-white/45"}`}>
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
