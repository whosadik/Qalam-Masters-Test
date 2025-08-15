export function Separator({ className = "", orientation = "horizontal" }) {
  const base = "shrink-0 bg-gray-200";
  const dir =
    orientation === "vertical" ? "w-px h-full mx-4" : "h-px w-full my-4";
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={`${base} ${dir} ${className}`}
    />
  );
}
