"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

export default function NotificationsButton({
  count = 0,
  items = [],
  align = "right",
  buttonClassName = "",
  dropdownClassName = "",
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
          "p-2 rounded-lg hover:bg-gray-100 relative focus:outline-none focus:ring-2 focus:ring-gray-300 " +
          buttonClassName
        }
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Открыть уведомления"
      >
        <Bell className="h-5 w-5 text-gray-700" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 bg-red-500 text-white text-[10px] leading-4 rounded-full text-center">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div
          className={[
            "absolute mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 max-h-96 overflow-y-auto z-50",
            align === "right" ? "right-0" : "left-0",
            dropdownClassName,
          ].join(" ")}
          role="menu"
          aria-label="Список уведомлений"
        >
          <div className="px-4 py-2 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Уведомления</h3>
          </div>

          {items.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">Пока пусто</div>
          ) : (
            items.map((n) => (
              <button
                key={n.id}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 cursor-pointer"
                role="menuitem"
                onClick={() => {
                  n.onClick && n.onClick();
                  setOpen(false);
                }}
              >
                <p className="text-sm text-gray-900">{n.title}</p>
                {n.time && <p className="text-xs text-gray-500 mt-1">{n.time}</p>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
