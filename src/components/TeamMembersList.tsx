
import { useState } from "react";
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
import { MessageSquare, Mail } from "lucide-react";
import { SellerDeleteConfirm } from "@/components/SellerActions";
import { ChatModal } from "@/components/ChatModal";

interface TeamMembersListProps {
  teamMembers: User[];
  onSendMessage: (member: User) => void;
}

const TeamMembersList = ({ teamMembers }: TeamMembersListProps) => {
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  // Sort by join date
  const sortedMembers = [...teamMembers].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  const handleOpenChat = (member: User) => {
    setSelectedMember(member);
    setIsChatModalOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatModalOpen(false);
    setSelectedMember(null);
  };
  
  return (
    <>
      <div>
        <h3 className="text-lg font-medium mb-4">Membros do Time</h3>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Membro desde</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Nenhum membro no time ainda.
                  </TableCell>
                </TableRow>
              ) : (
                sortedMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        {member.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDistance(member.createdAt, new Date(), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        member.role === "inactive" 
                          ? "bg-gray-100 text-gray-800"
                          : "bg-green-100 text-green-800"
                      }`}>
                        {member.role === "inactive" ? "Inativo" : "Ativo"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenChat(member)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Mensagem
                        </Button>
                        <SellerDeleteConfirm
                          seller={member}
                          onDeleteSuccess={() => {
                            // Refresh the page to update the list
                            window.location.reload();
                          }}
                        />
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
