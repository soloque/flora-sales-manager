
import { supabase } from "@/integrations/supabase/client";

export const validateAndCleanDatabase = async (userId: string) => {
  try {
    // 1. Verificar e corrigir perfis sem role
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
    }

    if (profileData && !profileData.role) {
      await supabase
        .from('profiles')
        .update({ role: 'seller' })
        .eq('id', userId);
      console.log('Fixed profile without role');
    }

    // 2. Limpar solicitações duplicadas de team
    const { data: duplicateRequests, error: requestsError } = await supabase
      .from('team_requests')
      .select('*')
      .eq('seller_id', userId)
      .eq('status', 'pending');

    if (requestsError) {
      console.error('Error fetching team requests:', requestsError);
    }

    if (duplicateRequests && duplicateRequests.length > 1) {
      // Manter apenas a mais recente
      const sortedRequests = duplicateRequests.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      const toDelete = sortedRequests.slice(1);
      for (const request of toDelete) {
        await supabase
          .from('team_requests')
          .delete()
          .eq('id', request.id);
      }
      console.log(`Cleaned ${toDelete.length} duplicate team requests`);
    }

    // 3. Verificar memberships duplicadas
    const { data: duplicateMembers, error: membersError } = await supabase
      .from('team_members')
      .select('*')
      .eq('seller_id', userId);

    if (membersError) {
      console.error('Error fetching team members:', membersError);
    }

    if (duplicateMembers && duplicateMembers.length > 1) {
      // Manter apenas a mais recente
      const sortedMembers = duplicateMembers.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      const toDelete = sortedMembers.slice(1);
      for (const member of toDelete) {
        await supabase
          .from('team_members')
          .delete()
          .eq('id', member.id);
      }
      console.log(`Cleaned ${toDelete.length} duplicate team memberships`);
    }

    // 4. Garantir que vendedor tenha assinatura
    const { data: sellerSub, error: subError } = await supabase
      .from('seller_subscriptions')
      .select('*')
      .eq('seller_id', userId)
      .maybeSingle();

    if (subError && subError.code !== 'PGRST116') {
      console.error('Error fetching seller subscription:', subError);
    }

    if (!sellerSub && profileData?.role === 'seller') {
      await supabase
        .from('seller_subscriptions')
        .insert({
          seller_id: userId,
          status: 'free',
          plan_type: 'free',
          sales_limit: 10
        });
      console.log('Created missing seller subscription');
    }

    console.log('Database validation completed');
  } catch (error) {
    console.error('Error during database validation:', error);
  }
};

export const validateTeamMembership = async (sellerId: string, ownerId: string) => {
  try {
    // Verificar se já existe membership
    const { data: existingMember, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('seller_id', sellerId)
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return !!existingMember;
  } catch (error) {
    console.error('Error validating team membership:', error);
    return false;
  }
};

export const cleanupOldTeamRequests = async (sellerId: string) => {
  try {
    // Remover solicitações antigas rejeitadas ou aprovadas
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await supabase
      .from('team_requests')
      .delete()
      .eq('seller_id', sellerId)
      .in('status', ['approved', 'rejected'])
      .lt('created_at', thirtyDaysAgo.toISOString());

    console.log('Cleaned up old team requests');
  } catch (error) {
    console.error('Error cleaning up team requests:', error);
  }
};
