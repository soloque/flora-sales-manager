
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users, PlusCircle } from "lucide-react";
import { fetchAddressByCep } from "@/services/cepService";

interface Seller {
  id: string;
  name: string;
  email: string;
  type: string;
  is_virtual: boolean;
}

interface NewSaleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sellerId?: string;
  onSaleCreated?: () => void;
}

export function NewSaleModal({ open, onOpenChange, sellerId, onSaleCreated }: NewSaleModalProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  const [allSellers, setAllSellers] = useState<Seller[]>([]);
  
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
    assignedSellerId: sellerId || "",
    newSellerName: "",
    newSellerEmail: "",
  });

  const isOwner = user?.role === "owner";

  useEffect(() => {
    if (sellerId) {
      setFormData(prev => ({
        ...prev,
        assignedSellerId: sellerId
      }));
    }
  }, [sellerId]);

  useEffect(() => {
    if (!user || !open) return;
    
    if (isOwner) {
      const getSellers = async () => {
        try {
          const { data, error } = await supabase.rpc(
            'get_all_sellers_for_owner',
            { owner_id_param: user.id }
          );
          
          if (!error && data) {
            setAllSellers(data);
          }
        } catch (error) {
          console.error("Error fetching sellers:", error);
        }
      };
      
      getSellers();
    }
  }, [user, open, isOwner]);

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
      const totalPrice = formData.quantity * formData.unitPrice;
      const commissionRate = 20;
      const commission = totalPrice * (commissionRate / 100);
      
      let sellerId = user.id;
      let sellerName = user.name;
      let isVirtualSeller = false;
      
      if (isOwner && formData.assignedSellerId) {
        if (formData.assignedSellerId === "new") {
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
      
      toast({
        title: "Venda registrada com sucesso!",
        description: `Venda no valor de R$ ${totalPrice.toFixed(2)} foi registrada${
          isOwner && formData.assignedSellerId ? ` para ${sellerName}` : ''
        }.`
      });
      
      // Reset form
      setFormData({
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
        assignedSellerId: sellerId || "",
        newSellerName: "",
        newSellerEmail: "",
      });

      onSaleCreated?.();
      onOpenChange(false);
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

  const totalPrice = formData.quantity * formData.unitPrice;
  const commission = totalPrice * 0.2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Nova Venda
            {isOwner && (
              <span className="text-sm font-normal text-muted-foreground">
                (Proprietário)
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Registre uma nova venda no sistema
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
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
                    disabled={!!sellerId}
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
                </div>

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
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Customer information */}
          <div className="space-y-4">
            <h3 className="font-medium">Informações do Cliente</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Nome do Cliente *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  placeholder="Nome completo"
                  required
                />
              </div>
              
              <div>
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
            
            <div>
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Rua, número, complemento"
                />
              </div>
              
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                />
              </div>
              
              <div className="md:col-span-2">
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
          <div className="space-y-4">
            <h3 className="font-medium">Valor da Venda</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
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
              
              <div>
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
          
          <div>
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => handleInputChange('observations', e.target.value)}
              placeholder="Observações adicionais sobre a venda"
              className="min-h-[80px]"
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
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Registrando..." : "Registrar Venda"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
