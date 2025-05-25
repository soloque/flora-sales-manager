import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Sale } from "@/types";
import { Download, ArrowUp, ArrowDown } from "lucide-react";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/DateRangePicker";
import { exportToCSV } from "@/utils/exportUtils";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const CommissionDetails = () => {
  const { user } = useAuth();
  const isOwner = user?.role === "owner";
  
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
    to: new Date()
  });
  
  const [sortField, setSortField] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    // Fetch sales data from Supabase
    const fetchSales = async () => {
      try {
        let query = supabase
          .from('sales')
          .select('*')
          .in('status', ['paid', 'delivered']);
        
        // Filter by seller if not owner
        if (!isOwner && user) {
          query = query.eq('seller_id', user.id);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching sales:", error);
          toast({
            title: "Erro ao carregar vendas",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
        
        if (data) {
          // Map database objects to frontend Sales type
          const mappedSales = data.map(sale => ({
            id: sale.id,
            date: new Date(sale.date),
            description: sale.description || "",
            quantity: sale.quantity || 0,
            unitPrice: sale.unit_price || 0,
            totalPrice: sale.total_price || 0,
            sellerId: sale.seller_id || "",
            sellerName: sale.seller_name || "",
            commission: sale.commission || 0,
            commissionRate: sale.commission_rate || 0,
            status: sale.status as any || "pending",
            observations: sale.observations || "",
            customerInfo: {
              name: sale.customer_name || "",
              phone: sale.customer_phone || "",
              address: sale.customer_address || "",
              city: sale.customer_city || "",
              state: sale.customer_state || "",
              zipCode: sale.customer_zipcode || "",
              order: sale.customer_order || ""
            },
            costPrice: sale.cost_price,
            profit: sale.profit,
            createdAt: new Date(sale.created_at),
            updatedAt: new Date(sale.updated_at)
          }));
          setSales(mappedSales);
        }
      } catch (error) {
        console.error("Error in fetchSales:", error);
      }
    };
    
    fetchSales();
  }, [isOwner, user]);

  useEffect(() => {
    // Apply date range filter
    let result = [...sales];

    // Filter by date range
    if (dateRange?.from && dateRange?.to) {
      result = result.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= dateRange.from! && saleDate <= dateRange.to!;
      });
    }
    
    // Sort results
    result = result.sort((a, b) => {
      switch (sortField) {
        case "date":
          return sortDirection === "asc" 
            ? new Date(a.date).getTime() - new Date(b.date).getTime()
            : new Date(b.date).getTime() - new Date(a.date).getTime();
        case "totalPrice":
          return sortDirection === "asc" 
            ? a.totalPrice - b.totalPrice
            : b.totalPrice - a.totalPrice;
        case "commission":
          return sortDirection === "asc" 
            ? a.commission - b.commission
            : b.commission - a.commission;
        case "commissionRate":
          return sortDirection === "asc" 
            ? a.commissionRate - b.commissionRate
            : b.commissionRate - a.commissionRate;
        default:
          return 0;
      }
    });

    setFilteredSales(result);
  }, [sales, dateRange, sortField, sortDirection]);

  const handleExport = () => {
    // Prepare data for export
    const exportData = filteredSales.map(sale => ({
      "Data": new Date(sale.date).toLocaleDateString("pt-BR"),
      "Cliente": sale.customerInfo.name,
      "Descrição": sale.description,
      "Valor Total": sale.totalPrice.toFixed(2),
      "Taxa (%)": sale.commissionRate.toFixed(2),
      "Comissão (R$)": sale.commission.toFixed(2),
      "Status": sale.status === "paid" ? "Pago" : "Entregue"
    }));

    // Export data
    exportToCSV(exportData, `comissoes_${new Date().toISOString().split("T")[0]}`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Calculate total commissions
  const totalCommission = filteredSales.reduce((sum, sale) => sum + sale.commission, 0);
  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
  
  // Calculate average commission rate
  const avgCommissionRate = filteredSales.length > 0
    ? filteredSales.reduce((sum, sale) => sum + sale.commissionRate, 0) / filteredSales.length
    : 0;

  const renderSortIcon = (field: string) => {
    if (field !== sortField) return null;
    
    return sortDirection === "asc" 
      ? <ArrowUp className="inline h-4 w-4 ml-1" /> 
      : <ArrowDown className="inline h-4 w-4 ml-1" />;
  };

  return (
    <div className="space-y-6">
      {isOwner ? (
        // Owner view
        <Card>
          <CardHeader>
            <CardTitle>Gerenciamento de Comissões</CardTitle>
            <CardDescription>
              Como administrador, você pode configurar as taxas de comissão para cada vendedor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p>Use esta página para visualizar e ajustar as taxas de comissão dos vendedores.</p>
            <div className="flex justify-end">
              <Button asChild>
                <Link to="/commission-settings">Configurar Comissões</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Seller view
        <>
          <Card>
            <CardHeader>
              <CardTitle>Detalhes de Comissões</CardTitle>
              <CardDescription>
                Visualize suas comissões em vendas pagas e entregues
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">Período</label>
                  <DateRangePicker
                    value={dateRange}
                    onChange={setDateRange}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleExport} variant="outline" className="flex gap-2">
                    <Download className="h-4 w-4" />
                    <span>Exportar Relatório</span>
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="py-4">
                    <p className="text-sm text-muted-foreground">Total em Comissões</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalCommission)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="py-4">
                    <p className="text-sm text-muted-foreground">Total em Vendas</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalSales)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="py-4">
                    <p className="text-sm text-muted-foreground">Taxa Média</p>
                    <p className="text-2xl font-bold">{avgCommissionRate.toFixed(2)}%</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead onClick={() => handleSort("date")} className="cursor-pointer">
                        Data {renderSortIcon("date")}
                      </TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead onClick={() => handleSort("totalPrice")} className="cursor-pointer">
                        Valor Total {renderSortIcon("totalPrice")}
                      </TableHead>
                      <TableHead onClick={() => handleSort("commissionRate")} className="cursor-pointer">
                        Taxa (%) {renderSortIcon("commissionRate")}
                      </TableHead>
                      <TableHead onClick={() => handleSort("commission")} className="cursor-pointer">
                        Comissão (R$) {renderSortIcon("commission")}
                      </TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Nenhuma comissão encontrada para o período selecionado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell>
                            {new Date(sale.date).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell>{sale.customerInfo?.name || "Cliente"}</TableCell>
                          <TableCell>{sale.description}</TableCell>
                          <TableCell>{formatCurrency(sale.totalPrice)}</TableCell>
                          <TableCell>{sale.commissionRate}%</TableCell>
                          <TableCell className="font-medium">{formatCurrency(sale.commission)}</TableCell>
                          <TableCell>
                            {sale.status === "paid" ? "Pago" : "Entregue"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default CommissionDetails;
