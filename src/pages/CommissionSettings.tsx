
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
import { User, CommissionSettings as CommissionSettingsType } from "@/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
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

// Mock sellers for demonstration
const mockSellers: User[] = [
  {
    id: "2",
    name: "Gabriel Silva",
    email: "seller@example.com",
    role: "seller",
    createdAt: new Date(),
  },
  {
    id: "3",
    name: "Marina Oliveira",
    email: "marina@example.com",
    role: "seller",
    createdAt: new Date(),
  },
  {
    id: "4",
    name: "Ricardo Almeida",
    email: "ricardo@example.com",
    role: "seller",
    createdAt: new Date(),
  },
];

// Mock sales data for performance chart
const mockSellerPerformance = [
  { name: "Gabriel Silva", value: 42, sales: 15 },
  { name: "Marina Oliveira", value: 28, sales: 10 },
  { name: "Ricardo Almeida", value: 30, sales: 11 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"];

const CommissionSettings = () => {
  const { user } = useAuth();
  const isOwner = user?.role === "owner";
  const [defaultRate, setDefaultRate] = useState<number>(20);
  const [sellerRates, setSellerRates] = useState<Record<string, number>>({});
  const [sellers, setSellers] = useState<User[]>([]);
  const [newSeller, setNewSeller] = useState({ name: "", email: "" });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [sellerToRemove, setSellerToRemove] = useState<User | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  useEffect(() => {
    // In a real app, this would fetch data from an API
    // For now, we'll use mock data
    if (isOwner) {
      setSellers(mockSellers);
      
      // Initialize with default rates for each seller
      const initialRates: Record<string, number> = {};
      mockSellers.forEach((seller) => {
        initialRates[seller.id] = 20; // Default 20%
      });
      setSellerRates(initialRates);
    }
  }, [isOwner]);

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

  const handleSaveSettings = () => {
    // In a real app, this would save to an API/database
    toast({
      title: "Configurações salvas",
      description: "As taxas de comissão foram atualizadas com sucesso.",
    });
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
      // In a real app, this would deactivate the user in the database
      const updatedSellers = sellers.filter(seller => seller.id !== sellerToRemove.id);
      setSellers(updatedSellers);
      
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
          <div className="h-[300px]">
            <ChartContainer 
              config={{
                sales: { label: "Vendas" },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockSellerPerformance}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mockSellerPerformance.map((entry, index) => (
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
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="font-medium">{data.name}</div>
                            <div className="text-xs text-muted-foreground">Vendas: {data.sales}</div>
                            <div className="text-xs">
                              Participação: {((data.value / mockSellerPerformance.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)}%
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
            </ChartContainer>
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

          {/* Add Seller Button */}
          <div className="flex justify-end">
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Adicionar Vendedor</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Vendedor</DialogTitle>
                  <DialogDescription>
                    Preencha os detalhes do novo vendedor. Eles receberão um convite por email.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={newSeller.name}
                      onChange={(e) => setNewSeller({ ...newSeller, name: e.target.value })}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newSeller.email}
                      onChange={(e) => setNewSeller({ ...newSeller, email: e.target.value })}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddSeller}>Adicionar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

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
          <Button onClick={handleSaveSettings} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            <span>Salvar Configurações</span>
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
