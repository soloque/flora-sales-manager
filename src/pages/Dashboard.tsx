
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BarChart, FileText, Plus, DollarSign, Users, Calendar, TrendingUp, Bell, Clock, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Sale } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { mapDatabaseSaleToSale } from "@/utils/dataMappers";

const Dashboard = () => {
  const { user } = useAuth();
  const isOwner = user?.role === "owner";
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [salesStats, setSalesStats] = useState({
    pending: 0,
    delivered: 0,
    cancelled: 0,
    totalCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch recent sales
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select('*, customer_info(*)')
          .order('created_at', { ascending: false })
          .limit(5);

        if (salesError) {
          console.error("Error fetching sales:", salesError);
        } else if (salesData) {
          const formattedSales = salesData.map(sale => mapDatabaseSaleToSale(sale));
          setRecentSales(formattedSales);
          
          // Fetch sales stats
          const { data: statsData, error: statsError } = await supabase
            .from('sales')
            .select('status', { count: 'exact' });
            
          if (!statsError && statsData) {
            const pending = statsData.filter(sale => sale.status === 'pending').length;
            const delivered = statsData.filter(sale => sale.status === 'delivered').length;
            const cancelled = statsData.filter(sale => sale.status === 'cancelled').length;
            
            setSalesStats({
              pending,
              delivered,
              cancelled,
              totalCount: statsData.length
            });
          }
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calculate totals
  const totalSales = recentSales.length;
  const totalRevenue = recentSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
  const totalCommissions = recentSales.reduce((sum, sale) => sum + sale.commission, 0);
  
  // Only for owner
  const totalCosts = isOwner ? recentSales.reduce((sum, sale) => sum + (sale.costPrice || 0), 0) : 0;
  const totalProfit = isOwner ? recentSales.reduce((sum, sale) => sum + (sale.profit || 0), 0) : 0;

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta, {user?.name || ""}
          </p>
        </div>
        
        {!isOwner && (
          <Button asChild>
            <Link to="/sales/new">
              <Plus className="mr-2 h-4 w-4" /> Nova Venda
            </Link>
          </Button>
        )}
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Vendas Totais</p>
              <h3 className="text-2xl font-bold mt-1">{salesStats.totalCount}</h3>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <FileText className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
              <h3 className="text-2xl font-bold mt-1">{salesStats.pending}</h3>
            </div>
            <div className="bg-yellow-500/10 p-3 rounded-full">
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Entregues</p>
              <h3 className="text-2xl font-bold mt-1">{salesStats.delivered}</h3>
            </div>
            <div className="bg-green-500/10 p-3 rounded-full">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Canceladas</p>
              <h3 className="text-2xl font-bold mt-1">{salesStats.cancelled}</h3>
            </div>
            <div className="bg-red-500/10 p-3 rounded-full">
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
              <h3 className="text-2xl font-bold mt-1">{formatCurrency(totalRevenue)}</h3>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        {isOwner ? (
          <Card>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Comissões Pagas</p>
                <h3 className="text-2xl font-bold mt-1">{formatCurrency(totalCommissions)}</h3>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Comissões</p>
                <h3 className="text-2xl font-bold mt-1">{formatCurrency(totalCommissions)}</h3>
              </div>
              <div className="bg-green-500/10 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
        )}

        {isOwner ? (
          <Card>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lucro Líquido</p>
                <h3 className="text-2xl font-bold mt-1">{formatCurrency(totalProfit)}</h3>
              </div>
              <div className="bg-green-500/10 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Comissão</p>
                <h3 className="text-2xl font-bold mt-1">20%</h3>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <BarChart className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {!isOwner && (
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[150px]">
              <Plus className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Registrar Nova Venda</h3>
              <Button asChild>
                <Link to="/sales/new">Criar Venda</Link>
              </Button>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center min-h-[150px]">
            <FileText className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Gerenciar Vendas</h3>
            <Button asChild variant="outline">
              <Link to="/sales">Ver Todas</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center min-h-[150px]">
            <Calendar className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Histórico de Vendas</h3>
            <Button asChild variant="outline">
              <Link to="/sales/history">Ver Histórico</Link>
            </Button>
          </CardContent>
        </Card>
        
        {isOwner && (
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[150px]">
              <Users className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Gerenciar Vendedores</h3>
              <Button asChild variant="outline">
                <Link to="/sellers">Ver Todos</Link>
              </Button>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center min-h-[150px]">
            <BarChart className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Comissões</h3>
            <Button asChild variant="outline">
              <Link to="/commissions">{isOwner ? "Configurar" : "Ver Detalhes"}</Link>
            </Button>
          </CardContent>
        </Card>
        
        {isOwner && (
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[150px]">
              <Users className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Time de Vendas</h3>
              <Button asChild variant="outline">
                <Link to="/teams">Gerenciar Time</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recentes */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Vendas Recentes</span>
              <Button asChild variant="ghost" size="sm" className="flex items-center gap-1">
                <Link to="/sales/history">Ver Mais</Link>
              </Button>
            </CardTitle>
            <CardDescription>
              As últimas vendas registradas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-pulse text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground mt-2">Carregando dados...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {recentSales.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
                    <p className="text-muted-foreground mt-2">Nenhuma venda registrada</p>
                    <Button asChild variant="outline" size="sm" className="mt-4">
                      <Link to="/sales/new">Registrar Nova Venda</Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-4 text-sm font-medium text-muted-foreground mb-2">
                      <div>Cliente</div>
                      <div>Data</div>
                      <div>Valor</div>
                      <div className="text-right">Status</div>
                    </div>
                    {recentSales.map((sale) => (
                      <div
                        key={sale.id}
                        className="grid grid-cols-4 items-center border-b pb-2"
                      >
                        <div className="font-medium">{sale.customerInfo.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {sale.date.toLocaleDateString("pt-BR")}
                        </div>
                        <div>
                          {formatCurrency(sale.totalPrice)}
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${sale.status === "delivered" ? "bg-green-100 text-green-800" : 
                              sale.status === "cancelled" ? "bg-red-100 text-red-800" : 
                              sale.status === "problem" ? "bg-orange-100 text-orange-800" : 
                              "bg-yellow-100 text-yellow-800"}`
                          }>
                            {sale.status === "delivered" ? "Entregue" : 
                              sale.status === "cancelled" ? "Cancelado" : 
                              sale.status === "problem" ? "Problema" : 
                              "Pendente"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
