
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface Subscription {
  id: string;
  user_id: string;
  status: 'trial' | 'active' | 'canceled' | 'past_due';
  plan_name: string;
  max_sellers: number;
  max_customers?: number;
  price_per_month: number;
  trial_end_date?: string;
  subscription_end_date?: string;
  has_watermark?: boolean;
  features_enabled?: string[];
  created_at: string;
  updated_at: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching subscription:', error);
          return;
        }

        if (data) {
          const subscriptionData: Subscription = {
            ...data,
            status: data.status as 'trial' | 'active' | 'canceled' | 'past_due'
          };
          setSubscription(subscriptionData);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const canAddSeller = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('can_add_seller', {
        user_id_param: user.id
      });

      if (error) {
        console.error('Error checking seller limit:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Error checking seller limit:', error);
      return false;
    }
  };

  const canAddCustomer = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('can_add_customer', {
        user_id_param: user.id
      });

      if (error) {
        console.error('Error checking customer limit:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Error checking customer limit:', error);
      return false;
    }
  };

  const isTrialExpired = (): boolean => {
    if (!subscription || subscription.status !== 'trial') return false;
    if (!subscription.trial_end_date) return false;
    
    return new Date(subscription.trial_end_date) < new Date();
  };

  const getTrialDaysLeft = (): number => {
    if (!subscription || subscription.status !== 'trial' || !subscription.trial_end_date) {
      return 0;
    }
    
    const trialEnd = new Date(subscription.trial_end_date);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  const getPlanDisplayName = (): string => {
    if (!subscription) return 'Carregando...';
    
    switch (subscription.plan_name) {
      case 'free':
        return 'Free';
      case 'popular':
        return 'Popular';
      case 'crescimento':
        return 'Crescimento';
      case 'profissional':
        return 'Profissional';
      default:
        return subscription.plan_name.charAt(0).toUpperCase() + subscription.plan_name.slice(1);
    }
  };

  return {
    subscription,
    loading,
    canAddSeller,
    canAddCustomer,
    isTrialExpired,
    getTrialDaysLeft,
    getPlanDisplayName,
  };
};
