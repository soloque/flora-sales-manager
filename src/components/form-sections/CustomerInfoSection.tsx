
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { fetchAddressByCep } from "@/services/cepService";

interface CustomerInfoSectionProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
}

export function CustomerInfoSection({ formData, handleInputChange }: CustomerInfoSectionProps) {
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);

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

  return (
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

      <div className="mt-4 space-y-2">
        <Label htmlFor="observations">Observações</Label>
        <Textarea
          id="observations"
          value={formData.observations}
          onChange={(e) => handleInputChange('observations', e.target.value)}
          placeholder="Observações adicionais sobre a venda"
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
}
