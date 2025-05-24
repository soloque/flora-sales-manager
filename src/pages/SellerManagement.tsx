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
  Copy,
  Check,
} from "lucide-react";
import { User as UserType, Sale, UserRole } from "@/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase, mapDatabaseSaleToSale } from "@/integrations/supabase/client";

// Colors for the chart
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

const SellerManagement = () => {
  const { user } = useAuth();
  const isOwner = user?.role === "owner";
  
  const [sellers, setSellers] = useState<UserType[]>([]);
  const [filteredSellers, setFilteredSellers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeller, setSelectedSeller] = useState<UserType | null>(null);
  const [searchById, setSearchById] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newSeller, setNewSeller] = useState({
    name: "",
    email: "",
    role: "seller" as UserRole
  });
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sellerCount, setSellerCount] = useState(0);
  
  // Sales data
  const [sales, setSales] = useState<Sale[]>([]);
  
  useEffect(() => {
    // Fetch sellers from Supabase
    const fetchSellers = async () => {
      try {
        const { data: profilesData, error } = await supabase
          .from('profiles')
          .select('*')
          .in('role', ['seller', 'inactive']);
          
        if (error) {
          console.error("Error fetching sellers:", error);
          toast({
            title: "Erro ao carregar vendedores",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
        
        if (profilesData) {
          const formattedSellers: UserType[] = profilesData.map(profile => ({
            id: profile.id,
            name: profile.name || "Sem nome",
            email: profile.email || "Sem email",
            role: profile.role as UserRole,
            createdAt: new Date(profile.created_at),
            avatar_url: profile.avatar_url
          }));
          
          setSellers(formattedSellers);
          setSellerCount(formattedSellers.length);
        }
      } catch (error) {
        console.error("Error in fetchSellers:", error);
      }
    };
    
    // Fetch sales data from Supabase
    const fetchSales = async () => {
      try {
        const { data: salesData, error } = await supabase
          .from('sales')
          .select('*');
          
        if (error) {
          console.error("Error fetching sales:", error);
          return;
        }
        
        if (salesData) {
          // Map database objects to frontend Sales type
          const mappedSales = salesData.map(mapDatabaseSaleToSale);
          setSales(mappedSales);
        }
      } catch (error) {
        console.error("Error in fetchSales:", error);
      }
    };
    
    if (isOwner) {
      fetchSellers();
      fetchSales();
    }
  }, [isOwner]);
  
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
  
  const handleSearchById = async () => {
    if (!searchById.trim()) {
      toast({
        title: "ID não informado",
        description: "Por favor, insira um ID de vendedor para pesquisar",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', searchById)
        .single();
      
      if (error) {
        toast({
          title: "Vendedor não encontrado",
          description: "Nenhum vendedor encontrado com este ID",
          variant: "destructive",
        });
        return;
      }
      
      if (data) {
        const sellerExists = sellers.some(seller => seller.id === data.id);
        
        if (sellerExists) {
          toast({
            title: "Vendedor já adicionado",
            description: "Este vendedor já faz parte do seu time",
          });
          return;
        }
        
        const newSeller: UserType = {
          id: data.id,
          name: data.name || "Sem nome",
          email: data.email || "Sem email",
          role: data.role as UserRole,
          createdAt: new Date(data.created_at),
          avatar_url: data.avatar_url
        };
        
        setSellers(prev => [...prev, newSeller]);
        
        toast({
          title: "Vendedor encontrado",
          description: `${newSeller.name} foi adicionado ao seu time de vendedores`,
        });
        
        setSearchById("");
      }
    } catch (error) {
      console.error("Error searching seller by ID:", error);
    }
  };
  
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
    const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    const commissionEarned = sellerSales.reduce((sum, sale) => sum + sale.commission, 0);
    const commissionRate = totalSales > 0 ? sellerSales.reduce((sum, sale) => sum + sale.commissionRate, 0) / totalSales : 0;
    
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

  // Handle seller role update
  const handleUpdateRole = async () => {
    if (!selectedSeller) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: selectedSeller.role })
        .eq('id', selectedSeller.id);
      
      if (error) {
        toast({
          title: "Erro ao atualizar cargo",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Cargo atualizado",
        description: `O cargo de ${selectedSeller.name} foi atualizado para ${selectedSeller.role}`,
      });
      
      setShowRoleDialog(false);
      
      // Update seller in the local state
      setSellers(sellers.map(seller => 
        seller.id === selectedSeller.id ? { ...seller, role: selectedSeller.role } : seller
      ));
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };
  
  const handleAddSeller = async () => {
    if (!newSeller.name || !newSeller.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e email são obrigatórios",
        variant: "destructive",
      });
      return;
    }
    
    // Check if we've reached the seller limit (10)
    if (sellerCount >= 10) {
      toast({
        title: "Limite de vendedores atingido",
        description: "Você atingiu o limite de 10 vendedores. Considere fazer upgrade do seu plano para adicionar mais vendedores.",
        variant: "default", // Changed from "warning" to "default"
      });
      return;
    }
    
    try {
      // Generate a unique ID for the new seller
      const newId = crypto.randomUUID();
      
      // In a real application, this would create a new user in the auth system
      // and then create a profile. For the mock, we'll just create a profile.
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: newId,
          name: newSeller.name,
          email: newSeller.email,
          role: newSeller.role
        })
        .select()
        .single();
      
      if (error) {
        toast({
          title: "Erro ao adicionar vendedor",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      if (data) {
        const newUser: UserType = {
          id: data.id,
          name: data.name || "",
          email: data.email || "",
          role: data.role as UserRole,
          createdAt: new Date(data.created_at),
        };
        
        setSellers([...sellers, newUser]);
        setSellerCount(prev => prev + 1);
        setNewSeller({ name: "", email: "", role: "seller" });
        setShowAddDialog(false);
        
        toast({
          title: "Vendedor adicionado",
          description: `${newSeller.name} foi adicionado como vendedor com o ID: ${data.id}`,
        });
      }
    } catch (error) {
      console.error("Error in handleAddSeller:", error);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
    
    toast({
      title: "ID copiado",
      description: "ID do vendedor copiado para a área de transferência",
    });
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
  
  const roleLabel = (role: string) => {
    switch (role) {
      case "seller": return "Vendedor";
      case "owner": return "Administrador";
      case "guest": return "Convidado";
      case "inactive": return "Inativo";
      default: return role;
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
            <CardTitle>Lista de Vendedores ({sellerCount}/10)</CardTitle>
            <CardDescription>
              Gerencie os vendedores cadastrados no sistema
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowAddDialog(true)} 
              disabled={sellerCount >= 10}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Vendedor
            </Button>
            <Button variant="outline" asChild>
              <Link to="/commission-settings">
                Configurar Comissões
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Add by ID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar vendedores..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Adicionar vendedor por ID..."
                value={searchById}
                onChange={(e) => setSearchById(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSearchById}>Adicionar</Button>
            </div>
          </div>
          
          {/* Sellers Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Cadastrado em</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Vendas</TableHead>
                  <TableHead>Comissão</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSellers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
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
                          <div className="flex items-center gap-1">
                            <span className="text-xs truncate max-w-[80px]">{seller.id}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(seller.id)}
                            >
                              {copiedId === seller.id ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            seller.role === "owner" 
                              ? "default" 
                              : seller.role === "seller" 
                                ? "secondary" 
                                : "outline"
                          }>
                            {roleLabel(seller.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{stats.totalSales}</Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(stats.commissionEarned)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedSeller(seller);
                                setShowRoleDialog(true);
                              }}
                            >
                              Cargo
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedSeller(seller)}
                            >
                              <BarChart className="h-4 w-4 mr-2" />
                              Detalhes
                            </Button>
                          </div>
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
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold truncate">{selectedSeller.id}</div>
                        <p className="text-sm text-muted-foreground">ID do Vendedor</p>
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

      {/* Add Seller Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Vendedor</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo vendedor para adicioná-lo à sua equipe.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={newSeller.name}
                onChange={(e) => setNewSeller({...newSeller, name: e.target.value})}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newSeller.email}
                onChange={(e) => setNewSeller({...newSeller, email: e.target.value})}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Cargo</Label>
              <Select
                value={newSeller.role}
                onValueChange={(val) => setNewSeller({
                  ...newSeller, 
                  role: val as UserRole
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seller">Vendedor</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancelar</Button>
            <Button onClick={handleAddSeller}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Role Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar Cargo</DialogTitle>
            <DialogDescription>
              Selecione o novo cargo para {selectedSeller?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="role">Cargo</Label>
              <Select
                value={selectedSeller?.role}
                onValueChange={(val) => setSelectedSeller(prev => 
                  prev ? {...prev, role: val as UserRole} : null
                )}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seller">Vendedor</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>Cancelar</Button>
            <Button onClick={handleUpdateRole}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellerManagement;
