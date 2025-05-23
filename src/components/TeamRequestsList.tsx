
import React from "react";
import { format } from "date-fns";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

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

interface TeamRequestsListProps {
  requests: TeamRequest[];
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

const TeamRequestsList = ({ requests, onApprove, onReject }: TeamRequestsListProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Solicitações de Integração</h3>
      {requests.length === 0 ? (
        <div className="text-center py-8 border rounded-md">
          <div className="mx-auto h-12 w-12 text-muted-foreground flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          </div>
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
              {requests.map((request) => (
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
                        onClick={() => onApprove(request.id)}
                        className="bg-green-50 hover:bg-green-100 text-green-600"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Aprovar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onReject(request.id)}
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
  );
};

export default TeamRequestsList;
