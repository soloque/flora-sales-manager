import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Users, Shield, Zap, CheckCircle } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";

const Landing = () => {
  const { theme, toggleTheme } = useTheme();

  const features = [
    {
      icon: BarChart3,
      title: "Gestão Completa",
      description: "Controle total sobre suas vendas, comissões e relatórios em tempo real"
    },
    {
      icon: Users,
      title: "Equipe Conectada",
      description: "Gerencie sua equipe de vendas e acompanhe o desempenho individual"
    },
    {
      icon: TrendingUp,
      title: "Análises Avançadas",
      description: "Gráficos e métricas detalhadas para otimizar seus resultados"
    },
    {
      icon: Shield,
      title: "Dados Seguros",
      description: "Seus dados protegidos com a mais alta segurança"
    },
    {
      icon: Zap,
      title: "Interface Moderna",
      description: "Design intuitivo e responsivo para todas as plataformas"
    }
  ];

  const plans = [
    {
      name: "Starter",
      price: "R$ 200",
      period: "/mês",
      description: "Ideal para pequenos negócios",
      features: [
        "Até 10 vendedores",
        "Controle de comissões", 
        "Relatórios básicos",
        "Registro de vendas",
        "Verificação de CEP",
        "7 dias gratuitos"
      ],
      highlighted: false
    },
    {
      name: "Business",
      price: "R$ 600",
      period: "/mês",
      description: "Para negócios em crescimento",
      features: [
        "Vendedores ilimitados",
        "Tudo do plano Starter",
        "Relatórios avançados", 
        "Controle de estoque",
        "Análise financeira detalhada",
        "+R$100 a cada 10 vendedores extras"
      ],
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "R$ 1.200",
      period: "/mês",
      description: "Para grandes operações",
      features: [
        "Vendedores ilimitados",
        "Tudo do plano Business",
        "API personalizada",
        "Suporte prioritário", 
        "Customizações específicas",
        "Sem cobrança por vendedores extras"
      ],
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Theme Toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 h-12 w-12 rounded-xl border-border/50 bg-background/80 backdrop-blur-md"
      >
        {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </Button>

      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5"></div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="text-center space-y-8">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="bg-gradient-to-br from-primary to-primary/80 p-3 rounded-2xl shadow-2xl">
                    <BarChart3 className="h-8 w-8 text-primary-foreground" />
                    <TrendingUp className="h-4 w-4 absolute -top-1 -right-1 text-blue-400 bg-background rounded-full p-0.5" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-4xl font-bold leading-none bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    VendaFlow
                  </span>
                  <span className="text-sm text-muted-foreground leading-none font-medium">
                    Gestão de Vendas
                  </span>
                </div>
              </div>
            </div>

            {/* Hero Content */}
            <div className="space-y-6 max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                Transforme Suas
                <span className="bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent block">
                  Vendas em Resultados
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                A plataforma completa para gerenciar vendas, comissões e equipes de forma inteligente e eficiente
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
                <Button asChild size="lg" className="h-14 px-8 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300">
                  <Link to="/register">
                    Começar Gratuitamente
                  </Link>
                </Button>
                <Button variant="outline" asChild size="lg" className="h-14 px-8 text-lg font-semibold rounded-xl border-2">
                  <Link to="/login">
                    Fazer Login
                  </Link>
                </Button>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Sem cartão de crédito • Configuração em 2 minutos</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-24 bg-muted/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Tudo que Você Precisa
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Funcionalidades poderosas para otimizar suas vendas e crescer seu negócio
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className="space-y-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                        <Icon className="h-7 w-7 text-primary-foreground" />
                      </div>
                      <h3 className="text-xl font-bold">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Planos para Todos os Tamanhos
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Escolha o plano ideal para sua empresa e comece a vender mais hoje mesmo
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative border-2 transition-all duration-300 hover:shadow-xl ${
                plan.highlighted 
                  ? 'border-primary shadow-2xl scale-105 bg-gradient-to-b from-primary/5 to-background' 
                  : 'border-border hover:border-primary/50'
              }`}>
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1">
                    Mais Popular
                  </Badge>
                )}
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <h3 className="text-2xl font-bold">{plan.name}</h3>
                      <p className="text-muted-foreground">{plan.description}</p>
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground ml-1">{plan.period}</span>
                      </div>
                    </div>
                    
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      asChild 
                      className={`w-full h-12 rounded-xl font-semibold ${
                        plan.highlighted 
                          ? 'bg-primary hover:bg-primary/90 shadow-lg' 
                          : 'variant-outline'
                      }`}
                      variant={plan.highlighted ? "default" : "outline"}
                    >
                      <Link to="/register">
                        Começar Teste Gratuito
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Pronto para Revolucionar suas Vendas?
          </h2>
          <p className="text-xl text-muted-foreground">
            Junte-se a milhares de empresas que já transformaram seus resultados com o VendaFlow
          </p>
          <Button asChild size="lg" className="h-16 px-12 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300">
            <Link to="/register">
              Criar Conta Gratuita
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-br from-primary to-primary/80 p-2 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  VendaFlow
                </span>
              </div>
            </div>
            <p className="text-muted-foreground">
              © 2024 VendaFlow. Transformando vendas em resultados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
