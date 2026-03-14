import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Package, FileInput, Truck, ArrowLeftRight, ClipboardCheck,
  History, Settings, ChevronDown, ChevronLeft, Menu, User, LogOut, Sun, Moon, Monitor
} from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Products", icon: Package, path: "/products" },
  {
    label: "Operations", icon: FileInput, children: [
      { label: "Receipts", icon: FileInput, path: "/operations/receipts" },
      { label: "Deliveries", icon: Truck, path: "/operations/deliveries" },
      { label: "Transfers", icon: ArrowLeftRight, path: "/operations/transfers" },
      { label: "Adjustments", icon: ClipboardCheck, path: "/operations/adjustments" },
    ],
  },
  { label: "Move History", icon: History, path: "/history" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [opsOpen, setOpsOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();

  const isActive = (path: string) => location.pathname === path;
  const isOpsActive = location.pathname.startsWith("/operations");

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-foreground/20 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative z-50 h-full flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-150",
          collapsed ? "w-16" : "w-60",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Package className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold text-sidebar-foreground">CoreInventory</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin py-2 px-2 space-y-0.5">
          {navItems.map((item) =>
            item.children ? (
              <div key={item.label}>
                <button
                  onClick={() => setOpsOpen(!opsOpen)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors duration-100",
                    isOpsActive
                      ? "text-primary bg-primary/8"
                      : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-150", opsOpen && "rotate-180")} />
                    </>
                  )}
                </button>
                <AnimatePresence>
                  {opsOpen && !collapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-4 border-l border-sidebar-border pl-2 space-y-0.5 py-0.5">
                        {item.children.map((child) => (
                          <Link
                            key={child.path}
                            to={child.path}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors duration-100",
                              isActive(child.path)
                                ? "text-primary bg-primary/8 font-medium"
                                : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
                            )}
                          >
                            <child.icon className="h-3.5 w-3.5 shrink-0" />
                            <span>{child.label}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                key={item.path}
                to={item.path!}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors duration-100",
                  isActive(item.path!)
                    ? "text-primary bg-primary/8"
                    : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          )}
        </nav>

        {/* Profile section */}
        <div className="border-t border-sidebar-border p-2">
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors duration-100 hover:bg-sidebar-accent"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <User className="h-3.5 w-3.5 text-primary" />
              </div>
              {!collapsed && (
                <div className="flex-1 text-left min-w-0">
                  <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.name || "User"}</p>
                  <p className="truncate text-xs text-sidebar-muted">{user?.email || "user@example.com"}</p>
                </div>
              )}
            </button>
            <AnimatePresence>
              {profileOpen && !collapsed && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.1 }}
                  className="absolute bottom-full left-0 right-0 mb-1 rounded-md border border-border bg-popover p-1 shadow-md"
                >
                  <Link
                    to="/profile"
                    onClick={() => { setProfileOpen(false); setMobileOpen(false); }}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-popover-foreground hover:bg-accent"
                  >
                    <User className="h-3.5 w-3.5" /> My Profile
                  </Link>
                  <div className="px-2 py-1.5">
                    <p className="text-xs text-muted-foreground mb-1.5">Theme</p>
                    <div className="flex gap-1">
                      {([
                        { value: "light" as const, icon: Sun },
                        { value: "dark" as const, icon: Moon },
                        { value: "system" as const, icon: Monitor },
                      ]).map(({ value, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => setTheme(value)}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-1 rounded px-2 py-1 text-xs transition-colors",
                            theme === value ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground"
                          )}
                        >
                          <Icon className="h-3 w-3" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => { logout(); setProfileOpen(false); }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Collapse toggle — desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex h-8 items-center justify-center border-t border-sidebar-border text-sidebar-muted hover:text-sidebar-foreground transition-colors"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform duration-150", collapsed && "rotate-180")} />
        </button>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          {/* Theme toggle for quick access */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : theme === "light" ? "system" : "dark")}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {theme === "dark" ? <Moon className="h-4 w-4" /> : theme === "light" ? <Sun className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
