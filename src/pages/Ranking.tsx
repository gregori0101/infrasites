import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { fetchAllTechniciansRanking, TechnicianRankingEntry } from "@/lib/reportDatabase";
import { getLevel, getBadges, TechnicianStats } from "@/lib/gamification";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Medal, Award, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const MEDAL_EMOJIS = ["🥇", "🥈", "🥉"];

function PodiumCard({ entry, position }: { entry: TechnicianRankingEntry; position: number }) {
  const level = getLevel(entry.total);
  const isFirst = position === 0;

  return (
    <div className={`flex flex-col items-center p-4 rounded-xl border-2 ${
      isFirst ? 'border-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/10' : 'border-border bg-card'
    } ${isFirst ? 'order-2 scale-105' : position === 1 ? 'order-1' : 'order-3'}`}>
      <span className="text-3xl mb-1">{MEDAL_EMOJIS[position]}</span>
      <span className="text-lg font-bold">{level.emoji}</span>
      <p className="font-semibold text-sm text-center truncate max-w-[120px]" title={entry.email}>
        {entry.email.split('@')[0]}
      </p>
      <p className="text-xs text-muted-foreground">{level.name}</p>
      <p className="font-bold text-primary mt-1">{entry.total} vistorias</p>
      <p className="text-xs text-muted-foreground">{level.xp} XP</p>
    </div>
  );
}

export default function Ranking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();

  const { data: ranking = [], isLoading } = useQuery({
    queryKey: ['all-technicians-ranking'],
    queryFn: fetchAllTechniciansRanking,
    staleTime: 60_000,
  });

  const top3 = ranking.slice(0, 3);

  return (
    <>
      <Helmet>
        <title>Ranking de Técnicos | Vivo</title>
        <meta name="description" content="Ranking completo dos técnicos de vistoria." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-40 bg-card border-b px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Trophy className="h-5 w-5 text-primary" />
          <h1 className="font-bold text-lg">Ranking de Técnicos</h1>
        </div>

        <div className="max-w-3xl mx-auto p-4 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Podium */}
              {top3.length >= 3 && (
                <div className="flex items-end justify-center gap-3">
                  {[1, 0, 2].map((idx) => (
                    <PodiumCard key={top3[idx].userId} entry={top3[idx]} position={idx} />
                  ))}
                </div>
              )}

              {/* Full Table */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Classificação Completa</CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12 text-center">#</TableHead>
                        <TableHead>Técnico</TableHead>
                        <TableHead className="text-center">Nível</TableHead>
                        {!isMobile && <TableHead className="text-center">XP</TableHead>}
                        <TableHead className="text-center">Total</TableHead>
                        {!isMobile && <TableHead className="text-center">Mês</TableHead>}
                        {!isMobile && <TableHead className="text-center">Badges</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ranking.map((entry, idx) => {
                        const level = getLevel(entry.total);
                        const stats: TechnicianStats = {
                          total: entry.total,
                          monthly: entry.monthly,
                          today: 0,
                          rank: idx + 1,
                          totalTechnicians: ranking.length,
                          consecutiveDays: entry.consecutiveDays,
                          maxInOneDay: entry.maxInOneDay,
                        };
                        const badges = getBadges(stats);
                        const unlockedBadges = badges.filter(b => b.unlocked);
                        const isMe = entry.userId === user?.id;

                        return (
                          <TableRow
                            key={entry.userId}
                            className={isMe ? 'bg-primary/10 font-semibold' : ''}
                          >
                            <TableCell className="text-center font-bold">
                              {idx < 3 ? MEDAL_EMOJIS[idx] : idx + 1}
                            </TableCell>
                            <TableCell>
                              <div className="truncate max-w-[160px]" title={entry.email}>
                                {entry.email.split('@')[0]}
                                {isMe && (
                                  <Badge variant="secondary" className="ml-2 text-[10px]">Você</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <span title={level.name}>{level.emoji}</span>
                            </TableCell>
                            {!isMobile && (
                              <TableCell className="text-center text-muted-foreground">
                                {level.xp}
                              </TableCell>
                            )}
                            <TableCell className="text-center font-bold">{entry.total}</TableCell>
                            {!isMobile && (
                              <TableCell className="text-center text-muted-foreground">
                                {entry.monthly}
                              </TableCell>
                            )}
                            {!isMobile && (
                              <TableCell className="text-center">
                                {unlockedBadges.length > 0
                                  ? unlockedBadges.map(b => (
                                      <span key={b.id} title={b.name} className="mr-0.5">{b.emoji}</span>
                                    ))
                                  : <span className="text-muted-foreground">—</span>
                                }
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                      {ranking.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            Nenhum técnico encontrado.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </>
  );
}
