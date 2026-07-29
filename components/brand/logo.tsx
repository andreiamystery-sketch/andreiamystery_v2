"use client";

import Link from "next/link";
import { useI18n } from "@/components/i18n/i18n-provider";

type LogoVariant = "full" | "compact" | "monogram";

export function Logo({ variant = "full", className = "" }: { variant?: LogoVariant; className?: string }) {
  const { localizePath } = useI18n();
  return (
    <Link href={localizePath("/")} className={`brand-logo inline-grid justify-items-center text-gold ${className}`} aria-label="Andrea's Mystery - página inicial">
      <span className="brand-monogram font-serif leading-none" aria-hidden="true">AM</span>
      {variant !== "monogram" && <span className="mt-1 whitespace-nowrap font-serif text-[0.68rem] font-semibold tracking-[0.22em] sm:text-xs">ANDREA&apos;S MYSTERY</span>}
      {variant === "full" && <span className="mt-1 whitespace-nowrap text-[0.46rem] font-bold tracking-[0.38em] text-ivory/65 sm:text-[0.52rem]">BIJUTERIA PREMIUM</span>}
    </Link>
  );
}
