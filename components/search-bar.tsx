"use client";

import { Search } from "lucide-react";
import { useI18n } from "@/components/i18n/i18n-provider";

export function SearchBar({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { dictionary: t } = useI18n();
  return (
    <label className="flex min-h-12 w-full max-w-md items-center gap-3 border border-gold/35 bg-black-warm px-4 text-warm-gray transition focus-within:border-gold">
      <Search size={17} />
      <input value={value} onChange={(event) => onChange(event.target.value)} className="w-full bg-transparent text-sm text-ivory outline-none placeholder:text-warm-gray" placeholder={t.search.placeholder} aria-label={t.search.placeholder} />
    </label>
  );
}
