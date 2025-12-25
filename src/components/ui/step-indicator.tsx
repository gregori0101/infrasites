import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  steps: { label: string; icon: React.ReactNode }[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

export function StepIndicator({ steps, currentStep, onStepClick, className }: StepIndicatorProps) {
  return (
    <div className={cn("flex items-center justify-between overflow-x-auto pb-2 gap-1", className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        
        return (
          <button
            key={index}
            onClick={() => onStepClick?.(index)}
            disabled={!onStepClick}
            className={cn(
              "flex flex-col items-center min-w-[3rem] transition-all duration-200",
              onStepClick && "cursor-pointer hover:scale-105",
              !onStepClick && "cursor-default"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300",
                isCompleted && "bg-success text-success-foreground",
                isCurrent && "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background",
                !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
              )}
            >
              {isCompleted ? (
                <Check className="w-4 h-4" />
              ) : (
                <span className="[&>svg]:w-4 [&>svg]:h-4">{step.icon}</span>
              )}
            </div>
            <span
              className={cn(
                "text-[10px] mt-1 font-medium text-center max-w-[4rem] leading-tight",
                isCurrent && "text-primary",
                !isCurrent && "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
