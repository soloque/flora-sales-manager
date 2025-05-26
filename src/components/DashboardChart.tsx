
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
      <Card className="w-full max-w-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Vendas por Vendedor</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-muted-foreground text-sm">Nenhuma venda registrada este mês</p>
        </CardContent>
      </Card>
    );
  }

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
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Vendas por Vendedor</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={salesBySellerData} margin={{ top: 10, right: 15, left: 15, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
              fontSize={11}
              tick={{ fontSize: 11 }}
            />
            <YAxis 
              tickFormatter={(value) => 
                `R$ ${(value / 1000).toFixed(0)}k`
              }
              fontSize={11}
              tick={{ fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              fill="hsl(var(--primary))"
              name="Valor em Vendas"
              radius={[3, 3, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
