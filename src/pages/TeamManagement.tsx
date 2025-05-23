
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
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import TeamInviteModal from "@/components/TeamInviteModal";
import TeamMembersList from "@/components/TeamMembersList";
import TeamRequestsList from "@/components/TeamRequestsList";
import DirectMessageList from "@/components/DirectMessageList";

// Interface for team request
interface TeamRequest {
  id: string;
  seller_id: string;
  seller_name: string;
  owner_id: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  seller_email?: string;
}

// Interface for team member
interface TeamMember {
  id: string;
  owner_id: string;
  seller_id: string;
  created_at: string;
}

// Interface for direct message
interface DirectMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  receiver_id: string;
  message: string;
  created_at: string;
  read: boolean;
}

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
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Load team data based on user role
  useEffect(() => {
    if (!user) return;
    
    const fetchTeamData = async () => {
      try {
        if (isOwner) {
          // Fetch team members for owner using SQL function
          const { data: membersData, error: membersError } = await supabase.rpc('get_team_members', {
            owner_id_param: user.id
          });
            
          if (membersError) {
            console.error("Error fetching team members:", membersError);
            return;
          }
          
          if (membersData) {
            const formattedMembers = membersData.map(member => ({
              id: member.id,
              name: member.name || "Sem nome",
              email: member.email || "Sem email",
              role: member.role as "seller" | "guest" | "owner",
              createdAt: new Date(member.created_at),
              avatar_url: member.avatar_url
            }));
            
            setTeamMembers(formattedMembers);
          }
          
          // Fetch team requests for owner using SQL function
          const { data: requestsData, error: requestsError } = await supabase.rpc('get_team_requests', {
            owner_id_param: user.id
          });
            
          if (requestsError) {
            console.error("Error fetching team requests:", requestsError);
            return;
          }
          
          if (requestsData) {
            setTeamRequests(requestsData as TeamRequest[]);
          }
        } else {
          // For sellers, fetch their owner using SQL function
          const { data: teamData, error: teamError } = await supabase.rpc('get_seller_team', {
            seller_id_param: user.id
          });
            
          if (teamError) {
            console.error("Error fetching team:", teamError);
            return;
          }
          
          if (teamData && teamData.length > 0) {
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
          role: owner.role as "seller" | "guest" | "owner",
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
            role: sellerData.role as "seller" | "guest" | "owner",
            createdAt: new Date(sellerData.created_at),
            avatar_url: sellerData.avatar_url
          };
          
          setTeamMembers(prev => [...prev, newTeamMember]);
        }
      }
      
      // Remove request from list
      setTeamRequests(prev => prev.filter(req => req.id !== requestId));
      
      toast({
        title: `Solicitação ${status === 'approved' ? 'aprovada' : 'rejeitada'}`,
        description: `A solicitação de ${request.seller_name} foi ${status === 'approved' ? 'aprovada' : 'rejeitada'}.`,
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
  
  // Send direct message
  const handleSendMessage = async () => {
    if (!user || !selectedTeamMember || !newMessage.trim()) return;
    
    try {
      // Send message using SQL function
      const { error } = await supabase.rpc('send_direct_message', {
        sender_id_param: user.id,
        sender_name_param: user.name || '',
        receiver_id_param: selectedTeamMember.id,
        message_param: newMessage
      });
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Mensagem enviada",
        description: `Sua mensagem para ${selectedTeamMember.name} foi enviada com sucesso!`,
      });
      
      setNewMessage("");
      setShowMessageDialog(false);
    } catch (error: any) {
      console.error("Error sending message:", error);
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
      const { data, error } = await supabase.rpc('get_user_messages', {
        user_id_param: user.id
      });
        
      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }
      
      if (data) {
        setDirectMessages(data as DirectMessage[]);
        const unread = data.filter(msg => !msg.read).length;
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
          const newMessage = payload.new as DirectMessage;
          setDirectMessages(prev => [newMessage, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          toast({
            title: "Nova mensagem",
            description: `${newMessage.sender_name}: ${newMessage.message.substring(0, 30)}${newMessage.message.length > 30 ? '...' : ''}`,
          });
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
                onSendMessage={(member) => {
                  setSelectedTeamMember(member);
                  setShowMessageDialog(true);
                }}
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
                      <Button 
                        onClick={() => {
                          setSelectedTeamMember(selectedOwner);
                          setShowMessageDialog(true);
                        }}
                      >
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
      
      {/* Direct Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar mensagem</DialogTitle>
            <DialogDescription>
              Envie uma mensagem para {selectedTeamMember?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Digite sua mensagem..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMessageDialog(false)}>Cancelar</Button>
            <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>Enviar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamManagement;
