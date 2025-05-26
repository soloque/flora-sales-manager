
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
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
      <Card className="w-full max-w-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Vendas por Vendedor</CardTitle>
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
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Vendas por Vendedor</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={salesBySellerData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={false}
            >
              {salesBySellerData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              formatter={(value, entry: any) => (
                <span style={{ color: entry.color }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
