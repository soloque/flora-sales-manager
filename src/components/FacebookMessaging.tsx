
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { MessageSquare, Send, Bot, User, Settings } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface FacebookMessage {
  id: string;
  facebook_message_id: string;
  sender_id: string;
  recipient_id: string;
  message_text: string;
  timestamp: string;
  is_from_customer: boolean;
  is_ai_response?: boolean;
  status: string;
}

interface Conversation {
  customer_id: string;
  customer_name?: string;
  last_message: FacebookMessage;
  unread_count: number;
  messages: FacebookMessage[];
}

export function FacebookMessaging() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    fetchConversations();
    checkFacebookConnection();
  }, []);

  const checkFacebookConnection = async () => {
    // Check if Facebook credentials are configured
    try {
      const { data, error } = await supabase.functions.invoke('facebook-webhook', {
        method: 'GET',
      });
      
      if (!error) {
        setIsConnected(true);
      }
    } catch (error) {
      console.log("Facebook not connected yet");
    }
  };

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const { data: messages, error } = await supabase
        .from('facebook_messages')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Group messages by customer
      const conversationsMap = new Map<string, Conversation>();
      
      messages?.forEach((message: FacebookMessage) => {
        const customerId = message.is_from_customer ? message.sender_id : message.recipient_id;
        
        if (!conversationsMap.has(customerId)) {
          conversationsMap.set(customerId, {
            customer_id: customerId,
            customer_name: `Cliente ${customerId.slice(-4)}`,
            last_message: message,
            unread_count: 0,
            messages: []
          });
        }
        
        const conversation = conversationsMap.get(customerId)!;
        conversation.messages.push(message);
        
        if (message.is_from_customer && message.timestamp > conversation.last_message.timestamp) {
          conversation.last_message = message;
        }
        
        if (message.is_from_customer && message.status === 'received') {
          conversation.unread_count++;
        }
      });

      const sortedConversations = Array.from(conversationsMap.values())
        .sort((a, b) => new Date(b.last_message.timestamp).getTime() - new Date(a.last_message.timestamp).getTime());

      setConversations(sortedConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast({
        title: "Erro ao carregar conversas",
        description: "Não foi possível carregar as mensagens do Facebook.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (messageText: string, isAi = false) => {
    if (!selectedConversation || !messageText.trim()) return;

    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke('facebook-send-message', {
        body: {
          recipientId: selectedConversation.customer_id,
          messageText: messageText.trim(),
          isAiResponse: isAi
        }
      });

      if (error) throw error;

      toast({
        title: "Mensagem enviada",
        description: isAi ? "Resposta da IA enviada com sucesso!" : "Mensagem enviada com sucesso!",
      });

      setNewMessage("");
      fetchConversations();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar a mensagem.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const generateAiResponse = async () => {
    if (!selectedConversation) return;

    const lastCustomerMessage = selectedConversation.messages
      .filter(m => m.is_from_customer)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    if (!lastCustomerMessage) return;

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('facebook-ai-responder', {
        body: {
          messageText: lastCustomerMessage.message_text,
          senderName: selectedConversation.customer_name,
          productInfo: "Produto do marketplace"
        }
      });

      if (error) throw error;

      await sendMessage(data.response, true);
    } catch (error) {
      console.error("Error generating AI response:", error);
      toast({
        title: "Erro na resposta da IA",
        description: "Não foi possível gerar a resposta automática.",
        variant: "destructive",
      });
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Facebook Marketplace - Configuração
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Conectar Facebook Marketplace</h3>
            <p className="text-muted-foreground mb-4">
              Para usar esta funcionalidade, você precisa configurar as credenciais do Facebook.
            </p>
            <p className="text-sm text-muted-foreground">
              Configure as seguintes variáveis no Supabase:<br/>
              - FACEBOOK_PAGE_ACCESS_TOKEN<br/>
              - FACEBOOK_VERIFY_TOKEN<br/>
              - OPENAI_API_KEY (para respostas automáticas)
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Conversas Facebook
            </div>
            <Button variant="outline" size="sm" onClick={fetchConversations}>
              Atualizar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-300px)]">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Carregando conversas...
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Nenhuma conversa encontrada
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.customer_id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedConversation?.customer_id === conversation.customer_id
                        ? 'bg-accent'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">{conversation.customer_name}</div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.last_message.message_text}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(conversation.last_message.timestamp), 'dd/MM HH:mm')}
                        </div>
                        {conversation.unread_count > 0 && (
                          <Badge className="mt-1">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="lg:col-span-2">
        {selectedConversation ? (
          <>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  {selectedConversation.customer_name}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="ai-mode">Modo IA</Label>
                  <Switch
                    id="ai-mode"
                    checked={aiEnabled}
                    onCheckedChange={setAiEnabled}
                  />
                  {aiEnabled && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateAiResponse}
                      disabled={isSending}
                    >
                      <Bot className="h-4 w-4 mr-2" />
                      Resposta IA
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col h-[calc(100vh-400px)]">
              <ScrollArea className="flex-1 mb-4">
                <div className="space-y-4">
                  {selectedConversation.messages
                    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                    .map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.is_from_customer ? 'justify-start' : 'justify-end'
                        }`}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg p-3 ${
                            message.is_from_customer
                              ? 'bg-muted border'
                              : message.is_ai_response
                              ? 'bg-blue-100 text-blue-900 border border-blue-200'
                              : 'bg-primary text-primary-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {message.is_ai_response && <Bot className="h-3 w-3" />}
                            <span className="text-xs opacity-70">
                              {format(new Date(message.timestamp), 'dd/MM HH:mm')}
                            </span>
                          </div>
                          <p className="text-sm">{message.message_text}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
              
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(newMessage);
                }}
                className="flex space-x-2"
              >
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  disabled={isSending}
                  className="flex-1"
                />
                <Button type="submit" disabled={isSending || !newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4" />
              <p>Selecione uma conversa para começar</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
