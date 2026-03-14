import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sun, Moon, Monitor, ChevronDown, LogOut, User } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const { user, logout } = useAuthStore();

  const [open, setOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();        // clear auth store
    setOpen(false);  // close dropdown
    navigate("/login"); // redirect to login page
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-6 h-14">

        {/* Left side */}
        <div className="flex items-center gap-8">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <img
              src="/stockverse-logo.png"
              alt="StockVerse"
              className="h-8 w-auto"
            />
            <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">
              StockVerse
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-5 text-sm">

            <Link
              to="/"
              className={cn(
                "px-2 py-1 rounded-md transition",
                isActive("/")
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
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
                  : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
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
                  : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
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
                  : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
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
                  : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
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
            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {theme === "dark" ? (
              <Moon className="h-4 w-4" />
            ) : theme === "light" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Monitor className="h-4 w-4" />
            )}
          </button>

          {/* Profile Dropdown */}
          <div className="relative">

            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
            >
              {user?.name || "User"}
              <ChevronDown size={16} />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-md overflow-hidden">

                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <User size={16} />
                  Profile
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <LogOut size={16} />
                  Logout
                </button>

              </div>
            )}

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