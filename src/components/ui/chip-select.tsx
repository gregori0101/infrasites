import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ChipSelectProps<T extends string> {
  options: T[];
  value: T[];
  onChange: (value: T[]) => void;
  label: string;
  className?: string;
}

export function ChipSelect<T extends string>({ options, value, onChange, label, className }: ChipSelectProps<T>) {
  const toggleOption = (option: T) => {
    if (value.includes(option)) {
      onChange(value.filter(v => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = value.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                "border-2 flex items-center gap-1.5",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-card-foreground border-border hover:border-primary/50 hover:bg-primary/5"
              )}
            >
              {isSelected && <Check className="w-3 h-3" />}
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
