
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Sale, OrderStatus } from "@/types";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

const SalesHistory = () => {
  const { user } = useAuth();
  const isOwner = user?.role === "owner";
  
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSales();
    }
  }, [user]);

  const fetchSales = async () => {
    setIsLoading(true);
    try {
      // Get current date and date 3 months ago
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);
      
      // Format dates for Supabase query
      const startDateFormatted = startDate.toISOString();
      
      let query = supabase.from('sales')
        .select(`
          *,
          customer_info(*)
        `)
        .gte('date', startDateFormatted)
        .order('date', { ascending: false });
      
      // RLS policies will handle filtering by user role
      
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
      console.error("Error fetching sales history:", error);
    } finally {
      setIsLoading(false);
    }
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
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateTotals = () => {
    return sales.reduce((acc, sale) => {
      acc.revenue += sale.totalPrice;
      acc.commission += sale.commission;
      if (isOwner && sale.costPrice) {
        acc.costs += sale.costPrice;
        acc.profit += (sale.profit || 0);
      }
      return acc;
    }, { revenue: 0, commission: 0, costs: 0, profit: 0 });
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Vendas</CardTitle>
          <CardDescription>
            Histórico de vendas dos últimos 3 meses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="text-sm">
              <span className="font-medium">{sales.length}</span> vendas encontradas
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center p-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2">Carregando histórico...</p>
              </div>
            </div>
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
                    <TableHead>Comissão</TableHead>
                    {isOwner && <TableHead>Custo</TableHead>}
                    {isOwner && <TableHead>Lucro</TableHead>}
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isOwner ? 9 : 6} className="text-center py-8">
                        Nenhuma venda encontrada nos últimos 3 meses
                      </TableCell>
                    </TableRow>
                  ) : (
                    sales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>
                          {format(new Date(sale.date), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{sale.customerInfo.name}</p>
                            <p className="text-xs text-muted-foreground">{sale.customerInfo.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate" title={sale.customerInfo.order}>
                            {sale.customerInfo.order}
                          </div>
                        </TableCell>
                        {isOwner && <TableCell>{sale.sellerName}</TableCell>}
                        <TableCell>{formatCurrency(sale.totalPrice)}</TableCell>
                        <TableCell>{formatCurrency(sale.commission)}</TableCell>
                        {isOwner && <TableCell>{formatCurrency(sale.costPrice || 0)}</TableCell>}
                        {isOwner && <TableCell>{formatCurrency(sale.profit || 0)}</TableCell>}
                        <TableCell>{getStatusBadge(sale.status)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Summary row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="py-4">
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">{formatCurrency(totals.revenue)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <p className="text-sm text-muted-foreground">Comissões</p>
                <p className="text-2xl font-bold">{formatCurrency(totals.commission)}</p>
              </CardContent>
            </Card>
            {isOwner && (
              <Card>
                <CardContent className="py-4">
                  <p className="text-sm text-muted-foreground">Custos</p>
                  <p className="text-2xl font-bold">{formatCurrency(totals.costs)}</p>
                </CardContent>
              </Card>
            )}
            {isOwner && (
              <Card>
                <CardContent className="py-4">
                  <p className="text-sm text-muted-foreground">Lucro Líquido</p>
                  <p className="text-2xl font-bold">{formatCurrency(totals.profit)}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesHistory;
