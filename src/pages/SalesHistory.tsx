
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sale, User, SalesHistoryFilters, OrderStatus } from "@/types";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/DateRangePicker";
import { exportToCSV } from "@/utils/exportUtils";
import { FilterBar } from "@/components/FilterBar";

// Mock data
import { mockSalesData } from "@/data/mockSales";

const SalesHistory = () => {
  const { user } = useAuth();
  const isOwner = user?.role === "owner";
  
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
    to: new Date()
  });
  
  const [filters, setFilters] = useState<SalesHistoryFilters>({
    period: "90days",
    status: "all"
  });
  
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // In a real app, this would be an API call
    // For now, we'll use the mock data
    const allSales = mockSalesData;
    
    // Filter by seller if not owner
    if (!isOwner && user) {
      setSales(allSales.filter(sale => sale.sellerId === user.id));
    } else {
      setSales(allSales);
    }
  }, [isOwner, user]);

  useEffect(() => {
    // Apply filters to sales
    let result = [...sales];

    // Filter by date range
    if (dateRange?.from && dateRange?.to) {
      result = result.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= dateRange.from! && saleDate <= dateRange.to!;
      });
    }

    // Filter by status
    if (filters.status && filters.status !== "all") {
      result = result.filter(sale => sale.status === filters.status);
    }

    // Filter by seller ID
    if (isOwner && filters.sellerId && filters.sellerId !== "all") {
      result = result.filter(sale => sale.sellerId === filters.sellerId);
    }

    // Filter by search term
    if (searchTerm) {
      result = result.filter(
        sale =>
          sale.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.customerInfo.order.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSales(result);
  }, [sales, filters, dateRange, searchTerm, isOwner]);

  const handleExport = () => {
    // Prepare data for export
    const exportData = filteredSales.map(sale => ({
      "Data": format(new Date(sale.date), "dd/MM/yyyy"),
      "Cliente": sale.customerInfo.name,
      "Descrição": sale.description,
      "Pedido": sale.customerInfo.order,
      "Valor Total": sale.totalPrice.toFixed(2),
      "Comissão": sale.commission.toFixed(2),
      "Status": getStatusText(sale.status),
      "Vendedor": sale.sellerName
    }));

    // Export data
    exportToCSV(exportData, `vendas_${format(new Date(), "yyyy-MM-dd")}`);
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
    const totals = filteredSales.reduce((acc, sale) => {
      acc.revenue += sale.totalPrice;
      acc.commission += sale.commission;
      if (isOwner && sale.costPrice) {
        acc.costs += sale.costPrice;
        acc.profit += (sale.profit || 0);
      }
      return acc;
    }, { revenue: 0, commission: 0, costs: 0, profit: 0 });
    
    return totals;
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Vendas</CardTitle>
          <CardDescription>
            Visualize e filtre o histórico de vendas dos últimos 3 meses
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
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Input
                  placeholder="Buscar por cliente, pedido..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value as OrderStatus | "all"})}
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
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm">
              <span className="font-medium">{filteredSales.length}</span> vendas encontradas
            </div>
            <Button onClick={handleExport} variant="outline" className="flex gap-2">
              <Calendar className="h-4 w-4" />
              <span>Exportar CSV</span>
            </Button>
          </div>
          
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
                {filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isOwner ? 9 : 6} className="text-center py-8">
                      Nenhuma venda encontrada para o período selecionado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale) => (
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
