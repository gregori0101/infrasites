import * as React from "react";
import { cn } from "@/lib/utils";

interface ToggleSwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
  className?: string;
}

export function ToggleSwitch({ value, onChange, label, description, className }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cn(
        "w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200",
        value ? "bg-primary/10 border-primary/30" : "bg-card border-border hover:bg-muted/50",
        className
      )}
    >
      <div className="flex flex-col items-start">
        <span className="font-medium text-sm">{label}</span>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
      <div
        className={cn(
          "relative w-11 h-6 rounded-full transition-colors duration-200",
          value ? "bg-primary" : "bg-muted"
        )}
      >
        <div
          className={cn(
            "absolute top-1 left-1 w-4 h-4 rounded-full bg-card shadow-sm transition-transform duration-200",
            value && "translate-x-5"
          )}
        />
      </div>
    </button>
  );
}
