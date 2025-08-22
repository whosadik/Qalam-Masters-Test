"use client";
import { useCallback } from "react";

export default function FileDropZone({ label, value, onFileChange, required }) {
  const handleChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) onFileChange?.(file);
    },
    [onFileChange]
  );

  return (
    <div className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
      <label className="flex flex-col items-center justify-center gap-2 text-center cursor-pointer w-full h-full">
        <span className="font-medium text-gray-700">{label}</span>
        <input
          type="file"
          className="hidden"
          required={required}
          onChange={handleChange}
        />
        {value ? (
          <span className="text-sm text-green-600">{value.name}</span>
        ) : (
          <span className="text-sm text-gray-500">Перетащите или выберите файл</span>
        )}
      </label>
    </div>
  );
}
