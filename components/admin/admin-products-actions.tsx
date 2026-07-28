"use client";

export function AdminProductsActions({
  count, pending, onPublish, onHide, onAddBestSeller, onRemoveBestSeller,
  onAddNewArrival, onRemoveNewArrival, onClear,
}: {
  count: number; pending: boolean; onPublish: () => void; onHide: () => void;
  onAddBestSeller: () => void; onRemoveBestSeller: () => void;
  onAddNewArrival: () => void; onRemoveNewArrival: () => void; onClear: () => void;
}) {
  if (!count) return null;
  return (
    <div className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-7xl flex-wrap items-center gap-2 border border-[#c9a45c]/50 bg-[#111] p-3 shadow-2xl">
      <strong className="mr-auto px-2">{count} produtos selecionados</strong>
      <button disabled={pending} onClick={onPublish} className="min-h-11 bg-[#c9a45c] px-4 font-bold text-black disabled:opacity-50">Tornar visíveis</button>
      <button disabled={pending} onClick={onHide} className="min-h-11 border border-red-300/50 px-4 text-red-200 disabled:opacity-50">Ocultar</button>
      <button disabled={pending} onClick={onAddBestSeller} className="min-h-11 border border-[#c9a45c]/60 px-4 text-[#e4c37d] disabled:opacity-50">+ Best Seller</button>
      <button disabled={pending} onClick={onRemoveBestSeller} className="min-h-11 border border-white/15 px-4 text-white/70 disabled:opacity-50">− Best Seller</button>
      <button disabled={pending} onClick={onAddNewArrival} className="min-h-11 border border-sky-300/50 px-4 text-sky-200 disabled:opacity-50">+ Novo</button>
      <button disabled={pending} onClick={onRemoveNewArrival} className="min-h-11 border border-white/15 px-4 text-white/70 disabled:opacity-50">− Novo</button>
      <button disabled={pending} onClick={onClear} className="min-h-11 px-4 text-white/70">Limpar seleção</button>
    </div>
  );
}
