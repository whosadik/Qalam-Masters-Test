import { Input } from "@/components/ui/input";

export default function Field({
  name,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  disabled,
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700" htmlFor={name}>
        {label}
      </label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
