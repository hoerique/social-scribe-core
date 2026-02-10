import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export default function LogsPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data: logs, isLoading } = useQuery({
    queryKey: ["logs"],
    queryFn: () => api.getLogs(500),
    refetchInterval: 10000,
  });

  const filtered = logs?.filter((l) => {
    if (filter !== "all" && l.tipo !== filter) return false;
    if (search && !l.mensagem.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const tipoBadge = (tipo: string) => {
    const map: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
      info: "secondary",
      sucesso: "default",
      erro: "destructive",
      warning: "outline",
    };
    return <Badge variant={map[tipo] || "outline"} className="text-xs w-16 justify-center">{tipo}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Logs do Sistema</h1>
        <p className="text-sm text-muted-foreground">Registro completo de todas as operações</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="sucesso">Sucesso</SelectItem>
            <SelectItem value="erro">Erro</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Buscar nos logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <span className="text-xs text-muted-foreground self-center ml-auto">
          {filtered?.length ?? 0} registros
        </span>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="max-h-[70vh] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card border-b">
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2.5 w-36">Horário</th>
                  <th className="px-4 py-2.5 w-20">Tipo</th>
                  <th className="px-4 py-2.5 w-24">Módulo</th>
                  <th className="px-4 py-2.5">Mensagem</th>
                  <th className="px-4 py-2.5 w-20 text-right">Duração</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Carregando...</td></tr>
                )}
                {!isLoading && !filtered?.length && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Nenhum log encontrado</td></tr>
                )}
                {filtered?.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/50">
                    <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                      {format(new Date(log.created_at), "dd/MM HH:mm:ss")}
                    </td>
                    <td className="px-4 py-2">{tipoBadge(log.tipo)}</td>
                    <td className="px-4 py-2 text-xs">{log.modulo}</td>
                    <td className="px-4 py-2 text-xs">{log.mensagem}</td>
                    <td className="px-4 py-2 text-xs text-right font-mono text-muted-foreground">
                      {log.duracao_ms != null ? `${log.duracao_ms}ms` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
