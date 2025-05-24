
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
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { fetchAddressByCep } from "@/services/cepService";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  description: z.string().min(3, "Descrição deve ter pelo menos 3 caracteres"),
  quantity: z.number().int().positive("Quantidade deve ser maior que zero"),
  unitPrice: z.number().positive("Preço deve ser maior que zero"),
  customerName: z.string().min(3, "Nome do cliente é obrigatório"),
  customerPhone: z.string().min(8, "Telefone do cliente é obrigatório"),
  cep: z.string().length(8, "CEP deve ter 8 dígitos").or(z.string().length(9, "CEP deve ter 8 dígitos")),
  address: z.string().min(3, "Endereço é obrigatório"),
  city: z.string().min(2, "Cidade é obrigatória"),
  state: z.string().min(2, "Estado é obrigatório"),
  order: z.string().min(3, "Pedido é obrigatório"),
  observations: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const NewSale = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOwner, setIsOwner] = useState(false);
  const [hasOwner, setHasOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingTeam, setIsCheckingTeam] = useState(true);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      quantity: 1,
      unitPrice: 0,
      customerName: "",
      customerPhone: "",
      cep: "",
      address: "",
      city: "",
      state: "",
      order: "",
      observations: "",
    },
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
        console.error("Erro ao verificar o time do vendedor:", error);
      } finally {
        setIsCheckingTeam(false);
      }
    };
    
    checkSellerTeam();
  }, [user]);

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    
    if (cep.length !== 8) return;
    
    setIsFetchingAddress(true);
    
    try {
      const addressData = await fetchAddressByCep(cep);
      
      form.setValue('address', addressData.logradouro);
      form.setValue('city', addressData.localidade);
      form.setValue('state', addressData.uf);
      
      // Trigger validation
      form.trigger(['address', 'city', 'state']);
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

  const onSubmit = async (data: FormValues) => {
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
      const totalPrice = data.quantity * data.unitPrice;
      
      // Default commission rate (20%)
      const commissionRate = 20;
      const commission = totalPrice * (commissionRate / 100);
      
      const { data: saleData, error } = await supabase
        .from('sales')
        .insert({
          date: new Date().toISOString(),
          description: data.description,
          quantity: data.quantity,
          unit_price: data.unitPrice,
          total_price: totalPrice,
          seller_id: user.id,
          seller_name: user.name,
          commission: commission,
          commission_rate: commissionRate,
          status: "pending",
          observations: data.observations,
          customer_name: data.customerName,
          customer_phone: data.customerPhone,
          customer_address: data.address,
          customer_city: data.city,
          customer_state: data.state,
          customer_zipcode: data.cep,
          customer_order: data.order
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
              Acesse o gerenciamento de time para solicitar vínculo a um proprietário.
            </p>
            <Button onClick={() => navigate("/teams")}>
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição da Venda</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Descrição do produto/serviço"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="unitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Unitário (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Informações do Cliente</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Cliente</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome completo" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="(00) 00000-0000" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            {...field} 
                            placeholder="00000-000" 
                            onBlur={handleCepBlur} 
                          />
                          {isFetchingAddress && (
                            <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-3" />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Rua, número, complemento" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pedido</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Descrição do pedido" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="observations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Observações adicionais sobre a venda"
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="border p-4 rounded-md bg-muted/30">
              <div className="flex justify-between items-center">
                <Label>Valor Total:</Label>
                <span className="text-xl font-bold">
                  R$ {((form.watch("quantity") || 0) * (form.watch("unitPrice") || 0)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <Label>Comissão ({isOwner ? 'personalizada' : 'padrão'}) (20%):</Label>
                <span>
                  R$ {((form.watch("quantity") || 0) * (form.watch("unitPrice") || 0) * 0.2).toFixed(2)}
                </span>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                {!isOwner && "Apenas o proprietário pode ajustar a taxa de comissão."}
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
      </Form>
    </Card>
  );
};

export default NewSale;
