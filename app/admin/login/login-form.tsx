"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, {} as LoginState);
  return (
    <form action={action} className="mt-8 grid gap-5">
      <label>
        <span className="mb-2 block text-xs font-bold uppercase tracking-[.2em] text-[#c9a45c]">Email</span>
        <input name="email" type="email" autoComplete="email" required className="min-h-12 w-full border border-[#c9a45c]/40 bg-black px-4 text-white outline-none focus:border-[#c9a45c]" />
      </label>
      <label>
        <span className="mb-2 block text-xs font-bold uppercase tracking-[.2em] text-[#c9a45c]">Password</span>
        <input name="password" type="password" autoComplete="current-password" required className="min-h-12 w-full border border-[#c9a45c]/40 bg-black px-4 text-white outline-none focus:border-[#c9a45c]" />
      </label>
      <p aria-live="polite" className="min-h-6 text-sm text-red-300">{state.error}</p>
      <button disabled={pending} className="min-h-12 bg-[#c9a45c] px-6 font-bold uppercase tracking-[.16em] text-black disabled:opacity-50">
        {pending ? "A entrar…" : "Entrar"}
      </button>
    </form>
  );
}
