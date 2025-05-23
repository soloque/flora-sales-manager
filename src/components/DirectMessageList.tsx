
import React from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DirectMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  receiver_id: string;
  message: string;
  created_at: string;
  read: boolean;
}

interface DirectMessageListProps {
  messages: DirectMessage[];
  unreadCount: number;
  onMarkAsRead: (messageId: string) => void;
}

const DirectMessageList = ({ messages, unreadCount, onMarkAsRead }: DirectMessageListProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Mensagens</h3>
        {unreadCount > 0 && (
          <Badge variant="secondary">{unreadCount} não lidas</Badge>
        )}
      </div>
      
      {messages.length === 0 ? (
        <div className="text-center py-8 border rounded-md">
          <div className="mx-auto h-12 w-12 text-muted-foreground flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          </div>
          <p className="mt-2 text-muted-foreground">Você não tem mensagens.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <Card 
              key={message.id} 
              className={`${!message.read ? 'border-primary/50 bg-primary/5' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{message.sender_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(message.created_at), 'dd/MM/yyyy HH:mm')}
                    </p>
                    <p className="mt-2">{message.message}</p>
                  </div>
                  {!message.read && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onMarkAsRead(message.id)}
                    >
                      Marcar como lida
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DirectMessageList;
