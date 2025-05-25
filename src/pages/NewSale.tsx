
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createNotification } from "@/services/notificationService";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { fetchAddressByCep } from "@/services/cepService";
import { User } from "@/types";

const NewSale = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOwner, setIsOwner] = useState(false);
  const [hasOwner, setHasOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingTeam, setIsCheckingTeam] = useState(true);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    cep: "",
    address: "",
    city: "",
    state: "",
    order: "",
    observations: "",
    quantity: 1,
    unitPrice: 0,
    assignedSellerId: "",
  });

  useEffect(() => {
    if (!user) return;
    
    setIsOwner(user.role === "owner");
    
    const checkSellerTeam = async () => {
      try {
        if (user.role === "seller") {
          const { data, error } = await supabase.rpc(
            'get_seller_team', 
            { seller_id_param: user.id }
          );
          
          if (error) throw error;
          
          setHasOwner(data && data.length > 0);
        } else if (user.role === "owner") {
          setHasOwner(true);
          
          // Get team members for owner
          const { data, error } = await supabase.rpc(
            'get_team_members',
            { owner_id_param: user.id }
          );
          
          if (error) throw error;
          
          if (data) {
            const members = data.map(member => ({
              id: member.id,
              name: member.name || "",
              email: member.email || "",
              role: member.role as any,
              createdAt: new Date(member.created_at),
              avatar_url: member.avatar_url
            }));
            setTeamMembers(members);
          }
        }
      } catch (error) {
        console.error("Erro ao verificar o time do vendedor:", error);
      } finally {
        setIsCheckingTeam(false);
      }
    };
    
    checkSellerTeam();
  }, [user]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    
    if (cep.length !== 8) return;
    
    setIsFetchingAddress(true);
    
    try {
      const addressData = await fetchAddressByCep(cep);
      
      setFormData(prev => ({
        ...prev,
        address: addressData.logradouro,
        city: addressData.localidade,
        state: addressData.uf
      }));
    } catch (error) {
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: "Erro ao buscar CEP",
          description: error.message,
        });
      }
    } finally {
      setIsFetchingAddress(false);
    }
  };

  const validateForm = () => {
    if (!formData.customerName.trim()) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Nome do cliente é obrigatório."
      });
      return false;
    }
    
    if (!formData.customerPhone.trim()) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Telefone do cliente é obrigatório."
      });
      return false;
    }
    
    if (!formData.cep.trim() || formData.cep.replace(/\D/g, '').length !== 8) {
      toast({
        variant: "destructive",
        title: "CEP inválido",
        description: "Digite um CEP válido com 8 dígitos."
      });
      return false;
    }
    
    if (!formData.address.trim()) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Endereço é obrigatório."
      });
      return false;
    }
    
    if (!formData.city.trim()) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Cidade é obrigatória."
      });
      return false;
    }
    
    if (!formData.state.trim()) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Estado é obrigatório."
      });
      return false;
    }
    
    if (!formData.order.trim()) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Descrição do pedido é obrigatória."
      });
      return false;
    }
    
    if (formData.quantity <= 0) {
      toast({
        variant: "destructive",
        title: "Quantidade inválida",
        description: "Quantidade deve ser maior que zero."
      });
      return false;
    }
    
    if (formData.unitPrice <= 0) {
      toast({
        variant: "destructive",
        title: "Preço inválido",
        description: "Preço unitário deve ser maior que zero."
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para registrar uma venda."
      });
      return;
    }
    
    if (!hasOwner) {
      toast({
        variant: "destructive",
        title: "Sem vínculo com proprietário",
        description: "Você precisa estar vinculado a um proprietário para registrar vendas."
      });
      return;
    }
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      // Calculate total price and commission
      const totalPrice = formData.quantity * formData.unitPrice;
      
      // Default commission rate (20%)
      const commissionRate = 20;
      const commission = totalPrice * (commissionRate / 100);
      
      // Determine seller info
      let sellerId = user.id;
      let sellerName = user.name;
      
      if (isOwner && formData.assignedSellerId) {
        // Owner is assigning sale to a team member
        const assignedSeller = teamMembers.find(member => member.id === formData.assignedSellerId);
        if (assignedSeller) {
          sellerId = assignedSeller.id;
          sellerName = assignedSeller.name;
        }
      }
      
      const { data: saleData, error } = await supabase
        .from('sales')
        .insert({
          date: new Date().toISOString(),
          description: formData.order, // Using order as description
          quantity: formData.quantity,
          unit_price: formData.unitPrice,
          total_price: totalPrice,
          seller_id: sellerId,
          seller_name: sellerName,
          commission: commission,
          commission_rate: commissionRate,
          status: "pending",
          observations: formData.observations,
          customer_name: formData.customerName,
          customer_phone: formData.customerPhone,
          customer_address: formData.address,
          customer_city: formData.city,
          customer_state: formData.state,
          customer_zipcode: formData.cep,
          customer_order: formData.order
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Find owner to send notification
      let ownerId = user.id;
      
      if (!isOwner) {
        const { data: teamData } = await supabase.rpc(
          'get_seller_team',
          { seller_id_param: user.id }
        );
        
        if (teamData && teamData.length > 0) {
          ownerId = teamData[0].id;
          
          // Send notification to owner about new sale
          await createNotification(
            ownerId,
            "Nova venda registrada",
            `${user.name} registrou uma nova venda no valor de R$ ${totalPrice.toFixed(2)}`,
            "new_sale",
            saleData.id
          );
        }
      } else if (formData.assignedSellerId && formData.assignedSellerId !== user.id) {
        // Owner assigned sale to someone else, notify the seller
        await createNotification(
          formData.assignedSellerId,
          "Venda atribuída a você",
          `Uma nova venda no valor de R$ ${totalPrice.toFixed(2)} foi atribuída a você`,
          "new_sale",
          saleData.id
        );
      }
      
      toast({
        title: "Venda registrada",
        description: "A venda foi registrada com sucesso."
      });
      
      navigate("/sales");
    } catch (error) {
      console.error("Erro ao registrar venda:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível registrar a venda. Tente novamente."
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingTeam) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando vínculo com proprietário...</p>
        </div>
      </div>
    );
  }

  if (!hasOwner && !isOwner) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Registro de Vendas Indisponível</CardTitle>
          <CardDescription>
            Você precisa estar vinculado a um proprietário para registrar vendas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Atenção!</AlertTitle>
            <AlertDescription>
              Para registrar vendas, você precisa fazer parte de um time de vendas.
              Entre em contato com um proprietário para se vincular a um time.
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-col items-center py-6">
            <div className="text-6xl mb-4">🔒</div>
            <p className="text-center mb-4">
              Acesse o gerenciamento de vendedores para solicitar vínculo a um proprietário.
            </p>
            <Button onClick={() => navigate("/sellers")}>
              Gerenciar Vendedores
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalPrice = formData.quantity * formData.unitPrice;
  const commission = totalPrice * 0.2;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Venda</CardTitle>
        <CardDescription>Registre uma nova venda no sistema.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {isOwner && teamMembers.length > 0 && (
            <div className="space-y-2">
              <Label>Atribuir venda para vendedor (opcional)</Label>
              <Select 
                value={formData.assignedSellerId} 
                onValueChange={(value) => handleInputChange('assignedSellerId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um vendedor ou deixe vazio para atribuir a você" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Atribuir a mim (proprietário)</SelectItem>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} ({member.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="border-t pt-4">
            <h3 className="font-medium mb-4">Informações do Cliente</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Nome do Cliente *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  placeholder="Nome completo"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Telefone *</Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <Label htmlFor="cep">CEP *</Label>
              <div className="relative">
                <Input 
                  id="cep"
                  value={formData.cep}
                  onChange={(e) => handleInputChange('cep', e.target.value)}
                  placeholder="00000-000" 
                  onBlur={handleCepBlur}
                  required
                />
                {isFetchingAddress && (
                  <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-3" />
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="address">Endereço *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Rua, número, complemento"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">Cidade *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="state">Estado *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  required
                />
              </div>
              
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="order">Pedido *</Label>
                <Input
                  id="order"
                  value={formData.order}
                  onChange={(e) => handleInputChange('order', e.target.value)}
                  placeholder="Descrição do pedido"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="font-medium mb-4">Valor da Venda</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  step="1"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Preço Unitário (R$) *</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => handleInputChange('unitPrice', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => handleInputChange('observations', e.target.value)}
              placeholder="Observações adicionais sobre a venda"
              className="min-h-[100px]"
            />
          </div>
          
          <div className="border p-4 rounded-md bg-muted/30">
            <div className="flex justify-between items-center">
              <Label>Valor Total:</Label>
              <span className="text-xl font-bold">
                R$ {totalPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <Label>Comissão (20%):</Label>
              <span>
                R$ {commission.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Registrando..." : "Registrar Venda"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default NewSale;
