"use client";

import * as React from "react";
import { Printer } from "lucide-react";
import { Button } from "./button";

interface PrintButtonProps {
  className?: string;
}

export function PrintButton({ className }: PrintButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => window.print()}
      className={className || "h-8 text-xs gap-1.5 cursor-pointer"}
    >
      <Printer className="w-3.5 h-3.5" /> Print
    </Button>
  );
}
