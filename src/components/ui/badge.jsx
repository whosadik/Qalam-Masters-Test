// src/components/ui/badge.jsx
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

/**
 * Расширенные варианты бейджа:
 * - default / secondary / destructive / outline (как раньше)
 * - плюс info / success / warning / muted для статусов
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
  "transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // новые
        info: "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-100/80",
        success: "border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-100/80",
        warning: "border-transparent bg-amber-100 text-amber-800 hover:bg-amber-100/80",
        muted: "border-transparent bg-slate-100 text-slate-800 hover:bg-slate-100/80",
      },
      size: {
        sm: "text-[11px] px-2 py-0.5",
        md: "text-xs px-2.5 py-0.5",
        lg: "text-sm px-3 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

function Badge({ className, variant, size, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
