
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sale, OrderStatus } from "@/types";
import { Plus, Search, FileText, Edit, Trash } from "lucide-react";

// Mock sales data
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
    status: "pending",
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
  },
  {
    id: "3",
    date: new Date(),
    description: "Venda de plantas aquáticas",
    quantity: 2,
    unitPrice: 35,
    totalPrice: 70,
    sellerId: "2",
    sellerName: "Gabriel Silva",
    commission: 14,
    commissionRate: 20,
    status: "paid",
    observations: "",
    customerInfo: {
      name: "Carlos Mendes",
      phone: "21999998888",
      address: "Rua das Flores, 123",
      city: "Rio de Janeiro",
      state: "RJ",
      zipCode: "22000-000",
      order: "2 Vitória-régia"
    },
    costPrice: 40,
    profit: 30,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "4",
    date: new Date(),
    description: "Venda de plantas suculentas",
    quantity: 6,
    unitPrice: 20,
    totalPrice: 120,
    sellerId: "2",
    sellerName: "Gabriel Silva",
    commission: 24,
    commissionRate: 20,
    status: "cancelled",
    observations: "Cliente desistiu da compra",
    customerInfo: {
      name: "Ana Silva",
      phone: "21977776666",
      address: "Av. Atlântica, 1000",
      city: "Rio de Janeiro",
      state: "RJ",
      zipCode: "23000-000",
      order: "6 Suculentas variadas"
    },
    costPrice: 60,
    profit: 60,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "5",
    date: new Date(Date.now() - 86400000 * 2), // 2 days ago
    description: "Venda de árvores frutíferas",
    quantity: 3,
    unitPrice: 80,
    totalPrice: 240,
    sellerId: "2",
    sellerName: "Gabriel Silva",
    commission: 48,
    commissionRate: 20,
    status: "problem",
    observations: "Uma planta chegou danificada",
    customerInfo: {
      name: "Antonio",
      phone: "21991372565",
      address: "Rua capitulino 96 Rocha",
      city: "Rio de Janeiro",
      state: "RJ",
      zipCode: "20960-120",
      order: "Caju, Acerola e Jabuticaba",
      observations: "X Cancelado(NÃO ENTREGA MAIS EM ANGRA )"
    },
    costPrice: 150,
    profit: 90,
    createdAt: new Date(Date.now() - 86400000 * 2),
    updatedAt: new Date()
  }
];

const SalesList = () => {
  const { user } = useAuth();
  const isOwner = user?.role === "owner";
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">("all");
  
  useEffect(() => {
    // In a real app, this would fetch data from an API
    // For now, we'll use mock data
    if (isOwner) {
      setSales(mockSales);
    } else {
      // Filter sales for this specific seller
      setSales(mockSales.filter(sale => sale.sellerId === user?.id));
    }
  }, [isOwner, user?.id]);
  
  useEffect(() => {
    let result = sales;
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(
        sale =>
          sale.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.customerInfo.order.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (selectedStatus !== "all") {
      result = result.filter(sale => sale.status === selectedStatus);
    }
    
    setFilteredSales(result);
  }, [sales, searchTerm, selectedStatus]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pendente</Badge>;
      case "processing":
        return <Badge className="bg-blue-500">Em processamento</Badge>;
      case "paid":
        return <Badge className="bg-green-500">Pago</Badge>;
      case "delivered":
        return <Badge className="bg-green-500">Entregue</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelado</Badge>;
      case "problem":
        return <Badge className="bg-orange-500">Problema</Badge>;
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  const updateSaleStatus = (saleId: string, newStatus: OrderStatus) => {
    // In a real app, this would call an API to update the status
    const updatedSales = sales.map(sale => {
      if (sale.id === saleId) {
        return { ...sale, status: newStatus, updatedAt: new Date() };
      }
      return sale;
    });
    setSales(updatedSales);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar vendas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex-1">
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as OrderStatus | "all")}
            >
              <option value="all">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="processing">Em processamento</option>
              <option value="paid">Pago</option>
              <option value="delivered">Entregue</option>
              <option value="cancelled">Cancelado</option>
              <option value="problem">Problema</option>
            </select>
          </div>
          
          {!isOwner && (
            <Button asChild>
              <Link to="/sales/new">
                <Plus className="h-4 w-4 mr-2" />
                Nova Venda
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      {filteredSales.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Nenhuma venda encontrada</h3>
            <p className="text-muted-foreground text-center mb-6">
              {searchTerm || selectedStatus !== "all"
                ? "Tente ajustar seus filtros de busca"
                : "Registre sua primeira venda para começar"}
            </p>
            {!isOwner && (
              <Button asChild>
                <Link to="/sales/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Venda
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Cliente</th>
                <th>Pedido</th>
                {isOwner && <th>Vendedor</th>}
                <th>Valor</th>
                {!isOwner && <th>Comissão</th>}
                {isOwner && <th>Custo</th>}
                {isOwner && <th>Lucro</th>}
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale.id}>
                  <td>{new Date(sale.date).toLocaleDateString("pt-BR")}</td>
                  <td>
                    <div>
                      <p className="font-medium">{sale.customerInfo.name}</p>
                      <p className="text-sm text-muted-foreground">{sale.customerInfo.phone}</p>
                    </div>
                  </td>
                  <td>
                    <div className="max-w-xs overflow-hidden text-ellipsis">
                      {sale.customerInfo.order}
                    </div>
                  </td>
                  {isOwner && <td>{sale.sellerName}</td>}
                  <td>{formatCurrency(sale.totalPrice)}</td>
                  {!isOwner && <td>{formatCurrency(sale.commission)}</td>}
                  {isOwner && <td>{formatCurrency(sale.costPrice || 0)}</td>}
                  {isOwner && <td>{formatCurrency(sale.profit || 0)}</td>}
                  <td>{getStatusBadge(sale.status)}</td>
                  <td>
                    <div className="flex items-center space-x-2">
                      {/* View/Edit button */}
                      <Button variant="outline" size="icon" asChild>
                        <Link to={`/sales/${sale.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      
                      {/* Status dropdown for owner */}
                      {isOwner && (
                        <select
                          className="w-32 rounded-md border border-input bg-background px-3 py-1 text-sm"
                          value={sale.status}
                          onChange={(e) => updateSaleStatus(sale.id, e.target.value as OrderStatus)}
                        >
                          <option value="pending">Pendente</option>
                          <option value="processing">Processando</option>
                          <option value="paid">Pago</option>
                          <option value="delivered">Entregue</option>
                          <option value="problem">Problema</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SalesList;
