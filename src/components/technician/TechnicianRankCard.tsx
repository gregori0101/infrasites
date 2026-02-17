import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp, Calendar, Star } from "lucide-react";
import { TechnicianStats, getLevel, getBadges } from "@/lib/gamification";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TechnicianRankCardProps {
  stats: TechnicianStats;
}

export function TechnicianRankCard({ stats }: TechnicianRankCardProps) {
  const level = getLevel(stats.total);
  const badges = getBadges(stats);
  const unlockedBadges = badges.filter((b) => b.unlocked);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
      <CardContent className="p-4 space-y-4">
        {/* Level & XP Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-2xl">{level.emoji}</span>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium">Nível {level.level}</p>
              <p className="font-bold text-sm truncate">{level.name}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-muted-foreground">XP Total</p>
            <p className="font-bold text-primary text-sm">{level.xp}</p>
          </div>
        </div>

        {/* Progress Bar */}
        {level.level < 7 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progresso para Nível {level.level + 1}</span>
              <span>{level.progress}%</span>
            </div>
            <Progress value={level.progress} className="h-2" />
          </div>
        )}
        {level.level === 7 && (
          <div className="text-center">
            <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30">
              🔥 Nível Máximo Alcançado!
            </Badge>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-background/60 p-2">
            <Calendar className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-0.5" />
            <p className="text-lg font-bold leading-tight">{stats.today}</p>
            <p className="text-[10px] text-muted-foreground">Hoje</p>
          </div>
          <div className="rounded-lg bg-background/60 p-2">
            <TrendingUp className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-0.5" />
            <p className="text-lg font-bold leading-tight">{stats.monthly}</p>
            <p className="text-[10px] text-muted-foreground">Este mês</p>
          </div>
          <div className="rounded-lg bg-background/60 p-2">
            <Star className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-0.5" />
            <p className="text-lg font-bold leading-tight">{stats.total}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </div>
        </div>

        {/* Ranking */}
        {stats.totalTechnicians > 1 && (
          <div className="flex items-center justify-center gap-2 text-sm">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span className="text-muted-foreground">Ranking:</span>
            <span className="font-bold">{stats.rank}º</span>
            <span className="text-muted-foreground">de {stats.totalTechnicians}</span>
          </div>
        )}

        {/* Badges */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Conquistas ({unlockedBadges.length}/{badges.length})
          </p>
          <TooltipProvider>
            <div className="flex flex-wrap gap-1.5">
              {badges.map((badge) => (
                <Tooltip key={badge.id}>
                  <TooltipTrigger asChild>
                    <span
                      className={`text-lg cursor-default transition-all ${
                        badge.unlocked ? "grayscale-0 opacity-100" : "grayscale opacity-30"
                      }`}
                    >
                      {badge.emoji}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[200px]">
                    <p className="font-semibold text-xs">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                    {!badge.unlocked && (
                      <p className="text-xs text-muted-foreground italic mt-0.5">🔒 Bloqueado</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
