
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Users, Zap } from "lucide-react";
import { usePlanManagement } from "@/hooks/usePlanManagement";

const PlanManagement = () => {
  const { 
    currentPlan, 
    loading, 
    upgrading, 
    upgradePlan, 
    getPlanDisplayName, 
    getPlanPrice 
  } = usePlanManagement();

  const availablePlans = [
    {
      name: "free",
      displayName: "Free",
      description: "Perfeito para começar",
      price: "Grátis",
      maxSellers: 3,
      icon: Users,
      features: [
        "Até 3 vendedores",
        "Vendas ilimitadas",
        "Relatórios completos",
        "Análise financeira completa",
        "Sistema de mensagens",
        "Suporte por email"
      ]
    },
    {
      name: "popular",
      displayName: "Popular",
      description: "Ideal para pequenos negócios",
      price: "R$ 100/mês",
      maxSellers: 10,
      icon: Zap,
      features: [
        "Até 10 vendedores",
        "Vendas ilimitadas",
        "Relatórios completos",
        "Análise financeira completa",
        "Sistema de mensagens",
        "Suporte prioritário"
      ]
    },
    {
      name: "crescimento",
      displayName: "Crescimento",
      description: "Para equipes em expansão",
      price: "R$ 200/mês",
      maxSellers: 20,
      icon: Users,
      features: [
        "Até 20 vendedores",
        "Vendas ilimitadas",
        "Relatórios completos",
        "Análise financeira completa",
        "Sistema de mensagens",
        "Suporte prioritário"
      ]
    },
    {
      name: "profissional",
      displayName: "Profissional",
      description: "Para grandes equipes",
      price: "R$ 600/mês",
      maxSellers: -1,
      icon: Crown,
      features: [
        "Vendedores ilimitados",
        "Vendas ilimitadas",
        "Relatórios completos",
        "Análise financeira completa",
        "Sistema de mensagens",
        "Suporte prioritário"
      ]
    }
  ];

  const canUpgrade = (planName: string): boolean => {
    if (!currentPlan) return false;
    
    switch (planName) {
      case "popular":
        return currentPlan.canUpgradeToPopular;
      case "crescimento":
        return currentPlan.canUpgradeToCrescimento;
      case "profissional":
        return currentPlan.canUpgradeToProfissional;
      default:
        return false;
    }
  };

  const isCurrentPlan = (planName: string): boolean => {
    return currentPlan?.planName === planName;
  };

  const handleUpgrade = async (planName: string) => {
    await upgradePlan(planName);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Carregando informações do plano...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      {currentPlan && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Plano Atual
                  <Badge variant="secondary">
                    {getPlanDisplayName(currentPlan.planName)}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {getPlanPrice(currentPlan.planName)} • {' '}
                  {currentPlan.maxSellers === -1 
                    ? 'Vendedores ilimitados' 
                    : `Até ${currentPlan.maxSellers} vendedores`
                  }
                </CardDescription>
              </div>
              <Badge 
                variant={currentPlan.status === 'active' ? 'default' : 'secondary'}
                className="capitalize"
              >
                {currentPlan.status === 'active' ? 'Ativo' : currentPlan.status}
              </Badge>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Planos Disponíveis</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {availablePlans.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = isCurrentPlan(plan.name);
            const canUpgradeThis = canUpgrade(plan.name);
            
            return (
              <Card 
                key={plan.name}
                className={`relative ${
                  isCurrent 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:shadow-lg transition-shadow'
                }`}
              >
                {isCurrent && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                    Plano Atual
                  </Badge>
                )}
                
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{plan.displayName}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="text-2xl font-bold text-primary">
                    {plan.price}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    variant={isCurrent ? "secondary" : "default"}
                    className="w-full"
                    disabled={isCurrent || !canUpgradeThis || upgrading}
                    onClick={() => handleUpgrade(plan.name)}
                  >
                    {upgrading ? "Processando..." : 
                     isCurrent ? "Plano Atual" : 
                     canUpgradeThis ? `Fazer Upgrade` : "Não Disponível"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Plan Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações dos Planos</CardTitle>
          <CardDescription>
            Todos os planos incluem recursos completos. A única diferença é a quantidade de vendedores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Recursos Inclusos em Todos os Planos:</h4>
              <ul className="space-y-1 text-sm">
                <li>✅ Vendas ilimitadas</li>
                <li>✅ Relatórios completos</li>
                <li>✅ Análise financeira completa</li>
                <li>✅ Sistema de mensagens</li>
                <li>✅ Controle de comissões</li>
                <li>✅ Interface moderna e responsiva</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Política de Mudanças:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Você pode fazer upgrade a qualquer momento</li>
                <li>• Downgrades são aplicados no próximo ciclo</li>
                <li>• O plano Free é sempre gratuito</li>
                <li>• Sem taxas de cancelamento</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanManagement;
