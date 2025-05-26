
import { Badge } from "@/components/ui/badge";
import { Crown, Users, Zap, Clock } from "lucide-react";
import { useStripeSubscription } from "@/hooks/useStripeSubscription";

const PlanStatusBadge = () => {
  const { subscription, loading, getPlanDisplayName, isTrialing } = useStripeSubscription();

  if (loading || !subscription) {
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
};

export default PlanStatusBadge;
