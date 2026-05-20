import { AnimatePresence, motion } from "framer-motion";
import type { ReactElement, ReactNode } from "react";
import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ConfirmDialog(props: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmLabel?: string;
  variant?: "default" | "destructive" | "danger";
  isLoading?: boolean;
  children?: ReactNode;
}): ReactElement {
  const {
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = "Confirm",
    variant = "default",
    isLoading = false,
    children,
  } = props;

  const danger = variant === "destructive" || variant === "danger";
  const [internalLoading, setInternalLoading] = useState(false);
  const busy = isLoading || internalLoading;

  async function handleConfirm() {
    setInternalLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      /* parent toast / error */
    } finally {
      setInternalLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !busy && onClose()}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-start justify-between border-b border-stone-100 p-5">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl",
                      danger ? "bg-red-50" : "bg-brand-50"
                    )}
                  >
                    <AlertTriangle size={17} className={danger ? "text-red-500" : "text-brand-500"} />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold text-stone-900">{title}</h3>
                    {description ? (
                      <p className="mt-0.5 text-xs text-stone-500">{description}</p>
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => !busy && onClose()}
                  className="text-stone-400 transition-colors hover:text-stone-600"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {children ? <div className="px-5 py-4">{children}</div> : null}

              <div className="flex items-center justify-end gap-2 border-t border-stone-100 bg-stone-50 px-5 py-4">
                <button type="button" className="btn btn-secondary" disabled={busy} onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleConfirm()}
                  className={cn(
                    "btn min-h-[40px]",
                    danger ? "bg-red-500 text-white hover:bg-red-600" : "btn-primary"
                  )}
                >
                  {busy ? "Processing…" : confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
