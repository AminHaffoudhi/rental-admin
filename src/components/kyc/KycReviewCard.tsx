import { useState, type ReactElement } from "react";
import { formatDistanceToNow } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { User } from "@/types/user";

export function KycReviewCard(props: {
  user: User;
  onApprove: () => Promise<void>;
  onReject: (note: string) => Promise<void>;
}): ReactElement {
  const { user } = props;
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [approving, setApproving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleApprove(): Promise<void> {
    setApproving(true);
    try {
      await props.onApprove();
    } finally {
      setApproving(false);
    }
  }

  async function handleReject(): Promise<void> {
    if (!reason.trim()) {
      return;
    }
    setSubmitting(true);
    try {
      await props.onReject(reason.trim());
    } finally {
      setSubmitting(false);
      setRejecting(false);
      setReason("");
    }
  }

  const submittedAt = user.kycDocument?.submittedAt
    ? formatDistanceToNow(new Date(user.kycDocument.submittedAt), { addSuffix: true })
    : "—";

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100">
          <span className="font-display text-base font-bold text-brand-700">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-stone-900">{user.name}</p>
            <StatusBadge status={user.role} />
          </div>
          <p className="mt-0.5 text-xs text-stone-500">{user.email}</p>
          {user.phone ? <p className="text-xs text-stone-400">{user.phone}</p> : null}
          <p className="mt-1 text-[10px] text-stone-400">Submitted {submittedAt}</p>
        </div>
        <StatusBadge status={user.kycStatus} />
      </div>

      {user.kycDocument?.documentUrl ? (
        <div className="mb-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
            Identity Document · {user.kycDocument.documentType?.replace(/_/g, " ") ?? "Unknown type"}
          </p>
          <button
            type="button"
            className="group relative w-full cursor-pointer overflow-hidden rounded-xl border border-stone-100 bg-stone-50 text-left"
            onClick={() => window.open(user.kycDocument?.documentUrl, "_blank", "noopener,noreferrer")}
          >
            <img
              src={user.kycDocument.documentUrl}
              alt="ID Document"
              className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/20">
              <div className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-stone-800 opacity-0 transition-opacity group-hover:opacity-100">
                View full size ↗
              </div>
            </div>
          </button>
        </div>
      ) : null}

      <AnimatePresence>
        {rejecting ? (
          <motion.div
            key="reject"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mb-3 rounded-xl border border-red-100 bg-red-50 p-3">
              <label className="mb-2 block text-xs font-semibold text-red-700">
                Rejection reason (required — sent to user)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Document is unclear, please re-upload a higher quality photo"
                rows={3}
                autoFocus
                className="w-full resize-none rounded-lg border border-red-200 bg-white p-2.5 text-xs text-stone-800 placeholder:text-stone-400 focus:border-red-400 focus:outline-none"
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleReject()}
                  disabled={!reason.trim() || submitting}
                  className="btn btn-sm flex-1 bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                >
                  {submitting ? "Rejecting…" : "Confirm Rejection"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRejecting(false);
                    setReason("");
                  }}
                  className="btn btn-sm btn-ghost"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!rejecting ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void handleApprove()}
            disabled={approving}
            className="btn flex-1 bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            {approving ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Approving…
              </span>
            ) : (
              <span className="inline-flex items-center justify-center gap-2">
                <CheckCircle size={14} />
                Approve
              </span>
            )}
          </button>
          <button type="button" onClick={() => setRejecting(true)} className="btn btn-danger flex-1">
            <span className="inline-flex items-center justify-center gap-2">
              <XCircle size={14} />
              Reject
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
