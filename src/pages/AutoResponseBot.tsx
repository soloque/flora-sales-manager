
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Play, Square, Settings, Info, Keyboard, Copy, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BotMessage {
  key: string;
  message: string;
  description: string;
}

const AutoResponseBot = () => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [lastUsedKey, setLastUsedKey] = useState<string>("");
  const keydownListenerRef = useRef<((event: KeyboardEvent) => void) | null>(null);
  const [messages, setMessages] = useState<BotMessage[]>([
    {
      key: "F1",
      message: "Está sim\nEm quais frutíferas você tem interesse?",
      description: "Mensagem de confirmação e pergunta sobre interesse"
    },
    {
      key: "F2", 
      message: "Fica R$ 129 com frete grátis e pagamento na entrega. 1 metro.",
      description: "Preço para 1 muda"
    },
    {
      key: "F3",
      message: "As 2 saem por R$ 139 com frete grátis e pagamento na entrega. Todas com 1 metro.",
      description: "Preço para 2 mudas"
    },
    {
      key: "F4",
      message: "As 3 saem por R$ 199 com frete grátis e pagamento na entrega. Todas com 1 metro.",
      description: "Preço para 3 mudas"
    },
    {
      key: "F5",
      message: "As 4 saem por R$ 259 com frete grátis e pagamento na entrega. Todas com 1 metro.",
      description: "Preço para 4 mudas"
    },
    {
      key: "F6",
      message: "Amora\nAcerola\nAbacate\nBanana\nCajá\nCaju\nCarambola\nFigo\nFramboesa\nJaca\nJabuticaba\nLaranja\nLimão\nTangerinas\nPera\nPêssego\nUva\nNectarina\nEntre outras. Normalmente entre R$ 60 e 90. Em quais tem interesse?",
      description: "Lista de frutíferas disponíveis"
    },
    {
      key: "F7",
      message: "Olá, temos\nTem interesse em mais alguma frutífera?",
      description: "Saudação e pergunta adicional"
    }
  ]);

  // Load messages from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('autobot-messages');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (error) {
        console.error('Erro ao carregar mensagens salvas:', error);
      }
    }
  }, []);

  // Save messages to localStorage
  const saveMessages = () => {
    localStorage.setItem('autobot-messages', JSON.stringify(messages));
    toast({
      title: "Configurações salvas",
      description: "As mensagens do bot foram salvas com sucesso."
    });
  };

  const updateMessage = (index: number, field: keyof BotMessage, value: string) => {
    const updated = [...messages];
    updated[index] = { ...updated[index], [field]: value };
    setMessages(updated);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text.replace(/\\n/g, '\n'));
      setLastUsedKey(text);
      
      toast({
        title: "Mensagem copiada!",
        description: "A mensagem foi copiada para a área de transferência. Cole onde desejar.",
        duration: 2000
      });
    } catch (error) {
      console.error('Erro ao copiar:', error);
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a mensagem. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    // Verifica se não está digitando em um input
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    const pressedKey = event.key.toUpperCase();
    const message = messages.find(msg => msg.key === pressedKey);
    
    if (message) {
      event.preventDefault();
      
      if (message.key === "F1" || message.key === "F7") {
        // Para F1 e F7, enviar múltiplas mensagens
        const lines = message.message.split('\n');
        lines.forEach((line, index) => {
          setTimeout(() => {
            copyToClipboard(line);
          }, index * 1000);
        });
      } else {
        copyToClipboard(message.message);
      }
    }
  };

  const startBot = () => {
    if (keydownListenerRef.current) {
      document.removeEventListener('keydown', keydownListenerRef.current);
    }

    keydownListenerRef.current = handleKeyPress;
    document.addEventListener('keydown', keydownListenerRef.current);
    setIsRunning(true);
    
    toast({
      title: "Bot ativado!",
      description: "Pressione F1-F7 para usar as mensagens automáticas. As mensagens serão copiadas automaticamente.",
      duration: 3000
    });
  };

  const stopBot = () => {
    if (keydownListenerRef.current) {
      document.removeEventListener('keydown', keydownListenerRef.current);
      keydownListenerRef.current = null;
    }
    setIsRunning(false);
    setLastUsedKey("");
    
    toast({
      title: "Bot desativado",
      description: "O bot de respostas automáticas foi parado."
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (keydownListenerRef.current) {
        document.removeEventListener('keydown', keydownListenerRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bot de Respostas Automáticas</h1>
          <p className="text-muted-foreground">
            Configure e use respostas automáticas para agilizar seu atendimento
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={isRunning ? "default" : "secondary"}>
            {isRunning ? "Ativo" : "Inativo"}
          </Badge>
          {isRunning ? (
            <Button onClick={stopBot} variant="destructive">
              <Square className="h-4 w-4 mr-2" />
              Parar Bot
            </Button>
          ) : (
            <Button onClick={startBot}>
              <Play className="h-4 w-4 mr-2" />
              Iniciar Bot
            </Button>
          )}
        </div>
      </div>

      {isRunning && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Bot ativo!</span>
              <span className="text-sm">Pressione F1-F7 para usar as mensagens. Elas serão copiadas automaticamente.</span>
            </div>
            {lastUsedKey && (
              <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                Última mensagem copiada: "{lastUsedKey.length > 50 ? lastUsedKey.substring(0, 50) + '...' : lastUsedKey}"
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </TabsTrigger>
          <TabsTrigger value="instructions">
            <Info className="h-4 w-4 mr-2" />
            Como Usar
          </TabsTrigger>
          <TabsTrigger value="shortcuts">
            <Keyboard className="h-4 w-4 mr-2" />
            Atalhos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurar Mensagens</CardTitle>
              <CardDescription>
                Personalize as mensagens que serão copiadas automaticamente por cada tecla de atalho
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {messages.map((msg, index) => (
                  <div key={msg.key} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{msg.key}</Badge>
                      <Input
                        placeholder="Descrição"
                        value={msg.description}
                        onChange={(e) => updateMessage(index, 'description', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(msg.message)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <Label>Mensagem</Label>
                      <Textarea
                        placeholder="Digite a mensagem..."
                        value={msg.message}
                        onChange={(e) => updateMessage(index, 'message', e.target.value)}
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Use quebras de linha para múltiplas mensagens (uma por linha)
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Button onClick={saveMessages}>
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Como Usar o Bot</CardTitle>
              <CardDescription>
                Siga estes passos para usar o bot de respostas automáticas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium">Configure as Mensagens</h3>
                    <p className="text-sm text-muted-foreground">
                      Na aba "Configurações", personalize as mensagens para cada tecla (F1-F7).
                      Salve as configurações quando terminar.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium">Inicie o Bot</h3>
                    <p className="text-sm text-muted-foreground">
                      Clique em "Iniciar Bot" para ativar as funcionalidades de resposta automática.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Use os Atalhos</h3>
                    <p className="text-sm text-muted-foreground">
                      Pressione as teclas F1-F7 para copiar automaticamente as mensagens.
                      Cole onde desejar usando Ctrl+V.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    4
                  </div>
                  <div>
                    <h3 className="font-medium">Pare Quando Necessário</h3>
                    <p className="text-sm text-muted-foreground">
                      Clique em "Parar Bot" quando não precisar mais das respostas automáticas.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">💡 Dicas</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• O bot funciona em qualquer aba do navegador enquanto estiver ativo</li>
                  <li>• As mensagens são copiadas automaticamente - basta colar onde desejar</li>
                  <li>• F1 e F7 podem enviar múltiplas mensagens em sequência</li>
                  <li>• Use o botão de cópia ao lado de cada mensagem para testar</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shortcuts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Atalhos do Teclado</CardTitle>
              <CardDescription>
                Lista de teclas e suas respectivas mensagens configuradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div key={msg.key} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Badge variant="outline" className="mt-0.5">
                      {msg.key}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{msg.description}</h4>
                      <p className="text-xs text-muted-foreground mt-1 break-words">
                        {msg.message.length > 100 
                          ? msg.message.substring(0, 100) + '...'
                          : msg.message
                        }
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(msg.message)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutoResponseBot;
