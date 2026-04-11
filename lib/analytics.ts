// ── Thin analytics wrapper ─────────────────────────────────────────────────
// Emits events via window.gtag (GA4) when available.
// Falls back to console.debug in development so calls are always visible.
// Never throws — analytics must never interrupt the user flow.

type Props = Record<string, string | number | boolean>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: string, props?: Props): void {
  try {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", event, props ?? {});
    } else {
      // eslint-disable-next-line no-console
      console.debug("[analytics]", event, props ?? {});
    }
  } catch {
    // Swallow — analytics must never block the user
  }
}
