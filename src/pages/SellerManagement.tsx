
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Sale } from "@/types";
import { AlertCircle, UserPlus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import TeamMembersList from "@/components/TeamMembersList";
import { createNotification } from "@/services/notificationService";
import { TeamRequestsList } from "@/components/TeamRequestsList";
import { TeamInviteModal } from "@/components/TeamInviteModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const SellerManagement = () => {
  const { user } = useAuth();
  const isOwner = user?.role === "owner";
  const isSeller = user?.role === "seller";
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (isOwner) {
          // Get team members for owner
          const { data: teamData, error: teamError } = await supabase.rpc(
            'get_team_members',
            { owner_id_param: user.id }
          );
          
          if (teamError) throw teamError;
          
          if (teamData) {
            const members = teamData.map(member => ({
              id: member.id,
              name: member.name || "",
              email: member.email || "",
              role: member.role as any,
              createdAt: new Date(member.created_at),
              avatar_url: member.avatar_url
            }));
            setTeamMembers(members);
          }
          
          // Get sales data for analytics
          const { data: salesData, error: salesError } = await supabase
            .from('sales')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);
            
          if (salesError) throw salesError;
          
          if (salesData) {
            const formattedSales: Sale[] = salesData.map(sale => ({
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
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar os dados."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, isOwner]);

  const handleAddSeller = async () => {
    if (!searchEmail.trim()) {
      toast({
        variant: "destructive",
        title: "E-mail obrigatório",
        description: "Digite o e-mail do vendedor para adicionar ao time."
      });
      return;
    }

    setIsSearching(true);
    try {
      // Search for user by email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', searchEmail.trim().toLowerCase())
        .single();

      if (userError || !userData) {
        toast({
          variant: "destructive",
          title: "Usuário não encontrado",
          description: "Não foi encontrado um usuário com este e-mail."
        });
        return;
      }

      if (userData.role !== 'seller') {
        toast({
          variant: "destructive",
          title: "Usuário inválido",
          description: "Este usuário não é um vendedor."
        });
        return;
      }

      // Check if already a team member
      const isAlreadyMember = teamMembers.some(member => member.id === userData.id);
      if (isAlreadyMember) {
        toast({
          variant: "destructive",
          title: "Vendedor já no time",
          description: "Este vendedor já faz parte do seu time."
        });
        return;
      }

      // Add to team
      await supabase.rpc('add_team_member', {
        owner_id_param: user!.id,
        seller_id_param: userData.id
      });

      // Create notification for the seller
      await createNotification(
        userData.id,
        "Adicionado ao time",
        `Você foi adicionado ao time de ${user!.name}`,
        "team_request"
      );

      // Refresh team members
      const { data: teamData } = await supabase.rpc(
        'get_team_members',
        { owner_id_param: user!.id }
      );
      
      if (teamData) {
        const members = teamData.map(member => ({
          id: member.id,
          name: member.name || "",
          email: member.email || "",
          role: member.role as any,
          createdAt: new Date(member.created_at),
          avatar_url: member.avatar_url
        }));
        setTeamMembers(members);
      }

      setSearchEmail("");
      toast({
        title: "Vendedor adicionado",
        description: `${userData.name} foi adicionado ao seu time com sucesso.`
      });
    } catch (error) {
      console.error("Erro ao adicionar vendedor:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível adicionar o vendedor. Tente novamente."
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendMessage = (member: User) => {
    // This would open a message modal or navigate to messages
    console.log("Send message to:", member);
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "O sistema de mensagens será implementado em breve."
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (isSeller) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Gerenciamento de Vendedores</CardTitle>
            <CardDescription>
              Como vendedor, você pode solicitar vínculo a proprietários de times.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Acesso Limitado</AlertTitle>
              <AlertDescription>
                Apenas proprietários podem gerenciar times de vendedores.
                Entre em contato com um proprietário para se juntar a um time.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Esta página é restrita a proprietários.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Sem Permissão</AlertTitle>
              <AlertDescription>
                Você não tem permissão para acessar esta página.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Gerenciamento de Vendedores</CardTitle>
            <CardDescription>
              Gerencie sua equipe de vendedores e acompanhe o desempenho
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Convidar por E-mail
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Convidar Vendedor</DialogTitle>
                  <DialogDescription>
                    Convide um vendedor para seu time enviando um convite por e-mail
                  </DialogDescription>
                </DialogHeader>
                <TeamInviteModal 
                  isOpen={isInviteModalOpen}
                  onClose={() => setIsInviteModalOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="search-email">Adicionar Vendedor Existente</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="search-email"
                  type="email"
                  placeholder="Digite o e-mail do vendedor"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSeller()}
                />
                <Button 
                  onClick={handleAddSeller}
                  disabled={isSearching || !searchEmail.trim()}
                >
                  {isSearching ? "Buscando..." : "Adicionar"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                O vendedor deve ter uma conta registrada no sistema
              </p>
            </div>
          </div>

          <TeamMembersList 
            teamMembers={teamMembers}
            onSendMessage={handleSendMessage}
          />
        </CardContent>
      </Card>

      <TeamRequestsList />
    </div>
  );
};

export default SellerManagement;
