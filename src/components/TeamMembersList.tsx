
import { useState, useEffect } from "react";
import { User } from "@/types";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageSquare, Mail, UserCheck, Bot } from "lucide-react";
import { SellerDeleteConfirm } from "@/components/SellerActions";
import { ChatModal } from "@/components/ChatModal";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface TeamMembersListProps {
  teamMembers: User[];
  onSendMessage: (member: User) => void;
}

interface VirtualSeller {
  id: string;
  name: string;
  email: string | null;
  created_at: string;
  is_virtual: boolean;
}

const TeamMembersList = ({ teamMembers }: TeamMembersListProps) => {
  const { user } = useAuth();
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [virtualSellers, setVirtualSellers] = useState<VirtualSeller[]>([]);

  useEffect(() => {
    if (user && user.role === "owner") {
      fetchVirtualSellers();
    }
  }, [user]);

  const fetchVirtualSellers = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('virtual_sellers')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        setVirtualSellers(data.map(vs => ({
          ...vs,
          is_virtual: true
        })));
      }
    } catch (error) {
      console.error("Error fetching virtual sellers:", error);
    }
  };

  // Combine real team members and virtual sellers
  const allSellers = [
    ...teamMembers.map(member => ({
      ...member,
      is_virtual: false,
      type: 'real' as const
    })),
    ...virtualSellers.map(vs => ({
      id: vs.id,
      name: vs.name,
      email: vs.email || "Sem email",
      role: "virtual_seller" as const,
      createdAt: new Date(vs.created_at),
      avatar_url: null,
      is_virtual: true,
      type: 'virtual' as const
    }))
  ];

  // Sort by join date
  const sortedSellers = [...allSellers].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  const handleOpenChat = (member: any) => {
    if (member.is_virtual) {
      // Cannot chat with virtual sellers
      return;
    }
    setSelectedMember(member);
    setIsChatModalOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatModalOpen(false);
    setSelectedMember(null);
  };

  const handleDeleteVirtualSeller = async (virtualSellerId: string) => {
    try {
      const { error } = await supabase
        .from('virtual_sellers')
        .delete()
        .eq('id', virtualSellerId);

      if (error) throw error;

      // Refresh the list
      fetchVirtualSellers();
    } catch (error) {
      console.error("Error deleting virtual seller:", error);
    }
  };
  
  return (
    <>
      <div>
        <h3 className="text-lg font-medium mb-4">Membros da Equipe</h3>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Membro desde</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSellers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhum membro na equipe ainda.
                  </TableCell>
                </TableRow>
              ) : (
                sortedSellers.map((seller) => (
                  <TableRow key={`${seller.type}-${seller.id}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {seller.is_virtual ? (
                          <Bot className="h-4 w-4 text-blue-500" />
                        ) : (
                          <UserCheck className="h-4 w-4 text-green-500" />
                        )}
                        {seller.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        {seller.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        seller.is_virtual 
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}>
                        {seller.is_virtual ? "Virtual" : "Registrado"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {formatDistance(seller.createdAt, new Date(), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        seller.role === "inactive" 
                          ? "bg-gray-100 text-gray-800"
                          : "bg-green-100 text-green-800"
                      }`}>
                        {seller.role === "inactive" ? "Inativo" : "Ativo"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        {!seller.is_virtual ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenChat(seller)}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Mensagem
                            </Button>
                            <SellerDeleteConfirm
                              seller={seller}
                              onDeleteSuccess={() => {
                                window.location.reload();
                              }}
                            />
                          </>
                        ) : (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteVirtualSeller(seller.id)}
                          >
                            Remover
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ChatModal 
        isOpen={isChatModalOpen}
        onClose={handleCloseChat}
        selectedMember={selectedMember}
      />
    </>
  );
};

export default TeamMembersList;
