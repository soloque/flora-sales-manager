
import { Link } from "react-router-dom";

export function Logo() {
  return (
    <Link 
      to="/dashboard" 
      className="flex items-center space-x-3 text-primary hover:text-primary/80 transition-all duration-200 group"
    >
      <div className="relative">
        <div className="bg-gradient-to-br from-primary to-primary/80 p-2 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-200">
          {/* Custom triangle logo inspired by the uploaded image */}
          <div className="h-6 w-6 relative">
            <svg viewBox="0 0 100 100" className="h-full w-full text-primary-foreground">
              {/* Outer triangle */}
              <path 
                d="M50 10 L85 80 L15 80 Z" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="8"
              />
              {/* Middle triangle */}
              <path 
                d="M50 25 L72 70 L28 70 Z" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="6"
              />
              {/* Inner triangle - filled */}
              <path 
                d="M50 40 L60 60 L40 60 Z" 
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold leading-none bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Sales Canvas
        </span>
        <span className="text-xs text-muted-foreground leading-none font-medium">
          Gestão de Vendas
        </span>
      </div>
    </Link>
  );
}
