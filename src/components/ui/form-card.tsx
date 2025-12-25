import * as React from "react";
import { cn } from "@/lib/utils";

interface FormCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'accent';
}

export function FormCard({ title, icon, children, className, variant = 'default' }: FormCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-4 shadow-card transition-shadow duration-200 hover:shadow-card-hover animate-slide-up",
        variant === 'default' && "bg-card border border-border",
        variant === 'accent' && "bg-primary/5 border-2 border-primary/20",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        {icon && (
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            variant === 'default' ? "bg-primary/10 text-primary" : "bg-accent/20 text-accent"
          )}>
            {icon}
          </div>
        )}
        <h3 className="font-semibold text-card-foreground">{title}</h3>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}
