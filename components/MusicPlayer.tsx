"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./MusicPlayer.module.css";

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(true); // default to playing
  const [visible, setVisible] = useState(false);

  // Try to play on mount
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.25;
    // Try to play (some browsers will block until user gesture)
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise.then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
    const t = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src="/bg-music.mp3"
        autoPlay
        loop
        preload="auto"
        style={{ display: "none" }}
      />
      <button
        className={`${styles.btn} ${visible ? styles.visible : ""} ${playing ? styles.playing : ""}`}
        onClick={toggle}
        aria-label={playing ? "Pause background music" : "Play background music"}
        title={playing ? "Pause music" : "Play music"}
      >
        {/* Animated bars (visible when playing) */}
        <span className={styles.bars} aria-hidden="true">
          <span className={styles.bar} />
          <span className={styles.bar} />
          <span className={styles.bar} />
          <span className={styles.bar} />
        </span>
        {/* Mute icon (visible when paused) */}
        <span className={styles.muteIcon} aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        </span>
      </button>
    </>
  );
}
