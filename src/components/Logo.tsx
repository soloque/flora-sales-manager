
import { TrendingUp, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

export function Logo() {
  return (
    <Link 
      to="/dashboard" 
      className="flex items-center space-x-3 text-primary hover:text-primary/80 transition-all duration-200 group"
    >
      <div className="relative">
        <div className="bg-gradient-to-br from-primary to-primary/80 p-2 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-200">
          <BarChart3 className="h-6 w-6 text-primary-foreground" />
          <TrendingUp className="h-3 w-3 absolute -top-1 -right-1 text-blue-400 bg-background rounded-full p-0.5" />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold leading-none bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          VendaFlow
        </span>
        <span className="text-xs text-muted-foreground leading-none font-medium">
          Gestão de Vendas
        </span>
      </div>
    </Link>
  );
}
