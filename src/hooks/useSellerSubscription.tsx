
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface SellerSubscriptionInfo {
  isTeamMember: boolean;
  subscriptionStatus: string;
  planType: string;
  salesUsed: number;
  salesLimit: number;
  canRegister: boolean;
}

export const useSellerSubscription = () => {
  const { user } = useAuth();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SellerSubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchSubscriptionInfo = async () => {
      try {
        const { data, error } = await supabase.rpc('get_seller_subscription_info', {
          seller_id_param: user.id
        });

        if (error) throw error;

        if (data && data.length > 0) {
          const info = data[0];
          setSubscriptionInfo({
            isTeamMember: info.is_team_member,
            subscriptionStatus: info.subscription_status,
            planType: info.plan_type,
            salesUsed: info.sales_used,
            salesLimit: info.sales_limit,
            canRegister: info.can_register
          });
        }
      } catch (error) {
        console.error('Error fetching seller subscription info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionInfo();
  }, [user]);

  const checkCanRegisterSale = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('can_register_sale', {
        seller_id_param: user.id
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking sale registration permission:', error);
      return false;
    }
  };

  return {
    subscriptionInfo,
    loading,
    checkCanRegisterSale,
  };
};
