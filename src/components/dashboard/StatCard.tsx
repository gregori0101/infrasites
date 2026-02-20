import React from "react";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ElementType;
  iconBg: string;
  onClick?: () => void;
  trend?: { value: number; label: string };
  badge?: { text: string; variant: "success" | "warning" | "destructive" };
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg,
  onClick,
  trend,
  badge,
}: Props) {
  return (
    <Card
      className={cn(
        "transition-all duration-200 border-border/60 shadow-sm hover:shadow-md",
        onClick && "cursor-pointer hover:border-primary/40 active:scale-[0.98]"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1 min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground truncate">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
              {badge && (
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide",
                    badge.variant === "success" && "bg-success/10 text-success",
                    badge.variant === "warning" && "bg-warning/10 text-warning",
                    badge.variant === "destructive" && "bg-destructive/10 text-destructive"
                  )}
                >
                  {badge.text}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-[11px] text-muted-foreground/80">{subtitle}</p>
            )}
            {trend && (
              <p
                className={cn(
                  "text-[11px] font-semibold",
                  trend.value >= 0 ? "text-success" : "text-destructive"
                )}
              >
                {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
              </p>
            )}
            {onClick && (
              <p className="text-[11px] text-primary/80 flex items-center gap-0.5 mt-1 font-medium">
                Ver detalhes <ChevronRight className="w-3 h-3" />
              </p>
            )}
          </div>
          <div className={cn("p-2.5 rounded-xl shrink-0", iconBg)}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
