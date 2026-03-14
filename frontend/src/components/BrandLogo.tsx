import React from "react";

import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  compact?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className, compact = false }) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img
        src="/stockverse-logo.png"
        alt="StockVerse"
        className={cn(compact ? "h-10 w-10" : "h-12 w-12", "rounded-md object-contain")}
      />
      {!compact && (
        <div className="leading-tight">
          <p className="text-xl font-semibold tracking-tight text-foreground">StockVerse</p>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Smart Inventory</p>
        </div>
      )}
    </div>
  );
};
