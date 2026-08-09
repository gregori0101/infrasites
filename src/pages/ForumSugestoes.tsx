import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet";
import { 
  ArrowLeft, 
  MessageSquarePlus, 
  Image as ImageIcon, 
  Send, 
  CheckCircle2, 
  Clock, 
  User, 
  MessageSquare,
  AlertCircle,
  X,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { SignedImage } from "@/components/ui/signed-image";
import { uploadPhoto } from "@/lib/photoStorage";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ForumSugestoes() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [newPostText, setNewPostText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [adminResponses, setAdminResponses] = useState<Record<string, string>>({});

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["forum_posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_posts" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (payload: { text: string; imageUrl?: string }) => {
      const { error } = await supabase.from("forum_posts" as any).insert({
        user_id: user?.id,
        text_content: payload.text,
        image_url: payload.imageUrl,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum_posts"] });
      setNewPostText("");
      setSelectedImage(null);
      toast.success("Sugestão enviada com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao enviar: " + error.message);
    },
  });

  const updateResponseMutation = useMutation({
    mutationFn: async ({ postId, response, isFixed }: { postId: string; response: string; isFixed: boolean }) => {
      const { error } = await supabase
        .from("forum_posts" as any)
        .update({ admin_response: response, is_fixed: isFixed })
        .eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum_posts"] });
      toast.success("Resposta enviada!");
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from("forum_posts" as any)
        .delete()
        .eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum_posts"] });
      toast.success("Sugestão excluída!");
    },
    onError: (error: any) => {
      toast.error("Erro ao excluir: " + error.message);
    },
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const url = await uploadPhoto(base64, "forum", "print");
        setSelectedImage(url);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      toast.error("Erro ao carregar imagem");
      setIsUploading(false);
    }
  };

  const handleSubmitPost = () => {
    if (!newPostText.trim()) return;
    createPostMutation.mutate({ text: newPostText, imageUrl: selectedImage || undefined });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Helmet>
        <title>Fórum de Melhorias | InfraSites Vivo</title>
      </Helmet>

      <header className="sticky top-0 z-30 bg-card border-b px-4 py-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Fórum de Sugestões</h1>
          <p className="text-xs text-muted-foreground">Colabore para melhorar nossa plataforma</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquarePlus className="h-4 w-4 text-primary" />
              Nova Sugestão ou Report de Erro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea 
              placeholder="Descreva o erro ou a sugestão de melhoria..."
              className="bg-background min-h-[100px]"
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  id="forum-image" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isUploading}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => document.getElementById("forum-image")?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <span className="animate-spin mr-2">...</span>
                  ) : (
                    <ImageIcon className="h-4 w-4 mr-2" />
                  )}
                  {selectedImage ? "Trocar Print" : "Anexar Print"}
                </Button>
                {selectedImage && (
                  <Badge variant="secondary" className="gap-1">
                    Print anexado
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedImage(null)} />
                  </Badge>
                )}
              </div>
              
              <Button 
                onClick={handleSubmitPost}
                disabled={!newPostText.trim() || createPostMutation.isPending || isUploading}
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground">Carregando sugestões...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed rounded-xl">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
              <p className="text-muted-foreground font-medium">Ainda não há sugestões.</p>
              <p className="text-sm text-muted-foreground">Seja o primeiro a colaborar!</p>
            </div>
          ) : (
            posts.map((post: any) => (
              <Card key={post.id} className={post.is_fixed ? "border-emerald-500/50 bg-emerald-500/5" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-muted rounded-full p-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="text-xs font-semibold">Técnico/Usuário</span>
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(post.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    {post.is_fixed ? (
                      <Badge className="bg-emerald-600 hover:bg-emerald-700">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Melhoria Executada
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        <Clock className="h-3 w-3 mr-1" />
                        Pendente
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm whitespace-pre-wrap">{post.text_content}</p>
                  
                  {post.image_url && (
                    <div className="rounded-lg overflow-hidden border max-w-sm">
                      <SignedImage src={post.image_url} alt="Print do erro/sugestão" className="w-full h-auto cursor-pointer" />
                    </div>
                  )}

                  {post.admin_response && (
                    <div className="bg-muted/50 p-3 rounded-lg border-l-4 border-primary">
                      <div className="flex items-center gap-2 mb-1">
                        <ShieldAlertIcon className="h-3 w-3 text-primary" />
                        <span className="text-[10px] font-bold uppercase text-primary">Resposta do Administrador</span>
                      </div>
                      <p className="text-sm italic">{post.admin_response}</p>
                    </div>
                  )}
                </CardContent>
                
                {isAdmin && (
                  <CardFooter className="pt-2 border-t flex flex-col items-stretch gap-3">
                    <div className="flex items-center gap-2">
                      <Textarea 
                        placeholder="Escreva a resposta ou confirmação de melhoria..."
                        className="text-sm min-h-[60px]"
                        value={adminResponses[post.id] ?? post.admin_response ?? ""}
                        onChange={(e) => setAdminResponses(prev => ({ ...prev, [post.id]: e.target.value }))}
                      />
                    </div>
                    <div className="flex justify-between items-center w-full gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm("Deseja realmente excluir esta sugestão?")) {
                            deletePostMutation.mutate(post.id);
                          }
                        }}
                        disabled={deletePostMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </Button>
                      <div className="flex gap-2">
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => updateResponseMutation.mutate({ 
                            postId: post.id, 
                            response: adminResponses[post.id] ?? post.admin_response ?? "", 
                            isFixed: false 
                          })}
                          disabled={updateResponseMutation.isPending}
                        >
                          Salvar Resposta
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => updateResponseMutation.mutate({ 
                            postId: post.id, 
                            response: adminResponses[post.id] ?? post.admin_response ?? "", 
                            isFixed: true 
                          })}
                          disabled={updateResponseMutation.isPending}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Confirmar Melhoria
                        </Button>
                      </div>
                    </div>
                  </CardFooter>
                )}
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

function ShieldAlertIcon({ className }: { className?: string }) {
  return <AlertCircle className={className} />;
}
