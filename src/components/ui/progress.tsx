// src/components/ui/progress.tsx
"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export function Progress({ value = 0, className }) {
  return (
    <div className={cn("h-2 w-full rounded-full bg-slate-200", className)}>
      <div
        className="h-2 rounded-full bg-indigo-600 transition-[width]"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
