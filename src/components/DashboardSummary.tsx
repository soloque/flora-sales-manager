
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Sale, Update, User } from '@/types';
import { CalendarDays, DollarSign, Users2 } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface DashboardSummaryProps {
  isOwner: boolean;
}

export function DashboardSummary({ isOwner }: DashboardSummaryProps) {
  const { user } = useAuth();
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [salesTotal, setSalesTotal] = useState(0);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchDashboardData = async () => {
      // Fetch recent sales
      try {
        const now = new Date();
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        
        let query = supabase
          .from('sales')
          .select('*')
          .gte('date', threeMonthsAgo.toISOString())
          .order('date', { ascending: false })
          .limit(5);
        
        if (!isOwner) {
          query = query.eq('seller_id', user.id);
        }
        
        const { data: salesData, error: salesError } = await query;
        
        if (salesError) {
          console.error("Error fetching sales:", salesError);
          return;
        }
        
        if (salesData) {
          const mappedSales = salesData.map((sale) => ({
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
              name: "",
              phone: "",
              address: "",
              city: "",
              zipCode: "",
              order: ""
            },
            createdAt: new Date(sale.created_at),
            updatedAt: new Date(sale.updated_at)
          }));
          
          setRecentSales(mappedSales);
          
          // Calculate total
          const total = salesData.reduce((sum, sale) => sum + (sale.total_price || 0), 0);
          setSalesTotal(total);
        }
        
        if (isOwner) {
          // Fetch team members
          const { data: teamData, error: teamError } = await supabase.rpc(
            'get_team_members',
            { owner_id_param: user.id }
          );
          
          if (!teamError && teamData) {
            const members = teamData.map((member: any) => ({
              id: member.id,
              name: member.name || "Sem nome",
              email: member.email || "Sem email",
              role: member.role as any || "seller",
              createdAt: new Date(member.created_at),
              avatar_url: member.avatar_url
            }));
            setTeamMembers(members);
          }
          
          // Fetch updates
          const { data: updatesData, error: updatesError } = await supabase
            .from('updates')
            .select('*')
            .eq('author_id', user.id)
            .order('created_at', { ascending: false })
            .limit(3);
          
          if (!updatesError && updatesData) {
            const mappedUpdates = updatesData.map(update => ({
              id: update.id,
              title: update.title,
              content: update.content,
              images: update.images as string[] || [],
              createdAt: new Date(update.created_at!),
              authorId: update.author_id || "",
              authorName: update.author_name || "",
              isHighlighted: update.is_highlighted || false
            }));
            setUpdates(mappedUpdates);
          }
          
          // Fetch pending requests count
          const { data: requestsData, error: requestsError } = await supabase.rpc(
            'get_team_requests',
            { owner_id_param: user.id }
          );
          
          if (!requestsError && requestsData) {
            setPendingRequests(requestsData.length);
          }
        } else {
          // For sellers, fetch owner's updates
          const { data: teamOwnerData } = await supabase.rpc(
            'get_seller_team',
            { seller_id_param: user.id }
          );
          
          if (teamOwnerData && teamOwnerData.length > 0) {
            const ownerId = teamOwnerData[0].id;
            
            const { data: updatesData, error: updatesError } = await supabase
              .from('updates')
              .select('*')
              .eq('author_id', ownerId)
              .order('created_at', { ascending: false })
              .limit(3);
            
            if (!updatesError && updatesData) {
              const mappedUpdates = updatesData.map(update => ({
                id: update.id,
                title: update.title,
                content: update.content,
                images: update.images as string[] || [],
                createdAt: new Date(update.created_at!),
                authorId: update.author_id || "",
                authorName: update.author_name || "",
                isHighlighted: update.is_highlighted || false
              }));
              setUpdates(mappedUpdates);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    
    fetchDashboardData();
  }, [user, isOwner]);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vendas Recentes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(salesTotal)}</div>
            <p className="text-xs text-muted-foreground">
              {recentSales.length} vendas nos últimos 3 meses
            </p>
          </CardContent>
        </Card>
        
        {isOwner && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Time de Vendas</CardTitle>
                <Users2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamMembers.length}</div>
                <p className="text-xs text-muted-foreground">
                  {pendingRequests > 0 && 
                    `${pendingRequests} solicitações pendentes`}
                  {pendingRequests === 0 && 'Nenhuma solicitação pendente'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Atualizações</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{updates.length}</div>
                <p className="text-xs text-muted-foreground">
                  Atualizações enviadas ao time
                </p>
              </CardContent>
            </Card>
          </>
        )}
        
        {!isOwner && !updates.length && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Você não está vinculado a nenhum proprietário.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Recent Sales */}
      {recentSales.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Vendas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentSales.map(sale => (
                <div key={sale.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{sale.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(sale.date, 'dd/MM/yyyy')} • {sale.sellerName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      sale.status === 'delivered' ? 'default' :
                      sale.status === 'paid' ? 'secondary' :
                      sale.status === 'pending' ? 'outline' :
                      sale.status === 'cancelled' ? 'destructive' :
                      'outline'
                    }>
                      {getStatusLabel(sale.status)}
                    </Badge>
                    <p className="font-medium">{formatCurrency(sale.totalPrice)}</p>
                  </div>
                </div>
              ))}
              
              <div className="text-right mt-4">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/sales">Ver todas as vendas</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Team Updates */}
      {updates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{isOwner ? "Suas Atualizações" : "Atualizações do Proprietário"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {updates.map(update => (
                <div key={update.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold">{update.title}</h3>
                    <Badge variant={update.isHighlighted ? "default" : "outline"}>
                      {update.isHighlighted ? "Destacado" : format(update.createdAt, 'dd/MM/yyyy')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{update.content}</p>
                  {update.images && update.images.length > 0 && (
                    <div className="flex mt-2 space-x-2 overflow-x-auto">
                      {update.images.map((image, index) => (
                        <img 
                          key={index} 
                          src={image} 
                          alt={`Imagem ${index + 1}`}
                          className="h-20 w-20 object-cover rounded-md"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper function to translate status labels to Portuguese
function getStatusLabel(status: string) {
  switch (status) {
    case "pending": return "Pendente";
    case "processing": return "Em Processamento";
    case "paid": return "Pago";
    case "delivered": return "Entregue";
    case "cancelled": return "Cancelado";
    case "problem": return "Problema";
    default: return status;
  }
}
