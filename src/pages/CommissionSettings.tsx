
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { User } from "@/types";

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

const CommissionSettings = () => {
  const { user } = useAuth();
  const isOwner = user?.role === "owner";
  const [defaultRate, setDefaultRate] = useState<number>(20);
  const [sellerRates, setSellerRates] = useState<Record<string, number>>({});
  const [sellers, setSellers] = useState<User[]>([]);

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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings}>Salvar Configurações</Button>
      </div>
    </div>
  );
};

export default CommissionSettings;
