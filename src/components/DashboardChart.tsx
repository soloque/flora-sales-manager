
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Sale } from "@/types";

interface DashboardChartProps {
  sales: Sale[];
}

export function DashboardChart({ sales }: DashboardChartProps) {
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

  console.log('Processed sales by seller data:', salesBySellerData);

  if (salesBySellerData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vendas por Vendedor</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Nenhuma venda registrada este mês</p>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-md">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">
            Vendas: R$ {data.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-muted-foreground">
            {data.sales} venda{data.sales !== 1 ? 's' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendas por Vendedor</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesBySellerData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis 
              tickFormatter={(value) => 
                `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="value" 
              fill="#8884d8" 
              name="Valor em Vendas"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
