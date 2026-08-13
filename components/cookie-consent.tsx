"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/i18n/i18n-provider";

const consentKey = "andreas-mystery-cookie-consent";
const consentVersion = "2026-07-29";

type CookieConsentState = {
  version: string;
  date: string;
  necessary: true;
  statistics: boolean;
  marketing: boolean;
};

const defaultConsent: CookieConsentState = {
  version: consentVersion,
  date: "",
  necessary: true,
  statistics: false,
  marketing: false,
};

function readConsent() {
  try {
    const raw = window.localStorage.getItem(consentKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsentState;
    return parsed.version === consentVersion ? parsed : null;
  } catch {
    return null;
  }
}

function saveConsent(consent: CookieConsentState) {
  window.localStorage.setItem(consentKey, JSON.stringify({ ...consent, necessary: true, date: new Date().toISOString() }));
}

export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [preferences, setPreferences] = useState<CookieConsentState>(defaultConsent);
  const { dictionary: t } = useI18n();

  useEffect(() => {
    const existing = readConsent();
    if (existing) setPreferences(existing);
    else setOpen(true);

    const handler = () => {
      setCustomizing(true);
      setOpen(true);
    };
    window.addEventListener("andreas:open-cookie-preferences", handler);
    return () => window.removeEventListener("andreas:open-cookie-preferences", handler);
  }, []);

  const panelTitle = useMemo(() => customizing ? t.cookies.preferences : t.cookies.title, [customizing, t]);

  function commit(next: CookieConsentState) {
    saveConsent(next);
    setPreferences(next);
    setOpen(false);
    setCustomizing(false);
  }

  if (!open) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] px-4 pb-4 md:px-8" role="region" aria-label={t.cookies.preferences}>
      <div className="pointer-events-auto mx-auto max-w-4xl border border-champagne/30 bg-obsidian p-5 text-ivory shadow-[0_30px_100px_rgba(0,0,0,.55)] md:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="eyebrow">{t.cookies.label}</p>
            <h2 className="mt-2 font-serif text-3xl">{panelTitle}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-smoke">
              {t.cookies.text}
            </p>
          </div>
          <button type="button" className="text-sm font-bold uppercase tracking-[0.16em] text-champagne" onClick={() => setOpen(false)}>{t.actions.close}</button>
        </div>

        {customizing && (
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="border border-champagne/20 p-4"><strong className="font-serif text-xl">{t.cookies.necessary}</strong><p className="mt-2 text-sm text-smoke">{t.cookies.necessaryText}</p><p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-champagne">{t.cookies.always}</p></div>
            <label className="border border-champagne/20 p-4"><span className="flex items-center justify-between gap-3"><strong className="font-serif text-xl">{t.cookies.statistics}</strong><input type="checkbox" checked={preferences.statistics} onChange={(event) => setPreferences((current) => ({ ...current, statistics: event.target.checked }))} /></span><span className="mt-2 block text-sm text-smoke">{t.cookies.statisticsText}</span></label>
            <label className="border border-champagne/20 p-4"><span className="flex items-center justify-between gap-3"><strong className="font-serif text-xl">{t.cookies.marketing}</strong><input type="checkbox" checked={preferences.marketing} onChange={(event) => setPreferences((current) => ({ ...current, marketing: event.target.checked }))} /></span><span className="mt-2 block text-sm text-smoke">{t.cookies.marketingText}</span></label>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {customizing ? <button type="button" className="premium-button" onClick={() => commit(preferences)}>{t.cookies.save}</button> : <button type="button" className="premium-button" onClick={() => commit({ ...defaultConsent, statistics: true, marketing: true })}>{t.cookies.accept}</button>}
          <button type="button" className="ghost-button" onClick={() => commit(defaultConsent)}>{t.cookies.reject}</button>
          {!customizing && <button type="button" className="ghost-button" onClick={() => setCustomizing(true)}>{t.cookies.customize}</button>}
        </div>
      </div>
    </div>
  );
}



