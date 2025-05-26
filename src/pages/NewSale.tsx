
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useSellerSubscription } from "@/hooks/useSellerSubscription";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createNotification } from "@/services/notificationService";
import { AlertCircle, Loader2, XCircle, Users, Bot } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { fetchAddressByCep } from "@/services/cepService";
import { Link } from "react-router-dom";

interface Seller {
  id: string;
  name: string;
  email: string;
  type: string;
  is_virtual: boolean;
}

const NewSale = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedSellerId = searchParams.get('sellerId');
  const { subscriptionInfo, loading: subscriptionLoading, checkCanRegisterSale } = useSellerSubscription();
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingTeam, setIsCheckingTeam] = useState(true);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  const [allSellers, setAllSellers] = useState<Seller[]>([]);
  const [preSelectedSeller, setPreSelectedSeller] = useState<Seller | null>(null);
  const [canRegisterSale, setCanRegisterSale] = useState(false);
  
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
    assignedSellerId: preSelectedSellerId || "",
    newSellerName: "",
    newSellerEmail: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    const checkUserPermissions = async () => {
      setIsCheckingTeam(true);
      const userIsOwner = user.role === "owner";
      setIsOwner(userIsOwner);
      
      try {
        if (userIsOwner) {
          // Owner can always register sales
          setCanRegisterSale(true);
          
          // Get all sellers for owner
          const { data, error } = await supabase.rpc(
            'get_all_sellers_for_owner',
            { owner_id_param: user.id }
          );
          
          if (!error && data) {
            setAllSellers(data);
            
            // Find pre-selected seller
            if (preSelectedSellerId) {
              const preSelected = data.find((s: Seller) => s.id === preSelectedSellerId);
              if (preSelected) {
                setPreSelectedSeller(preSelected);
              }
            }
          }
        } else {
          // For sellers, check if they can register sales
          if (checkCanRegisterSale) {
            const canRegister = await checkCanRegisterSale();
            setCanRegisterSale(canRegister);
          } else if (subscriptionInfo) {
            setCanRegisterSale(subscriptionInfo.canRegister || subscriptionInfo.isTeamMember);
          } else {
            // Check if seller has owner/team
            const { data: teamData } = await supabase.rpc(
              'get_seller_team', 
              { seller_id_param: user.id }
            );
            setCanRegisterSale(teamData && teamData.length > 0);
          }
        }
      } catch (error) {
        console.error("Error checking permissions:", error);
        setCanRegisterSale(userIsOwner); // Fallback: owners can always register
      } finally {
        setIsCheckingTeam(false);
      }
    };
    
    checkUserPermissions();
  }, [user, preSelectedSellerId, checkCanRegisterSale, subscriptionInfo]);

  // Update assignedSellerId when preSelectedSellerId changes
  useEffect(() => {
    if (preSelectedSellerId) {
      setFormData(prev => ({
        ...prev,
        assignedSellerId: preSelectedSellerId
      }));
    }
  }, [preSelectedSellerId]);

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

    // Validate new seller fields if creating new seller
    if (isOwner && formData.assignedSellerId === "new") {
      if (!formData.newSellerName.trim()) {
        toast({
          variant: "destructive",
          title: "Campo obrigatório",
          description: "Nome do vendedor é obrigatório."
        });
        return false;
      }
      
      if (!formData.newSellerEmail.trim()) {
        toast({
          variant: "destructive",
          title: "Campo obrigatório",
          description: "Email do vendedor é obrigatório."
        });
        return false;
      }
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
      let isVirtualSeller = false;
      
      if (isOwner && formData.assignedSellerId) {
        if (formData.assignedSellerId === "new") {
          // Create a new virtual seller
          const { data: virtualSeller, error: virtualSellerError } = await supabase
            .from('virtual_sellers')
            .insert({
              name: formData.newSellerName,
              email: formData.newSellerEmail,
              owner_id: user.id
            })
            .select()
            .single();
          
          if (virtualSellerError) throw virtualSellerError;
          
          sellerId = virtualSeller.id;
          sellerName = virtualSeller.name;
          isVirtualSeller = true;
        } else {
          // Owner is assigning sale to an existing seller
          const assignedSeller = allSellers.find(seller => seller.id === formData.assignedSellerId);
          if (assignedSeller) {
            sellerId = assignedSeller.id;
            sellerName = assignedSeller.name;
            isVirtualSeller = assignedSeller.is_virtual;
          }
        }
      }
      
      const { data: saleData, error } = await supabase
        .from('sales')
        .insert({
          date: new Date().toISOString(),
          description: formData.order,
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
          customer_order: formData.order,
          is_virtual_seller: isVirtualSeller
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Send notifications only for real team members (not virtual sellers)
      if (isOwner && formData.assignedSellerId && formData.assignedSellerId !== user.id && formData.assignedSellerId !== "new" && !isVirtualSeller) {
        // Owner assigned sale to a real team member, notify the seller
        await createNotification(
          formData.assignedSellerId,
          "Venda atribuída a você",
          `Uma nova venda no valor de R$ ${totalPrice.toFixed(2)} foi atribuída a você por ${user.name}`,
          "new_sale",
          saleData.id
        );
      } else if (!isOwner) {
        // Seller registered sale, notify owner if exists
        const { data: teamData } = await supabase.rpc(
          'get_seller_team',
          { seller_id_param: user.id }
        );
        
        if (teamData && teamData.length > 0) {
          await createNotification(
            teamData[0].id,
            "Nova venda registrada",
            `${user.name} registrou uma nova venda no valor de R$ ${totalPrice.toFixed(2)}`,
            "new_sale",
            saleData.id
          );
        }
      }
      
      toast({
        title: "Venda registrada com sucesso!",
        description: `Venda no valor de R$ ${totalPrice.toFixed(2)} foi registrada${
          isOwner && formData.assignedSellerId ? ` para ${sellerName}` : ''
        }.`
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

  // Show loading while checking permissions
  if (isCheckingTeam) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Show permission denied if user cannot register sales
  if (!canRegisterSale) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <XCircle className="h-6 w-6 text-red-500" />
            <span>Permissão Negada</span>
          </CardTitle>
          <CardDescription>
            Você não tem permissão para registrar vendas no momento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Limite Atingido ou Sem Permissão</AlertTitle>
            <AlertDescription>
              {subscriptionInfo && !subscriptionInfo.canRegister 
                ? `Você utilizou ${subscriptionInfo.salesUsed} de ${subscriptionInfo.salesLimit} vendas gratuitas.`
                : "Você precisa estar vinculado a um proprietário ou ter um plano pago para registrar vendas."
              }
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-col items-center py-6 space-y-4">
            <div className="text-6xl mb-4">🔒</div>
            <p className="text-center mb-4">
              Escolha uma das opções abaixo para continuar:
            </p>
            <div className="flex space-x-4">
              <Button asChild>
                <Link to="/pricing">
                  Upgrade para R$ 200/mês
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/team">
                  Solicitar Vínculo
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalPrice = formData.quantity * formData.unitPrice;
  const commission = totalPrice * 0.2;

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M5 12h14"/><path d="M12 5v14"/>
            </svg>
            Nova Venda
            {isOwner && (
              <span className="text-sm font-normal text-muted-foreground">
                (Proprietário)
              </span>
            )}
            {preSelectedSeller && (
              <span className="text-sm font-normal text-blue-600 bg-blue-100 px-2 py-1 rounded flex items-center gap-1">
                <Bot className="h-3 w-3" />
                para {preSelectedSeller.name} {preSelectedSeller.is_virtual ? '(Virtual)' : ''}
              </span>
            )}
          </CardTitle>
          <CardDescription>
            {isOwner 
              ? preSelectedSeller 
                ? `Registrando venda para ${preSelectedSeller.is_virtual ? 'o vendedor virtual' : 'o vendedor'} ${preSelectedSeller.name}`
                : "Registre uma nova venda e atribua a um vendedor da sua equipe ou crie um novo vendedor virtual"
              : "Registre uma nova venda no sistema"
            }
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Owner assignment section */}
            {isOwner && (
              <div className="border rounded-lg p-4 bg-blue-50/50">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <h3 className="font-medium text-blue-800">Atribuição de Venda</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Atribuir venda para vendedor</Label>
                    <Select 
                      value={formData.assignedSellerId} 
                      onValueChange={(value) => handleInputChange('assignedSellerId', value)}
                      disabled={!!preSelectedSellerId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um vendedor ou deixe vazio para atribuir a você" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Atribuir a mim (proprietário)</SelectItem>
                        {allSellers.map((seller) => (
                          <SelectItem key={seller.id} value={seller.id}>
                            {seller.name} ({seller.email}) {seller.is_virtual ? '(Virtual)' : '(Real)'}
                          </SelectItem>
                        ))}
                        <SelectItem value="new">➕ Criar novo vendedor virtual</SelectItem>
                      </SelectContent>
                    </Select>
                    {preSelectedSellerId && (
                      <p className="text-sm text-blue-600 mt-1">
                        Vendedor pré-selecionado da lista de equipe
                      </p>
                    )}
                  </div>

                  {/* New seller fields */}
                  {formData.assignedSellerId === "new" && (
                    <div className="border rounded-lg p-4 bg-yellow-50/50 space-y-3">
                      <h4 className="font-medium text-yellow-800">Dados do Novo Vendedor Virtual</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="newSellerName">Nome do Vendedor *</Label>
                          <Input
                            id="newSellerName"
                            value={formData.newSellerName}
                            onChange={(e) => handleInputChange('newSellerName', e.target.value)}
                            placeholder="Nome completo"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="newSellerEmail">Email do Vendedor *</Label>
                          <Input
                            id="newSellerEmail"
                            type="email"
                            value={formData.newSellerEmail}
                            onChange={(e) => handleInputChange('newSellerEmail', e.target.value)}
                            placeholder="email@exemplo.com"
                            required
                          />
                        </div>
                      </div>
                      <p className="text-sm text-yellow-700">
                        Este vendedor virtual será criado no sistema. Vendedores virtuais não podem fazer login.
                      </p>
                    </div>
                  )}

                  {allSellers.length === 0 && formData.assignedSellerId !== "new" && (
                    <p className="text-sm text-muted-foreground">
                      Você ainda não tem vendedores na sua equipe. 
                      <Link to="/team" className="text-primary hover:underline ml-1">
                        Adicione vendedores aqui
                      </Link>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Seller subscription info */}
            {!isOwner && subscriptionInfo && (
              <div className="border p-4 rounded-md bg-blue-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-800">
                      {subscriptionInfo.isTeamMember ? 'Membro de Time' : 'Plano Gratuito'}
                    </p>
                    <p className="text-sm text-blue-600">
                      {subscriptionInfo.isTeamMember 
                        ? 'Vendas ilimitadas'
                        : `${subscriptionInfo.salesUsed} de ${subscriptionInfo.salesLimit} vendas utilizadas`
                      }
                    </p>
                  </div>
                  {!subscriptionInfo.isTeamMember && subscriptionInfo.salesUsed >= subscriptionInfo.salesLimit * 0.8 && (
                    <Button asChild size="sm" variant="outline">
                      <Link to="/pricing">
                        Upgrade
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            {/* Customer information */}
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
                <Label htmlFor="cep">CEP</Label>
                <div className="relative">
                  <Input 
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => handleInputChange('cep', e.target.value)}
                    placeholder="00000-000" 
                    onBlur={handleCepBlur}
                  />
                  {isFetchingAddress && (
                    <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-3" />
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Rua, número, complemento"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
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
            
            {/* Sale value */}
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
            
            {/* Summary */}
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
              {isOwner && formData.assignedSellerId && (
                <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
                  <span>Vendedor responsável:</span>
                  <span>
                    {formData.assignedSellerId === "new" 
                      ? formData.newSellerName || "Novo vendedor virtual"
                      : allSellers.find(s => s.id === formData.assignedSellerId)?.name || "Você"
                    }
                  </span>
                </div>
              )}
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
    </div>
  );
};

export default NewSale;
