import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const { theme, toggleTheme } = useTheme();
  
  const plans = [
    {
      name: "Free",
      description: "Perfeito para começar e testar a plataforma",
      price: 0,
      features: [
        "Até 3 vendedores",
        "Até 50 clientes",
        "Relatórios básicos",
        "Registro de vendas",
        "Sistema de mensagens",
        "Marca d'água nos relatórios",
        "Suporte por email",
        "Gratuito para sempre",
      ],
      highlighted: false,
      cta: "Começar grátis",
      sellerLimit: 3,
    },
    {
      name: "Starter",
      description: "Ideal para pequenos negócios com até 10 vendedores",
      price: isAnnual ? 1620 : 150, // R$150/mo or R$135/mo annually (R$1620/year)
      features: [
        "Até 10 vendedores",
        "Clientes ilimitados",
        "Controle de comissões",
        "Relatórios básicos",
        "Verificação de CEP",
        "Modo escuro/claro",
        "Sistema de mensagens",
        "Suporte prioritário",
      ],
      highlighted: false,
      cta: "Começar teste gratuito",
      sellerLimit: 10,
    },
    {
      name: "Professional",
      description: "Para negócios em crescimento - vendedores ilimitados",
      price: isAnnual ? 4860 : 450, // R$450/mo or R$405/mo annually (R$4860/year)
      features: [
        "Vendedores ilimitados",
        "Clientes ilimitados",
        "Tudo do plano Starter",
        "Relatórios avançados",
        "Controle de estoque",
        "Análise financeira detalhada",
        "Personalização de comissões",
        "Comunicação com equipe",
      ],
      highlighted: true,
      cta: "Plano recomendado",
      sellerLimit: null, // Unlimited
    },
    {
      name: "Enterprise",
      description: "Solução completa para grandes operações",
      price: "custom" as const, // Custom pricing
      features: [
        "Tudo do plano Professional",
        "API personalizada",
        "Suporte 24/7",
        "Customizações específicas",
        "Integrações avançadas",
        "Treinamento incluso",
        "Backup diário",
        "SLA garantido",
      ],
      highlighted: false,
      cta: "Falar com vendas",
      sellerLimit: null, // Unlimited
    },
  ];

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
            Escolha o plano ideal para o seu negócio de vendas de plantas. 
            Comece gratuitamente com o plano Free!
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
                  {plan.price === "custom" ? (
                    <span className="text-2xl font-bold">Personalizado</span>
                  ) : plan.price === 0 ? (
                    <span className="text-2xl font-bold">Grátis</span>
                  ) : (
                    <>
                      <span className="text-2xl font-bold">
                        R$ {typeof plan.price === "number" ? (plan.price / (isAnnual ? 12 : 1)).toFixed(0) : "0"}
                      </span>
                      <span className="text-muted-foreground">
                        /{isAnnual ? "mês" : "mês"}
                      </span>
                      {isAnnual && typeof plan.price === "number" && plan.price > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Faturado anualmente como R$ {plan.price},00
                        </div>
                      )}
                    </>
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
                  asChild
                >
                  <Link to={plan.name === "Enterprise" ? "/contact" : "/register"}>
                    {plan.cta}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="max-w-3xl mx-auto mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Comece gratuitamente, atualize quando precisar
          </h2>
          <p className="text-muted-foreground mb-8">
            O plano Free é permanente e não requer cartão de crédito. 
            Faça upgrade para planos pagos quando seu negócio crescer.
          </p>
          <Button asChild size="lg">
            <Link to="/register">
              Começar gratuitamente
            </Link>
          </Button>
        </div>
      </div>

      {/* Pricing Model Explanation */}
      <div className="bg-muted py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-8">
            Como Funcionam os Planos
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Planos Free e Starter</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Ideais para começar e pequenos negócios.
                </p>
                <div className="space-y-2">
                  <p><strong>Free:</strong> Gratuito para sempre</p>
                  <p><strong>Vendedores inclusos:</strong> Free (3), Starter (10)</p>
                  <p><strong>Limitações:</strong> Free tem marca d'água e limite de clientes</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Professional e Enterprise</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Para negócios que precisam escalar sem limitações.
                </p>
                <div className="space-y-2">
                  <p><strong>Professional:</strong> R$ 450/mês</p>
                  <p><strong>Enterprise:</strong> Preço personalizado</p>
                  <p><strong>Vendedores:</strong> Ilimitados em ambos</p>
                  <p><strong>Diferenciais:</strong> API, suporte 24/7 no Enterprise</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-background py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-8">
            Perguntas Frequentes
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">
                O plano Free é realmente gratuito para sempre?
              </h3>
              <p>
                Sim! O plano Free não tem limite de tempo e você pode usá-lo indefinidamente. 
                Ele inclui as funcionalidades básicas com algumas limitações como marca d'água nos relatórios.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Posso mudar de plano depois?
              </h3>
              <p>
                Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento. 
                As mudanças serão aplicadas no próximo ciclo de cobrança.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Como funciona o suporte nos diferentes planos?
              </h3>
              <p>
                Free: Suporte por email. Starter/Professional: Suporte prioritário. 
                Enterprise: Suporte 24/7 com SLA garantido.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                O que é a marca d'água no plano Free?
              </h3>
              <p>
                É uma pequena identificação "Powered by VendaFlow" que aparece nos relatórios gerados. 
                Nos planos pagos, os relatórios são totalmente personalizados sem marca d'água.
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
            <Link to="/register" className="text-primary hover:underline mx-2">
              Registrar
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
