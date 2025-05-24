
import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { Send, Check, MessageSquare } from "lucide-react";
import { DirectMessage, User } from "@/types";

interface TeamChatProps {
  selectedMember: User | null;
  onClose: () => void;
}

export function TeamChat({ selectedMember, onClose }: TeamChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    if (!user || !selectedMember) return;
    
    // Load chat messages
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase.from('direct_messages')
          .select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .or(`sender_id.eq.${selectedMember.id},receiver_id.eq.${selectedMember.id}`)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        
        if (data) {
          const chatMessages = data.filter(msg => 
            (msg.sender_id === user.id && msg.receiver_id === selectedMember.id) || 
            (msg.sender_id === selectedMember.id && msg.receiver_id === user.id)
          ).map(msg => ({
            id: msg.id,
            sender_id: msg.sender_id,
            sender_name: msg.sender_name || "",
            receiver_id: msg.receiver_id,
            message: msg.message,
            created_at: msg.created_at,
            read: msg.read || false
          }));
          
          setMessages(chatMessages);
          
          // Mark received messages as read
          const receivedMsgIds = chatMessages
            .filter(msg => msg.sender_id === selectedMember.id && msg.receiver_id === user.id && !msg.read)
            .map(msg => msg.id);
            
          if (receivedMsgIds.length > 0) {
            await Promise.all(receivedMsgIds.map(id => 
              supabase.rpc('mark_message_as_read', { message_id_param: id })
            ));
          }
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    
    fetchMessages();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('direct_messages_chat')
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `receiver_id=eq.${user.id}`
        },
        async (payload) => {
          const newMsg = payload.new as any;
          
          // Only add if it's from the selected member
          if (newMsg.sender_id === selectedMember.id) {
            const message: DirectMessage = {
              id: newMsg.id,
              sender_id: newMsg.sender_id,
              sender_name: newMsg.sender_name || "",
              receiver_id: newMsg.receiver_id,
              message: newMsg.message,
              created_at: newMsg.created_at,
              read: newMsg.read || false
            };
            
            setMessages(prev => [...prev, message]);
            
            // Mark as read automatically since chat is open
            await supabase.rpc('mark_message_as_read', { 
              message_id_param: newMsg.id 
            });
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedMember]);
  
  const sendMessage = async () => {
    if (!user || !selectedMember || !newMessage.trim()) return;
    
    setIsSending(true);
    try {
      await supabase.rpc('send_direct_message', {
        sender_id_param: user.id,
        sender_name_param: user.name,
        receiver_id_param: selectedMember.id,
        message_param: newMessage.trim()
      });
      
      const newMsg: DirectMessage = {
        id: crypto.randomUUID(),
        sender_id: user.id,
        sender_name: user.name,
        receiver_id: selectedMember.id,
        message: newMessage.trim(),
        created_at: new Date().toISOString(),
        read: false
      };
      
      setMessages(prev => [...prev, newMsg]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };
  
  const formatMessageDate = (dateStr: string) => {
    return format(new Date(dateStr), "dd/MM HH:mm");
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <div>
              <CardTitle>Chat com {selectedMember?.name}</CardTitle>
              <CardDescription>Mensagens diretas</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] overflow-y-auto border rounded-md p-4 bg-muted/20">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <p>Nenhuma mensagem ainda. Envie uma mensagem para iniciar a conversa.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => {
                const isSentByMe = msg.sender_id === user?.id;
                
                return (
                  <div 
                    key={msg.id} 
                    className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg p-3 ${
                        isSentByMe 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}
                    >
                      <div className="text-sm">{msg.message}</div>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-xs opacity-70">
                          {formatMessageDate(msg.created_at)}
                        </span>
                        {isSentByMe && (
                          <Check 
                            className={`h-3 w-3 ${msg.read ? 'text-green-500' : 'opacity-70'}`} 
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full gap-2">
          <Textarea
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="resize-none flex-1"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button 
            onClick={sendMessage} 
            disabled={isSending || !newMessage.trim()}
            className="self-end"
          >
            <Send className="h-4 w-4 mr-2" />
            Enviar
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
