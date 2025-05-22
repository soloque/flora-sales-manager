
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter,
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
import {
  UserPlus,
  Users,
  Mail,
  Clock,
  Check,
  X,
  MessageSquare,
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { User as UserType } from "@/types";
import TeamInviteModal from "@/components/TeamInviteModal";

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
  const [teamMembers, setTeamMembers] = useState<UserType[]>([]);
  const [teamRequests, setTeamRequests] = useState<TeamRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerSearchResults, setOwnerSearchResults] = useState<UserType[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<UserType | null>(null);
  
  // State for direct messaging
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [selectedTeamMember, setSelectedTeamMember] = useState<UserType | null>(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Load team data based on user role
  useEffect(() => {
    if (!user) return;
    
    const fetchTeamData = async () => {
      if (isOwner) {
        // Fetch team members for owner
        const { data, error } = await supabase
          .rpc('get_team_members', { owner_id_param: user.id });
          
        if (error) {
          console.error("Error fetching team members:", error);
          return;
        }
        
        if (data) {
          const formattedMembers = data.map((member: any) => ({
            id: member.id,
            name: member.name || "Sem nome",
            email: member.email || "Sem email",
            role: member.role as "seller" | "guest" | "owner",
            createdAt: new Date(member.created_at),
            avatar_url: member.avatar_url
          }));
          
          setTeamMembers(formattedMembers);
        }
        
        // Fetch team requests for owner
        const { data: requests, error: requestsError } = await supabase
          .rpc('get_team_requests', { owner_id_param: user.id });
          
        if (requestsError) {
          console.error("Error fetching team requests:", requestsError);
          return;
        }
        
        if (requests) {
          setTeamRequests(requests as TeamRequest[]);
        }
      } else {
        // Fetch team for seller
        const { data: team, error: teamError } = await supabase
          .rpc('get_seller_team', { seller_id_param: user.id });
          
        if (teamError) {
          console.error("Error fetching team:", teamError);
          return;
        }
        
        if (team && team.length > 0) {
          // Set owner information
          const owner = team[0];
          if (owner) {
            const ownerUser: UserType = {
              id: owner.id,
              name: owner.name || "Proprietário",
              email: owner.email || "",
              role: "owner",
              createdAt: new Date(owner.created_at)
            };
            setSelectedOwner(ownerUser);
          }
        }
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
      
      // Update request status
      const { error: updateError } = await supabase
        .rpc('update_team_request', {
          request_id_param: requestId,
          status_param: status
        });
        
      if (updateError) {
        throw updateError;
      }
      
      if (status === 'approved') {
        // Add seller to team members
        const { error: teamError } = await supabase
          .rpc('add_team_member', {
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
          const newTeamMember: UserType = {
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
      const { error } = await supabase
        .rpc('send_direct_message', {
          sender_id_param: user.id,
          sender_name_param: user.name,
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
      const { data, error } = await supabase
        .rpc('get_user_messages', { user_id_param: user.id });
        
      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }
      
      if (data) {
        setDirectMessages(data as DirectMessage[]);
        const unread = data.filter((msg: DirectMessage) => !msg.read).length;
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
      const { error } = await supabase
        .rpc('mark_message_as_read', { message_id_param: messageId });
        
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
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Membros do Time</h3>
                {teamMembers.length === 0 ? (
                  <div className="text-center py-8 border rounded-md">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">Seu time ainda não possui membros.</p>
                  </div>
                ) : (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Desde</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teamMembers.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell>{member.name}</TableCell>
                            <TableCell>{member.email}</TableCell>
                            <TableCell>{format(new Date(member.createdAt), 'dd/MM/yyyy')}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTeamMember(member);
                                    setShowMessageDialog(true);
                                  }}
                                >
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  Mensagem
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
              
              {/* Team Requests section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Solicitações de Integração</h3>
                {teamRequests.length === 0 ? (
                  <div className="text-center py-8 border rounded-md">
                    <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">Não há solicitações pendentes.</p>
                  </div>
                ) : (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vendedor</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Mensagem</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teamRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>{request.seller_name}</TableCell>
                            <TableCell>{request.seller_email}</TableCell>
                            <TableCell>{format(new Date(request.created_at), 'dd/MM/yyyy')}</TableCell>
                            <TableCell>
                              {request.message 
                                ? request.message.substring(0, 30) + (request.message.length > 30 ? '...' : '')
                                : 'Sem mensagem'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleRequestResponse(request.id, 'approved')}
                                  className="bg-green-50 hover:bg-green-100 text-green-600"
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Aprovar
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleRequestResponse(request.id, 'rejected')}
                                  className="bg-red-50 hover:bg-red-100 text-red-600"
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Rejeitar
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
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
                        <MessageSquare className="h-4 w-4 mr-2" />
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
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Mensagens</h3>
                  {unreadCount > 0 && (
                    <Badge variant="secondary">{unreadCount} não lidas</Badge>
                  )}
                </div>
                
                {directMessages.length === 0 ? (
                  <div className="text-center py-8 border rounded-md">
                    <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">Você não tem mensagens.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {directMessages.map((message) => (
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
                                onClick={() => markMessageAsRead(message.id)}
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
