// src/components/ui/card.jsx
import * as React from "react";
import { cn } from "../../lib/utils";

/**
 * Аккуратная карточка с мягкой адаптивной подачей
 */
const Card = React.forwardRef(function Card({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        "sm:rounded-xl sm:shadow",
        className
      )}
      {...props}
    />
  );
});
Card.displayName = "Card";

const CardHeader = React.forwardRef(function CardHeader(
  { className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col gap-1.5 p-4 sm:p-6", className)}
      {...props}
    />
  );
});
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(function CardTitle(
  { className, ...props },
  ref
) {
  return (
    <h3
      ref={ref}
      className={cn(
        "text-lg sm:text-xl md:text-2xl font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  );
});
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(function CardDescription(
  { className, ...props },
  ref
) {
  return (
    <p
      ref={ref}
      className={cn("text-sm sm:text-base text-muted-foreground", className)}
      {...props}
    />
  );
});
CardDescription.displayName = "CardDescription";

/**
 * CardContent
 * - по умолчанию равномерные отступы
 * - если нужен контент без верхнего отступа, передай noTopPadding
 */
const CardContent = React.forwardRef(function CardContent(
  { className, noTopPadding, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn("p-4 sm:p-6", noTopPadding && "pt-0", className)}
      {...props}
    />
  );
});
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(function CardFooter(
  { className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn("flex items-center p-4 sm:p-6", className)}
      {...props}
    />
  );
});
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
