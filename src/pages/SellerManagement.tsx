
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { 
  Search, 
  UserPlus, 
  Mail,
  Phone,
  Calendar,
  User,
  BarChart,
  PieChart as PieChartIcon,
} from "lucide-react";
import { User as UserType, Sale } from "@/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

// Mock data for demonstration
import { mockSalesData } from "@/data/mockSales";

const mockSellers: UserType[] = [
  {
    id: "2",
    name: "Gabriel Silva",
    email: "gabriel@example.com",
    role: "seller",
    createdAt: new Date(2023, 1, 15),
  },
  {
    id: "3",
    name: "Marina Oliveira",
    email: "marina@example.com",
    role: "seller",
    createdAt: new Date(2023, 3, 10),
  },
  {
    id: "4",
    name: "Ricardo Almeida",
    email: "ricardo@example.com",
    role: "seller",
    createdAt: new Date(2023, 6, 22),
  },
  {
    id: "5",
    name: "Ana Santos",
    email: "ana@example.com",
    role: "seller",
    createdAt: new Date(2023, 8, 5),
  },
];

// Colors for the chart
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

const SellerManagement = () => {
  const { user } = useAuth();
  const isOwner = user?.role === "owner";
  
  const [sellers, setSellers] = useState<UserType[]>([]);
  const [filteredSellers, setFilteredSellers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeller, setSelectedSeller] = useState<UserType | null>(null);
  
  // Sales data
  const [sales, setSales] = useState<Sale[]>([]);
  
  useEffect(() => {
    // In a real app, these would be API calls
    setSellers(mockSellers);
    setSales(mockSalesData);
  }, []);
  
  useEffect(() => {
    // Apply search filter
    let filtered = [...sellers];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        seller => 
          seller.name.toLowerCase().includes(term) || 
          seller.email.toLowerCase().includes(term)
      );
    }
    
    setFilteredSellers(filtered);
  }, [sellers, searchTerm]);
  
  // Calculate performance metrics
  const calculatePerformanceData = () => {
    return sellers.map(seller => {
      const sellerSales = sales.filter(sale => sale.sellerId === seller.id);
      const totalSales = sellerSales.length;
      const totalRevenue = sellerSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
      const totalCommission = sellerSales.reduce((sum, sale) => sum + sale.commission, 0);
      
      return {
        id: seller.id,
        name: seller.name,
        value: totalRevenue,
        sales: totalSales,
        commissions: totalCommission,
      };
    });
  };
  
  const performanceData = calculatePerformanceData();
  
  // Calculate seller statistics for the selected seller
  const calculateSellerStatistics = (sellerId: string) => {
    const sellerSales = sales.filter(sale => sale.sellerId === sellerId);
    
    if (sellerSales.length === 0) {
      return {
        totalSales: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
        commissionEarned: 0,
        commissionRate: 0,
        statusDistribution: [],
      };
    }
    
    const totalSales = sellerSales.length;
    const totalRevenue = sellerSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const avgOrderValue = totalRevenue / totalSales;
    const commissionEarned = sellerSales.reduce((sum, sale) => sum + sale.commission, 0);
    const commissionRate = sellerSales.reduce((sum, sale) => sum + sale.commissionRate, 0) / totalSales;
    
    // Calculate status distribution
    const statusCounts: Record<string, number> = {};
    sellerSales.forEach(sale => {
      statusCounts[sale.status] = (statusCounts[sale.status] || 0) + 1;
    });
    
    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count
    }));
    
    return {
      totalSales,
      totalRevenue,
      avgOrderValue,
      commissionEarned,
      commissionRate,
      statusDistribution,
    };
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  const statusLabel = (status: string) => {
    switch (status) {
      case "paid": return "Pago";
      case "delivered": return "Entregue";
      case "processing": return "Em processamento";
      case "pending": return "Pendente";
      case "cancelled": return "Cancelado";
      case "problem": return "Problema";
      default: return status;
    }
  };
  
  // Redirect non-owners
  if (!isOwner) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Você não tem permissão para acessar esta página.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Desempenho dos Vendedores</CardTitle>
          <CardDescription>
            Visualize a distribuição de vendas e comissões entre os vendedores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sales Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Vendas por Vendedor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer 
                    config={{
                      sales: { label: "Vendas" }
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={performanceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {performanceData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload?.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                  <div className="font-medium">{data.name}</div>
                                  <div className="text-xs text-muted-foreground">Vendas: {data.sales}</div>
                                  <div className="text-xs">
                                    Faturamento: {formatCurrency(data.value)}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Commission Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Comissões por Vendedor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer 
                    config={{
                      commissions: { label: "Comissões" }
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={performanceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="commissions"
                        >
                          {performanceData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload?.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                  <div className="font-medium">{data.name}</div>
                                  <div className="text-xs text-muted-foreground">Vendas: {data.sales}</div>
                                  <div className="text-xs">
                                    Comissões: {formatCurrency(data.commissions)}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Sellers List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Lista de Vendedores</CardTitle>
            <CardDescription>
              Gerencie os vendedores cadastrados no sistema
            </CardDescription>
          </div>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Vendedor
          </Button>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar vendedores..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Sellers Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Cadastrado em</TableHead>
                  <TableHead>Vendas</TableHead>
                  <TableHead>Comissão</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSellers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Nenhum vendedor encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSellers.map((seller) => {
                    const stats = calculateSellerStatistics(seller.id);
                    return (
                      <TableRow key={seller.id}>
                        <TableCell>
                          <div className="font-medium">{seller.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                            {seller.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            {format(new Date(seller.createdAt), 'dd/MM/yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{stats.totalSales}</Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(stats.commissionEarned)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedSeller(seller)}
                          >
                            <BarChart className="h-4 w-4 mr-2" />
                            Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Seller Details */}
      {selectedSeller && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>{selectedSeller.name}</CardTitle>
            </div>
            <CardDescription>
              Detalhes de desempenho e estatísticas do vendedor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Statistics Cards */}
              {(() => {
                const stats = calculateSellerStatistics(selectedSeller.id);
                
                return (
                  <>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{stats.totalSales}</div>
                        <p className="text-sm text-muted-foreground">Total de Vendas</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                        <p className="text-sm text-muted-foreground">Faturamento Total</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{formatCurrency(stats.commissionEarned)}</div>
                        <p className="text-sm text-muted-foreground">Comissões Pagas</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{formatCurrency(stats.avgOrderValue)}</div>
                        <p className="text-sm text-muted-foreground">Ticket Médio</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{stats.commissionRate.toFixed(1)}%</div>
                        <p className="text-sm text-muted-foreground">Taxa Média de Comissão</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6 flex items-center justify-center">
                        <Button variant="outline" className="w-full">
                          <Mail className="h-4 w-4 mr-2" />
                          Enviar Email
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                );
              })()}
            </div>
            
            {/* Status Distribution Chart */}
            {(() => {
              const stats = calculateSellerStatistics(selectedSeller.id);
              
              if (stats.statusDistribution.length === 0) {
                return (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum dado disponível para exibir.
                  </div>
                );
              }
              
              return (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5" />
                      <CardTitle className="text-base">Distribuição de Status</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ChartContainer 
                        config={{
                          status: { label: "Status" }
                        }}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={stats.statusDistribution}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${statusLabel(name)}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {stats.statusDistribution.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={COLORS[index % COLORS.length]} 
                                />
                              ))}
                            </Pie>
                            <Tooltip 
                              content={({ active, payload }) => {
                                if (active && payload?.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                      <div className="font-medium">{statusLabel(data.name)}</div>
                                      <div className="text-xs text-muted-foreground">
                                        Quantidade: {data.value}
                                      </div>
                                      <div className="text-xs">
                                        Porcentagem: {((data.value / stats.totalSales) * 100).toFixed(1)}%
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Legend formatter={(value) => statusLabel(value)} />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" onClick={() => setSelectedSeller(null)}>
              Fechar Detalhes
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default SellerManagement;
