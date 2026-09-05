"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { History } from "lucide-react";
import { SerializedBillEmailLog } from "../types";

interface BillAuditLogsTableProps {
  emailLogs: SerializedBillEmailLog[];
}

export function BillAuditLogsTable({ emailLogs }: BillAuditLogsTableProps) {
  return (
    <Card className="p-5 border-border shadow-2xs bg-white space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-navy" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-navy">
            Email Reminder & Audit History
          </h3>
        </div>
        {emailLogs.length > 0 && (
          <span className="text-[11px] font-medium text-muted-foreground">
            {emailLogs.length} reminder{emailLogs.length === 1 ? "" : "s"} dispatched
          </span>
        )}
      </div>

      {emailLogs.length > 0 ? (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#F8FAFC] border-b border-border text-muted-foreground font-semibold text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Date & Time Sent</th>
                <th className="py-2.5 px-3">Recipient</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3 text-right">Delivery Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {emailLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F8FAFC]/50">
                  <td className="py-2.5 px-3 font-mono text-[11px] text-foreground font-medium">
                    {new Date(log.sentAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground">
                    {log.recipientEmail}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        log.emailType === "OVERDUE"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : log.emailType === "DUE_SOON"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {log.emailType.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground max-w-[280px] truncate" title={log.subject}>
                    {log.subject}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                        log.status === "SENT" ? "text-emerald-600" : "text-destructive"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          log.status === "SENT" ? "bg-emerald-600" : "bg-destructive"
                        }`}
                      />
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-6 rounded-xl bg-[#F8FAFC] border border-dashed border-border text-center text-xs text-muted-foreground">
          No reminder emails have been dispatched for this bill yet.
        </div>
      )}
    </Card>
  );
}
