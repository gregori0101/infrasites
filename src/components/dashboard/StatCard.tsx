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
        "transition-all duration-200",
        onClick && "cursor-pointer hover:border-primary/50 hover:shadow-lg active:scale-[0.98]"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <p className="text-sm text-muted-foreground truncate">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold tracking-tight">{value}</p>
              {badge && (
                <span
                  className={cn(
                    "text-xs font-medium px-1.5 py-0.5 rounded",
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
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <p
                className={cn(
                  "text-xs font-medium",
                  trend.value >= 0 ? "text-success" : "text-destructive"
                )}
              >
                {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
              </p>
            )}
            {onClick && (
              <p className="text-xs text-primary flex items-center gap-1 mt-1">
                Ver detalhes <ChevronRight className="w-3 h-3" />
              </p>
            )}
          </div>
          <div className={cn("p-3 rounded-xl shrink-0", iconBg)}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
