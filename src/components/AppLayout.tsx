import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { user } = useAuthStore();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

      {/* Header */}
      <header className="flex items-center justify-between border-b bg-white px-6 h-14">

        {/* Left side */}
        <div className="flex items-center gap-8">

          {/* Logo */}
          <div className="flex items-center gap-2 font-semibold text-gray-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm">
              S
            </div>
            StockVerse
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-5 text-sm">

            <Link
              to="/"
              className={cn(
                "px-2 py-1 rounded-md transition",
                isActive("/")
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-gray-500 hover:text-black"
              )}
            >
              Dashboard
            </Link>

            <Link
              to="/operations/receipts"
              className={cn(
                "px-2 py-1 rounded-md transition",
                location.pathname.startsWith("/operations")
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-gray-500 hover:text-black"
              )}
            >
              Operations
            </Link>

            <Link
              to="/products"
              className={cn(
                "px-2 py-1 rounded-md transition",
                isActive("/products")
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-gray-500 hover:text-black"
              )}
            >
              Stock
            </Link>

            <Link
              to="/history"
              className={cn(
                "px-2 py-1 rounded-md transition",
                isActive("/history")
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-gray-500 hover:text-black"
              )}
            >
              Move History
            </Link>

            <Link
              to="/settings"
              className={cn(
                "px-2 py-1 rounded-md transition",
                isActive("/settings")
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-gray-500 hover:text-black"
              )}
            >
              Settings
            </Link>

          </nav>

        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">

          {/* Theme Toggle */}
          <button
            onClick={() =>
              setTheme(
                theme === "dark"
                  ? "light"
                  : theme === "light"
                  ? "system"
                  : "dark"
              )
            }
            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100 transition"
          >
            {theme === "dark" ? (
              <Moon className="h-4 w-4" />
            ) : theme === "light" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Monitor className="h-4 w-4" />
            )}
          </button>

          {/* User */}
          <div className="text-sm text-gray-600">
            {user?.name || "User"}
          </div>

        </div>

      </header>

      {/* Page Content */}
      <main className="flex-1 p-8">
        {children}
      </main>

    </div>
  );
};