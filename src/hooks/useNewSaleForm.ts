
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

export function useNewSaleForm(preSelectedSellerId?: string | null) {
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

    if (formData.assignedSellerId === "new") {
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

  const resetForm = () => {
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
      assignedSellerId: preSelectedSellerId || "",
      newSellerName: "",
      newSellerEmail: "",
    });
  };

  return {
    formData,
    handleInputChange,
    validateForm,
    resetForm
  };
}
