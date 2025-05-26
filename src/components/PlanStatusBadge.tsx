
import { Badge } from "@/components/ui/badge";
import { Crown, Users, Zap, Clock } from "lucide-react";
import { useStripeSubscription } from "@/hooks/useStripeSubscription";
import { useSellerSubscription } from "@/hooks/useSellerSubscription";
import { useAuth } from "@/context/AuthContext";

const PlanStatusBadge = () => {
  const { user } = useAuth();
  const { subscription, loading: stripeLoading, getPlanDisplayName, isTrialing } = useStripeSubscription();
  const { subscriptionInfo, loading: sellerLoading } = useSellerSubscription();

  // Para owners, usar Stripe subscription
  if (user?.role === "owner") {
    if (stripeLoading) {
      return (
        <Badge variant="secondary" className="ml-2">
          <Clock className="h-3 w-3 mr-1" />
          Carregando...
        </Badge>
      );
    }

    // Se não tem subscription ainda, mostrar carregando
    if (!subscription) {
      return (
        <Badge variant="secondary" className="ml-2">
          <Clock className="h-3 w-3 mr-1" />
          Carregando...
        </Badge>
      );
    }

    const getIcon = () => {
      switch (subscription.plan) {
        case 'popular':
          return <Zap className="h-3 w-3 mr-1" />;
        case 'crescimento':
          return <Users className="h-3 w-3 mr-1" />;
        case 'profissional':
          return <Crown className="h-3 w-3 mr-1" />;
        default:
          return <Users className="h-3 w-3 mr-1" />;
      }
    };

    const getVariant = () => {
      if (subscription.plan === 'free') return 'outline';
      if (isTrialing()) return 'default';
      return subscription.subscribed ? 'default' : 'secondary';
    };

    const getLabel = () => {
      const planName = getPlanDisplayName();
      if (isTrialing()) {
        return `${planName} (${subscription.trial_days_left}d trial)`;
      }
      if (subscription.is_annual && subscription.plan !== 'free') {
        return `${planName} (Anual)`;
      }
      return planName;
    };

    return (
      <Badge variant={getVariant()} className="ml-2">
        {getIcon()}
        {getLabel()}
      </Badge>
    );
  }

  // Para sellers, usar seller subscription info
  if (sellerLoading) {
    return (
      <Badge variant="secondary" className="ml-2">
        <Clock className="h-3 w-3 mr-1" />
        Carregando...
      </Badge>
    );
  }

  if (!subscriptionInfo) {
    return (
      <Badge variant="outline" className="ml-2">
        <Users className="h-3 w-3 mr-1" />
        Sem Plano
      </Badge>
    );
  }

  const getSellerIcon = () => {
    if (subscriptionInfo.isTeamMember) {
      return <Crown className="h-3 w-3 mr-1" />;
    }
    if (subscriptionInfo.subscriptionStatus === 'paid') {
      return <Zap className="h-3 w-3 mr-1" />;
    }
    return <Users className="h-3 w-3 mr-1" />;
  };

  const getSellerVariant = () => {
    if (subscriptionInfo.isTeamMember) return 'default';
    if (subscriptionInfo.subscriptionStatus === 'paid') return 'default';
    return 'outline';
  };

  const getSellerLabel = () => {
    if (subscriptionInfo.isTeamMember) {
      return 'Membro de Time';
    }
    if (subscriptionInfo.subscriptionStatus === 'paid') {
      return 'Plano Pago';
    }
    return 'Plano Gratuito';
  };

  return (
    <Badge variant={getSellerVariant()} className="ml-2">
      {getSellerIcon()}
      {getSellerLabel()}
    </Badge>
  );
};

export default PlanStatusBadge;
