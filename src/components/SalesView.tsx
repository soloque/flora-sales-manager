import { useState } from "react";
import { Sale, User, OrderStatus } from "@/types";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createNotification } from "@/services/notificationService";

interface SalesViewProps {
  sales: Sale[];
  isOwner: boolean;
  onUpdateSale: () => void;
}

export function SalesView({ sales, isOwner, onUpdateSale }: SalesViewProps) {
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [editedSale, setEditedSale] = useState<{
    status: OrderStatus;
    observations: string;
    commission: number;
    commissionRate: number;
  }>({
    status: "pending",
    observations: "",
    commission: 0,
    commissionRate: 20 // Changed default to 20%
  });
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "Pendente";
      case "processing": return "Em Processamento";
      case "paid": return "Pago";
      case "delivered": return "Entregue";
      case "cancelled": return "Cancelado";
      case "problem": return "Problema";
      default: return status;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pendente</Badge>;
      case "processing":
        return <Badge variant="secondary">Em Processamento</Badge>;
      case "paid":
        return <Badge variant="default">Pago</Badge>;
      case "delivered":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Entregue</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelado</Badge>;
      case "problem":
        return <Badge variant="destructive">Problema</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setShowDetailsModal(true);
  };
  
  const handleEditSale = (sale: Sale) => {
    setSelectedSale(sale);
    setEditedSale({
      status: sale.status,
      observations: sale.observations,
      commission: sale.commission,
      commissionRate: sale.commissionRate
    });
    setShowEditModal(true);
  };
  
  const handleDeleteSale = (sale: Sale) => {
    setSelectedSale(sale);
    setShowDeleteModal(true);
  };
  
  const isEditable = (status: OrderStatus) => {
    return status === "pending" || status === "processing";
  };
  
  const updateSaleStatus = async () => {
    if (!selectedSale) return;
    
    setIsProcessing(true);
    try {
      // Calculate commission if rate changed
      let commission = editedSale.commission;
      if (editedSale.commissionRate !== selectedSale.commissionRate) {
        commission = (selectedSale.totalPrice * editedSale.commissionRate) / 100;
      }
      
      const { error } = await supabase
        .from('sales')
        .update({
          status: editedSale.status,
          observations: editedSale.observations,
          commission: commission,
          commission_rate: editedSale.commissionRate
        })
        .eq('id', selectedSale.id);
        
      if (error) throw error;
      
      toast({
        title: "Pedido atualizado",
        description: "Os detalhes do pedido foram atualizados com sucesso."
      });
      
      // Send notification to seller if there's a status change
      if (editedSale.status !== selectedSale.status) {
        await createNotification(
          selectedSale.sellerId,
          "Status de pedido alterado",
          `O pedido #${selectedSale.id.slice(0, 8)} foi alterado para "${getStatusLabel(editedSale.status)}".`,
          "status_change",
          selectedSale.id
        );
      }
      
      setShowEditModal(false);
      onUpdateSale();
    } catch (error) {
      console.error("Error updating sale:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o pedido. Tente novamente."
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const deleteSale = async () => {
    if (!selectedSale) return;
    
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', selectedSale.id);
        
      if (error) throw error;
      
      toast({
        title: "Pedido removido",
        description: "O pedido foi removido com sucesso."
      });
      
      setShowDeleteModal(false);
      onUpdateSale();
    } catch (error) {
      console.error("Error deleting sale:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível remover o pedido. Tente novamente."
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const updateCommission = () => {
    if (!selectedSale) return;
    const commission = (selectedSale.totalPrice * editedSale.commissionRate) / 100;
    setEditedSale({
      ...editedSale,
      commission: parseFloat(commission.toFixed(2))
    });
  };
  
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Nenhuma venda encontrada.
                </TableCell>
              </TableRow>
            ) : (
              sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    {format(new Date(sale.date), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>{sale.description}</TableCell>
                  <TableCell>{sale.sellerName}</TableCell>
                  <TableCell>{formatCurrency(sale.totalPrice)}</TableCell>
                  <TableCell>{getStatusBadge(sale.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(sale)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {isEditable(sale.status) && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditSale(sale)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSale(sale)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Sale Details Dialog */}
      {selectedSale && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Detalhes do Pedido</DialogTitle>
              <DialogDescription>
                Informações detalhadas sobre o pedido.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Data</Label>
                  <div className="p-2 border rounded-md">
                    {format(new Date(selectedSale.date), 'dd/MM/yyyy')}
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="p-2 border rounded-md">
                    {getStatusBadge(selectedSale.status)}
                  </div>
                </div>
              </div>
              <div>
                <Label>Descrição</Label>
                <div className="p-2 border rounded-md">
                  {selectedSale.description}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Quantidade</Label>
                  <div className="p-2 border rounded-md">
                    {selectedSale.quantity}
                  </div>
                </div>
                <div>
                  <Label>Valor Unitário</Label>
                  <div className="p-2 border rounded-md">
                    {formatCurrency(selectedSale.unitPrice)}
                  </div>
                </div>
                <div>
                  <Label>Valor Total</Label>
                  <div className="p-2 border rounded-md font-bold">
                    {formatCurrency(selectedSale.totalPrice)}
                  </div>
                </div>
              </div>
              <div>
                <Label>Vendedor</Label>
                <div className="p-2 border rounded-md">
                  {selectedSale.sellerName}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Comissão</Label>
                  <div className="p-2 border rounded-md">
                    {formatCurrency(selectedSale.commission)} ({selectedSale.commissionRate}%)
                  </div>
                </div>
                {isOwner && selectedSale.costPrice && selectedSale.profit && (
                  <div>
                    <Label>Lucro</Label>
                    <div className="p-2 border rounded-md">
                      {formatCurrency(selectedSale.profit)}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <Label>Observações</Label>
                <div className="p-2 border rounded-md min-h-[60px] whitespace-pre-wrap">
                  {selectedSale.observations || "Nenhuma observação"}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                Fechar
              </Button>
              {isEditable(selectedSale.status) && (
                <Button onClick={() => {
                  setShowDetailsModal(false);
                  handleEditSale(selectedSale);
                }}>
                  Editar
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Edit Sale Dialog */}
      {selectedSale && (
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Editar Pedido</DialogTitle>
              <DialogDescription>
                Atualize os detalhes do pedido.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={editedSale.status}
                    onValueChange={(value: OrderStatus) => 
                      setEditedSale({...editedSale, status: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="processing">Em Processamento</SelectItem>
                      <SelectItem value="paid">Pago</SelectItem>
                      <SelectItem value="delivered">Entregue</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                      <SelectItem value="problem">Problema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="commissionRate">Taxa de Comissão (%)</Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    value={editedSale.commissionRate}
                    onChange={(e) => {
                      const rate = parseFloat(e.target.value) || 0;
                      setEditedSale({...editedSale, commissionRate: rate});
                    }}
                    onBlur={updateCommission}
                  />
                </div>
                <div>
                  <Label htmlFor="commission">Valor da Comissão</Label>
                  <Input
                    id="commission"
                    type="number"
                    value={editedSale.commission}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      const rate = selectedSale.totalPrice > 0 
                        ? (value / selectedSale.totalPrice) * 100
                        : 0;
                      
                      setEditedSale({
                        ...editedSale, 
                        commission: value,
                        commissionRate: parseFloat(rate.toFixed(2))
                      });
                    }}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="observations">Observações</Label>
                <textarea
                  id="observations"
                  className="w-full min-h-[100px] p-2 border rounded-md"
                  value={editedSale.observations}
                  onChange={(e) => 
                    setEditedSale({...editedSale, observations: e.target.value})
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancelar
              </Button>
              <Button onClick={updateSaleStatus} disabled={isProcessing}>
                {isProcessing ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Confirmation Dialog */}
      {selectedSale && (
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="mb-2"><strong>Descrição:</strong> {selectedSale.description}</p>
              <p className="mb-2"><strong>Valor:</strong> {formatCurrency(selectedSale.totalPrice)}</p>
              <p><strong>Data:</strong> {format(new Date(selectedSale.date), 'dd/MM/yyyy')}</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={deleteSale}
                disabled={isProcessing}
              >
                {isProcessing ? "Excluindo..." : "Excluir Pedido"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
