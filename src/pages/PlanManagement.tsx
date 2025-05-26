import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Users, Zap, AlertTriangle, Settings } from "lucide-react";
import { usePlanManagement } from "@/hooks/usePlanManagement";
import { useStripeSubscription } from "@/hooks/useStripeSubscription";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PlanManagement = () => {
  const { 
    currentPlan, 
    loading, 
    upgrading, 
    upgradePlan, 
    getPlanDisplayName, 
    getPlanPrice 
  } = usePlanManagement();
  
  const { 
    subscription: stripeSubscription, 
    openCustomerPortal, 
    createCheckoutSession 
  } = useStripeSubscription();

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
    if (!currentPlan) return planName !== "free";
    
    const currentPlanIndex = availablePlans.findIndex(p => p.name === currentPlan.planName);
    const targetPlanIndex = availablePlans.findIndex(p => p.name === planName);
    
    return targetPlanIndex > currentPlanIndex;
  };

  const canDowngrade = (planName: string): boolean => {
    if (!currentPlan) return false;
    
    const currentPlanIndex = availablePlans.findIndex(p => p.name === currentPlan.planName);
    const targetPlanIndex = availablePlans.findIndex(p => p.name === planName);
    
    return targetPlanIndex < currentPlanIndex;
  };

  const isCurrentPlan = (planName: string): boolean => {
    return currentPlan?.planName === planName;
  };

  const handleUpgrade = async (planName: string) => {
    if (planName === "free") {
      await upgradePlan(planName);
    } else {
      await createCheckoutSession(planName, false);
    }
  };

  const handleDowngrade = async (planName: string) => {
    await upgradePlan(planName);
  };

  const handleManageSubscription = async () => {
    try {
      await openCustomerPortal();
    } catch (error) {
      console.error('Error opening customer portal:', error);
    }
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

  // Use Stripe subscription data if available, otherwise fallback to currentPlan
  const displayPlan = stripeSubscription?.subscribed ? {
    planName: stripeSubscription.plan,
    status: stripeSubscription.status,
    maxSellers: stripeSubscription.plan === 'popular' ? 10 : 
                stripeSubscription.plan === 'crescimento' ? 20 : 
                stripeSubscription.plan === 'profissional' ? -1 : 3
  } : currentPlan;

  const getCurrentPlanBenefits = () => {
    if (!displayPlan) return [];
    
    const plan = availablePlans.find(p => p.name === displayPlan.planName);
    return plan ? plan.features : [];
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      {displayPlan && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Plano Atual
                  <Badge variant="secondary">
                    {getPlanDisplayName(displayPlan.planName)}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {(() => {
                    switch (displayPlan.planName) {
                      case 'free':
                        return 'Grátis';
                      case 'popular':
                        return 'R$ 100/mês';
                      case 'crescimento':
                        return 'R$ 200/mês';
                      case 'profissional':
                        return 'R$ 600/mês';
                      default:
                        return getPlanPrice(displayPlan.planName);
                    }
                  })()} • {' '}
                  {displayPlan.maxSellers === -1 
                    ? 'Vendedores ilimitados' 
                    : `Até ${displayPlan.maxSellers} vendedores`
                  }
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge 
                  variant={displayPlan.status === 'active' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {displayPlan.status === 'active' ? 'Ativo' : displayPlan.status}
                </Badge>
                {stripeSubscription?.subscribed && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Gerenciar Assinatura
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Gerenciar Assinatura</AlertDialogTitle>
                        <AlertDialogDescription>
                          Você será redirecionado para o portal do Stripe onde poderá:
                          <br /><br />
                          • Ver histórico de pagamentos<br />
                          • Atualizar método de pagamento<br />
                          • Baixar faturas<br />
                          • Cancelar sua assinatura
                          <br /><br />
                          <strong>Atenção:</strong> Se cancelar, você perderá acesso aos seguintes benefícios:
                          <br />
                          {getCurrentPlanBenefits().map((benefit, index) => (
                            <span key={index}>• {benefit}<br /></span>
                          ))}
                          <br />
                          Tem certeza que deseja prosseguir?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleManageSubscription}>
                          Prosseguir para o Portal
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
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
            const canDowngradeThis = canDowngrade(plan.name);
            
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
                  
                  <div className="space-y-2">
                    {isCurrent ? (
                      <Button variant="secondary" className="w-full" disabled>
                        Plano Atual
                      </Button>
                    ) : canUpgradeThis ? (
                      <Button
                        variant="default"
                        className="w-full"
                        disabled={upgrading}
                        onClick={() => handleUpgrade(plan.name)}
                      >
                        {upgrading ? "Processando..." : `Fazer Upgrade`}
                      </Button>
                    ) : canDowngradeThis ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="w-full">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Fazer Downgrade
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Downgrade</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja fazer downgrade para o plano {plan.displayName}? 
                              Você perderá acesso a algumas funcionalidades e sua capacidade de vendedores será reduzida.
                              {plan.name === "free" && " Esta ação cancelará sua assinatura atual."}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDowngrade(plan.name)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Confirmar Downgrade
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        Não Disponível
                      </Button>
                    )}
                  </div>
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
                <li>• Downgrades são aplicados imediatamente</li>
                <li>• O plano Free é sempre gratuito</li>
                <li>• Use "Gerenciar Assinatura" para cancelar planos pagos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanManagement;
