"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ChatbotWidget } from "@/components/chatbot/chatbot-widget";
import { CookieConsent } from "@/components/cookie-consent";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MusicPlayer } from "@/components/music-player";

const localeRoot = /^\/(pt|en|es|fr|de|zh)\/?$/;

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const isBusinessChooser = localeRoot.test(pathname);

  return (
    <>
      {!isBusinessChooser && <Header />}
      {children}
      {!isBusinessChooser && <Footer />}
      <CookieConsent />
      {!isBusinessChooser && <MusicPlayer />}
      {!isBusinessChooser && <ChatbotWidget />}
    </>
  );
}
