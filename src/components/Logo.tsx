
import { TrendingUp, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

export function Logo() {
  return (
    <Link 
      to="/dashboard" 
      className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors group"
    >
      <div className="relative">
        <BarChart3 className="h-8 w-8 text-primary" />
        <TrendingUp className="h-4 w-4 absolute -top-1 -right-1 text-success" />
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold leading-none">VendaFlow</span>
        <span className="text-xs text-muted-foreground leading-none">Gestão de Vendas</span>
      </div>
    </Link>
  );
}
