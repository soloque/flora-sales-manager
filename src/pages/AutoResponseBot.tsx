
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Download, Play, Square, Settings, Info, Keyboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BotMessage {
  key: string;
  message: string;
  description: string;
}

const AutoResponseBot = () => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
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

  const generatePythonScript = () => {
    const script = `import pyautogui
import time
import keyboard
import pyperclip

# Tempo de espera para você posicionar o cursor
print("Bot de Respostas Automáticas - PlantPro")
print("Posicione o cursor em um campo de texto...")
time.sleep(5)

def disparar_mensagens(mensagem):
    # Copia a mensagem para a área de transferência (com acentos)
    pyperclip.copy(mensagem)

    # Obtém a posição atual do cursor
    x, y = pyautogui.position()

    # Clica no local atual do cursor
    pyautogui.click(x, y)

    # Cole o texto da área de transferência
    keyboard.press_and_release('ctrl+v')

    # Pequeno atraso
    time.sleep(0.5)

    # Pressiona Enter
    keyboard.press_and_release('enter')

    # Aguarda 1 segundo antes de inserir a próxima mensagem
    time.sleep(1)

# Configurações das mensagens
${messages.map(msg => {
  if (msg.key === "F1" || msg.key === "F7") {
    const lines = msg.message.split('\n');
    return `# ${msg.description}
mensagens_${msg.key.toLowerCase()} = [
${lines.map(line => `    "${line.replace(/"/g, '\\"')}"`).join(',\n')}
]
keyboard.add_hotkey('${msg.key}', lambda: [disparar_mensagens(mensagem) for mensagem in mensagens_${msg.key.toLowerCase()}])`;
  } else {
    return `# ${msg.description}
mensagem_${msg.key.toLowerCase()} = "${msg.message.replace(/"/g, '\\"')}"
keyboard.add_hotkey('${msg.key}', lambda: disparar_mensagens(mensagem_${msg.key.toLowerCase()}))`;
  }
}).join('\n\n')}

print("Bot ativo! Pressione as teclas F1-F7 para enviar mensagens.")
print("Pressione Ctrl+C para parar o bot.")

try:
    while True:
        time.sleep(0.1)
except KeyboardInterrupt:
    print("\\nBot parado.")
`;

    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantpro_autobot.py';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Script baixado",
      description: "O arquivo Python foi baixado. Execute-o em seu computador para ativar o bot."
    });
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
        <div className="flex items-center gap-2">
          <Badge variant={isRunning ? "default" : "secondary"}>
            {isRunning ? "Ativo" : "Inativo"}
          </Badge>
        </div>
      </div>

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
                Personalize as mensagens que serão enviadas por cada tecla de atalho
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
                        Use \n para quebras de linha
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button onClick={saveMessages}>
                  Salvar Configurações
                </Button>
                <Button variant="outline" onClick={generatePythonScript}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Bot
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
                Siga estes passos para configurar e usar o bot de respostas automáticas
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
                    <h3 className="font-medium">Baixe o Script Python</h3>
                    <p className="text-sm text-muted-foreground">
                      Clique em "Baixar Bot" para baixar o arquivo Python com suas configurações.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Instale as Dependências</h3>
                    <p className="text-sm text-muted-foreground">
                      Execute no terminal: <code className="bg-muted px-1 rounded">pip install pyautogui keyboard pyperclip</code>
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    4
                  </div>
                  <div>
                    <h3 className="font-medium">Execute o Bot</h3>
                    <p className="text-sm text-muted-foreground">
                      Execute o arquivo Python e posicione o cursor no campo de texto onde deseja enviar as mensagens.
                      Você terá 5 segundos para posicionar o cursor.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    5
                  </div>
                  <div>
                    <h3 className="font-medium">Use os Atalhos</h3>
                    <p className="text-sm text-muted-foreground">
                      Pressione as teclas F1-F7 para enviar as mensagens automaticamente.
                      O bot enviará a mensagem e pressionará Enter automaticamente.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Importante</h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• O bot funciona apenas no Windows/Desktop</li>
                  <li>• Mantenha o cursor no campo de texto ativo</li>
                  <li>• Para parar o bot, pressione Ctrl+C no terminal</li>
                  <li>• Teste primeiro em um bloco de notas antes de usar em conversas</li>
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
