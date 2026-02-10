import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, Key, Clock, Cpu, RotateCcw } from "lucide-react";

export default function ConfiguracoesPage() {
  const queryClient = useQueryClient();
  const { data: configs, isLoading } = useQuery({
    queryKey: ["configuracoes"],
    queryFn: api.getConfiguracoes,
  });

  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (configs) {
      const map: Record<string, string> = {};
      configs.forEach((c) => { map[c.chave] = c.valor || ""; });
      setValues(map);
    }
  }, [configs]);

  const saveMutation = useMutation({
    mutationFn: async (entries: [string, string][]) => {
      for (const [chave, valor] of entries) {
        await api.updateConfiguracao(chave, valor);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configuracoes"] });
      toast.success("Configurações salvas");
    },
    onError: () => toast.error("Erro ao salvar"),
  });

  const handleSave = () => {
    saveMutation.mutate(Object.entries(values));
  };

  const configItems = [
    {
      key: "apify_api_key",
      label: "API Key (Apify)",
      description: "Sua chave de API do Apify para executar scrapers",
      icon: Key,
      type: "password",
    },
    {
      key: "scraping_interval",
      label: "Intervalo de Scraping (minutos)",
      description: "Frequência padrão de coleta para novos perfis",
      icon: Clock,
      type: "number",
    },
    {
      key: "max_retries",
      label: "Máximo de Tentativas",
      description: "Número de tentativas em caso de falha",
      icon: RotateCcw,
      type: "number",
    },
    {
      key: "concurrent_jobs",
      label: "Jobs Concorrentes",
      description: "Número de coletas simultâneas permitidas",
      icon: Cpu,
      type: "number",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-sm text-muted-foreground">Configure a integração com APIs externas e parâmetros do sistema</p>
      </div>

      <div className="space-y-4 max-w-2xl">
        {configItems.map((item) => (
          <Card key={item.key}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-secondary">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor={item.key} className="text-sm font-medium">
                    {item.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                  <Input
                    id={item.key}
                    type={item.type}
                    value={values[item.key] || ""}
                    onChange={(e) => setValues((prev) => ({ ...prev, [item.key]: e.target.value }))}
                    placeholder={item.key === "apify_api_key" ? "apify_api_XXXXX" : ""}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button onClick={handleSave} disabled={saveMutation.isPending} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {saveMutation.isPending ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  );
}
