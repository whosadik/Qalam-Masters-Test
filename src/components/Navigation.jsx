"use client"

import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Home, User, FileText, Users, Shield, Crown, Settings, BookOpen, PenTool } from "lucide-react"

const navigationItems = [
  { path: "/", label: "Главная", icon: Home },
  { path: "/author-dashboard", label: "Автор", icon: PenTool },
  { path: "/reviewer-dashboard", label: "Рецензент", icon: FileText },
  { path: "/editorial-profile", label: "Редколлегия", icon: Users },
  { path: "/editorial-board-dashboard", label: "Редсовет", icon: Shield },
  { path: "/editor-chief-dashboard", label: "Гл. редактор", icon: Crown },
  { path: "/admin-dashboard", label: "Админ", icon: Settings },
  { path: "/author-profile", label: "Профиль автора", icon: User },
  { path: "/reviewer-profile", label: "Профиль рецензента", icon: BookOpen },
]

export default function Navigation() {
  const location = useLocation()
  const isHomePage = location.pathname === "/"

  if (isHomePage) return null

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/Qalam-Masters-Test/home-page" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Qalam Masters</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.slice(1).map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          <div className="md:hidden flex items-center">
            <select
              value={location.pathname}
              onChange={(e) => (window.location.href = e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              {navigationItems.map((item) => (
                <option key={item.path} value={item.path}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </nav>
  )
}
