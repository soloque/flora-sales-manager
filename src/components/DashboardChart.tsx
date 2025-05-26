
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Sale } from "@/types";
import { useState } from "react";

interface DashboardChartProps {
  sales: Sale[];
}

export function DashboardChart({ sales }: DashboardChartProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const SELLERS_PER_PAGE = 5;

  console.log('DashboardChart received sales:', sales);

  // Agrupar vendas por vendedor
  const salesBySellerData = sales.reduce((acc, sale) => {
    const sellerName = sale.sellerName || "Sem vendedor";
    const existing = acc.find(item => item.name === sellerName);
    
    if (existing) {
      existing.value += sale.totalPrice;
      existing.sales += 1;
    } else {
      acc.push({
        name: sellerName,
        value: sale.totalPrice,
        sales: 1
      });
    }
    
    return acc;
  }, [] as Array<{ name: string; value: number; sales: number }>);

  // Ordenar por valor (maior primeiro)
  salesBySellerData.sort((a, b) => b.value - a.value);

  // Calcular total para porcentagens
  const totalSales = salesBySellerData.reduce((acc, seller) => acc + seller.value, 0);

  // Paginar os dados (mostrar apenas 5 por vez)
  const totalPages = Math.ceil(salesBySellerData.length / SELLERS_PER_PAGE);
  const startIndex = currentPage * SELLERS_PER_PAGE;
  const endIndex = startIndex + SELLERS_PER_PAGE;
  const currentSellers = salesBySellerData.slice(startIndex, endIndex);

  // Adicionar porcentagens aos dados atuais
  const currentSellersWithPercentage = currentSellers.map(seller => ({
    ...seller,
    percentage: ((seller.value / totalSales) * 100).toFixed(1)
  }));

  console.log('Processed sales by seller data:', currentSellersWithPercentage);

  if (salesBySellerData.length === 0) {
    return (
      <Card className="w-full max-w-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Top 5 Vendedores</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-muted-foreground text-sm">Nenhuma venda registrada este mês</p>
        </CardContent>
      </Card>
    );
  }

  // Cores para os segmentos da pizza
  const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--secondary))',
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff7300',
    '#00ff00',
    '#ff0000'
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-2 shadow-lg text-xs">
          <p className="font-medium text-sm">{data.name}</p>
          <p className="text-primary">
            Vendas: R$ {data.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-muted-foreground">
            {data.sales} venda{data.sales !== 1 ? 's' : ''}
          </p>
          <p className="text-green-600 font-medium">
            {data.percentage}% do total
          </p>
        </div>
      );
    }
    return null;
  };

  const getRankRange = () => {
    const start = startIndex + 1;
    const end = Math.min(endIndex, salesBySellerData.length);
    return `${start}º - ${end}º`;
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Top 5 Vendedores</CardTitle>
            {totalPages > 1 && (
              <p className="text-sm text-muted-foreground mt-1">
                Posições {getRankRange()} de {salesBySellerData.length}
              </p>
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage === totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={currentSellersWithPercentage}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={false}
            >
              {currentSellersWithPercentage.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              formatter={(value, entry: any) => {
                const seller = currentSellersWithPercentage.find(s => s.name === value);
                return (
                  <span style={{ color: entry.color }}>
                    {value} ({seller?.percentage}%)
                  </span>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
