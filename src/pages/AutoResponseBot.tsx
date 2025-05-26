
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
      key: "0",
      message: "Está sim\nEm quais frutíferas você tem interesse?",
      description: "Mensagem de confirmação e pergunta sobre interesse"
    },
    {
      key: "1", 
      message: "Fica R$ 129 com frete grátis e pagamento na entrega. 1 metro.",
      description: "Preço para 1 muda"
    },
    {
      key: "2",
      message: "As 2 saem por R$ 139 com frete grátis e pagamento na entrega. Todas com 1 metro.",
      description: "Preço para 2 mudas"
    },
    {
      key: "3",
      message: "As 3 saem por R$ 199 com frete grátis e pagamento na entrega. Todas com 1 metro.",
      description: "Preço para 3 mudas"
    },
    {
      key: "4",
      message: "As 4 saem por R$ 259 com frete grátis e pagamento na entrega. Todas com 1 metro.",
      description: "Preço para 4 mudas"
    },
    {
      key: "5",
      message: "Amora\nAcerola\nAbacate\nBanana\nCajá\nCaju\nCarambola\nFigo\nFramboesa\nJaca\nJabuticaba\nLaranja\nLimão\nTangerinas\nPera\nPêssego\nUva\nNectarina\nEntre outras. Normalmente entre R$ 60 e 90. Em quais tem interesse?",
      description: "Lista de frutíferas disponíveis"
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

  const addNewMessage = () => {
    const newMessage: BotMessage = {
      key: "",
      message: "",
      description: "Nova mensagem"
    };
    setMessages([...messages, newMessage]);
  };

  const removeMessage = (index: number) => {
    const updated = messages.filter((_, i) => i !== index);
    setMessages(updated);
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    const pressedKey = event.key;
    const message = messages.find(msg => msg.key === pressedKey);
    
    if (message && message.message) {
      event.preventDefault();
      event.stopPropagation();
      
      console.log(`Tecla ${pressedKey} pressionada - copiando texto:`, message.message);
      setLastUsedKey(message.message);
      
      // Copiar para área de transferência
      navigator.clipboard.writeText(message.message).then(() => {
        toast({
          title: `Tecla ${pressedKey} - Texto copiado!`,
          description: "Cole com Ctrl+V onde desejar",
          duration: 2000
        });
      }).catch(() => {
        toast({
          title: "Erro ao copiar",
          description: "Não foi possível copiar o texto",
          variant: "destructive"
        });
      });
    }
  };

  const startBot = () => {
    if (keydownListenerRef.current) {
      document.removeEventListener('keydown', keydownListenerRef.current);
    }

    keydownListenerRef.current = handleKeyPress;
    document.addEventListener('keydown', keydownListenerRef.current, true);
    
    setIsRunning(true);
    
    const keys = messages.map(m => m.key).filter(k => k).join(', ');
    toast({
      title: "Bot ativado!",
      description: `Pressione ${keys} para copiar as mensagens`,
      duration: 4000
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Mensagem copiada!",
        description: "A mensagem foi copiada para a área de transferência",
        duration: 2000
      });
    } catch (error) {
      console.error('Erro ao copiar:', error);
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a mensagem",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bot de Respostas Automáticas</h1>
          <p className="text-muted-foreground">
            Pressione as teclas para copiar o texto automaticamente
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
              <span className="text-sm">
                Pressione as teclas para copiar automaticamente. Cole com Ctrl+V.
              </span>
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
                Configure as teclas e mensagens que serão copiadas automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {messages.map((msg, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <Label className="text-sm">Tecla:</Label>
                        <Input
                          placeholder="Ex: 0, 1, F1, q, etc"
                          value={msg.key}
                          onChange={(e) => updateMessage(index, 'key', e.target.value)}
                          className="w-32"
                        />
                        <Input
                          placeholder="Descrição"
                          value={msg.description}
                          onChange={(e) => updateMessage(index, 'description', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(msg.message)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeMessage(index)}
                      >
                        ×
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
                        Use quebras de linha para múltiplas linhas
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button onClick={addNewMessage} variant="outline">
                  Adicionar Nova Mensagem
                </Button>
                <Button onClick={saveMessages}>
                  Salvar Configurações
                </Button>
              </div>
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
                    <h3 className="font-medium">Configure as Mensagens e Teclas</h3>
                    <p className="text-sm text-muted-foreground">
                      Na aba "Configurações", defina as teclas (0-9, F1-F12, letras) e suas respectivas mensagens.
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
                      Clique em "Iniciar Bot" para ativar o sistema de cópia automática.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Use as Teclas</h3>
                    <p className="text-sm text-muted-foreground">
                      Pressione as teclas configuradas e o texto será copiado automaticamente. Cole com Ctrl+V onde desejar.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">💡 Como Funciona</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Pressione a tecla configurada</li>
                  <li>• O texto é automaticamente copiado</li>
                  <li>• Cole com Ctrl+V em qualquer lugar (Facebook, WhatsApp, etc.)</li>
                  <li>• Funciona em qualquer aplicação ou site</li>
                  <li>• Simples e direto - sem complicações!</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shortcuts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Atalhos Configurados</CardTitle>
              <CardDescription>
                Lista de teclas e suas respectivas mensagens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {messages.filter(msg => msg.key).map((msg) => (
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
              {messages.filter(msg => msg.key).length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum atalho configurado. Vá para a aba "Configurações" para adicionar mensagens.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutoResponseBot;
