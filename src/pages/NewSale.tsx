
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createNotification } from "@/services/notificationService";

const NewSale = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOwner, setIsOwner] = useState(false);
  const [hasOwner, setHasOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingTeam, setIsCheckingTeam] = useState(true);
  
  const [sale, setSale] = useState({
    description: "",
    quantity: 1,
    unitPrice: 0,
    observations: ""
  });

  useEffect(() => {
    if (!user) return;
    
    setIsOwner(user.role === "owner");
    
    // Check if seller is linked to an owner
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
        }
      } catch (error) {
        console.error("Error checking seller team:", error);
      } finally {
        setIsCheckingTeam(false);
      }
    };
    
    checkSellerTeam();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSale({
      ...sale,
      [name]: name === "quantity" || name === "unitPrice" ? parseFloat(value) || 0 : value
    });
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
    
    setIsLoading(true);
    try {
      // Calculate total price and commission
      const totalPrice = sale.quantity * sale.unitPrice;
      
      // Default commission rate (10%)
      const commissionRate = 10;
      const commission = totalPrice * (commissionRate / 100);
      
      const { data, error } = await supabase
        .from('sales')
        .insert({
          date: new Date().toISOString(),
          description: sale.description,
          quantity: sale.quantity,
          unit_price: sale.unitPrice,
          total_price: totalPrice,
          seller_id: user.id,
          seller_name: user.name,
          commission: commission,
          commission_rate: commissionRate,
          status: "pending",
          observations: sale.observations
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
            data.id
          );
        }
      }
      
      toast({
        title: "Venda registrada",
        description: "A venda foi registrada com sucesso."
      });
      
      navigate("/sales");
    } catch (error) {
      console.error("Error submitting sale:", error);
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

  if (!hasOwner) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Registro de Vendas Indisponível</CardTitle>
          <CardDescription>
            Você precisa estar vinculado a um proprietário para registrar vendas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-6">
            <div className="text-6xl mb-4">🔒</div>
            <p className="text-center mb-4">
              Para registrar vendas, você precisa fazer parte de um time de vendas.
              Acesse o gerenciamento de time para se vincular a um proprietário.
            </p>
            <Button onClick={() => navigate("/team")}>
              Gerenciar Time
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Venda</CardTitle>
        <CardDescription>Registre uma nova venda no sistema.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              name="description"
              value={sale.description}
              onChange={handleInputChange}
              placeholder="Descrição do produto/serviço"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                step="1"
                value={sale.quantity}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unitPrice">Preço Unitário (R$)</Label>
              <Input
                id="unitPrice"
                name="unitPrice"
                type="number"
                min="0.01"
                step="0.01"
                value={sale.unitPrice}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              name="observations"
              value={sale.observations}
              onChange={handleInputChange}
              placeholder="Observações adicionais sobre a venda"
            />
          </div>
          <div className="border p-4 rounded-md bg-muted/30">
            <div className="flex justify-between items-center">
              <Label>Valor Total:</Label>
              <span className="text-xl font-bold">
                R$ {(sale.quantity * sale.unitPrice).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <Label>Comissão Padrão (10%):</Label>
              <span>R$ {((sale.quantity * sale.unitPrice) * 0.1).toFixed(2)}</span>
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
