
import { useSellerSubscription } from "@/hooks/useSellerSubscription";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CreditCard, Users, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const SellerPlanBanner = () => {
  const { subscriptionInfo, loading } = useSellerSubscription();

  if (loading || !subscriptionInfo) return null;

  // If seller is part of a team, show team status
  if (subscriptionInfo.isTeamMember) {
    return (
      <Card className="mb-6 border-green-200 bg-green-50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">
                  Membro de Equipe
                </p>
                <p className="text-sm text-green-600">
                  Vendas ilimitadas através da equipe • {subscriptionInfo.salesUsed} vendas registradas
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Ativo
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show subscription status for individual sellers
  if (subscriptionInfo.subscriptionStatus === 'paid') {
    return (
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">
                  Plano {subscriptionInfo.planType.charAt(0).toUpperCase() + subscriptionInfo.planType.slice(1)} Ativo
                </p>
                <p className="text-sm text-blue-600">
                  Vendas ilimitadas • {subscriptionInfo.salesUsed} vendas registradas
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Ativo
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show free plan with usage
  const canRegister = subscriptionInfo.canRegister;
  const usagePercent = (subscriptionInfo.salesUsed / subscriptionInfo.salesLimit) * 100;

  return (
    <Card className={`mb-6 ${canRegister ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50'}`}>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className={`h-5 w-5 ${canRegister ? 'text-yellow-600' : 'text-red-600'}`} />
            <div>
              <p className={`font-medium ${canRegister ? 'text-yellow-800' : 'text-red-800'}`}>
                Plano Gratuito {!canRegister && '- Limite Atingido'}
              </p>
              <p className={`text-sm ${canRegister ? 'text-yellow-600' : 'text-red-600'}`}>
                {subscriptionInfo.salesUsed} de {subscriptionInfo.salesLimit} vendas utilizadas ({usagePercent.toFixed(0)}%)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={canRegister ? "secondary" : "destructive"} className={canRegister ? "bg-yellow-100 text-yellow-800" : ""}>
              {canRegister ? "Ativo" : "Limite Atingido"}
            </Badge>
            {!canRegister && (
              <Button asChild size="sm">
                <Link to="/pricing">
                  Fazer Upgrade
                </Link>
              </Button>
            )}
          </div>
        </div>
        
        {usagePercent >= 80 && canRegister && (
          <div className="mt-3 p-2 bg-yellow-100 rounded-md">
            <p className="text-xs text-yellow-800">
              ⚠️ Você está próximo do limite do plano gratuito. Considere fazer upgrade para continuar registrando vendas.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SellerPlanBanner;
