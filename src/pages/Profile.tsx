import React from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { PageHeader } from "@/components/PageHeader";
import { useTheme } from "@/lib/theme";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const Profile: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title="My Profile" />
      <div className="max-w-lg space-y-6">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium text-card-foreground">{user?.name || "User"}</p>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" /> {user?.email || "user@example.com"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-card-foreground mb-4">Theme Settings</h3>
          <div className="flex gap-2">
            {([
              { value: "light" as const, icon: Sun, label: "Light" },
              { value: "dark" as const, icon: Moon, label: "Dark" },
              { value: "system" as const, icon: Monitor, label: "System" },
            ]).map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1.5 rounded-lg border p-3 text-sm transition-colors",
                  theme === value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:bg-accent"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <Button
          variant="destructive"
          onClick={() => { logout(); navigate("/login"); }}
          className="w-full"
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Profile;
