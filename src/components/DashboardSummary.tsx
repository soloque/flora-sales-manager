
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Calendar,
  Target,
  Award,
  BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Sale } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DashboardChart } from "./DashboardChart";

const DashboardSummary = () => {
  const { user } = useAuth();
  const isOwner = user?.role === "owner";
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchSales = async () => {
      setIsLoading(true);
      try {
        // Get sales from current month
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        let query = supabase
          .from('sales')
          .select('*')
          .gte('date', firstDayOfMonth.toISOString())
          .order('date', { ascending: false });
          
        if (!isOwner) {
          query = query.eq('seller_id', user.id);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        if (data) {
          const formattedSales: Sale[] = data.map(sale => {
            // Determine seller name from various sources
            let sellerName = sale.seller_name || "";
            
            // If it's a virtual seller sale, use the seller_name field
            if (sale.is_virtual_seller) {
              sellerName = sale.seller_name || "Vendedor Virtual";
            }
            
            return {
              id: sale.id,
              date: new Date(sale.date),
              description: sale.description || "",
              quantity: sale.quantity || 0,
              unitPrice: sale.unit_price || 0,
              totalPrice: sale.total_price || 0,
              sellerId: sale.seller_id || "",
              sellerName: sellerName,
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
            };
          });
          
          console.log('Formatted sales for dashboard:', formattedSales);
          setSales(formattedSales);
        }
      } catch (error) {
        console.error("Erro ao buscar vendas:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSales();
  }, [user, isOwner]);

  const totalSales = sales.reduce((acc, sale) => acc + sale.totalPrice, 0);
  const totalCommissions = sales.reduce((acc, sale) => acc + sale.commission, 0);
  const totalProfit = sales.reduce((acc, sale) => acc + (sale.profit || 0), 0);
  const saleCount = sales.length;

  // Mock data for trending comparison (previous month)
  const previousMonthSales = totalSales * 0.8; // Simulate 20% less sales
  const salesDifference = totalSales - previousMonthSales;
  const salesIncrease = (salesDifference / previousMonthSales) * 100;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vendas este mês
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {salesIncrease > 0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-green-500 inline-block mr-1" />
                  {salesIncrease.toFixed(2)}% a mais que o mês passado
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 text-red-500 inline-block mr-1" />
                  {Math.abs(salesIncrease).toFixed(2)}% a menos que o mês passado
                </>
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Comissões este mês
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalCommissions.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {isOwner ? "Comissões pagas aos vendedores" : "Sua comissão acumulada"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lucro este mês
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Lucro total gerado pelas vendas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{saleCount}</div>
            <p className="text-xs text-muted-foreground">
              Vendas realizadas este mês
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Gráfico de vendas por vendedor */}
      {sales.length > 0 && <DashboardChart sales={sales} />}
    </div>
  );
};

export default DashboardSummary;
