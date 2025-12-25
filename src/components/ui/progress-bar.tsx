import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({ value, className, showLabel = true }: ProgressBarProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-1.5">
        {showLabel && (
          <>
            <span className="text-xs font-medium text-muted-foreground">Progresso</span>
            <span className="text-xs font-bold text-primary">{value}%</span>
          </>
        )}
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full gradient-progress rounded-full transition-all duration-500 ease-out"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
