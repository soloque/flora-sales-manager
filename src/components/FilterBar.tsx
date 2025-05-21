
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Search, Filter } from "lucide-react";
import { OrderStatus, SalesHistoryFilters } from "@/types";

interface FilterBarProps {
  filters: SalesHistoryFilters;
  onFilterChange: (filters: SalesHistoryFilters) => void;
  onSearchChange: (search: string) => void;
  sellerFilter?: boolean;
  searchValue: string;
}

export function FilterBar({
  filters,
  onFilterChange,
  onSearchChange,
  sellerFilter = false,
  searchValue
}: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className={isOpen ? "bg-muted" : ""}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      
      {isOpen && (
        <div className="border rounded-md p-4 space-y-4 bg-card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Período</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={filters.period}
                onChange={(e) => onFilterChange({ 
                  ...filters, 
                  period: e.target.value as SalesHistoryFilters["period"]
                })}
              >
                <option value="7days">Últimos 7 dias</option>
                <option value="30days">Últimos 30 dias</option>
                <option value="90days">Últimos 90 dias</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-1">Status</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={filters.status}
                onChange={(e) => onFilterChange({ 
                  ...filters, 
                  status: e.target.value as OrderStatus | "all"
                })}
              >
                <option value="all">Todos</option>
                <option value="pending">Pendente</option>
                <option value="processing">Em processamento</option>
                <option value="paid">Pago</option>
                <option value="delivered">Entregue</option>
                <option value="cancelled">Cancelado</option>
                <option value="problem">Problema</option>
              </select>
            </div>
            
            {sellerFilter && (
              <div>
                <label className="text-sm font-medium block mb-1">Vendedor</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={filters.sellerId}
                  onChange={(e) => onFilterChange({ 
                    ...filters, 
                    sellerId: e.target.value
                  })}
                >
                  <option value="all">Todos</option>
                  <option value="1">Gabriel Silva</option>
                  <option value="2">Marina Oliveira</option>
                  <option value="3">Ricardo Almeida</option>
                </select>
              </div>
            )}
          </div>
          
          {filters.period === "custom" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">De</label>
                <Input 
                  type="date" 
                  value={filters.startDate ? format(filters.startDate, "yyyy-MM-dd") : ""}
                  onChange={(e) => {
                    if (e.target.value) {
                      onFilterChange({
                        ...filters,
                        startDate: new Date(e.target.value)
                      });
                    }
                  }}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Até</label>
                <Input 
                  type="date"
                  value={filters.endDate ? format(filters.endDate, "yyyy-MM-dd") : ""}
                  onChange={(e) => {
                    if (e.target.value) {
                      onFilterChange({
                        ...filters,
                        endDate: new Date(e.target.value)
                      });
                    }
                  }}
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                onFilterChange({
                  period: "90days",
                  status: "all",
                  sellerId: "all"
                });
                onSearchChange("");
              }}
            >
              Limpar Filtros
            </Button>
            <Button onClick={() => setIsOpen(false)}>Aplicar Filtros</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function format(date: Date, formatString: string): string {
  return new Intl.DateTimeFormat("fr-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date).replace(/\//g, "-");
}
