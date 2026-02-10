import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Database, AlertTriangle, Clock, TrendingUp, Activity } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: api.getStats,
    refetchInterval: 30000,
  });

  const { data: recentLogs } = useQuery({
    queryKey: ["recent-logs"],
    queryFn: () => api.getLogs(10),
    refetchInterval: 15000,
  });

  const { data: perfis } = useQuery({
    queryKey: ["perfis"],
    queryFn: api.getPerfis,
    refetchInterval: 30000,
  });

  const statCards = [
    { label: "Perfis Monitorados", value: stats?.totalPerfis ?? 0, icon: Users, color: "text-primary" },
    { label: "Perfis Ativos", value: stats?.perfisAtivos ?? 0, icon: Activity, color: "text-success" },
    { label: "Total de Coletas", value: stats?.totalColetas ?? 0, icon: Database, color: "text-primary" },
    { label: "Erros Registrados", value: stats?.totalErros ?? 0, icon: AlertTriangle, color: "text-destructive" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Visão geral do sistema de monitoramento</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`p-2.5 rounded-lg bg-secondary ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? "—" : stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Last collection + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Perfis status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status dos Perfis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!perfis?.length && <p className="text-sm text-muted-foreground">Nenhum perfil cadastrado</p>}
            {perfis?.slice(0, 8).map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      p.status === "sucesso" ? "bg-success" : p.status === "erro" ? "bg-destructive" : p.status === "coletando" ? "bg-warning animate-pulse" : "bg-muted-foreground"
                    }`}
                  />
                  <span className="font-medium">@{p.username}</span>
                </div>
                <span className="text-muted-foreground text-xs">
                  {p.ultima_coleta
                    ? format(new Date(p.ultima_coleta), "dd/MM HH:mm", { locale: ptBR })
                    : "Nunca coletado"}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent logs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!recentLogs?.length && <p className="text-sm text-muted-foreground">Nenhum log registrado</p>}
            {recentLogs?.slice(0, 8).map((log) => (
              <div key={log.id} className="flex items-start gap-2 text-xs">
                <span
                  className={`mt-0.5 inline-block h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                    log.tipo === "erro" ? "bg-destructive" : log.tipo === "sucesso" ? "bg-success" : "bg-primary"
                  }`}
                />
                <span className="text-muted-foreground flex-shrink-0">
                  {format(new Date(log.created_at), "HH:mm:ss")}
                </span>
                <span className="truncate">{log.mensagem}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {stats?.ultimaColeta && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Última coleta: {format(new Date(stats.ultimaColeta), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </p>
      )}
    </div>
  );
}
