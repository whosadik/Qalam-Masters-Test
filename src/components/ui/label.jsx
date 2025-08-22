"use client";
import * as React from "react";

export function Label({ htmlFor, className = "", children }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-medium text-gray-700 ${className}`}
    >
      {children}
    </label>
  );
}
