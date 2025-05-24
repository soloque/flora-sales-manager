
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DirectMessage } from "@/types";
import { format } from "date-fns";
import { MessageSquare } from "lucide-react";

interface DirectMessageListProps {
  messages: DirectMessage[];
  unreadCount: number;
  onMarkAsRead: (messageId: string) => void;
  onOpenChat: (senderId: string, senderName: string) => void;
}

const DirectMessageList = ({
  messages,
  unreadCount,
  onMarkAsRead,
  onOpenChat
}: DirectMessageListProps) => {
  const [showAll, setShowAll] = useState(false);

  // Get unique sender names
  const uniqueSenders = [...new Set(messages.map(msg => msg.sender_id))];
  const unreadBySender = uniqueSenders.reduce((acc, senderId) => {
    const count = messages.filter(
      msg => msg.sender_id === senderId && !msg.read
    ).length;
    if (count > 0) {
      acc[senderId] = count;
    }
    return acc;
  }, {} as Record<string, number>);

  const getSenderInfo = (senderId: string) => {
    const senderMessages = messages.filter(msg => msg.sender_id === senderId);
    const senderName = senderMessages[0]?.sender_name || "Desconhecido";
    const lastMessage = senderMessages.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
    
    return {
      name: senderName,
      lastMessage,
      unreadCount: unreadBySender[senderId] || 0
    };
  };

  // Sort senders by last message date
  const sortedSenders = uniqueSenders.sort((a, b) => {
    const lastMsgA = messages
      .filter(msg => msg.sender_id === a)
      .sort((x, y) => 
        new Date(y.created_at).getTime() - new Date(x.created_at).getTime()
      )[0];
    
    const lastMsgB = messages
      .filter(msg => msg.sender_id === b)
      .sort((x, y) => 
        new Date(y.created_at).getTime() - new Date(x.created_at).getTime()
      )[0];
    
    return new Date(lastMsgB?.created_at || 0).getTime() - 
           new Date(lastMsgA?.created_at || 0).getTime();
  });

  // Get display senders based on showAll toggle
  const displaySenders = showAll ? sortedSenders : sortedSenders.slice(0, 3);

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              Mensagens Diretas
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} nova{unreadCount !== 1 ? "s" : ""}
                </Badge>
              )}
            </CardTitle>
            {sortedSenders.length > 3 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Mostrar menos" : "Mostrar todos"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {displaySenders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma mensagem recebida.
            </div>
          ) : (
            <div className="space-y-4">
              {displaySenders.map(senderId => {
                const { name, lastMessage, unreadCount } = getSenderInfo(senderId);
                
                return (
                  <div 
                    key={senderId}
                    className={`border rounded-md p-4 cursor-pointer transition-colors ${
                      unreadCount > 0 ? 'bg-accent/10 hover:bg-accent/20' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => {
                      onOpenChat(senderId, name);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 text-muted-foreground mr-2" />
                        <div>
                          <div className="font-medium">{name}</div>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {lastMessage?.message}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-xs text-muted-foreground">
                          {lastMessage && format(new Date(lastMessage.created_at), 'dd/MM HH:mm')}
                        </div>
                        {unreadCount > 0 && (
                          <Badge className="mt-1">
                            {unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DirectMessageList;
