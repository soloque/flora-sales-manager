
import { useSellerSubscription } from "@/hooks/useSellerSubscription";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, AlertTriangle, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const SellerPlanBanner = () => {
  const { subscriptionInfo, loading } = useSellerSubscription();

  if (loading || !subscriptionInfo) return null;

  // Se é membro de time, mostrar banner de sucesso
  if (subscriptionInfo.isTeamMember) {
    return (
      <Card className="mb-6 border-green-200 bg-green-50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">
                  Membro de Time - Vendas Ilimitadas
                </p>
                <p className="text-sm text-green-600">
                  Você está vinculado a um proprietário e pode registrar vendas ilimitadamente
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Ilimitado
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Se tem plano pago
  if (subscriptionInfo.subscriptionStatus === 'paid') {
    return (
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">
                  Plano Pago Ativo - Vendas Ilimitadas
                </p>
                <p className="text-sm text-blue-600">
                  R$ 200/mês • Registro de vendas ilimitado
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Pago
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Plano gratuito - mostrar limite
  const isNearLimit = subscriptionInfo.salesUsed >= subscriptionInfo.salesLimit * 0.8;
  const isAtLimit = subscriptionInfo.salesUsed >= subscriptionInfo.salesLimit;

  return (
    <Card className={`mb-6 ${isAtLimit ? 'border-red-200 bg-red-50' : isNearLimit ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isAtLimit ? (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            ) : (
              <Users className="h-5 w-5 text-gray-600" />
            )}
            <div>
              <p className={`font-medium ${isAtLimit ? 'text-red-800' : isNearLimit ? 'text-yellow-800' : 'text-gray-800'}`}>
                {isAtLimit ? 'Limite de Vendas Atingido' : 'Plano Gratuito'}
              </p>
              <p className={`text-sm ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-gray-600'}`}>
                {subscriptionInfo.salesUsed} de {subscriptionInfo.salesLimit} vendas utilizadas
                {isAtLimit && ' • Upgrade necessário para continuar'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={isAtLimit ? "destructive" : "secondary"}>
              {subscriptionInfo.salesUsed}/{subscriptionInfo.salesLimit}
            </Badge>
            {(isNearLimit || isAtLimit) && (
              <Button asChild size="sm" variant={isAtLimit ? "destructive" : "default"}>
                <Link to="/pricing">
                  {isAtLimit ? 'Upgrade Obrigatório' : 'Upgrade'}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SellerPlanBanner;
