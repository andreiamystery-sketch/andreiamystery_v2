"use client";

import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { CartDrawer } from "@/components/cart-drawer";
import { Logo } from "@/components/brand/logo";
import { SearchDrawer } from "@/components/search-drawer";
import { TopBar } from "@/components/top-bar";
import { useStore } from "@/hooks/use-store";
import { upcomingEventPresences } from "@/data/events";
import { publishedTestimonials } from "@/data/testimonials";
import { publishedSalesLocations } from "@/data/sales-locations";

const navItems = [
  { href: "/#colecao", label: "Colecao" },
  { href: "/#novidades", label: "Novidades" },
  { href: "/#best-sellers", label: "Best-sellers" },
  ...(upcomingEventPresences.length > 0 ? [{ href: "/#presencas", label: "Presencas" }] : []),
  ...(publishedSalesLocations.length > 0 ? [{ href: "/#pontos-de-venda", label: "Pontos de venda" }] : []),
  ...(publishedTestimonials.length > 0 ? [{ href: "/#testemunhos", label: "Testemunhos" }] : []),
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { cartCount, favorites } = useStore();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gold/30 bg-obsidian/95 text-ivory backdrop-blur-xl">
        <TopBar />
        <div className="mx-auto grid min-h-20 max-w-[90rem] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 transition-all md:min-h-24 md:px-8">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center border border-gold/30 text-gold md:hidden"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Abrir menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Logo className="col-start-2 md:col-start-1 md:justify-self-start" />

          <nav aria-label="Navegação principal" className="hidden justify-self-center text-[0.68rem] font-bold uppercase tracking-[0.18em] md:col-start-2 md:flex md:items-center md:gap-5 xl:gap-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="relative py-3 text-warm-gray transition after:absolute after:inset-x-1 after:bottom-0 after:h-px after:origin-center after:scale-x-0 after:bg-gold after:transition hover:text-ivory hover:after:scale-x-100">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="col-start-3 row-start-1 flex justify-self-end">
            <button className="icon-button" type="button" onClick={() => setSearchOpen(true)} aria-label="Pesquisar">
              <Search size={18} />
            </button>
            <Link className="icon-button relative" href="/#favoritos" aria-label="Favoritos">
              <Heart size={18} />
              {favorites.length > 0 && <span className="pill-counter">{favorites.length}</span>}
            </Link>
            <button className="icon-button relative" type="button" onClick={() => setCartOpen(true)} aria-label="Carrinho">
              <ShoppingBag size={18} />
              {cartCount > 0 && <span className="pill-counter">{cartCount}</span>}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav aria-label="Navegação móvel" className="grid gap-1 border-t border-gold/20 bg-black-warm px-5 py-5 text-sm font-bold uppercase tracking-[0.2em] md:hidden">
            {navItems.map((item) => (
              <Link className="min-h-11 border-b border-gold/10 py-3 text-warm-gray" key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <SearchDrawer open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
