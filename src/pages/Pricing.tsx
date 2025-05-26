import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useStripeSubscription } from "@/hooks/useStripeSubscription";
import { Moon, Sun } from "lucide-react";

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { createCheckoutSession, creating } = useStripeSubscription();
  
  const plans = [
    {
      name: "Free",
      description: "Perfeito para começar e testar a plataforma",
      price: 0,
      annualPrice: 0,
      features: [
        "Até 3 vendedores",
        "Vendas ilimitadas",
        "Relatórios completos",
        "Análise financeira completa",
        "Sistema de mensagens",
        "Suporte por email",
        "Gratuito para sempre",
      ],
      highlighted: false,
      cta: "Começar grátis",
      sellerLimit: 3,
      planKey: "free"
    },
    {
      name: "Popular",
      description: "Ideal para pequenos negócios",
      price: 100,
      annualPrice: 1080, // 10% de desconto
      features: [
        "Até 10 vendedores",
        "Vendas ilimitadas",
        "Relatórios completos",
        "Análise financeira completa",
        "Sistema de mensagens",
        "Suporte prioritário",
        "7 dias grátis de teste",
      ],
      highlighted: true,
      cta: "7 dias grátis",
      sellerLimit: 10,
      planKey: "popular"
    },
    {
      name: "Crescimento",
      description: "Para equipes que estão expandindo",
      price: 200,
      annualPrice: 2160, // 10% de desconto
      features: [
        "Até 20 vendedores",
        "Vendas ilimitadas",
        "Relatórios completos",
        "Análise financeira completa",
        "Sistema de mensagens",
        "Suporte prioritário",
        "7 dias grátis de teste",
      ],
      highlighted: false,
      cta: "7 dias grátis",
      sellerLimit: 20,
      planKey: "crescimento"
    },
    {
      name: "Profissional",
      description: "Para grandes equipes de vendas",
      price: 600,
      annualPrice: 6480, // 10% de desconto
      features: [
        "Vendedores ilimitados",
        "Vendas ilimitadas",
        "Relatórios completos",
        "Análise financeira completa",
        "Sistema de mensagens",
        "Suporte prioritário",
        "7 dias grátis de teste",
      ],
      highlighted: false,
      cta: "7 dias grátis",
      sellerLimit: null,
      planKey: "profissional"
    },
  ];

  const handlePlanSelect = async (plan: any) => {
    if (plan.planKey === "free") {
      if (user) {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/login";
      }
      return;
    }

    if (!user) {
      window.location.href = "/login";
      return;
    }

    await createCheckoutSession(plan.planKey, isAnnual);
  };

  const formatPrice = (price: number, annualPrice: number) => {
    if (price === 0) return "Grátis";
    
    if (isAnnual) {
      const monthlyEquivalent = Math.floor(annualPrice / 12);
      return `R$ ${monthlyEquivalent}/mês`;
    }
    
    return `R$ ${price}/mês`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="absolute top-4 right-4 bg-background text-foreground"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Planos de Assinatura
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Escolha o plano ideal para o tamanho da sua equipe de vendas. 
            <strong> 7 dias grátis</strong> em todos os planos pagos!
          </p>
          
          <div className="mt-8 flex justify-center items-center space-x-4">
            <span className={`text-primary-foreground ${!isAnnual ? 'font-bold' : 'opacity-70'}`}>Mensal</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                isAnnual ? 'bg-green-400' : 'bg-gray-400'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-200 ease-in-out ${
                  isAnnual ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-primary-foreground ${isAnnual ? 'font-bold' : 'opacity-70'}`}>
              Anual <span className="text-xs bg-green-400 text-green-900 px-2 py-1 rounded-full ml-1">Economize 10%</span>
            </span>
          </div>
        </div>
      </header>

      {/* Pricing cards */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`overflow-hidden ${
                plan.highlighted
                  ? "border-primary shadow-lg shadow-primary/20"
                  : ""
              }`}
            >
              {plan.highlighted && (
                <div className="bg-primary py-1 text-center text-primary-foreground text-sm font-medium">
                  Mais Popular
                </div>
              )}
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription className="text-sm">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-2xl font-bold">
                    {formatPrice(plan.price, plan.annualPrice)}
                  </span>
                  {isAnnual && plan.price > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Faturado anualmente como R$ {plan.annualPrice},00
                    </div>
                  )}
                  {plan.price > 0 && (
                    <div className="text-xs text-green-600 mt-1 font-medium">
                      7 dias grátis • Sem cobrança no período de teste
                    </div>
                  )}
                </div>

                <ul className="space-y-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-4 w-4 text-primary mr-2 shrink-0" />
                      <span className="text-xs">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant={plan.highlighted ? "default" : "outline"}
                  className="w-full"
                  onClick={() => handlePlanSelect(plan)}
                  disabled={creating}
                >
                  {creating ? "Processando..." : plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Trial information */}
        <div className="max-w-4xl mx-auto mt-16 text-center">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-800">
                🎉 7 Dias Grátis em Todos os Planos Pagos
              </CardTitle>
            </CardHeader>
            <CardContent className="text-left">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-blue-800">Como funciona:</h3>
                  <div className="space-y-2 text-blue-700">
                    <p>✅ Escolha qualquer plano pago</p>
                    <p>✅ Use por 7 dias completamente grátis</p>
                    <p>✅ Cadastre seu cartão (não cobramos ainda!)</p>
                    <p>✅ Após 7 dias, cobramos conforme o plano escolhido</p>
                    <p>✅ Cancele a qualquer momento durante o teste</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-blue-800">Política transparente:</h3>
                  <div className="space-y-2 text-blue-700">
                    <p>• <strong>Sem pegadinhas:</strong> 7 dias realmente grátis</p>
                    <p>• <strong>Sem cobrança antecipada:</strong> Só cobramos após o período de teste</p>
                    <p>• <strong>Fácil cancelamento:</strong> Cancele durante o teste sem custo</p>
                    <p>• <strong>Suporte completo:</strong> Ajuda durante todo o período de teste</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing explanation */}
        <div className="max-w-4xl mx-auto mt-16 text-center">
          <h2 className="text-2xl font-bold mb-6">
            Planos Simples Baseados no Tamanho da Equipe
          </h2>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Todos os Recursos Inclusos</CardTitle>
              </CardHeader>
              <CardContent className="text-left">
                <div className="space-y-2">
                  <p>✅ Vendas ilimitadas</p>
                  <p>✅ Relatórios completos</p>
                  <p>✅ Análise financeira completa</p>
                  <p>✅ Sistema de mensagens</p>
                  <p>✅ Controle de comissões</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Apenas o Tamanho da Equipe Muda</CardTitle>
              </CardHeader>
              <CardContent className="text-left">
                <div className="space-y-2">
                  <p><strong>Free:</strong> Até 3 vendedores</p>
                  <p><strong>Popular:</strong> Até 10 vendedores</p>
                  <p><strong>Crescimento:</strong> Até 20 vendedores</p>
                  <p><strong>Profissional:</strong> Vendedores ilimitados</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Button asChild size="lg">
            <Link to="/login">
              Começar gratuitamente
            </Link>
          </Button>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-muted py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-8">
            Perguntas Frequentes
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Como funciona o período de teste de 7 dias?
              </h3>
              <p>
                Você escolhe qualquer plano pago, cadastra seu cartão de crédito, mas não cobramos nada 
                pelos primeiros 7 dias. Após esse período, iniciamos a cobrança conforme o plano escolhido 
                (mensal ou anual). Você pode cancelar a qualquer momento durante o teste.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                O plano Free é realmente gratuito para sempre?
              </h3>
              <p>
                Sim! O plano Free permite até 3 vendedores e é completamente gratuito, 
                sem limite de tempo ou necessidade de cartão de crédito.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Quanto economizo no plano anual?
              </h3>
              <p>
                O plano anual oferece 10% de desconto comparado ao pagamento mensal. 
                Você paga o equivalente a 10 meses no ano.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Posso mudar de plano quando quiser?
              </h3>
              <p>
                Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento 
                através das configurações da sua conta.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-background border-t py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            &copy; {new Date().getFullYear()} VendaFlow - Sistema de Gerenciamento de Vendas de Plantas
          </p>
          <div className="mt-4">
            <Link to="/login" className="text-primary hover:underline mx-2">
              Entrar
            </Link>
            <Link to="/login" className="text-primary hover:underline mx-2">
              Registrar
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
