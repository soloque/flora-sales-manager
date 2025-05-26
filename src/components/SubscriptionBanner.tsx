
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CreditCard, Users } from "lucide-react";
import { Link } from "react-router-dom";

const SubscriptionBanner = () => {
  const { subscription, loading, isTrialExpired, getTrialDaysLeft } = useSubscription();

  if (loading || !subscription) return null;

  const trialDaysLeft = getTrialDaysLeft();
  const isExpired = isTrialExpired();

  if (subscription.status === 'active') {
    return (
      <Card className="mb-6 border-green-200 bg-green-50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">
                  Plano {subscription.plan_name.charAt(0).toUpperCase() + subscription.plan_name.slice(1)} Ativo
                </p>
                <p className="text-sm text-green-600">
                  Até {subscription.max_sellers} vendedores • R$ {(subscription.price_per_month / 100).toFixed(0)}/mês
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

  if (subscription.status === 'trial' && !isExpired) {
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
                  {trialDaysLeft} dias restantes • Até {subscription.max_sellers} vendedores
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
    );
  }
};

export default SubscriptionBanner;
