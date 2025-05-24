
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { User, DirectMessage as DirectMessageType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
        // Fetch messages sent by current user to receiver
        const { data: sentMessages, error: sentError } = await supabase
          .from('direct_messages')
          .select('*')
          .eq('sender_id', user.id)
          .eq('receiver_id', receiver.id)
          .order('created_at', { ascending: true });
          
        if (sentError) throw sentError;
        
        // Fetch messages sent to current user from receiver
        const { data: receivedMessages, error: receivedError } = await supabase
          .from('direct_messages')
          .select('*')
          .eq('sender_id', receiver.id)
          .eq('receiver_id', user.id)
          .order('created_at', { ascending: true });
          
        if (receivedError) throw receivedError;
        
        // Mark received messages as read
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
        
        // Combine and sort messages
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
    
    // Subscribe to new messages from this user
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
          // Only add if it's from the current conversation partner
          if (payload.new.sender_id === receiver.id) {
            setMessages(prev => [...prev, payload.new as DirectMessageType]);
            
            // Mark as read immediately
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
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !receiver) return;
    
    setLoading(true);
    
    try {
      // Call the custom function to send a message
      const { data, error } = await supabase.rpc('send_direct_message', {
        sender_id_param: user.id,
        sender_name_param: user.name,
        receiver_id_param: receiver.id,
        message_param: newMessage.trim()
      });
      
      if (error) throw error;
      
      // Optimistically add message to UI
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
      
      // Create notification for receiver
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
  
  // If either user is missing, don't render
  if (!user || !receiver) return null;
  
  return (
    <Card className={isModal ? "w-full h-full" : "w-full h-[500px]"}>
      <CardHeader className="border-b py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={receiver.avatar_url} alt={receiver.name} />
              <AvatarFallback>{getInitials(receiver.name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{receiver.name}</CardTitle>
              <p className="text-xs text-muted-foreground">{
                receiver.role === "owner" ? "Proprietário" : 
                receiver.role === "inactive" ? "Inativo" : "Vendedor"
              }</p>
            </div>
          </div>
          {!isModal && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Fechar
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-3 overflow-y-auto" style={{ height: "calc(100% - 140px)" }}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <MessageSquare size={40} className="text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Nenhuma mensagem ainda. Envie a primeira mensagem para iniciar a conversa.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isCurrentUser = msg.sender_id === user.id;
              
              return (
                <div 
                  key={msg.id} 
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg p-3 ${
                      isCurrentUser 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-accent'
                    }`}
                  >
                    <p>{msg.message}</p>
                    <div className="flex items-center justify-end mt-1 space-x-1">
                      <span className="text-xs opacity-75">
                        {formatTime(msg.created_at)}
                      </span>
                      {isCurrentUser && msg.read && (
                        <Check className="h-3 w-3 opacity-75" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t p-3">
        <form 
          className="flex w-full space-x-2" 
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1"
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={loading || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
