import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const HIGHLIGHT_MS = 3000;

export function useNotificationHighlight(refetch: () => Promise<void>): string | null {
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightParam = searchParams.get("highlight");
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);

  useEffect(() => {
    if (!highlightParam) {
      setActiveHighlight(null);
      return;
    }

    let cancelled = false;
    let clearTimer: ReturnType<typeof setTimeout> | undefined;

    void (async () => {
      await refetch();
      if (cancelled) {
        return;
      }

      setActiveHighlight(highlightParam);

      requestAnimationFrame(() => {
        document
          .getElementById(`highlight-${highlightParam}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });

      clearTimer = setTimeout(() => {
        setActiveHighlight(null);
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            next.delete("highlight");
            return next;
          },
          { replace: true }
        );
      }, HIGHLIGHT_MS);
    })();

    return () => {
      cancelled = true;
      if (clearTimer) {
        clearTimeout(clearTimer);
      }
    };
  }, [highlightParam, refetch, setSearchParams]);

  return activeHighlight;
}
