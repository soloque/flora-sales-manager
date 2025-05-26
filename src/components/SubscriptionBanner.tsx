
import { useSubscription } from "@/hooks/useSubscription";
import { useStripeSubscription } from "@/hooks/useStripeSubscription";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CreditCard, Users } from "lucide-react";
import { Link } from "react-router-dom";

const SubscriptionBanner = () => {
  const { subscription, loading, isTrialExpired, getTrialDaysLeft } = useSubscription();
  const { subscription: stripeSubscription, loading: stripeLoading } = useStripeSubscription();

  if (loading || stripeLoading) return null;

  // Use Stripe data if available and subscribed, otherwise use local subscription data
  const activeSubscription = stripeSubscription?.subscribed ? {
    status: stripeSubscription.status === 'active' || stripeSubscription.status === 'trialing' ? 'active' : 'trial',
    plan_name: stripeSubscription.plan,
    max_sellers: stripeSubscription.plan === 'popular' ? 10 : 
                 stripeSubscription.plan === 'crescimento' ? 20 : 
                 stripeSubscription.plan === 'profissional' ? -1 : 3,
    price_per_month: stripeSubscription.plan === 'popular' ? 10000 : 
                     stripeSubscription.plan === 'crescimento' ? 20000 : 
                     stripeSubscription.plan === 'profissional' ? 60000 : 0,
    trial_days_left: stripeSubscription.trial_days_left
  } : subscription;

  if (!activeSubscription) return null;

  const trialDaysLeft = stripeSubscription?.subscribed ? stripeSubscription.trial_days_left : getTrialDaysLeft();
  const isExpired = stripeSubscription?.subscribed ? false : isTrialExpired();

  if (activeSubscription.status === 'active' && (!stripeSubscription?.subscribed || stripeSubscription.status === 'active')) {
    return (
      <Card className="mb-6 border-green-200 bg-green-50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">
                  Plano {activeSubscription.plan_name.charAt(0).toUpperCase() + activeSubscription.plan_name.slice(1)} Ativo
                </p>
                <p className="text-sm text-green-600">
                  {activeSubscription.max_sellers === -1 ? 'Vendedores ilimitados' : `Até ${activeSubscription.max_sellers} vendedores`} • R$ {(activeSubscription.price_per_month / 100).toFixed(0)}/mês
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Ativo
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (stripeSubscription?.subscribed && stripeSubscription.status === 'trialing') {
    return (
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">
                  Período de Teste - Plano {activeSubscription.plan_name.charAt(0).toUpperCase() + activeSubscription.plan_name.slice(1)}
                </p>
                <p className="text-sm text-blue-600">
                  {trialDaysLeft} dias restantes • {activeSubscription.max_sellers === -1 ? 'Vendedores ilimitados' : `Até ${activeSubscription.max_sellers} vendedores`}
                </p>
              </div>
            </div>
            <Button asChild size="sm">
              <Link to="/plan-management">
                Gerenciar Plano
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeSubscription.status === 'trial' && !isExpired) {
    return (
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">
                  Período de Teste Gratuito
                </p>
                <p className="text-sm text-blue-600">
                  {trialDaysLeft} dias restantes • Até {activeSubscription.max_sellers} vendedores
                </p>
              </div>
            </div>
            <Button asChild size="sm">
              <Link to="/pricing">
                Escolher Plano
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Trial expired or other status
  return (
    <Card className="mb-6 border-red-200 bg-red-50">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-red-800">
                {isExpired ? "Período de Teste Expirado" : "Assinatura Inativa"}
              </p>
              <p className="text-sm text-red-600">
                Escolha um plano para continuar usando o sistema
              </p>
            </div>
          </div>
          <Button asChild size="sm" variant="destructive">
            <Link to="/pricing">
              Reativar Conta
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionBanner;
