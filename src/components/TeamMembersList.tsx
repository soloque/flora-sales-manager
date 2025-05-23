
import React from "react";
import { format } from "date-fns";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

interface TeamMembersListProps {
  teamMembers: User[];
  onSendMessage: (member: User) => void;
}

const TeamMembersList = ({ teamMembers, onSendMessage }: TeamMembersListProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Membros do Time</h3>
      {teamMembers.length === 0 ? (
        <div className="text-center py-8 border rounded-md">
          <div className="mx-auto h-12 w-12 text-muted-foreground flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
          </div>
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
                        onClick={() => onSendMessage(member)}
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
  );
};

export default TeamMembersList;
