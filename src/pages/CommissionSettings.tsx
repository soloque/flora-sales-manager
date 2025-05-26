import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { User, CommissionSettings as CommissionSettingsType, UserRole } from "@/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { UserPlus, UserMinus, Save, Trash2 } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

// Colors for the performance chart
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"];

const CommissionSettings = () => {
  const { user } = useAuth();
  const isOwner = user?.role === "owner";
  const [defaultRate, setDefaultRate] = useState<number>(20); // Changed default to 20%
  const [sellerRates, setSellerRates] = useState<Record<string, number>>({});
  const [sellers, setSellers] = useState<User[]>([]);
  const [sellerPerformance, setSellerPerformance] = useState<any[]>([]);
  const [newSeller, setNewSeller] = useState({ name: "", email: "" });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [sellerToRemove, setSellerToRemove] = useState<User | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  useEffect(() => {
    if (isOwner) {
      fetchSettings();
      fetchSellers();
      fetchSalesData();
    }
  }, [isOwner]);

  const fetchSettings = async () => {
    try {
      // Get commission settings
      const { data: settings, error } = await supabase
        .from('commission_settings')
        .select('*')
        .eq('owner_id', user?.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching commission settings:", error);
        return;
      }
      
      if (settings) {
        setDefaultRate(settings.default_rate || 20);
        setSettingsId(settings.id);
        
        // Get seller-specific rates
        const { data: sellerRatesData, error: sellerRatesError } = await supabase
          .from('seller_commission_rates')
          .select('*')
          .eq('settings_id', settings.id);
        
        if (sellerRatesError) {
          console.error("Error fetching seller rates:", sellerRatesError);
          return;
        }
        
        if (sellerRatesData) {
          const rates: Record<string, number> = {};
          sellerRatesData.forEach((rate) => {
            rates[rate.seller_id] = rate.rate;
          });
          setSellerRates(rates);
        }
      } else {
        // Create default settings if none exist
        const { data: newSettings, error: createError } = await supabase
          .from('commission_settings')
          .insert({
            owner_id: user?.id,
            default_rate: 20
          })
          .select()
          .single();
        
        if (createError) {
          console.error("Error creating commission settings:", createError);
          return;
        }
        
        if (newSettings) {
          setSettingsId(newSettings.id);
          setDefaultRate(newSettings.default_rate || 20);
        }
      }
    } catch (error) {
      console.error("Error in fetchSettings:", error);
    }
  };

  const fetchSellers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['seller', 'inactive']);
      
      if (error) {
        console.error("Error fetching sellers:", error);
        return;
      }
      
      if (data) {
        const formattedSellers: User[] = data.map(profile => ({
          id: profile.id,
          name: profile.name || "Sem nome",
          email: profile.email || "Sem email",
          role: profile.role as UserRole,
          createdAt: new Date(profile.created_at),
          avatar_url: profile.avatar_url
        }));
        
        setSellers(formattedSellers);
      }
    } catch (error) {
      console.error("Error in fetchSellers:", error);
    }
  };

  const fetchSalesData = async () => {
    try {
      // Get all sales
      const { data: salesData, error } = await supabase
        .from('sales')
        .select('*');
      
      if (error) {
        console.error("Error fetching sales:", error);
        return;
      }
      
      if (salesData && salesData.length > 0) {
        // Get all sellers
        const { data: sellersData, error: sellersError } = await supabase
          .from('profiles')
          .select('*')
          .in('role', ['seller']);
        
        if (sellersError) {
          console.error("Error fetching sellers for performance:", sellersError);
          return;
        }
        
        if (sellersData) {
          // Calculate performance data
          const performance = sellersData.map(seller => {
            const sellerSales = salesData.filter(sale => sale.seller_id === seller.id);
            const totalValue = sellerSales.reduce((sum, sale) => sum + (sale.total_price || 0), 0);
            
            return {
              name: seller.name || "Sem nome",
              value: totalValue,
              sales: sellerSales.length
            };
          }).filter(seller => seller.sales > 0); // Only include sellers with sales
          
          setSellerPerformance(performance);
        }
      }
    } catch (error) {
      console.error("Error in fetchSalesData:", error);
    }
  };

  const handleDefaultRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setDefaultRate(value);
    }
  };

  const handleSellerRateChange = (sellerId: string, value: string) => {
    const rate = parseFloat(value);
    if (!isNaN(rate) && rate >= 0 && rate <= 100) {
      setSellerRates((prev) => ({ ...prev, [sellerId]: rate }));
    }
  };

  const handleApplyDefaultToAll = () => {
    const newRates: Record<string, number> = {};
    sellers.forEach((seller) => {
      newRates[seller.id] = defaultRate;
    });
    setSellerRates(newRates);
    toast({
      title: "Taxas de comissão atualizadas",
      description: `A taxa padrão de ${defaultRate}% foi aplicada a todos os vendedores.`,
    });
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Update or create commission settings
      if (settingsId) {
        await supabase
          .from('commission_settings')
          .update({
            default_rate: defaultRate,
            updated_at: new Date().toISOString()
          })
          .eq('id', settingsId);
      } else {
        const { data, error } = await supabase
          .from('commission_settings')
          .insert({
            owner_id: user?.id,
            default_rate: defaultRate
          })
          .select()
          .single();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setSettingsId(data.id);
        }
      }
      
      // Update or create seller-specific rates
      if (settingsId) {
        // First, delete existing rates
        await supabase
          .from('seller_commission_rates')
          .delete()
          .eq('settings_id', settingsId);
        
        // Then insert new rates
        const ratesToInsert = Object.entries(sellerRates).map(([sellerId, rate]) => ({
          settings_id: settingsId,
          seller_id: sellerId,
          rate: rate
        }));
        
        if (ratesToInsert.length > 0) {
          await supabase
            .from('seller_commission_rates')
            .insert(ratesToInsert);
        }
      }
      
      toast({
        title: "Configurações salvas",
        description: "As taxas de comissão foram atualizadas com sucesso.",
      });
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast({
        title: "Erro ao salvar configurações",
        description: error.message || "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSeller = () => {
    if (newSeller.name && newSeller.email) {
      // In a real app, this would create a new user in the database
      const newUser: User = {
        id: `new-${Date.now()}`,
        name: newSeller.name,
        email: newSeller.email,
        role: "seller",
        createdAt: new Date(),
      };
      
      setSellers([...sellers, newUser]);
      setSellerRates((prev) => ({ ...prev, [newUser.id]: defaultRate }));
      setNewSeller({ name: "", email: "" });
      setShowAddDialog(false);
      
      toast({
        title: "Vendedor adicionado",
        description: `${newSeller.name} foi adicionado como vendedor.`,
      });
    }
  };

  const handleRemoveSeller = () => {
    if (sellerToRemove) {
      // Remove seller from the UI
      const updatedSellers = sellers.filter(seller => seller.id !== sellerToRemove.id);
      setSellers(updatedSellers);
      
      // Remove seller's commission rate
      const updatedRates = { ...sellerRates };
      delete updatedRates[sellerToRemove.id];
      setSellerRates(updatedRates);
      
      setSellerToRemove(null);
      setShowRemoveDialog(false);
      
      toast({
        title: "Vendedor removido",
        description: `${sellerToRemove.name} foi removido da sua equipe.`,
      });
    }
  };

  if (!isOwner) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Você não tem permissão para acessar esta página.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Seller Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Desempenho dos Vendedores</CardTitle>
          <CardDescription>
            Visualize o desempenho de cada vendedor com base nas vendas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            {sellerPerformance.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Nenhum dado de vendas disponível para exibir.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sellerPerformance}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sellerPerformance.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload?.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-md">
                            <div className="font-medium">{data.name}</div>
                            <div className="text-sm text-muted-foreground">Vendas: {data.sales}</div>
                            <div className="text-sm">
                              Valor: R$ {data.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-sm">
                              Participação: {((data.value / sellerPerformance.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)}%
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Commission Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Comissão</CardTitle>
          <CardDescription>
            Defina as taxas de comissão padrão e personalizadas para seus vendedores
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Default commission rate */}
          <div className="space-y-2">
            <Label htmlFor="default-rate">Taxa de Comissão Padrão (%)</Label>
            <div className="flex items-center gap-4">
              <Input
                id="default-rate"
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={defaultRate}
                onChange={handleDefaultRateChange}
                className="max-w-[120px]"
              />
              <Button onClick={handleApplyDefaultToAll} variant="outline">
                Aplicar para todos
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Esta é a taxa de comissão padrão que será aplicada a novos vendedores
            </p>
          </div>

          <Separator />

          {/* Individual seller rates */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Taxas de Comissão por Vendedor</h3>
            
            {sellers.length === 0 ? (
              <p className="text-muted-foreground">Nenhum vendedor cadastrado</p>
            ) : (
              <div className="space-y-4">
                {sellers.map((seller) => (
                  <div key={seller.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{seller.name}</p>
                      <p className="text-sm text-muted-foreground">{seller.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={sellerRates[seller.id] || defaultRate}
                        onChange={(e) => handleSellerRateChange(seller.id, e.target.value)}
                        className="w-[100px]"
                      />
                      <span>%</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive/90"
                        onClick={() => {
                          setSellerToRemove(seller);
                          setShowRemoveDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={handleSaveSettings} 
            className="flex items-center gap-2"
            disabled={loading}
          >
            <Save className="h-4 w-4" />
            <span>{loading ? "Salvando..." : "Salvar Configurações"}</span>
          </Button>
        </CardFooter>
      </Card>

      {/* Confirmation Dialog for Removing Sellers */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover Vendedor</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover {sellerToRemove?.name} da sua equipe? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemoveDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleRemoveSeller}>
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommissionSettings;
