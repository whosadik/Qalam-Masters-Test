import * as React from "react";
import { cn } from "../../lib/utils";

/**
 * Card
 * — базовые стили + мягкий адаптив (чуть больше радиус/тень на sm+)
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

/**
 * CardHeader
 * — мобильные отступы p-4, больше на sm
 */
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

/**
 * CardTitle
 * — семантический <h3> и адаптивные размеры шрифта
 */
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

/**
 * CardDescription
 * — семантический <p> и адаптивная типографика
 */
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
 * — БОЛЬШОЕ ИЗМЕНЕНИЕ: больше нет жёсткого pt-0.
 *   Если нужно убрать верхний отступ — передай проп `noTopPadding`.
 *   Пример: <CardContent noTopPadding>...</CardContent>
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

/**
 * CardFooter
 * — адаптивные отступы без принудительного pt-0
 */
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
