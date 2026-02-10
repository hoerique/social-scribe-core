import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, PerfilMonitorado } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Play, Pause, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PerfisPage() {
  const queryClient = useQueryClient();
  const [newUsername, setNewUsername] = useState("");

  const { data: perfis, isLoading } = useQuery({
    queryKey: ["perfis"],
    queryFn: api.getPerfis,
  });

  const addMutation = useMutation({
    mutationFn: (username: string) => api.addPerfil(username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["perfis"] });
      setNewUsername("");
      toast.success("Perfil adicionado com sucesso");
    },
    onError: (err: any) => toast.error(err.message || "Erro ao adicionar perfil"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deletePerfil(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["perfis"] });
      toast.success("Perfil removido");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => api.updatePerfil(id, { ativo } as any),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["perfis"] }),
  });

  const collectMutation = useMutation({
    mutationFn: (username: string) => api.executarColeta(username),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["perfis"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Coleta executada");
    },
    onError: (err: any) => toast.error(err.message || "Erro na coleta"),
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUsername.trim()) addMutation.mutate(newUsername.trim());
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      sucesso: { label: "Sucesso", variant: "default" },
      erro: { label: "Erro", variant: "destructive" },
      coletando: { label: "Coletando...", variant: "secondary" },
      pendente: { label: "Pendente", variant: "outline" },
    };
    const s = map[status] || { label: status, variant: "outline" as const };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Perfis Monitorados</h1>
        <p className="text-sm text-muted-foreground">Gerencie os perfis de redes sociais para monitoramento</p>
      </div>

      {/* Add profile */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleAdd} className="flex gap-3">
            <Input
              placeholder="@username (ex: natgeo)"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={addMutation.isPending}>
              <Plus className="h-4 w-4 mr-1" /> Adicionar
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Profiles list */}
      <div className="space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
        {!isLoading && !perfis?.length && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhum perfil cadastrado. Adicione um perfil acima para começar.
            </CardContent>
          </Card>
        )}
        {perfis?.map((p) => (
          <Card key={p.id}>
            <CardContent className="flex items-center justify-between py-4 px-5">
              <div className="flex items-center gap-4">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    p.ativo ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  @
                </div>
                <div>
                  <p className="font-semibold text-sm">@{p.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.plataforma} • {p.total_coletas} coletas •{" "}
                    {p.ultima_coleta
                      ? `Última: ${format(new Date(p.ultima_coleta), "dd/MM HH:mm", { locale: ptBR })}`
                      : "Nunca coletado"}
                  </p>
                  {p.erro_ultima_coleta && (
                    <p className="text-xs text-destructive mt-1 truncate max-w-md">{p.erro_ultima_coleta}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {statusBadge(p.status)}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => collectMutation.mutate(p.username)}
                  disabled={collectMutation.isPending}
                  title="Executar coleta"
                >
                  <RefreshCw className={`h-4 w-4 ${collectMutation.isPending ? "animate-spin" : ""}`} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => toggleMutation.mutate({ id: p.id, ativo: !p.ativo })}
                  title={p.ativo ? "Pausar" : "Ativar"}
                >
                  {p.ativo ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => deleteMutation.mutate(p.id)}
                  title="Remover"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
