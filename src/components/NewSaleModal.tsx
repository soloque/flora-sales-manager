
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, PlusCircle } from "lucide-react";
import { fetchAddressByCep } from "@/services/cepService";
import { SellerSelector } from "./SellerSelector";
import { useNewSaleFormWithSeller } from "@/hooks/useNewSaleFormWithSeller";

interface NewSaleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaleCreated?: () => void;
}

export function NewSaleModal({ open, onOpenChange, onSaleCreated }: NewSaleModalProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  
  const {
    formData,
    handleInputChange,
    handleSellerChange,
    validateForm,
    resetForm
  } = useNewSaleFormWithSeller();

  const isOwner = user?.role === "owner";

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    
    if (cep.length !== 8) return;
    
    setIsFetchingAddress(true);
    
    try {
      const addressData = await fetchAddressByCep(cep);
      
      handleInputChange('address', addressData.logradouro);
      handleInputChange('city', addressData.localidade);
      handleInputChange('state', addressData.uf);
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

    // Se é owner e não selecionou vendedor, mostrar erro
    if (isOwner && !formData.assignedSellerId) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Selecione um vendedor para atribuir a venda."
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const totalPrice = formData.quantity * formData.unitPrice;
      const commissionRate = 20;
      const commission = totalPrice * (commissionRate / 100);
      
      // Definir quem é o vendedor baseado no tipo de usuário
      const sellerId = isOwner ? formData.assignedSellerId : user.id;
      const sellerName = isOwner ? formData.assignedSellerName : user.name;
      const isVirtualSeller = isOwner ? formData.isVirtualSeller : false;
      const assignedByOwner = isOwner;
      const originalSellerId = isOwner ? user.id : null;
      
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
          is_virtual_seller: isVirtualSeller,
          assigned_by_owner: assignedByOwner,
          original_seller_id: originalSellerId
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Venda registrada com sucesso!",
        description: `Venda no valor de R$ ${totalPrice.toFixed(2)} foi registrada${isOwner ? ` para ${sellerName}` : ''}.`
      });
      
      resetForm();
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Nova Venda
          </DialogTitle>
          <DialogDescription>
            Registre uma nova venda no sistema
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isOwner && (
            <SellerSelector
              value={formData.assignedSellerId}
              onChange={handleSellerChange}
              label="Atribuir venda para"
            />
          )}
          
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
          
          <div>
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => handleInputChange('observations', e.target.value)}
              placeholder="Observações adicionais sobre a venda"
              className="min-h-[60px]"
            />
          </div>
          
          <div className="border p-3 rounded-md bg-muted/30">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total:</span>
              <span className="text-lg font-bold">R$ {totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Comissão (20%):</span>
              <span>R$ {commission.toFixed(2)}</span>
            </div>
            {isOwner && formData.assignedSellerName && (
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-muted-foreground">Vendedor:</span>
                <span className="font-medium">{formData.assignedSellerName}</span>
              </div>
            )}
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
