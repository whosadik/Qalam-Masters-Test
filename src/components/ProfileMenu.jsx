"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut, Settings, User as UserIcon } from "lucide-react";

export default function ProfileMenu({
  name,
  email,
  avatar,
  align = "right",
  buttonClassName = "",
  dropdownClassName = "",
  onProfile,
  onSettings,
  onLogout,
  showNameOnDesktop = true,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="relative" ref={rootRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={
          "flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 " +
          buttonClassName
        }
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Открыть меню профиля"
      >
        {avatar || (
          <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
            <UserIcon className="h-4 w-4 text-white" />
          </div>
        )}
        {showNameOnDesktop && (
          <span className="hidden lg:block text-sm font-medium text-gray-700">
            {name}
          </span>
        )}
      </button>

      {open && (
        <div
          className={[
            "absolute mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50",
            align === "right" ? "right-0" : "left-0",
            dropdownClassName,
          ].join(" ")}
          role="menu"
          aria-label="Меню профиля"
        >
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="font-semibold text-gray-900">{name}</p>
            {email && <p className="text-sm text-gray-500">{email}</p>}
          </div>

          <button
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            role="menuitem"
            onClick={() => {
              onProfile && onProfile();
              setOpen(false);
            }}
          >
            <UserIcon className="h-4 w-4" />
            <span>Профиль</span>
          </button>

          <hr className="my-2" />

          <button
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
            role="menuitem"
            onClick={() => {
              onLogout && onLogout();
              setOpen(false);
            }}
          >
            <LogOut className="h-4 w-4" />
            <span>Выйти</span>
          </button>
        </div>
      )}
    </div>
  );
}
