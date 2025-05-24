
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { User, TeamRequest, DirectMessage } from "@/types";
import TeamInviteModal from "@/components/TeamInviteModal";
import TeamMembersList from "@/components/TeamMembersList";
import TeamRequestsList from "@/components/TeamRequestsList";
import DirectMessageList from "@/components/DirectMessageList";
import { TeamChat } from "@/components/TeamChat";
import { createNotification } from "@/services/notificationService";

const TeamManagement = () => {
  const { user } = useAuth();
  const isOwner = user?.role === "owner";
  
  // State for team members and requests
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [teamRequests, setTeamRequests] = useState<TeamRequest[]>([]);
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerSearchResults, setOwnerSearchResults] = useState<User[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<User | null>(null);
  
  // State for direct messaging
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [selectedTeamMember, setSelectedTeamMember] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showChatView, setShowChatView] = useState(false);
  
  // Load team data based on user role
  useEffect(() => {
    if (!user) return;
    
    const fetchTeamData = async () => {
      try {
        if (isOwner) {
          // Fetch team members for owner using SQL function
          const { data, error: membersError } = await supabase.rpc(
            'get_team_members',
            { owner_id_param: user.id }
          );
            
          if (membersError) {
            console.error("Error fetching team members:", membersError);
            return;
          }
          
          if (data) {
            const membersData = data as any[];
            const formattedMembers = membersData.map(member => ({
              id: member.id,
              name: member.name || "Sem nome",
              email: member.email || "Sem email",
              role: (member.role || "seller") as "seller" | "inactive" | "owner",
              createdAt: new Date(member.created_at),
              avatar_url: member.avatar_url
            }));
            
            setTeamMembers(formattedMembers);
          }
          
          // Fetch team requests for owner using SQL function
          const { data: requests, error: requestsError } = await supabase.rpc(
            'get_team_requests',
            { owner_id_param: user.id }
          );
            
          if (requestsError) {
            console.error("Error fetching team requests:", requestsError);
            return;
          }
          
          if (requests) {
            const requestsData = requests as any[];
            const mappedRequests: TeamRequest[] = requestsData.map(req => ({
              id: req.id,
              seller_id: req.seller_id,
              seller_name: req.seller_name,
              owner_id: req.owner_id,
              message: req.message,
              status: req.status,
              created_at: req.created_at,
              seller_email: req.seller_email
            }));
            setTeamRequests(mappedRequests);
          }
        } else {
          // For sellers, fetch their owner using SQL function
          const { data, error: teamError } = await supabase.rpc(
            'get_seller_team',
            { seller_id_param: user.id }
          );
            
          if (teamError) {
            console.error("Error fetching team:", teamError);
            return;
          }
          
          if (data && Array.isArray(data) && data.length > 0) {
            const teamData = data as any[];
            const ownerUser: User = {
              id: teamData[0].id,
              name: teamData[0].name || "Proprietário",
              email: teamData[0].email || "",
              role: "owner",
              createdAt: new Date(teamData[0].created_at),
              avatar_url: teamData[0].avatar_url
            };
            setSelectedOwner(ownerUser);
          }
        }
      } catch (error) {
        console.error("Error fetching team data:", error);
      }
    };
    
    fetchTeamData();
  }, [user, isOwner]);
  
  // Search for owners by email
  const handleSearchOwner = async () => {
    if (!ownerEmail.trim()) {
      toast({
        title: "Email em branco",
        description: "Por favor, informe um email para buscar",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'owner')
        .ilike('email', `%${ownerEmail}%`);
        
      if (error) {
        toast({
          title: "Erro ao buscar proprietário",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      if (data && data.length > 0) {
        const formattedOwners = data.map(owner => ({
          id: owner.id,
          name: owner.name || "Sem nome",
          email: owner.email || "Sem email",
          role: owner.role as "seller" | "inactive" | "owner",
          createdAt: new Date(owner.created_at),
          avatar_url: owner.avatar_url
        }));
        
        setOwnerSearchResults(formattedOwners);
      } else {
        setOwnerSearchResults([]);
        toast({
          title: "Nenhum resultado",
          description: "Não encontramos proprietários com este email",
        });
      }
    } catch (error) {
      console.error("Error searching owner:", error);
    }
  };
  
  // Handle team request response (approve/reject)
  const handleRequestResponse = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      const request = teamRequests.find(req => req.id === requestId);
      if (!request) return;
      
      // Update request status using SQL function
      const { error: updateError } = await supabase.rpc('update_team_request', {
        request_id_param: requestId,
        status_param: status
      });
        
      if (updateError) {
        throw updateError;
      }
      
      if (status === 'approved') {
        // Add seller to team members using SQL function
        const { error: teamError } = await supabase.rpc('add_team_member', {
          owner_id_param: request.owner_id,
          seller_id_param: request.seller_id
        });
          
        if (teamError) {
          throw teamError;
        }
        
        // Send notification to the seller about approval
        await createNotification(
          request.seller_id,
          "Solicitação de time aprovada",
          "Sua solicitação para integrar o time foi aprovada!",
          "team_request"
        );
        
        // Fetch seller details to add to team members list
        const { data: sellerData, error: sellerError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', request.seller_id)
          .single();
          
        if (sellerError) {
          console.error("Error fetching seller details:", sellerError);
        } else if (sellerData) {
          const newTeamMember: User = {
            id: sellerData.id,
            name: sellerData.name || request.seller_name,
            email: sellerData.email || "",
            role: (sellerData.role as "seller" | "inactive" | "owner") || "seller",
            createdAt: new Date(sellerData.created_at),
            avatar_url: sellerData.avatar_url
          };
          
          setTeamMembers(prev => [...prev, newTeamMember]);
        }
      } else {
        // Send notification about rejection
        await createNotification(
          request.seller_id,
          "Solicitação de time rejeitada",
          "Sua solicitação para integrar o time foi rejeitada.",
          "team_request"
        );
      }
      
      // Remove request from list
      setTeamRequests(prev => prev.filter(req => req.id !== requestId));
      
      toast({
        title: `Solicitação ${status === 'approved' ? 'aprovada' : 'rejeitada'}`,
        description: `A solicitação de ${request.seller_name} foi ${status === 'approved' ? 'aprovada' : 'rejeitada'}.`
      });
    } catch (error: any) {
      console.error(`Error ${status === 'approved' ? 'approving' : 'rejecting'} request:`, error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  // Load messages for the current user
  useEffect(() => {
    if (!user) return;
    
    const fetchMessages = async () => {
      // Get user messages using SQL function
      const { data, error } = await supabase.rpc(
        'get_user_messages',
        { user_id_param: user.id }
      );
        
      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }
      
      if (data) {
        const messagesData = data as any[];
        const mappedMessages: DirectMessage[] = messagesData.map(msg => ({
          id: msg.id,
          sender_id: msg.sender_id,
          sender_name: msg.sender_name,
          receiver_id: msg.receiver_id,
          message: msg.message,
          read: msg.read,
          created_at: msg.created_at
        }));
        setDirectMessages(mappedMessages);
        const unread = mappedMessages.filter(msg => !msg.read).length;
        setUnreadCount(unread);
      }
    };
    
    fetchMessages();
    
    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('direct_messages_changes')
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `receiver_id=eq.${user.id}`
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
          
          setDirectMessages(prev => [mappedMessage, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Create notification for new message
          createNotification(
            user.id,
            `Nova mensagem de ${newMessage.sender_name}`,
            newMessage.message.substring(0, 50) + (newMessage.message.length > 50 ? '...' : ''),
            "message",
            newMessage.id
          );
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  // Mark message as read
  const markMessageAsRead = async (messageId: string) => {
    try {
      // Mark message as read using SQL function
      const { error } = await supabase.rpc('mark_message_as_read', {
        message_id_param: messageId
      });
        
      if (error) {
        console.error("Error marking message as read:", error);
        return;
      }
      
      setDirectMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, read: true } : msg
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };
  
  // Handle opening chat with a team member
  const handleOpenChat = (member: User) => {
    setSelectedTeamMember(member);
    setShowChatView(true);
    
    // Mark messages from this user as read
    const messagesToMark = directMessages
      .filter(msg => 
        msg.sender_id === member.id && 
        msg.receiver_id === user?.id && 
        !msg.read
      );
      
    messagesToMark.forEach(msg => {
      markMessageAsRead(msg.id);
    });
  };
  
  if (showChatView && selectedTeamMember) {
    return (
      <TeamChat 
        selectedMember={selectedTeamMember} 
        onClose={() => setShowChatView(false)} 
      />
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Time</CardTitle>
          <CardDescription>
            {isOwner 
              ? "Gerencie seu time de vendedores e as solicitações de integração"
              : "Visualize informações sobre seu time de vendas"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isOwner ? (
            // Owner view
            <div className="space-y-8">
              {/* Team Members section */}
              <TeamMembersList 
                teamMembers={teamMembers} 
                onSendMessage={handleOpenChat}
              />
              
              {/* Team Requests section */}
              <TeamRequestsList 
                requests={teamRequests}
                onApprove={(requestId) => handleRequestResponse(requestId, 'approved')}
                onReject={(requestId) => handleRequestResponse(requestId, 'rejected')}
              />
            </div>
          ) : (
            // Seller view
            <div className="space-y-8">
              {selectedOwner ? (
                // Already in a team
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Seu Time</h3>
                  <div className="p-6 border rounded-md bg-muted/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Proprietário</p>
                        <p className="text-lg font-medium">{selectedOwner.name}</p>
                        <p className="text-sm">{selectedOwner.email}</p>
                      </div>
                      <Button onClick={() => handleOpenChat(selectedOwner)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square h-4 w-4 mr-2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                        Enviar Mensagem
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                // Not in a team yet
                <div className="space-y-6">
                  <div className="p-6 border rounded-md bg-muted/10">
                    <p className="text-center mb-4">
                      Você ainda não faz parte de nenhum time de vendas. Busque por um proprietário pelo email para enviar uma solicitação.
                    </p>
                    <div className="flex space-x-2">
                      <Input 
                        placeholder="Email do proprietário" 
                        value={ownerEmail}
                        onChange={(e) => setOwnerEmail(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={handleSearchOwner}>Buscar</Button>
                    </div>
                  </div>
                  
                  {ownerSearchResults.length > 0 && (
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ownerSearchResults.map((owner) => (
                            <TableRow key={owner.id}>
                              <TableCell>{owner.name}</TableCell>
                              <TableCell>{owner.email}</TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedOwner(owner);
                                    setShowInviteModal(true);
                                  }}
                                >
                                  Solicitar Integração
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}
              
              {/* Messages section for seller */}
              <DirectMessageList 
                messages={directMessages} 
                unreadCount={unreadCount} 
                onMarkAsRead={markMessageAsRead}
                onOpenChat={(senderId, senderName) => {
                  // Find seller in team
                  const sender = {
                    id: senderId,
                    name: senderName,
                    email: "",
                    role: "owner" as const,
                    createdAt: new Date()
                  };
                  handleOpenChat(sender);
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Team Invite Modal */}
      <TeamInviteModal 
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        ownerId={selectedOwner?.id}
        ownerName={selectedOwner?.name}
      />
    </div>
  );
};

export default TeamManagement;
