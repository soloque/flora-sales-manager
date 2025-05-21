
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BarChart, FileText, Plus, DollarSign, Users, Calendar, TrendingUp, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { Sale, Update } from "@/types";

// Mock data for demonstration
const mockSales: Sale[] = [
  {
    id: "1",
    date: new Date(),
    description: "Venda de plantas ornamentais",
    quantity: 3,
    unitPrice: 50,
    totalPrice: 150,
    sellerId: "2",
    sellerName: "Gabriel Silva",
    commission: 30,
    commissionRate: 20,
    status: "delivered",
    observations: "",
    customerInfo: {
      name: "Antônio Santos",
      phone: "21991372565",
      address: "Rua Capitulino, 96",
      city: "Rio de Janeiro",
      state: "RJ",
      zipCode: "20960-120",
      order: "3 Plantas de Jibóia"
    },
    costPrice: 90,
    profit: 60,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "2",
    date: new Date(),
    description: "Venda de plantas frutíferas",
    quantity: 4,
    unitPrice: 45,
    totalPrice: 180,
    sellerId: "2",
    sellerName: "Gabriel Silva",
    commission: 36,
    commissionRate: 20,
    status: "delivered",
    observations: "",
    customerInfo: {
      name: "Maria Oliveira",
      phone: "21987654321",
      address: "Av. Brasil, 500",
      city: "Rio de Janeiro",
      state: "RJ",
      zipCode: "21000-000",
      order: "1 Pé de Limão, 1 Mangueira, 2 Jabuticabeiras"
    },
    costPrice: 120,
    profit: 60,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const mockUpdates: Update[] = [
  {
    id: "1",
    title: "Novas plantas disponíveis",
    content: "Temos novos tipos de plantas frutíferas disponíveis para venda, incluindo pitanga e acerola.",
    createdAt: new Date(),
    authorId: "1",
    authorName: "Admin User",
    isHighlighted: true
  },
  {
    id: "2",
    title: "Atualização de comissões",
    content: "A partir do próximo mês, as comissões serão atualizadas para 22%.",
    createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
    authorId: "1",
    authorName: "Admin User",
    isHighlighted: false
  }
];

const Dashboard = () => {
  const { user } = useAuth();
  const isOwner = user?.role === "owner";
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);

  useEffect(() => {
    // In a real app, this would fetch data from an API
    setRecentSales(mockSales);
    setUpdates(mockUpdates);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calculate totals
  const totalSales = recentSales.length;
  const totalRevenue = recentSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
  const totalCommissions = recentSales.reduce((sum, sale) => sum + sale.commission, 0);
  
  // Only for owner
  const totalCosts = isOwner ? recentSales.reduce((sum, sale) => sum + (sale.costPrice || 0), 0) : 0;
  const totalProfit = isOwner ? recentSales.reduce((sum, sale) => sum + (sale.profit || 0), 0) : 0;

  return (
    <div className="space-y-6">
      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Vendas Totais</p>
              <h3 className="text-2xl font-bold mt-1">{totalSales}</h3>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <FileText className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
              <h3 className="text-2xl font-bold mt-1">{formatCurrency(totalRevenue)}</h3>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        {isOwner ? (
          <Card>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Custos Totais</p>
                <h3 className="text-2xl font-bold mt-1">{formatCurrency(totalCosts)}</h3>
              </div>
              <div className="bg-destructive/10 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-destructive" />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Comissões</p>
                <h3 className="text-2xl font-bold mt-1">{formatCurrency(totalCommissions)}</h3>
              </div>
              <div className="bg-green-500/10 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
        )}

        {isOwner ? (
          <Card>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lucro Líquido</p>
                <h3 className="text-2xl font-bold mt-1">{formatCurrency(totalProfit)}</h3>
              </div>
              <div className="bg-green-500/10 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Comissão</p>
                <h3 className="text-2xl font-bold mt-1">20%</h3>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <BarChart className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {!isOwner && (
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[150px]">
              <Plus className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Registrar Nova Venda</h3>
              <Button asChild>
                <Link to="/sales/new">Criar Venda</Link>
              </Button>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center min-h-[150px]">
            <FileText className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Gerenciar Vendas</h3>
            <Button asChild variant="outline">
              <Link to="/sales">Ver Todas</Link>
            </Button>
          </CardContent>
        </Card>
        
        {isOwner && (
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[150px]">
              <Users className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Gerenciar Vendedores</h3>
              <Button asChild variant="outline">
                <Link to="/sellers">Ver Todos</Link>
              </Button>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center min-h-[150px]">
            <Bell className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Atualizações</h3>
            <Button asChild variant="outline">
              <Link to="/updates">{isOwner ? "Gerenciar" : "Ver Todas"}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas Recentes</CardTitle>
            <CardDescription>
              As últimas vendas registradas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSales.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhuma venda registrada.
                </p>
              ) : (
                recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between border-b pb-4"
                  >
                    <div>
                      <p className="font-medium">{sale.customerInfo.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {sale.customerInfo.order}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(sale.date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(sale.totalPrice)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {sale.status === "paid"
                          ? "Pago"
                          : sale.status === "delivered"
                          ? "Entregue"
                          : sale.status === "cancelled"
                          ? "Cancelado"
                          : sale.status === "problem"
                          ? "Problema"
                          : "Pendente"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {recentSales.length > 0 && (
              <div className="mt-6 text-center">
                <Button asChild variant="outline" size="sm">
                  <Link to="/sales">Ver todas as vendas</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Updates */}
        <Card>
          <CardHeader>
            <CardTitle>Atualizações</CardTitle>
            <CardDescription>
              Comunicados e novidades para a equipe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {updates.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhuma atualização disponível.
                </p>
              ) : (
                updates.map((update) => (
                  <div
                    key={update.id}
                    className={`p-4 rounded-lg ${
                      update.isHighlighted
                        ? "border-2 border-primary bg-primary/5"
                        : "border"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold">{update.title}</h3>
                      <span className="text-xs text-muted-foreground">
                        {new Date(update.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <p className="mt-2 text-sm">{update.content}</p>
                  </div>
                ))
              )}
            </div>
            <div className="mt-6 text-center">
              <Button asChild variant="outline" size="sm">
                <Link to="/updates">Ver todas as atualizações</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
