
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Sale, OrderStatus } from "@/types";
import { Plus, Search, FileText, Edit, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createNotification } from "@/services/notificationService";

const SalesList = () => {
  const { user } = useAuth();
  const isOwner = user?.role === "owner";
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      fetchSales();
    }
  }, [user]);
  
  const fetchSales = async () => {
    setIsLoading(true);
    try {
      let query = supabase.from('sales').select(`
        *,
        customer_info(*)
      `);
      
      // Row Level Security policies will handle filtering by seller/owner
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }

      if (data) {
        // Convert Supabase data to our Sale type
        const formattedSales: Sale[] = data.map((item: any) => ({
          id: item.id,
          date: new Date(item.date),
          description: item.description || "",
          quantity: item.quantity || 0,
          unitPrice: item.unit_price || 0,
          totalPrice: item.total_price || 0,
          sellerId: item.seller_id || "",
          sellerName: item.seller_name || "",
          commission: item.commission || 0,
          commissionRate: item.commission_rate || 0,
          status: item.status as OrderStatus || "pending",
          observations: item.observations || "",
          customerInfo: {
            name: item.customer_info?.name || "",
            phone: item.customer_info?.phone || "",
            address: item.customer_info?.address || "",
            city: item.customer_info?.city || "",
            state: item.customer_info?.state || "",
            zipCode: item.customer_info?.zip_code || "",
            order: item.customer_info?.order_details || "",
            observations: item.customer_info?.observations || "",
          },
          costPrice: item.cost_price,
          profit: item.profit,
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at),
        }));
        
        setSales(formattedSales);
      }
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as vendas."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    let result = sales;
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(
        sale =>
          sale.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.customerInfo.order.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (selectedStatus !== "all") {
      result = result.filter(sale => sale.status === selectedStatus);
    }
    
    setFilteredSales(result);
  }, [sales, searchTerm, selectedStatus]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pendente</Badge>;
      case "processing":
        return <Badge className="bg-blue-500">Em processamento</Badge>;
      case "paid":
        return <Badge className="bg-green-500">Pago</Badge>;
      case "delivered":
        return <Badge className="bg-green-500">Entregue</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelado</Badge>;
      case "problem":
        return <Badge className="bg-orange-500">Problema</Badge>;
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  const updateSaleStatus = async (saleId: string, newStatus: OrderStatus, currentSellerId: string) => {
    try {
      const { error } = await supabase
        .from('sales')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', saleId);
        
      if (error) {
        throw error;
      }
      
      // Atualiza localmente
      const updatedSales = sales.map(sale => {
        if (sale.id === saleId) {
          return { ...sale, status: newStatus, updatedAt: new Date() };
        }
        return sale;
      });
      
      setSales(updatedSales);
      
      toast({
        title: "Status atualizado",
        description: "O status da venda foi atualizado com sucesso."
      });

      // Create notification for seller if owner changed status
      if (isOwner) {
        await createNotification(
          currentSellerId,
          "Status de venda atualizado",
          `O status da sua venda foi alterado para: ${getStatusText(newStatus)}`,
          "status_change",
          saleId
        );
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o status da venda."
      });
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case "pending": return "Pendente";
      case "processing": return "Em processamento";
      case "paid": return "Pago";
      case "delivered": return "Entregue";
      case "cancelled": return "Cancelado";
      case "problem": return "Problema";
      default: return status;
    }
  };

  const isEditableStatus = (status: OrderStatus) => {
    return status === "pending";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar vendas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex-1">
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as OrderStatus | "all")}
            >
              <option value="all">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="processing">Em processamento</option>
              <option value="paid">Pago</option>
              <option value="delivered">Entregue</option>
              <option value="cancelled">Cancelado</option>
              <option value="problem">Problema</option>
            </select>
          </div>
          
          {!isOwner && (
            <Button asChild>
              <Link to="/sales/new">
                <Plus className="h-4 w-4 mr-2" />
                Nova Venda
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2">Carregando vendas...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredSales.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Nenhuma venda encontrada</h3>
            <p className="text-muted-foreground text-center mb-6">
              {searchTerm || selectedStatus !== "all"
                ? "Tente ajustar seus filtros de busca"
                : "Registre sua primeira venda para começar"}
            </p>
            {!isOwner && user?.role !== "inactive" && (
              <Button asChild>
                <Link to="/sales/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Venda
                </Link>
              </Button>
            )}
            {user?.role === "inactive" && (
              <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-md flex items-center gap-2">
                <AlertCircle className="text-yellow-600 dark:text-yellow-400" />
                <p className="text-sm">Sua conta está inativa. Entre em contato com o administrador.</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Pedido</TableHead>
                {isOwner && <TableHead>Vendedor</TableHead>}
                <TableHead>Valor</TableHead>
                {!isOwner && <TableHead>Comissão</TableHead>}
                {isOwner && <TableHead>Custo</TableHead>}
                {isOwner && <TableHead>Lucro</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{new Date(sale.date).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{sale.customerInfo.name}</p>
                      <p className="text-sm text-muted-foreground">{sale.customerInfo.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs overflow-hidden text-ellipsis">
                      {sale.customerInfo.order}
                    </div>
                  </TableCell>
                  {isOwner && <TableCell>{sale.sellerName}</TableCell>}
                  <TableCell>{formatCurrency(sale.totalPrice)}</TableCell>
                  {!isOwner && <TableCell>{formatCurrency(sale.commission)}</TableCell>}
                  {isOwner && <TableCell>{formatCurrency(sale.costPrice || 0)}</TableCell>}
                  {isOwner && <TableCell>{formatCurrency(sale.profit || 0)}</TableCell>}
                  <TableCell>{getStatusBadge(sale.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {/* View/Edit button */}
                      {isEditableStatus(sale.status) ? (
                        <Button variant="outline" size="icon" asChild>
                          <Link to={`/sales/${sale.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : (
                        <Button variant="outline" size="icon" disabled title="Não é possível editar vendas que não estão com status pendente">
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {/* Status dropdown for owner */}
                      {isOwner && (
                        <select
                          className="w-32 rounded-md border border-input bg-background px-3 py-1 text-sm"
                          value={sale.status}
                          onChange={(e) => updateSaleStatus(sale.id, e.target.value as OrderStatus, sale.sellerId)}
                        >
                          <option value="pending">Pendente</option>
                          <option value="processing">Processando</option>
                          <option value="paid">Pago</option>
                          <option value="delivered">Entregue</option>
                          <option value="problem">Problema</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      )}
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

export default SalesList;
