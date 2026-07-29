"use client";

import { useI18n } from "@/components/i18n/i18n-provider";

export function CookiePreferencesButton() {
  const { dictionary: t } = useI18n();
  return (
    <button type="button" className="text-left uppercase tracking-[0.16em] text-stone-400 transition hover:text-champagne" onClick={() => window.dispatchEvent(new Event("andreas:open-cookie-preferences"))}>
      {t.footer.cookies}
    </button>
  );
}
