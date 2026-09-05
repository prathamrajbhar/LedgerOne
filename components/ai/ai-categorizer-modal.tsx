"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, CheckCircle2, ArrowRight, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { categorizeTransactionAction } from "@/app/actions/ai-features.actions";

interface AiCategorizerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectCategory?: (result: {
    accountId: string;
    accountName: string;
    analyticAccountId?: string;
  }) => void;
}

export function AiCategorizerModal({
  open,
  onOpenChange,
  onSelectCategory,
}: AiCategorizerModalProps) {
  const [memo, setMemo] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<{
    accountId: string;
    accountName: string;
    accountCode: string;
    analyticAccountId?: string;
    analyticAccountName?: string;
    confidence: number;
    reasoning: string;
    isAiGenerated: boolean;
  } | null>(null);

  const handleCategorize = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!memo.trim()) {
      toast.error("Please enter a transaction memo or description");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await categorizeTransactionAction({
        memo: memo.trim(),
        amount: amount ? parseFloat(amount) : undefined,
      });

      if (res.success && res.data) {
        setResult(res.data);
        toast.success("AI Categorization complete!");
      } else {
        toast.error(res.error || "Categorization failed");
      }
    } catch {
      toast.error("An unexpected error occurred during categorization");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    if (onSelectCategory) {
      onSelectCategory({
        accountId: result.accountId,
        accountName: `${result.accountCode} - ${result.accountName}`,
        analyticAccountId: result.analyticAccountId,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-navy">
            <div className="p-2 rounded-lg bg-teal/10 text-teal">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">AI Transaction Categorizer</DialogTitle>
              <DialogDescription className="text-xs">
                Extract General Ledger & Analytic Accounts instantly using Gemini AI.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleCategorize} className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Transaction Memo / Description <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. HPCL Petrol Station Gandhinagar, Sawmill Timber, AWS Cloud Services"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Transaction Amount (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">₹</span>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-9 pl-7 pr-3 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !memo.trim()}
            className="w-full bg-navy hover:bg-navy-hover text-white text-xs gap-1.5"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Analyzing with Gemini AI...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Categorize Transaction
              </>
            )}
          </Button>
        </form>

        {result && (
          <div className="mt-4 p-4 rounded-xl border border-teal/30 bg-teal/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-navy flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal" /> AI Suggestion
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-teal/20 text-teal font-semibold">
                {Math.round(result.confidence * 100)}% Confidence
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white border border-border">
                <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Chart of Account</span>
                <span className="font-bold text-navy block mt-0.5">
                  {result.accountCode} - {result.accountName}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-border">
                <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Analytic Account</span>
                <span className="font-bold text-foreground block mt-0.5">
                  {result.analyticAccountName || "General / Unassigned"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground bg-white/70 p-2 rounded-lg border border-border/50">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span>{result.reasoning}</span>
            </div>

            {onSelectCategory && (
              <Button
                onClick={handleApply}
                className="w-full bg-teal hover:bg-teal/90 text-white text-xs gap-1.5 shadow-sm"
              >
                Apply Category <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
