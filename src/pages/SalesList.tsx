import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Sale } from "@/types";
import { SalesView } from "@/components/SalesView";

const SalesList = () => {
  const { user } = useAuth();
  const isOwner = user?.role === "owner";
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchSales = async () => {
      setIsLoading(true);
      try {
        // Get sales from last 3 months only
        const now = new Date();
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        
        let query = supabase
          .from('sales')
          .select('*')
          .gte('created_at', threeMonthsAgo.toISOString())
          .order('date', { ascending: false });
          
        if (!isOwner) {
          // If not an owner, only get seller's own sales
          query = query.eq('seller_id', user.id);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        if (data) {
          const formattedSales: Sale[] = data.map(sale => ({
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
  
  const handleUpdateSale = () => {
    // Refresh sales data after an update
    if (user) {
      const fetchSales = async () => {
        try {
          const now = new Date();
          const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
          
          let query = supabase
            .from('sales')
            .select('*')
            .gte('created_at', threeMonthsAgo.toISOString())
            .order('date', { ascending: false });
            
          if (!isOwner) {
            query = query.eq('seller_id', user.id);
          }
          
          const { data, error } = await query;
          
          if (error) throw error;
          
          if (data) {
            const formattedSales: Sale[] = data.map(sale => ({
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
            
            setSales(formattedSales);
          }
        } catch (error) {
          console.error("Erro ao atualizar vendas:", error);
        }
      };
      
      fetchSales();
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Vendas (Últimos 3 meses)</CardTitle>
            <CardDescription>
              Visualize e gerencie as vendas registradas nos últimos 90 dias
            </CardDescription>
          </div>
          {!isOwner && (
            <Button size="sm" asChild>
              <Link to="/sales/new">
                <PlusCircle className="h-4 w-4 mr-2" />
                Nova Venda
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <SalesView 
              sales={sales} 
              isOwner={isOwner} 
              onUpdateSale={handleUpdateSale} 
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesList;
