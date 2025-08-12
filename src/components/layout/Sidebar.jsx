"use client"

import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
  Home,
  User,
  FileText,
  Users,
  Shield,
  Crown,
  Settings,
  BookOpen,
  PenTool,
  ChevronLeft,
  ChevronRight,
  Upload,
} from "lucide-react"
import { useState } from "react"

const navigationItems = [
  { path: "/", label: "Главная", icon: Home },
  { path: "/submit-article", label: "Подать статью", icon: Upload },
  { path: "/author-dashboard", label: "Дашборд автора", icon: PenTool },
  { path: "/reviewer-dashboard", label: "Дашборд рецензента", icon: FileText },
  { path: "/editorial-profile", label: "Редколлегия", icon: Users },
  { path: "/editorial-board-dashboard", label: "Редакционный совет", icon: Shield },
  { path: "/editor-chief-dashboard", label: "Главный редактор", icon: Crown },
  { path: "/admin-dashboard", label: "Администратор", icon: Settings },
  { path: "/author-profile", label: "Профиль автора", icon: User },
  { path: "/reviewer-profile", label: "Профиль рецензента", icon: BookOpen },
]

export default function Sidebar() {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-40",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Qalam Masters</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-blue-600" : "text-gray-500")} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
