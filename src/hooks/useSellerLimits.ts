
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface SellerLimits {
  totalSellers: number;
  maxSellers: number;
  canAddMore: boolean;
  planName: string;
  realSellers: number;
  virtualSellers: number;
}

export function useSellerLimits() {
  const { user } = useAuth();
  const [limits, setLimits] = useState<SellerLimits | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkLimits = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      // Buscar o plano atual
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      let maxSellers = 3; // Default para plano free
      let planName = "Free";

      if (subscription && !subError) {
        maxSellers = subscription.max_sellers;
        planName = subscription.plan_name;
      }

      // Contar vendedores reais (membros da equipe)
      const { data: teamData } = await supabase.rpc(
        'get_team_members',
        { owner_id_param: user.id }
      );

      // Contar vendedores virtuais
      const { data: virtualData } = await supabase
        .from('virtual_sellers')
        .select('*')
        .eq('owner_id', user.id);

      const realSellers = teamData?.length || 0;
      const virtualSellers = virtualData?.length || 0;
      const totalSellers = realSellers + virtualSellers;
      const canAddMore = maxSellers === -1 || totalSellers < maxSellers;

      console.log('Seller limits check:', {
        realSellers,
        virtualSellers,
        totalSellers,
        maxSellers,
        canAddMore,
        planName
      });

      setLimits({
        totalSellers,
        maxSellers,
        canAddMore,
        planName,
        realSellers,
        virtualSellers
      });
    } catch (error) {
      console.error("Erro ao verificar limites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkLimits();
  }, [user]);

  const validateSellerCreation = (): boolean => {
    if (!limits) return false;

    if (!limits.canAddMore) {
      toast({
        variant: "destructive",
        title: "Limite de vendedores atingido",
        description: `Seu plano ${limits.planName} permite apenas ${limits.maxSellers} vendedores. Você já possui ${limits.totalSellers} (${limits.realSellers} reais + ${limits.virtualSellers} virtuais). Faça upgrade para adicionar mais vendedores.`
      });
      return false;
    }

    return true;
  };

  return {
    limits,
    isLoading,
    checkLimits,
    validateSellerCreation
  };
}
