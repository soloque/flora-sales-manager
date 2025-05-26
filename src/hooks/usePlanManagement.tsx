
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface CurrentPlan {
  planName: string;
  maxSellers: number;
  pricePerMonth: number;
  status: string;
  canUpgradeToPopular: boolean;
  canUpgradeToCrescimento: boolean;
  canUpgradeToProfissional: boolean;
}

export const usePlanManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentPlan, setCurrentPlan] = useState<CurrentPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchCurrentPlan();
  }, [user]);

  const fetchCurrentPlan = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('get_user_current_plan', {
        user_id_param: user.id
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const plan = data[0];
        setCurrentPlan({
          planName: plan.plan_name,
          maxSellers: plan.max_sellers,
          pricePerMonth: plan.price_per_month,
          status: plan.status,
          canUpgradeToPopular: plan.can_upgrade_to_popular,
          canUpgradeToCrescimento: plan.can_upgrade_to_crescimento,
          canUpgradeToProfissional: plan.can_upgrade_to_profissional,
        });
      }
    } catch (error) {
      console.error('Error fetching current plan:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar plano",
        description: "Não foi possível carregar as informações do seu plano atual.",
      });
    } finally {
      setLoading(false);
    }
  };

  const upgradePlan = async (newPlan: string) => {
    if (!user) return false;

    setUpgrading(true);
    try {
      console.log(`Upgrading plan to: ${newPlan} for user: ${user.id}`);
      
      // Se for para o plano free, também cancelar no Stripe se existir
      if (newPlan === "free") {
        try {
          // Tentar cancelar assinatura do Stripe
          const { error: stripeError } = await supabase.functions.invoke('customer-portal');
          // Não falhar se não conseguir cancelar no Stripe
          if (stripeError) {
            console.log('Stripe cancellation not available or already cancelled');
          }
        } catch (stripeError) {
          console.log('Stripe cancellation error:', stripeError);
        }
      }

      const { error } = await supabase.rpc('upgrade_user_plan', {
        user_id_param: user.id,
        new_plan_name_param: newPlan
      });

      if (error) {
        console.error('Database upgrade error:', error);
        throw error;
      }

      console.log(`Successfully upgraded to ${newPlan}`);
      await fetchCurrentPlan();
      
      toast({
        title: "Plano atualizado com sucesso!",
        description: `Seu plano foi alterado para ${getPlanDisplayName(newPlan)}.`,
      });

      return true;
    } catch (error) {
      console.error('Error upgrading plan:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar plano",
        description: "Não foi possível atualizar seu plano. Tente novamente.",
      });
      return false;
    } finally {
      setUpgrading(false);
    }
  };

  const getPlanDisplayName = (planName: string): string => {
    switch (planName) {
      case 'free':
        return 'Free';
      case 'popular':
        return 'Popular';
      case 'crescimento':
        return 'Crescimento';
      case 'profissional':
        return 'Profissional';
      default:
        return planName;
    }
  };

  const getPlanPrice = (planName: string): string => {
    switch (planName) {
      case 'free':
        return 'Grátis';
      case 'popular':
        return 'R$ 100/mês';
      case 'crescimento':
        return 'R$ 200/mês';
      case 'profissional':
        return 'R$ 600/mês';
      default:
        return 'N/A';
    }
  };

  return {
    currentPlan,
    loading,
    upgrading,
    upgradePlan,
    getPlanDisplayName,
    getPlanPrice,
    refreshPlan: fetchCurrentPlan,
  };
};
