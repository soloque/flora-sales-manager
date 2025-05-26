
import { Link } from "react-router-dom";

export function Logo() {
  return (
    <Link 
      to="/dashboard" 
      className="flex items-center space-x-3 text-primary hover:text-primary/80 transition-all duration-200 group"
    >
      <div className="relative">
        <div className="bg-gradient-to-br from-primary to-primary/80 p-2 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-200">
          {/* Triângulo simples sem bordas */}
          <div className="h-6 w-6 relative">
            <svg viewBox="0 0 100 100" className="h-full w-full text-primary-foreground">
              {/* Triângulo preenchido - simples e clean */}
              <path 
                d="M50 15 L80 75 L20 75 Z" 
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold leading-none bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          SalesCanvas
        </span>
        <span className="text-xs text-muted-foreground leading-none font-medium">
          Gestão de Vendas
        </span>
      </div>
    </Link>
  );
}
