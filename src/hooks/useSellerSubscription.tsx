
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
        // First check if user is a team member
        const { data: teamData, error: teamError } = await supabase
          .from('team_members')
          .select('owner_id')
          .eq('seller_id', user.id)
          .maybeSingle();

        if (teamError && teamError.code !== 'PGRST116') {
          throw teamError;
        }

        const isTeamMember = !!teamData;

        // Get sales count
        const { count: salesCount, error: salesError } = await supabase
          .from('sales')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', user.id);

        if (salesError) {
          throw salesError;
        }

        const salesUsed = salesCount || 0;

        if (isTeamMember) {
          setSubscriptionInfo({
            isTeamMember: true,
            subscriptionStatus: 'team_member',
            planType: 'unlimited',
            salesUsed,
            salesLimit: -1,
            canRegister: true
          });
        } else {
          // Check seller subscription
          const { data: subData, error: subError } = await supabase
            .from('seller_subscriptions')
            .select('*')
            .eq('seller_id', user.id)
            .maybeSingle();

          if (subError && subError.code !== 'PGRST116') {
            throw subError;
          }

          if (!subData) {
            // Create default free subscription
            const { error: insertError } = await supabase
              .from('seller_subscriptions')
              .insert({
                seller_id: user.id,
                status: 'free',
                plan_type: 'free',
                sales_limit: 10
              });

            if (insertError) {
              console.error('Error creating seller subscription:', insertError);
            }

            setSubscriptionInfo({
              isTeamMember: false,
              subscriptionStatus: 'free',
              planType: 'free',
              salesUsed,
              salesLimit: 10,
              canRegister: salesUsed < 10
            });
          } else {
            setSubscriptionInfo({
              isTeamMember: false,
              subscriptionStatus: subData.status,
              planType: subData.plan_type,
              salesUsed,
              salesLimit: subData.sales_limit,
              canRegister: subData.status === 'paid' || salesUsed < subData.sales_limit
            });
          }
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
      // Check if user is team member
      const { data: teamData, error: teamError } = await supabase
        .from('team_members')
        .select('owner_id')
        .eq('seller_id', user.id)
        .maybeSingle();

      if (teamError && teamError.code !== 'PGRST116') {
        throw teamError;
      }

      if (teamData) {
        return true; // Team members can always register sales
      }

      // Check seller subscription and sales count
      const { data: subData, error: subError } = await supabase
        .from('seller_subscriptions')
        .select('*')
        .eq('seller_id', user.id)
        .maybeSingle();

      if (subError && subError.code !== 'PGRST116') {
        throw subError;
      }

      const { count: salesCount, error: salesError } = await supabase
        .from('sales')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user.id);

      if (salesError) {
        throw salesError;
      }

      const salesUsed = salesCount || 0;

      if (!subData) {
        return salesUsed < 10; // Default free limit
      }

      return subData.status === 'paid' || salesUsed < subData.sales_limit;
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
