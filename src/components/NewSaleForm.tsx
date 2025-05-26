
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CustomerInfoSection } from "./form-sections/CustomerInfoSection";
import { SaleValueSection } from "./form-sections/SaleValueSection";
import { ObservationsSection } from "./form-sections/ObservationsSection";
import { FormHeader } from "./form-sections/FormHeader";
import { SellerSelector } from "./SellerSelector";
import { useNewSaleFormWithSeller } from "@/hooks/useNewSaleFormWithSeller";

export function NewSaleForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    formData,
    handleInputChange,
    handleSellerChange,
    validateForm,
    resetForm
  } = useNewSaleFormWithSeller();

  const isOwner = user?.role === "owner";

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
  }, [user, navigate]);

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

  const totalPrice = formData.quantity * formData.unitPrice;
  const commission = totalPrice * 0.2;

  return (
    <div className="space-y-6">
      <FormHeader isOwner={isOwner} />
      
      <Card>
        <CardHeader>
          <CardTitle>Registrar Nova Venda</CardTitle>
          <CardDescription>
            Preencha os dados da venda abaixo
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {isOwner && (
              <SellerSelector
                value={formData.assignedSellerId}
                onChange={handleSellerChange}
                label="Atribuir venda para"
              />
            )}
            
            <CustomerInfoSection
              formData={formData}
              handleInputChange={handleInputChange}
            />
            
            <SaleValueSection
              formData={formData}
              handleInputChange={handleInputChange}
            />
            
            <ObservationsSection
              formData={formData}
              handleInputChange={handleInputChange}
            />
            
            <div className="border p-4 rounded-md bg-muted/30">
              <div className="flex justify-between items-center">
                <span className="font-medium">Valor Total:</span>
                <span className="text-xl font-bold">
                  R$ {totalPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-muted-foreground">Comissão (20%):</span>
                <span className="text-sm">
                  R$ {commission.toFixed(2)}
                </span>
              </div>
              {isOwner && formData.assignedSellerName && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-muted-foreground">Vendedor:</span>
                  <span className="text-sm font-medium">
                    {formData.assignedSellerName}
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
}
