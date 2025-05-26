
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
import { useIsMobile } from "@/hooks/use-mobile";

interface BotMessage {
  key: string;
  message: string;
  description: string;
}

const AutoResponseBot = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
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
    <div className={`${isMobile ? 'w-full min-h-screen p-4' : 'space-y-4 md:space-y-6 p-4 md:p-0'} w-full`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
        <div>
          <h1 className={`${isMobile ? 'text-xl' : 'text-2xl md:text-3xl'} font-bold`}>Bot Copia & Cola</h1>
          <p className="text-muted-foreground text-xs md:text-base">
            Pressione as teclas para copiar o texto automaticamente
          </p>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Badge variant={isRunning ? "default" : "secondary"} className={isMobile ? "text-xs" : ""}>
            {isRunning ? "Ativo" : "Inativo"}
          </Badge>
          {isRunning ? (
            <Button onClick={stopBot} variant="destructive" size={isMobile ? "sm" : "default"}>
              <Square className="h-4 w-4 mr-2" />
              Parar Bot
            </Button>
          ) : (
            <Button onClick={startBot} size={isMobile ? "sm" : "default"}>
              <Play className="h-4 w-4 mr-2" />
              Iniciar Bot
            </Button>
          )}
        </div>
      </div>

      {isRunning && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardContent className={`${isMobile ? 'pt-3 px-3 pb-3' : 'pt-4 md:pt-6'}`}>
            <div className="flex items-start md:items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0 mt-0.5 md:mt-0" />
              <div className="flex-1 min-w-0">
                <span className={`font-medium block md:inline ${isMobile ? 'text-sm' : ''}`}>Bot ativo!</span>
                <span className={`${isMobile ? 'text-xs' : 'text-sm'} block md:inline md:ml-2`}>
                  Pressione as teclas para copiar automaticamente. Cole com Ctrl+V.
                </span>
              </div>
            </div>
            {lastUsedKey && (
              <div className={`mt-2 ${isMobile ? 'text-xs' : 'text-xs'} text-green-600 dark:text-green-400 break-words`}>
                Última mensagem copiada: "{lastUsedKey.length > (isMobile ? 25 : 50) ? lastUsedKey.substring(0, isMobile ? 25 : 50) + '...' : lastUsedKey}"
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="config" className="space-y-3 md:space-y-4 w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config" className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 ${isMobile ? 'p-2 text-xs' : 'p-2 md:p-3'}`}>
            <Settings className="h-3 w-3 md:h-4 md:w-4" />
            <span className={isMobile ? 'text-xs' : 'text-xs md:text-sm'}>Config</span>
          </TabsTrigger>
          <TabsTrigger value="instructions" className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 ${isMobile ? 'p-2 text-xs' : 'p-2 md:p-3'}`}>
            <Info className="h-3 w-3 md:h-4 md:w-4" />
            <span className={isMobile ? 'text-xs' : 'text-xs md:text-sm'}>Como Usar</span>
          </TabsTrigger>
          <TabsTrigger value="shortcuts" className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 ${isMobile ? 'p-2 text-xs' : 'p-2 md:p-3'}`}>
            <Keyboard className="h-3 w-3 md:h-4 md:w-4" />
            <span className={isMobile ? 'text-xs' : 'text-xs md:text-sm'}>Atalhos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-3 md:space-y-4">
          <Card>
            <CardHeader className={isMobile ? 'pb-3 px-3 pt-3' : 'pb-4'}>
              <CardTitle className={`${isMobile ? 'text-base' : 'text-lg md:text-xl'}`}>Configurar Mensagens</CardTitle>
              <CardDescription className={`${isMobile ? 'text-xs' : 'text-sm'}`}>
                Configure as teclas e mensagens que serão copiadas automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent className={`space-y-3 md:space-y-4 ${isMobile ? 'px-3 pb-3' : ''}`}>
              <div className="grid gap-3 md:gap-4">
                {messages.map((msg, index) => (
                  <div key={index} className={`border rounded-lg ${isMobile ? 'p-2' : 'p-3 md:p-4'} space-y-2 md:space-y-3`}>
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Label className={`${isMobile ? 'text-xs' : 'text-sm'} flex-shrink-0`}>Tecla:</Label>
                        <Input
                          placeholder="Ex: 0, 1, F1"
                          value={msg.key}
                          onChange={(e) => updateMessage(index, 'key', e.target.value)}
                          className={`w-16 md:w-32 ${isMobile ? 'h-8 text-xs' : ''}`}
                        />
                        <Input
                          placeholder="Descrição"
                          value={msg.description}
                          onChange={(e) => updateMessage(index, 'description', e.target.value)}
                          className={`flex-1 min-w-0 ${isMobile ? 'h-8 text-xs' : ''}`}
                        />
                      </div>
                      <div className="flex gap-2 md:gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(msg.message)}
                          className={`flex-1 md:flex-none ${isMobile ? 'h-8 text-xs px-2' : ''}`}
                        >
                          <Copy className="h-3 w-3 md:h-4 md:w-4" />
                          <span className={`${isMobile ? 'ml-1' : 'md:hidden ml-1'}`}>Copiar</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeMessage(index)}
                          className={`${isMobile ? 'h-8 px-2 text-xs' : 'px-3'}`}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className={isMobile ? 'text-xs' : ''}>Mensagem</Label>
                      <Textarea
                        placeholder="Digite a mensagem..."
                        value={msg.message}
                        onChange={(e) => updateMessage(index, 'message', e.target.value)}
                        rows={isMobile ? 2 : 3}
                        className={`${isMobile ? 'text-xs mt-1' : 'text-sm'}`}
                      />
                      <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground mt-1`}>
                        Use quebras de linha para múltiplas linhas
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col md:flex-row gap-2">
                <Button onClick={addNewMessage} variant="outline" className={`w-full md:w-auto ${isMobile ? 'h-9 text-sm' : ''}`}>
                  Adicionar Nova Mensagem
                </Button>
                <Button onClick={saveMessages} className={`w-full md:w-auto ${isMobile ? 'h-9 text-sm' : ''}`}>
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructions" className="space-y-3 md:space-y-4">
          <Card>
            <CardHeader className={isMobile ? 'pb-3 px-3 pt-3' : 'pb-4'}>
              <CardTitle className={`${isMobile ? 'text-base' : 'text-lg md:text-xl'}`}>Como Usar o Bot</CardTitle>
              <CardDescription className={`${isMobile ? 'text-xs' : 'text-sm'}`}>
                Siga estes passos para usar o bot copia & cola
              </CardDescription>
            </CardHeader>
            <CardContent className={`space-y-3 md:space-y-4 ${isMobile ? 'px-3 pb-3' : ''}`}>
              <div className="space-y-3 md:space-y-4">
                <div className="flex gap-3">
                  <div className={`flex-shrink-0 ${isMobile ? 'w-5 h-5' : 'w-6 h-6'} bg-primary text-primary-foreground rounded-full flex items-center justify-center ${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
                    1
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium ${isMobile ? 'text-sm' : 'text-sm md:text-base'}`}>Configure as Mensagens e Teclas</h3>
                    <p className={`${isMobile ? 'text-xs' : 'text-xs md:text-sm'} text-muted-foreground`}>
                      Na aba "Config", defina as teclas (0-9, F1-F12, letras) e suas respectivas mensagens.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className={`flex-shrink-0 ${isMobile ? 'w-5 h-5' : 'w-6 h-6'} bg-primary text-primary-foreground rounded-full flex items-center justify-center ${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
                    2
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium ${isMobile ? 'text-sm' : 'text-sm md:text-base'}`}>Inicie o Bot</h3>
                    <p className={`${isMobile ? 'text-xs' : 'text-xs md:text-sm'} text-muted-foreground`}>
                      Clique em "Iniciar Bot" para ativar o sistema de cópia automática.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className={`flex-shrink-0 ${isMobile ? 'w-5 h-5' : 'w-6 h-6'} bg-primary text-primary-foreground rounded-full flex items-center justify-center ${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
                    3
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium ${isMobile ? 'text-sm' : 'text-sm md:text-base'}`}>Use as Teclas</h3>
                    <p className={`${isMobile ? 'text-xs' : 'text-xs md:text-sm'} text-muted-foreground`}>
                      Pressione as teclas configuradas e o texto será copiado automaticamente. Cole com Ctrl+V onde desejar.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg ${isMobile ? 'p-2' : 'p-3 md:p-4'}`}>
                <h4 className={`font-medium text-blue-800 dark:text-blue-200 mb-2 ${isMobile ? 'text-xs' : 'text-sm md:text-base'}`}>💡 Como Funciona</h4>
                <ul className={`${isMobile ? 'text-xs' : 'text-xs md:text-sm'} text-blue-700 dark:text-blue-300 space-y-1`}>
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

        <TabsContent value="shortcuts" className="space-y-3 md:space-y-4">
          <Card>
            <CardHeader className={isMobile ? 'pb-3 px-3 pt-3' : 'pb-4'}>
              <CardTitle className={`${isMobile ? 'text-base' : 'text-lg md:text-xl'}`}>Atalhos Configurados</CardTitle>
              <CardDescription className={`${isMobile ? 'text-xs' : 'text-sm'}`}>
                Lista de teclas e suas respectivas mensagens
              </CardDescription>
            </CardHeader>
            <CardContent className={isMobile ? 'px-3 pb-3' : ''}>
              <div className="space-y-2 md:space-y-3">
                {messages.filter(msg => msg.key).map((msg) => (
                  <div key={msg.key} className={`flex flex-col md:flex-row md:items-start gap-2 md:gap-3 ${isMobile ? 'p-2' : 'p-3'} border rounded-lg`}>
                    <Badge variant="outline" className={`self-start md:mt-0.5 ${isMobile ? 'text-xs' : ''}`}>
                      {msg.key}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>{msg.description}</h4>
                      <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground mt-1 break-words`}>
                        {msg.message.length > (isMobile ? 60 : 100) 
                          ? msg.message.substring(0, isMobile ? 60 : 100) + '...'
                          : msg.message
                        }
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(msg.message)}
                      className={`self-start ${isMobile ? 'h-7 px-2' : ''}`}
                    >
                      <Copy className="h-3 w-3 md:h-4 md:w-4" />
                      <span className={`${isMobile ? 'ml-1 text-xs' : 'md:hidden ml-1'}`}>Copiar</span>
                    </Button>
                  </div>
                ))}
              </div>
              {messages.filter(msg => msg.key).length === 0 && (
                <p className={`text-center text-muted-foreground py-6 md:py-8 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Nenhum atalho configurado. Vá para a aba "Config" para adicionar mensagens.
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
