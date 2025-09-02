// src/components/ui/tabs.jsx
import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../../lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      // базовые
      "inline-flex items-center rounded-md bg-muted text-muted-foreground",
      // размеры/отступы
      "h-9 sm:h-10 w-full sm:w-auto p-1",
      // прокрутка на мобиле
      "overflow-x-auto sm:overflow-visible whitespace-nowrap gap-1 sm:gap-0 justify-start sm:justify-center",
      // скрыть скроллбар
      "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
      // вертикальная ориентация
      "data-[orientation=vertical]:flex-col data-[orientation=vertical]:h-auto data-[orientation=vertical]:w-full",
      "data-[orientation=vertical]:p-2 data-[orientation=vertical]:gap-2",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-sm ring-offset-background transition-all",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      // адаптивные размеры
      "px-2 sm:px-3 py-1.5 text-xs sm:text-sm",
      // чтобы не схлопывалось при горизонтальном скролле
      "shrink-0 min-w-max",
      // активное состояние
      "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      // вертикальная ориентация — растягиваем на всю ширину
      "data-[orientation=vertical]:w-full data-[orientation=vertical]:justify-start",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 sm:mt-3",
      "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
