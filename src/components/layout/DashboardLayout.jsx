"use client"

import { useState } from "react"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"
import { cn } from "@/lib/utils"

export default function DashboardLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Topbar */}
      <Topbar onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

      {/* Main content */}
      <main className={cn("transition-all duration-300 pt-16", "md:ml-64")}>
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  )
}
