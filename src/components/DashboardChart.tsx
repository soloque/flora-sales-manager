
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Sale } from "@/types";

interface DashboardChartProps {
  sales: Sale[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export function DashboardChart({ sales }: DashboardChartProps) {
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
          <PieChart>
            <Pie
              data={salesBySellerData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {salesBySellerData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
