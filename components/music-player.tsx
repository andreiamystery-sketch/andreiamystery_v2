"use client";

import { useEffect, useRef, useState } from "react";

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const startMusic = async () => {
      const audio = audioRef.current;

      if (!audio || !audio.paused) {
        return;
      }

      try {
        audio.volume = 0.15;
        await audio.play();
        setPlaying(true);

        document.removeEventListener("click", startMusic);
        document.removeEventListener("touchstart", startMusic);
        document.removeEventListener("keydown", startMusic);
      } catch {
        setPlaying(false);
      }
    };

    document.addEventListener("click", startMusic);
    document.addEventListener("touchstart", startMusic);
    document.addEventListener("keydown", startMusic);

    return () => {
      document.removeEventListener("click", startMusic);
      document.removeEventListener("touchstart", startMusic);
      document.removeEventListener("keydown", startMusic);
    };
  }, []);

  const toggleMusic = async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (audio.paused) {
      try {
        audio.volume = 0.15;
        await audio.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    } else {
      audio.pause();
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
        aria-label={playing ? "Desligar música" : "Ligar música"}
        title={playing ? "Desligar música" : "Ligar música"}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-gold bg-obsidian text-gold shadow-lg transition hover:scale-110"
      >
        <span aria-hidden="true">
          {playing ? "♪" : "♫"}
        </span>
      </button>
    </>
  );
}