import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Heart, MessageCircle, Eye, Share2 } from "lucide-react";

export default function HistoricoPage() {
  const [selectedPerfil, setSelectedPerfil] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data: perfis } = useQuery({ queryKey: ["perfis"], queryFn: api.getPerfis });

  const { data: coletas, isLoading } = useQuery({
    queryKey: ["coletas", selectedPerfil],
    queryFn: () =>
      selectedPerfil === "all" ? api.getColetas(200) : api.getColetasByPerfil(selectedPerfil),
  });

  const filtered = coletas?.filter((c) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      c.nome_perfil_analisado?.toLowerCase().includes(s) ||
      c.post_legenda?.toLowerCase().includes(s) ||
      c.post_tipo?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Histórico de Coletas</h1>
        <p className="text-sm text-muted-foreground">Dados coletados de todos os perfis monitorados</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Select value={selectedPerfil} onValueChange={setSelectedPerfil}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por perfil" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os perfis</SelectItem>
            {perfis?.map((p) => (
              <SelectItem key={p.id} value={p.username}>
                @{p.username}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Buscar por legenda, tipo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}

      {!isLoading && !filtered?.length && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhuma coleta encontrada. Execute uma coleta a partir da página de perfis.
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {filtered?.map((c) => (
          <Card key={c.id}>
            <CardContent className="py-4 px-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">@{c.nome_perfil_analisado}</span>
                    {c.post_tipo && <Badge variant="outline" className="text-xs">{c.post_tipo}</Badge>}
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(c.data_coleta), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  {c.post_legenda && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{c.post_legenda}</p>
                  )}
                  {c.hashtags_lista && c.hashtags_lista.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {c.hashtags_lista.slice(0, 5).map((h, i) => (
                        <span key={i} className="text-xs text-primary">{h}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" />
                    {(c.metricas_curtidas || 0).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {(c.metricas_comentarios || 0).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {(c.metricas_video_views || 0).toLocaleString()}
                  </div>
                  {c.calc_taxa_engajamento != null && (
                    <div className="font-mono text-primary font-medium">
                      {c.calc_taxa_engajamento}%
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
