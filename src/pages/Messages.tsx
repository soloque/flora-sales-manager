
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { User } from "@/types";
import ConversationsList from "@/components/ConversationsList";
import MessageThread from "@/components/MessageThread";

const Messages = () => {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Você precisa estar logado para acessar as mensagens.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {selectedUser ? (
        <MessageThread 
          recipient={selectedUser} 
          onBack={() => setSelectedUser(null)} 
        />
      ) : (
        <ConversationsList onSelectConversation={setSelectedUser} />
      )}
    </div>
  );
};

export default Messages;
