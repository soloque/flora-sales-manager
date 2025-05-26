
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface Seller {
  id: string;
  name: string;
  email: string;
  type: string;
  is_virtual: boolean;
}

interface SellerSelectorProps {
  value: string;
  onChange: (sellerId: string, sellerName: string, isVirtual: boolean) => void;
  label?: string;
}

export function SellerSelector({ value, onChange, label = "Vendedor" }: SellerSelectorProps) {
  const { user } = useAuth();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "owner") {
      fetchSellers();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchSellers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .rpc('get_assignable_sellers', { 
          owner_id_param: user.id 
        });

      if (error) throw error;

      setSellers(data || []);
    } catch (error) {
      console.error("Erro ao buscar vendedores:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Se não é owner, não mostra o seletor
  if (user?.role !== "owner") {
    return null;
  }

  const handleSellerChange = (sellerId: string) => {
    const selectedSeller = sellers.find(s => s.id === sellerId);
    if (selectedSeller) {
      onChange(sellerId, selectedSeller.name, selectedSeller.is_virtual);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="seller">{label} *</Label>
      <Select value={value} onValueChange={handleSellerChange}>
        <SelectTrigger>
          <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione um vendedor"} />
        </SelectTrigger>
        <SelectContent>
          {sellers.map((seller) => (
            <SelectItem key={seller.id} value={seller.id}>
              <div className="flex items-center gap-2">
                <span>{seller.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({seller.is_virtual ? "Virtual" : "Membro da equipe"})
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
