
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Users, 
  ShoppingCart, 
  MessageSquare, 
  Settings,
  Home,
  Package,
  FileText,
  CreditCard,
  Crown,
  Play,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Help = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const tutorialSteps = [
    {
      title: "Bem-vindo ao SalesCanvas!",
      description: "Vamos te ensinar como usar todas as funcionalidades do seu sistema de vendas.",
      icon: Home,
      content: "O SalesCanvas é uma plataforma completa para gerenciar suas vendas e equipe. Navegue pelas próximas etapas para aprender como aproveitar ao máximo todas as funcionalidades."
    },
    {
      title: "Dashboard - Visão Geral",
      description: "Acompanhe seus resultados e métricas importantes",
      icon: BarChart3,
      content: "No Dashboard você encontra um resumo completo das suas vendas, metas, comissões e performance da equipe. É a sua central de comando para acompanhar o progresso do negócio."
    },
    {
      title: "Vendas - Gerencie suas Transações",
      description: "Visualize e acompanhe todas as vendas realizadas",
      icon: ShoppingCart,
      content: "Na seção de Vendas você pode ver todas as transações, filtrar por período, vendedor ou status. Acompanhe o desempenho individual e coletivo da equipe."
    },
    ...(user?.role !== "owner" ? [{
      title: "Nova Venda - Registre Transações",
      description: "Cadastre novas vendas de forma rápida e fácil",
      icon: BarChart3,
      content: "Use o formulário de Nova Venda para registrar suas transações. Preencha os dados do cliente, valor, produtos e outras informações importantes para manter o controle completo."
    }] : []),
    {
      title: "Histórico - Consulte Vendas Passadas",
      description: "Acesse o histórico completo de todas as vendas",
      icon: FileText,
      content: "No Histórico você pode consultar vendas anteriores, gerar relatórios e analisar tendências. Use os filtros para encontrar informações específicas rapidamente."
    },
    {
      title: "Equipe - Gerencie sua Equipe",
      description: "Administre vendedores e acompanhe performance",
      icon: Users,
      content: "Na seção Equipe você pode gerenciar vendedores, criar vendedores virtuais, acompanhar individual performance e definir metas. Mantenha sua equipe organizada e motivada."
    },
    {
      title: "Mensagens - Comunicação Interna",
      description: "Converse com sua equipe diretamente no sistema",
      icon: MessageSquare,
      content: "Use o sistema de mensagens para se comunicar com sua equipe, compartilhar informações importantes e manter todos alinhados com os objetivos."
    },
    ...(user?.role === "owner" ? [
      {
        title: "Inventário - Controle de Produtos",
        description: "Gerencie seu estoque e produtos",
        icon: Package,
        content: "No Inventário você controla seus produtos, estoque, preços e categorias. Mantenha sempre atualizado para melhor gestão das vendas."
      },
      {
        title: "Comissões - Configure Incentivos",
        description: "Defina regras de comissão para sua equipe",
        icon: CreditCard,
        content: "Configure as regras de comissão para motivar sua equipe. Defina percentuais, metas e incentivos para maximizar os resultados."
      },
      {
        title: "Planos - Gerencie Assinaturas",
        description: "Administre planos e assinaturas do sistema",
        icon: Crown,
        content: "Gerencie seus planos de assinatura, funcionalidades disponíveis e limites do sistema. Mantenha seu plano sempre adequado às suas necessidades."
      }
    ] : []),
    {
      title: "Configurações - Personalize sua Experiência",
      description: "Ajuste preferências e configurações do sistema",
      icon: Settings,
      content: "Nas Configurações você pode personalizar sua experiência, alterar dados pessoais, preferências de notificação e outras configurações importantes."
    }
  ];

  const startTutorial = () => {
    setCurrentStep(0);
    setIsDialogOpen(true);
  };

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsDialogOpen(false);
      setCurrentStep(0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = tutorialSteps[currentStep];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Central de Ajuda</h1>
          <p className="text-muted-foreground mt-2">
            Precisa de ajuda para usar o SalesCanvas? Estamos aqui para te ajudar!
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {user?.role === "owner" ? "Proprietário" : "Vendedor"}
        </Badge>
      </div>

      {/* Tutorial Interativo */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Tutorial Interativo
          </CardTitle>
          <CardDescription>
            Dúvidas na hora de utilizar? Aprenda como usar todas as funcionalidades do sistema com nosso tutorial passo a passo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={startTutorial} size="lg" className="w-full sm:w-auto">
            <Play className="h-4 w-4 mr-2" />
            Iniciar Tutorial
          </Button>
        </CardContent>
      </Card>

      {/* Guias Rápidos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShoppingCart className="h-5 w-5" />
              Como Registrar uma Venda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Aprenda o passo a passo para cadastrar uma nova venda no sistema.
            </p>
            <ul className="text-sm space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Acesse "Nova Venda"
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Preencha dados do cliente
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Adicione produtos e valor
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Confirme a venda
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5" />
              Acompanhando Resultados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Entenda como interpretar seus dados e métricas de vendas.
            </p>
            <ul className="text-sm space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Dashboard principal
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Filtros por período
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Relatórios detalhados
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Exportar dados
              </li>
            </ul>
          </CardContent>
        </Card>

        {user?.role === "owner" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                Gerenciando Equipe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Saiba como adicionar e gerenciar vendedores na sua equipe.
              </p>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Convidar vendedores
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Criar vendedores virtuais
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Definir comissões
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Acompanhar performance
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tutorial Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <currentStepData.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">{currentStepData.title}</DialogTitle>
                <DialogDescription className="text-base">
                  {currentStepData.description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="py-6">
            <p className="text-muted-foreground leading-relaxed">
              {currentStepData.content}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {currentStep + 1} de {tutorialSteps.length}
              </span>
              <div className="flex gap-1">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-2 rounded-full ${
                      index <= currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" onClick={prevStep}>
                  Anterior
                </Button>
              )}
              <Button onClick={nextStep}>
                {currentStep < tutorialSteps.length - 1 ? (
                  <>
                    Próximo
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  "Finalizar"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Help;
