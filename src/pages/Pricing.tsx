
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
      name: "Starter",
      description: "Ideal para pequenos negócios com até 10 vendedores",
      price: isAnnual ? 2160 : 200, // R$200/mo or R$180/mo annually (R$2160/year)
      features: [
        "Até 10 vendedores",
        "Controle de comissões",
        "Relatórios básicos",
        "Registro de vendas",
        "Verificação de CEP",
        "Modo escuro/claro",
      ],
      highlighted: false,
      cta: "Começar agora",
      sellerLimit: 10,
    },
    {
      name: "Business",
      description: "Para negócios em crescimento com até 50 vendedores",
      price: isAnnual ? 6480 : 600, // R$600/mo or R$540/mo annually (R$6480/year)
      features: [
        "Até 50 vendedores",
        "Tudo do plano Starter",
        "Relatórios avançados",
        "Controle de estoque",
        "Análise financeira detalhada",
        "Personalização de comissões",
        "Comunicação com equipe",
      ],
      highlighted: true,
      cta: "Plano recomendado",
      sellerLimit: 50,
    },
    {
      name: "Enterprise",
      description: "Solução completa para grandes operações",
      price: isAnnual ? 12600 : 1200, // R$1200/mo or R$1050/mo annually (R$12600/year)
      features: [
        "Vendedores ilimitados",
        "Tudo do plano Business",
        "API personalizada",
        "Suporte prioritário",
        "Customizações específicas",
        "Integrações avançadas",
        "Backup diário",
      ],
      highlighted: false,
      cta: "Entre em contato",
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
            Comece com 7 dias de teste gratuito!
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
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <span className="text-4xl font-bold">
                    R$ {(plan.price / (isAnnual ? 12 : 1)).toFixed(0)}
                  </span>
                  <span className="text-muted-foreground">
                    /{isAnnual ? "mês" : "mês"}
                  </span>
                  {isAnnual && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Faturado anualmente como R$ {plan.price},00
                    </div>
                  )}
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-2 shrink-0" />
                      <span>{feature}</span>
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

        <div className="max-w-3xl mx-auto mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Teste grátis por 7 dias, sem compromisso
          </h2>
          <p className="text-muted-foreground mb-8">
            Experimente qualquer plano por 7 dias gratuitamente. Cancele a qualquer momento sem cobranças.
            Não é necessário cartão de crédito para o período de teste.
          </p>
          <Button asChild size="lg">
            <Link to="/register">
              Começar teste gratuito
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
                Como funciona o período de teste?
              </h3>
              <p>
                Você tem acesso a todas as funcionalidades do plano escolhido por 7 dias. 
                Após esse período, será necessário fornecer os dados de pagamento para continuar utilizando o sistema.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Como é calculada a cobrança pelos vendedores?
              </h3>
              <p>
                O preço base do plano inclui um número específico de vendedores. 
                Para cada 10 vendedores adicionais além do limite, há um acréscimo de R$100 mensais.
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
                Como funciona o pagamento?
              </h3>
              <p>
                Utilizamos o Stripe como nossa plataforma de pagamento, garantindo total segurança 
                nas transações. Aceitamos cartões de crédito e boleto bancário.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-background border-t py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            &copy; {new Date().getFullYear()} Plant Sales - Sistema de Gerenciamento de Vendas de Plantas
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
