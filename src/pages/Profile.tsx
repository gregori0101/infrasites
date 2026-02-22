import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getLevel, getBadges, TechnicianStats } from "@/lib/gamification";
import { fetchAllTechniciansRanking } from "@/lib/reportDatabase";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, User, Mail, Shield, Building2, Calendar,
  Lock, LogOut, Trophy, Star, Loader2, Eye, EyeOff, MapPin
} from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const navigate = useNavigate();
  const { user, userRole, isTecnico, signOut } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Fetch technician stats for gamification
  const { data: ranking = [] } = useQuery({
    queryKey: ["profile-ranking"],
    queryFn: fetchAllTechniciansRanking,
    enabled: isTecnico,
    staleTime: 60_000,
  });

  const myEntry = ranking.find((r) => r.userId === user?.id);
  const myRank = ranking.findIndex((r) => r.userId === user?.id) + 1;

  const stats: TechnicianStats | null = myEntry
    ? {
        total: myEntry.total,
        monthly: myEntry.monthly,
        today: 0,
        rank: myRank,
        totalTechnicians: ranking.length,
        consecutiveDays: myEntry.consecutiveDays,
        maxInOneDay: myEntry.maxInOneDay,
      }
    : null;

  const level = stats ? getLevel(stats.total) : null;
  const badges = stats ? getBadges(stats) : [];
  const unlockedBadges = badges.filter((b) => b.unlocked);

  const roleLabels: Record<string, string> = {
    administrador: "Administrador",
    gestor: "Gestor",
    tecnico: "Técnico",
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Preencha todos os campos");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    setIsChangingPassword(true);
    try {
      const { data, error } = await supabase.functions.invoke("public-reset-password", {
        body: { email: user?.email, newPassword },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("Senha alterada com sucesso!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao alterar senha");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <>
      <Helmet>
        <title>Meu Perfil | InfraSites</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-card border-b shadow-sm">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <User className="h-5 w-5 text-primary" />
            <h1 className="font-bold text-lg">Meu Perfil</h1>
          </div>
        </header>

        <main className="max-w-2xl mx-auto p-4 space-y-4">
          {/* User Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">E-mail</p>
                  <p className="text-sm font-medium">{user?.email}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Cargo</p>
                  <Badge variant="secondary">{roleLabels[userRole?.role || ""] || "—"}</Badge>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Empresa</p>
                  <p className="text-sm font-medium">{userRole?.operadora || "—"}</p>
                </div>
              </div>
              {userRole?.area_atuacao && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Área de Atuação</p>
                      <p className="text-sm font-medium">{userRole.area_atuacao}</p>
                    </div>
                  </div>
                </>
              )}
              <Separator />
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Cadastrado em</p>
                  <p className="text-sm font-medium">
                    {userRole?.created_at
                      ? new Date(userRole.created_at).toLocaleDateString("pt-BR")
                      : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gamification Stats - only for technicians */}
          {isTecnico && stats && level && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  Minhas Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{level.emoji}</span>
                    <div>
                      <p className="font-bold">{level.name}</p>
                      <p className="text-xs text-muted-foreground">Nível {level.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{level.xp} XP</p>
                    {level.xpForNextLevel > 0 && (
                      <p className="text-xs text-muted-foreground">
                        próx: {level.xpForNextLevel} XP
                      </p>
                    )}
                  </div>
                </div>

                {level.xpForNextLevel > 0 && (
                  <Progress value={level.progress} className="h-2" />
                )}

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xl font-bold">{stats.monthly}</p>
                    <p className="text-xs text-muted-foreground">Este mês</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xl font-bold">#{stats.rank}</p>
                    <p className="text-xs text-muted-foreground">Ranking</p>
                  </div>
                </div>

                {/* Badges */}
                {badges.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-semibold mb-2 flex items-center gap-1">
                        <Star className="h-3.5 w-3.5" />
                        Badges ({unlockedBadges.length}/{badges.length})
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {badges.map((badge) => (
                          <div
                            key={badge.id}
                            className={`flex items-center gap-2 p-2 rounded-lg border text-sm ${
                              badge.unlocked
                                ? "bg-primary/5 border-primary/20"
                                : "opacity-40 border-border"
                            }`}
                          >
                            <span className="text-lg">{badge.emoji}</span>
                            <div>
                              <p className="font-medium text-xs">{badge.name}</p>
                              <p className="text-[10px] text-muted-foreground">{badge.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Change Password */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Alterar Senha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Nova Senha</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Confirmar Nova Senha</Label>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                />
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={isChangingPassword}
                className="w-full"
              >
                {isChangingPassword && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Alterar Senha
              </Button>
            </CardContent>
          </Card>

          {/* Logout */}
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair da Conta
          </Button>
        </main>
      </div>
    </>
  );
}
