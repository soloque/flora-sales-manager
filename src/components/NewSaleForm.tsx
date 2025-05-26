
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SellerAssignmentSection } from "./form-sections/SellerAssignmentSection";
import { CustomerInfoSection } from "./form-sections/CustomerInfoSection";
import { SaleValueSection } from "./form-sections/SaleValueSection";
import { SaleSummary } from "./form-sections/SaleSummary";
import { useNewSaleForm } from "@/hooks/useNewSaleForm";

interface Seller {
  id: string;
  name: string;
  email: string;
  type: string;
  is_virtual: boolean;
}

export function NewSaleForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedSellerId = searchParams.get('sellerId');
  const [isLoading, setIsLoading] = useState(false);
  const [allSellers, setAllSellers] = useState<Seller[]>([]);
  
  const {
    formData,
    handleInputChange,
    validateForm,
    resetForm
  } = useNewSaleForm(preSelectedSellerId);

  const isOwner = user?.role === "owner";

  useEffect(() => {
    console.log("NewSaleForm component mounted");
    console.log("User:", user);
    console.log("PreSelectedSellerId:", preSelectedSellerId);

    if (!user) {
      console.log("No user, redirecting to login");
      navigate("/login");
      return;
    }
    
    if (isOwner) {
      console.log("User is owner, fetching sellers");
      const getSellers = async () => {
        try {
          const { data, error } = await supabase.rpc(
            'get_all_sellers_for_owner',
            { owner_id_param: user.id }
          );
          
          console.log("Sellers data:", data);
          console.log("Sellers error:", error);
          
          if (!error && data) {
            setAllSellers(data);
          }
        } catch (error) {
          console.error("Error fetching sellers:", error);
        }
      };
      
      getSellers();
    }
  }, [user, navigate, preSelectedSellerId, isOwner]);

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

  console.log("Rendering NewSaleForm component");
  console.log("IsOwner:", isOwner);
  console.log("AllSellers:", allSellers);

  return (
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
        </CardTitle>
        <CardDescription>
          Registre uma nova venda no sistema
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {isOwner && (
            <SellerAssignmentSection
              formData={formData}
              handleInputChange={handleInputChange}
              allSellers={allSellers}
              preSelectedSellerId={preSelectedSellerId}
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
          
          <SaleSummary
            totalPrice={totalPrice}
            commission={commission}
            isOwner={isOwner}
            formData={formData}
            allSellers={allSellers}
          />
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
}
