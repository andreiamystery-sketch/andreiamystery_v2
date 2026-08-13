"use client";

import { useI18n } from "@/components/i18n/i18n-provider";
import { useEffect, useRef, useState, type MouseEvent } from "react";

export function MusicPlayer() {
  const { dictionary: t } = useI18n();
  const audioRef = useRef<HTMLAudioElement>(null);
  const userStoppedRef = useRef(false);
  const removeUnlockListenersRef = useRef<() => void>(() => {});
  const [playing, setPlaying] = useState(false);
  const label = playing ? t.header.soundOff : t.header.soundOn;

  useEffect(() => {
    const audio = audioRef.current;

    const syncPlayingState = () => {
      setPlaying(Boolean(audio && !audio.paused));
    };

    const removeUnlockListeners = () => {
      document.removeEventListener("click", startMusic);
      document.removeEventListener("touchstart", startMusic);
      document.removeEventListener("keydown", startMusic);
    };

    const startMusic = async () => {
      if (!audio || userStoppedRef.current) {
        removeUnlockListeners();
        return;
      }

      if (!audio.paused) {
        syncPlayingState();
        removeUnlockListeners();
        return;
      }

      try {
        audio.volume = 0.15;
        await audio.play();
        syncPlayingState();
        removeUnlockListeners();
      } catch {
        syncPlayingState();
      }
    };

    removeUnlockListenersRef.current = removeUnlockListeners;
    audio?.addEventListener("play", syncPlayingState);
    audio?.addEventListener("pause", syncPlayingState);
    document.addEventListener("click", startMusic);
    document.addEventListener("touchstart", startMusic);
    document.addEventListener("keydown", startMusic);

    return () => {
      removeUnlockListeners();
      audio?.removeEventListener("play", syncPlayingState);
      audio?.removeEventListener("pause", syncPlayingState);
    };
  }, []);

  const toggleMusic = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();

    const audio = audioRef.current;

    if (!audio) {
      setPlaying(false);
      return;
    }

    if (!audio.paused) {
      userStoppedRef.current = true;
      removeUnlockListenersRef.current();
      audio.pause();
      setPlaying(false);
      return;
    }

    try {
      userStoppedRef.current = false;
      removeUnlockListenersRef.current();
      audio.volume = 0.15;
      await audio.play();
      setPlaying(!audio.paused);
    } catch {
      setPlaying(false);
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src="/audio/andreas-mystery-theme.mp3"
        loop
        preload="auto"
      />

      <button
        type="button"
        onClick={toggleMusic}
        aria-label={label}
        title={label}
        className="music-player fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(5.5rem,calc(env(safe-area-inset-right)+5.5rem))] z-50 flex h-12 w-12 items-center justify-center rounded-full border border-gold bg-obsidian text-gold shadow-lg transition hover:scale-110 sm:bottom-6 sm:right-40"
      >
        <span aria-hidden="true">{playing ? "♪" : "♫"}</span>
      </button>
    </>
  );
}
