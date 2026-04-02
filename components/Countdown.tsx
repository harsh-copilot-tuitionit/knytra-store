"use client";

import { useState, useEffect } from "react";
import styles from "./Countdown.module.css";

interface CountdownProps {
  targetDate: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(targetDate: string): TimeLeft {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export default function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0, hours: 0, minutes: 0, seconds: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(calculateTimeLeft(targetDate));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  /* ── Skeleton while JS loads (avoids hydration mismatch) */
  if (!mounted) {
    return (
      <div className={styles.countdown} aria-hidden="true">
        {["DAYS", "HRS", "MIN", "SEC"].map((label, i) => (
          <div key={label} className={styles.unit}>
            <div className={styles.numberWrap}>
              <span className={styles.number}>--</span>
            </div>
            <span className={styles.label}>{label}</span>
            {i < 3 && <span className={styles.separator}>:</span>}
          </div>
        ))}
      </div>
    );
  }

  const units: { value: number; label: string }[] = [
    { value: timeLeft.days,    label: "DAYS" },
    { value: timeLeft.hours,   label: "HRS"  },
    { value: timeLeft.minutes, label: "MIN"  },
    { value: timeLeft.seconds, label: "SEC"  },
  ];

  return (
    <div
      className={styles.countdown}
      role="timer"
      aria-live="off"
      aria-label={`Launching in ${timeLeft.days} days, ${timeLeft.hours} hours, ${timeLeft.minutes} minutes, ${timeLeft.seconds} seconds`}
    >
      {units.map(({ value, label }, i) => (
        <div key={label} className={styles.unit}>
          <div className={styles.numberWrap}>
            <span
              className={styles.number}
              /* key change triggers the flip animation each second */
              key={`${label}-${value}`}
            >
              {pad(value)}
            </span>
          </div>
          <span className={styles.label}>{label}</span>
          {i < units.length - 1 && (
            <span className={styles.separator} aria-hidden="true">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
