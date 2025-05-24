
import { TeamRequest } from "@/types";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

interface TeamRequestsListProps {
  requests: TeamRequest[];
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

const TeamRequestsList = ({ 
  requests, 
  onApprove, 
  onReject 
}: TeamRequestsListProps) => {
  if (requests.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-medium mb-4">Solicitações de Integração</h3>
        <div className="py-8 text-center text-muted-foreground border rounded-md">
          Nenhuma solicitação pendente.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">
        Solicitações de Integração ({requests.length})
      </h3>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendedor</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Mensagem</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map(request => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">
                  {request.seller_name}
                </TableCell>
                <TableCell>{request.seller_email}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {request.message || "Sem mensagem"}
                </TableCell>
                <TableCell>
                  {format(new Date(request.created_at), 'dd/MM/yyyy HH:mm')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button 
                      size="sm"
                      onClick={() => onApprove(request.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aprovar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => onReject(request.id)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeitar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TeamRequestsList;
