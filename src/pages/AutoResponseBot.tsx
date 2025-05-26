
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Play, Square, Settings, Info, Keyboard, Copy, CheckCircle, AlertTriangle } from "lucide-react";
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
  const [isInInputField, setIsInInputField] = useState(false);
  const keydownListenerRef = useRef<((event: KeyboardEvent) => void) | null>(null);
  const focusListenerRef = useRef<((event: FocusEvent) => void) | null>(null);
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text.replace(/\\n/g, '\n'));
      setLastUsedKey(text);
      
      toast({
        title: "Mensagem copiada!",
        description: "A mensagem foi copiada para a área de transferência. Cole onde desejar com Ctrl+V.",
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

  const isInputElement = (element: HTMLElement): boolean => {
    const inputTypes = ['INPUT', 'TEXTAREA', 'SELECT'];
    return inputTypes.includes(element.tagName) || 
           element.contentEditable === 'true' || 
           element.hasAttribute('contenteditable') ||
           element.closest('[contenteditable="true"]') !== null ||
           element.closest('input') !== null ||
           element.closest('textarea') !== null;
  };

  const handleFocus = (event: FocusEvent) => {
    const target = event.target as HTMLElement;
    if (isInputElement(target)) {
      setIsInInputField(true);
      console.log('Entrando em campo de input - bot temporariamente desabilitado');
    }
  };

  const handleBlur = (event: FocusEvent) => {
    const target = event.target as HTMLElement;
    if (isInputElement(target)) {
      // Pequeno delay para evitar falsos positivos
      setTimeout(() => {
        const activeElement = document.activeElement as HTMLElement;
        if (!activeElement || !isInputElement(activeElement)) {
          setIsInInputField(false);
          console.log('Saindo de campo de input - bot reabilitado');
        }
      }, 100);
    }
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    // Se estiver em um campo de input, não processa
    if (isInInputField) {
      console.log('Bot desabilitado - digitando em campo de texto');
      return;
    }

    // Verificação adicional do elemento ativo
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && isInputElement(activeElement)) {
      setIsInInputField(true);
      return;
    }

    const pressedKey = event.key;
    const message = messages.find(msg => msg.key === pressedKey);
    
    if (message) {
      event.preventDefault();
      event.stopPropagation();
      
      console.log(`Tecla ${pressedKey} pressionada - copiando mensagem:`, message.message);
      
      if (message.key === "0" || message.message.includes('\n')) {
        // Para mensagens com múltiplas linhas, enviar cada linha separadamente
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
    if (focusListenerRef.current) {
      document.removeEventListener('focusin', focusListenerRef.current);
      document.removeEventListener('focusout', focusListenerRef.current);
    }

    keydownListenerRef.current = handleKeyPress;
    focusListenerRef.current = handleFocus;
    
    document.addEventListener('keydown', keydownListenerRef.current, true);
    document.addEventListener('focusin', handleFocus, true);
    document.addEventListener('focusout', handleBlur, true);
    
    setIsRunning(true);
    setIsInInputField(false);
    
    const keys = messages.map(m => m.key).filter(k => k).join(', ');
    toast({
      title: "Bot ativado!",
      description: `Pressione ${keys} para usar as mensagens automáticas. O bot detecta automaticamente quando você está digitando.`,
      duration: 4000
    });
  };

  const stopBot = () => {
    if (keydownListenerRef.current) {
      document.removeEventListener('keydown', keydownListenerRef.current);
      keydownListenerRef.current = null;
    }
    if (focusListenerRef.current) {
      document.removeEventListener('focusin', focusListenerRef.current);
      document.removeEventListener('focusout', focusListenerRef.current);
      focusListenerRef.current = null;
    }
    setIsRunning(false);
    setLastUsedKey("");
    setIsInInputField(false);
    
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
      if (focusListenerRef.current) {
        document.removeEventListener('focusin', focusListenerRef.current);
        document.removeEventListener('focusout', focusListenerRef.current);
      }
    };
  }, []);

  const getSuggestedKeys = () => {
    return [
      { key: "0", desc: "Números (0-9) - podem conflitar em alguns sites" },
      { key: "F1", desc: "Teclas de função (F1-F12) - mais confiáveis" },
      { key: "q", desc: "Letras (a-z) - funcionam bem na maioria dos sites" },
      { key: "Shift", desc: "Modificadores - use com cuidado" }
    ];
  };

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
          {isRunning && isInInputField && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Pausado (digitando)
            </Badge>
          )}
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
                {isInInputField 
                  ? "Pausado enquanto você digita. As teclas voltarão a funcionar quando sair do campo de texto."
                  : "Pressione as teclas configuradas para copiar as mensagens automaticamente."
                }
              </span>
            </div>
            {lastUsedKey && !isInInputField && (
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
                Personalize as teclas e mensagens que serão copiadas automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">💡 Dica para Facebook</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  No Facebook, use preferencialmente as teclas F1-F12 ou letras em vez de números (0-9) 
                  para evitar conflitos com os atalhos nativos da plataforma.
                </p>
              </div>
              
              <div className="grid gap-4">
                {messages.map((msg, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <Label className="text-sm">Tecla:</Label>
                        <Input
                          placeholder="Ex: F1, q, 0, etc"
                          value={msg.key}
                          onChange={(e) => updateMessage(index, 'key', e.target.value)}
                          className="w-24"
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
                        Use quebras de linha para múltiplas mensagens (uma por linha)
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
                      Na aba "Configurações", personalize as teclas e mensagens. Para o Facebook, 
                      recomendamos usar F1-F12 ou letras em vez de números.
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
                      Clique em "Iniciar Bot" para ativar as funcionalidades. O bot detecta automaticamente 
                      quando você está digitando e se pausa nesses momentos.
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
                      Pressione as teclas configuradas para copiar automaticamente as mensagens.
                      Cole onde desejar usando Ctrl+V. O bot funciona em qualquer aba do navegador.
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
                  <li>• O bot detecta automaticamente quando você está digitando e se pausa</li>
                  <li>• Use F1-F12 ou letras no Facebook para melhor compatibilidade</li>
                  <li>• As mensagens são copiadas automaticamente - basta colar com Ctrl+V</li>
                  <li>• Mensagens com múltiplas linhas são enviadas em sequência</li>
                  <li>• O bot funciona em qualquer aba do navegador enquanto estiver ativo</li>
                </ul>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Problemas no Facebook?</h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• Se as teclas numéricas (0-9) não funcionarem, use F1-F12 ou letras</li>
                  <li>• Clique fora do campo de texto antes de usar os atalhos</li>
                  <li>• Verifique se o bot não está pausado (indicador "Pausado (digitando)")</li>
                  <li>• Recarregue a página e reative o bot se necessário</li>
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
