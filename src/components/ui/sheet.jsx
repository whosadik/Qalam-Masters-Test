"use client";
import React, { useEffect } from "react";



export function Sheet({ open, onOpenChange, children }) {
  // Закрытие по ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onOpenChange?.(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex"
      aria-modal="true"
      role="dialog"
      onClick={(e) => {
        // клик по фону закрывает
        if (e.target === e.currentTarget) onOpenChange?.(false);
      }}
    >
      {/* затемнение */}
      <div className="absolute inset-0 bg-black/40" />

      {/* контент приходит через SheetContent */}
      {/* children рендерится поверх, чтобы поймать клики */}
      <div className="relative z-[61] flex w-full h-full">{children}</div>
    </div>
  );
}

export function SheetContent({
  children,
  side = "right",
  className = "",
  widthClass = "w-full sm:max-w-2xl",
}) {
  // стороны: right | left | top | bottom
  const base =
    "bg-white shadow-xl h-full max-h-full overflow-auto transition-transform duration-300";
  const sideClass =
    side === "left"
      ? "translate-x-0 ml-0 mr-auto border-r animate-in"
      : side === "top"
      ? "w-full h-auto max-h-[90vh] translate-y-0 mt-0 mb-auto border-b animate-in"
      : side === "bottom"
      ? "w-full h-auto max-h-[90vh] translate-y-0 mt-auto mb-0 border-t animate-in"
      : // right (default)
        "translate-x-0 ml-auto mr-0 border-l animate-in";

  return (
    <div className={`relative ${widthClass} ${className} ${base} ${sideClass}`}>
      {children}
    </div>
  );
}

export function SheetHeader({ children, className = "" }) {
  return <div className={`p-4 border-b ${className}`}>{children}</div>;
}

export function SheetTitle({ children, className = "" }) {
  return (
    <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>
      {children}
    </h3>
  );
}

export function SheetFooter({ children, className = "" }) {
  return (
    <div className={`p-4 border-t flex items-center justify-end gap-2 ${className}`}>
      {children}
    </div>
  );
}
