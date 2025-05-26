import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { User, DirectMessage as DirectMessageType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { createNotification } from "@/services/notificationService";

interface DirectMessageProps {
  receiver: User;
  onClose: () => void;
  isModal?: boolean;
}

export function DirectMessage({ receiver, onClose, isModal = false }: DirectMessageProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DirectMessageType[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!user || !receiver) return;
    
    const fetchMessages = async () => {
      try {
        const { data: sentMessages, error: sentError } = await supabase
          .from('direct_messages')
          .select('*')
          .eq('sender_id', user.id)
          .eq('receiver_id', receiver.id)
          .order('created_at', { ascending: true });
          
        if (sentError) throw sentError;
        
        const { data: receivedMessages, error: receivedError } = await supabase
          .from('direct_messages')
          .select('*')
          .eq('sender_id', receiver.id)
          .eq('receiver_id', user.id)
          .order('created_at', { ascending: true });
          
        if (receivedError) throw receivedError;
        
        if (receivedMessages && receivedMessages.length > 0) {
          const unreadMessages = receivedMessages.filter(msg => !msg.read);
          if (unreadMessages.length > 0) {
            await Promise.all(unreadMessages.map(msg => 
              supabase
                .from('direct_messages')
                .update({ read: true })
                .eq('id', msg.id)
            ));
          }
        }
        
        const allMessages = [...(sentMessages || []), ...(receivedMessages || [])].sort((a, b) => {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });
        
        setMessages(allMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast({
          variant: "destructive",
          title: "Erro ao buscar mensagens",
          description: "Não foi possível carregar o histórico de mensagens."
        });
      }
    };
    
    fetchMessages();
    
    const channel = supabase
      .channel('direct_messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        async (payload) => {
          if (payload.new.sender_id === receiver.id) {
            setMessages(prev => [...prev, payload.new as DirectMessageType]);
            
            await supabase
              .from('direct_messages')
              .update({ read: true })
              .eq('id', payload.new.id);
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, receiver]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !receiver) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('send_direct_message', {
        sender_id_param: user.id,
        sender_name_param: user.name,
        receiver_id_param: receiver.id,
        message_param: newMessage.trim()
      });
      
      if (error) throw error;
      
      const optimisticMessage: DirectMessageType = {
        id: crypto.randomUUID(),
        sender_id: user.id,
        sender_name: user.name,
        receiver_id: receiver.id,
        message: newMessage.trim(),
        read: false,
        created_at: new Date().toISOString()
      };
      
      setMessages([...messages, optimisticMessage]);
      setNewMessage("");
      
      await createNotification(
        receiver.id,
        "Nova mensagem",
        `${user.name} enviou uma mensagem para você`,
        "message"
      );
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar a mensagem."
      });
    } finally {
      setLoading(false);
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  if (!user || !receiver) return null;
  
  return (
    <Card className={`${isModal ? "w-full h-full border-0 shadow-none" : "w-full h-[500px]"}`}>
      <CardHeader className="border-b py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={receiver.avatar_url} alt={receiver.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(receiver.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{receiver.name}</CardTitle>
              <p className="text-sm text-muted-foreground capitalize">
                {receiver.role === "owner" ? "Proprietário" : 
                 receiver.role === "inactive" ? "Inativo" : "Vendedor"}
              </p>
            </div>
          </div>
          {!isModal && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Fechar
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-[calc(100%-140px)] px-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <MessageSquare size={48} className="text-muted-foreground mb-4" />
              <p className="text-muted-foreground max-w-sm">
                Nenhuma mensagem ainda. Envie a primeira mensagem para iniciar a conversa.
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {messages.map((msg) => {
                const isCurrentUser = msg.sender_id === user.id;
                
                return (
                  <div 
                    key={msg.id} 
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[75%] rounded-lg p-3 shadow-sm ${
                        isCurrentUser 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted border'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.message}</p>
                      <div className="flex items-center justify-end mt-2 space-x-1">
                        <span className="text-xs opacity-75">
                          {formatTime(msg.created_at)}
                        </span>
                        {isCurrentUser && msg.read && (
                          <Check className="h-3 w-3 text-green-400" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="border-t p-4">
        <form 
          className="flex w-full space-x-3" 
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-background dark:bg-muted/50 border-input dark:border-muted-foreground/20 focus-visible:ring-ring dark:focus-visible:ring-primary"
            disabled={loading}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={loading || !newMessage.trim()}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
