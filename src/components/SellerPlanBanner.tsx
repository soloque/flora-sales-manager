
import { useSellerSubscription } from "@/hooks/useSellerSubscription";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle } from "lucide-react";
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

  // Plano gratuito - mostrar apenas link discreto
  return (
    <div className="mb-4 text-center">
      <p className="text-sm text-muted-foreground">
        Plano gratuito • {subscriptionInfo.salesUsed} de {subscriptionInfo.salesLimit} vendas utilizadas • {" "}
        <Link to="/pricing" className="text-primary hover:underline">
          Fazer upgrade
        </Link>
      </p>
    </div>
  );
};

export default SellerPlanBanner;
