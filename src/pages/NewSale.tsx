
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { fetchAddressByCep } from "@/services/cepService";
import { supabase } from "@/integrations/supabase/client";

const NewSale = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const isOwner = user?.role === "owner";
  
  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerZipCode, setCustomerZipCode] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [customerState, setCustomerState] = useState("");
  const [orderDetails, setOrderDetails] = useState("");
  const [observations, setObservations] = useState("");
  const [totalValue, setTotalValue] = useState("");
  const [commission, setCommission] = useState("20"); // Default 20%
  const [costPrice, setCostPrice] = useState("");
  
  const handleCepSearch = async () => {
    if (customerZipCode.length < 8) {
      toast({
        variant: "destructive",
        title: "CEP inválido",
        description: "O CEP deve ter pelo menos 8 dígitos.",
      });
      return;
    }
    
    setIsFetchingCep(true);
    
    try {
      const address = await fetchAddressByCep(customerZipCode);
      setCustomerAddress(address.logradouro);
      setCustomerCity(address.localidade);
      setCustomerState(address.uf);
      
      toast({
        title: "CEP encontrado",
        description: "Endereço preenchido automaticamente.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar CEP",
        description: error instanceof Error ? error.message : "Falha ao buscar o endereço.",
      });
    } finally {
      setIsFetchingCep(false);
    }
  };
  
  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers
    const value = e.target.value.replace(/\D/g, "");
    
    // Format the phone number (Brazilian format)
    if (value.length <= 11) {
      setCustomerPhone(value);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validate required fields
    if (!customerName || !customerPhone || !customerZipCode || !customerAddress || !customerCity || !orderDetails || !totalValue) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
      });
      setIsLoading(false);
      return;
    }
    
    try {
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      const totalPriceValue = parseFloat(totalValue);
      const commissionRate = parseFloat(commission);
      const calculatedCommission = (totalPriceValue * commissionRate) / 100;
      
      // Only calculate profit if cost price is provided and user is owner
      const costPriceValue = isOwner && costPrice ? parseFloat(costPrice) : 0;
      const profit = isOwner && costPriceValue > 0 ? totalPriceValue - costPriceValue - calculatedCommission : 0;
      
      // Format the date properly as a string for Supabase
      const currentDate = new Date().toISOString();
      
      // Insert the sale into the database
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert({
          date: currentDate,
          description: `Venda para ${customerName}`,
          quantity: 1,
          unit_price: totalPriceValue,
          total_price: totalPriceValue,
          seller_id: user.id,
          seller_name: user.name,
          commission: calculatedCommission,
          commission_rate: commissionRate,
          status: "pending",
          observations: observations,
          cost_price: isOwner ? costPriceValue || null : null,
          profit: isOwner ? profit || null : null
        })
        .select()
        .single();
        
      if (saleError) {
        throw saleError;
      }
      
      // Insert customer information
      const { error: customerError } = await supabase
        .from('customer_info')
        .insert({
          name: customerName,
          phone: customerPhone,
          address: customerAddress,
          city: customerCity,
          state: customerState,
          zip_code: customerZipCode,
          order_details: orderDetails,
          observations: observations,
          sale_id: saleData?.id
        });
        
      if (customerError) {
        throw customerError;
      }
      
      toast({
        title: "Venda registrada com sucesso",
        description: `Venda para ${customerName} no valor de R$ ${totalValue} registrada.`,
      });
      
      navigate("/sales");
    } catch (error: any) {
      console.error("Error registering sale:", error);
      toast({
        variant: "destructive",
        title: "Erro ao registrar venda",
        description: error.message || "Ocorreu um erro ao registrar a venda.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatZipCode = (value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    if (cleanValue.length <= 8) {
      setCustomerZipCode(cleanValue);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Registrar Nova Venda</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para registrar uma nova venda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informações do Cliente</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Nome do Cliente *</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="ex: Antonio"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Telefone *</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={handlePhoneInput}
                    placeholder="ex: 21991372565"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Label htmlFor="customerZipCode">CEP *</Label>
                    <Input
                      id="customerZipCode"
                      value={customerZipCode}
                      onChange={(e) => formatZipCode(e.target.value)}
                      placeholder="ex: 20960120"
                      required
                    />
                  </div>
                  <Button 
                    type="button" 
                    onClick={handleCepSearch} 
                    disabled={isFetchingCep || customerZipCode.length < 8}
                  >
                    {isFetchingCep ? "Buscando..." : "Buscar CEP"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Digite o CEP para buscar o endereço automaticamente
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customerAddress">Endereço *</Label>
                <Input
                  id="customerAddress"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="ex: Rua capitulino 96 Rocha"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerCity">Cidade *</Label>
                  <Input
                    id="customerCity"
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    placeholder="ex: Rio de Janeiro"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customerState">Estado</Label>
                  <Input
                    id="customerState"
                    value={customerState}
                    onChange={(e) => setCustomerState(e.target.value)}
                    placeholder="ex: RJ"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Detalhes do Pedido</h3>
              
              <div className="space-y-2">
                <Label htmlFor="orderDetails">Plantas/Produtos *</Label>
                <Textarea
                  id="orderDetails"
                  value={orderDetails}
                  onChange={(e) => setOrderDetails(e.target.value)}
                  placeholder="ex: Caju, Acerola e Jabuticaba"
                  className="min-h-[100px]"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Descreva detalhadamente as plantas ou produtos vendidos
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Informações adicionais sobre a venda ou entrega"
                  className="min-h-[80px]"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Valores e Comissão</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalValue">Valor Total (R$) *</Label>
                  <Input
                    id="totalValue"
                    type="number"
                    min="0"
                    step="0.01"
                    value={totalValue}
                    onChange={(e) => setTotalValue(e.target.value)}
                    placeholder="ex: 240"
                    required
                  />
                </div>
                
                {isOwner && (
                  <div className="space-y-2">
                    <Label htmlFor="costPrice">Custo (R$)</Label>
                    <Input
                      id="costPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                      placeholder="ex: 120"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="commission">Taxa de Comissão (%)</Label>
                  <Input
                    id="commission"
                    type="number"
                    min="0"
                    max="100"
                    value={commission}
                    onChange={(e) => setCommission(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Comissão calculada: R$ {totalValue ? ((parseFloat(totalValue) * parseFloat(commission)) / 100).toFixed(2) : "0.00"}
                  </p>
                </div>
              </div>
              
              {isOwner && costPrice && totalValue && (
                <div className="p-4 bg-muted/20 rounded-md">
                  <p className="text-sm">
                    <strong>Lucro estimado:</strong> R$ {
                      (parseFloat(totalValue) - parseFloat(costPrice) - ((parseFloat(totalValue) * parseFloat(commission)) / 100)).toFixed(2)
                    }
                  </p>
                </div>
              )}
            </div>
            
            <CardFooter className="flex justify-between px-0 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/sales")}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? "Salvando..." : "Registrar Venda"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewSale;
