
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
        "Vendas ilimitadas",
        "Relatórios básicos",
        "Registro de vendas",
        "Sistema de mensagens",
        "Suporte por email",
        "Gratuito para sempre",
      ],
      highlighted: false,
      cta: "Começar grátis",
      sellerLimit: 3,
    },
    {
      name: "Popular",
      description: "Ideal para pequenos negócios",
      price: isAnnual ? 1080 : 100,
      features: [
        "Até 10 vendedores",
        "Vendas ilimitadas",
        "Controle de comissões",
        "Relatórios básicos",
        "Sistema de mensagens",
        "Suporte prioritário",
      ],
      highlighted: true,
      cta: "Plano mais escolhido",
      sellerLimit: 10,
    },
    {
      name: "Crescimento",
      description: "Para equipes que estão expandindo",
      price: isAnnual ? 2160 : 200,
      features: [
        "Até 20 vendedores",
        "Vendas ilimitadas",
        "Tudo do plano Popular",
        "Relatórios avançados",
        "Análise financeira",
        "Personalização de comissões",
      ],
      highlighted: false,
      cta: "Expandir equipe",
      sellerLimit: 20,
    },
    {
      name: "Profissional",
      description: "Para grandes equipes de vendas",
      price: isAnnual ? 6480 : 600,
      features: [
        "Vendedores ilimitados",
        "Vendas ilimitadas",
        "Tudo do plano Crescimento",
        "Relatórios completos",
        "Suporte prioritário",
        "Gestão avançada de equipe",
      ],
      highlighted: false,
      cta: "Ilimitado",
      sellerLimit: null,
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
                  {plan.price === 0 ? (
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
                  <Link to="/register">
                    {plan.cta}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Pricing explanation */}
        <div className="max-w-4xl mx-auto mt-16 text-center">
          <h2 className="text-2xl font-bold mb-6">
            Estrutura de Preços Simples e Clara
          </h2>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Planos Fixos</CardTitle>
              </CardHeader>
              <CardContent className="text-left">
                <div className="space-y-2">
                  <p><strong>Free:</strong> Até 3 vendedores - Grátis</p>
                  <p><strong>Popular:</strong> Até 10 vendedores - R$ 100/mês</p>
                  <p><strong>Crescimento:</strong> Até 20 vendedores - R$ 200/mês</p>
                  <p><strong>Profissional:</strong> Ilimitados - R$ 600/mês</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Opções Personalizadas</CardTitle>
              </CardHeader>
              <CardContent className="text-left">
                <div className="space-y-2">
                  <p><strong>Entre 10-20 vendedores:</strong></p>
                  <p>+R$ 100 a cada 10 vendedores extras</p>
                  <p><strong>Acima de 20 vendedores:</strong></p>
                  <p>Upgrade para Profissional (ilimitado)</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Button asChild size="lg">
            <Link to="/register">
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
                O plano Free é realmente gratuito para sempre?
              </h3>
              <p>
                Sim! O plano Free permite até 3 vendedores e é completamente gratuito, 
                sem limite de tempo ou necessidade de cartão de crédito.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                E se eu tiver entre 10 e 20 vendedores?
              </h3>
              <p>
                Você pode contratar vendedores extras no plano Popular por +R$ 100 a cada 
                10 vendedores adicionais, ou fazer upgrade direto para o Crescimento.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Quando vale a pena o plano Profissional?
              </h3>
              <p>
                A partir de R$ 600/mês você tem vendedores ilimitados. É ideal para 
                equipes grandes que precisam escalar sem se preocupar com limites.
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
