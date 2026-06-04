import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Archive, Check, Mail, RotateCcw } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import * as reportService from "@/services/report.service";
import type { SupportReport, SupportReportStatus } from "@/types/report";
import { formatDate } from "@/utils/dates";
import { cn } from "@/lib/utils";

function typeLabel(type: SupportReport["type"]): string {
  return type === "REPORT" ? "Issue report" : "Contact";
}

export function ReportDetail(): ReactElement {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<SupportReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminNote, setAdminNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  async function load(markRead = false) {
    if (!id) return;
    setLoading(true);
    try {
      let r = await reportService.getReportById(id);
      if (markRead && r.status === "NEW") {
        r = await reportService.updateReportStatus(id, "READ");
      }
      setReport(r);
      setAdminNote(r.adminNote ?? "");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load report");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(true);
  }, [id]);

  async function setStatus(status: SupportReportStatus) {
    if (!id) return;
    setUpdatingStatus(true);
    try {
      const r = await reportService.updateReportStatus(id, status);
      setReport(r);
      toast.success(`Marked as ${status.toLowerCase()}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function saveNote() {
    if (!id) return;
    setSavingNote(true);
    try {
      const r = await reportService.updateReportNote(id, adminNote.trim() || null);
      setReport(r);
      toast.success("Note saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save note");
    } finally {
      setSavingNote(false);
    }
  }

  if (loading || !report) {
    return (
      <p className="animate-pulse text-sm text-muted-foreground">Loading message…</p>
    );
  }

  const fullName = `${report.firstName} ${report.lastName}`;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to="/reports">← Back to reports</Link>
        </Button>
        {report.status !== "READ" ? (
          <Button
            size="sm"
            variant="secondary"
            disabled={updatingStatus}
            onClick={() => void setStatus("READ")}
          >
            <Check className="mr-1.5 h-3.5 w-3.5" />
            Mark read
          </Button>
        ) : null}
        {report.status !== "ARCHIVED" ? (
          <Button
            size="sm"
            variant="secondary"
            disabled={updatingStatus}
            onClick={() => void setStatus("ARCHIVED")}
          >
            <Archive className="mr-1.5 h-3.5 w-3.5" />
            Archive
          </Button>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            disabled={updatingStatus}
            onClick={() => void setStatus("NEW")}
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Reopen
          </Button>
        )}
        <Button size="sm" asChild>
          <a href={`mailto:${encodeURIComponent(report.email)}?subject=Re: ${encodeURIComponent(report.subject || "Your message")}`}>
            <Mail className="mr-1.5 h-3.5 w-3.5" />
            Reply by email
          </a>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="border-border bg-card lg:col-span-3">
          <CardHeader className="space-y-2 border-b border-border pb-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <CardTitle className="font-display text-lg">{report.subject || typeLabel(report.type)}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={report.status} />
                <span
                  className={cn(
                    "badge text-[11px]",
                    report.type === "REPORT" ? "badge-red" : "badge-blue"
                  )}
                >
                  {typeLabel(report.type)}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Received {formatDate(report.createdAt)}
              {report.readAt ? ` · Read ${formatDate(report.readAt)}` : null}
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {report.message}
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">Sender</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="font-medium">{fullName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <a
                  href={`mailto:${report.email}`}
                  className="break-all font-medium text-primary hover:underline"
                >
                  {report.email}
                </a>
              </div>
              {report.phone ? (
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <a href={`tel:${report.phone}`} className="font-medium hover:underline">
                    {report.phone}
                  </a>
                </div>
              ) : null}
              <div>
                <p className="text-xs text-muted-foreground">Reference</p>
                <p className="font-mono text-xs text-muted-foreground">{report.id}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">Internal note</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="admin-note" className="sr-only">
                  Admin note
                </Label>
                <Textarea
                  id="admin-note"
                  rows={4}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Private note for your team…"
                  className="resize-y border-border bg-background text-foreground"
                />
              </div>
              <Button
                size="sm"
                className="w-full sm:w-auto"
                disabled={savingNote}
                onClick={() => void saveNote()}
              >
                {savingNote ? "Saving…" : "Save note"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
