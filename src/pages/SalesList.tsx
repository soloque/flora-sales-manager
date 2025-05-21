
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
import { Plus, Search, FileText, Edit } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

// Mock sales data
import { mockSalesData } from "@/data/mockSales";

const SalesList = () => {
  const { user } = useAuth();
  const isOwner = user?.role === "owner";
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">("all");
  
  useEffect(() => {
    // In a real app, this would fetch data from an API
    // For now, we'll use mock data
    if (isOwner) {
      setSales(mockSalesData);
    } else {
      // Filter sales for this specific seller
      setSales(mockSalesData.filter(sale => sale.sellerId === user?.id));
    }
  }, [isOwner, user?.id]);
  
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

  const updateSaleStatus = (saleId: string, newStatus: OrderStatus) => {
    // In a real app, this would call an API to update the status
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
      
      {filteredSales.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Nenhuma venda encontrada</h3>
            <p className="text-muted-foreground text-center mb-6">
              {searchTerm || selectedStatus !== "all"
                ? "Tente ajustar seus filtros de busca"
                : "Registre sua primeira venda para começar"}
            </p>
            {!isOwner && (
              <Button asChild>
                <Link to="/sales/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Venda
                </Link>
              </Button>
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
                      <Button variant="outline" size="icon" asChild>
                        <Link to={`/sales/${sale.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      
                      {/* Status dropdown for owner */}
                      {isOwner && (
                        <select
                          className="w-32 rounded-md border border-input bg-background px-3 py-1 text-sm"
                          value={sale.status}
                          onChange={(e) => updateSaleStatus(sale.id, e.target.value as OrderStatus)}
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
