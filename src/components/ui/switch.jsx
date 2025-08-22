"use client";
import * as React from "react";

export function Switch({ id, checked, onCheckedChange }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        id={id}
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer
        peer-checked:bg-blue-600 transition-colors
        after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300
        after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full">
      </div>
    </label>
  );
}
