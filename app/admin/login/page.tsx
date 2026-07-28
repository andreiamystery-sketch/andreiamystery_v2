import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata = { title: "Administração" };

export default function AdminLoginPage() {
  return (
    <main className="admin-shell grid min-h-screen place-items-center bg-[#080808] px-5 py-12 text-white">
      <section className="w-full max-w-md border border-[#c9a45c]/35 bg-[#111] p-7 shadow-2xl sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[.3em] text-[#c9a45c]">Andrea&apos;s Mystery</p>
        <h1 className="mt-3 font-serif text-4xl">Área privada</h1>
        <p className="mt-3 text-sm text-white/60">Inicia sessão para gerir a visibilidade do catálogo.</p>
        <LoginForm />
        <Link href="/" className="mt-7 block text-center text-sm text-[#c9a45c] hover:underline">Voltar à loja</Link>
      </section>
    </main>
  );
}
