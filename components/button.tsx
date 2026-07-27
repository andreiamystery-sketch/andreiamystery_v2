import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "ghost" | "dark";
  href?: string;
};

const variants = {
  primary: "border-champagne bg-champagne text-obsidian hover:bg-transparent hover:text-champagne",
  ghost: "border-champagne/55 bg-transparent text-champagne hover:bg-champagne hover:text-obsidian",
  dark: "border-obsidian bg-obsidian text-pearl hover:bg-transparent hover:text-obsidian",
};

export function Button({ children, variant = "primary", className = "", href, ...props }: ButtonProps) {
  const classes = `inline-flex min-h-11 items-center justify-center gap-2 border px-7 text-xs font-extrabold uppercase tracking-[0.18em] transition ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
