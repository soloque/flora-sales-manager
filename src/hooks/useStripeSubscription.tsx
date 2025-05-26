
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface StripeSubscription {
  subscribed: boolean;
  plan: string;
  status: string;
  trial_days_left: number;
  is_annual: boolean;
}

export const useStripeSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<StripeSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    checkSubscription();
  }, [user]);

  const checkSubscription = async () => {
    if (!user) return;

    try {
      console.log('Checking subscription for user:', user.id);
      const { data, error } = await supabase.functions.invoke('check-subscription');

      if (error) {
        console.error('Error checking subscription:', error);
        throw error;
      }

      console.log('Subscription data received:', data);
      setSubscription(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
      // Em caso de erro, definir como plano free
      setSubscription({
        subscribed: false,
        plan: 'free',
        status: 'active',
        trial_days_left: 0,
        is_annual: false
      });
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async (planName: string, isAnnual: boolean = false) => {
    if (!user) return false;

    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planName, isAnnual }
      });

      if (error) throw error;

      // Abrir Stripe checkout em nova aba
      window.open(data.url, '_blank');
      
      toast({
        title: "Redirecionando para pagamento",
        description: "Você será redirecionado para o Stripe. A cobrança será feita imediatamente após a confirmação.",
      });

      return true;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        variant: "destructive",
        title: "Erro ao criar sessão de pagamento",
        description: "Não foi possível criar a sessão de pagamento. Tente novamente.",
      });
      return false;
    } finally {
      setCreating(false);
    }
  };

  const openCustomerPortal = async () => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      window.open(data.url, '_blank');
      
      toast({
        title: "Abrindo portal do cliente",
        description: "Você será redirecionado para gerenciar sua assinatura.",
      });

      return true;
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        variant: "destructive",
        title: "Erro ao abrir portal",
        description: "Não foi possível abrir o portal do cliente. Tente novamente.",
      });
      return false;
    }
  };

  const getPlanDisplayName = (): string => {
    if (!subscription) return 'Carregando...';
    
    switch (subscription.plan) {
      case 'free':
        return 'Free';
      case 'popular':
        return 'Popular';
      case 'crescimento':
        return 'Crescimento';
      case 'profissional':
        return 'Profissional';
      default:
        return subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1);
    }
  };

  const isTrialing = (): boolean => {
    return subscription?.status === 'trialing' && subscription.trial_days_left > 0;
  };

  return {
    subscription,
    loading,
    creating,
    checkSubscription,
    createCheckoutSession,
    openCustomerPortal,
    getPlanDisplayName,
    isTrialing,
  };
};
