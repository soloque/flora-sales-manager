
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Search, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User, DirectMessage } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface ConversationsListProps {
  onSelectConversation: (user: User) => void;
}

interface Conversation {
  user: User;
  lastMessage?: DirectMessage;
  unreadCount: number;
}

const ConversationsList = ({ onSelectConversation }: ConversationsListProps) => {
  const { user } = useAuth();
  const isOwner = user?.role === "owner";
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showAvailable, setShowAvailable] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchConversationsAndUsers = async () => {
      setIsLoading(true);
      try {
        // Get team members based on user role
        let teamUsers: User[] = [];
        
        if (isOwner) {
          // Get sellers in owner's team
          const { data: teamData, error: teamError } = await supabase.rpc(
            'get_team_members',
            { owner_id_param: user.id }
          );
          
          if (teamError) throw teamError;
          
          if (teamData) {
            teamUsers = teamData.map((member: any) => ({
              id: member.id,
              name: member.name || "Vendedor",
              email: member.email || "",
              role: member.role as "seller" | "owner",
              createdAt: new Date(member.created_at),
              avatar_url: member.avatar_url
            }));
          }
        } else {
          // Get owner for this seller
          const { data: ownerData, error: ownerError } = await supabase.rpc(
            'get_seller_team',
            { seller_id_param: user.id }
          );
          
          if (ownerError) throw ownerError;
          
          if (ownerData && Array.isArray(ownerData) && ownerData.length > 0) {
            teamUsers = [
              {
                id: ownerData[0].id,
                name: ownerData[0].name || "Proprietário",
                email: ownerData[0].email || "",
                role: "owner",
                createdAt: new Date(ownerData[0].created_at),
                avatar_url: ownerData[0].avatar_url
              }
            ];
          }
        }

        setAvailableUsers(teamUsers);

        // Get messages to build conversations
        const { data: messagesData, error: messagesError } = await supabase
          .from('direct_messages')
          .select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (messagesError) throw messagesError;

        // Build conversations map
        const conversationsMap = new Map<string, Conversation>();

        if (messagesData) {
          messagesData.forEach((msg: any) => {
            const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
            const otherUser = teamUsers.find(u => u.id === otherUserId);
            
            if (otherUser && !conversationsMap.has(otherUserId)) {
              const lastMessage: DirectMessage = {
                id: msg.id,
                sender_id: msg.sender_id,
                sender_name: msg.sender_name,
                receiver_id: msg.receiver_id,
                message: msg.message,
                read: msg.read,
                created_at: msg.created_at
              };

              // Count unread messages from this user
              const unreadCount = messagesData.filter((m: any) => 
                m.sender_id === otherUserId && 
                m.receiver_id === user.id && 
                !m.read
              ).length;

              conversationsMap.set(otherUserId, {
                user: otherUser,
                lastMessage,
                unreadCount
              });
            }
          });
        }

        setConversations(Array.from(conversationsMap.values()));
      } catch (error) {
        console.error("Error fetching conversations:", error);
        toast({
          title: "Erro ao carregar conversas",
          description: "Não foi possível carregar as conversas.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversationsAndUsers();

    // Set up real-time subscription
    const channel = supabase
      .channel('conversations_updates')
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `receiver_id=eq.${user.id}`
        },
        () => {
          // Refresh conversations when new message arrives
          fetchConversationsAndUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isOwner]);

  const filteredUsers = availableUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredConversations = conversations.filter(conv => 
    conv.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartConversation = (selectedUser: User) => {
    onSelectConversation(selectedUser);
    setShowAvailable(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Mensagens
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAvailable(!showAvailable)}
          >
            <Users className="h-4 w-4 mr-2" />
            {showAvailable ? 'Ver Conversas' : 'Nova Conversa'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {showAvailable ? (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              {isOwner ? 'Seus Vendedores' : 'Seu Proprietário'}
            </h4>
            {filteredUsers.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                {availableUsers.length === 0 
                  ? (isOwner ? 'Nenhum vendedor no seu time.' : 'Você não faz parte de nenhum time.')
                  : 'Nenhum usuário encontrado.'
                }
              </div>
            ) : (
              filteredUsers.map((availableUser) => (
                <div
                  key={availableUser.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleStartConversation(availableUser)}
                >
                  <Avatar>
                    <AvatarFallback>
                      {availableUser.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{availableUser.name}</p>
                      <Badge variant={availableUser.role === 'owner' ? 'default' : 'secondary'}>
                        {availableUser.role === 'owner' ? 'Proprietário' : 'Vendedor'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{availableUser.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Conversas Recentes</h4>
            {filteredConversations.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                {conversations.length === 0 
                  ? 'Nenhuma conversa ainda. Inicie uma nova conversa!'
                  : 'Nenhuma conversa encontrada.'
                }
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.user.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onSelectConversation(conversation.user)}
                >
                  <Avatar>
                    <AvatarFallback>
                      {conversation.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{conversation.user.name}</p>
                      <div className="flex items-center space-x-2">
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {conversation.lastMessage && 
                            format(new Date(conversation.lastMessage.created_at), 'dd/MM HH:mm')
                          }
                        </span>
                      </div>
                    </div>
                    {conversation.lastMessage && (
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage.sender_id === user?.id ? 'Você: ' : ''}
                        {conversation.lastMessage.message}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConversationsList;
