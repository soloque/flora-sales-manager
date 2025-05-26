
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DirectMessage, User } from "@/types";
import { createNotification } from "@/services/notificationService";
import { toast } from "@/components/ui/use-toast";
import { format, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MessageThreadProps {
  recipient: User;
  onBack: () => void;
}

const MessageThread = ({ recipient, onBack }: MessageThreadProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('direct_messages')
          .select('*')
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${recipient.id}),and(sender_id.eq.${recipient.id},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true });

        if (error) throw error;

        if (data) {
          const formattedMessages: DirectMessage[] = data.map(msg => ({
            id: msg.id,
            sender_id: msg.sender_id,
            sender_name: msg.sender_name,
            receiver_id: msg.receiver_id,
            message: msg.message,
            read: msg.read,
            created_at: msg.created_at
          }));
          setMessages(formattedMessages);

          // Mark messages from recipient as read
          const unreadMessages = formattedMessages.filter(
            msg => msg.sender_id === recipient.id && !msg.read
          );

          for (const msg of unreadMessages) {
            await supabase.rpc('mark_message_as_read', {
              message_id_param: msg.id
            });
          }
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast({
          title: "Erro ao carregar mensagens",
          description: "Não foi possível carregar as mensagens.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel(`messages_${user.id}_${recipient.id}`)
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${recipient.id}),and(sender_id.eq.${recipient.id},receiver_id.eq.${user.id}))`
        },
        (payload) => {
          const newMessage = payload.new as any;
          const mappedMessage: DirectMessage = {
            id: newMessage.id,
            sender_id: newMessage.sender_id,
            sender_name: newMessage.sender_name,
            receiver_id: newMessage.receiver_id,
            message: newMessage.message,
            read: newMessage.read,
            created_at: newMessage.created_at
          };
          
          setMessages(prev => [...prev, mappedMessage]);
          
          // Auto mark as read if sender is recipient
          if (newMessage.sender_id === recipient.id) {
            setTimeout(() => {
              supabase.rpc('mark_message_as_read', {
                message_id_param: newMessage.id
              });
            }, 1000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, recipient.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || isSending) return;

    setIsSending(true);
    try {
      const { error } = await supabase.rpc('send_direct_message', {
        sender_id_param: user.id,
        sender_name_param: user.name,
        receiver_id_param: recipient.id,
        message_param: newMessage.trim()
      });

      if (error) throw error;

      // Create notification for recipient
      await createNotification(
        recipient.id,
        `Nova mensagem de ${user.name}`,
        newMessage.substring(0, 50) + (newMessage.length > 50 ? '...' : ''),
        "message"
      );

      setNewMessage("");
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

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Ontem ' + format(date, 'HH:mm');
    } else {
      return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
    }
  };

  const groupMessagesByDate = () => {
    const groups: { [key: string]: DirectMessage[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.created_at);
      let dateKey;
      
      if (isToday(date)) {
        dateKey = 'Hoje';
      } else if (isYesterday(date)) {
        dateKey = 'Ontem';
      } else {
        dateKey = format(date, 'dd/MM/yyyy', { locale: ptBR });
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByDate();

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0 border-b">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Avatar>
            <AvatarFallback>
              {recipient.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{recipient.name}</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant={recipient.role === 'owner' ? 'default' : 'secondary'}>
                {recipient.role === 'owner' ? 'Proprietário' : 'Vendedor'}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : Object.keys(messageGroups).length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Nenhuma mensagem ainda. Inicie a conversa!
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(messageGroups).map(([dateKey, dateMessages]) => (
                <div key={dateKey}>
                  <div className="text-center text-xs text-muted-foreground mb-2">
                    <Badge variant="outline">{dateKey}</Badge>
                  </div>
                  {dateMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                      } mb-3`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 ${
                          message.sender_id === user?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender_id === user?.id 
                            ? 'text-primary-foreground/70' 
                            : 'text-muted-foreground'
                        }`}>
                          {formatMessageDate(message.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
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
        </div>
      </CardContent>
    </Card>
  );
};

export default MessageThread;
