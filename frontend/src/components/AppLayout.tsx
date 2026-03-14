import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">

      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b bg-card px-6">

        {/* Left side */}
        <div className="flex items-center gap-8">

          {/* Logo */}
          <BrandLogo compact />

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-5 text-sm">

            <Link
              to="/"
              className={cn(
                "px-2 py-1 rounded-md transition",
                isActive("/")
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
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
                  : "text-muted-foreground hover:text-foreground"
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
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Stock
            </Link>

            <Link
              to="/warehouses"
              className={cn(
                "px-2 py-1 rounded-md transition",
                isActive("/warehouses")
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Warehouses
            </Link>

            <Link
              to="/history"
              className={cn(
                "px-2 py-1 rounded-md transition",
                isActive("/history")
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
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
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Settings
            </Link>

          </nav>

        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">

          <div className="flex items-center gap-1 rounded-md border border-border p-1">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-sm",
                theme === "light" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              )}
              aria-label="Light mode"
              title="Light"
            >
              <Sun className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-sm",
                theme === "dark" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              )}
              aria-label="Dark mode"
              title="Dark"
            >
              <Moon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setTheme("system")}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-sm",
                theme === "system" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              )}
              aria-label="System mode"
              title="Default"
            >
              <Monitor className="h-4 w-4" />
            </button>
          </div>

          {/* User */}
          <div className="text-sm text-muted-foreground">
            {user?.name || "User"}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Logout
          </Button>

        </div>

      </header>

      {/* Page Content */}
      <main className="flex-1 p-8">
        {children}
      </main>

    </div>
  );
};