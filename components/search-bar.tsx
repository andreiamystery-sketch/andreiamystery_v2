import { Search } from "lucide-react";

export function SearchBar({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex min-h-12 w-full max-w-md items-center gap-3 border border-gold/35 bg-black-warm px-4 text-warm-gray transition focus-within:border-gold">
      <Search size={17} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-transparent text-sm text-ivory outline-none placeholder:text-warm-gray"
        placeholder="Pesquisar produto"
      />
    </label>
  );
}
