
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowLeft, Check, X } from "lucide-react";
import { useStripeSubscription } from "@/hooks/useStripeSubscription";
import { usePlanManagement } from "@/hooks/usePlanManagement";
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

const CancelPlan = () => {
  const navigate = useNavigate();
  const { 
    subscription: stripeSubscription, 
    openCustomerPortal 
  } = useStripeSubscription();
  const { 
    upgradePlan, 
    upgrading,
    currentPlan 
  } = usePlanManagement();
  const [cancelling, setCancelling] = useState(false);

  const handleCancelToFree = async () => {
    setCancelling(true);
    try {
      const success = await upgradePlan("free");
      if (success) {
        navigate("/plan-management");
      }
    } catch (error) {
      console.error("Erro ao cancelar plano:", error);
    } finally {
      setCancelling(false);
    }
  };

  const handleManageViaStripe = async () => {
    await openCustomerPortal();
  };

  // Use Stripe subscription data if available, otherwise fallback to currentPlan
  const displayPlan = stripeSubscription?.subscribed ? {
    planName: stripeSubscription.plan,
    status: stripeSubscription.status,
    maxSellers: stripeSubscription.plan === 'popular' ? 10 : 
                stripeSubscription.plan === 'crescimento' ? 20 : 
                stripeSubscription.plan === 'profissional' ? -1 : 3,
    isAnnual: stripeSubscription.is_annual
  } : currentPlan ? {
    planName: currentPlan.planName,
    status: currentPlan.status,
    maxSellers: currentPlan.maxSellers,
    isAnnual: false
  } : null;

  const getPlanDisplayName = (planName: string): string => {
    switch (planName) {
      case 'popular':
        return 'Popular';
      case 'crescimento':
        return 'Crescimento';
      case 'profissional':
        return 'Profissional';
      default:
        return planName;
    }
  };

  const getPlanPrice = (planName: string, isAnnual: boolean = false): string => {
    if (isAnnual) {
      switch (planName) {
        case 'popular':
          return 'R$ 90/mês (anual)';
        case 'crescimento':
          return 'R$ 180/mês (anual)';
        case 'profissional':
          return 'R$ 540/mês (anual)';
        default:
          return 'N/A';
      }
    }
    
    switch (planName) {
      case 'popular':
        return 'R$ 100/mês';
      case 'crescimento':
        return 'R$ 200/mês';
      case 'profissional':
        return 'R$ 600/mês';
      default:
        return 'N/A';
    }
  };

  const getWhatYouLose = () => {
    if (!displayPlan) return [];
    
    const benefits = [];
    
    if (displayPlan.maxSellers > 3) {
      benefits.push(`Capacidade para ${displayPlan.maxSellers === -1 ? 'vendedores ilimitados' : `${displayPlan.maxSellers} vendedores`} (voltará para apenas 3)`);
    }
    
    benefits.push("Suporte prioritário");
    
    if (displayPlan.planName !== 'popular') {
      benefits.push("Recursos avançados do plano atual");
    }
    
    return benefits;
  };

  const getWhatYouKeep = () => {
    return [
      "Até 3 vendedores",
      "Vendas ilimitadas",
      "Relatórios completos",
      "Análise financeira completa",
      "Sistema de mensagens",
      "Suporte por email"
    ];
  };

  if (!displayPlan) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/plan-management")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/plan-management")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Planos
          </Button>
        </div>
      </div>

      {/* Current Plan Info */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Cancelar Assinatura
              </CardTitle>
              <CardDescription className="text-orange-700">
                Você está prestes a cancelar seu plano {getPlanDisplayName(displayPlan.planName)}
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-orange-300 text-orange-700">
              {getPlanDisplayName(displayPlan.planName)} - {getPlanPrice(displayPlan.planName, displayPlan.isAnnual)}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Options */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Option 1: Cancel to Free */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <X className="h-5 w-5" />
              Cancelar e Voltar ao Plano Gratuito
            </CardTitle>
            <CardDescription>
              Cancele imediatamente e volte ao plano gratuito. Esta ação é irreversível.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-red-700 mb-2">O que você vai perder:</h4>
              <ul className="space-y-1">
                {getWhatYouLose().map((item, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm text-red-600">
                    <X className="h-3 w-3 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-green-700 mb-2">O que você vai manter:</h4>
              <ul className="space-y-1">
                {getWhatYouKeep().map((item, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm text-green-600">
                    <Check className="h-3 w-3 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full" disabled={cancelling}>
                  {cancelling ? "Cancelando..." : "Cancelar e Voltar ao Gratuito"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar Cancelamento</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja cancelar seu plano {getPlanDisplayName(displayPlan.planName)} e voltar ao plano gratuito?
                    <br /><br />
                    <strong>Esta ação é irreversível e você perderá:</strong>
                    <br />
                    {getWhatYouLose().map((benefit, index) => (
                      <span key={index}>• {benefit}<br /></span>
                    ))}
                    <br />
                    Você pode reativar um plano pago a qualquer momento, mas precisará pagar novamente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Manter Plano Atual</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleCancelToFree}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Sim, Cancelar Definitivamente
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* Option 2: Manage via Stripe */}
        {stripeSubscription?.subscribed && (
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <AlertTriangle className="h-5 w-5" />
                Gerenciar via Stripe
              </CardTitle>
              <CardDescription>
                Gerencie sua assinatura através do portal do Stripe (recomendado)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">No portal do Stripe você pode:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Ver histórico de pagamentos</li>
                  <li>• Atualizar método de pagamento</li>
                  <li>• Baixar faturas</li>
                  <li>• Cancelar com período de carência</li>
                  <li>• Pausar temporariamente</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Recomendado:</strong> Use esta opção se você quer manter acesso até o final do período já pago ou se precisa de mais controle sobre o cancelamento.
                </p>
              </div>

              <Button 
                onClick={handleManageViaStripe}
                className="w-full"
                variant="outline"
              >
                Abrir Portal do Stripe
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Precisa de Ajuda?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Não tem certeza se deve cancelar?</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Entre em contato conosco antes de tomar uma decisão. Podemos ajudar a encontrar uma solução.
              </p>
              <Button variant="outline" size="sm">
                Falar com Suporte
              </Button>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Quer apenas pausar temporariamente?</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Use o portal do Stripe para pausar sua assinatura por um período determinado.
              </p>
              {stripeSubscription?.subscribed && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleManageViaStripe}
                >
                  Portal do Stripe
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CancelPlan;
